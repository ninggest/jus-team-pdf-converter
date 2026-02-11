import { useState, useCallback, useRef, useEffect } from "react";
import { Play, Download, Archive, AlertCircle, History } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ApiKeyInput } from "./components/ApiKeyInput";
import { BatchFileUpload } from "./components/BatchFileUpload";
import { FileQueueList } from "./components/FileQueueList";
import { MarkdownPreviewModal } from "./components/MarkdownPreviewModal";
import { ProcessingModeSelector, type ProcessingMode } from "./components/ProcessingModeSelector";
import { BatchJobStatus } from "./components/BatchJobStatus";
import { AccessCodeDisplay } from "./components/AccessCodeDisplay";
import { MergeQueuePanel } from "./components/MergeQueuePanel";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { Switch } from "./components/ui/switch";
import {
  generateFileId,
  processFilesSequentially,
  type FileItem
} from "./lib/batchProcessor";
import { createBatchJob, listBatchJobs, type BatchJob, type BatchResult } from "./lib/batchApi";
import { splitLargePdf } from "./lib/pdfUtils";
import { getJobHistory, saveJobToHistory } from "./lib/historyManager";
import type { MergeItem } from "./types";

// Backend Worker URL
const WORKER_URL = import.meta.env.VITE_WORKER_URL || "http://localhost:8787";

function App() {
  const [apiKey, setApiKey] = useState("");
  const [fileQueue, setFileQueue] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [previewData, setPreviewData] = useState<{ fileName: string; markdown: string } | null>(null);
  const stopProcessingRef = useRef(false);

  // New state for dual-mode support
  const [processingMode, setProcessingMode] = useState<ProcessingMode>("standard");
  const [refinementEnabled, setRefinementEnabled] = useState(false); // Default to disabled to avoid unexpected detail loss
  const [activeBatchJobs, setActiveBatchJobs] = useState<BatchJob[]>([]);
  const [showBatchHistory, setShowBatchHistory] = useState(false);
  const [accessCode, setAccessCode] = useState(() => {
    return localStorage.getItem("batch_access_code") || Math.random().toString(36).substring(2, 8).toUpperCase();
  });

  // Batch Sort & Merge Download State
  const [mergeQueue, setMergeQueue] = useState<MergeItem[]>([]);

  // Save access code to localStorage
  useEffect(() => {
    localStorage.setItem("batch_access_code", accessCode);
  }, [accessCode]);


  // ... existing imports

  // Load batch jobs from backend when active or active code changes
  useEffect(() => {
    const loadBatchJobs = async () => {
      // 1. Load local history first
      const localHistory = getJobHistory(accessCode);

      try {
        // 2. Fetch active jobs from backend
        const response = await listBatchJobs(WORKER_URL, accessCode);

        if (response.jobs && response.jobs.length > 0) {
          // Merge: Backend jobs take precedence for status updates
          const mergedJobs = [...response.jobs];

          // Add local history items that aren't in the backend response
          // (Backend might expire jobs after 24h, but local history keeps them)
          localHistory.forEach(localJob => {
            if (!mergedJobs.find(j => j.job_id === localJob.job_id)) {
              mergedJobs.push(localJob);
            }
          });

          // Sort by creation time desc
          mergedJobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

          setActiveBatchJobs(mergedJobs);
        } else {
          // If no active jobs on backend, just show local history
          setActiveBatchJobs(localHistory);
        }
      } catch (error) {
        console.log("Failed to fetch fresh batch jobs, showing local history");
        setActiveBatchJobs(localHistory);
      }
    };

    if (processingMode === "batch") {
      loadBatchJobs();
    }
  }, [accessCode, processingMode]);

  // Also persist mode preference to localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("ocr_processing_mode");
    if (savedMode === "batch" || savedMode === "standard") {
      setProcessingMode(savedMode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ocr_processing_mode", processingMode);
  }, [processingMode]);

  const handleApiKeyChange = useCallback((key: string) => {
    setApiKey(key);
  }, []);

  const handleFilesSelect = useCallback(async (files: File[]) => {
    const processedFiles: File[] = [];

    for (const file of files) {
      if (file.name.toLowerCase().endsWith(".pdf") && file.size > 20 * 1024 * 1024) {
        try {
          const parts = await splitLargePdf(file, 20);
          processedFiles.push(...parts);
        } catch (error) {
          console.error(`Failed to split ${file.name}:`, error);
          processedFiles.push(file); // Fallback
        }
      } else {
        processedFiles.push(file);
      }
    }

    const newItems: FileItem[] = processedFiles.map((file) => ({
      id: generateFileId(),
      file,
      status: "queued",
    }));
    setFileQueue((prev) => [...prev, ...newItems]);
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setFileQueue((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleUpdateFile = useCallback(
    (id: string, update: Partial<FileItem>) => {
      setFileQueue((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...update } : f))
      );
    },
    []
  );

  const handleConvertAll = async () => {
    if (!apiKey || fileQueue.length === 0) return;

    setIsProcessing(true);
    stopProcessingRef.current = false;

    if (processingMode === "standard") {
      // Standard mode: process files sequentially
      await processFilesSequentially(
        fileQueue,
        apiKey,
        WORKER_URL,
        handleUpdateFile,
        () => stopProcessingRef.current,
        refinementEnabled
      );
    } else {
      // Batch mode: create a batch job
      try {
        const queuedFiles = fileQueue.filter((f) => f.status === "queued");
        if (queuedFiles.length === 0) {
          setIsProcessing(false);
          return;
        }

        // Mark files as processing
        queuedFiles.forEach((f) => {
          handleUpdateFile(f.id, { status: "processing" });
        });

        const job = await createBatchJob(
          queuedFiles.map((f) => f.file),
          apiKey,
          WORKER_URL,
          accessCode,
          undefined, // no progress callback for now
          refinementEnabled
        );

        // Save to local history
        saveJobToHistory(accessCode, job);

        setActiveBatchJobs((prev) => [job, ...prev]);

        // Clear the queue since files are now in batch
        setFileQueue((prev) => prev.filter((f) => f.status !== "processing"));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to create batch job";
        fileQueue
          .filter((f) => f.status === "processing")
          .forEach((f) => {
            handleUpdateFile(f.id, { status: "failed", error: errorMessage });
          });
      }
    }

    setIsProcessing(false);
  };

  const handleStopProcessing = () => {
    stopProcessingRef.current = true;
  };

  const handleBatchComplete = useCallback((results: BatchResult[]) => {
    // Optionally add completed results to file queue for download
    console.log("Batch completed with results:", results);
  }, []);

  const handleBatchPreview = useCallback((fileName: string, markdown: string) => {
    setPreviewData({ fileName, markdown });
  }, []);

  const handleToggleMergeItem = useCallback((item: MergeItem) => {
    setMergeQueue(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  }, []);

  const handleReorderMergeQueue = useCallback((newQueue: MergeItem[]) => {
    setMergeQueue(newQueue);
  }, []);

  const handleClearMergeQueue = useCallback(() => {
    setMergeQueue([]);
  }, []);

  const handleDownloadAllAsZip = async () => {
    const completedFiles = fileQueue.filter(
      (f) => f.status === "completed" && f.markdown
    );

    if (completedFiles.length === 0) return;

    const zip = new JSZip();
    completedFiles.forEach((file) => {
      const mdName = file.file.name.replace(/\.pdf$/i, ".md");
      zip.file(mdName, file.markdown!);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "legal_docs_converted.zip");
  };

  const handleClearAll = () => {
    setFileQueue([]);
  };

  // Statistics
  const queuedCount = fileQueue.filter((f) => f.status === "queued").length;
  const processingCount = fileQueue.filter(
    (f) => f.status === "processing"
  ).length;
  const completedCount = fileQueue.filter(
    (f) => f.status === "completed"
  ).length;
  const failedCount = fileQueue.filter((f) => f.status === "failed").length;

  const hasQueuedFiles = queuedCount > 0;
  const hasCompletedFiles = completedCount > 0;
  const canConvert = hasQueuedFiles && apiKey.length > 0 && !isProcessing;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        {/* API Key Input */}
        <ApiKeyInput onKeyChange={handleApiKeyChange} />

        <ProcessingModeSelector
          mode={processingMode}
          onModeChange={setProcessingMode}
          disabled={isProcessing}
        />

        {/* Dual Engine Toggle */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 mb-6 shadow-sm">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
              ✨ 双引擎智能润色 (Dual Engine Polish)
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">试验性功能</span>
            </span>
            <span className="text-xs text-gray-500 mt-1">
              使用大模型 (Ministral-14b) 修复OCR格式错误，并根据上下文自动生成图片描述。
              <span className="block mt-1 text-amber-600 font-medium italic">⚠️ 风险提示：处理篇幅较长的原文时可能出现内容归纳或细节丢失，建议谨慎使用。</span>
            </span>
          </div>
          <Switch
            checked={refinementEnabled}
            onCheckedChange={setRefinementEnabled}
            disabled={isProcessing}
          />
        </div>

        {/* Access Code Display (Only in Batch Mode) */}
        {processingMode === "batch" && (
          <AccessCodeDisplay
            code={accessCode}
            onCodeChange={setAccessCode}
          />
        )}

        {/* File Upload */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <BatchFileUpload
              onFilesSelect={handleFilesSelect}
              isProcessing={isProcessing}
              disabled={!apiKey}
            />

            {!apiKey && (
              <p className="text-center text-sm text-amber-600 mt-3">
                请先在上方输入您的 Mistral API Key 以转换文档
              </p>
            )}
          </CardContent>
        </Card>

        {/* Active Batch Jobs */}
        {activeBatchJobs.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-700 flex items-center gap-2">
                <History className="h-4 w-4" />
                异步任务
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBatchHistory(!showBatchHistory)}
              >
                {showBatchHistory ? "隐藏" : "显示全部"}
              </Button>
            </div>
            {(showBatchHistory ? activeBatchJobs : activeBatchJobs.slice(0, 2)).map((job) => (
              <BatchJobStatus
                key={job.job_id}
                job={job}
                apiKey={apiKey}
                workerUrl={WORKER_URL}
                accessCode={accessCode}
                onComplete={handleBatchComplete}
                onPreview={handleBatchPreview}
                onToggleMergeItem={handleToggleMergeItem}
                selectedMergeIds={mergeQueue.map(i => i.id)}
              />
            ))}
          </div>
        )}

        {/* File Queue */}
        {fileQueue.length > 0 && (
          <>
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {queuedCount > 0 && <span>{queuedCount} 个待处理</span>}
                {processingCount > 0 && (
                  <span className="text-blue-600">{processingCount} 个处理中</span>
                )}
                {completedCount > 0 && (
                  <span className="text-green-600">{completedCount} 个已完成</span>
                )}
                {failedCount > 0 && (
                  <span className="text-red-600">{failedCount} 个失败</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isProcessing && (
                  <Button variant="outline" size="sm" onClick={handleClearAll}>
                    清空全部
                  </Button>
                )}

                {isProcessing ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleStopProcessing}
                  >
                    停止
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleConvertAll} disabled={!canConvert}>
                    <Play className="h-4 w-4 mr-1" />
                    {processingMode === "batch" ? "创建异步任务" : "开始转换"}
                  </Button>
                )}

                {hasCompletedFiles && (
                  <Button variant="default" size="sm" onClick={handleDownloadAllAsZip}>
                    <Archive className="h-4 w-4 mr-1" />
                    下载全部 (ZIP)
                  </Button>
                )}
              </div>
            </div>

            {/* File List */}
            <FileQueueList
              files={fileQueue}
              onPreview={setPreviewFile}
              onRemove={handleRemoveFile}
              onToggleMergeItem={handleToggleMergeItem}
              selectedMergeIds={mergeQueue.map(i => i.id)}
            />
          </>
        )}

        {/* Empty State */}
        {fileQueue.length === 0 && activeBatchJobs.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center text-gray-500">
                <Download className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  准备就绪
                </h3>
                <p className="text-sm max-w-md mx-auto">
                  上传 PDF 文档，将其转换为结构清晰的 Markdown 文本。
                  支持同时上传多个文件进行批量处理。
                </p>
                {processingMode === "batch" && (
                  <p className="text-sm text-green-600 mt-2">
                    💡 异步模式已启用 - 节省 50% 处理费用
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Alert for API Key */}
        {failedCount > 0 && (
          <Card className="mt-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-800">
                    部分文件转换失败
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {failedCount} 个文件转换失败，请查看文件列表中的错误信息。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />

      {/* Preview Modal for standard mode */}
      <MarkdownPreviewModal
        isOpen={previewFile !== null}
        onClose={() => setPreviewFile(null)}
        fileName={previewFile?.file.name || ""}
        markdown={previewFile?.markdown || ""}
      />

      {/* Preview Modal for batch mode */}
      <MarkdownPreviewModal
        isOpen={previewData !== null}
        onClose={() => setPreviewData(null)}
        fileName={previewData?.fileName || ""}
        markdown={previewData?.markdown || ""}
      />

      {/* Merge Queue Panel */}
      <MergeQueuePanel
        items={mergeQueue}
        onReorder={handleReorderMergeQueue}
        onClear={handleClearMergeQueue}
        onRemoveItem={(id) => handleToggleMergeItem(mergeQueue.find(i => i.id === id)!)}
      />
    </div>
  );
}

export default App;

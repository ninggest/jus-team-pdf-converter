import { useState, useCallback, useRef } from "react";
import { Play, Download, Archive, AlertCircle } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ApiKeyInput } from "./components/ApiKeyInput";
import { BatchFileUpload } from "./components/BatchFileUpload";
import { FileQueueList } from "./components/FileQueueList";
import { MarkdownPreviewModal } from "./components/MarkdownPreviewModal";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import {
  generateFileId,
  processFilesSequentially,
} from "./lib/batchProcessor";
import type { FileItem } from "./lib/batchProcessor";

// Backend Worker URL - Update this to your deployed Worker URL
// Backend Worker URL - Uses environment variable VITE_WORKER_URL
const WORKER_URL = import.meta.env.VITE_WORKER_URL || "http://localhost:8787";

function App() {
  const [apiKey, setApiKey] = useState("");
  const [fileQueue, setFileQueue] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const stopProcessingRef = useRef(false);

  const handleApiKeyChange = useCallback((key: string) => {
    setApiKey(key);
  }, []);

  const handleFilesSelect = useCallback((files: File[]) => {
    const newItems: FileItem[] = files.map((file) => ({
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

    await processFilesSequentially(
      fileQueue,
      apiKey,
      WORKER_URL,
      handleUpdateFile,
      () => stopProcessingRef.current
    );

    setIsProcessing(false);
  };

  const handleStopProcessing = () => {
    stopProcessingRef.current = true;
  };

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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        {/* API Key Input */}
        <ApiKeyInput onKeyChange={handleApiKeyChange} />

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
                Please enter your Mistral API Key above to convert documents
              </p>
            )}
          </CardContent>
        </Card>

        {/* File Queue */}
        {fileQueue.length > 0 && (
          <>
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {queuedCount > 0 && <span>{queuedCount} queued</span>}
                {processingCount > 0 && (
                  <span className="text-blue-600">{processingCount} processing</span>
                )}
                {completedCount > 0 && (
                  <span className="text-green-600">{completedCount} completed</span>
                )}
                {failedCount > 0 && (
                  <span className="text-red-600">{failedCount} failed</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isProcessing && (
                  <Button variant="outline" size="sm" onClick={handleClearAll}>
                    Clear All
                  </Button>
                )}

                {isProcessing ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleStopProcessing}
                  >
                    Stop
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleConvertAll} disabled={!canConvert}>
                    <Play className="h-4 w-4 mr-1" />
                    Convert All
                  </Button>
                )}

                {hasCompletedFiles && (
                  <Button variant="default" size="sm" onClick={handleDownloadAllAsZip}>
                    <Archive className="h-4 w-4 mr-1" />
                    Download All as ZIP
                  </Button>
                )}
              </div>
            </div>

            {/* File List */}
            <FileQueueList
              files={fileQueue}
              onPreview={setPreviewFile}
              onRemove={handleRemoveFile}
            />
          </>
        )}

        {/* Empty State */}
        {fileQueue.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center text-gray-500">
                <Download className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Ready to Convert
                </h3>
                <p className="text-sm max-w-md mx-auto">
                  Upload legal PDF documents to convert them to clean,
                  structured Markdown text. You can upload multiple files at
                  once for batch processing.
                </p>
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
                    Some files failed to convert
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {failedCount} file(s) failed to convert. Check the error
                    messages in the file list for details.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />

      {/* Preview Modal */}
      <MarkdownPreviewModal
        isOpen={previewFile !== null}
        onClose={() => setPreviewFile(null)}
        fileName={previewFile?.file.name || ""}
        markdown={previewFile?.markdown || ""}
      />
    </div>
  );
}

export default App;

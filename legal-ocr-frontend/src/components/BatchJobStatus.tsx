import { useEffect, useState, useCallback } from "react";
import { Loader2, CheckCircle2, XCircle, Clock, Download, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import type { BatchJob, BatchResult } from "../lib/batchApi";
import { getBatchStatus, getBatchResults } from "../lib/batchApi";

interface BatchJobStatusProps {
    job: BatchJob;
    apiKey: string;
    workerUrl: string;
    accessCode: string;
    onComplete?: (results: BatchResult[]) => void;
    onPreview?: (fileName: string, markdown: string) => void;
    onToggleMergeItem?: (item: import("../types").MergeItem) => void;
    selectedMergeIds?: string[];
}

export function BatchJobStatus({
    job: initialJob,
    apiKey,
    workerUrl,
    accessCode,
    onComplete,
    onPreview,
    onToggleMergeItem,
    selectedMergeIds = [],
}: BatchJobStatusProps) {
    const [job, setJob] = useState<BatchJob>(initialJob);
    const [results, setResults] = useState<BatchResult[] | null>(null);
    const [isPolling, setIsPolling] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = useCallback(async () => {
        try {
            const status = await getBatchStatus(job.job_id, apiKey, workerUrl, accessCode);
            setJob(status);

            if (status.status === "completed") {
                const resultsData = await getBatchResults(job.job_id, apiKey, workerUrl, accessCode);
                setResults(resultsData.results);
                onComplete?.(resultsData.results);
                setIsPolling(false);
            } else if (status.status === "failed") {
                setError(status.error || "Job failed");
                setIsPolling(false);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch status");
        }
    }, [job.job_id, apiKey, workerUrl, accessCode, onComplete]);

    useEffect(() => {
        if (!isPolling) return;

        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, [isPolling, fetchStatus]);

    // Initial fetch
    useEffect(() => {
        if (job.status === "processing" || job.status === "uploading") {
            fetchStatus();
        }
    }, []);

    const getStatusIcon = () => {
        switch (job.status) {
            case "queued":
            case "uploading":
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case "processing":
                return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
            case "completed":
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case "failed":
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Clock className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusText = () => {
        switch (job.status) {
            case "queued":
                return "排队中...";
            case "uploading":
                return "正在上传文件...";
            case "processing":
                return `处理中 (${job.progress?.succeeded || 0}/${job.progress?.total || job.files?.length || 0})`;
            case "completed":
                return "已完成";
            case "failed":
                return "处理失败";
            default:
                return job.status;
        }
    };

    const handleDownloadResult = (result: BatchResult) => {
        const blob = new Blob([result.markdown], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.file_name.replace(/\.pdf$/i, ".md");
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Card className="mb-4">
            <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        {getStatusIcon()}
                        <span>批量任务 - {getStatusText()}</span>
                    </CardTitle>
                    <span className="text-xs text-gray-500">
                        ID: {job.job_id?.slice(0, 16) || "未知"}...
                    </span>
                </div>
            </CardHeader>
            <CardContent className="py-3 px-4">
                {/* Progress bar for processing */}
                {job.status === "processing" && job.progress && (
                    <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>进度</span>
                            <span>{Math.round((job.progress.succeeded / job.progress.total) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{
                                    width: `${(job.progress.succeeded / job.progress.total) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded mb-3">
                        {error}
                    </div>
                )}

                {/* Results list */}
                {results && results.length > 0 && (
                    <div className="space-y-2">
                        {results.map((result, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {!result.error && onToggleMergeItem && (
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            checked={selectedMergeIds.includes(`${job.job_id}-${index}`)}
                                            onChange={() => onToggleMergeItem({
                                                id: `${job.job_id}-${index}`,
                                                fileName: result.file_name,
                                                markdown: result.markdown
                                            })}
                                        />
                                    )}
                                    <span className="text-sm truncate flex-1 leading-none pt-0.5">
                                        {result.file_name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 ml-2">
                                    {result.error ? (
                                        <span className="text-xs text-red-500">{result.error}</span>
                                    ) : (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onPreview?.(result.file_name, result.markdown)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDownloadResult(result)}
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* File list for non-completed jobs */}
                {!results && job.files && job.files.length > 0 && (
                    <div className="text-sm text-gray-600">
                        <span className="font-medium">文件：</span>
                        {(job.files || []).slice(0, 3).join(", ")}
                        {job.files.length > 3 && ` 等 ${job.files.length} 个文件`}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

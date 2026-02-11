import { Eye, Download, Loader2, AlertCircle, CheckCircle, Clock, X } from "lucide-react";
import { Button } from "./ui/button";
import type { FileItem } from "../lib/batchProcessor";
import { formatFileSize, downloadAsFile } from "../lib/utils";

interface FileQueueListProps {
    files: FileItem[];
    onPreview: (file: FileItem) => void;
    onRemove: (id: string) => void;
    onToggleMergeItem?: (item: import("../types").MergeItem) => void;
    selectedMergeIds?: string[];
}

function StatusBadge({ status }: { status: FileItem["status"] }) {
    const configs = {
        queued: {
            icon: Clock,
            label: "Queued",
            className: "bg-gray-100 text-gray-700 border-gray-200",
        },
        uploading: {
            icon: Loader2,
            label: "Uploading",
            className: "bg-indigo-50 text-indigo-700 border-indigo-200",
            animate: true,
        },
        processing: {
            icon: Loader2,
            label: "Processing",
            className: "bg-blue-50 text-blue-700 border-blue-200",
            animate: true,
        },
        completed: {
            icon: CheckCircle,
            label: "Completed",
            className: "bg-green-50 text-green-700 border-green-200",
        },
        failed: {
            icon: AlertCircle,
            label: "Failed",
            className: "bg-red-50 text-red-700 border-red-200",
        },
    };

    const config = configs[status];
    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${config.className}`}
        >
            <Icon
                className={`h-3.5 w-3.5 ${"animate" in config && config.animate ? "animate-spin" : ""
                    }`}
            />
            {config.label}
        </span>
    );
}

export function FileQueueList({
    files,
    onPreview,
    onRemove,
    onToggleMergeItem,
    selectedMergeIds = []
}: FileQueueListProps) {
    if (files.length === 0) {
        return null;
    }

    const handleDownload = (file: FileItem) => {
        if (file.markdown) {
            const mdFileName = file.file.name.replace(/\.pdf$/i, ".md");
            downloadAsFile(file.markdown, mdFileName);
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700">
                    File Queue ({files.length} {files.length === 1 ? "file" : "files"})
                </h3>
            </div>
            <div className="divide-y divide-gray-100">
                {files.map((file) => (
                    <div
                        key={file.id}
                        className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            {file.status === "completed" && file.markdown && onToggleMergeItem && (
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    checked={selectedMergeIds.includes(file.id)}
                                    onChange={() => onToggleMergeItem({
                                        id: file.id,
                                        fileName: file.file.name,
                                        markdown: file.markdown!
                                    })}
                                />
                            )}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {file.file.name}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-gray-500">
                                        {formatFileSize(file.file.size)}
                                    </p>
                                    {file.error && (
                                        <span className="text-xs text-red-500">• {file.error}</span>
                                    )}
                                </div>
                                {file.status === "uploading" && (
                                    <div className="mt-2 w-full max-w-xs">
                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 transition-all duration-300 ease-out rounded-full"
                                                style={{ width: `${file.uploadProgress || 0}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-blue-600 mt-1 font-medium">
                                            Uploading {Math.round(file.uploadProgress || 0)}%
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 ml-4">
                            <StatusBadge status={file.status} />

                            <div className="flex items-center gap-1">
                                {file.status === "completed" && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onPreview(file)}
                                            title="Preview"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDownload(file)}
                                            title="Download"
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                                {(file.status === "queued" || file.status === "failed") && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onRemove(file.id)}
                                        title="Remove"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

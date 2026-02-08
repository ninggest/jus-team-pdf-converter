import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { X, Eye, Code, Copy, Download, Check } from "lucide-react";
import { Button } from "./ui/button";
import { copyToClipboard, downloadAsFile } from "../lib/utils";

interface MarkdownPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileName: string;
    markdown: string;
}

export function MarkdownPreviewModal({
    isOpen,
    onClose,
    fileName,
    markdown,
}: MarkdownPreviewModalProps) {
    const [viewMode, setViewMode] = useState<"preview" | "raw">("preview");
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopy = async () => {
        const success = await copyToClipboard(markdown);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        const mdFileName = fileName.replace(/\.pdf$/i, ".md");
        downloadAsFile(markdown, mdFileName);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl w-[90vw] max-w-4xl max-h-[90vh] flex flex-col animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                            {fileName.replace(/\.pdf$/i, ".md")}
                        </h2>
                        {/* View Mode Toggle */}
                        <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
                            <button
                                onClick={() => setViewMode("preview")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${viewMode === "preview"
                                        ? "bg-gray-900 text-white"
                                        : "bg-white text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <Eye className="h-3.5 w-3.5" />
                                Preview
                            </button>
                            <button
                                onClick={() => setViewMode("raw")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors border-l border-gray-200 ${viewMode === "raw"
                                        ? "bg-gray-900 text-white"
                                        : "bg-white text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <Code className="h-3.5 w-3.5" />
                                Raw
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopy}>
                            {copied ? (
                                <>
                                    <Check className="h-4 w-4 mr-1 text-green-600" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4 mr-1" />
                                    Copy
                                </>
                            )}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                        </Button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {viewMode === "preview" ? (
                        <div className="markdown-body max-w-none">
                            <ReactMarkdown>{markdown}</ReactMarkdown>
                        </div>
                    ) : (
                        <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg text-sm font-mono leading-relaxed overflow-x-auto">
                            <code>{markdown}</code>
                        </pre>
                    )}
                </div>
            </div>
        </div>
    );
}

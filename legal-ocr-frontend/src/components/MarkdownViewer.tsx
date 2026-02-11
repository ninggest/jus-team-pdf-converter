import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
    Copy,
    Download,
    Check,
    FileText,
    Eye,
    Code,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { cn, copyToClipboard, downloadAsFile, formatFileSize, stripMarkdownCodeBlocks } from "../lib/utils";

interface MarkdownViewerProps {
    markdown: string;
    fileName: string;
    fileSize: number;
}

type ViewMode = "preview" | "raw";

export function MarkdownViewer({
    markdown,
    fileName,
    fileSize,
}: MarkdownViewerProps) {
    const [copied, setCopied] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("preview");
    const [showFileInfo, setShowFileInfo] = useState(true);

    const handleCopy = async () => {
        const cleanedMarkdown = stripMarkdownCodeBlocks(markdown);
        const success = await copyToClipboard(cleanedMarkdown);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        // Replace .pdf extension with .md
        const mdFileName = fileName.replace(/\.pdf$/i, ".md");
        const cleanedMarkdown = stripMarkdownCodeBlocks(markdown);
        downloadAsFile(cleanedMarkdown, mdFileName);
    };

    const wordCount = markdown
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
    const charCount = markdown.length;

    return (
        <Card className="animate-fade-in">
            {/* File Info Header */}
            <CardHeader className="pb-3 border-b border-legal-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-legal-100 rounded-lg">
                            <FileText className="h-5 w-5 text-legal-600" />
                        </div>
                        <div>
                            <CardTitle className="text-base">{fileName}</CardTitle>
                            <button
                                onClick={() => setShowFileInfo(!showFileInfo)}
                                className="flex items-center gap-1 text-xs text-legal-500 hover:text-legal-700 transition-colors mt-0.5"
                            >
                                {showFileInfo ? (
                                    <>
                                        Hide details <ChevronUp className="h-3 w-3" />
                                    </>
                                ) : (
                                    <>
                                        Show details <ChevronDown className="h-3 w-3" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopy}
                            className="min-w-[100px]"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-4 w-4 mr-1 text-green-600" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4 mr-1" />
                                    Copy
                                </>
                            )}
                        </Button>
                        <Button variant="default" size="sm" onClick={handleDownload}>
                            <Download className="h-4 w-4 mr-1" />
                            Download .md
                        </Button>
                    </div>
                </div>

                {/* Collapsible File Info */}
                {showFileInfo && (
                    <div className="mt-4 grid grid-cols-4 gap-4 p-3 bg-legal-50 rounded-lg text-sm">
                        <div>
                            <span className="text-legal-500">Original Size</span>
                            <p className="font-medium text-legal-800">
                                {formatFileSize(fileSize)}
                            </p>
                        </div>
                        <div>
                            <span className="text-legal-500">Markdown Size</span>
                            <p className="font-medium text-legal-800">
                                {formatFileSize(charCount)}
                            </p>
                        </div>
                        <div>
                            <span className="text-legal-500">Words</span>
                            <p className="font-medium text-legal-800">
                                {wordCount.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <span className="text-legal-500">Characters</span>
                            <p className="font-medium text-legal-800">
                                {charCount.toLocaleString()}
                            </p>
                        </div>
                    </div>
                )}
            </CardHeader>

            <CardContent className="pt-4">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-legal-500">View:</span>
                    <div className="inline-flex rounded-md border border-legal-200 overflow-hidden">
                        <button
                            onClick={() => setViewMode("preview")}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors",
                                viewMode === "preview"
                                    ? "bg-legal-900 text-white"
                                    : "bg-white text-legal-600 hover:bg-legal-50"
                            )}
                        >
                            <Eye className="h-3.5 w-3.5" />
                            Preview
                        </button>
                        <button
                            onClick={() => setViewMode("raw")}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors border-l border-legal-200",
                                viewMode === "raw"
                                    ? "bg-legal-900 text-white"
                                    : "bg-white text-legal-600 hover:bg-legal-50"
                            )}
                        >
                            <Code className="h-3.5 w-3.5" />
                            Raw
                        </button>
                    </div>
                </div>

                {/* Content Display */}
                <div className="border border-legal-200 rounded-lg overflow-hidden">
                    {viewMode === "preview" ? (
                        <div className="p-6 max-h-[600px] overflow-y-auto bg-white">
                            <div className="markdown-body max-w-none">
                                <ReactMarkdown>{markdown}</ReactMarkdown>
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <pre className="p-4 max-h-[600px] overflow-auto bg-legal-900 text-legal-100 text-sm font-mono leading-relaxed">
                                <code>{markdown}</code>
                            </pre>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

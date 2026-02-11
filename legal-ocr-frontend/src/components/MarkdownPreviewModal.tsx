import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { X, Eye, Code, Copy, Download, Check, Columns, FileText, List, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { copyToClipboard, downloadAsFile } from "../lib/utils";

interface MarkdownPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileName: string;
    markdown: string;
    file?: File; // Optional original file for side-by-side view
    onRedact?: (content: string) => void; // Optional redaction function
}

interface TocItem {
    id: string;
    text: string;
    level: number;
}

export function MarkdownPreviewModal({
    isOpen,
    onClose,
    fileName,
    markdown: initialMarkdown,
    file,
    onRedact,
}: MarkdownPreviewModalProps) {
    const [content, setContent] = useState(initialMarkdown);
    const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
    const [showPdf, setShowPdf] = useState(false);
    const [showToc, setShowToc] = useState(false);
    const [copied, setCopied] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [toc, setToc] = useState<TocItem[]>([]);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Sync content when prop changes
    useEffect(() => {
        setContent(initialMarkdown);
    }, [initialMarkdown]);

    // Handle PDF URL creation/revocation
    useEffect(() => {
        if (isOpen && file) {
            const url = URL.createObjectURL(file);
            setPdfUrl(url);
            setShowPdf(true); // Default to split view if file exists
            return () => URL.revokeObjectURL(url);
        } else {
            setPdfUrl(null);
            setShowPdf(false);
        }
    }, [isOpen, file]);

    // Generate Table of Contents
    useEffect(() => {
        const lines = content.split('\n');
        const items: TocItem[] = [];
        const slugCounts: Record<string, number> = {};

        lines.forEach(line => {
            const match = line.match(/^(#{1,6})\s+(.+)$/);
            if (match) {
                const level = match[1].length;
                const text = match[2].trim();

                let slug = text
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '') // Remove non-word chars
                    .replace(/\s+/g, '-');    // Replace spaces with dashes

                if (slugCounts[slug] !== undefined) {
                    slugCounts[slug]++;
                    slug = `${slug}-${slugCounts[slug]}`;
                } else {
                    slugCounts[slug] = 0;
                }

                items.push({ id: slug, text, level });
            }
        });
        setToc(items);
    }, [content]);

    if (!isOpen) return null;

    const handleCopy = async () => {
        const success = await copyToClipboard(content);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        const mdFileName = fileName.replace(/\.pdf$/i, ".md");
        downloadAsFile(content, mdFileName);
    };

    const scrollToHeading = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full h-full max-w-[95vw] max-h-[95vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in text-left">

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <h2 className="text-lg font-semibold text-gray-800 truncate max-w-md">
                            {fileName.replace(/\.pdf$/i, ".md")}
                        </h2>

                        <div className="h-6 w-px bg-gray-300 mx-1" />

                        {/* View Controls */}
                        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
                            <button
                                onClick={() => setViewMode("preview")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === "preview"
                                        ? "bg-gray-100 text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                <Eye className="h-4 w-4" />
                                预览
                            </button>
                            <button
                                onClick={() => setViewMode("edit")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === "edit"
                                        ? "bg-gray-100 text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                <Code className="h-4 w-4" />
                                编辑
                            </button>
                        </div>

                        {/* PDF Toggle */}
                        {pdfUrl && (
                            <button
                                onClick={() => setShowPdf(!showPdf)}
                                className={`ml-2 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border transition-all ${showPdf
                                        ? "bg-blue-50 border-blue-200 text-blue-700"
                                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <Columns className="h-4 w-4" />
                                对照 PDF
                            </button>
                        )}

                        {/* TOC Toggle */}
                        <button
                            onClick={() => setShowToc(!showToc)}
                            className={`ml-1 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border transition-all ${showToc
                                    ? "bg-blue-50 border-blue-200 text-blue-700"
                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            <List className="h-4 w-4" />
                            目录
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 mr-2">
                            {content.length} 字符
                        </span>
                        {onRedact && (
                            <Button variant="outline" size="sm" onClick={() => onRedact(content)} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                <Shield className="h-4 w-4 mr-1" />
                                脱敏
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={handleCopy}>
                            {copied ? (
                                <>
                                    <Check className="h-4 w-4 mr-1 text-green-600" />
                                    已复制
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4 mr-1" />
                                    复制
                                </>
                            )}
                        </Button>
                        <Button variant="default" size="sm" onClick={handleDownload} className="bg-gray-900 hover:bg-gray-800">
                            <Download className="h-4 w-4 mr-1" />
                            下载
                        </Button>
                        <button
                            onClick={onClose}
                            className="ml-2 p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Main Body */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Pane: PDF Viewer */}
                    {showPdf && pdfUrl && (
                        <div className="w-1/2 border-r border-gray-200 bg-gray-100 flex flex-col">
                            <div className="px-4 py-2 bg-white border-b border-gray-200 text-xs font-medium text-gray-500 flex items-center gap-2">
                                <FileText className="h-3 w-3" />
                                原始 PDF
                            </div>
                            <iframe
                                src={pdfUrl}
                                className="w-full h-full border-none"
                                title="PDF Preview"
                            />
                        </div>
                    )}

                    {/* Right Pane: Markdown Viewer/Editor */}
                    <div className={`flex-1 flex flex-col relative ${showPdf ? 'w-1/2' : 'w-full'}`}>
                        {/* TOC Sidebar Overlay */}
                        {showToc && (
                            <div className="absolute top-0 right-0 w-64 h-full bg-white border-l border-gray-200 shadow-xl z-20 flex flex-col animate-fade-in">
                                <div className="p-3 border-b border-gray-200 font-medium text-sm text-gray-700 bg-gray-50 flex justify-between items-center">
                                    <span>文档目录</span>
                                    <button onClick={() => setShowToc(false)} className="text-gray-400 hover:text-gray-600">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2">
                                    {toc.length === 0 ? (
                                        <p className="text-sm text-gray-400 p-2 text-center">未检测到标题</p>
                                    ) : (
                                        <div className="space-y-1">
                                            {toc.map((item, idx) => (
                                                <button
                                                    key={`${item.id}-${idx}`}
                                                    onClick={() => scrollToHeading(item.id)}
                                                    className="w-full text-left text-sm py-1.5 px-2 rounded hover:bg-blue-50 text-gray-700 hover:text-blue-700 truncate transition-colors"
                                                    style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
                                                >
                                                    {item.text}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex-1 overflow-auto bg-white" ref={scrollRef}>
                            {viewMode === "preview" ? (
                                <div className="markdown-body p-8 max-w-4xl mx-auto">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeSlug]}
                                    >
                                        {content}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full h-full p-6 font-mono text-sm leading-relaxed outline-none resize-none text-gray-800 bg-gray-50 focus:bg-white transition-colors"
                                    placeholder="Type markdown here..."
                                    spellCheck={false}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

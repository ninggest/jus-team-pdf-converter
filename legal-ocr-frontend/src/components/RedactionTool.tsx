import { useState, useEffect, useMemo } from "react";
import {
    X,
    Shield,
    Download,
    RefreshCw,
    Plus,
    Trash2,
    FileText,
    FileCode,
    AlertCircle
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
    identifyRedactions,
    applyRedactions,
    generateComparisonMarkdown,
    type RedactionMatch
} from "../lib/redactionUtils";
import { TYPE_NAMES } from "../lib/redactionRules";
import { downloadAsFile } from "../lib/utils";

interface RedactionToolProps {
    initialText: string;
    fileName: string;
    onClose: () => void;
}

export function RedactionTool({ initialText, fileName, onClose }: RedactionToolProps) {
    const [originalText] = useState(initialText);
    const [matches, setMatches] = useState<RedactionMatch[]>([]);
    const [isIdentifying, setIsIdentifying] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Initial identification
    useEffect(() => {
        handleIdentify();
    }, [initialText]);

    const handleIdentify = () => {
        setIsIdentifying(true);
        // Simulate slight delay for UX
        setTimeout(() => {
            const results = identifyRedactions(originalText);
            setMatches(results);
            setIsIdentifying(false);
        }, 300);
    };

    const toggleMatchSelection = (id: string) => {
        setMatches(prev => prev.map(m => m.id === id ? { ...m, isSelected: !m.isSelected } : m));
    };

    const removeMatch = (id: string) => {
        setMatches(prev => prev.filter(m => m.id !== id));
    };

    const redactedText = useMemo(() => applyRedactions(originalText, matches), [originalText, matches]);

    const handleExport = () => {
        const baseName = fileName.replace(/\.[^/.]+$/, "");

        // Export redacted markdown
        downloadAsFile(redactedText, `${baseName}_redacted.md`);

        // Export comparison report
        const comparisonMd = generateComparisonMarkdown(matches);
        downloadAsFile(comparisonMd, `${baseName}_comparison_redaction.md`);
    };

    const stats = useMemo(() => {
        const selected = matches.filter(m => m.isSelected);
        const categories: Record<string, number> = {};
        selected.forEach(m => {
            categories[m.category] = (categories[m.category] || 0) + 1;
        });
        return {
            total: matches.length,
            selected: selected.length,
            categories
        };
    }, [matches]);

    const filteredMatches = useMemo(() => {
        if (!selectedCategory) return matches;
        return matches.filter(m => m.category === selectedCategory);
    }, [matches, selectedCategory]);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full h-full max-w-7xl max-h-[95vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">文档脱敏工具</h2>
                            <p className="text-xs text-gray-500 font-medium">针对：{fileName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={handleIdentify} disabled={isIdentifying} className="gap-2">
                            <RefreshCw className={`h-4 w-4 ${isIdentifying ? 'animate-spin' : ''}`} />
                            重新识别
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleExport}
                            disabled={stats.selected === 0}
                            className="bg-blue-600 hover:bg-blue-700 gap-2"
                        >
                            <Download className="h-4 w-4" />
                            导出脱敏文档
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
                    {/* Sidebar: Categories & Stats */}
                    <div className="w-72 border-r border-gray-200 bg-gray-50/50 flex flex-col overflow-y-auto p-4 gap-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">脱敏概览</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <Card className="bg-white border-blue-100">
                                    <div className="p-3 text-center">
                                        <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                                        <div className="text-[10px] text-gray-500 font-medium">总项数</div>
                                    </div>
                                </Card>
                                <Card className="bg-white border-green-100">
                                    <div className="p-3 text-center">
                                        <div className="text-2xl font-bold text-green-600">{stats.selected}</div>
                                        <div className="text-[10px] text-gray-500 font-medium">已确认</div>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">按分类查看</h3>
                            <div className="space-y-1">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${selectedCategory === null ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <span>全部类型</span>
                                    <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-md text-[10px]">{stats.total}</span>
                                </button>
                                {Object.entries(TYPE_NAMES).map(([key, label]) => {
                                    const count = stats.categories[key] || 0;
                                    if (count === 0 && selectedCategory !== key) return null;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedCategory(key)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${selectedCategory === key ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            <span className="truncate">{label}</span>
                                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${selectedCategory === key ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-200 text-gray-700'}`}>{count}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-auto border-t border-gray-200 pt-4">
                            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                                <div className="flex gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                                    <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                                        脱敏工具会自动识别文档中的敏感信息。请务必检查结果并调整，确保关键隐私已正确替换。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center: List & Preview */}
                    <div className="flex-1 flex flex-col bg-white">
                        {/* Tool Tabs */}
                        <div className="flex items-center px-4 border-b border-gray-100 gap-4 overflow-x-auto no-scrollbar">
                            <div className="flex items-center h-12 gap-1 border-b-2 border-blue-600">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-bold text-gray-900 whitespace-nowrap">脱敏项明细</span>
                            </div>
                        </div>

                        <div className="flex-1 flex overflow-hidden">
                            {/* List View */}
                            <div className="w-1/2 border-r border-gray-100 flex flex-col">
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {filteredMatches.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                                            <Shield className="h-12 w-12 mb-4 opacity-20" />
                                            <p className="text-sm font-medium">未检测到该类型的脱敏项</p>
                                        </div>
                                    ) : (
                                        filteredMatches.map(match => (
                                            <div
                                                key={match.id}
                                                className={`group p-3 border rounded-xl transition-all ${match.isSelected
                                                    ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-50'
                                                    : 'bg-gray-50 border-gray-200 opacity-60'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${match.isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'
                                                            }`}>
                                                            {TYPE_NAMES[match.category] || match.category}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            checked={match.isSelected}
                                                            onChange={() => toggleMatchSelection(match.id)}
                                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => removeMatch(match.id)}
                                                        className="text-gray-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="text-sm font-mono bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100/50 break-all">
                                                        {match.original}
                                                    </div>
                                                    <div className="flex items-center justify-center py-0.5">
                                                        <Plus className="h-3 w-3 text-gray-300 rotate-45" />
                                                    </div>
                                                    <div className="text-sm font-mono bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100/50 break-all font-bold">
                                                        {match.replacement}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Preview View */}
                            <div className="w-1/2 flex flex-col bg-gray-50/30">
                                <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm">
                                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                                        <FileCode className="h-3.5 w-3.5" />
                                        实时脱敏预览
                                    </span>
                                    <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold border border-green-100">
                                        已同步
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 font-mono text-[13px] leading-relaxed text-gray-800 whitespace-pre-wrap selection:bg-blue-100">
                                    {redactedText}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

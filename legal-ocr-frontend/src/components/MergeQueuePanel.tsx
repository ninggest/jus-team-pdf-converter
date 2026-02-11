import { Trash2, ChevronUp, ChevronDown, Download, Layers } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { downloadAsFile, stripMarkdownCodeBlocks } from "../lib/utils";
import type { MergeItem } from "../types";

interface MergeQueuePanelProps {
    items: MergeItem[];
    onReorder: (newItems: MergeItem[]) => void;
    onClear: () => void;
    onRemoveItem: (id: string) => void;
}

export function MergeQueuePanel({
    items,
    onReorder,
    onClear,
    onRemoveItem,
}: MergeQueuePanelProps) {
    if (items.length === 0) return null;

    const handleMoveUp = (index: number) => {
        if (index === 0) return;
        const newItems = [...items];
        const temp = newItems[index];
        newItems[index] = newItems[index - 1];
        newItems[index - 1] = temp;
        onReorder(newItems);
    };

    const handleMoveDown = (index: number) => {
        if (index === items.length - 1) return;
        const newItems = [...items];
        const temp = newItems[index];
        newItems[index] = newItems[index + 1];
        newItems[index + 1] = temp;
        onReorder(newItems);
    };

    const handleMergeAndDownload = () => {
        if (items.length === 0) return;

        // Joining with horizontal rule as requested, stripping any code blocks
        const mergedContent = items
            .map(item => stripMarkdownCodeBlocks(item.markdown))
            .join("\n\n---\n\n");
        downloadAsFile(mergedContent, "merged_legal_document.md");
    };

    return (
        <Card className="fixed bottom-6 right-6 w-80 shadow-2xl border-blue-200 z-50 animate-in fade-in slide-in-from-bottom-4">
            <CardHeader className="py-3 px-4 bg-blue-50/50 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-900">
                    <Layers className="h-4 w-4" />
                    合并队列 ({items.length})
                </CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-500 hover:text-red-600"
                    onClick={onClear}
                    title="清空记录"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                    {items.map((item, index) => (
                        <div key={item.id} className="p-3 flex items-center justify-between gap-2 group">
                            <span className="text-xs font-medium text-gray-700 truncate flex-1">
                                {index + 1}. {item.fileName}
                            </span>
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    disabled={index === 0}
                                    onClick={() => handleMoveUp(index)}
                                >
                                    <ChevronUp className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    disabled={index === items.length - 1}
                                    onClick={() => handleMoveDown(index)}
                                >
                                    <ChevronDown className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-gray-400 hover:text-red-500"
                                    onClick={() => onRemoveItem(item.id)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-3 bg-white border-t border-gray-100">
                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        onClick={handleMergeAndDownload}
                        disabled={items.length < 2}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        合并 Markdown 文件
                    </Button>
                    {items.length === 1 && (
                        <p className="text-[10px] text-gray-500 text-center mt-2">
                            请至少选择两个文件进行合并
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

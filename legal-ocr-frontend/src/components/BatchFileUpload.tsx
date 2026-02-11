import { useCallback, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

interface BatchFileUploadProps {
    onFilesSelect: (files: File[]) => void;
    isProcessing: boolean;
    disabled?: boolean;
}

export function BatchFileUpload({
    onFilesSelect,
    isProcessing,
    disabled,
}: BatchFileUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);

            const files = Array.from(e.dataTransfer.files);
            const pdfFiles = files.filter(
                (file) =>
                    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
            );

            if (pdfFiles.length === 0) {
                alert("请上传 PDF 文件。");
                return;
            }

            if (pdfFiles.length < files.length) {
                alert(`已忽略 ${files.length - pdfFiles.length} 个非 PDF 文件。`);
            }

            onFilesSelect(pdfFiles);
        },
        [onFilesSelect]
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                const pdfFiles = Array.from(files).filter(
                    (file) =>
                        file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
                );

                if (pdfFiles.length > 0) {
                    onFilesSelect(pdfFiles);
                } else {
                    alert("请上传 PDF 文件。");
                }
            }
            // Reset input so same files can be selected again
            e.target.value = "";
        },
        [onFilesSelect]
    );

    const isDisabled = isProcessing || disabled;

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
                isDragOver
                    ? "border-gray-500 bg-gray-50"
                    : "border-gray-300 hover:border-gray-400",
                isDisabled && "pointer-events-none opacity-50"
            )}
        >
            <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isDisabled}
                multiple
            />

            <div className="flex flex-col items-center gap-3">
                {isProcessing ? (
                    <Loader2 className="h-10 w-10 text-gray-500 animate-spin" />
                ) : (
                    <div className="p-4 bg-gray-100 rounded-full">
                        <Upload className="h-8 w-8 text-gray-600" />
                    </div>
                )}
                <div>
                    <p className="font-medium text-gray-700">
                        {isProcessing
                            ? "正在处理文件..."
                            : "拖放 PDF 文件到这里，或点击选择文件"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        超过 50MB 的文件将被自动切割为多个文件
                    </p>
                </div>
            </div>
        </div>
    );
}

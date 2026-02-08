import { useCallback, useState } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { cn, formatFileSize } from "../lib/utils";

interface FileUploadProps {
    onFileSelect: (file: File | null) => void;
    selectedFile: File | null;
    isProcessing: boolean;
    onConvert: () => void;
    hasApiKey: boolean;
}

export function FileUpload({
    onFileSelect,
    selectedFile,
    isProcessing,
    onConvert,
    hasApiKey,
}: FileUploadProps) {
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

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
                    onFileSelect(file);
                } else {
                    alert("Please upload a PDF file.");
                }
            }
        },
        [onFileSelect]
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                const file = files[0];
                if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
                    onFileSelect(file);
                } else {
                    alert("Please upload a PDF file.");
                }
            }
            // Reset input so same file can be selected again
            e.target.value = "";
        },
        [onFileSelect]
    );

    const canConvert = selectedFile && hasApiKey && !isProcessing;

    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                {/* Drop Zone */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
                        isDragOver
                            ? "border-legal-500 bg-legal-50"
                            : "border-legal-300 hover:border-legal-400",
                        isProcessing && "pointer-events-none opacity-50"
                    )}
                >
                    <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isProcessing}
                    />

                    {isProcessing ? (
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-10 w-10 text-legal-500 animate-spin" />
                            <div className="text-legal-600 font-medium">
                                Processing document...
                            </div>
                            <p className="text-sm text-legal-400">
                                This may take a moment depending on the document size
                            </p>
                        </div>
                    ) : selectedFile ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="flex items-center gap-3 p-4 bg-legal-50 rounded-lg border border-legal-200 w-full max-w-md">
                                <FileText className="h-10 w-10 text-legal-600 flex-shrink-0" />
                                <div className="flex-1 text-left min-w-0">
                                    <p className="font-medium text-legal-800 truncate">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-sm text-legal-500">
                                        {formatFileSize(selectedFile.size)}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onFileSelect(null);
                                    }}
                                    className="p-1 hover:bg-legal-200 rounded transition-colors"
                                >
                                    <X className="h-5 w-5 text-legal-500" />
                                </button>
                            </div>
                            <p className="text-sm text-legal-500">
                                Click or drag to replace the file
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-legal-100 rounded-full">
                                <Upload className="h-8 w-8 text-legal-600" />
                            </div>
                            <div>
                                <p className="font-medium text-legal-700">
                                    Drop your PDF here, or click to browse
                                </p>
                                <p className="text-sm text-legal-500 mt-1">
                                    Supports PDF files up to 50MB
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Convert Button */}
                <div className="mt-4 flex justify-center">
                    <Button
                        size="lg"
                        onClick={onConvert}
                        disabled={!canConvert}
                        className="min-w-[200px]"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Converting...
                            </>
                        ) : (
                            <>
                                <FileText className="h-4 w-4 mr-2" />
                                Convert to Markdown
                            </>
                        )}
                    </Button>
                </div>

                {/* Validation messages */}
                {!hasApiKey && (
                    <p className="text-center text-sm text-amber-600 mt-3">
                        Please enter your Mistral API Key above to convert documents
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

import { Zap, Clock, Sparkles, Info } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export type ProcessingMode = "standard" | "batch";

interface ProcessingModeSelectorProps {
    mode: ProcessingMode;
    onModeChange: (mode: ProcessingMode) => void;
    disabled?: boolean;
}

export function ProcessingModeSelector({
    mode,
    onModeChange,
    disabled = false,
}: ProcessingModeSelectorProps) {
    return (
        <div className="mb-6">
            <div className="grid grid-cols-2 gap-4">
                {/* Standard Mode */}
                <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${mode === "standard"
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:border-gray-300"
                        } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
                    onClick={() => !disabled && onModeChange("standard")}
                >
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${mode === "standard" ? "bg-blue-100" : "bg-gray-100"}`}>
                                <Zap className={`h-5 w-5 ${mode === "standard" ? "text-blue-600" : "text-gray-500"}`} />
                            </div>
                            <div className="flex-1">
                                <h3 className={`font-semibold ${mode === "standard" ? "text-blue-900" : "text-gray-800"}`}>
                                    常规模式
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    实时处理，立即返回结果
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                                        标准定价
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Async Mode */}
                <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${mode === "batch"
                        ? "ring-2 ring-green-500 bg-green-50"
                        : "hover:border-gray-300"
                        } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
                    onClick={() => !disabled && onModeChange("batch")}
                >
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${mode === "batch" ? "bg-green-100" : "bg-gray-100"}`}>
                                <Clock className={`h-5 w-5 ${mode === "batch" ? "text-green-600" : "text-gray-500"}`} />
                            </div>
                            <div className="flex-1">
                                <h3 className={`font-semibold ${mode === "batch" ? "text-green-900" : "text-gray-800"}`}>
                                    异步模式
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    后台处理，需等待几分钟
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs px-2 py-0.5 bg-green-100 rounded text-green-700 flex items-center gap-1">
                                        <Sparkles className="h-3 w-3" />
                                        节省 50%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Mode Explanation */}
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-2 text-xs text-gray-600">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>
                        {mode === "standard" ? (
                            <p>
                                <strong>常规模式</strong>：PDF 文件将实时发送到 Mistral AI 进行 OCR 处理，结果会立即返回。适合少量文件或需要即时结果的场景。
                            </p>
                        ) : (
                            <p>
                                <strong>异步模式</strong>：PDF 文件将加入处理队列，由 Mistral AI 在后台处理。处理完成后可下载结果。适合大量文件，可享受 50% 的价格优惠。
                                <span className="block mt-1 text-amber-600 font-medium">⚠️ 注意：免费层 (Free Tier) API 无法使用此模式，需订阅付费计划。</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

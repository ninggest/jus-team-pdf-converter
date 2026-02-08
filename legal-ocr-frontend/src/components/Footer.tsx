import { AlertTriangle } from "lucide-react";

/**
 * Footer component with attribution and data privacy notice
 */
export function Footer() {
    return (
        <footer className="border-t border-gray-200 bg-white mt-auto py-8">
            <div className="max-w-6xl mx-auto px-4 box-border">
                <div className="flex flex-col items-center gap-6">
                    {/* Data Privacy Warning */}
                    <div className="w-full max-w-5xl flex flex-col gap-3 p-4 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-900">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <h4 className="font-semibold text-amber-800">数据安全与隐私提示</h4>
                        </div>

                        <div className="pl-7 space-y-3 text-xs leading-relaxed text-amber-800/90">
                            <p>
                                <strong className="text-amber-900">1. 数据流向透明：</strong>您的 API Key <strong>仅</strong>存储在您浏览器的本地存储中。
                                转换时，您的 PDF 文件会直接发送到 Mistral AI 的 API。
                                <span className="font-semibold"> 我们不会在我们的服务器上存储您的文件、内容或 API Key。</span>
                            </p>
                            <p>
                                <strong className="text-amber-900">2. 服务器位置：</strong>您的 PDF 文件将上传到 Mistral AI 的服务器进行处理。Mistral AI 是一家法国公司，其服务器主要位于<strong>欧盟</strong>。
                            </p>
                            <p className="italic font-medium border-t border-amber-200/50 pt-2 mt-1">
                                ⚠️ 如果您有严格的数据驻留要求（例如数据不能离开您的国家），或对与 Mistral AI 共享数据有任何顾虑，请在使用前仔细评估。
                            </p>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-medium text-gray-600">
                        <a
                            href="https://jus.team/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-legal-600 transition-colors underline decoration-gray-200 underline-offset-4 hover:decoration-legal-200"
                        >
                            Jus Team
                        </a>
                        <a
                            href="https://www.wywlawyer.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-legal-600 transition-colors underline decoration-gray-200 underline-offset-4 hover:decoration-legal-200"
                        >
                            广西万益律师事务所
                        </a>
                        <a
                            href="https://github.com/ninggest/jus-team-pdf-converter"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-legal-600 transition-colors underline decoration-gray-200 underline-offset-4 hover:decoration-legal-200"
                        >
                            GitHub
                        </a>
                    </div>

                    <p className="text-center text-sm text-gray-400">
                        基于{" "}
                        <a
                            href="https://mistral.ai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-700 font-medium"
                        >
                            Mistral AI
                        </a>{" "}
                        文档智能技术 | Created by Zane v1.0.2
                    </p>
                </div>
            </div>
        </footer>
    );
}

/**
 * Footer component with attribution
 */
export function Footer() {
    return (
        <footer className="border-t border-gray-200 bg-white mt-auto py-8">
            <div className="max-w-6xl mx-auto px-4 box-border">
                <div className="flex flex-col items-center gap-4">
                    <p className="text-center text-sm text-gray-500">
                        Powered by{" "}
                        <a
                            href="https://mistral.ai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-700 hover:text-gray-900 underline font-medium"
                        >
                            Mistral AI
                        </a>{" "}
                        Document Intelligence | Created by Zane
                    </p>

                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-400">
                        <a
                            href="https://jus.team/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-legal-600 transition-colors"
                        >
                            Jus Team
                        </a>
                        <a
                            href="https://www.wywlawyer.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-legal-600 transition-colors"
                        >
                            广西万益律师事务所
                        </a>
                        <a
                            href="https://github.com/ninggest/jus-team-pdf-converter"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-legal-600 transition-colors"
                        >
                            GitHub Repository
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

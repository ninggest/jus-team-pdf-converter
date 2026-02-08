/**
 * Footer component with attribution
 */
export function Footer() {
    return (
        <footer className="border-t border-gray-200 bg-white mt-auto py-8">
            <div className="max-w-6xl mx-auto px-4 box-border">
                <div className="flex flex-col items-center gap-6">
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
                            GitHub Repository
                        </a>
                    </div>

                    <p className="text-center text-sm text-gray-400">
                        Powered by{" "}
                        <a
                            href="https://mistral.ai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-700 font-medium"
                        >
                            Mistral AI
                        </a>{" "}
                        Document Intelligence | Created by Zane
                    </p>
                </div>
            </div>
        </footer>
    );
}

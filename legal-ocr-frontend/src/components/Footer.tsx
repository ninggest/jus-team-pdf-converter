/**
 * Footer component with attribution
 */
export function Footer() {
    return (
        <footer className="border-t border-gray-200 bg-white mt-auto py-6">
            <div className="max-w-6xl mx-auto px-4">
                <p className="text-center text-sm text-gray-500">
                    Powered by{" "}
                    <a
                        href="https://mistral.ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 hover:text-gray-900 underline"
                    >
                        Mistral AI
                    </a>{" "}
                    Document Intelligence | Powered by Zane
                </p>
            </div>
        </footer>
    );
}

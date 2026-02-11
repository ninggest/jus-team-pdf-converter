import { X, Sparkles, Rocket } from "lucide-react";
import { Button } from "./ui/button";
import { RELEASE_NOTES } from "../lib/releaseNotes";

interface ReleaseNotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentVersion: string;
}

export function ReleaseNotesModal({ isOpen, onClose }: ReleaseNotesModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in text-left">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden transform transition-all scale-100 relative flex flex-col max-h-[90vh]">

                {/* Decorative Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative overflow-hidden flex-shrink-0">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 opacity-10">
                        <Rocket className="w-24 h-24 transform rotate-45" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                                UPDATE HISTORY
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold">更新日志</h2>
                        <p className="text-blue-100 text-sm mt-1">
                            了解最近的功能演进与优化
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="p-6 overflow-y-auto flex-1 space-y-8">
                    {RELEASE_NOTES.map((note) => (
                        <div key={note.version} className="relative pl-6 border-l-2 border-blue-100 pb-2">
                            {/* Version dot */}
                            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm" />

                            <div className="mb-4">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-bold text-gray-900">v{note.version}</h3>
                                </div>
                                <p className="text-sm text-gray-600 font-medium">
                                    {note.description}
                                </p>
                            </div>

                            <ul className="space-y-3">
                                {note.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2.5">
                                        <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center">
                                            <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                                        </div>
                                        <span className="text-sm text-gray-700 leading-relaxed">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
                    <div className="flex flex-col gap-3">
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 h-auto text-base shadow-lg shadow-blue-200"
                            onClick={onClose}
                        >
                            我知道了
                        </Button>
                        <p className="text-center text-xs text-gray-400">
                            我们会持续为您打磨法律文档处理的专业体验
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

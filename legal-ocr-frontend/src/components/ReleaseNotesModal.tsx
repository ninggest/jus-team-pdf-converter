import { X, Sparkles, Rocket } from "lucide-react";
import { Button } from "./ui/button";
import { RELEASE_NOTES } from "../lib/releaseNotes";

interface ReleaseNotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentVersion: string;
}

export function ReleaseNotesModal({ isOpen, onClose, currentVersion }: ReleaseNotesModalProps) {
    if (!isOpen) return null;

    // Use current version note or the first one if exact match fails
    const note = RELEASE_NOTES.find(n => n.version === currentVersion) || RELEASE_NOTES[0];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden transform transition-all scale-100 relative">

                {/* Decorative Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 opacity-10">
                        <Rocket className="w-32 h-32 transform rotate-45" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                                NEW
                            </span>
                            <span className="text-blue-100 text-sm font-medium">Coming to you live</span>
                        </div>
                        <h2 className="text-2xl font-bold">版本更新 {note.version}</h2>
                        <p className="text-blue-100 text-sm mt-1">
                            {note.date || "Just released"}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="mb-6">
                        <p className="text-gray-600 mb-4 font-medium">
                            {note.description || "我们为您带来了一系列令人兴奋的新功能与改进！"}
                        </p>

                        <ul className="space-y-3">
                            {note.features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                                        <Sparkles className="w-3 h-3 text-blue-600" />
                                    </div>
                                    <span className="text-sm text-gray-700 leading-relaxed">
                                        {feature}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 h-auto text-base"
                            onClick={onClose}
                        >
                            立刻体验
                        </Button>
                        <p className="text-center text-xs text-gray-400">
                            点击关闭后，该版本说明将不再显示
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

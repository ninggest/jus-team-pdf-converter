import { useState, useEffect } from "react";
import { Key, Eye, EyeOff, AlertTriangle, Check } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { getStoredApiKey, saveApiKey } from "../lib/utils";

interface ApiKeyInputProps {
    onKeyChange: (key: string) => void;
}

export function ApiKeyInput({ onKeyChange }: ApiKeyInputProps) {
    const [apiKey, setApiKey] = useState("");
    const [showKey, setShowKey] = useState(false);
    const [saved, setSaved] = useState(false);

    // Load API key from localStorage on mount
    useEffect(() => {
        const storedKey = getStoredApiKey();
        if (storedKey) {
            setApiKey(storedKey);
            onKeyChange(storedKey);
        }
    }, [onKeyChange]);

    const handleKeyChange = (value: string) => {
        setApiKey(value);
        setSaved(false);
    };

    const handleSave = () => {
        saveApiKey(apiKey);
        onKeyChange(apiKey);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleClear = () => {
        setApiKey("");
        saveApiKey("");
        onKeyChange("");
        setSaved(false);
    };

    const isValidKey = apiKey.length > 0;

    return (
        <Card className="mb-6">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-legal-600" />
                    <CardTitle className="text-base">Mistral API Key</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            type={showKey ? "text" : "password"}
                            value={apiKey}
                            onChange={(e) => handleKeyChange(e.target.value)}
                            placeholder="Enter your Mistral API Key..."
                            className="pr-10 font-mono text-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowKey(!showKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-legal-400 hover:text-legal-600 transition-colors"
                        >
                            {showKey ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    <Button
                        variant={saved ? "secondary" : "default"}
                        onClick={handleSave}
                        disabled={!isValidKey}
                        className="min-w-[80px]"
                    >
                        {saved ? (
                            <>
                                <Check className="h-4 w-4 mr-1" />
                                Saved
                            </>
                        ) : (
                            "Save"
                        )}
                    </Button>
                    {apiKey && (
                        <Button variant="outline" onClick={handleClear}>
                            Clear
                        </Button>
                    )}
                </div>


                {/* Privacy Warning */}
                <div className="flex flex-col gap-3 p-4 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-900">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <h4 className="font-semibold text-amber-800">Data Privacy & Security Notice</h4>
                    </div>

                    <div className="pl-7 space-y-3 text-xs leading-relaxed text-amber-800/90">
                        <p>
                            <strong className="text-amber-900">1. Data Flow Transparency:</strong> Your API Key is stored <strong>only</strong> in your browser's local storage.
                            When converting, your PDF files are transmitted directly to Mistral AI's API.
                            <span className="font-semibold"> We do not store your files, content, or API keys on our own servers.</span>
                        </p>
                        <p>
                            <strong className="text-amber-900">2. Server Location:</strong> Your PDF files will be uploaded
                            to Mistral AI's servers for processing. Mistral AI is a remote company based in France, and their servers are primarily located in the <strong>European Union</strong>.
                        </p>
                        <p className="italic font-medium border-t border-amber-200/50 pt-2 mt-1">
                            ⚠️ If you have strict data residency requirements (e.g., data cannot leave your country) or concerns about sharing data with Mistral AI, please evaluate carefully before use.
                        </p>
                    </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-2 text-xs">
                    <span
                        className={`h-2 w-2 rounded-full ${isValidKey ? "bg-green-500" : "bg-legal-300"
                            }`}
                    />
                    <span className="text-legal-500">
                        {isValidKey ? "API Key configured" : "No API Key set"}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

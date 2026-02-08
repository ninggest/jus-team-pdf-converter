import { useState, useEffect } from "react";
import { Key, Eye, EyeOff, Check } from "lucide-react";
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
                            placeholder="请输入您的 Mistral API Key..."
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
                                已保存
                            </>
                        ) : (
                            "保存"
                        )}
                    </Button>
                    {apiKey && (
                        <Button variant="outline" onClick={handleClear}>
                            清除
                        </Button>
                    )}
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-2 text-xs">
                    <span
                        className={`h-2 w-2 rounded-full ${isValidKey ? "bg-green-500" : "bg-legal-300"
                            }`}
                    />
                    <span className="text-legal-500">
                        {isValidKey ? "API Key 已配置" : "请输入 API Key"}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

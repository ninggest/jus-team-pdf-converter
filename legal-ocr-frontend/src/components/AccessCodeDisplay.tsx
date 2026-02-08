import { useState, useEffect } from "react";
import { Key, RefreshCw, Copy, Check, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";

interface AccessCodeDisplayProps {
    code: string;
    onCodeChange: (code: string) => void;
}

type TabMode = "myCode" | "retrieve";

export function AccessCodeDisplay({ code, onCodeChange }: AccessCodeDisplayProps) {
    const [activeTab, setActiveTab] = useState<TabMode>("myCode");
    const [isEditing, setIsEditing] = useState(false);
    const [tempCode, setTempCode] = useState(code);
    const [retrieveCode, setRetrieveCode] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setTempCode(code);
    }, [code]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = () => {
        if (tempCode.trim().length >= 4) {
            onCodeChange(tempCode.trim().toUpperCase());
            setIsEditing(false);
        }
    };

    const handleGenerateNew = () => {
        const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        onCodeChange(newCode);
        setIsEditing(false);
    };

    const handleRetrieve = () => {
        if (retrieveCode.trim().length >= 4) {
            onCodeChange(retrieveCode.trim().toUpperCase());
            setRetrieveCode("");
            setActiveTab("myCode"); // Switch back to show loaded tasks
        }
    };

    return (
        <Card className="mb-6 bg-blue-50 border-blue-200">
            {/* Tab Header */}
            <div className="flex border-b border-blue-200">
                <button
                    onClick={() => setActiveTab("myCode")}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === "myCode"
                            ? "text-blue-700 border-b-2 border-blue-600 bg-white"
                            : "text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                        }`}
                >
                    <Key className="h-4 w-4 inline mr-1.5" />
                    我的取件码
                </button>
                <button
                    onClick={() => setActiveTab("retrieve")}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === "retrieve"
                            ? "text-blue-700 border-b-2 border-blue-600 bg-white"
                            : "text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                        }`}
                >
                    <Search className="h-4 w-4 inline mr-1.5" />
                    取回任务
                </button>
            </div>

            <CardContent className="py-4">
                {activeTab === "myCode" ? (
                    /* My Code Tab */
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <p className="text-xs text-blue-700 mb-2">
                                请记住此代码以在其他设备上找回您的批量任务
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={tempCode}
                                        onChange={(e) => setTempCode(e.target.value.toUpperCase())}
                                        className="w-32 h-9 text-center font-mono uppercase"
                                        placeholder="CODE"
                                        maxLength={10}
                                    />
                                    <Button size="sm" onClick={handleSave}>保存</Button>
                                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>取消</Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <code className="bg-white px-3 py-1.5 rounded border border-blue-200 text-lg font-mono font-bold text-blue-800 tracking-wider">
                                        {code}
                                    </code>

                                    <Button variant="ghost" size="sm" onClick={handleCopy} title="复制">
                                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-blue-600" />}
                                    </Button>

                                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} title="修改取件码">
                                        <span className="text-xs text-blue-600 underline">修改</span>
                                    </Button>

                                    <Button variant="ghost" size="sm" onClick={handleGenerateNew} title="生成新码">
                                        <RefreshCw className="h-4 w-4 text-blue-600" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Retrieve Tab */
                    <div className="space-y-3">
                        <p className="text-sm text-blue-700">
                            输入您之前的取件码来恢复批量任务：
                        </p>
                        <div className="flex items-center gap-3">
                            <Input
                                value={retrieveCode}
                                onChange={(e) => setRetrieveCode(e.target.value.toUpperCase())}
                                className="flex-1 max-w-xs h-10 text-center font-mono uppercase text-lg tracking-wider"
                                placeholder="输入取件码..."
                                maxLength={10}
                                onKeyDown={(e) => e.key === "Enter" && handleRetrieve()}
                            />
                            <Button
                                onClick={handleRetrieve}
                                disabled={retrieveCode.trim().length < 4}
                                className="h-10"
                            >
                                <Search className="h-4 w-4 mr-1.5" />
                                取回
                            </Button>
                        </div>
                        <p className="text-xs text-blue-500">
                            提示：取件码至少 4 位字符
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export const CURRENT_VERSION = "4.0.0";

export interface ReleaseNote {
    version: string;
    date: string;
    features: string[];
    description?: string;
}

export const RELEASE_NOTES: ReleaseNote[] = [
    {
        version: "4.0.0",
        date: "2026-02-11",
        description: "本次更新带来了全新的文档校对体验，提升了操作效率。",
        features: [
            "对照校对模式：左侧 PDF 右侧 Markdown 分屏显示，逐字校对更精准。",
            "在线编辑功能：直接在预览窗口修改识别结果，修正后可直接下载。",
            "智能目录导航：自动生成文档目录 (TOC)，点击标题即可快速跳转。",
            "表格渲染增强：修复了 Markdown 表格显示问题，复杂表格还原度更高。"
        ]
    },
    {
        version: "3.8.0",
        date: "2026-02-10",
        description: "专注于 OCR 核心体验的优化与稳定性提升。",
        features: [
            "纯净 OCR 模式：移除不稳定的大模型润色功能，大幅提升响应速度。",
            "大文件支持：恢复 50MB 自动分割阈值，支持一次性上传更大文件。",
            "后台连接优化：消除超时中断问题，长文档处理更稳定。"
        ]
    }
];

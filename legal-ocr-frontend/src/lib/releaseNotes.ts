export const CURRENT_VERSION = "5.0.0";

export interface ReleaseNote {
    version: string;
    date: string;
    features: string[];
    description?: string;
}

export const RELEASE_NOTES: ReleaseNote[] = [
    {
        version: "5.0.0",
        date: "2026-02-12",
        description: "推出全新的法律文档脱敏工具，助力高效处理敏感信息。",
        features: [
            "智能脱敏工具：自动识别姓名、身份证号、手机号、银行卡号等 15+ 类敏感信息。",
            "交互式管理：支持分类查看、一键勾选或手动确认，确保脱敏准确无误。",
            "对照预览模式：脱敏结果与原件实时对比，支持差异化显示。",
            "双重导出：一键生成脱敏后的 Markdown 文档及法律合规所需的《脱敏对照报告》。"
        ]
    },
    {
        version: "4.0.0",
        date: "2026-02-11",
        description: "本次更新带来了全新的文档校对体验，提升了操作效率。",
        features: [
            "对照校对模式：新增分屏预览功能，支持左侧查看原始 PDF，右侧查看 OCR 结果。",
            "文档目录导航：自动生成文档目录 (TOC) 侧边栏，支持点击标题快速跳转。",
            "在线编辑：用户现可直接在预览窗口中编辑 OCR 结果，修改将同步保存。",
            "表格渲染增强：集成 remark-gfm 插件，修复了 Markdown 表格的显示问题。"
        ]
    },
    {
        version: "3.8.0",
        date: "2026-02-10",
        description: "专注于快速、稳定的高保真 OCR 转换。",
        features: [
            "纯净 OCR 模式：移除了“双引擎智能润色”功能，专注于保真度。",
            "后端轻量化：剔除了 Worker 中 LLM 相关服务，消除连接超时风险。",
            "阈值恢复：将 PDF 自动分割阈值恢复至 50MB。"
        ]
    },
    {
        version: "3.7.2",
        date: "2026-02-09",
        features: [
            "分割阈值优化：将 PDF 自动分割阈值从 50MB 降低至 20MB，提升常规模式下大文件场景的稳定性。"
        ]
    },
    {
        version: "3.7.0",
        date: "2026-02-08",
        description: "大模型引擎升级与长文忠实性优化。",
        features: [
            "大模型引擎升级：润色引擎从 ministral-3b 升级至 ministral-14b-2512。",
            "忠实性优化：实现智能文本分块处理，解决了长文处理中可能出现的省略问题。",
            "安全性增强：智能润色默认关闭，并增加明确风险提示。"
        ]
    },
    {
        version: "3.6.0",
        date: "2026-02-07",
        features: [
            "PDF 自动分割：针对 50MB+ 超大文件，前端自动拆分为多个部分处理，绕过 API 限制。"
        ]
    },
    {
        version: "3.5.1",
        date: "2026-02-06",
        features: [
            "纯净 Markdown 导出：自动检测并剥离 OCR 结果中出现的代码块包裹符（```markdown）。"
        ]
    },
    {
        version: "3.5.0",
        date: "2026-02-05",
        description: "强大的纯前端文件合并系统。",
        features: [
            "批量排序与合并：支持手动调整已完成任务顺序，并一键合并为单个文档。",
            "UI 架构迭代：模块化普通模式与异步模式多选逻辑。",
            "系统优化：优化合并队列状态管理，提升多任务并行流畅度。"
        ]
    },
    {
        version: "3.2.0",
        date: "2026-02-04",
        description: "双引擎架构方案，集成 LLM 深度协同。",
        features: [
            "双引擎架构：引入 ministral-3b-2512 作为二次处理引擎。",
            "智能润色开关：前端新增开关，支持自动修复格式并生成图片描述。",
            "法律语义识别：自动识别签字、盖章、身份证等元素并生成语义标签。",
            "排版优化：合并非正常断行，移除页眉页脚。"
        ]
    },
    {
        version: "3.0.0",
        date: "2026-02-03",
        description: "实时进度与任务历史持久化。",
        features: [
            "实时进度反馈：使用 XMLHttpRequest 监听上传，提供实时进度条。",
            "队列管理：支持手动移除单个文件或清空任务。",
            "历史持久化：深度集成取件码与本地存储，跨会话找回记录。"
        ]
    },
    {
        version: "2.3.0",
        date: "2026-02-02",
        features: [
            "稳健性增强：实现支持 Retry-After 的智能重试逻辑。",
            "类型安全升级：前后端 TypeScript 类型定义完全同步。",
            "错误反馈优化：细化错误提示，区分网络、频率限制及 API 错误。"
        ]
    },
    {
        version: "2.2.0",
        date: "2026-02-01",
        description: "后端架构重构与稳定性增强。",
        features: [
            "模块化架构：Worker 重构为 routes/services/utils 结构。",
            "统一 API 客户端：前端引入统一的 Mistral API 交互中心。",
            "传输优化：优化 FormData 构建，提升 30MB+ 文件上传成功率。"
        ]
    },
    {
        version: "2.1.0",
        date: "2026-01-30",
        features: [
            "Mistral 直传模式：前端直接上传至 Mistral API，绕过 Worker 内存限制。",
            "架构升级：Worker 接收 file_id 进行处理，提升稳定度。"
        ]
    },
    {
        version: "2.0.0",
        date: "2026-01-28",
        description: "异步处理系统与 UI 全面更新。",
        features: [
            "异步处理与取件码：引入持久化任务系统，支持 6 位取件码找回结果。",
            "UI 全面中文化：全界面中文语境优化。",
            "模式重命名：分为“常规模式”与“异步模式”。"
        ]
    },
    {
        version: "1.2.0",
        date: "2026-01-25",
        features: [
            "高性能上传：重构引擎从 Base64 转向 Signed URL 模式。",
            "大文件支持：适配 Mistral 50MB API 上限。",
            "内存优化：Worker 内存占用降低 90% 以上。"
        ]
    },
    {
        version: "1.1.0",
        date: "2026-01-20",
        features: [
            "隐私合规升级：新增详细数据安全公告。",
            "UI 体验优化：修复布局对齐，优化提示文案。"
        ]
    },
    {
        version: "1.0.0",
        date: "2026-01-15",
        description: "初始版本发布。",
        features: [
            "初始发布：建立完整前后端链路。",
            "批量任务引擎：支持多文件上传与状态同步。",
            "Jus Team 品牌化：集成全套视觉系统。"
        ]
    }
];

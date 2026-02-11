export interface RedactionRule {
    category: string;
    patterns: string[];
    replacement: string;
    useCaptureGroup?: boolean;
}

export const TYPE_NAMES: Record<string, string> = {
    id_card: "身份证号",
    organization: "组织机构",
    date: "日期",
    price: "金额",
    person_name: "人名",
    phone: "联系电话",
    email: "联系邮箱",
    credit_code: "代码-统一社会信用代码",
    bank_account: "账号",
    org_code: "代码-组织机构代码",
    patent_code: "代码-专利申请号",
    file_code: "代码-文件编号",
    case_number: "案号",
    project_name: "项目名称",
    address: "地址",
    blacklist: "敏感信息"
};

export const DEFAULT_RULES: RedactionRule[] = [
    {
        category: "email",
        patterns: ["[\\w\\-\\.]+@[\\w\\-]+(?:\\.[\\w\\-]+)+", "邮箱\\s*[：:]?\\s*([\\w\\-\\.]+@[\\w\\-]+(?:\\.[\\w\\-]+)+)"],
        replacement: "【邮箱${index}】",
        useCaptureGroup: true
    },
    {
        category: "id_card",
        patterns: ["[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[0-9Xx]"],
        replacement: "【身份证号${index}】"
    },
    {
        category: "organization",
        patterns: ["([\\u4e00-\\u9fa5]{2,20})(有限公司|股份公司|集团)", "([A-Za-z][A-Za-z0-9\\s&]{2,30})(?:Company|Co\\.|Corporation|Corp\\.|Ltd\\.|Limited|LLC|Inc\\.|GmbH|S\\.A\\.|S\\.A|Sp\\. z o\\.o\\.|K\\.K\\.)\\b", "([\\u4e00-\\u9fa5]{2,10})(?:有限责任公司|股份有限公司)"],
        replacement: "【公司${index}】"
    },
    {
        category: "date",
        patterns: ["\\d{4}\\s{0,2}年\\s{0,2}\\d{1,2}\\s{0,2}月\\s{0,2}\\d{1,2}\\s{0,2}日", "\\d{4}-\\d{1,2}-\\d{1,2}", "\\d{4}/\\d{1,2}/\\d{1,2}", "\\d{1,2}月\\d{1,2}日"],
        replacement: "【日期${index}】"
    },
    {
        category: "price",
        patterns: ["人民币\\s*(\\d+(?:,\\d{3})*(?:\\.\\d+)?)\\s*[元万元]", "￥\\s*(\\d+(?:,\\d{3})*(?:\\.\\d+)?)\\s*元", "\\d+(?:,\\d{3})*(?:\\.\\d+)?[万千万元]", "(?:人民币|￥)\\s*([壹贰叁肆伍陆柒捌玖零拾佰仟万亿千百十]+元整?)", "(?:人民币|￥)\\s*([壹贰叁肆伍陆柒捌玖零拾佰仟万亿千百十]+[角分])", "[壹贰叁肆伍陆柒捌玖零拾佰仟万亿千百十]+元整?", "[壹贰叁肆伍陆柒捌玖零拾佰仟万亿千百十]+[角分]", "(?:RMB|USD|CNY|HKD|JPY|EUR|GBP)\\s+(\\d+(?:,\\d{3})*(?:\\.\\d+)?)", "(\\d+(?:,\\d{3})*(?:\\.\\d+)?)\\s*[～\\-－至]\\s*(\\d+(?:,\\d{3})*(?:\\.\\d+)?)", "(?:RMB|USD|CNY|HKD|JPY|EUR|GBP)\\s+\\d+(?:,\\d{3})*(?:\\.\\d+)?\\s*[～\\-－至]\\s*(\\d+(?:,\\d{3})*(?:\\.\\d+)?)"],
        replacement: "【金额${index}】",
        useCaptureGroup: true
    },
    {
        category: "person_name",
        patterns: ["(?:甲方|乙方|丙方|丁方|戊方|己方|原告方|被告方|委托方|受托方|发包方|承包方|采购方|供应商|卖方|买方|出租方|承租方|转让方|受让方|投资方|被投资方|借款人|贷款人|保证人|抵押人|出质人|收款人|付款人|债务人|债权人|申请人|被申请人|法定代表人|联系人)\\s*[：:]\\s*([\\u4e00-\\u9fa5]{2,20})"],
        replacement: "【人员${index}】",
        useCaptureGroup: true
    },
    {
        category: "phone",
        patterns: ["联系电话\\s*[：:]\\s*(1[3-9]\\d{9})", "联系电话\\s*[：:]\\s*(0\\d{2,3}-?\\d{7,8})", "联系电话\\s*[：:]\\s*\\((0\\d{2,3})\\)\\d{7,8}", "电话\\s*[：:]\\s*(1[3-9]\\d{9})", "电话\\s*[：:]\\s*(0\\d{2,3}-?\\d{7,8})", "手机\\s*[：:]\\s*(1[3-9]\\d{9})"],
        replacement: "【电话${index}】",
        useCaptureGroup: true
    },
    {
        category: "credit_code",
        patterns: ["统一社会信用代码\\s*[：:]\\s*([0-9A-HJ-NPQRTUWXY]{15,18})", "统一社会信用代码\\s*[：:]\\s*([0-9a-hj-npqrtuwxy]{15,18})"],
        replacement: "【代码-统一社会信用代码${index}】",
        useCaptureGroup: true
    },
    {
        category: "bank_account",
        patterns: ["账号\\s*[：:]\\s*(\\d{16,19})", "银行账号\\s*[：:]\\s*(\\d{16,19})", "账户\\s*[：:]\\s*(\\d{16,19})", "\\d{4}\\s+\\d{4}\\s+\\d{4}\\s+\\d{4}(?:\\s+\\d{4})?"],
        replacement: "【账号${index}】",
        useCaptureGroup: true
    },
    {
        category: "org_code",
        patterns: ["组织机构代码\\s*[：:]\\s*(\\d{8}-?[0-9X])"],
        replacement: "【代码-组织机构代码${index}】",
        useCaptureGroup: true
    },
    {
        category: "patent_code",
        patterns: ["(?:专利|商标|著作权)申请号\\s*[：:]\\s*([A-Z0-9\\.]+)", "(?:JP|US|EP|CN|WO|KR|GB|DE|FR|CA|AU)(?:\\d{4,}|\\d{4}/\\d{6})[A-Z]\\d?", "[A-Z]{2}\\d{6,}[A-Z]{0,2}\\d?"],
        replacement: "【代码-专利申请号${index}】",
        useCaptureGroup: true
    },
    {
        category: "file_code",
        patterns: ["合同编号\\s*[：:]\\s*([A-Z0-9\\-]+)", "文件编号\\s*[：:]\\s*([A-Z0-9\\-]+)", "文件号\\s*[：:]\\s*([A-Z0-9\\-]+)"],
        replacement: "【代码-文件编号${index}】",
        useCaptureGroup: true
    },
    {
        category: "case_number",
        patterns: ["([（(]\\d{4}[)）][^民刑行知赔]{1,6}?(?:民|刑|行|知|赔)[^初终再监执字第]{0,5}?\\d+[号])(?:[，。、,;．.？])?", "(\\(\\d{4}\\)[^\"]{2,8}?\\d+号)(?:[，。、,;．.？])?", "(（\\d{4}）[^\"]{2,8}?\\d+号)(?:[，。、,;．.？])?", "(\\d{4}年（[A-Z]{1,5}）第\\d+号)(?:[，。、,;．.？])?", "(Case No\\.(?:\\s+[\\d:]+-cv-)?\\d+)(?:[，。、,;．.？])?", "((?:Civil Action) No\\.\\s+[\\d:]+-cv-\\d+)(?:[，。、,;．.？])?", "(\\[\\d{4}\\]\\s+[A-Z]{1,4}\\s+\\d+\\s+\\([A-Z]+\\))(?:[，。、,;．.？])?", "(Az\\.:\\s+\\d+[A-Z]?\\s+\\d+/\\d{2,4})(?:[，。、,;．.？])?", "(RG\\s+\\d+/\\d+)(?:[，。、,;．.？])?"],
        replacement: "【案号${index}】",
        useCaptureGroup: true
    },
    {
        category: "project_name",
        patterns: ["([\\u4e00-\\u9fa5]{2,10})(项目|工程|系统|平台|计划)", "([\\u4e00-\\u9fa5]{2,10})(研发|建设|实施)项目"],
        replacement: "【项目${index}】"
    },
    {
        category: "address",
        patterns: ["(?:地址|住所|住址|注册地址|办公地址|住所地)\\s*[：:]\\s*([\\u4e00-\\u9fa5\\w\\d\\u3000]+)", "([\\u4e00-\\u9fa5]{2,4}市[\\u4e00-\\u9fa5]{1,4}区[\\u4e00-\\u9fa5\\d]+(?:路|街|道|大道)(?:\\d+|[\\u4e00-\\u9fa5]+)楼\\d{1,4}-\\d{1,4})"],
        replacement: "【地址${index}】",
        useCaptureGroup: true
    }
];

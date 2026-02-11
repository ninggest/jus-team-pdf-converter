import { DEFAULT_RULES, type RedactionRule } from "./redactionRules";

export interface RedactionMatch {
    id: string;
    category: string;
    original: string;
    startIndex: number;
    endIndex: number;
    replacement: string;
    isSelected: boolean;
}

export function identifyRedactions(text: string, rules: RedactionRule[] = DEFAULT_RULES): RedactionMatch[] {
    const matches: RedactionMatch[] = [];
    const typeCounters: Record<string, number> = {};
    const textToReplacementMap: Record<string, string> = {}; // category:original -> replacement

    for (const rule of rules) {
        for (const pattern of rule.patterns) {
            const regex = new RegExp(pattern, 'g');
            let match;
            while ((match = regex.exec(text)) !== null) {
                const original = (rule.useCaptureGroup && match[1]) ? match[1] : match[0];
                const startIndex = (rule.useCaptureGroup && match[1]) ? match.index + match[0].indexOf(match[1]) : match.index;
                const endIndex = startIndex + original.length;

                // Simple overlap check
                const isOverlapping = matches.some(m =>
                    (startIndex >= m.startIndex && startIndex < m.endIndex) ||
                    (endIndex > m.startIndex && endIndex <= m.endIndex)
                );

                if (!isOverlapping) {
                    const mapKey = `${rule.category}:${original}`;
                    let replacement = textToReplacementMap[mapKey];

                    if (!replacement) {
                        typeCounters[rule.category] = (typeCounters[rule.category] || 0) + 1;
                        const index = typeCounters[rule.category];
                        replacement = rule.replacement.replace('${index}', index.toString());
                        textToReplacementMap[mapKey] = replacement;
                    }

                    matches.push({
                        id: `${rule.category}-${startIndex}`, // Use startIndex for uniqueness
                        category: rule.category,
                        original,
                        startIndex,
                        endIndex,
                        replacement,
                        isSelected: true
                    });
                }
            }
        }
    }

    // Sort by start index
    return matches.sort((a, b) => a.startIndex - b.startIndex);
}

export function applyRedactions(text: string, matches: RedactionMatch[]): string {
    let result = text;
    // Apply from back to front to avoid index shifts
    const sortedMatches = [...matches].filter(m => m.isSelected).sort((a, b) => b.startIndex - a.startIndex);

    for (const match of sortedMatches) {
        result = result.substring(0, match.startIndex) + match.replacement + result.substring(match.endIndex);
    }

    return result;
}

export function generateComparisonMarkdown(matches: RedactionMatch[]): string {
    let md = "# 脱敏替换比对表\n\n";
    md += "| 类型 | 原文内容 | 脱敏标记 |\n";
    md += "| --- | --- | --- |\n";

    matches.filter(m => m.isSelected).forEach(m => {
        md += `| ${m.category} | ${m.original} | ${m.replacement} |\n`;
    });

    return md;
}

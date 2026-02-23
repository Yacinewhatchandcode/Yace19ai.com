// ═══════════════════════════════════════════════════════════════
// PRIME AI — Industry Theme System Types
// ═══════════════════════════════════════════════════════════════

export interface DataField {
    key: string;
    label: string;
    labelFr: string;
    type: "text" | "textarea" | "number" | "select" | "list" | "hours";
    placeholder?: string;
    required?: boolean;
    options?: string[];
    group: "business" | "services" | "brand" | "advanced";
}

export interface QuickAction {
    id: string;
    label: string;
    labelFr: string;
    icon: string;
    promptTemplate: string; // uses {{businessName}}, {{services}}, etc.
    category: "content" | "communication" | "analysis" | "document";
}

export interface ContentTemplate {
    id: string;
    name: string;
    nameFr: string;
    category: "social" | "email" | "document" | "marketing" | "internal";
    promptTemplate: string;
    icon: string;
}

export interface AgentConfig {
    id: string;
    name: string;
    nameFr: string;
    role: string;
    icon: string;
    systemPrompt: string;
}

export interface ThemeConfig {
    id: string;
    name: string;
    nameFr: string;
    icon: string;
    emoji: string;
    tagline: string;
    taglineFr: string;
    description: string;
    descriptionFr: string;

    // Visual
    colorPrimary: string;
    colorSecondary: string;
    colorAccent: string;
    gradientFrom: string;
    gradientTo: string;

    // AI
    systemPrompt: string;
    systemPromptFr: string;

    // Configuration
    dataFields: DataField[];
    quickActions: QuickAction[];
    contentTemplates: ContentTemplate[];
    agents: AgentConfig[];

    // Meta
    phase: 1 | 2 | 3 | 4;
    category: string;
    keywords: string[];
    targetAudience: string;

    // Sample data for preview
    sampleData: Record<string, string>;
}

export interface UserThemeData {
    themeId: string;
    businessData: Record<string, string>;
    createdAt: string;
    updatedAt: string;
}

// Helper to inject user data into a prompt template
export function injectData(template: string, data: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
        result = result.replaceAll(`{{${key}}}`, value || "");
    }
    return result;
}

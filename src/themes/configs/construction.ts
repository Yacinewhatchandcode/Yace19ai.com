import type { ThemeConfig } from "../types";

const constructionTheme: ThemeConfig = {
    id: "construction",
    name: "Construction",
    nameFr: "Construction & BTP",
    icon: "🔨",
    emoji: "🔨",
    tagline: "Build efficiently with AI",
    taglineFr: "Construisez efficacement avec l'IA",
    description: "AI tailored for contractors, builders, and tradesmen. Automate quotes, draft project updates, organize safety protocols, and streamline communication with suppliers.",
    descriptionFr: "IA adaptée aux entrepreneurs, constructeurs et artisans. Automatisez vos devis, rédigez des suivis de chantier, organisez les protocoles de sécurité et facilitez les échanges avec vos fournisseurs.",

    colorPrimary: "#ca8a04", // Yellow-600
    colorSecondary: "#475569", // Slate-600
    colorAccent: "#eab308", // Yellow-500
    gradientFrom: "from-yellow-900/20",
    gradientTo: "to-slate-900/10",

    systemPrompt: `You are a practical, professional AI assistant for {{businessName}}, a construction/contracting firm.
Owner/Foreman: {{ownerName}}.
Expertise: {{expertise}}.
Communication style: {{brandVoice}}.

You assist with:
- Drafting accurate, professional estimates and quotes
- Writing project status updates for clients
- Creating material requisition emails for suppliers
- Formatting safety protocols and compliance documents
Be clear, concise, and highly professional.`,

    systemPromptFr: `Vous êtes un assistant IA pratique et pro pour {{businessName}}, une entreprise de construction/BTP.
Chef d'entreprise: {{ownerName}}.
Expertise: {{expertise}}.
Ton: {{brandVoice}}.`,

    dataFields: [
        { key: "businessName", label: "Company Name", labelFr: "Nom de l'entreprise", type: "text", placeholder: "e.g. BuildRight Bros", required: true, group: "business" },
        { key: "ownerName", label: "Owner/Foreman", labelFr: "Dirigeant", type: "text", placeholder: "e.g. Marc Dubois", required: true, group: "business" },
        { key: "expertise", label: "Expertise", labelFr: "Expertise", type: "textarea", placeholder: "Residential renovations, plumbing, electrical...", required: true, group: "services" },
        { key: "brandVoice", label: "Communication Style", labelFr: "Style de communication", type: "select", options: ["Professional & Direct", "Friendly & Reliable", "Technical & Precise"], group: "brand" },
    ],

    quickActions: [
        { id: "draft-quote", label: "Draft Project Quote", labelFr: "Rédiger un devis", icon: "📋", promptTemplate: "Draft a formal email accompanying a quote for a [Project Type] project. Highlight our commitment to quality and mention that the attached quote is valid for 30 days.", category: "communication" },
        { id: "site-update", label: "Site Progress Update", labelFr: "Point d'étape chantier", icon: "🏗️", promptTemplate: "Write a short weekly progress update email to a client explaining that [Completed Tasks] are done, and next week we will focus on [Upcoming Tasks]. Keep it {{brandVoice}}.", category: "communication" },
    ],

    contentTemplates: [
        { id: "safety-memo", name: "Safety Protocol Memo", nameFr: "Mémo de sécurité", category: "internal", icon: "⚠️", promptTemplate: "Draft an internal memo reminding the crew about standard safety protocols regarding [Specific Hazard]. Keep it strict but understandable." },
    ],

    agents: [
        { id: "project-coordinator", name: "Project Coordinator", nameFr: "Coordinateur projet", role: "Draft client updates and supplier emails", icon: "👷", systemPrompt: "You are a highly organized construction project coordinator." },
    ],

    phase: 2,
    category: "Construction & Trade",
    keywords: ["construction", "builder", "contractor", "btp", "artisan", "rénovation"],
    targetAudience: "General contractors, specialized trades (plumbing, electrical), remodeling companies",

    sampleData: {
        businessName: "Bâti-Pro Rénovations",
        ownerName: "Thomas Martin",
        expertise: "Rénovation globale, Isolation, Charpente",
        brandVoice: "Professional & Direct",
    },
};

export default constructionTheme;

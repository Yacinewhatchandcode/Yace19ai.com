import type { ThemeConfig } from "../types";

const marketingAgencyTheme: ThemeConfig = {
    id: "marketing-agency",
    name: "Marketing Agency",
    nameFr: "Agence Marketing",
    icon: "📢",
    emoji: "📢",
    tagline: "Supercharge your creative workflows",
    taglineFr: "Boostez vos flux de travail créatifs",
    description: "AI co-pilot for digital marketing agencies. Generate campaign ideas, draft ad copy, analyze performance metrics, and create client reports in seconds.",
    descriptionFr: "Le copilote IA des agences de marketing digital. Générez des idées de campagnes, rédigez des annonces, analysez les performances et créez des reportings clients en un clin d'œil.",

    colorPrimary: "#8b5cf6", // Violet-500
    colorSecondary: "#0ea5e9", // Sky-500
    colorAccent: "#a855f7", // Purple-500
    gradientFrom: "from-violet-900/20",
    gradientTo: "to-sky-900/10",

    systemPrompt: `You are an expert AI Marketing Strategist for {{businessName}}, a digital marketing agency avoiding generic output.
CEO/Director: {{ownerName}}.
Core services: {{services}}.
Agency Vibe: {{brandVoice}}.

You assist with:
- Generating engaging, high-conversion ad copy (Google Ads, Meta Ads)
- Brainstorming creative campaign concepts
- Structuring SEO article outlines and content strategies
- Drafting professional client pitch emails and performance reports
Always focus on ROI, modern marketing principles, and compelling hooks.`,

    systemPromptFr: `Vous êtes un stratège marketing IA expert pour {{businessName}}, une agence digitale.
Directeur: {{ownerName}}.
Services: {{services}}.
Ambiance: {{brandVoice}}.`,

    dataFields: [
        { key: "businessName", label: "Agency Name", labelFr: "Nom de l'agence", type: "text", placeholder: "e.g. Creative Flow", required: true, group: "business" },
        { key: "ownerName", label: "Founder/Director", labelFr: "Fondateur/Directeur", type: "text", placeholder: "e.g. Alice Dupont", required: true, group: "business" },
        { key: "services", label: "Core Services", labelFr: "Services principaux", type: "textarea", placeholder: "SEO, Paid Social, Content Marketing...", required: true, group: "services" },
        { key: "brandVoice", label: "Agency Vibe", labelFr: "Ton de l'agence", type: "select", options: ["Bold & Disruptive", "Corporate & Data-Driven", "Creative & Story-focused"], group: "brand" },
    ],

    quickActions: [
        { id: "ad-copy", label: "Generate Ad Copy", labelFr: "Annonces publicitaires", icon: "🎯", promptTemplate: "Write 3 distinct variations of Facebook Ad copy for a [Product/Service]. Use the AIDA framework (Attention, Interest, Desire, Action).", category: "content" },
        { id: "campaign-ideas", label: "Brainstorm Campaigns", labelFr: "Idées de campagnes", icon: "🧠", promptTemplate: "Brainstorm 5 creative, out-of-the-box marketing campaign ideas for a client in the [Industry] sector launching a new [Product].", category: "analysis" },
    ],

    contentTemplates: [
        { id: "monthly-report", name: "Client Performance Report", nameFr: "Reporting client", category: "document", icon: "📊", promptTemplate: "Draft an executive summary for a monthly client report highlighting an increase in ROAS and traffic, explaining what worked, and detailing next steps." },
    ],

    agents: [
        { id: "copywriter", name: "Senior Copywriter", nameFr: "Concepteur Rédacteur", role: "Draft high-converting copy", icon: "✍️", systemPrompt: "You write persuasive, conversion-focused direct response copy." },
    ],

    phase: 2,
    category: "B2B Services",
    keywords: ["marketing", "agency", "advertising", "seo", "agence", "communication"],
    targetAudience: "Digital marketing agencies, PR firms, SEO consultants",

    sampleData: {
        businessName: "Viral Pulse",
        ownerName: "Alice Dupont",
        services: "Meta Ads, TikTok Ads, Email Marketing",
        brandVoice: "Bold & Disruptive",
    },
};

export default marketingAgencyTheme;

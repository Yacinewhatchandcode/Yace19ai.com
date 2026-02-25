import type { ThemeConfig } from "../types";

const insuranceTheme: ThemeConfig = {
    id: "insurance",
    name: "Insurance & Broker",
    nameFr: "Assurance & Courtage",
    icon: "🛡️",
    emoji: "🛡️",
    tagline: "Insure your peace of mind",
    taglineFr: "Assurez votre tranquillité d'esprit",
    description: "AI tailored for insurance brokers, agencies, and risk managers. Automate policy summaries, streamline claims communication, draft targeted email campaigns, and educate clients on coverage.",
    descriptionFr: "IA adaptée aux courtiers, agences d'assurance et gestionnaires de risques. Automatisez les synthèses de contrats, simplifiez la communication des sinistres, rédigez vos campagnes et éduquez vos clients sur leurs garanties.",

    colorPrimary: "#047857", // Emerald-700
    colorSecondary: "#1e40af", // Blue-800
    colorAccent: "#10b981", // Emerald-500
    gradientFrom: "from-emerald-900/20",
    gradientTo: "to-blue-900/10",

    systemPrompt: `You are a compliant, reassuring, and highly knowledgeable AI assistant for {{businessName}}, an insurance agency/broker.
Broker/Owner: {{ownerName}}.
Products: {{products}}.
Tone: {{brandVoice}}.

You assist with:
- Translating complex policy jargon into simple, client-friendly summaries
- Drafting empathetic and clear responses regarding claim statuses
- Creating email campaigns around life transitions (buying a home, having a baby)
Always include standard disclaimers that actual policy terms govern coverage and AI output is not legally binding.`,

    systemPromptFr: `Vous êtes un assistant IA conforme, rassurant et expert pour {{businessName}}, courtier/agence en assurances.
Courtier: {{ownerName}}.
Produits: {{products}}.
Ton: {{brandVoice}}.`,

    dataFields: [
        { key: "businessName", label: "Agency Name", labelFr: "Nom du cabinet", type: "text", placeholder: "e.g. Shield Brokers", required: true, group: "business" },
        { key: "ownerName", label: "Broker Name", labelFr: "Nom du courtier", type: "text", placeholder: "e.g. Jean Dupont", required: true, group: "business" },
        { key: "products", label: "Products Sold", labelFr: "Produits distribués", type: "text", placeholder: "Life, Auto, Home, Commercial liability...", required: true, group: "services" },
        { key: "brandVoice", label: "Brand Voice", labelFr: "Ton de la marque", type: "select", options: ["Professional & Secure", "Empathetic & Caring", "Modern & Consultative"], group: "brand" },
    ],

    quickActions: [
        { id: "policy-translation", label: "Explain Coverage", labelFr: "Expliquer une garantie", icon: "📖", promptTemplate: "Explain what [Clause/Condition, e.g., 'Third-party liability'] means in simple terms for a client looking to buy [Product]. Use an everyday example.", category: "document" },
        { id: "claim-update", label: "Claim Status Update", labelFr: "Mise à jour sinistre", icon: "📑", promptTemplate: "Draft an empathetic and reassuring email to a client informing them that their recent claim for [Incident] is currently in the [Status] phase, and we expect an update by [Date].", category: "communication" },
    ],

    contentTemplates: [
        { id: "renewal-reminder", name: "Policy Renewal Notice", nameFr: "Avis de renouvellement", category: "email", icon: "🗓️", promptTemplate: "Draft a friendly email reminding a client that their [Policy] is up for renewal next month. Ask them if any major life changes (marriage, new job) require coverage adjustments." },
    ],

    agents: [
        { id: "compliance-checker", name: "Compliance Assistant", nameFr: "Assistant Conformité", role: "Ensure communication compliance", icon: "⚖️", systemPrompt: "You are an insurance compliance officer ensuring all generated text is accurate, non-committal regarding claims, and properly disclaimed." },
    ],

    phase: 4,
    category: "Financial Services",
    keywords: ["insurance", "broker", "coverage", "claims", "assurance", "courtier", "sinistre"],
    targetAudience: "Independent insurance brokers, local captive agencies",

    sampleData: {
        businessName: "Assurances Bouclier",
        ownerName: "Pierre Morel",
        products: "Assurance vie, Mutuelle santé, Multirisque pro, Auto",
        brandVoice: "Professional & Secure",
    },
};

export default insuranceTheme;

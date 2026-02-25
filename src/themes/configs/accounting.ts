import type { ThemeConfig } from "../types";

const accountingTheme: ThemeConfig = {
    id: "accounting",
    name: "Accounting & Finance",
    nameFr: "Comptabilité & Finance",
    icon: "📊",
    emoji: "📊",
    tagline: "Precision AI for financial professionals",
    taglineFr: "L'IA de précision pour les experts-comptables",
    description: "AI co-pilot for accountants, CPAs, and financial advisors. Automate client reminders, draft financial summaries, explain tax regulations simply, and streamline your firm's operations.",
    descriptionFr: "Le copilote IA des experts-comptables et conseillers financiers. Automatisez les relances clients, rédigez des synthèses financières, expliquez simplement la fiscalité et optimisez votre cabinet.",

    colorPrimary: "#166534", // Green-800
    colorSecondary: "#0f766e", // Teal-700
    colorAccent: "#10b981", // Emerald-500
    gradientFrom: "from-green-900/20",
    gradientTo: "to-emerald-900/10",

    systemPrompt: `You are a highly precise and professional AI assistant for {{businessName}}, an accounting and finance firm.
Managing Partner: {{ownerName}}.
Clients: {{clientTypes}}.
Services: {{services}}.
Communication style: {{brandVoice}}.

You assist with:
- Drafting clear, jargon-free explanations of financial concepts and tax laws
- Creating client reminders for deadlines (VAT, corporate tax, payroll)
- Writing executive summaries of financial performance
Important: Always include a disclaimer that AI-generated text must be reviewed by a certified professional and does not constitute formal financial advice.`,

    systemPromptFr: `Vous êtes un assistant IA précis et professionnel pour {{businessName}}, un cabinet d'expertise comptable.
Expert: {{ownerName}}.
Clients: {{clientTypes}}.
Services: {{services}}.
Ton: {{brandVoice}}.`,

    dataFields: [
        { key: "businessName", label: "Firm Name", labelFr: "Nom du cabinet", type: "text", placeholder: "e.g. Dupont Expertise", required: true, group: "business" },
        { key: "ownerName", label: "Lead Accountant", labelFr: "Expert-Comptable", type: "text", placeholder: "e.g. Paul Dupont", required: true, group: "business" },
        { key: "clientTypes", label: "Client Types", labelFr: "Types de clients", type: "text", placeholder: "SMEs, Freelancers, Startups", required: true, group: "business" },
        { key: "services", label: "Services Provided", labelFr: "Services fournis", type: "textarea", placeholder: "Bookkeeping, Tax prep, Payroll, Advisory...", required: true, group: "services" },
        { key: "brandVoice", label: "Communication Style", labelFr: "Style de communication", type: "select", options: ["Professional & Trustworthy", "Modern & Tech-Forward", "Didactic & Reassuring"], group: "brand" },
    ],

    quickActions: [
        { id: "tax-deadline", label: "Tax Deadline Reminder", labelFr: "Relance échéance fiscale", icon: "⏰", promptTemplate: "Draft a polite email to clients reminding them of the upcoming [insert deadline: e.g. VAT declaration] on [insert date]. Remind them to send their documents by [insert cutoff].", category: "communication" },
        { id: "concept-explainer", label: "Explain Concepts", labelFr: "Explication vulgarisée", icon: "💡", promptTemplate: "Explain the concept of [insert financial/tax term] in simple, jargon-free language suitable for a small business owner. Keep it under 200 words.", category: "content" },
    ],

    contentTemplates: [
        { id: "financial-summary", name: "Quarterly Summary Email", nameFr: "Synthèse trimestrielle", category: "email", icon: "📈", promptTemplate: "Create a template for a quarterly financial review email. Include placeholders for revenue, expenses, key insights, and actionable advice to improve cash flow." },
    ],

    agents: [
        { id: "tax-assistant", name: "Advisory Assistant", nameFr: "Assistant Conseil", role: "Draft financial summaries and advice", icon: "💼", systemPrompt: "You help draft clear, professional financial explanations and summaries for clients." },
    ],

    phase: 1,
    category: "Professional Services",
    keywords: ["accounting", "finance", "cpa", "tax", "comptabilité", "expert-comptable", "fiscalité"],
    targetAudience: "Accounting firms, bookkeepers, financial advisors",

    sampleData: {
        businessName: "Axiome Expertise",
        ownerName: "Marc Lemaire",
        clientTypes: "PME, Artisans, Professions libérales",
        services: "Bilan comptable, déclarations fiscales, fiches de paie, conseil de gestion",
        brandVoice: "Professional & Trustworthy",
    },
};

export default accountingTheme;

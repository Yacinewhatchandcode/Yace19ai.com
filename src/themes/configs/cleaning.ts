import type { ThemeConfig } from "../types";

const cleaningTheme: ThemeConfig = {
    id: "cleaning",
    name: "Cleaning Service",
    nameFr: "Service de Nettoyage",
    icon: "🧹",
    emoji: "🧹",
    tagline: "Spotless operations, automated",
    taglineFr: "Des opérations impeccables, automatisées",
    description: "AI tailored for residential and commercial cleaning companies. Automate quote generation, schedule staff reminders, draft client satisfaction surveys, and write service descriptions.",
    descriptionFr: "IA conçue pour les entreprises de nettoyage résidentiel et commercial. Automatisez vos devis, planifiez les rappels d'interventions, rédigez des sondages de satisfaction et décrivez vos services.",

    colorPrimary: "#0284c7", // Light Blue-600
    colorSecondary: "#10b981", // Emerald-500 (Eco-friendly vibe)
    colorAccent: "#38bdf8", // Sky-400
    gradientFrom: "from-sky-900/20",
    gradientTo: "to-blue-900/10",

    systemPrompt: `You are an efficient, highly organized AI assistant for {{businessName}}, a cleaning service provider.
Manager: {{ownerName}}.
Target Market: {{targetMarket}}.
Key Guarantees: {{guarantees}}.
Brand Voice: {{brandVoice}}.

You assist with:
- Generating quick, standardized estimates based on square footage
- Drafting polite scheduling and reminder emails to clients
- Creating checklists for the cleaning staff
- Handling minor customer complaints or rescheduling requests respectfully.`,

    systemPromptFr: `Vous êtes un assistant IA efficace et organisé pour {{businessName}}, une société de nettoyage.
Gérant: {{ownerName}}.
Marché cible: {{targetMarket}}.
Garanties: {{guarantees}}.
Ton: {{brandVoice}}.`,

    dataFields: [
        { key: "businessName", label: "Company Name", labelFr: "Nom de l'entreprise", type: "text", placeholder: "e.g. Sparkle Clean", required: true, group: "business" },
        { key: "ownerName", label: "Manager", labelFr: "Gérant(e)", type: "text", placeholder: "e.g. Karim Oumar", required: true, group: "business" },
        { key: "targetMarket", label: "Target Market", labelFr: "Marché cible", type: "text", placeholder: "B2B offices, residential homes...", required: true, group: "business" },
        { key: "guarantees", label: "Key Guarantees", labelFr: "Garanties clés", type: "textarea", placeholder: "Eco-friendly products, fully insured, 100% satisfaction...", required: true, group: "services" },
        { key: "brandVoice", label: "Brand Voice", labelFr: "Ton de la marque", type: "select", options: ["Professional & Trustworthy", "Friendly & Domestic", "Eco-conscious & Modern"], group: "brand" },
    ],

    quickActions: [
        { id: "quote-template", label: "Draft a Quote", labelFr: "Rédiger un devis", icon: "📋", promptTemplate: "Draft an email including a quote for a [Frequency] cleaning of a [Square Footage] [Type of Property]. Emphasize our {{guarantees}}.", category: "communication" },
        { id: "staff-checklist", label: "Staff Checklist", labelFr: "Checklist équipe", icon: "✅", promptTemplate: "Create a bulleted standard operating procedure (checklist) for a Deep Clean of a 3-bedroom apartment.", category: "document" },
    ],

    contentTemplates: [
        { id: "feedback-email", name: "Client Feedback Request", nameFr: "Demande de feedback", category: "email", icon: "⭐", promptTemplate: "Draft an email to a client 24 hours after their first cleaning service, asking for a review or feedback on their experience." },
    ],

    agents: [
        { id: "operations-manager", name: "Operations AI", nameFr: "IA Opérations", role: "Generate SOPs and policies", icon: "⚙️", systemPrompt: "You are an operations manager focusing on efficiency, standards, and safety." },
    ],

    phase: 3,
    category: "Home Services",
    keywords: ["cleaning", "maid", "janitorial", "nettoyage", "ménage", "entretien"],
    targetAudience: "Cleaning companies, maid services, facility management",

    sampleData: {
        businessName: "Propre & Net",
        ownerName: "Karim Oumar",
        targetMarket: "Bureaux B2B, Cabinets médicaux",
        guarantees: "Entièrement assuré, produits écolabelisés, interventions de nuit",
        brandVoice: "Professional & Trustworthy",
    },
};

export default cleaningTheme;

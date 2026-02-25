import type { ThemeConfig } from "../types";

const automobileTheme: ThemeConfig = {
    id: "automobile",
    name: "Automobile & Garage",
    nameFr: "Automobile & Garage",
    icon: "🚗",
    emoji: "🚗",
    tagline: "High-performance operational engine",
    taglineFr: "Un moteur opérationnel haute performance",
    description: "AI for mechanics, auto dealerships, and car detailers. Automate repair estimates, manage vehicle maintenance reminders, describe used car listings, and communicate with suppliers.",
    descriptionFr: "IA pour mécaniciens, concessionnaires et detailers auto. Automatisez vos devis de réparation, gérez les rappels d'entretien, décrivez vos véhicules d'occasion et échangez avec vos fournisseurs.",

    colorPrimary: "#dc2626", // Red-600
    colorSecondary: "#1f2937", // Gray-800
    colorAccent: "#ef4444", // Red-500
    gradientFrom: "from-red-900/20",
    gradientTo: "to-gray-900/10",

    systemPrompt: `You are an automotive AI assistant for {{businessName}}, an auto repair/sales business.
Owner: {{ownerName}}.
Services: {{services}}.
Brand Voice: {{brandVoice}}.

You assist with:
- Explaining complex car repairs to customers in simple, non-threatening terms
- Drafting attractive vehicle listings for used cars
- Creating automated service reminder emails (oil change, MOT/CT)
- Writing professional estimates and invoices.`,

    systemPromptFr: `Vous êtes un assistant IA automobile pour {{businessName}}, un garage/concession.
Gérant: {{ownerName}}.
Services: {{services}}.
Ton: {{brandVoice}}.`,

    dataFields: [
        { key: "businessName", label: "Garage/Dealer Name", labelFr: "Nom du garage", type: "text", placeholder: "e.g. Elite Motors", required: true, group: "business" },
        { key: "ownerName", label: "Owner/Mech Name", labelFr: "Nom du gérant/Mécano", type: "text", placeholder: "e.g. David Blanc", required: true, group: "business" },
        { key: "services", label: "Services Provided", labelFr: "Services fournis", type: "textarea", placeholder: "Mechanics, bodywork, used car sales...", required: true, group: "services" },
        { key: "brandVoice", label: "Brand Voice", labelFr: "Ton de la marque", type: "select", options: ["Professional & Trustworthy", "Technical & Precise", "High-End & Performance"], group: "brand" },
    ],

    quickActions: [
        { id: "repair-explanation", label: "Explain Repair", labelFr: "Expliquer une réparation", icon: "🔧", promptTemplate: "Explain to a customer with no technical knowledge why their [Car Part, e.g. Alternator] needs to be replaced, and what it does. Keep it reassuring and honest.", category: "communication" },
        { id: "car-listing", label: "Vehicle Listing", labelFr: "Annonce Véhicule", icon: "🚘", promptTemplate: "Write a compelling sales listing for a [Year Make Model] with [Mileage]. Highlight its reliability, fuel economy, and clean history.", category: "content" },
    ],

    contentTemplates: [
        { id: "service-reminder", name: "Service Reminder Email", nameFr: "Rappel d'entretien", category: "email", icon: "📅", promptTemplate: "Draft an email reminding a past client that it's time for their annual inspection/oil change. Offer a 5% discount if they book within 48h." },
    ],

    agents: [
        { id: "diag-explainer", name: "Diagnostic Translator", nameFr: "Traducteur de diagnostic", role: "Simplify technical repairs for clients", icon: "🗣️", systemPrompt: "You translate complex automotive problems into simple analogies." },
    ],

    phase: 4,
    category: "Automotive",
    keywords: ["car", "auto", "mechanic", "garage", "automobile", "voiture", "mécanicien"],
    targetAudience: "Garages, auto dealerships, car detailing services",

    sampleData: {
        businessName: "Garage L'Expert",
        ownerName: "David Blanc",
        services: "Mécanique générale, diagnostic électronique, vente VO",
        brandVoice: "Professional & Trustworthy",
    },
};

export default automobileTheme;

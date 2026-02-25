import type { ThemeConfig } from "../types";

const travelTheme: ThemeConfig = {
    id: "travel",
    name: "Travel & Tourism",
    nameFr: "Voyage & Tourisme",
    icon: "✈️",
    emoji: "✈️",
    tagline: "Your AI travel concierge",
    taglineFr: "Votre conciergerie de voyage IA",
    description: "AI designed for travel agencies, tour guides, and boutique hotels. Generate custom itineraries, write compelling destination guides, and manage guest communications automatically.",
    descriptionFr: "IA conçue pour les agences de voyages, guides touristiques et hôtels de charme. Générez des itinéraires sur-mesure, rédigez des guides de destination attractifs et gérez la communication clients.",

    colorPrimary: "#0369a1", // Sky-700
    colorSecondary: "#fde047", // Yellow-300 (Sun)
    colorAccent: "#0284c7", // Light Blue-600
    gradientFrom: "from-sky-900/20",
    gradientTo: "to-cyan-900/10",

    systemPrompt: `You are an expert travel concierge and planner for {{businessName}}, specializing in {{destinations}}.
Agent/Owner: {{ownerName}}.
Target Audience: {{targetAudience}}.
Brand Voice: {{brandVoice}}.

You assist with:
- Crafting highly personalized, day-by-day travel itineraries
- Writing vivid, experiential descriptions for tours and destinations
- Drafting polite responses to booking inquiries and cancellation policies
- Recommending local hidden gems, restaurants, and activities.
Always make the destination sound irresistible and well-curated.`,

    systemPromptFr: `Vous êtes un concierge de voyage expert pour {{businessName}}, spécialisé sur {{destinations}}.
Gérant: {{ownerName}}.
Cible: {{targetAudience}}.
Ton: {{brandVoice}}.`,

    dataFields: [
        { key: "businessName", label: "Agency/Hotel Name", labelFr: "Nom de l'agence/Hôtel", type: "text", placeholder: "e.g. Horizon Escapes", required: true, group: "business" },
        { key: "ownerName", label: "Owner/Agent", labelFr: "Agent/Gérant", type: "text", placeholder: "e.g. Sophie Rousseau", required: true, group: "business" },
        { key: "destinations", label: "Top Destinations", labelFr: "Destinations phares", type: "textarea", placeholder: "Bali, Maldives, Paris, Alps...", required: true, group: "services" },
        { key: "targetAudience", label: "Target Audience", labelFr: "Cible", type: "text", placeholder: "Honeymooners, backpackers, luxury...", required: true, group: "business" },
        { key: "brandVoice", label: "Brand Voice", labelFr: "Ton de la marque", type: "select", options: ["Luxury & Exclusive", "Adventurous & Authentic", "Relaxing & Family-focused"], group: "brand" },
    ],

    quickActions: [
        { id: "build-itinerary", label: "Custom Itinerary", labelFr: "Itinéraire sur-mesure", icon: "🗺️", promptTemplate: "Create a 3-day itinerary for a couple visiting [Destination] focusing on [Interest: e.g. food and culture]. Include morning, afternoon, and evening activities.", category: "content" },
        { id: "destination-desc", label: "Tempting Description", labelFr: "Description attrayante", icon: "🏖️", promptTemplate: "Write a vivid, 150-word description of a luxury stay in [Location]. Focus on the sensory details: the view, the food, and the atmosphere.", category: "content" },
    ],

    contentTemplates: [
        { id: "welcome-email", name: "Guest Welcome Email", nameFr: "Email de bienvenue client", category: "email", icon: "🛎️", promptTemplate: "Draft a {{brandVoice}} welcome email for a guest checking in tomorrow. Include check-in times, wifi details, and a link to our digital guidebook." },
    ],

    agents: [
        { id: "local-expert", name: "Local Guide AI", nameFr: "Guide Local IA", role: "Recommend hidden gems", icon: "🧭", systemPrompt: "You are an expert on global travel, adept at finding off-the-beaten-path recommendations." },
    ],

    phase: 3,
    category: "Hospitality & Travel",
    keywords: ["travel", "tourism", "hotel", "tour", "voyage", "tourisme", "hôtel"],
    targetAudience: "Travel agencies, boutique hotels, independent tour guides",

    sampleData: {
        businessName: "Escale Secrète",
        ownerName: "Sophie Rousseau",
        destinations: "Japon hors des sentiers battus, Cyclades secrètes",
        targetAudience: "Couples en quête d'authenticité et de design",
        brandVoice: "Adventurous & Authentic",
    },
};

export default travelTheme;

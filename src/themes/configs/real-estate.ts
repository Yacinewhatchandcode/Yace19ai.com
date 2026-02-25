import type { ThemeConfig } from "../types";

const realEstateTheme: ThemeConfig = {
    id: "real-estate",
    name: "Real Estate & Property",
    nameFr: "Immobilier & Propriété",
    icon: "🏠",
    emoji: "🏠",
    tagline: "Intelligent property management & sales",
    taglineFr: "Gestion immobilière intelligente et ventes",
    description: "AI tailored for real estate agencies, property managers, and brokers. Automate property descriptions, manage client inquiries, schedule viewings, and generate market reports instantly.",
    descriptionFr: "IA adaptée aux agences immobilières, gestionnaires de biens et courtiers. Automatisez les descriptions de biens, gérez les demandes clients, planifiez les visites et générez des rapports de marché.",

    colorPrimary: "#0e7490", // Cyan-700
    colorSecondary: "#fbbf24", // Amber-400
    colorAccent: "#06b6d4", // Cyan-500
    gradientFrom: "from-cyan-900/20",
    gradientTo: "to-slate-900/10",

    systemPrompt: `You are a professional AI real estate assistant for {{businessName}}, an agency working in {{location}}. 
Owner/Broker: {{ownerName}}.
Areas served: {{areasServed}}.
Specialties: {{specialties}}.
Communication style: {{brandVoice}}.

You assist with:
- Writing compelling and accurate property descriptions
- Responding to buyer and renter inquiries
- Drafting emails for viewing follow-ups
- Analyzing local market trends based on provided data
Focus on clarity, professionalism, and highlighting property value.`,

    systemPromptFr: `Vous êtes un assistant IA immobilier professionnel pour {{businessName}}, une agence située à {{location}}.
Directeur/Fondateur: {{ownerName}}.
Secteurs: {{areasServed}}.
Spécialités: {{specialties}}.
Style de communication: {{brandVoice}}.`,

    dataFields: [
        { key: "businessName", label: "Agency Name", labelFr: "Nom de l'agence", type: "text", placeholder: "e.g. Prime Properties", required: true, group: "business" },
        { key: "ownerName", label: "Broker/Owner Name", labelFr: "Nom du directeur", type: "text", placeholder: "e.g. Jean Dupont", required: true, group: "business" },
        { key: "location", label: "Main Office", labelFr: "Agence principale", type: "text", placeholder: "e.g. Paris 8ème", required: true, group: "business" },
        { key: "phone", label: "Phone", labelFr: "Téléphone", type: "text", placeholder: "+33 1 23 45 67 89", group: "business" },
        { key: "email", label: "Email", labelFr: "Email", type: "text", placeholder: "contact@agency.com", group: "business" },
        { key: "areasServed", label: "Areas Served", labelFr: "Secteurs couverts", type: "text", placeholder: "Paris Center, Neuilly, Boulogne", required: true, group: "services" },
        { key: "specialties", label: "Specialties", labelFr: "Spécialités", type: "text", placeholder: "Luxury residential, commercial rentals...", required: true, group: "services" },
        { key: "brandVoice", label: "Brand Voice", labelFr: "Ton de la marque", type: "select", options: ["Premium & Exclusive", "Friendly & Accessible", "Dynamic & Modern"], group: "brand" },
    ],

    quickActions: [
        { id: "property-description", label: "Write Property Listing", labelFr: "Rédiger une annonce", icon: "📝", promptTemplate: "Write a {{brandVoice}} property listing for a [insert property type: e.g. 3-bedroom apartment] located in [insert location]. Highlights: [insert key features: e.g. balcony, renovated kitchen, near metro]. End with a clear call to action.", category: "content" },
        { id: "buyer-response", label: "Inquiry Response", labelFr: "Réponse demande information", icon: "✉️", promptTemplate: "Draft a professional response to a potential buyer asking about [insert property reference]. Provide availability for viewings next week and ask about their specific search criteria.", category: "communication" },
    ],

    contentTemplates: [
        { id: "market-update", name: "Market Update Newsletter", nameFr: "Newsletter marché", category: "email", icon: "📊", promptTemplate: "Draft a compelling monthly newsletter for {{businessName}} summarizing the current real estate trends in {{areasServed}}." },
    ],

    agents: [
        { id: "listing-writer", name: "Listing Specialist", nameFr: "Spécialiste annonces", role: "Write attractive property descriptions", icon: "✍️", systemPrompt: "You are an expert copywriter for real estate, writing compelling property listings." },
    ],

    phase: 1,
    category: "Real Estate",
    keywords: ["real estate", "property", "broker", "immobilier", "agence", "vente", "location"],
    targetAudience: "Real estate agencies, independent brokers, property managers",

    sampleData: {
        businessName: "Lumière Immobilier",
        ownerName: "Claire Fontaine",
        location: "Paris 16ème",
        phone: "+33 1 40 50 60 70",
        email: "contact@lumiere-immo.fr",
        areasServed: "Paris Ouest, Neuilly-sur-Seine",
        specialties: "Appartements familiaux, biens d'exception, estimations",
        brandVoice: "Premium & Exclusive",
    },
};

export default realEstateTheme;

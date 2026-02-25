import type { ThemeConfig } from "../types";

const bakeryTheme: ThemeConfig = {
    id: "bakery",
    name: "Bakery & Patisserie",
    nameFr: "Boulangerie & Pâtisserie",
    icon: "🥐",
    emoji: "🥐",
    tagline: "Sweeten your daily operations",
    taglineFr: "Adoucissez vos opérations quotidiennes",
    description: "AI designed for bakeries, pastry shops, and cafes. Automate wholesale emails, generate social media descriptions for seasonal treats, and draft catering proposals.",
    descriptionFr: "IA conçue pour les boulangeries, pâtisseries et cafés. Automatisez vos emails fournisseurs, générez vos descriptions de produits de saison et rédigez vos propositions traiteur.",

    colorPrimary: "#d97706", // Amber-600
    colorSecondary: "#78350f", // Amber-900 (Chocolate/Coffee)
    colorAccent: "#f59e0b", // Amber-500
    gradientFrom: "from-amber-900/20",
    gradientTo: "to-orange-900/10",

    systemPrompt: `You are a warm, inviting AI assistant for {{businessName}}, an artisanal bakery and patisserie.
Owner/Head Baker: {{ownerName}}.
Specialties: {{specialties}}.
Brand Voice: {{brandVoice}}.

You assist with:
- Writing mouth-watering descriptions for new pastries and breads
- Drafting emails to suppliers for ingredient restocks
- Responding to catering or custom cake inquiries
- Creating engaging social media posts highlighting freshness and craftsmanship.`,

    systemPromptFr: `Vous êtes un assistant IA chaleureux pour {{businessName}}, une boulangerie/pâtisserie artisanale.
Chef / Gérant: {{ownerName}}.
Spécialités: {{specialties}}.
Ton: {{brandVoice}}.`,

    dataFields: [
        { key: "businessName", label: "Bakery Name", labelFr: "Nom de la boulangerie", type: "text", placeholder: "e.g. The Golden Crust", required: true, group: "business" },
        { key: "ownerName", label: "Owner Name", labelFr: "Nom du gérant", type: "text", placeholder: "e.g. Marie Blanc", required: true, group: "business" },
        { key: "specialties", label: "Specialties", labelFr: "Spécialités", type: "textarea", placeholder: "Sourdough, croissants, custom wedding cakes...", required: true, group: "services" },
        { key: "brandVoice", label: "Brand Voice", labelFr: "Ton de la marque", type: "select", options: ["Warm & Artisanal", "Modern & Premium", "Family-friendly & Cheerful"], group: "brand" },
    ],

    quickActions: [
        { id: "product-highlight", label: "Product Description", labelFr: "Description Produit", icon: "🥖", promptTemplate: "Write a mouth-watering description for our new [Product Name]. Focus on the texture, flavor, and artisanal process.", category: "content" },
        { id: "catering-quote", label: "Catering Proposal", labelFr: "Devis traiteur", icon: "📝", promptTemplate: "Draft a polite email response providing a rough estimate for a custom cake and pastry platter for an upcoming event of [X] people.", category: "communication" },
    ],

    contentTemplates: [
        { id: "holiday-promo", name: "Holiday Menu Announcement", nameFr: "Annonce carte de fêtes", category: "social", icon: "🎄", promptTemplate: "Write an Instagram post announcing our new seasonal holiday menu. Create urgency for pre-orders." },
    ],

    agents: [
        { id: "food-copywriter", name: "Food Copywriter", nameFr: "Rédacteur Gourmand", role: "Write appetizing food descriptions", icon: "✍️", systemPrompt: "You are an expert food writer who creates sensory, mouth-watering text." },
    ],

    phase: 3,
    category: "Food & Beverage",
    keywords: ["bakery", "pastry", "food", "cafe", "boulangerie", "pâtisserie", "café"],
    targetAudience: "Bakeries, patisseries, coffee shops",

    sampleData: {
        businessName: "Maison Blanc",
        ownerName: "Marie Blanc",
        specialties: "Pains au levain naturel, viennoiseries pur beurre, gâteaux sur-mesure",
        brandVoice: "Warm & Artisanal",
    },
};

export default bakeryTheme;

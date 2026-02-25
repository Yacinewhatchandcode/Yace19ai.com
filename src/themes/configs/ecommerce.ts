import type { ThemeConfig } from "../types";

const ecommerceTheme: ThemeConfig = {
    id: "ecommerce",
    name: "E-Commerce & Retail",
    nameFr: "E-Commerce & Vente",
    icon: "🛒",
    emoji: "🛒",
    tagline: "Scale your online sales effortlessly",
    taglineFr: "Développez vos ventes en ligne sans effort",
    description: "AI designed for e-tailers and D2C brands. Generate product descriptions, automate customer support, create marketing campaigns, and analyze sales trends to boost conversion rates.",
    descriptionFr: "IA conçue pour les e-commerçants et marques D2C. Générez des descriptions produits, automatisez le support client, créez des campagnes marketing et analysez vos tendances de ventes.",

    colorPrimary: "#4f46e5", // Indigo-600
    colorSecondary: "#ec4899", // Pink-500
    colorAccent: "#6366f1", // Indigo-500
    gradientFrom: "from-indigo-900/20",
    gradientTo: "to-fuchsia-900/10",

    systemPrompt: `You are an AI growth assistant for {{businessName}}, an e-commerce brand specializing in {{productCategories}}.
Target Audience: {{targetAudience}}.
Brand Voice: {{brandVoice}}.
Unique Value Proposition: {{uvp}}.

You assist with:
- Writing SEO-optimized product descriptions
- Drafting email marketing campaigns and abandoned cart emails
- Responding to customer support inquiries (shipping, returns, sizing)
- Creating engaging social media copy to drive traffic`,

    systemPromptFr: `Vous êtes un assistant de croissance IA pour {{businessName}}, une marque e-commerce spécialisée en {{productCategories}}.
Public cible: {{targetAudience}}.
Ton de la marque: {{brandVoice}}.
Proposition de valeur: {{uvp}}.`,

    dataFields: [
        { key: "businessName", label: "Store Name", labelFr: "Nom de la boutique", type: "text", placeholder: "e.g. Aurora Apparel", required: true, group: "business" },
        { key: "url", label: "Website URL", labelFr: "URL du site", type: "text", placeholder: "https://store.com", required: true, group: "business" },
        { key: "productCategories", label: "Product Categories", labelFr: "Catégories de produits", type: "text", placeholder: "e.g. Sustainable activewear, accessories", required: true, group: "services" },
        { key: "targetAudience", label: "Target Audience", labelFr: "Public cible", type: "text", placeholder: "e.g. Eco-conscious millennials", required: true, group: "brand" },
        { key: "uvp", label: "Unique Value Proposition", labelFr: "Proposition de valeur", type: "textarea", placeholder: "100% recycled materials, free shipping over €50", required: true, group: "brand" },
        { key: "brandVoice", label: "Brand Voice", labelFr: "Ton de la marque", type: "select", options: ["Trendy & Casual", "Luxurious & Elegant", "Fun & Quirky", "Minimalist & Clean"], group: "brand" },
    ],

    quickActions: [
        { id: "product-desc", label: "Product Description", labelFr: "Fiche Produit", icon: "✨", promptTemplate: "Write a 150-word SEO-friendly product description for [Product Name], which features [Key Attributes]. Focus on benefits, use our {{brandVoice}} tone, and include 3 bullet points.", category: "content" },
        { id: "abandoned-cart", label: "Abandoned Cart Email", labelFr: "Email panier abandonné", icon: "🛒", promptTemplate: "Draft an engaging abandoned cart email for {{businessName}}. Offer a 10% discount code (COMEBACK10) and use urgency. Keep it short and friendly.", category: "communication" },
    ],

    contentTemplates: [
        { id: "promo-campaign", name: "Sale Campaign Launch", nameFr: "Lancement promo", category: "marketing", icon: "🚀", promptTemplate: "Create a 3-part email sequence for our upcoming [Event/Season] sale offering [Discount] off the entire store." },
    ],

    agents: [
        { id: "seo-copywriter", name: "SEO Copywriter", nameFr: "Rédacteur SEO", role: "Optimize product listings", icon: "✍️", systemPrompt: "You write compelling, high-converting, SEO-optimized product descriptions." },
    ],

    phase: 1,
    category: "Retail",
    keywords: ["e-commerce", "retail", "shop", "store", "boutique", "vente", "online"],
    targetAudience: "D2C brands, dropshippers, online retailers",

    sampleData: {
        businessName: "Vélos Vifs",
        url: "https://velos-vifs.fr",
        productCategories: "Vélos électriques urbains, accessoires de sécurité",
        targetAudience: "Jeunes actifs et citadins soucieux de l'environnement",
        uvp: "Vélos légers, design minimaliste, assemblés en France.",
        brandVoice: "Minimalist & Clean",
    },
};

export default ecommerceTheme;

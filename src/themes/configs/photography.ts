import type { ThemeConfig } from "../types";

const photographyTheme: ThemeConfig = {
    id: "photography",
    name: "Photography",
    nameFr: "Photographie",
    icon: "📸",
    emoji: "📸",
    tagline: "Frame your business growth",
    taglineFr: "Cadrez le développement de votre activité",
    description: "AI tailored for professional photographers, studios, and videographers. Automate booking inquiries, write compelling gallery descriptions, draft shooting guidelines, and plan social media content.",
    descriptionFr: "IA adaptée aux photographes professionnels, studios et vidéastes. Automatisez les demandes de réservation, rédigez des descriptions de galeries, créez des guides de séance et planifiez vos réseaux sociaux.",

    colorPrimary: "#0f172a", // Slate-900 (Black/Dark mode aesthetic)
    colorSecondary: "#64748b", // Slate-500
    colorAccent: "#38bdf8", // Sky-400 (Contrast element)
    gradientFrom: "from-slate-900/40",
    gradientTo: "to-black/40",

    systemPrompt: `You are a creative business assistant for {{businessName}}, a professional photography studio.
Lead Photographer: {{ownerName}}.
Style/Niche: {{expertise}}.
Brand Vibe: {{brandVoice}}.

You assist with:
- Replying to client booking inquiries and explaining pricing packages
- Drafting location guides and outfit tips for clients
- Writing evocative and cinematic captions for Instagram and portfolios
- Formatting friendly invoice reminders.`,

    systemPromptFr: `Vous êtes un assistant créatif pour {{businessName}}, un studio de photographie professionnel.
Photographe principal: {{ownerName}}.
Style/Niche: {{expertise}}.
Ambiance: {{brandVoice}}.`,

    dataFields: [
        { key: "businessName", label: "Studio Name", labelFr: "Nom du studio", type: "text", placeholder: "e.g. Lens & Light", required: true, group: "business" },
        { key: "ownerName", label: "Photographer", labelFr: "Photographe", type: "text", placeholder: "e.g. Julien Morel", required: true, group: "business" },
        { key: "expertise", label: "Niche / Style", labelFr: "Spécialité", type: "text", placeholder: "Weddings, Editorial, Portraits, Cinematic...", required: true, group: "services" },
        { key: "brandVoice", label: "Brand Vibe", labelFr: "Ambiance de la marque", type: "select", options: ["Moody & Cinematic", "Light & Airy", "Modern & Minimalist"], group: "brand" },
    ],

    quickActions: [
        { id: "booking-reply", label: "Client Inquiry Reply", labelFr: "Réponse réservation", icon: "📧", promptTemplate: "Draft a friendly, {{brandVoice}} reply to a client inquiring about a [Type of Shoot] on [Date]. Share our starting rate of [Price] and ask for more details about their vision.", category: "communication" },
        { id: "gallery-caption", label: "Instagram Caption", labelFr: "Légende Instagram", icon: "🖼️", promptTemplate: "Write a short, emotive Instagram caption for a recent [Style] photoshoot. Speak about capturing authentic moments and use relevant photography hashtags.", category: "content" },
    ],

    contentTemplates: [
        { id: "style-guide", name: "Client Style Guide", nameFr: "Guide de style client", category: "document", icon: "👗", promptTemplate: "Create a 1-page outfit and preparation guide for clients booking a lifestyle photoshoot. Keep the tone {{brandVoice}} and helpful." },
    ],

    agents: [
        { id: "creative-writer", name: "Creative Writer", nameFr: "Rédacteur Créatif", role: "Write evocative captions and portfolios", icon: "✨", systemPrompt: "You are a poet and storyteller, writing beautiful and evocative imagery-focused text." },
    ],

    phase: 3,
    category: "Creative Services",
    keywords: ["photography", "video", "photos", "studio", "photographe", "vidéaste"],
    targetAudience: "Freelance photographers, wedding studios, creative directors",

    sampleData: {
        businessName: "Lumière Noire Studio",
        ownerName: "Julien Morel",
        expertise: "Mariage, mode, portraits éditoriaux (Cinematic, Moody)",
        brandVoice: "Moody & Cinematic",
    },
};

export default photographyTheme;

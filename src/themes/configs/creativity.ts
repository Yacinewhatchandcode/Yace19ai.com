import type { ThemeConfig } from "../types";

const creativityTheme: ThemeConfig = {
    id: "creativity",
    name: "Design & Content",
    nameFr: "Design & Création",
    icon: "🎨",
    emoji: "✨",
    tagline: "Unleash infinite creativity with AI-powered ideation.",
    taglineFr: "Libérez une créativité infinie avec l'idéation propulsée par l'IA.",
    description: "The ultimate studio for designers, writers, and digital artists.",
    descriptionFr: "Le studio ultime pour les designers, rédacteurs et artistes numériques.",

    // Visual
    colorPrimary: "#ec4899", // Pink
    colorSecondary: "#f43f5e", // Rose
    colorAccent: "#f59e0b", // Amber
    gradientFrom: "from-pink-500",
    gradientTo: "to-rose-500",

    // AI
    systemPrompt: "You are a world-class Creative Director. Your focus is on aesthetics, narrative impact, and emotional resonance. Think outside the box, propose bold color palettes, engaging storylines, and highly visual concepts.",
    systemPromptFr: "Vous êtes un Directeur de Création de renommée mondiale. Votre priorité est l'esthétique, l'impact narratif et la résonance émotionnelle.",

    // Configuration
    dataFields: [
        {
            key: "agencyName",
            label: "Studio / Agency Name",
            labelFr: "Nom du Studio / Agence",
            type: "text",
            placeholder: "e.g., Prism Creatives",
            required: true,
            group: "business",
        },
        {
            key: "brandVoice",
            label: "Brand Voice / Style",
            labelFr: "Voix de la Marque / Style",
            type: "textarea",
            placeholder: "e.g., Bold, minimalist, cyberpunk, highly emotional...",
            required: true,
            group: "brand",
        },
        {
            key: "mediums",
            label: "Primary Mediums",
            labelFr: "Médias Principaux",
            type: "text",
            placeholder: "e.g., 3D Animation, UI/UX, Copywriting",
            group: "services",
        },
    ],

    quickActions: [
        {
            id: "brainstorm-campaign",
            label: "Brainstorm Campaign",
            labelFr: "Brainstorming Campagne",
            icon: "⚡",
            promptTemplate: "Generate 5 bold, out-of-the-box marketing campaign ideas for {{agencyName}}. The style should be {{brandVoice}} and utilize our core mediums: {{mediums}}.",
            category: "content",
        },
        {
            id: "design-critique",
            label: "Design Critique",
            labelFr: "Critique de Design",
            icon: "👁️",
            promptTemplate: "Analyze this concept from the perspective of a senior art director. Does it align with a {{brandVoice}} brand identity? How can we push the visual boundary further?",
            category: "analysis",
        },
    ],

    contentTemplates: [
        {
            id: "moodboard-concept",
            name: "Moodboard Generator",
            nameFr: "Générateur de Moodboard",
            category: "marketing",
            promptTemplate: "Create a detailed text-based moodboard for a new project by {{agencyName}}. Describe the color palette (with hex codes), typography, photography style, and emotional keywords matching our {{brandVoice}} style.",
            icon: "🖼️",
        },
        {
            id: "copywriting",
            name: "Hero Copywriting",
            nameFr: "Rédaction de Slogans",
            category: "social",
            promptTemplate: "Write 10 different variations of website hero text (headline + subheadline) that capture a {{brandVoice}} aesthetic.",
            icon: "✍️",
        },
    ],

    agents: [
        {
            id: "art-director",
            name: "Salvador",
            nameFr: "Salvador",
            role: "Art Director",
            icon: "🖌️",
            systemPrompt: "You are the Art Director. You focus on color theory, typography, composition, and visual storytelling.",
        },
        {
            id: "copywriter",
            name: "Sylvia",
            nameFr: "Sylvia",
            role: "Lead Copywriter",
            icon: "🖋️",
            systemPrompt: "You are the Lead Copywriter. You craft compelling, precise, and emotional narratives that convert viewers into fans.",
        },
    ],

    // Meta
    phase: 2,
    category: "Creative",
    keywords: ["design", "art", "copywriting", "creative", "agency", "studio"],
    targetAudience: "Designers, Writers, and Creative Agencies",

    sampleData: {
        agencyName: "Neon Dream Studios",
        brandVoice: "Cyberpunk, high-contrast, edgy, neon-drenched",
        mediums: "3D Rendering, Motion Graphics",
    },
};

export default creativityTheme;

import type { ThemeConfig } from "../types";

const beautyTheme: ThemeConfig = {
    id: "beauty",
    name: "Beauty & Salon",
    nameFr: "Beauté & Salon",
    icon: "💇",
    emoji: "💇",
    tagline: "Elevate your salon experience",
    taglineFr: "Sublimez l'expérience de votre salon",
    description: "AI designed for hair salons, spas, and beauty professionals. Automate booking reminders, answer common questions, create social media content, and manage customer loyalty.",
    descriptionFr: "IA conçue pour les salons de coiffure, spas et professionnels de la beauté. Automatisez les rappels de rendez-vous, répondez aux questions fréquentes et fidélisez vos clients.",

    colorPrimary: "#db2777", // Pink-600
    colorSecondary: "#9333ea", // Purple-600
    colorAccent: "#f472b6", // Pink-400
    gradientFrom: "from-pink-900/20",
    gradientTo: "to-purple-900/10",

    systemPrompt: `You are an elegant AI beauty assistant for {{businessName}}, a salon/spa in {{location}}.
Owner/Manager: {{ownerName}}.
Services: {{services}}.
Brand Voice: {{brandVoice}}.

You assist with:
- Managing client inquiries about pricing and treatments
- Drafting polite appointment confirmations and reminders
- Generating engaging captions for Instagram and TikTok showcasing before/afters
Tone should be welcoming, luxurious, and highly professional.`,

    systemPromptFr: `Vous êtes un élégant assistant IA pour {{businessName}}, un salon de beauté situé à {{location}}.
Gérant(e): {{ownerName}}.
Prestations: {{services}}.
Ton: {{brandVoice}}.`,

    dataFields: [
        { key: "businessName", label: "Salon Name", labelFr: "Nom du salon", type: "text", placeholder: "e.g. Elegance Spa", required: true, group: "business" },
        { key: "ownerName", label: "Owner Name", labelFr: "Nom du/de la gérant(e)", type: "text", placeholder: "e.g. Sophie Martin", required: true, group: "business" },
        { key: "location", label: "Location", labelFr: "Adresse", type: "text", placeholder: "e.g. Lyon", required: true, group: "business" },
        { key: "services", label: "Services", labelFr: "Prestations", type: "textarea", placeholder: "Haircuts, coloring, balayage, facials...", required: true, group: "services" },
        { key: "brandVoice", label: "Brand Voice", labelFr: "Ton de la marque", type: "select", options: ["Luxurious & Exclusive", "Warm & Welcoming", "Trendy & Modern"], group: "brand" },
    ],

    quickActions: [
        { id: "appointment-reminder", label: "Booking Reminder", labelFr: "Rappel de rendez-vous", icon: "⏰", promptTemplate: "Draft an elegant SMS reminder for a client's upcoming appointment tomorrow at [Time] for [Service]. Include cancellation policy.", category: "communication" },
        { id: "instagram-caption", label: "Instagram Caption", labelFr: "Légende Instagram", icon: "✨", promptTemplate: "Write an engaging Instagram caption for a before/after transformation of a [Service]. Include relevant hashtags and use a {{brandVoice}} tone.", category: "content" },
    ],

    contentTemplates: [
        { id: "loyalty-email", name: "Loyalty Program Update", nameFr: "Email fidélité", category: "email", icon: "💖", promptTemplate: "Draft an email introducing our new loyalty program to existing clients, offering 15% off their next visit." },
    ],

    agents: [
        { id: "social-manager", name: "Social Media Manager", nameFr: "Community Manager", role: "Draft engaging social content", icon: "📱", systemPrompt: "You write engaging, trendy social media copy for a beauty salon." },
    ],

    phase: 2,
    category: "Beauty & Wellness",
    keywords: ["beauty", "salon", "spa", "hair", "coiffure", "beauté", "esthétique"],
    targetAudience: "Salons, spas, independent makeup artists",

    sampleData: {
        businessName: "L'Atelier Beauté",
        ownerName: "Amélie Dubois",
        location: "Centre ville, Bordeaux",
        services: "Coiffure, Lissage Brésilien, Onglerie",
        brandVoice: "Trendy & Modern",
    },
};

export default beautyTheme;

import type { ThemeConfig } from "../types";

const petServicesTheme: ThemeConfig = {
    id: "pet-services",
    name: "Pet Services",
    nameFr: "Services Animaliers",
    icon: "🐾",
    emoji: "🐾",
    tagline: "Purr-fectly automated pet care",
    taglineFr: "La garde d'animaux, parfaitement automatisée",
    description: "AI tailored for veterinarians, dog walkers, pet groomers, and boarding facilities. Manage client updates, generate care instructions, and draft fun social media content.",
    descriptionFr: "IA adaptée aux vétérinaires, promeneurs, toiletteurs et pensions. Gérez les nouvelles aux clients, générez des instructions de soins et rédigez du contenu réseaux sociaux amusant.",

    colorPrimary: "#14b8a6", // Teal-500
    colorSecondary: "#f43f5e", // Rose-500
    colorAccent: "#0ea5e9", // Sky-500
    gradientFrom: "from-teal-900/20",
    gradientTo: "to-sky-900/10",

    systemPrompt: `You are a friendly, caring AI assistant for {{businessName}}, an animal care and pet services business.
Owner: {{ownerName}}.
Services: {{services}}.
Brand Voice: {{brandVoice}}.

You assist with:
- Sending daily photo updates and progress reports to pet parents
- Drafting clear pre- and post-care instructions (e.g., after grooming or surgery)
- Writing cute, engaging Instagram captions about the pets you serve
- Answering common inquiries about vaccinations, pricing, and availability.`,

    systemPromptFr: `Vous êtes un assistant IA bienveillant pour {{businessName}}, une entreprise de services animaliers.
Propriétaire: {{ownerName}}.
Services: {{services}}.
Ton: {{brandVoice}}.`,

    dataFields: [
        { key: "businessName", label: "Business Name", labelFr: "Nom de l'entreprise", type: "text", placeholder: "e.g. Happy Paws", required: true, group: "business" },
        { key: "ownerName", label: "Owner/Vet Name", labelFr: "Nom du gérant/Vétérinaire", type: "text", placeholder: "e.g. Dr. Laura", required: true, group: "business" },
        { key: "services", label: "Services", labelFr: "Services", type: "textarea", placeholder: "Grooming, day care, dog walking...", required: true, group: "services" },
        { key: "brandVoice", label: "Brand Voice", labelFr: "Ton de la marque", type: "select", options: ["Warm & Playful", "Professional & Medical", "Trustworthy & Reliable"], group: "brand" },
    ],

    quickActions: [
        { id: "parent-update", label: "Pet Status Update", labelFr: "Nouvelles au propriétaire", icon: "🐶", promptTemplate: "Draft a short, reassuring SMS to a pet owner letting them know their dog [Dog Name] is doing great, ate all their food, and is playing nicely. Use emojis.", category: "communication" },
        { id: "care-instructions", label: "Post-Care Instructions", labelFr: "Instructions de soins", icon: "📋", promptTemplate: "Write a bulleted list of 5 important aftercare instructions for a dog that just received a [Treatment/Groom]. Format clearly for the owner.", category: "document" },
    ],

    contentTemplates: [
        { id: "promo-email", name: "Holiday Boarding Promo", nameFr: "Promo Pension Vacances", category: "marketing", icon: "🏖️", promptTemplate: "Draft an email reminding clients to book their holiday pet boarding early, as spots fill up fast. Offer a 10% early-bird discount." },
    ],

    agents: [
        { id: "pet-care-advisor", name: "Care Advisor AI", nameFr: "Coach Animalier", role: "Generate care tips and advice", icon: "🦴", systemPrompt: "You provide practical, safe, and friendly pet care advice based on veterinary standards." },
    ],

    phase: 3,
    category: "Pet Care",
    keywords: ["pet", "dog", "cat", "vet", "grooming", "animal", "vétérinaire", "toilettage"],
    targetAudience: "Vets, dog walkers, pet sitters, grooming salons",

    sampleData: {
        businessName: "Clinique La Patte Douce",
        ownerName: "Dr. Laura Menard",
        services: "Consultations, chirurgie, pension médicale",
        brandVoice: "Trustworthy & Reliable",
    },
};

export default petServicesTheme;

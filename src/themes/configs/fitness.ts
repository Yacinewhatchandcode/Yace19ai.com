import type { ThemeConfig } from "../types";

const fitnessTheme: ThemeConfig = {
    id: "fitness",
    name: "Fitness & Coaching",
    nameFr: "Fitness & Coaching",
    icon: "💪",
    emoji: "💪",
    tagline: "Power up your fitness coaching",
    taglineFr: "Dynamisez votre coaching fitness",
    description: "AI tailored for personal trainers, gyms, and wellness coaches. Generate meal plans, create workout programs, manage client schedules, and automate motivational check-ins.",
    descriptionFr: "IA adaptée aux coachs sportifs, salles de sport et coachs bien-être. Générez des plans de repas, créez des programmes d'entraînement, gérez les plannings et automatisez les relances de motivation.",

    colorPrimary: "#e11d48", // Rose-600
    colorSecondary: "#f59e0b", // Amber-500
    colorAccent: "#f43f5e", // Rose-500
    gradientFrom: "from-rose-900/20",
    gradientTo: "to-orange-900/10",

    systemPrompt: `You are an energetic AI fitness assistant for {{businessName}}.
Head Coach: {{ownerName}}.
Services: {{services}}.
Clientele: {{targetAudience}}.
Brand Voice: {{brandVoice}}.

You assist with:
- Drafting custom workout plans and meal prep advice
- Sending motivational reminders to clients
- Creating engaging social media challenges
Disclaimer: Always state that clients should consult a doctor before starting any new diet or exercise regimen.`,

    systemPromptFr: `Vous êtes un assistant IA fitness dynamique pour {{businessName}}.
Head Coach: {{ownerName}}.
Services: {{services}}.
Clientèle: {{targetAudience}}.
Ton de la marque: {{brandVoice}}.`,

    dataFields: [
        { key: "businessName", label: "Business Name", labelFr: "Nom de l'entreprise", type: "text", placeholder: "e.g. Iron & Flow", required: true, group: "business" },
        { key: "ownerName", label: "Coach Name", labelFr: "Nom du coach", type: "text", placeholder: "e.g. Alex Dupont", required: true, group: "business" },
        { key: "services", label: "Services Provided", labelFr: "Services fournis", type: "textarea", placeholder: "1-on-1 coaching, nutrition plans, group classes...", required: true, group: "services" },
        { key: "targetAudience", label: "Target Audience", labelFr: "Public cible", type: "text", placeholder: "Athletes, beginners, weight loss...", required: true, group: "business" },
        { key: "brandVoice", label: "Brand Voice", labelFr: "Ton de la marque", type: "select", options: ["High-Energy & Motivational", "Scientific & Technical", "Holistic & Calming"], group: "brand" },
    ],

    quickActions: [
        { id: "workout-plan", label: "Generate Workout Plan", labelFr: "Créer un programme", icon: "🏋️", promptTemplate: "Create a 4-day workout split for a [Level] client looking to [Goal]. Include exercises, sets, and reps.", category: "document" },
        { id: "motivational-sms", label: "Motivational Text", labelFr: "SMS de motivation", icon: "💬", promptTemplate: "Draft a short, {{brandVoice}} motivational SMS for a client, encouraging them to stay consistent this week.", category: "communication" },
    ],

    contentTemplates: [
        { id: "fitness-challenge", name: "30-Day Challenge Strategy", nameFr: "Stratégie défi 30 jours", category: "marketing", icon: "🔥", promptTemplate: "Outline a 30-day fitness challenge for social media. Include weekly themes and daily post ideas." },
    ],

    agents: [
        { id: "workout-programmer", name: "Program Assistant", nameFr: "Assistant Programmation", role: "Generate workout variations", icon: "📋", systemPrompt: "You generate safe, progressive workout programs." },
    ],

    phase: 2,
    category: "Wellness",
    keywords: ["fitness", "gym", "coach", "wellness", "sport", "entraînement"],
    targetAudience: "Personal trainers, gyms, wellness coaches",

    sampleData: {
        businessName: "Peak Performance",
        ownerName: "Sarah Connor",
        services: "Personal coaching, strength training, HIIT",
        targetAudience: "Busy professionals wanting to stay fit",
        brandVoice: "High-Energy & Motivational",
    },
};

export default fitnessTheme;

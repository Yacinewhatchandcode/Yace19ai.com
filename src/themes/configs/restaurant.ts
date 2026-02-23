import type { ThemeConfig } from "../types";

const restaurantTheme: ThemeConfig = {
    id: "restaurant",
    name: "Restaurant & Food Service",
    nameFr: "Restaurant & Restauration",
    icon: "🍽️",
    emoji: "🍽️",
    tagline: "Your AI-powered restaurant assistant",
    taglineFr: "Votre assistant IA pour la restauration",
    description: "AI tailored for restaurants, cafés, and food service. Create menus, respond to reviews, manage social media, optimize operations, and delight customers — all powered by AI that speaks food.",
    descriptionFr: "IA adaptée aux restaurants, cafés et services de restauration. Créez des menus, répondez aux avis, gérez les réseaux sociaux et ravissez vos clients.",

    colorPrimary: "#991b1b",
    colorSecondary: "#f59e0b",
    colorAccent: "#dc2626",
    gradientFrom: "from-red-900/20",
    gradientTo: "to-amber-900/10",

    systemPrompt: `You are an AI assistant for {{businessName}}, a restaurant located at {{location}}.
Chef/Owner: {{ownerName}}.
Cuisine: {{cuisineType}}.
Signature dishes: {{signatureDishes}}.
Full menu: {{services}}.
Operating hours: {{operatingHours}}.
Capacity: {{capacity}} covers.
Communication style: {{brandVoice}}.
Special features: {{specialties}}.
Dietary accommodations: {{dietaryOptions}}.
Price range: {{priceRange}}.

You assist with:
- Menu descriptions and seasonal updates
- Social media content (Instagram, Facebook, Google)
- Review responses (positive and negative)
- Event planning and catering proposals
- Customer communication and reservations
- Marketing campaigns and promotions
Always maintain the restaurant's brand voice and highlight unique selling points.`,

    systemPromptFr: `Vous êtes un assistant IA pour {{businessName}}, un restaurant situé à {{location}}.
Chef/Propriétaire: {{ownerName}}.
Cuisine: {{cuisineType}}.
Plats signatures: {{signatureDishes}}.
Horaires: {{operatingHours}}.
Style de communication: {{brandVoice}}.
Options diététiques: {{dietaryOptions}}.`,

    dataFields: [
        { key: "businessName", label: "Restaurant Name", labelFr: "Nom du restaurant", type: "text", placeholder: "e.g. Le Petit Bistrot", required: true, group: "business" },
        { key: "ownerName", label: "Chef / Owner", labelFr: "Chef / Propriétaire", type: "text", placeholder: "e.g. Chef Antoine Dupont", required: true, group: "business" },
        { key: "location", label: "Address", labelFr: "Adresse", type: "text", placeholder: "e.g. 15 Rue de la Paix, 75002 Paris", required: true, group: "business" },
        { key: "phone", label: "Reservation Phone", labelFr: "Téléphone réservation", type: "text", placeholder: "+33 1 42 65 00 00", group: "business" },
        { key: "email", label: "Email", labelFr: "Email", type: "text", placeholder: "contact@restaurant.com", group: "business" },
        { key: "website", label: "Website", labelFr: "Site web", type: "text", placeholder: "https://restaurant.com", group: "business" },
        { key: "operatingHours", label: "Service Hours", labelFr: "Horaires de service", type: "textarea", placeholder: "Lunch: Tue-Sat 12:00-14:30\nDinner: Tue-Sat 19:00-22:30\nClosed: Sunday & Monday", group: "business" },
        { key: "cuisineType", label: "Cuisine Type", labelFr: "Type de cuisine", type: "text", placeholder: "French Bistro, Modern European, Asian Fusion...", required: true, group: "services" },
        { key: "signatureDishes", label: "Signature Dishes", labelFr: "Plats signatures", type: "textarea", placeholder: "Beef Bourguignon (€28)\nTruffle Risotto (€24)\nCrème Brûlée (€12)", required: true, group: "services" },
        { key: "services", label: "Full Menu Overview", labelFr: "Carte complète", type: "textarea", placeholder: "Starters: Onion soup (€10), Foie gras (€18)...\nMains: Duck confit (€24), Sea bass (€26)...\nDesserts: Tarte Tatin (€11)...", group: "services" },
        { key: "capacity", label: "Seating Capacity", labelFr: "Capacité d'accueil", type: "text", placeholder: "45 indoor, 20 terrace", group: "services" },
        { key: "priceRange", label: "Price Range", labelFr: "Gamme de prix", type: "select", options: ["€ Budget-Friendly", "€€ Moderate", "€€€ Upscale", "€€€€ Fine Dining"], group: "services" },
        { key: "specialties", label: "Special Features", labelFr: "Particularités", type: "textarea", placeholder: "Open kitchen, sommelier service, private dining room, terrace...", group: "services" },
        { key: "dietaryOptions", label: "Dietary Options", labelFr: "Options diététiques", type: "textarea", placeholder: "Vegetarian options, Gluten-free menu available, Vegan dishes on request, Nut-free options", group: "services" },
        { key: "brandVoice", label: "Brand Voice", labelFr: "Ton de la marque", type: "select", options: ["Casual & Fun", "Elegant & Refined", "Warm & Family-Friendly", "Trendy & Modern"], group: "brand" },
        { key: "targetAudience", label: "Target Clientele", labelFr: "Clientèle cible", type: "text", placeholder: "Business lunches, couples, families, tourists...", group: "advanced" },
        { key: "deliveryPlatforms", label: "Delivery Platforms", labelFr: "Plateformes de livraison", type: "text", placeholder: "Uber Eats, Deliveroo, in-house delivery...", group: "advanced" },
    ],

    quickActions: [
        { id: "daily-special", label: "Write Today's Special", labelFr: "Rédiger le plat du jour", icon: "🍳", promptTemplate: "Write an enticing social media post for {{businessName}}'s daily special. Restaurant: {{cuisineType}} at {{location}}. Chef: {{ownerName}}. Tone: {{brandVoice}}. Include a mouth-watering description and a call-to-action to reserve. Signature dishes for inspiration: {{signatureDishes}}.", category: "content" },
        { id: "review-response", label: "Respond to a Review", labelFr: "Répondre à un avis", icon: "⭐", promptTemplate: "Draft a {{brandVoice}} response from {{businessName}} ({{ownerName}}) to a customer review. The restaurant specializes in {{cuisineType}}. Address concerns professionally and invite the guest to return. Keep it personal and genuine.", category: "communication" },
        { id: "weekly-menu", label: "Create Weekly Menu", labelFr: "Créer le menu de la semaine", icon: "📋", promptTemplate: "Create an attractive weekly menu for {{businessName}} ({{cuisineType}}). Base it on these signature dishes and expand: {{signatureDishes}}. Include: 3 starters, 4 mains, 3 desserts. Dietary options available: {{dietaryOptions}}. Price range: {{priceRange}}.", category: "document" },
        { id: "instagram-post", label: "Instagram Caption", labelFr: "Légende Instagram", icon: "📸", promptTemplate: "Write an engaging Instagram caption for {{businessName}}. Cuisine: {{cuisineType}}. Location: {{location}}. Tone: {{brandVoice}}. Include relevant food hashtags, emojis, and a reservation CTA. Phone: {{phone}}.", category: "content" },
        { id: "event-invite", label: "Draft Event Invitation", labelFr: "Invitation événement", icon: "🎉", promptTemplate: "Create an invitation for a special event at {{businessName}} ({{location}}). Chef: {{ownerName}}. The restaurant specializes in {{cuisineType}} with {{capacity}} capacity. Include: event description, date/time placeholder, menu preview based on {{signatureDishes}}, pricing, and reservation details.", category: "communication" },
        { id: "catering-proposal", label: "Catering Proposal", labelFr: "Devis traiteur", icon: "🍽️", promptTemplate: "Draft a professional catering proposal from {{businessName}} ({{ownerName}}). Cuisine: {{cuisineType}}. Include: introduction, menu options based on {{signatureDishes}}, pricing structure ({{priceRange}}), service details, dietary accommodations ({{dietaryOptions}}), and terms.", category: "document" },
    ],

    contentTemplates: [
        { id: "google-post", name: "Google My Business Post", nameFr: "Post Google My Business", category: "social", icon: "📍", promptTemplate: "Write a Google My Business update for {{businessName}} at {{location}}. Highlight a seasonal offering or event. Keep it concise (150 words), include hours: {{operatingHours}}, and a reservation CTA." },
        { id: "email-promo", name: "Email Promotion", nameFr: "Email promotionnel", category: "email", icon: "📧", promptTemplate: "Draft a promotional email for {{businessName}}'s mailing list. Subject line + body. Feature: {{signatureDishes}}. Include a special offer and reservation link. Tone: {{brandVoice}}." },
        { id: "allergen-sheet", name: "Allergen Information Sheet", nameFr: "Fiche allergènes", category: "document", icon: "⚠️", promptTemplate: "Create an allergen information sheet for {{businessName}}'s menu. Based on dishes: {{services}}. Cover: gluten, dairy, nuts, shellfish, eggs, soy, sesame. Current dietary options: {{dietaryOptions}}." },
    ],

    agents: [
        { id: "social-manager", name: "Social Media Manager", nameFr: "Gestionnaire réseaux sociaux", role: "Create engaging social content", icon: "📱", systemPrompt: "You manage social media for {{businessName}}, a {{cuisineType}} restaurant. Create mouth-watering visual descriptions, hashtag strategies, and engagement-driving content. Tone: {{brandVoice}}." },
        { id: "guest-relations", name: "Guest Relations", nameFr: "Relations clients", role: "Handle customer communications", icon: "🤝", systemPrompt: "You handle guest communications for {{businessName}}. Respond to reviews, inquiries, and complaints with grace. Chef/Owner: {{ownerName}}. Always aim to turn negative experiences into return visits." },
        { id: "menu-creator", name: "Menu Engineer", nameFr: "Ingénieur de menu", role: "Design and optimize menus", icon: "📋", systemPrompt: "You help optimize the menu for {{businessName}}. Suggest dish descriptions, pricing strategies, and seasonal rotations based on: {{signatureDishes}}." },
    ],

    phase: 1,
    category: "Food & Hospitality",
    keywords: ["restaurant", "food", "chef", "cuisine", "bistro", "café", "dining", "restauration"],
    targetAudience: "Restaurant owners, chefs, café operators, food truck operators",

    sampleData: {
        businessName: "Le Petit Bistrot",
        ownerName: "Chef Antoine Dupont",
        location: "15 Rue de la Paix, 75002 Paris",
        phone: "+33 1 42 65 00 00",
        email: "reservations@lepetitbistrot.fr",
        website: "https://lepetitbistrot.fr",
        operatingHours: "Lunch: Tue-Sat 12:00-14:30\nDinner: Tue-Sat 19:00-22:30\nBrunch: Sunday 11:00-15:00\nClosed: Monday",
        cuisineType: "Modern French Bistro",
        signatureDishes: "Beef Bourguignon with truffle mash (€28)\nPan-seared duck breast, cherry reduction (€26)\nSeafood risotto, saffron & lobster bisque (€24)\nClassic crème brûlée, Madagascar vanilla (€12)\nTarte Tatin, Calvados ice cream (€14)",
        services: "Starters: French onion soup (€10), Foie gras terrine (€18), Burrata & heirloom tomato (€14)\nMains: Beef Bourguignon (€28), Duck breast (€26), Sea bass en croûte (€30), Mushroom risotto (€20)\nDesserts: Crème brûlée (€12), Tarte Tatin (€14), Chocolate fondant (€13)\nWine pairing available: €25/person",
        capacity: "45 indoor, 20 terrace",
        priceRange: "€€€ Upscale",
        specialties: "Open kitchen, sommelier service, private dining room (12 guests), heated terrace, live jazz on Fridays",
        dietaryOptions: "Vegetarian menu available, Gluten-free options on all courses, Vegan dishes on request, Nut allergy accommodations",
        brandVoice: "Elegant & Refined",
        targetAudience: "Business lunches, couples, food enthusiasts, hotel guests",
        deliveryPlatforms: "In-house delivery (5km radius), Uber Eats",
    },
};

export default restaurantTheme;

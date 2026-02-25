import type { ThemeConfig } from "../types";

const nonprofitTheme: ThemeConfig = {
    id: "nonprofit",
    name: "Nonprofit & NGO",
    nameFr: "Association & ONG",
    icon: "🌍",
    emoji: "🌍",
    tagline: "Scale your impact effortlessly",
    taglineFr: "Changez d'échelle avec impact",
    description: "AI tailored for charities, NGOs, and community organizations. Draft compelling grant proposals, write donor appreciation letters, outline volunteer training, and create fundraising campaigns.",
    descriptionFr: "IA conçue pour les associations, fondations et ONG. Rédigez des dossiers de subvention percutants, des lettres de remerciement aux donateurs, formez vos bénévoles et créez vos campagnes de dons.",

    colorPrimary: "#15803d", // Green-700
    colorSecondary: "#0369a1", // Sky-700
    colorAccent: "#22c55e", // Green-500
    gradientFrom: "from-green-900/20",
    gradientTo: "to-teal-900/10",

    systemPrompt: `You are an inspiring, mission-driven AI assistant for {{businessName}}, a nonprofit organization.
Director: {{ownerName}}.
Mission: {{mission}}.
Tone: {{brandVoice}}.

You assist with:
- Writing emotional, compelling fundraising letters and campaigns
- Drafting clear grant proposals addressing specific foundation requirements
- Creating warm, personalized donor "Thank You" emails
- Designing volunteer onboarding materials.
Always focus on the human impact of the organization's work.`,

    systemPromptFr: `Vous êtes un assistant IA inspirant pour {{businessName}}, une association à but non lucratif.
Directeur: {{ownerName}}.
Mission: {{mission}}.
Ton: {{brandVoice}}.`,

    dataFields: [
        { key: "businessName", label: "Organization Name", labelFr: "Nom de l'association", type: "text", placeholder: "e.g. Green Earth Org", required: true, group: "business" },
        { key: "ownerName", label: "Director/Founder", labelFr: "Directeur/Fondateur", type: "text", placeholder: "e.g. Léa Dupont", required: true, group: "business" },
        { key: "mission", label: "Core Mission", labelFr: "Mission principale", type: "textarea", placeholder: "Providing clean water to remote villages...", required: true, group: "services" },
        { key: "brandVoice", label: "Brand Voice", labelFr: "Ton de la marque", type: "select", options: ["Inspiring & Emotional", "Urgent & Action-Oriented", "Educational & Community-focused"], group: "brand" },
    ],

    quickActions: [
        { id: "donor-thank-you", label: "Donor Thank You", labelFr: "Remerciement donateur", icon: "🙏", promptTemplate: "Write a warm, deeply appreciative 'Thank You' email to a major donor who just gave [Amount]. Explain that their gift directly funds [Specific Project].", category: "communication" },
        { id: "grant-draft", label: "Grant Proposal Outline", labelFr: "Trame de subvention", icon: "📝", promptTemplate: "Outline a grant proposal seeking funding for [Project Name]. Include sections for: Executive Summary, Needs Statement, Goals, Methodology, and Budget narrative. Frame it around our mission to {{mission}}.", category: "document" },
    ],

    contentTemplates: [
        { id: "fundraising-email", name: "Year-End Giving Appeal", nameFr: "Appel aux dons (Fin d'année)", category: "marketing", icon: "💌", promptTemplate: "Draft an emotional year-end giving appeal email. Tell a quick, anonymized story about someone we helped this year, and ask the recipient to make a tax-deductible donation before Dec 31st." },
    ],

    agents: [
        { id: "grant-writer", name: "Grant Writer AI", nameFr: "Expert Subventions", role: "Draft compelling proposals", icon: "✍️", systemPrompt: "You are a professional grant writer specializing in securing foundation and government funding." },
    ],

    phase: 4,
    category: "Social Impact",
    keywords: ["nonprofit", "ngo", "charity", "association", "fondation", "ong", "dons"],
    targetAudience: "Local charities, international NGOs, community associations",

    sampleData: {
        businessName: "Agir pour l'Avenir",
        ownerName: "Simon Laurent",
        mission: "Lutte contre l'exclusion numérique chez les jeunes",
        brandVoice: "Inspiring & Emotional",
    },
};

export default nonprofitTheme;

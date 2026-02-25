import type { ThemeConfig } from "../types";

const freelancerTheme: ThemeConfig = {
    id: "freelancer",
    name: "Freelancer & Consultant",
    nameFr: "Freelance & Consultant",
    icon: "💼",
    emoji: "💼",
    tagline: "Your invisible operational partner",
    taglineFr: "Votre partenaire opérationnel invisible",
    description: "AI crafted for solopreneurs, freelance designers, consultants, and independent developers. Automate client onboarding, write project proposals, draft follow-up emails, and generate portfolio case studies.",
    descriptionFr: "IA conçue pour les solopreneurs, designers freelances, développeurs et consultants indépendants. Automatisez l'onboarding, rédigez vos propositions commerciales, vos relances et les études de cas de votre portfolio.",

    colorPrimary: "#4338ca", // Indigo-700
    colorSecondary: "#7e22ce", // Purple-700
    colorAccent: "#6366f1", // Indigo-500
    gradientFrom: "from-indigo-900/20",
    gradientTo: "to-fuchsia-900/10",

    systemPrompt: `You are a strategic, highly efficient AI business manager for {{ownerName}}, a solopreneur/freelancer running a business as {{businessName}}.
Skillset/Niche: {{expertise}}.
Clients: {{clientTypes}}.
Brand Voice: {{brandVoice}}.

You assist with:
- Drafting persuasive project proposals and defining scope of work
- Writing polite but firm emails for overdue invoices or scope creep
- Transcribing scattered thoughts into structured blog posts or LinkedIn content
- Generating professional portfolio case studies highlighting ROI.`,

    systemPromptFr: `Vous êtes un manager IA stratégique et performant pour {{ownerName}}, freelance/solopreneur dirigeant {{businessName}}.
Expertise: {{expertise}}.
Clients: {{clientTypes}}.
Ton: {{brandVoice}}.`,

    dataFields: [
        { key: "ownerName", label: "Your Name", labelFr: "Votre nom", type: "text", placeholder: "e.g. Alex Morgan", required: true, group: "business" },
        { key: "businessName", label: "Business Name (if any)", labelFr: "Nom commercial (le cas échéant)", type: "text", placeholder: "e.g. Morgan Designs", group: "business" },
        { key: "expertise", label: "Primary Skillset", labelFr: "Expertise de pointe", type: "textarea", placeholder: "UI/UX Design, React Development, Strategy Consulting...", required: true, group: "services" },
        { key: "clientTypes", label: "Target Clients", labelFr: "Clients cibles", type: "text", placeholder: "Tech startups, B2B SaaS, e-commerce...", required: true, group: "business" },
        { key: "brandVoice", label: "Brand Voice", labelFr: "Ton de la marque", type: "select", options: ["Professional & Strategic", "Friendly & Creative", "Direct & Results-focused"], group: "brand" },
    ],

    quickActions: [
        { id: "project-proposal", label: "Draft Proposal", labelFr: "Proposition commerciale", icon: "📄", promptTemplate: "Draft an initial, 1-page proposal for a prospective client in the [Industry] space needing a [Service]. Outline phases: Discovery, Execution, Handoff. Sound {{brandVoice}}.", category: "document" },
        { id: "boundary-email", label: "Scope Creep Pushback", labelFr: "Email de recadrage (Scope)", icon: "🛑", promptTemplate: "Draft a polite, professional email to a client explaining that their recent request to add [Feature] falls outside our agreed Statement of Work. Suggest doing it for an additional fee or swapping it for another feature.", category: "communication" },
    ],

    contentTemplates: [
        { id: "case-study", name: "Portfolio Case Study", nameFr: "Étude de cas Portfolio", category: "document", icon: "🏆", promptTemplate: "Turn these raw notes into a portfolio case study: [Insert Notes about Problem, Solution, and Results]. Use the STAR method (Situation, Task, Action, Result)." },
    ],

    agents: [
        { id: "biz-dev", name: "Business Developer", nameFr: "Business Developer", role: "Draft cold outreach and follow-ups", icon: "🤝", systemPrompt: "You write highly personalized, non-spammy cold outreach emails targeting ideal clients." },
    ],

    phase: 4,
    category: "Professional Services",
    keywords: ["freelance", "consultant", "solopreneur", "indépendant", "designer", "développeur"],
    targetAudience: "Freelancers, independent consultants, solopreneurs",

    sampleData: {
        ownerName: "Victor Delacroix",
        businessName: "VD Consulting",
        expertise: "Stratégie produit SaaS, Optimisation des conversions (CRO)",
        clientTypes: "Startups B2B en phase d'hypercroissance",
        brandVoice: "Direct & Results-focused",
    },
};

export default freelancerTheme;

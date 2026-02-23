import type { ThemeConfig } from "../types";

const legalTheme: ThemeConfig = {
    id: "legal",
    name: "Law Firm & Legal Practice",
    nameFr: "Cabinet d'Avocats & Juridique",
    icon: "⚖️",
    emoji: "⚖️",
    tagline: "Your AI-powered legal assistant",
    taglineFr: "Votre assistant juridique IA",
    description: "AI tailored for law firms, solo attorneys, and legal practices. Draft contracts, analyze documents, manage client communications, and streamline compliance — all powered by AI that understands legal language.",
    descriptionFr: "IA adaptée aux cabinets d'avocats, avocats indépendants et pratiques juridiques. Rédigez des contrats, analysez des documents, gérez les communications clients et simplifiez la conformité.",

    colorPrimary: "#1e3a5f",
    colorSecondary: "#c9a84c",
    colorAccent: "#2563eb",
    gradientFrom: "from-blue-900/20",
    gradientTo: "to-slate-900/10",

    systemPrompt: `You are a professional AI assistant for {{businessName}}, a law firm specializing in {{specialties}}. 
Owner/Managing Partner: {{ownerName}}. Location: {{location}}.
Services offered: {{services}}.
Office hours: {{operatingHours}}.
Communication style: {{brandVoice}} and always professional.
Key policies: {{policies}}.
Team: {{teamMembers}}.

You assist with:
- Drafting legal documents, letters, and briefs
- Client communication and intake
- Legal research summaries
- Scheduling and case management
- Compliance checklists
Always include appropriate legal disclaimers. Never provide actual legal advice — frame as drafts for attorney review.`,

    systemPromptFr: `Vous êtes un assistant IA professionnel pour {{businessName}}, un cabinet d'avocats spécialisé en {{specialties}}.
Associé principal: {{ownerName}}. Localisation: {{location}}.
Services proposés: {{services}}.
Horaires: {{operatingHours}}.
Style de communication: {{brandVoice}} et toujours professionnel.
Politique: {{policies}}.
Incluez toujours les mentions légales appropriées.`,

    dataFields: [
        { key: "businessName", label: "Firm Name", labelFr: "Nom du cabinet", type: "text", placeholder: "e.g. Martin & Associates", required: true, group: "business" },
        { key: "ownerName", label: "Managing Partner", labelFr: "Associé principal", type: "text", placeholder: "e.g. Sarah Martin, Esq.", required: true, group: "business" },
        { key: "location", label: "Office Location", labelFr: "Adresse du cabinet", type: "text", placeholder: "e.g. 123 Main St, Paris", required: true, group: "business" },
        { key: "phone", label: "Phone", labelFr: "Téléphone", type: "text", placeholder: "+33 1 23 45 67 89", group: "business" },
        { key: "email", label: "Email", labelFr: "Email", type: "text", placeholder: "contact@firm.com", group: "business" },
        { key: "website", label: "Website", labelFr: "Site web", type: "text", placeholder: "https://firm.com", group: "business" },
        { key: "operatingHours", label: "Office Hours", labelFr: "Horaires", type: "text", placeholder: "Mon-Fri 9AM-6PM", group: "business" },
        { key: "specialties", label: "Practice Areas", labelFr: "Domaines de pratique", type: "textarea", placeholder: "Corporate Law, Real Estate, Family Law, Litigation...", required: true, group: "services" },
        { key: "services", label: "Services Offered", labelFr: "Services proposés", type: "textarea", placeholder: "Contract drafting, legal consultation, mediation, court representation...", required: true, group: "services" },
        { key: "teamMembers", label: "Team Members", labelFr: "Équipe", type: "textarea", placeholder: "Sarah Martin - Managing Partner\nJohn Doe - Associate\nJane Smith - Paralegal", group: "services" },
        { key: "brandVoice", label: "Communication Style", labelFr: "Style de communication", type: "select", options: ["Formal & Authoritative", "Professional & Approachable", "Warm & Client-Focused"], group: "brand" },
        { key: "policies", label: "Key Policies", labelFr: "Politiques clés", type: "textarea", placeholder: "Free initial consultation (30 min), billing by the hour, conflict checks required...", group: "advanced" },
        { key: "certifications", label: "Bar Admissions & Certifications", labelFr: "Barreaux & Certifications", type: "textarea", placeholder: "Paris Bar, Certified Mediator...", group: "advanced" },
        { key: "targetAudience", label: "Target Clients", labelFr: "Clientèle cible", type: "text", placeholder: "SMBs, startups, individuals...", group: "advanced" },
    ],

    quickActions: [
        { id: "client-intake", label: "Draft Client Intake Form", labelFr: "Formulaire de prise en charge", icon: "📋", promptTemplate: "Create a professional client intake form for {{businessName}}, a law firm specializing in {{specialties}}. Include fields for: client information, case type, brief description, urgency level, preferred contact method, and a section for conflict check.", category: "document" },
        { id: "demand-letter", label: "Draft Demand Letter", labelFr: "Rédiger une mise en demeure", icon: "📝", promptTemplate: "Draft a professional demand letter template on behalf of {{businessName}} ({{ownerName}}, Managing Partner). Include placeholders for: opposing party, amount demanded, factual basis, legal basis, and response deadline. Specialties: {{specialties}}.", category: "document" },
        { id: "contract-review", label: "Contract Review Checklist", labelFr: "Checklist de révision de contrat", icon: "🔍", promptTemplate: "Create a comprehensive contract review checklist for {{businessName}}. Cover: parties, terms, obligations, liability, indemnification, termination, governing law, dispute resolution, and confidentiality clauses.", category: "analysis" },
        { id: "client-email", label: "Client Follow-Up Email", labelFr: "Email de suivi client", icon: "✉️", promptTemplate: "Draft a {{brandVoice}} follow-up email from {{businessName}} ({{ownerName}}) to a client after an initial consultation. Mention next steps, required documents, and estimated timeline. Firm phone: {{phone}}.", category: "communication" },
        { id: "blog-post", label: "Legal Blog Post", labelFr: "Article de blog juridique", icon: "📰", promptTemplate: "Write a 500-word blog post for {{businessName}}'s website about a common legal issue in {{specialties}}. Make it informative but accessible to non-lawyers. Include a call-to-action to schedule a consultation.", category: "content" },
        { id: "billing-summary", label: "Billing Summary Template", labelFr: "Résumé de facturation", icon: "💰", promptTemplate: "Create a clear billing summary template for {{businessName}}. Include: client name, matter description, hours worked, hourly rate, disbursements, total amount due, payment terms, and trust account information.", category: "document" },
    ],

    contentTemplates: [
        { id: "linkedin-post", name: "LinkedIn Thought Leadership", nameFr: "Post LinkedIn Leadership", category: "social", icon: "💼", promptTemplate: "Write a professional LinkedIn post for {{ownerName}} of {{businessName}} about a trending legal topic in {{specialties}}. Keep it insightful, under 300 words, with a personal perspective." },
        { id: "newsletter", name: "Monthly Client Newsletter", nameFr: "Newsletter mensuelle", category: "email", icon: "📧", promptTemplate: "Draft a monthly newsletter for {{businessName}}'s clients. Include: a legal update relevant to {{specialties}}, upcoming events or deadlines, and a brief case highlight (anonymized). Tone: {{brandVoice}}." },
        { id: "case-brief", name: "Case Brief Template", nameFr: "Modèle de note de synthèse", category: "document", icon: "📄", promptTemplate: "Create a case brief template for {{businessName}}'s internal use. Sections: Facts, Issues, Holdings, Reasoning, Disposition. Include instructions for each section." },
    ],

    agents: [
        { id: "legal-researcher", name: "Legal Researcher", nameFr: "Chercheur juridique", role: "Research legal precedents and statutes", icon: "🔍", systemPrompt: "You are a legal research assistant for {{businessName}}. Provide thorough, cited legal research relevant to {{specialties}}." },
        { id: "client-comms", name: "Client Communications", nameFr: "Communications clients", role: "Draft professional client correspondence", icon: "✉️", systemPrompt: "You draft professional client communications for {{businessName}}. Tone: {{brandVoice}}. Always include appropriate disclaimers." },
        { id: "doc-drafter", name: "Document Drafter", nameFr: "Rédacteur de documents", role: "Draft legal documents and templates", icon: "📝", systemPrompt: "You draft legal documents for {{businessName}} specializing in {{specialties}}. All documents are drafts for attorney review." },
    ],

    phase: 1,
    category: "Professional Services",
    keywords: ["law", "legal", "attorney", "lawyer", "firm", "avocat", "juridique", "cabinet"],
    targetAudience: "Solo attorneys, small-to-medium law firms, in-house legal teams",

    sampleData: {
        businessName: "Martin & Associates",
        ownerName: "Sarah Martin, Esq.",
        location: "42 Rue de Rivoli, 75001 Paris",
        phone: "+33 1 42 60 00 00",
        email: "contact@martin-associates.fr",
        website: "https://martin-associates.fr",
        operatingHours: "Monday–Friday 9:00–18:00",
        specialties: "Corporate Law, Real Estate Transactions, Commercial Litigation",
        services: "Contract drafting & review, Legal consultation, Mergers & acquisitions, Commercial lease negotiation, Dispute resolution & mediation, Regulatory compliance",
        teamMembers: "Sarah Martin - Managing Partner, Corporate Law\nPierre Dubois - Associate, Real Estate\nMarie Laurent - Paralegal",
        brandVoice: "Professional & Approachable",
        policies: "Free initial consultation (30 min), Transparent billing (€300/hr), Conflict checks mandatory, Client confidentiality guaranteed",
        certifications: "Paris Bar Association, Certified Mediator (CMAP)",
        targetAudience: "SMBs, startups, real estate developers, entrepreneurs",
    },
};

export default legalTheme;

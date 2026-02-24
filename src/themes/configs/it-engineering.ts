import type { ThemeConfig } from "../types";

const itEngineeringTheme: ThemeConfig = {
    id: "it-engineering",
    name: "Software Engineering",
    nameFr: "Génie Logiciel",
    icon: "💻",
    emoji: "⚙️",
    tagline: "Ship code faster with your autonomous dev team.",
    taglineFr: "Déployez plus vite avec votre équipe de dèv autonome.",
    description: "The complete agile workspace: architecture, coding, code reviews, and DevOps.",
    descriptionFr: "L'espace de travail agile complet : architecture, code, revues et DevOps.",

    // Visual
    colorPrimary: "#3b82f6", // Blue
    colorSecondary: "#8b5cf6", // Violet
    colorAccent: "#f43f5e", // Rose
    gradientFrom: "from-blue-500",
    gradientTo: "to-violet-500",

    // AI
    systemPrompt: "You are an Elite Software Architect and Developer. You write clean, modular, and typed code. You always consider performance, security, and scalability. When giving coding instructions, provide exact terminal commands and file structures.",
    systemPromptFr: "Vous êtes un Architecte Logiciel d'Élite. Vous écrivez du code propre, modulaire et typé. Pensez toujours aux performances, à la sécurité et à la scalabilité.",

    // Configuration
    dataFields: [
        {
            key: "projectName",
            label: "Project / Team Name",
            labelFr: "Nom du Projet / Équipe",
            type: "text",
            placeholder: "e.g., Prime AI Core",
            required: true,
            group: "business",
        },
        {
            key: "techStack",
            label: "Tech Stack",
            labelFr: "Stack Technique",
            type: "textarea",
            placeholder: "e.g., Next.js, TypeScript, Tailwind, Supabase",
            required: true,
            group: "services",
        },
        {
            key: "codingStandards",
            label: "Coding Standards / Architecture",
            labelFr: "Standard de Code / Architecture",
            type: "textarea",
            placeholder: "e.g., Functional components, strict typing, hexagonal architecture...",
            group: "advanced",
        },
    ],

    quickActions: [
        {
            id: "code-review",
            label: "Code Review",
            labelFr: "Revue de Code",
            icon: "👀",
            promptTemplate: "Review the attached code based on our {{techStack}} stack and following our standards: {{codingStandards}}. Point out security flaws and optimization opportunities.",
            category: "analysis",
        },
        {
            id: "generate-tests",
            label: "Generate Tests",
            labelFr: "Générer Tests",
            icon: "🧪",
            promptTemplate: "Write comprehensive unit tests for the complex logic in our {{projectName}} module using our stack guidelines ({{techStack}}).",
            category: "content",
        },
    ],

    contentTemplates: [
        {
            id: "prd",
            name: "Product Requirements Document",
            nameFr: "Document de Spécifications",
            category: "document",
            promptTemplate: "Generate a PRD for a new feature in {{projectName}}. Follow agile formatting (User Stories, Acceptance Criteria) targeting our stack: {{techStack}}.",
            icon: "📋",
        },
        {
            id: "architecture-design",
            name: "Architecture Blueprint",
            nameFr: "Plan d'Architecture",
            category: "internal",
            promptTemplate: "Design a scalable architecture blueprint for {{projectName}} utilizing {{techStack}}. Detail the data flow, services, and deployment strategy.",
            icon: "🏗️",
        },
    ],

    agents: [
        {
            id: "tech-lead",
            name: "Ada",
            nameFr: "Ada",
            role: "Software Architect",
            icon: "📐",
            systemPrompt: "You are the Software Architect. You focus on system design, database schemas, and avoiding technical debt.",
        },
        {
            id: "senior-dev",
            name: "Linus",
            nameFr: "Linus",
            role: "Senior Developer",
            icon: "💻",
            systemPrompt: "You are the Senior Developer. You write the actual implementation code, fix bugs, and optimize performance.",
        },
        {
            id: "devops",
            name: "Kelsey",
            nameFr: "Kelsey",
            role: "DevOps Engineer",
            icon: "🚀",
            systemPrompt: "You are the DevOps Engineer. You handle CI/CD, Docker configurations, infrastructure as code, and deployment scripts.",
        },
    ],

    // Meta
    phase: 2,
    category: "Technology",
    keywords: ["software", "engineering", "it", "developer", "coding"],
    targetAudience: "Software Engineers and Tech Teams",

    sampleData: {
        projectName: "Quantum Dashboard",
        techStack: "React, TypeScript, Node.js, PostgreSQL",
        codingStandards: "Strict TypeScript, ESLint, Prettier, Jest for testing",
    },
};

export default itEngineeringTheme;

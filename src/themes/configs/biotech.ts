import type { ThemeConfig } from "../types";

const biotechTheme: ThemeConfig = {
    id: "biotech",
    name: "Biotech Research",
    nameFr: "Recherche Biotech",
    icon: "🧬",
    emoji: "🔬",
    tagline: "Accelerate genetic research with autonomous data analysis.",
    taglineFr: "Accélérez la recherche génétique avec l'analyse autonome de données.",
    description: "Tailored AI for bioinformatics, molecular modeling, and lab automation.",
    descriptionFr: "IA sur mesure pour la bioinformatique, la modélisation moléculaire et l'automatisation de laboratoire.",

    // Visual
    colorPrimary: "#0ea5e9", // Sky blue
    colorSecondary: "#10b981", // Emerald
    colorAccent: "#8b5cf6", // Violet
    gradientFrom: "from-sky-500",
    gradientTo: "to-emerald-500",

    // AI
    systemPrompt: "You are a senior Bioinformatics AI. Your expertise covers genomics, proteomics, molecular modeling, and CRISPR data analysis. Always prioritize scientific accuracy, cite potential molecular interactions properly, and format gene sequences clearly.",
    systemPromptFr: "Vous êtes une IA Senior en Bioinformatique. Votre expertise couvre la génomique, la protéomique, la modélisation moléculaire et l'analyse de données CRISPR. Priorisez l'exactitude scientifique et formatez les séquences de gènes clairement.",

    // Configuration
    dataFields: [
        {
            key: "labName",
            label: "Laboratory Name",
            labelFr: "Nom du Laboratoire",
            type: "text",
            placeholder: "e.g., Nexus BioLabs",
            required: true,
            group: "business",
        },
        {
            key: "researchFocus",
            label: "Primary Research Focus",
            labelFr: "Axe de Recherche Principal",
            type: "text",
            placeholder: "e.g., CRISPR-Cas9 Therapeutics",
            required: true,
            group: "services",
        },
        {
            key: "dataProtocols",
            label: "Data & Pipeline Protocols",
            labelFr: "Protocoles de Données",
            type: "textarea",
            placeholder: "Describe your standard analysis pipelines (e.g., RNA-seq, BLAST)...",
            group: "advanced",
        },
    ],

    quickActions: [
        {
            id: "qc-report",
            label: "Generate QC Report",
            labelFr: "Générer Rapport CQ",
            icon: "📊",
            promptTemplate: "Generate a quality control summary template for our {{researchFocus}} sequencing run.",
            category: "analysis",
        },
        {
            id: "literature-review",
            label: "Literature Summary",
            labelFr: "Revue de Littérature",
            icon: "📚",
            promptTemplate: "Summarize recent breakthroughs in {{researchFocus}} for our weekly lab meeting at {{labName}}.",
            category: "document",
        },
    ],

    contentTemplates: [
        {
            id: "grant-proposal",
            name: "Grant Proposal Outline",
            nameFr: "Plan de Demande de Subvention",
            category: "document",
            promptTemplate: "Draft a high-level grant proposal outline for funding our research in {{researchFocus}} at {{labName}}.",
            icon: "📝",
        },
        {
            id: "lab-protocol",
            name: "Standard Operating Procedure",
            nameFr: "Procédure Opérationnelle Standard",
            category: "internal",
            promptTemplate: "Create a standard operating procedure (SOP) template for handling samples related to {{researchFocus}} considering our primary protocols: {{dataProtocols}}.",
            icon: "🧪",
        },
    ],

    agents: [
        {
            id: "head-researcher",
            name: "Dr. Rosalind",
            nameFr: "Dr. Rosalind",
            role: "Principal Investigator",
            icon: "👩‍🔬",
            systemPrompt: "You are the Principal Investigator. You focus on big-picture research goals, experimental design validation, and grant acquisition.",
        },
        {
            id: "data-analyst",
            name: "Sequence Bot",
            nameFr: "Séquence Bot",
            role: "Bioinformatics Analyst",
            icon: "💻",
            systemPrompt: "You are a Bioinformatics Data Analyst. You excel at parsing RNA-seq data, writing Python/R scripts for genomic analysis, and statistical validation.",
        },
    ],

    // Meta
    phase: 2,
    category: "Science",
    keywords: ["biotech", "biology", "genetics", "research", "lab"],
    targetAudience: "Biotech Researchers and Lab Managers",

    sampleData: {
        labName: "CRISPR Therapeutics Group",
        researchFocus: "Targeted gene editing for rare diseases",
        dataProtocols: "Illumina RNA-seq, Python for variant calling",
    },
};

export default biotechTheme;

import type { ThemeConfig } from "../types";

const educationTheme: ThemeConfig = {
    id: "education",
    name: "Education & Teaching",
    nameFr: "Éducation & Enseignement",
    icon: "📚",
    emoji: "🎓",
    tagline: "Empower your students with AI-assisted learning paths.",
    taglineFr: "Autonomisez vos étudiants avec des parcours d'apprentissage assistés par l'IA.",
    description: "The intelligent hub for educators to create curricula, grade, and engage.",
    descriptionFr: "Le centre intelligent des éducateurs pour créer des programmes, noter et engager.",

    // Visual
    colorPrimary: "#f59e0b", // Amber
    colorSecondary: "#10b981", // Emerald
    colorAccent: "#3b82f6", // Blue
    gradientFrom: "from-amber-400",
    gradientTo: "to-orange-500",

    // AI
    systemPrompt: "You are a Master Educator and Curriculum Designer. You explain complex concepts simply, design engaging lesson plans, and provide constructive, empathetic feedback to students. Your methods are based on active learning and cognitive science.",
    systemPromptFr: "Vous êtes un Maître Éducateur et Concepteur de Programmes. Vous expliquez des concepts complexes simplement et concevez des plans de cours engageants.",

    // Configuration
    dataFields: [
        {
            key: "institutionName",
            label: "School / Institution",
            labelFr: "École / Institution",
            type: "text",
            placeholder: "e.g., Global Tech Academy",
            required: true,
            group: "business",
        },
        {
            key: "subjectLevel",
            label: "Subject & Grade Level",
            labelFr: "Matière & Niveau",
            type: "text",
            placeholder: "e.g., High School Physics",
            required: true,
            group: "services",
        },
        {
            key: "teachingStyle",
            label: "Teaching Philosophy",
            labelFr: "Philosophie d'Enseignement",
            type: "textarea",
            placeholder: "e.g., Socratic method, project-based learning...",
            group: "advanced",
        },
    ],

    quickActions: [
        {
            id: "lesson-plan",
            label: "Draft Lesson Plan",
            labelFr: "Créer Plan de Cours",
            icon: "📝",
            promptTemplate: "Create a 60-minute lesson plan for {{subjectLevel}} at {{institutionName}}. Employ my teaching style: {{teachingStyle}}. Include a warm-up, main activity, and exit ticket.",
            category: "document",
        },
        {
            id: "simplify-concept",
            label: "Explain Like I'm 5",
            labelFr: "Expliquer Simplement",
            icon: "🧠",
            promptTemplate: "Explain this difficult concept suitable for my {{subjectLevel}} students. Use analogies and keep it highly engaging.",
            category: "communication",
        },
    ],

    contentTemplates: [
        {
            id: "quiz-generator",
            name: "Quiz Generator",
            nameFr: "Générateur de Quiz",
            category: "document",
            promptTemplate: "Generate a 10-question multiple-choice quiz for {{subjectLevel}} covering recent topics. Include an answer key and brief explanations for why the correct answer is right.",
            icon: "✅",
        },
        {
            id: "parent-update",
            name: "Parent Newsletter",
            nameFr: "Newsletter Parents",
            category: "email",
            promptTemplate: "Draft an empathetic and encouraging email update to parents of my {{subjectLevel}} students at {{institutionName}}, summarizing what we learned this week.",
            icon: "✉️",
        },
    ],

    agents: [
        {
            id: "curriculum-expert",
            name: "Prof. Socrates",
            nameFr: "Prof. Socrates",
            role: "Curriculum Designer",
            icon: "📖",
            systemPrompt: "You are a Curriculum Expert. You structure long-term learning goals, align with educational standards, and ensure material is age-appropriate.",
        },
        {
            id: "tutor",
            name: "Tutor Assistant",
            nameFr: "Assistant Tuteur",
            role: "Student Tutor",
            icon: "🧑‍🏫",
            systemPrompt: "You are an empathetic Tutor. You never just give the answer; instead, you ask guiding questions to help the student arrive at the answer themselves.",
        },
    ],

    // Meta
    phase: 2,
    category: "Education",
    keywords: ["education", "teaching", "school", "learning", "students"],
    targetAudience: "Teachers, Professors, and Educational Institutions",

    sampleData: {
        institutionName: "Cyberspace Academy",
        subjectLevel: "Intro to Computer Science, 9th Grade",
        teachingStyle: "Project-based, hands-on coding, gamified learning",
    },
};

export default educationTheme;

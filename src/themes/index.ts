// ═══════════════════════════════════════════════════════════════
// PRIME AI — Theme Registry
// Central registry of all industry themes
// ═══════════════════════════════════════════════════════════════

import type { ThemeConfig } from "./types";
import legalTheme from "./configs/legal";
import restaurantTheme from "./configs/restaurant";
import medicalTheme from "./configs/medical";

// ── All registered themes ──────────────────────────────────────
export const ALL_THEMES: ThemeConfig[] = [
    // Phase 1: Launch
    legalTheme,
    medicalTheme,
    restaurantTheme,
    // Phase 1 placeholders (to be built):
    // realEstateTheme,
    // ecommerceTheme,
    // accountingTheme,
];

// ── Lookup by ID ───────────────────────────────────────────────
export function getThemeById(id: string): ThemeConfig | undefined {
    return ALL_THEMES.find((t) => t.id === id);
}

// ── Get themes by phase ────────────────────────────────────────
export function getThemesByPhase(phase: number): ThemeConfig[] {
    return ALL_THEMES.filter((t) => t.phase === phase);
}

// ── Get themes by category ─────────────────────────────────────
export function getThemesByCategory(category: string): ThemeConfig[] {
    return ALL_THEMES.filter((t) => t.category === category);
}

// ── Search themes ──────────────────────────────────────────────
export function searchThemes(query: string): ThemeConfig[] {
    const q = query.toLowerCase();
    return ALL_THEMES.filter(
        (t) =>
            t.name.toLowerCase().includes(q) ||
            t.nameFr.toLowerCase().includes(q) ||
            t.keywords.some((k) => k.includes(q)) ||
            t.category.toLowerCase().includes(q)
    );
}

// ── Phase definitions ──────────────────────────────────────────
export const THEME_PHASES = [
    {
        phase: 1,
        name: "Launch",
        nameFr: "Lancement",
        themes: ["legal", "medical", "restaurant", "real-estate", "ecommerce", "accounting"],
        description: "High-impact verticals with the largest SMB markets",
    },
    {
        phase: 2,
        name: "Growth",
        nameFr: "Croissance",
        themes: ["fitness", "beauty", "construction", "education", "marketing-agency"],
        description: "Expanding to service-based industries",
    },
    {
        phase: 3,
        name: "Expansion",
        nameFr: "Expansion",
        themes: ["bakery", "photography", "cleaning", "pet-services", "travel"],
        description: "Niche markets with strong loyalty",
    },
    {
        phase: 4,
        name: "Niche",
        nameFr: "Niche",
        themes: ["automobile", "insurance", "nonprofit", "freelancer"],
        description: "Specialized verticals with unique needs",
    },
];

// ── Coming soon themes (not yet configured) ────────────────────
export const COMING_SOON_THEMES = [
    { id: "real-estate", name: "Real Estate", nameFr: "Immobilier", icon: "🏠", phase: 1 },
    { id: "ecommerce", name: "E-Commerce & Retail", nameFr: "E-Commerce & Retail", icon: "🛒", phase: 1 },
    { id: "accounting", name: "Accounting & Finance", nameFr: "Comptabilité & Finance", icon: "📊", phase: 1 },
    { id: "fitness", name: "Fitness & Coaching", nameFr: "Fitness & Coaching", icon: "💪", phase: 2 },
    { id: "beauty", name: "Beauty & Salon", nameFr: "Beauté & Salon", icon: "💇", phase: 2 },
    { id: "construction", name: "Construction", nameFr: "Construction", icon: "🔨", phase: 2 },
    { id: "education", name: "Education & Tutoring", nameFr: "Éducation & Tutorat", icon: "📚", phase: 2 },
    { id: "marketing-agency", name: "Marketing Agency", nameFr: "Agence Marketing", icon: "📢", phase: 2 },
    { id: "bakery", name: "Bakery & Patisserie", nameFr: "Boulangerie & Pâtisserie", icon: "🥐", phase: 3 },
    { id: "photography", name: "Photography", nameFr: "Photographie", icon: "📸", phase: 3 },
    { id: "cleaning", name: "Cleaning Service", nameFr: "Service de Nettoyage", icon: "🧹", phase: 3 },
    { id: "pet-services", name: "Pet Services", nameFr: "Services Animaliers", icon: "🐾", phase: 3 },
    { id: "travel", name: "Travel & Tourism", nameFr: "Voyage & Tourisme", icon: "✈️", phase: 3 },
    { id: "automobile", name: "Automobile & Garage", nameFr: "Automobile & Garage", icon: "🚗", phase: 4 },
    { id: "insurance", name: "Insurance & Broker", nameFr: "Assurance & Courtage", icon: "🛡️", phase: 4 },
    { id: "nonprofit", name: "Nonprofit & NGO", nameFr: "Association & ONG", icon: "🌍", phase: 4 },
    { id: "freelancer", name: "Freelancer & Consultant", nameFr: "Freelance & Consultant", icon: "💼", phase: 4 },
];

export { type ThemeConfig } from "./types";

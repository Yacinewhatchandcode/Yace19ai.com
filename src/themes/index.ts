// ═══════════════════════════════════════════════════════════════
// PRIME AI — Theme Registry
// Central registry of all industry themes
// ═══════════════════════════════════════════════════════════════

import type { ThemeConfig } from "./types";
import legalTheme from "./configs/legal";
import restaurantTheme from "./configs/restaurant";
import medicalTheme from "./configs/medical";
import biotechTheme from "./configs/biotech";
import itEngineeringTheme from "./configs/it-engineering";
import creativityTheme from "./configs/creativity";
import educationTheme from "./configs/education";
import realEstateTheme from "./configs/real-estate";
import ecommerceTheme from "./configs/ecommerce";
import accountingTheme from "./configs/accounting";
import fitnessTheme from "./configs/fitness";
import beautyTheme from "./configs/beauty";
import constructionTheme from "./configs/construction";
import marketingAgencyTheme from "./configs/marketing-agency";
import bakeryTheme from "./configs/bakery";
import photographyTheme from "./configs/photography";
import cleaningTheme from "./configs/cleaning";
import petServicesTheme from "./configs/pet-services";
import travelTheme from "./configs/travel";
import automobileTheme from "./configs/automobile";
import insuranceTheme from "./configs/insurance";
import nonprofitTheme from "./configs/nonprofit";
import freelancerTheme from "./configs/freelancer";

// ── All registered themes ──────────────────────────────────────
export const ALL_THEMES: ThemeConfig[] = [
    // Phase 1: Launch
    legalTheme,
    medicalTheme,
    restaurantTheme,
    realEstateTheme,
    ecommerceTheme,
    accountingTheme,
    // New Highly Tailored Platforms
    biotechTheme,
    itEngineeringTheme,
    creativityTheme,
    educationTheme,
    // Phase 2: Growth
    fitnessTheme,
    beautyTheme,
    constructionTheme,
    marketingAgencyTheme,
    // Phase 3: Expansion
    bakeryTheme,
    photographyTheme,
    cleaningTheme,
    petServicesTheme,
    travelTheme,
    // Phase 4: Niche
    automobileTheme,
    insuranceTheme,
    nonprofitTheme,
    freelancerTheme,
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
export const COMING_SOON_THEMES = [];

export { type ThemeConfig } from "./types";

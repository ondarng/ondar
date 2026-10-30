/**
 * Shared storefront template definition and theming configuration.
 * Governs layout, typography tokens, and visual styling across all 4 templates.
 */

export type TemplateId = "default" | "fashion" | "food" | "electronics";

export interface TemplateConfig {
  id: TemplateId;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  idealFor: string;
  previewColor: string;
  tokens: {
    fontSerif: boolean;
    headerStyle: "minimal" | "editorial" | "kitchen" | "tech";
    primaryColor: string;
    primaryButtonBg: string;
    primaryButtonText: string;
    cardAspect: "square" | "portrait" | "landscape";
    cardRadius: string;
    surfaceBg: string;
    textPrimary: string;
    textSecondary: string;
    borderSubtle: string;
    accentPillBg: string;
    accentPillText: string;
  };
}

export const STOREFRONT_TEMPLATES: Record<TemplateId, TemplateConfig> = {
  default: {
    id: "default",
    name: "Ondar Minimal",
    tagline: "Clean, light & universal",
    description: "Universal clean layout with high legibility, category chips, and swift checkout. Ideal for any product catalog.",
    badge: "Free · Default",
    idealFor: "General Retail, Beauty, Lifestyle & Accessories",
    previewColor: "bg-[#00A859]",
    tokens: {
      fontSerif: false,
      headerStyle: "minimal",
      primaryColor: "#00A859",
      primaryButtonBg: "bg-[#00A859] hover:bg-[#00924C]",
      primaryButtonText: "text-white",
      cardAspect: "square",
      cardRadius: "rounded-2xl",
      surfaceBg: "bg-white",
      textPrimary: "text-neutral-900",
      textSecondary: "text-neutral-500",
      borderSubtle: "border-neutral-200/80",
      accentPillBg: "bg-[#E8F8EF]",
      accentPillText: "text-[#00A859]",
    },
  },
  fashion: {
    id: "fashion",
    name: "Zuri Luxe Fashion",
    tagline: "Editorial portrait grid & refined styling",
    description: "Editorial serif typography, 2-column portrait imagery, circular category stories, and high-fashion boutique aesthetics.",
    badge: "Free · Designer",
    idealFor: "Fashion, Apparel, Ready-to-Wear & African Luxury",
    previewColor: "bg-neutral-900",
    tokens: {
      fontSerif: true,
      headerStyle: "editorial",
      primaryColor: "#000000",
      primaryButtonBg: "bg-neutral-900 hover:bg-neutral-800",
      primaryButtonText: "text-white",
      cardAspect: "portrait",
      cardRadius: "rounded-none",
      surfaceBg: "bg-[#FDFDFD]",
      textPrimary: "text-neutral-900",
      textSecondary: "text-neutral-500",
      borderSubtle: "border-neutral-200",
      accentPillBg: "bg-neutral-100",
      accentPillText: "text-neutral-900",
    },
  },
  food: {
    id: "food",
    name: "Mama's Kitchen & Dining",
    tagline: "Appetizing food menu & culinary styling",
    description: "Warm peach and terracotta palette, rounded culinary cards, category tabs, and 1-tap quick add actions.",
    badge: "Free · Kitchen",
    idealFor: "Restaurants, Cloud Kitchens, Caterers & Food Vendors",
    previewColor: "bg-[#BA3C1D]",
    tokens: {
      fontSerif: true,
      headerStyle: "kitchen",
      primaryColor: "#BA3C1D",
      primaryButtonBg: "bg-[#BA3C1D] hover:bg-[#A33014]",
      primaryButtonText: "text-white",
      cardAspect: "square",
      cardRadius: "rounded-2xl",
      surfaceBg: "bg-[#FDFDFD]",
      textPrimary: "text-neutral-900",
      textSecondary: "text-neutral-600",
      borderSubtle: "border-neutral-200",
      accentPillBg: "bg-[#FCE7D2]",
      accentPillText: "text-[#BA3C1D]",
    },
  },
  electronics: {
    id: "electronics",
    name: "Cyber Tech & Gadgets",
    tagline: "High-density dark grid & tech aesthetics",
    description: "Dark slate theme with high-contrast electric cyan accents, specification chips, and computer village tech energy.",
    badge: "Free · New",
    idealFor: "Phones, Laptops, Gadgets & Computer Village Vendors",
    previewColor: "bg-[#38BDF8]",
    tokens: {
      fontSerif: false,
      headerStyle: "tech",
      primaryColor: "#38BDF8",
      primaryButtonBg: "bg-[#38BDF8] hover:bg-[#0EA5E9]",
      primaryButtonText: "text-slate-950 font-black",
      cardAspect: "square",
      cardRadius: "rounded-2xl",
      surfaceBg: "bg-[#0F172A]",
      textPrimary: "text-slate-100",
      textSecondary: "text-slate-400",
      borderSubtle: "border-slate-800",
      accentPillBg: "bg-slate-800",
      accentPillText: "text-sky-400",
    },
  },
};

export const TEMPLATE_LIST: TemplateConfig[] = Object.values(STOREFRONT_TEMPLATES);

/**
 * Resolves active template ID safely.
 * Non-destructive preview query parameter `?previewTemplate=` takes visual precedence
 * without persisting any change to the database.
 */
export function resolveTemplateId(
  savedId?: string | null,
  previewParam?: string | null
): TemplateId {
  const candidate = (previewParam || savedId || "default").toLowerCase().trim();
  if (candidate in STOREFRONT_TEMPLATES) {
    return candidate as TemplateId;
  }
  return "default";
}

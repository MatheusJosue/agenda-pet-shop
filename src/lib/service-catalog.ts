import type { ServicePrice, SizeCategory } from "@/lib/types/service-prices";

export type CatalogSize = "small" | "medium" | "large";

export const CATALOG_SIZE_LABELS: Record<CatalogSize, string> = {
  small: "Pequeno",
  medium: "Médio",
  large: "Grande",
};

export const CATALOG_SIZE_HINTS: Record<CatalogSize, string> = {
  small: "Até 10 kg",
  medium: "De 10 a 25 kg",
  large: "Acima de 25 kg",
};

export const CATALOG_SIZE_TO_SERVICE_SIZE: Record<CatalogSize, SizeCategory[]> = {
  small: ["tiny", "small"],
  medium: ["medium"],
  large: ["large", "giant"],
};

export const SERVICE_ALIASES = {
  bath: ["Banho"],
  hygienicGroom: ["Tosa Higiênica", "Tosa Higienica", "Tosa"],
  machineGroom: [
    "Máquina",
    "Maquina",
    "Banho + Tosa na Máquina",
    "Banho + Tosa na Maquina",
    "Banho + Tosa Máquina",
    "Banho + Tosa Maquina",
  ],
  scissorGroom: ["Tesoura", "Banho + Tosa na Tesoura", "Banho + Tosa Tesoura"],
  nailTrim: ["Corte de unhas", "Corte de Unhas"],
  hydration: ["Hidratação", "Hidratacao", "Hidroterapia"],
  detangle: ["Desembolo de nós", "Desembolo de nos", "Desembolo"],
} as const;

export const FLYER_FALLBACK_PRICES = {
  bath: { small: 60, medium: 80, large: 100 },
  hygienicGroom: { small: 10, medium: 20, large: 30 },
  machineGroom: { small: 90, medium: 105, large: 120 },
  scissorGroom: { small: 120, medium: 135, large: 150 },
  nailTrim: 15,
  hydration: 20,
  detangle: 20,
  packages: {
    small: { weekly: 200, fortnightly: 130, monthly: 70 },
    medium: { weekly: 260, fortnightly: 170, monthly: 90 },
    large: { weekly: 320, fortnightly: 210, monthly: 110 },
  },
} as const;

export function formatCatalogPrice(value?: number | null) {
  if (value == null || Number.isNaN(value)) return "Não cadastrado";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function serviceNameMatches(serviceName: string, aliases: readonly string[]) {
  const normalized = normalize(serviceName);
  return aliases.some((alias) => normalized === normalize(alias));
}

export function findCatalogPrice(
  prices: ServicePrice[],
  aliases: readonly string[],
  catalogSize: CatalogSize,
) {
  const sizePriority = CATALOG_SIZE_TO_SERVICE_SIZE[catalogSize];
  const matches = prices.filter((price) =>
    price.billing_type === "avulso" &&
    serviceNameMatches(price.service_name, aliases) &&
    sizePriority.includes(price.size_category)
  );

  if (matches.length === 0) return null;

  return matches.sort((a, b) => {
    const sizeDiff = sizePriority.indexOf(a.size_category) - sizePriority.indexOf(b.size_category);
    if (sizeDiff !== 0) return sizeDiff;
    if (a.hair_type === b.hair_type) return a.price - b.price;
    if (a.hair_type === "PC") return -1;
    if (b.hair_type === "PC") return 1;
    return 0;
  })[0];
}

export function findExactPetService(
  prices: ServicePrice[],
  aliases: readonly string[],
  petSize: SizeCategory,
  petHairType: "PC" | "PL",
) {
  const matches = prices.filter((price) =>
    price.size_category === petSize &&
    serviceNameMatches(price.service_name, aliases)
  );

  return (
    matches.find((price) => price.hair_type === petHairType) ||
    matches.find((price) => price.hair_type === null) ||
    matches[0] ||
    null
  );
}

export function getServiceDisplayName(serviceName: string) {
  if (serviceNameMatches(serviceName, SERVICE_ALIASES.bath)) return "Banho";
  if (serviceNameMatches(serviceName, SERVICE_ALIASES.hygienicGroom)) return "Tosa Higiênica";
  if (serviceNameMatches(serviceName, SERVICE_ALIASES.machineGroom)) return "Banho + Tosa na Máquina";
  if (serviceNameMatches(serviceName, SERVICE_ALIASES.scissorGroom)) return "Banho + Tosa na Tesoura";
  if (serviceNameMatches(serviceName, SERVICE_ALIASES.nailTrim)) return "Corte de unhas";
  if (serviceNameMatches(serviceName, SERVICE_ALIASES.hydration)) return "Hidratação";
  if (serviceNameMatches(serviceName, SERVICE_ALIASES.detangle)) return "Desembolo de nós";
  return serviceName;
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

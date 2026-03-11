const NOISE_PATTERNS: RegExp[] = [
  /^--\s*\d+\s+of\s+\d+\s*--$/i,
  /^p[aá]gina\s+\d+/i,
  /^saiba mais$/i,
  /^acesse nosso site$/i,
  /^acesse /i,
  /^clique na categoria/i,
  /^voltar ao in[ií]cio/i,
  /^www\./i,
  /^https?:\/\//i,
  /^@\w+/i,
  /^pcs\/cx:?/i,
  /^unid\.?\s*cx:?/i,
  /^c[oó]digo:?$/i,
  /^sku:?$/i,
  /^categoria:?$/i,
  /^importante$/i,
  /^índice$/i,
  /^pol[ií]tica de compra/i,
  /^suporte t[eé]cnico/i,
  /^observa[cç][aã]o:/i,
  /^promo[cç][aã]o$/i,
  /^-?\d+% off$/i,
  /^patinetes$/i,
  /^bicicletas el[eé]tricas$/i,
  /^triciclo el[eé]tricos$/i,
  /^scooters el[eé]tricas$/i,
  /^hoverboards?$/i,
  /^ufofast:?$/i,
];

const SPEC_PATTERNS: RegExp[] = [
  /pot[êe]ncia/i,
  /voltagem/i,
  /bateria/i,
  /capacidade/i,
  /dimens/i,
  /material/i,
  /entrada/i,
  /sa[ií]da/i,
  /tens[aã]o/i,
  /frequ[êe]ncia/i,
  /peso/i,
  /tamanho/i,
  /modo de opera/i,
  /componentes eletr/i,
  /liga de alum/i,
  /mah/i,
  /usb/i,
  /\bipx?\d+\b/i,
  /\bkm\/h\b/i,
  /\bkm\b/i,
  /\bkg\b/i,
  /\bwh\b/i,
  /\bah\b/i,
  /\bw\b/i,
  /\bcm\b/i,
  /\bmm\b/i,
  /freios?/i,
  /autonomia/i,
  /pneus?/i,
  /display/i,
  /motor/i,
  /amortecedor/i,
  /tempo de carregamento/i,
  /prova d[’']?[áa]gua/i,
  /capacidade m[aá]xima de carga/i,
  /velocidade m[aá]xima/i,
];

export function cleanLine(line: string) {
  return line
    .replace(/\u0000/g, " ")
    .replace(/\t/g, " ")
    .replace(/[•·▪■]/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .trim();
}

export function normalizeCatalogText(text: string) {
  return text
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function isPriceLine(line: string) {
  return /r\$\s*\d{1,3}(?:\.\d{3})*,\d{2}/i.test(line);
}

export function isSkuLine(line: string) {
  const l = line.trim();
  if (!l) return false;

  return (
    /^[A-Z]{1,5}-[A-Z0-9]{2,12}(?:-[A-Z0-9]{1,12}){0,3}$/i.test(l) ||
    /^[A-Z]{2,8}[0-9]{2,8}[A-Z0-9-]{0,8}$/i.test(l)
  );
}

export function normalizePrice(value: string) {
  const raw = value.replace(/[R$\s]/gi, "").trim();

  const cleaned = raw
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");

  const n = Number(cleaned);
  return Number.isFinite(n) ? Number(n.toFixed(2)) : 0;
}

export function extractPrice(line: string): number | null {
  const match = line.match(/r\$\s*([0-9]+(?:\.[0-9]{3})*,[0-9]{2})/i);
  if (!match) return null;

  const n = normalizePrice(match[1]);
  return n > 0 ? n : null;
}

export function isQtyBreakLine(line: string) {
  const l = cleanLine(line).toLowerCase();

  return (
    /^at[eé]\s*\d+\s*pe[cç]as:?$/i.test(l) ||
    /^\+\s*de\s*\d+\s*pe[cç]as:?$/i.test(l) ||
    /^m[ií]nimo de\s*\d+\s*pe[cç]as:?$/i.test(l)
  );
}

export function isCategoryLine(line: string) {
  const l = cleanLine(line).toLowerCase();

  return /^(categorias de produtos|índice|voltar ao in[ií]cio|acess[e]? .*|luatek|dp & luatek|patinetes?|bicicletas el[eé]tricas|triciclo el[eé]tricos|scooters el[eé]tricas|hoverboards?|lanternas|holofotes|lanternas de cabe[cç]a|luzes de emerg[êe]ncia|pain[eé]is solares|lampi[oõ]es|l[aâ]mpadas de emerg[êe]ncia|abajures|armadilhas el[eé]tricas|ventiladores)$/i.test(
    l
  );
}
export function isLikelyProductHeader(line: string) {
  const l = cleanLine(line);

  if (!l) return false;
  if (isPriceLine(l)) return false;
  if (isSkuLine(l)) return false;
  if (isQtyBreakLine(l)) return false;
  if (isCategoryLine(l)) return false;
  if (/^unid?\.?\s*cx:?$/i.test(l)) return false;
  if (/^pcs\/cx:?/i.test(l)) return false;

  const normalized = l.toUpperCase();

  const knownHeaders = [
    "LANTERNA MANUAL",
    "LANTERNA DE CABEÇA",
    "HOLOFOTE",
    "LUZ DE EMERGÊNCIA",
    "LÂMPADA DE EMERGÊNCIA",
    "ABAJUR",
    "VENTILADOR",
    "LAMPIÃO",
    "PAINEL SOLAR",
    "ARMADILHA ELÉTRICA",
    "SISTEMA DE LUZ SOLAR",
  ];

  if (knownHeaders.includes(normalized)) return true;

  if (
    /^[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ0-9\s/+()-]{6,40}$/.test(l) &&
    !/:/.test(l) &&
    !/\d{2,}/.test(l)
  ) {
    return true;
  }

  return false;
}

export function isNoiseLine(line: string) {
  const l = cleanLine(line).toLowerCase();
  if (!l) return true;

  if (/^[0-9]{2}[./][0-9]{2}(?:[./][0-9]{4})?$/.test(l)) return true;
  if (/^[#@]/.test(l)) return true;
  if (/^\d+$/.test(l)) return true;

  if (/^(un\.?|unid\.?|unid\.cx:?|pcs\/cx:?|cx:?|pe[cç]as?)$/i.test(l)) return true;
  if (/^un\.?\s*\d+\s*pcs\/cx:?$/i.test(l)) return true;
  if (/^unid\.?\.?cx:?\s*r?\$?/i.test(l)) return true;

  if (isQtyBreakLine(l)) return true;
  if (isCategoryLine(line)) return true;
  if (isPriceLine(line)) return false;

  if (NOISE_PATTERNS.some((rx) => rx.test(l))) return true;

  return false;
}

export function isBadProductTitle(line: string) {
  const l = cleanLine(line);

  if (!l) return true;
  if (isPriceLine(l)) return true;
  if (isQtyBreakLine(l)) return true;
  if (isCategoryLine(l)) return true;
  if (isPromoLine(l)) return true;
  if (isSpecLine(l)) return true;

  if (/^un\.?\s*\d+\s*pcs\/cx:?$/i.test(l)) return true;
  if (/^unid\.?\.?cx:?/i.test(l)) return true;
  if (/^r\$\s*\d/i.test(l)) return true;
  if (/^\(?[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ ]+\)?$/.test(l) && !isCommercialTitle(l)) return true;

  if (
    /^(acess[oó]rios|scooters?|hoverboards?|patinetes?|bicicletas?|triciclos?|novidades)$/i.test(
      l
    )
  ) {
    return true;
  }

  if (
    /^(dist[âa]ncia|dimens[õo]es|peso do ve[ií]culo|peso do produto|cubo da roda|velocidade m[aá]xima|rolamento de carga|tipo de bateria|capacidade de carga|tempo de uso|tempo de recarga|pot[êe]ncia|voltagem|material|bateria|led|l[âa]mpada|fun[cç][aã]o|entrada de carregamento|quantidade de leds|armazenamento de [áa]gua)/i.test(
      l.toLowerCase()
    )
  ) {
    return true;
  }

  return false;
}

export function isSpecLine(line: string) {
  const l = cleanLine(line).toLowerCase();
  if (!l) return false;
  return SPEC_PATTERNS.some((rx) => rx.test(l));
}

export function looksLikeProductTitle(line: string) {
  const l = cleanLine(line);
  if (!l) return false;

  if (isLikelyProductHeader(l)) return true;
  if (isBadProductTitle(l)) return false;
  if (isNoiseLine(l)) return false;
  if (isPriceLine(l)) return false;
  if (isSkuLine(l)) return false;
  if (isSpecLine(l)) return false;
  if (isQtyBreakLine(l)) return false;
  if (isCategoryLine(l)) return false;

  if (l.length < 4) return false;
  if (!/[a-záàâãéèêíìîóòôõúùûç]/i.test(l)) return false;

  return true;
}
export function isPromoLine(line: string) {
  const l = cleanLine(line).toLowerCase();

  return (
    /^acima de \d+ caixas?$/i.test(l) ||
    /^promo[cç][aã]o$/i.test(l) ||
    /^oferta$/i.test(l) ||
    /^novidades$/i.test(l) ||
    /^lançamento$/i.test(l)
  );
}

export function isCommercialTitle(line: string) {
  const l = cleanLine(line);
  if (!l) return false;

  if (isPriceLine(l)) return false;
  if (isSkuLine(l)) return false;
  if (isQtyBreakLine(l)) return false;
  if (isCategoryLine(l)) return false;
  if (isPromoLine(l)) return false;
  if (/^unid?\.?\s*cx:?$/i.test(l)) return false;
  if (/^pcs\/cx:?/i.test(l)) return false;
  if (/:/.test(l)) return false;

  const normalized = l.toUpperCase();

  const known = [
    "LANTERNA MANUAL",
    "MINI VENTILADOR",
    "VENTILADOR",
    "LANTERNA DE CABEÇA",
    "LANTERNA PORTATIL",
    "LANTERNA PORTÁTIL",
    "LANTERNA HOLOFOTE",
    "LANTERNA HOLOFOTE PORTÁTIL",
    "LANTERNA LED TÁTICA",
    "SOUNDBAR",
    "MICROFONE SEM FIO",
    "FONE DE OUVIDO PARA CAPACETE",
    "SUPORTE DE PISO RETRÁTIL",
    "MIXER PORTÁTIL",
    "MASSAGEADOR ELÉTRICO COM VENTOSA",
    "CAIXA DE SOM SOUNDBAR BLUETOOTH",
    "LANterna de mergulho".toUpperCase(),
    "SISTEMA DE LUZ SOLAR",
  ];

  if (known.includes(normalized)) return true;

  if (
    /^[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇa-záàâãéèêíìîóòôõúùûç0-9\s/+()-]{4,50}$/.test(l) &&
    !/\d{3,}/.test(l) &&
    !/[=:]/.test(l)
  ) {
    return true;
  }

  return false;
}

export function sanitizeCatalogLines(text: string) {
  const normalized = normalizeCatalogText(text);

  return normalized
    .split(/\n/)
    .map(cleanLine)
    .filter(Boolean)
    .filter((line) => !isNoiseLine(line));
}
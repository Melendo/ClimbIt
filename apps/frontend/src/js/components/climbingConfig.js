const DEFAULT_COLOR_SCALE_MAP = Object.freeze({
  blanco: '#ffffff',
  amarillo: '#fff176',
  naranja: '#fb8c00',
  rojo: '#e53935',
  rosa: '#ec407a',
  morado: '#8e24aa',
  azul: '#1e88e5',
  verde: '#43a047',
  gris: '#9e9e9e',
  negro: '#212121',
  marron: '#8d6e63',
});

export const ESTADOS_CONFIG = Object.freeze({
  flash: {
    icon: 'bolt',
    color: '#faca2a',
    bg: '#fef3c7',
    texto: 'Flash',
    backend: 'Flash',
    aliases: ['flash'],
  },
  completado: {
    icon: 'done',
    color: '#16a34a',
    bg: '#dcfce7',
    texto: 'Completado',
    backend: 'Completado',
    aliases: ['completado'],
  },
  proyecto: {
    icon: 'sync',
    color: '#2563eb',
    bg: '#dbeafe',
    texto: 'En proyecto',
    backend: 'Proyecto',
    aliases: ['proyecto', 'en-progreso'],
  },
  nada: {
    icon: 'remove',
    color: '#6b7280',
    bg: '#e5e7eb',
    texto: 'Sin registrar',
    backend: 'S/N',
    aliases: ['nada', 'S/N'],
  },
});

export const ESTADOS_BACKEND = Object.freeze(
  Object.fromEntries(
    Object.entries(ESTADOS_CONFIG).map(([key, value]) => [key, value.backend])
  )
);

export const ESTADOS_FRONTEND = Object.freeze(
  Object.fromEntries(
    Object.entries(ESTADOS_CONFIG).flatMap(([key, value]) =>
      value.aliases.map((alias) => [alias, key])
    )
  )
);

export function getEstadoConfig(estado) {
  return ESTADOS_CONFIG[ESTADOS_FRONTEND[estado] || estado] || ESTADOS_CONFIG.nada;
}

export function normalizeColorName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function hexToRgbColor(hexColor) {
  const normalizedHex = String(hexColor || '').trim().replace('#', '');

  if (!/^[\da-f]{3}([\da-f]{3})?$/i.test(normalizedHex)) {
    return null;
  }

  const expandedHex = normalizedHex.length === 3
    ? normalizedHex
      .split('')
      .map((value) => `${value}${value}`)
      .join('')
    : normalizedHex;

  const red = Number.parseInt(expandedHex.slice(0, 2), 16);
  const green = Number.parseInt(expandedHex.slice(2, 4), 16);
  const blue = Number.parseInt(expandedHex.slice(4, 6), 16);

  return `rgb(${red}, ${green}, ${blue})`;
}

export function normalizeColorToRgb(colorValue) {
  const normalizedValue = String(colorValue || '').trim();

  if (!normalizedValue) {
    return null;
  }

  if (/^rgba?\(/i.test(normalizedValue)) {
    return normalizedValue;
  }

  if (normalizedValue.startsWith('#')) {
    return hexToRgbColor(normalizedValue);
  }

  return null;
}

export function resolveColorScaleRgb(colorName, colorScaleMap = {}, fallbackColor = 'rgb(158, 158, 158)') {
  const normalizedName = normalizeColorName(colorName);
  const scaleColor = colorScaleMap?.[normalizedName] || colorName;
  return normalizeColorToRgb(scaleColor) || fallbackColor;
}

export function normalizeTipo(tipo) {
  const normalized = String(tipo || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  if (normalized === 'bloque' || normalized === 'boulder') return 'boulder';
  if (normalized === 'via') return 'via';
  return normalized;
}

/**
 * Resuelve los metadatos de dificultad coloreada para una ruta
 * @param {Object} ruta - La ruta
 * @param {Object} escalas - Las escalas de dificultad cargadas del rocódromo
 * @param {Object} colorScaleMap - Mapa de colores
 * @returns {Object} Objeto con difficultyIsColor y difficultyColorRgb
 */
export function resolveDifficultyColorMetadata(ruta, escalas, colorScaleMap = {}) {
  if (!ruta || !escalas) {
    return {
      difficultyIsColor: false,
      difficultyColorRgb: resolveColorScaleRgb(ruta?.dificultad, colorScaleMap),
    };
  }

  const tipoRuta = normalizeTipo(ruta?.tipo);
  const escalaByTipo = tipoRuta === 'boulder' 
    ? escalas?.escalaDificultadBloque 
    : tipoRuta === 'via' 
    ? escalas?.escalaDificultadVia 
    : null;

  const difficultyIsColor = Boolean(escalaByTipo?.isColor);
  const difficultyColorRgb = difficultyIsColor 
    ? resolveColorScaleRgb(ruta?.dificultad, colorScaleMap)
    : resolveColorScaleRgb(ruta?.dificultad, colorScaleMap);

  return {
    difficultyIsColor,
    difficultyColorRgb,
  };
}

export async function loadColorScaleMap() {
  return { ...DEFAULT_COLOR_SCALE_MAP };
}
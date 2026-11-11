/**
 * Base map style for MapLibre (vector tiles).
 *
 * Default: OpenFreeMap "dark" – free, no API key, no usage limits.
 * Optionally use a provider with your own key via EXPO_PUBLIC_* variables
 * (inlined at build time, e.g. in `.env.local`, Netlify or EAS):
 *
 *   EXPO_PUBLIC_MAP_PROVIDER=maptiler   # openfreemap | maptiler | stadia | custom
 *   EXPO_PUBLIC_MAP_KEY=...             # public client key – restrict it to your domains/apps
 *   EXPO_PUBLIC_MAP_STYLE=...           # openfreemap: dark | fiord | positron | liberty
 *                                       # custom: full style URL, may contain {key}
 */
export interface MapStyleConfig {
  provider: string;
  /** MapLibre style URL. */
  style: string;
  /** Font for place labels; must exist in the style's glyphs. Omit to hide labels. */
  labelFont?: string[];
}

const OPENFREEMAP_STYLES = ['dark', 'fiord', 'positron', 'liberty', 'bright'];

export const OPENFREEMAP: MapStyleConfig = {
  provider: 'openfreemap',
  style: 'https://tiles.openfreemap.org/styles/dark',
  labelFont: ['Noto Sans Regular'],
};

export interface MapEnv {
  provider?: string;
  key?: string;
  style?: string;
}

export function resolveMapStyle(env: MapEnv): MapStyleConfig {
  const provider = (env.provider ?? '').trim().toLowerCase();
  const key = encodeURIComponent((env.key ?? '').trim());
  const style = (env.style ?? '').trim();
  switch (provider) {
    case 'maptiler':
      if (!key) break;
      return {
        provider,
        style: `https://api.maptiler.com/maps/${style || 'dataviz-dark'}/style.json?key=${key}`,
        labelFont: ['Noto Sans Regular'],
      };
    case 'stadia':
      if (!key) break;
      return {
        provider,
        style: `https://tiles.stadiamaps.com/styles/${style || 'alidade_smooth_dark'}.json?api_key=${key}`,
        labelFont: ['Stadia Regular'],
      };
    case 'custom':
      if (!style) break;
      return { provider, style: style.replace('{key}', key) };
  }
  if (OPENFREEMAP_STYLES.includes(style)) {
    return { ...OPENFREEMAP, style: `https://tiles.openfreemap.org/styles/${style}` };
  }
  return OPENFREEMAP;
}

/** Style of this build (EXPO_PUBLIC_* must be read literally to be inlined). */
export function buildMapStyle(): MapStyleConfig {
  return resolveMapStyle({
    provider: process.env.EXPO_PUBLIC_MAP_PROVIDER,
    key: process.env.EXPO_PUBLIC_MAP_KEY,
    style: process.env.EXPO_PUBLIC_MAP_STYLE,
  });
}

export const colors = {
  bg: '#0b0b14',
  surface: '#14141f',
  surface2: '#1d1d2e',
  surface3: '#27273c',
  border: '#2e2e46',
  text: '#ececf5',
  muted: '#9a9ab5',
  faint: '#6b6b86',
  accent: '#b26bff',
  accentSoft: 'rgba(178,107,255,0.18)',
  open: '#3ddc97',
  closed: '#ff5c7a',
  unknown: '#f0b44c',
  demo: '#ff9f43',
};

export const stateColor = { open: colors.open, closed: colors.closed, unknown: colors.unknown } as const;

export const radius = { sm: 8, md: 12, lg: 18, pill: 999 };

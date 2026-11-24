export type AccentColorId = 'emerald' | 'blue' | 'gold' | 'violet';

export type ColorShade =
  | '50'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'
  | '950';

export interface AccentThemeDefinition {
  id: AccentColorId;
  name: string;
  subtitle: string;
  themeColor: string;
  previewPrimary: string;
  previewSecondary: string;
  previewLight: string;
  previewBorder: string;
  primary: Record<ColorShade, string>;
  secondary: Record<ColorShade, string>;
}

export const ACCENT_STORAGE_KEY = 'worship_accent_color';

export const ACCENT_THEMES: Record<AccentColorId, AccentThemeDefinition> = {
  emerald: {
    id: 'emerald',
    name: 'الأخضر',
    subtitle: 'الافتراضي',
    themeColor: '#065f46',
    previewPrimary: '#059669',
    previewSecondary: '#065f46',
    previewLight: '#ecfdf5',
    previewBorder: '#a7f3d0',
    primary: {
      '50': '236 253 245',
      '100': '209 250 229',
      '200': '167 243 208',
      '300': '110 231 183',
      '400': '52 211 153',
      '500': '16 185 129',
      '600': '5 150 105',
      '700': '4 120 87',
      '800': '6 95 70',
      '900': '6 78 59',
      '950': '2 44 34',
    },
    secondary: {
      '50': '240 253 250',
      '100': '204 251 241',
      '200': '153 246 228',
      '300': '94 234 212',
      '400': '45 212 191',
      '500': '20 184 166',
      '600': '13 148 136',
      '700': '15 118 110',
      '800': '17 94 89',
      '900': '19 78 74',
      '950': '4 47 46',
    },
  },
  blue: {
    id: 'blue',
    name: 'الأزرق',
    subtitle: 'ملكي هادئ',
    themeColor: '#1e40af',
    previewPrimary: '#2563eb',
    previewSecondary: '#1e40af',
    previewLight: '#eff6ff',
    previewBorder: '#bfdbfe',
    primary: {
      '50': '239 246 255',
      '100': '219 234 254',
      '200': '191 219 254',
      '300': '147 197 253',
      '400': '96 165 250',
      '500': '59 130 246',
      '600': '37 99 235',
      '700': '29 78 216',
      '800': '30 64 175',
      '900': '30 58 138',
      '950': '23 37 84',
    },
    secondary: {
      '50': '238 242 255',
      '100': '224 231 255',
      '200': '199 210 254',
      '300': '165 180 252',
      '400': '129 140 248',
      '500': '99 102 241',
      '600': '79 70 229',
      '700': '67 56 202',
      '800': '55 48 163',
      '900': '49 46 129',
      '950': '30 27 75',
    },
  },
  gold: {
    id: 'gold',
    name: 'الذهبي',
    subtitle: 'فاخر ودافئ',
    themeColor: '#78350f',
    previewPrimary: '#b45309',
    previewSecondary: '#78350f',
    previewLight: '#fffbeb',
    previewBorder: '#fde68a',
    primary: {
      '50': '255 251 235',
      '100': '254 243 199',
      '200': '253 230 138',
      '300': '252 211 77',
      '400': '234 179 8',
      '500': '202 138 4',
      '600': '161 98 7',
      '700': '133 77 14',
      '800': '113 63 18',
      '900': '92 50 14',
      '950': '66 32 6',
    },
    secondary: {
      '50': '255 247 237',
      '100': '255 237 213',
      '200': '254 215 170',
      '300': '253 186 116',
      '400': '245 158 11',
      '500': '180 83 9',
      '600': '146 64 14',
      '700': '120 53 15',
      '800': '98 43 12',
      '900': '79 34 10',
      '950': '56 22 6',
    },
  },
  violet: {
    id: 'violet',
    name: 'البنفسجي',
    subtitle: 'وقور وأنيق',
    themeColor: '#5b21b6',
    previewPrimary: '#7c3aed',
    previewSecondary: '#5b21b6',
    previewLight: '#f5f3ff',
    previewBorder: '#ddd6fe',
    primary: {
      '50': '245 243 255',
      '100': '237 233 254',
      '200': '221 214 254',
      '300': '196 181 253',
      '400': '167 139 250',
      '500': '139 92 246',
      '600': '124 58 237',
      '700': '109 40 217',
      '800': '91 33 182',
      '900': '76 29 149',
      '950': '46 16 101',
    },
    secondary: {
      '50': '250 245 255',
      '100': '243 232 255',
      '200': '233 213 255',
      '300': '216 180 254',
      '400': '192 132 252',
      '500': '168 85 247',
      '600': '147 51 234',
      '700': '126 34 206',
      '800': '107 33 168',
      '900': '88 28 135',
      '950': '59 7 100',
    },
  },
};

export const ACCENT_THEME_LIST: AccentThemeDefinition[] = [
  ACCENT_THEMES.emerald,
  ACCENT_THEMES.blue,
  ACCENT_THEMES.gold,
  ACCENT_THEMES.violet,
];

export function isValidAccentColorId(value: unknown): value is AccentColorId {
  return value === 'emerald' || value === 'blue' || value === 'gold' || value === 'violet';
}

export function getStoredAccentColor(): AccentColorId {
  try {
    const raw = localStorage.getItem(ACCENT_STORAGE_KEY);
    if (isValidAccentColorId(raw)) {
      return raw;
    }
  } catch {
    // ignore storage access issues
  }
  return 'emerald';
}

export function applyAccentColor(id: AccentColorId, persist = true): AccentThemeDefinition {
  const theme = ACCENT_THEMES[id] || ACCENT_THEMES.emerald;

  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    (Object.keys(theme.primary) as ColorShade[]).forEach((shade) => {
      root.style.setProperty(`--accent-${shade}`, theme.primary[shade]);
      root.style.setProperty(`--accent2-${shade}`, theme.secondary[shade]);
    });
    root.dataset.accent = theme.id;

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', theme.themeColor);
    }
  }

  if (persist) {
    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, theme.id);
    } catch {
      // ignore storage access issues
    }
  }

  return theme;
}

export interface ThemeType {
  theme: string;
  toggleTheme: () => void;
}

export interface FormatStore {
  format: string;
  setFormat: (f: string) => void;
}

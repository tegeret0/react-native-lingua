import tokens from "./tokens.json";

export const theme = tokens;

export type Theme = typeof theme;
export type ThemeColor = keyof Theme["colors"];
export type TypographyStyle = keyof Theme["typography"];

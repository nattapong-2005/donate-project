import { goalFontOptions } from './goalAppearance';

export const supporterModes = { recent: 'ผู้สนับสนุนล่าสุด', daily: 'อันดับผู้โดเนทวันนี้', monthly: 'อันดับผู้โดเนทเดือนนี้', allTime: 'อันดับผู้โดเนทตลอดเวลา' };
export type SupporterMode = keyof typeof supporterModes;
export const supporterDefaults = {
  supporter_mode: 'daily', supporter_title: '', supporter_font: 'LINESeedSansTH', supporter_layout: 'list',
  supporter_bg_color: '#0f172a', supporter_text_color: '#ffffff', supporter_amount_color: '#67e8f9',
  supporter_border_color: '#64748b', supporter_row_color: '#1e293b', supporter_rank_color: '#fbbf24', supporter_rank_bg_color: '#334155',
  supporter_opacity: '90', supporter_width: '600', supporter_padding: '24', supporter_radius: '20',
  supporter_title_size: '24', supporter_name_size: '20', supporter_amount_size: '20', supporter_row_gap: '8', supporter_limit: '5',
  supporter_show_bg: 'true', supporter_show_border: 'true', supporter_show_title: 'true', supporter_show_amount: 'true', supporter_show_rank: 'true', supporter_show_rank_bg: 'true',
};
export type SupporterAppearance = typeof supporterDefaults;
export const supporterRanges: Partial<Record<keyof SupporterAppearance, [number, number]>> = {
  supporter_opacity: [0, 100], supporter_width: [240, 1600], supporter_padding: [0, 80], supporter_radius: [0, 80],
  supporter_title_size: [12, 64], supporter_name_size: [12, 64], supporter_amount_size: [12, 64], supporter_row_gap: [0, 40], supporter_limit: [1, 10],
};
export function validSupporterAppearance(key: keyof SupporterAppearance, value: unknown): boolean {
  if (typeof value !== 'string') return false;
  if (key === 'supporter_title') return value.length <= 160;
  if (key === 'supporter_mode') return Object.prototype.hasOwnProperty.call(supporterModes, value);
  if (key === 'supporter_font') return goalFontOptions.some(font => font.value === value);
  if (key === 'supporter_layout') return ['list', 'cards'].includes(value);
  if (key.endsWith('_color')) return /^#[0-9a-f]{6}$/i.test(value);
  const range = supporterRanges[key];
  if (range) return value.trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= range[0] && Number(value) <= range[1] && (key !== 'supporter_limit' || Number.isInteger(Number(value)));
  return value === 'true' || value === 'false';
}
export function readSupporterAppearance(settings: Record<string, string>): SupporterAppearance {
  const appearance = { ...supporterDefaults };
  (Object.keys(appearance) as (keyof SupporterAppearance)[]).forEach(key => { if (validSupporterAppearance(key, settings[key])) appearance[key] = settings[key]; });
  return appearance;
}

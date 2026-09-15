export const goalFontOptions = [
  { value: 'LINESeedSansTH', label: 'LINE Seed Sans TH (Regular ปกติ)' },
  { value: 'LINESeedSansTH-ExtraBold', label: 'LINE Seed Sans TH (ExtraBold หนาพิเศษ)' },
];
export const goalAppearanceDefaults = {
  goal_show_border: 'true',
  goal_bar_style: 'glass', goal_bar_animated: 'true',
  goal_font: 'LINESeedSansTH',
  goal_bg_color: '#0f172a', goal_text_color: '#ffffff', goal_accent_color: '#67e8f9',
  goal_bar_color: '#3b82f6', goal_bar_end_color: '#22d3ee', goal_track_color: '#334155',
  goal_border_color: '#64748b', goal_opacity: '90', goal_width: '600', goal_padding: '24',
  goal_radius: '20', goal_title_size: '24', goal_amount_size: '20', goal_bar_height: '26',
  goal_show_percent: 'true', goal_show_amount: 'true', goal_gradient: 'true',
};
export type GoalAppearance = typeof goalAppearanceDefaults;
export const goalAppearanceRanges: Partial<Record<keyof GoalAppearance, [number, number]>> = {
  goal_opacity: [0, 100], goal_width: [240, 1600], goal_padding: [0, 80], goal_radius: [0, 80],
  goal_title_size: [12, 64], goal_amount_size: [12, 64], goal_bar_height: [8, 80],
};
export function validGoalAppearance(key: keyof GoalAppearance, value: unknown): boolean {
  if (typeof value !== 'string') return false;
  if (key === 'goal_bar_style') return ['glass', 'neon', 'striped', 'minimal'].includes(value);
  if (key === 'goal_font') return goalFontOptions.some(font => font.value === value);
  if (key.endsWith('_color')) return /^#[0-9a-f]{6}$/i.test(value);
  const range = goalAppearanceRanges[key];
  if (range) return value.trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= range[0] && Number(value) <= range[1];
  return value === 'true' || value === 'false';
}
export function readGoalAppearance(settings: Record<string, string>): GoalAppearance {
  const appearance = { ...goalAppearanceDefaults };
  (Object.keys(appearance) as (keyof GoalAppearance)[]).forEach(key => {
    if (validGoalAppearance(key, settings[key])) appearance[key] = settings[key];
  });
  return appearance;
}

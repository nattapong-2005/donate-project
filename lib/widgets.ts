import { GoalAppearance, readGoalAppearance } from './goalAppearance';
import { SupporterAppearance, readSupporterAppearance } from './supporterAppearance';
export interface Supporter { name: string; amount: number }
export interface WidgetData {
  goal: { title: string; target: number; current: number; appearance: GoalAppearance };
  supporterAppearance: SupporterAppearance;
  recent: Supporter[];
  daily: Supporter[];
  monthly: Supporter[];
  allTime: Supporter[];
}

export function summarizeWidgets(rows: { name: string; amount: number | string; created_at: string }[], settings: Record<string, string>, now = new Date()): WidgetData {
  const dateKey = (date: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  const today = dateKey(now);
  const supporterAppearance = readSupporterAppearance(settings);
  const limit = Number(supporterAppearance.supporter_limit);
  const start = settings.goal_started_at ? Date.parse(settings.goal_started_at) : 0;
  const totals = [new Map<string, number>(), new Map<string, number>(), new Map<string, number>()];
  let current = 0;
  const recent: Supporter[] = [];
  for (const row of rows) {
    const amount = Number(row.amount);
    const timestamp = Date.parse(row.created_at);
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(timestamp)) continue;
    const name = row.name.trim() || 'ผู้สนับสนุน';
    const day = dateKey(new Date(timestamp));
    if (timestamp >= start) current += amount;
    if (recent.length < limit) recent.push({ name, amount });
    [day === today, day.slice(0, 7) === today.slice(0, 7), true].forEach((include, index) => {
      if (include) totals[index].set(name, (totals[index].get(name) || 0) + amount);
    });
  }
  const rank = (map: Map<string, number>) => Array.from(map).map(([name, amount]) => ({ name, amount: Math.round(amount * 100) / 100 })).sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name, 'th')).slice(0, limit);
  const target = Number(settings.goal_target || 15000);
  return { goal: { title: settings.goal_title || 'เป้าหมายโดเนท', target: Number.isFinite(target) && target > 0 ? target : 15000, current: Math.round(current * 100) / 100, appearance: readGoalAppearance(settings) }, supporterAppearance, recent, daily: rank(totals[0]), monthly: rank(totals[1]), allTime: rank(totals[2]) };
}

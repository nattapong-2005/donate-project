export type TimerStatus = 'running' | 'paused' | 'stopped';
export type TimerAction = 'add' | 'subtract';
export type TimerTheme = 'glass' | 'neon' | 'minimal' | 'retro';

export interface TimerRule {
  id: string;
  amount: number;
  action: TimerAction;
  seconds: number;
  label?: string;
}

export interface TimerAppearance {
  theme: TimerTheme;
  title: string;
  font: string;
  bg_color: string;
  text_color: string;
  accent_color: string;
  border_color: string;
  opacity: number; // 0 - 100
  width: number;   // px
  padding: number; // px
  radius: number;  // px
  digits_size: number; // px
  title_size: number;  // px
  show_title: boolean;
  show_donor_badge: boolean;
  show_seconds: boolean;
}

export interface TimerConfig {
  timer_enabled: boolean;
  timer_status: TimerStatus;
  timer_initial_seconds: number;
  timer_remaining_seconds: number;
  timer_last_updated_at: string;
  timer_max_cap_seconds: number; // 0 = unlimited
  timer_base_rate_enabled: boolean;
  timer_base_rate_amount: number;
  timer_base_rate_seconds: number;
  timer_base_rate_action: TimerAction;
  timer_tier_rules: TimerRule[];
  timer_appearance: TimerAppearance;
}

export interface TimerEventPayload {
  remaining_seconds: number;
  status: TimerStatus;
  last_updated_at: string;
  delta_seconds?: number;
  donor_name?: string;
  donor_amount?: number;
  reason?: string;
}

export const defaultTimerAppearance: TimerAppearance = {
  theme: 'glass',
  title: '⏱️ SUBATHON TIMER',
  font: 'LINESeedSansTH',
  bg_color: '#0f172a',
  text_color: '#ffffff',
  accent_color: '#38bdf8',
  border_color: '#334155',
  opacity: 92,
  width: 480,
  padding: 24,
  radius: 20,
  digits_size: 54,
  title_size: 16,
  show_title: true,
  show_donor_badge: true,
  show_seconds: true,
};

export const defaultTimerConfig: TimerConfig = {
  timer_enabled: true,
  timer_status: 'paused',
  timer_initial_seconds: 3600,     // 1 hour
  timer_remaining_seconds: 3600,
  timer_last_updated_at: new Date(0).toISOString(),
  timer_max_cap_seconds: 86400,    // 24 hours
  timer_base_rate_enabled: true,
  timer_base_rate_amount: 5,        // every 5 THB
  timer_base_rate_seconds: 300,    // = 5 minutes
  timer_base_rate_action: 'add',
  timer_tier_rules: [
    { id: 'rule-50', amount: 50, action: 'subtract', seconds: 600, label: 'ยอด 50 บาท = ลบ 10 นาที' },
    { id: 'rule-100', amount: 100, action: 'add', seconds: 7200, label: 'ยอด 100 บาท = เพิ่ม 2 ชั่วโมง' },
  ],
  timer_appearance: defaultTimerAppearance,
};

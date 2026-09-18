import {
  TimerAction,
  TimerAppearance,
  TimerConfig,
  TimerRule,
  TimerStatus,
  defaultTimerAppearance,
  defaultTimerConfig
} from './timerTypes';

export function computeRemainingSeconds(state: {
  timer_status: TimerStatus;
  timer_remaining_seconds: number;
  timer_last_updated_at: string;
  timer_max_cap_seconds?: number;
}): number {
  const remaining = Number(state.timer_remaining_seconds) || 0;
  const maxCap = Number(state.timer_max_cap_seconds) || 0;

  if (state.timer_status !== 'running') {
    const clamped = Math.max(0, remaining);
    return maxCap > 0 ? Math.min(clamped, maxCap) : clamped;
  }

  const lastUpdateMs = Date.parse(state.timer_last_updated_at);
  if (!Number.isFinite(lastUpdateMs) || lastUpdateMs <= 0) {
    const clamped = Math.max(0, remaining);
    return maxCap > 0 ? Math.min(clamped, maxCap) : clamped;
  }

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - lastUpdateMs) / 1000));
  const current = Math.max(0, remaining - elapsedSeconds);

  return maxCap > 0 ? Math.min(current, maxCap) : current;
}

export function calculateTimerDelta(
  amount: number,
  config: TimerConfig
): { deltaSeconds: number; ruleMatched: string; action: TimerAction } {
  if (!config.timer_enabled) {
    return { deltaSeconds: 0, ruleMatched: 'disabled', action: 'add' };
  }

  const cleanAmount = Math.round(Number(amount) * 100) / 100;
  if (!Number.isFinite(cleanAmount) || cleanAmount <= 0) {
    return { deltaSeconds: 0, ruleMatched: 'invalid_amount', action: 'add' };
  }

  // 1. Check custom tier rules first (exact match)
  const matchedRule = (config.timer_tier_rules || []).find(
    rule => Math.abs(Number(rule.amount) - cleanAmount) < 0.01
  );

  if (matchedRule) {
    const sec = Math.max(0, Math.round(Number(matchedRule.seconds)));
    const delta = matchedRule.action === 'subtract' ? -sec : sec;
    return {
      deltaSeconds: delta,
      ruleMatched: matchedRule.label || `ยอดตรง ${matchedRule.amount} บาท`,
      action: matchedRule.action
    };
  }

  // 2. Check base rate ratio
  if (
    config.timer_base_rate_enabled &&
    Number(config.timer_base_rate_amount) > 0 &&
    Number(config.timer_base_rate_seconds) > 0
  ) {
    const ratio = cleanAmount / Number(config.timer_base_rate_amount);
    const calculatedSec = Math.round(ratio * Number(config.timer_base_rate_seconds));
    const delta = config.timer_base_rate_action === 'subtract' ? -calculatedSec : calculatedSec;
    return {
      deltaSeconds: delta,
      ruleMatched: `อัตราส่วน ${config.timer_base_rate_amount}฿ = ${config.timer_base_rate_seconds}s`,
      action: config.timer_base_rate_action
    };
  }

  return { deltaSeconds: 0, ruleMatched: 'none', action: 'add' };
}

export function formatTimerDisplay(totalSeconds: number): {
  formatted: string;
  hours: string;
  minutes: string;
  seconds: string;
  isZero: boolean;
} {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;

  const hours = String(h).padStart(2, '0');
  const minutes = String(m).padStart(2, '0');
  const seconds = String(s).padStart(2, '0');

  return {
    formatted: `${hours}:${minutes}:${seconds}`,
    hours,
    minutes,
    seconds,
    isZero: safe <= 0
  };
}

export function formatDeltaDisplay(deltaSeconds: number): string {
  if (deltaSeconds === 0) return '0s';
  const sign = deltaSeconds > 0 ? '+' : '-';
  const abs = Math.abs(deltaSeconds);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;

  if (h > 0) {
    return `${sign}${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${sign}${m}:${String(s).padStart(2, '0')}`;
}

export function readTimerAppearance(settings: Record<string, string>): TimerAppearance {
  const base = { ...defaultTimerAppearance };
  if (settings.timer_appearance) {
    try {
      const parsed = JSON.parse(settings.timer_appearance);
      return {
        ...base,
        ...parsed,
        show_background: parsed.show_background !== undefined ? Boolean(parsed.show_background) : base.show_background,
        show_digits_shadow: parsed.show_digits_shadow !== undefined ? Boolean(parsed.show_digits_shadow) : base.show_digits_shadow
      };
    } catch (e) {
      // fallback to individual keys or defaults
    }
  }

  if (settings.timer_theme && ['glass', 'neon', 'minimal', 'retro'].includes(settings.timer_theme)) {
    base.theme = settings.timer_theme as any;
  }
  if (settings.timer_title) base.title = settings.timer_title;
  if (settings.timer_bg_color) base.bg_color = settings.timer_bg_color;
  if (settings.timer_text_color) base.text_color = settings.timer_text_color;
  if (settings.timer_accent_color) base.accent_color = settings.timer_accent_color;
  if (settings.timer_border_color) base.border_color = settings.timer_border_color;
  if (settings.timer_opacity) base.opacity = Number(settings.timer_opacity) || base.opacity;
  if (settings.timer_width) base.width = Number(settings.timer_width) || base.width;
  if (settings.timer_padding) base.padding = Number(settings.timer_padding) || base.padding;
  if (settings.timer_radius) base.radius = Number(settings.timer_radius) || base.radius;
  if (settings.timer_digits_size) base.digits_size = Number(settings.timer_digits_size) || base.digits_size;
  if (settings.timer_title_size) base.title_size = Number(settings.timer_title_size) || base.title_size;
  if (settings.timer_show_background !== undefined) {
    base.show_background = settings.timer_show_background === 'true' || settings.timer_show_background === '1';
  }
  if (settings.timer_show_title !== undefined) {
    base.show_title = settings.timer_show_title === 'true' || settings.timer_show_title === '1';
  }
  if (settings.timer_show_donor_badge !== undefined) {
    base.show_donor_badge = settings.timer_show_donor_badge === 'true' || settings.timer_show_donor_badge === '1';
  }
  if (settings.timer_show_digits_shadow !== undefined) {
    base.show_digits_shadow = settings.timer_show_digits_shadow === 'true' || settings.timer_show_digits_shadow === '1';
  }
  if (settings.timer_digits_shadow_color) base.digits_shadow_color = settings.timer_digits_shadow_color;
  if (settings.timer_digits_shadow_blur !== undefined) base.digits_shadow_blur = Number(settings.timer_digits_shadow_blur) || base.digits_shadow_blur;
  if (settings.timer_digits_shadow_x !== undefined) base.digits_shadow_x = Number(settings.timer_digits_shadow_x) || base.digits_shadow_x;
  if (settings.timer_digits_shadow_y !== undefined) base.digits_shadow_y = Number(settings.timer_digits_shadow_y) || base.digits_shadow_y;

  return base;
}

export function readTimerConfig(settings: Record<string, string>): TimerConfig {
  const base = { ...defaultTimerConfig };

  const enabled = settings.timer_enabled !== undefined ? settings.timer_enabled === 'true' : base.timer_enabled;
  const status = (['running', 'paused', 'stopped'].includes(settings.timer_status)
    ? settings.timer_status
    : base.timer_status) as TimerStatus;

  const initialSec = Number(settings.timer_initial_seconds);
  const remainingSec = Number(settings.timer_remaining_seconds);
  const maxCapSec = Number(settings.timer_max_cap_seconds);

  let tierRules: TimerRule[] = base.timer_tier_rules;
  if (settings.timer_tier_rules) {
    try {
      const parsed = JSON.parse(settings.timer_tier_rules);
      if (Array.isArray(parsed)) tierRules = parsed;
    } catch (e) { }
  }

  return {
    timer_enabled: enabled,
    timer_status: status,
    timer_initial_seconds: Number.isFinite(initialSec) && initialSec >= 0 ? initialSec : base.timer_initial_seconds,
    timer_remaining_seconds: Number.isFinite(remainingSec) && remainingSec >= 0 ? remainingSec : base.timer_remaining_seconds,
    timer_last_updated_at: settings.timer_last_updated_at || base.timer_last_updated_at,
    timer_max_cap_seconds: Number.isFinite(maxCapSec) && maxCapSec >= 0 ? maxCapSec : base.timer_max_cap_seconds,
    timer_base_rate_enabled: settings.timer_base_rate_enabled !== undefined ? settings.timer_base_rate_enabled === 'true' : base.timer_base_rate_enabled,
    timer_base_rate_amount: Number(settings.timer_base_rate_amount) || base.timer_base_rate_amount,
    timer_base_rate_seconds: Number(settings.timer_base_rate_seconds) || base.timer_base_rate_seconds,
    timer_base_rate_action: (settings.timer_base_rate_action === 'subtract' ? 'subtract' : 'add') as TimerAction,
    timer_tier_rules: tierRules,
    timer_appearance: readTimerAppearance(settings)
  };
}

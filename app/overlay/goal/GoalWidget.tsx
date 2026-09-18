import { GoalAppearance, goalAppearanceDefaults } from '@/lib/goalAppearance';
import '../widgets.css';

export default function GoalWidget({ title, target, current, appearance = goalAppearanceDefaults }: { title: string; target: number; current: number; appearance?: GoalAppearance }) {
  const safeTarget = Number.isFinite(target) && target > 0 ? target : 15000;
  const percent = Math.min(100, Math.max(0, current / safeTarget * 100));
  const money = (value: number) => value.toLocaleString('th-TH', { maximumFractionDigits: 2 });
  return <section className="obs-widget goal-widget" style={{ fontFamily: `'${appearance.goal_font}', sans-serif`, width: `${appearance.goal_width}px`, maxWidth: '100%', padding: `${appearance.goal_padding}px`, borderRadius: `${appearance.goal_radius}px`, borderWidth: appearance.goal_show_border === 'false' ? 0 : 1, borderColor: appearance.goal_border_color, color: appearance.goal_text_color, background: `${appearance.goal_bg_color}${Math.round(Number(appearance.goal_opacity) * 2.55).toString(16).padStart(2, '0')}` }}>
    <h1 style={{ fontSize: `${appearance.goal_title_size}px` }}>{title}</h1>
    {appearance.goal_show_amount === 'true' && <div className="goal-values" style={{ fontSize: `${appearance.goal_amount_size}px` }}><strong>฿{money(current)}</strong><span>/ ฿{money(safeTarget)}</span></div>}
    <div className={`goal-track goal-track-${appearance.goal_bar_style}${appearance.goal_bar_animated === 'true' ? ' goal-track-animated' : ''}${percent >= 100 ? ' goal-track-complete' : ''}`} style={{ height: `${appearance.goal_bar_height}px`, borderRadius: `${appearance.goal_bar_radius ?? '50'}px`, background: appearance.goal_track_color, color: appearance.goal_bar_color }} role="progressbar" aria-label={title} aria-valuemin={0} aria-valuemax={safeTarget} aria-valuenow={Math.min(current, safeTarget)}>
      <div className="goal-fill" style={{ width: `${percent}%`, borderRadius: `${appearance.goal_bar_radius ?? '50'}px`, background: appearance.goal_gradient === 'true' ? `linear-gradient(90deg, ${appearance.goal_bar_color}, ${appearance.goal_bar_end_color})` : appearance.goal_bar_color }}>
        <span className="goal-bar-texture" aria-hidden="true" />
        <span className="goal-bar-gloss" aria-hidden="true" />
        <span className="goal-bar-shine" aria-hidden="true" />
        {appearance.goal_bar_shine === 'true' && (
          <>
            <span className="goal-bar-lead-flare" aria-hidden="true" />
            <span className="goal-bar-shine-sweep" aria-hidden="true">
              <span className="goal-bar-beam" />
              <span className="goal-bar-sparkle" />
            </span>
          </>
        )}
      </div>
    </div>
    {appearance.goal_show_percent === 'true' && <div className="goal-percent" style={{ color: appearance.goal_accent_color }}>{percent.toFixed(1)}%{current >= safeTarget ? ' · ถึงเป้าหมายแล้ว!' : ''}</div>}
  </section>;
}

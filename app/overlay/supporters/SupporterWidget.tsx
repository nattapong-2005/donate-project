import { Supporter } from '@/lib/widgets';
import { SupporterAppearance, SupporterMode, supporterModes } from '@/lib/supporterAppearance';
import '../widgets.css';

export default function SupporterWidget({ donors, appearance, mode }: { donors: Supporter[]; appearance: SupporterAppearance; mode: SupporterMode }) {
  const showBg = appearance.supporter_show_bg !== 'false';
  const bg = showBg ? `${appearance.supporter_bg_color}${Math.round(Number(appearance.supporter_opacity) * 2.55).toString(16).padStart(2, '0')}` : 'transparent';
  return <section className={`obs-widget supporter-widget supporter-layout-${appearance.supporter_layout}`} style={{ fontFamily: `'${appearance.supporter_font}', sans-serif`, width: `${appearance.supporter_width}px`, maxWidth: '100%', padding: `${appearance.supporter_padding}px`, borderRadius: `${appearance.supporter_radius}px`, borderWidth: appearance.supporter_show_border === 'true' ? 1 : 0, borderColor: appearance.supporter_border_color, color: appearance.supporter_text_color, background: bg }}>
    {appearance.supporter_show_title === 'true' && <h1 style={{ fontSize: `${appearance.supporter_title_size}px` }}>{appearance.supporter_title.trim() || supporterModes[mode]}</h1>}
    {donors.length ? <ol className="supporter-rows" style={{ gap: `${appearance.supporter_row_gap}px` }}>{donors.slice(0, Number(appearance.supporter_limit)).map((donor, index) => <li key={`${index}-${donor.name}`} style={{ background: appearance.supporter_layout === 'cards' ? appearance.supporter_row_color : 'transparent', borderColor: appearance.supporter_border_color }}>
      {mode !== 'recent' && appearance.supporter_show_rank === 'true' && <span className="supporter-rank" style={{ color: appearance.supporter_rank_color, background: appearance.supporter_show_rank_bg === 'false' ? 'transparent' : (appearance.supporter_rank_bg_color || '#334155') }}>{index + 1}</span>}
      <span className="supporter-name" style={{ fontSize: `${appearance.supporter_name_size}px` }}>{donor.name}</span>
      {appearance.supporter_show_amount === 'true' && <strong style={{ color: appearance.supporter_amount_color, fontSize: `${appearance.supporter_amount_size}px` }}>฿{donor.amount.toLocaleString('th-TH', { maximumFractionDigits: 2 })}</strong>}
    </li>)}</ol> : <p>ยังไม่มีผู้สนับสนุนในช่วงนี้</p>}
  </section>;
}

import { GoalAppearance, goalAppearanceDefaults, goalAppearanceRanges, goalFontOptions } from '@/lib/goalAppearance';
import GoalWidget from '@/app/overlay/goal/GoalWidget';

const colors: [keyof GoalAppearance, string][] = [
  ['goal_bg_color', 'พื้นหลังการ์ด'], ['goal_text_color', 'ข้อความและยอดเงิน'], ['goal_accent_color', 'เปอร์เซ็นต์'],
  ['goal_bar_color', 'หลอดเริ่มต้น'], ['goal_bar_end_color', 'หลอดปลายทาง'], ['goal_track_color', 'พื้นหลังหลอด'], ['goal_border_color', 'ขอบการ์ด'],
];
const sizes: [keyof GoalAppearance, string, string][] = [
  ['goal_width', 'ความกว้าง', 'px'], ['goal_padding', 'ระยะขอบด้านใน', 'px'], ['goal_radius', 'ความโค้งการ์ด', 'px'],
  ['goal_title_size', 'ขนาดชื่อเป้าหมาย', 'px'], ['goal_amount_size', 'ขนาดยอดเงิน', 'px'], ['goal_bar_height', 'ความสูงหลอด', 'px'], ['goal_opacity', 'ความทึบพื้นหลัง', '%'],
];
export default function GoalAppearanceEditor({ value, onChange, disabled, title, target }: { value: GoalAppearance; onChange: (value: GoalAppearance) => void; disabled: boolean; title: string; target: number }) {
  const update = (key: keyof GoalAppearance, next: string) => onChange({ ...value, [key]: next });
  return <div className="goal-editor"><div className="goal-editor-heading"><div><h2>ปรับหน้าตาเป้าหมาย</h2><p>พรีวิวเปลี่ยนทันที ส่วน OBS จะเปลี่ยนเมื่อกดบันทึก</p></div><button className="widget-button widget-button-total" type="button" disabled={disabled} onClick={() => onChange({ ...goalAppearanceDefaults })}>คืนค่ารูปแบบเริ่มต้น</button></div>
    <fieldset disabled={disabled} className="goal-editor-controls"><legend>ฟอนต์</legend>
      <label className="goal-font-control">ฟอนต์ตัวอักษร
        <select value={value.goal_font} onChange={event => update('goal_font', event.target.value)}>
          {goalFontOptions.map(font => <option key={font.value} value={font.value}>{font.label}</option>)}
        </select>
      </label>
    </fieldset>
    <fieldset disabled={disabled} className="goal-editor-controls"><legend>รูปแบบหลอด</legend><div className="goal-style-grid">
      {([['glass', 'แก้วมันวาว', 'ผิวใสสะท้อนแสง'], ['neon', 'นีออน', 'ขอบเรืองแสง'], ['striped', 'ลายเฉียง', 'ลายวิ่งมีชีวิตชีวา'], ['minimal', 'เรียบง่าย', 'สีสะอาดตา']] as const).map(([style, label, description]) => <button key={style} type="button" className={`goal-style-option${value.goal_bar_style === style ? ' selected' : ''}`} aria-pressed={value.goal_bar_style === style} onClick={() => update('goal_bar_style', style)}>
        <span className={`goal-style-sample goal-track goal-track-${style}`} aria-hidden="true"><span className="goal-fill"><span className="goal-bar-texture" /><span className="goal-bar-shine" /></span></span><strong>{label}</strong><small>{description}</small>
      </button>)}
    </div><label className="goal-animation-toggle"><input type="checkbox" checked={value.goal_bar_animated === 'true'} onChange={event => update('goal_bar_animated', String(event.target.checked))} />เปิดแสงและลายเคลื่อนไหว</label></fieldset>
    <fieldset disabled={disabled} className="goal-editor-controls"><legend>สี</legend><div className="goal-control-grid">{colors.map(([key, label]) => <label className="goal-color-control" key={key}><span>{label}</span><div><input type="color" aria-label={label} value={value[key]} onChange={event => update(key, event.target.value)} /><code>{value[key]}</code></div></label>)}</div></fieldset>
    <fieldset disabled={disabled} className="goal-editor-controls"><legend>ขนาดและพื้นหลัง</legend><div className="goal-control-grid">{sizes.map(([key, label, unit]) => { const [min, max] = goalAppearanceRanges[key]!; return <label className="goal-range-control" key={key}><span>{label}<strong>{value[key]} {unit}</strong></span><input type="range" min={min} max={max} value={value[key]} onChange={event => update(key, event.target.value)} /></label>; })}</div></fieldset>
    <fieldset disabled={disabled} className="goal-editor-controls"><legend>การแสดงผล</legend><div className="goal-toggle-grid">{([['goal_show_border', 'แสดงขอบการ์ดพื้นหลัง'], ['goal_gradient', 'ไล่สีหลอด'], ['goal_show_amount', 'แสดงยอดเงิน'], ['goal_show_percent', 'แสดงเปอร์เซ็นต์']] as [keyof GoalAppearance, string][]).map(([key, label]) => <label key={key}><input type="checkbox" checked={value[key] === 'true'} onChange={event => update(key, String(event.target.checked))} /><span>{label}</span></label>)}</div></fieldset>
    <div className="goal-draft-heading"><strong>พรีวิวก่อนบันทึก</strong><span>ยอดตัวอย่าง 60% ของเป้าหมาย</span></div><div className="goal-draft-preview"><GoalWidget title={title || 'เป้าหมายโดเนท'} target={target} current={(Number.isFinite(target) && target > 0 ? target : 15000) * .6} appearance={value} /></div>
  </div>;
}

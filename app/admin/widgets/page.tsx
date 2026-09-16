'use client';
import { useEffect, useState } from 'react';
import { Target, Trophy } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { GoalAppearance, goalAppearanceDefaults, readGoalAppearance } from '@/lib/goalAppearance';
import { SupporterAppearance, supporterDefaults, readSupporterAppearance } from '@/lib/supporterAppearance';
import GoalAppearanceEditor from './GoalAppearanceEditor';
import SupporterAppearanceEditor from './SupporterAppearanceEditor';
import './widgets-admin.css';

export default function WidgetsAdmin() {
  const { showToast, handleUnauthorized } = useAdmin();
  const [section, setSection] = useState<'goal' | 'supporters'>('goal');
  const [title, setTitle] = useState('เป้าหมายโดเนท');
  const [target, setTarget] = useState('15000');
  const [startedAt, setStartedAt] = useState('');
  const [origin, setOrigin] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState<'goal' | 'supporters' | null>(null);
  const [errors, setErrors] = useState({ goal: '', supporters: '' });
  const [previewVersion, setPreviewVersion] = useState({ goal: 0, supporters: 0 });
  const [appearance, setAppearance] = useState<GoalAppearance>({ ...goalAppearanceDefaults });
  const [supporters, setSupporters] = useState<SupporterAppearance>({ ...supporterDefaults });
  const [savedGoal, setSavedGoal] = useState<GoalAppearance>({ ...goalAppearanceDefaults });
  const [savedSupporters, setSavedSupporters] = useState<SupporterAppearance>({ ...supporterDefaults });

  useEffect(() => {
    setOrigin(window.location.origin);
    let active = true;
    fetch('/api/admin/settings').then(async response => {
      if (response.status === 401) { handleUnauthorized(); throw new Error('กรุณาเข้าสู่ระบบ'); }
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error('โหลดการตั้งค่าไม่สำเร็จ');
      if (active) {
        const goal = readGoalAppearance(result.settings);
        const supporter = readSupporterAppearance(result.settings);
        setAppearance(goal); setSavedGoal(goal); setSupporters(supporter); setSavedSupporters(supporter);
        setTitle(result.settings.goal_title || 'เป้าหมายโดเนท');
        setTarget(result.settings.goal_target || '15000');
        setStartedAt(result.settings.goal_started_at || '');
      }
    }).catch(error => { if (active) setLoadError(error.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [handleUnauthorized]);

  const save = async (event: React.FormEvent, kind: 'goal' | 'supporters') => {
    event.preventDefault();
    if (loading || loadError || saving) return;
    setSaving(kind); setErrors(previous => ({ ...previous, [kind]: '' }));
    const payload = kind === 'goal' ? { goal_title: title.trim(), goal_target: target, goal_started_at: startedAt, ...appearance } : { ...supporters };
    try {
      const response = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (response.status === 401) { handleUnauthorized(); return; }
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'บันทึกไม่สำเร็จ');
      if (kind === 'goal') setSavedGoal(readGoalAppearance(result.settings));
      else setSavedSupporters(readSupporterAppearance(result.settings));
      showToast(kind === 'goal' ? 'บันทึกเป้าหมายโดเนทแล้ว' : 'บันทึกอันดับผู้โดเนทแล้ว');
      setPreviewVersion(previous => ({ ...previous, [kind]: previous[kind] + 1 }));
    } catch (error) { setErrors(previous => ({ ...previous, [kind]: error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ' })); }
    finally { setSaving(null); }
  };

  const sourceLinks = (links: string[][]) => <div className="widget-section-links"><h2>ลิงก์สำหรับ OBS Browser Source</h2>{links.map(([label, path]) => <div className="widget-source" key={path}>
    <strong>{label}</strong><input aria-label={`ลิงก์ ${label}`} value={`${origin}${path}`} readOnly onFocus={event => event.target.select()} />
    <button className="widget-button widget-button-copy" type="button" onClick={async () => { try { await navigator.clipboard.writeText(`${origin}${path}`); showToast('คัดลอกลิงก์แล้ว'); } catch { showToast('กรุณาเลือกและคัดลอกลิงก์ในช่อง'); } }}>คัดลอก</button>
    <a className="widget-button widget-button-open" href={path} target="_blank" rel="noreferrer">เปิด</a>
  </div>)}</div>;
  const disabled = loading || !!loadError || saving !== null;
  const supporterHeight = Number(savedSupporters.supporter_padding) * 2 + (savedSupporters.supporter_show_title === 'true' ? Number(savedSupporters.supporter_title_size) * 2 : 0) + Number(savedSupporters.supporter_limit) * (Math.max(Number(savedSupporters.supporter_name_size), Number(savedSupporters.supporter_amount_size), 30) * 2 + 28 + Number(savedSupporters.supporter_row_gap)) + 40;

  return <div className="widgets-admin"><h1>วิดเจ็ต OBS</h1><p>ปรับหน้าตาและบันทึกแต่ละวิดเจ็ตแยกกัน พรีวิวเปลี่ยนทันที และ OBS ใช้รูปแบบเมื่อบันทึก</p>
    {loadError && <p role="alert" className="widget-error">{loadError}</p>}
    <div className="widget-tabs" role="tablist" aria-label="เลือกวิดเจ็ต">
      <button id="goal-tab" role="tab" type="button" aria-selected={section === 'goal'} aria-controls="goal-panel" className={`widget-tab${section === 'goal' ? ' active' : ''}`} onClick={() => setSection('goal')}><Target size={18} aria-hidden="true" />เป้าหมายโดเนท</button>
      <button id="supporters-tab" role="tab" type="button" aria-selected={section === 'supporters'} aria-controls="supporters-panel" className={`widget-tab${section === 'supporters' ? ' active' : ''}`} onClick={() => setSection('supporters')}><Trophy size={18} aria-hidden="true" />อันดับผู้โดเนท</button>
    </div>
    <section id="goal-panel" role="tabpanel" aria-labelledby="goal-tab" hidden={section !== 'goal'}>
      <form onSubmit={event => void save(event, 'goal')} className="widget-settings"><h2>เป้าหมายโดเนท</h2>
        {errors.goal && <p role="alert" className="widget-error">{errors.goal}</p>}
        <label>ชื่อเป้าหมาย<input value={title} onChange={event => setTitle(event.target.value)} maxLength={160} required disabled={disabled} /></label>
        <label>ยอดเป้าหมาย (บาท)<input type="number" min="0.01" max="9999999999" step="0.01" value={target} onChange={event => setTarget(event.target.value)} required disabled={disabled} /></label>
        <p>{startedAt ? `นับยอดตั้งแต่ ${new Date(startedAt).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}` : 'นับยอดบริจาคที่ตรวจสอบแล้วทั้งหมด'}</p>
        <GoalAppearanceEditor value={appearance} onChange={setAppearance} disabled={disabled} title={title} target={Number(target)} />
        <div className="widget-actions"><button className="widget-button widget-button-reset" type="button" disabled={disabled} onClick={() => setStartedAt(new Date().toISOString())}>เริ่มนับเป้าหมายใหม่</button><button className="widget-button widget-button-total" type="button" disabled={disabled} onClick={() => setStartedAt('')}>นับยอดทั้งหมด</button><button className="widget-button widget-button-save" type="submit" disabled={disabled}>{saving === 'goal' ? 'กำลังบันทึก…' : 'บันทึกเป้าหมายโดเนท'}</button></div>
        <p>การเริ่มนับใหม่จะมีผลเมื่อบันทึก และเก็บประวัติบริจาคเดิมไว้</p>
      </form>
      {sourceLinks([['หลอดเป้าหมาย', '/overlay/goal']])}
      <p>ตั้งความกว้างตามที่บันทึก ({savedGoal.goal_width} px) และเพิ่มความสูงให้พอดีกับชื่อเป้าหมาย</p>
      <h2>พรีวิวเป้าหมายที่บันทึกแล้ว</h2>{section === 'goal' && <iframe key={previewVersion.goal} title="พรีวิวเป้าหมายที่บันทึกแล้ว" src="/overlay/goal" className="widget-preview" style={{ maxWidth: `${Number(savedGoal.goal_width) + 20}px`, height: `${Number(savedGoal.goal_padding) * 2 + Number(savedGoal.goal_title_size) * 3 + Number(savedGoal.goal_amount_size) * 2 + Number(savedGoal.goal_bar_height) + 100}px` }} />}
    </section>
    <section id="supporters-panel" role="tabpanel" aria-labelledby="supporters-tab" hidden={section !== 'supporters'}>
      <form onSubmit={event => void save(event, 'supporters')} className="widget-settings">
        {errors.supporters && <p role="alert" className="widget-error">{errors.supporters}</p>}
        <SupporterAppearanceEditor value={supporters} onChange={setSupporters} disabled={disabled} />
        <p>อันดับรวมยอดตามชื่อที่ผู้บริจาคกรอก ใช้เวลาไทย และนับเฉพาะรายการที่ตรวจสอบแล้ว</p>
        <button className="widget-button widget-button-save" type="submit" disabled={disabled}>{saving === 'supporters' ? 'กำลังบันทึก…' : 'บันทึกอันดับผู้โดเนท'}</button>
      </form>
      {sourceLinks([['โหมดที่ตั้งค่าไว้', '/overlay/supporters'], ['ผู้สนับสนุนล่าสุด', '/overlay/supporters?mode=recent'], ['อันดับวันนี้', '/overlay/supporters?mode=daily'], ['อันดับเดือนนี้', '/overlay/supporters?mode=monthly'], ['อันดับตลอดเวลา', '/overlay/supporters?mode=allTime']])}
      <p>ตั้งความกว้าง {savedSupporters.supporter_width} px และความสูงประมาณ {Math.ceil(supporterHeight)} px รายชื่อยาวอาจต้องเพิ่มความสูง ลิงก์ระบุโหมดจะใช้โหมดนั้นพร้อมรูปแบบอันดับที่บันทึกไว้</p>
      <h2>พรีวิวอันดับที่บันทึกแล้ว</h2>{section === 'supporters' && <iframe key={previewVersion.supporters} title="พรีวิวอันดับที่บันทึกแล้ว" src="/overlay/supporters" className="widget-preview" style={{ maxWidth: `${Number(savedSupporters.supporter_width) + 20}px`, height: `${supporterHeight}px` }} />}
    </section>
  </div>;
}

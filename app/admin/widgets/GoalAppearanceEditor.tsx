'use client';

import React from 'react';
import { 
  Target, 
  RotateCcw, 
  Sparkles, 
  Zap, 
  Activity, 
  Layers, 
  Palette, 
  Sliders, 
  Type, 
  Check, 
  Eye 
} from 'lucide-react';
import { 
  GoalAppearance, 
  goalAppearanceDefaults, 
  goalAppearanceRanges, 
  goalFontOptions 
} from '@/lib/goalAppearance';
import GoalWidget from '@/app/overlay/goal/GoalWidget';
import './goal-editor-premium.css';

interface GoalAppearanceEditorProps {
  value: GoalAppearance;
  onChange: (value: GoalAppearance) => void;
  disabled: boolean;
  title: string;
  target: number;
}

const colors: { key: keyof GoalAppearance; label: string; group: string }[] = [
  { key: 'goal_bar_color', label: 'หลอดเริ่มต้น', group: 'bar' },
  { key: 'goal_bar_end_color', label: 'หลอดปลายทาง (Gradient)', group: 'bar' },
  { key: 'goal_track_color', label: 'พื้นหลังรางหลอด', group: 'bar' },
  { key: 'goal_bg_color', label: 'พื้นหลังการ์ด', group: 'card' },
  { key: 'goal_border_color', label: 'ขอบการ์ด', group: 'card' },
  { key: 'goal_text_color', label: 'ข้อความและยอดเงิน', group: 'text' },
  { key: 'goal_accent_color', label: 'ตัวเลขเปอร์เซ็นต์', group: 'text' },
];

const sizes: { key: keyof GoalAppearance; label: string; unit: string }[] = [
  { key: 'goal_bar_radius', label: 'ความโค้งหลอด', unit: 'px' },
  { key: 'goal_bar_height', label: 'ความสูงหลอด', unit: 'px' },
  { key: 'goal_width', label: 'ความกว้างการ์ด', unit: 'px' },
  { key: 'goal_padding', label: 'ระยะขอบด้านใน', unit: 'px' },
  { key: 'goal_radius', label: 'ความโค้งการ์ด', unit: 'px' },
  { key: 'goal_opacity', label: 'ความทึบพื้นหลัง', unit: '%' },
  { key: 'goal_title_size', label: 'ขนาดชื่อเป้าหมาย', unit: 'px' },
  { key: 'goal_amount_size', label: 'ขนาดยอดเงิน', unit: 'px' },
];

const styleOptions = [
  { style: 'glass', label: 'แก้วมันวาว (Liquid Glass)', desc: 'ผิวใสสะท้อนแสง 3D ลักชัวรี', icon: Sparkles },
  { style: 'neon', label: 'นีออนเรืองแสง (Cyber Neon)', desc: 'ขอบเรืองแสงสว่างสดใสสไตล์ไซเบอร์', icon: Zap },
  { style: 'striped', label: 'ลายเฉียงวิ่ง (Sport Stripe)', desc: 'ลายวิ่งสปอร์ต โฉบเฉี่ยวมีชีวิตชีวา', icon: Activity },
  { style: 'minimal', label: 'เรียบหรู (Clean Minimal)', desc: 'เรียบเนียน สะอาดตา ทันสมัย', icon: Layers },
] as const;

export default function GoalAppearanceEditor({
  value,
  onChange,
  disabled,
  title,
  target,
}: GoalAppearanceEditorProps) {
  const update = (key: keyof GoalAppearance, next: string) => {
    onChange({ ...value, [key]: next });
  };

  const toggleBoolean = (key: keyof GoalAppearance) => {
    update(key, value[key] === 'true' ? 'false' : 'true');
  };

  return (
    <div className="goal-premium-editor">
      {/* Studio Header Bar */}
      <div className="goal-editor-hero">
        <div>
          <div className="goal-hero-badge">
            <Target size={13} />
            <span>GOAL APPEARANCE STUDIO</span>
          </div>
          <h2>ปรับแต่งดีไซน์หลอดเป้าหมาย</h2>
          <p>ปรับหน้าตา สไตล์ ผิวสัมผัส ความโค้งมน และแสงวาว — พรีวิวอัปเดตสดทันที</p>
        </div>
        <button
          type="button"
          className="goal-reset-btn"
          disabled={disabled}
          onClick={() => onChange({ ...goalAppearanceDefaults })}
          title="คืนค่ารูปแบบเริ่มต้น"
        >
          <RotateCcw size={14} />
          <span>รีเซ็ตค่าเริ่มต้น</span>
        </button>
      </div>

      {/* Section 1: รูปแบบหลอด & เอฟเฟกต์แสงวาว */}
      <section className="goal-section-card">
        <div className="goal-section-header">
          <div className="goal-section-icon icon-blue">
            <Sparkles size={18} />
          </div>
          <div>
            <h3>รูปแบบหลอดและเอฟเฟกต์แสงวาว</h3>
            <p>เลือกสไตล์ผิวสัมผัส พร้อมเปิด/ปิดแอนิเมชันและประกายแสงวาวแบบพรีเมียม</p>
          </div>
        </div>

        {/* 4 Interactive Style Cards */}
        <div className="goal-style-grid">
          {styleOptions.map(({ style, label, desc, icon: IconComponent }) => {
            const isSelected = value.goal_bar_style === style;
            return (
              <button
                key={style}
                type="button"
                className={`goal-style-card${isSelected ? ' selected' : ''}`}
                aria-pressed={isSelected}
                disabled={disabled}
                onClick={() => update('goal_bar_style', style)}
              >
                <div className="goal-style-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IconComponent size={15} color={isSelected ? '#2563eb' : '#64748b'} />
                    <span className="goal-style-title">{label}</span>
                  </div>
                  {isSelected && <span className="goal-style-badge">ACTIVE</span>}
                </div>

                <span
                  className={`goal-style-sample goal-track goal-track-${style}`}
                  style={{ borderRadius: `${value.goal_bar_radius || '50'}px` }}
                  aria-hidden="true"
                >
                  <span
                    className="goal-fill"
                    style={{ borderRadius: `${value.goal_bar_radius || '50'}px` }}
                  >
                    <span className="goal-bar-texture" />
                    <span className="goal-bar-gloss" />
                    <span className="goal-bar-shine" />
                    {value.goal_bar_shine === 'true' && (
                      <span className="goal-bar-shine-sweep">
                        <span className="goal-bar-beam" />
                      </span>
                    )}
                  </span>
                </span>

                <small>{desc}</small>
              </button>
            );
          })}
        </div>

        {/* Shine & Animation Switches */}
        <div className="goal-effects-row">
          <div
            className={`goal-switch-card${value.goal_bar_shine === 'true' ? ' active' : ''}`}
            onClick={() => !disabled && toggleBoolean('goal_bar_shine')}
            role="switch"
            aria-checked={value.goal_bar_shine === 'true'}
          >
            <div className="goal-switch-info">
              <Sparkles size={18} color={value.goal_bar_shine === 'true' ? '#2563eb' : '#64748b'} />
              <div>
                <div className="goal-switch-title">แสงวาวพาดผ่านหลอด (Luxury Crystal Sheen)</div>
                <div className="goal-switch-desc">ลำแสงใยไหมฟุ้งเนียนตา พาดผ่านผิวกระจกคริสตัล 3D</div>
              </div>
            </div>
            <div className="goal-switch-track">
              <div className="goal-switch-thumb" />
            </div>
          </div>

          <div
            className={`goal-switch-card${value.goal_bar_animated === 'true' ? ' active' : ''}`}
            onClick={() => !disabled && toggleBoolean('goal_bar_animated')}
            role="switch"
            aria-checked={value.goal_bar_animated === 'true'}
          >
            <div className="goal-switch-info">
              <Activity size={18} color={value.goal_bar_animated === 'true' ? '#2563eb' : '#64748b'} />
              <div>
                <div className="goal-switch-title">เปิดแสงและลายเคลื่อนไหว (Live Motion)</div>
                <div className="goal-switch-desc">ลายเส้นและเงาสะท้อนขยับตลอดเวลาอย่างนุ่มนวล</div>
              </div>
            </div>
            <div className="goal-switch-track">
              <div className="goal-switch-thumb" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: ชุดสีและแสง */}
      <section className="goal-section-card">
        <div className="goal-section-header">
          <div className="goal-section-icon icon-purple">
            <Palette size={18} />
          </div>
          <div>
            <h3>ชุดสีและแสง (Color Palette)</h3>
            <p>กำหนดเฉดสีตัวหลอด พื้นหลัง และตัวหนังสือ ให้เข้ากับธีมสตรีมของคุณ</p>
          </div>
        </div>

        <div className="goal-color-grid">
          {colors.map(({ key, label }) => (
            <label className="goal-color-item" key={key}>
              <span className="goal-color-label">{label}</span>
              <div className="goal-swatch-wrapper">
                <div
                  className="goal-color-preview-circle"
                  style={{ backgroundColor: value[key] }}
                >
                  <input
                    type="color"
                    className="goal-color-input-hidden"
                    aria-label={label}
                    value={value[key]}
                    disabled={disabled}
                    onChange={e => update(key, e.target.value)}
                  />
                </div>
                <span className="goal-hex-badge">{value[key].toUpperCase()}</span>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Section 3: มิติขนาดและความโค้งมน */}
      <section className="goal-section-card">
        <div className="goal-section-header">
          <div className="goal-section-icon icon-amber">
            <Sliders size={18} />
          </div>
          <div>
            <h3>มิติขนาดและความโค้งมน (Geometry &amp; Sizing)</h3>
            <p>ปรับความโค้งของหลอด ความสูง ความกว้าง และสัดส่วนต่างๆ ได้อย่างอิสระ</p>
          </div>
        </div>

        <div className="goal-range-grid">
          {sizes.map(({ key, label, unit }) => {
            const [min, max] = goalAppearanceRanges[key] || [0, 100];
            return (
              <div className="goal-range-card" key={key}>
                <div className="goal-range-header">
                  <span className="goal-range-label">{label}</span>
                  <span className="goal-range-val-badge">
                    {value[key]} {unit}
                  </span>
                </div>
                <input
                  type="range"
                  className="goal-range-slider"
                  min={min}
                  max={max}
                  value={value[key]}
                  disabled={disabled}
                  onChange={e => update(key, e.target.value)}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 4: ฟอนต์และการแสดงผล */}
      <section className="goal-section-card">
        <div className="goal-section-header">
          <div className="goal-section-icon icon-emerald">
            <Type size={18} />
          </div>
          <div>
            <h3>ฟอนต์และองค์ประกอบการแสดงผล</h3>
            <p>เลือกแบบอักษรและเปิด/ปิดส่วนประกอบข้อมูลที่ต้องการแสดง</p>
          </div>
        </div>

        {/* Font Picker */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13.5px', fontWeight: 600 }}>
            ฟอนต์ตัวอักษร
          </label>
          <div className="goal-font-select-wrapper">
            <select
              className="goal-font-select"
              value={value.goal_font}
              disabled={disabled}
              onChange={e => update('goal_font', e.target.value)}
            >
              {goalFontOptions.map(font => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Toggle Pills */}
        <div className="goal-display-grid">
          {[
            { key: 'goal_show_border', label: 'แสดงขอบการ์ด' },
            { key: 'goal_gradient', label: 'ไล่สีหลอด (Gradient)' },
            { key: 'goal_show_amount', label: 'แสดงยอดเงิน' },
            { key: 'goal_show_percent', label: 'แสดงเปอร์เซ็นต์' },
          ].map(({ key, label }) => {
            const isActive = value[key as keyof GoalAppearance] === 'true';
            return (
              <div
                key={key}
                className={`goal-display-pill${isActive ? ' active' : ''}`}
                onClick={() => !disabled && toggleBoolean(key as keyof GoalAppearance)}
                role="checkbox"
                aria-checked={isActive}
              >
                <div className="goal-checkbox-custom">
                  {isActive && <Check size={12} strokeWidth={3} />}
                </div>
                <span className="goal-display-pill-text">{label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 5: Studio Stage Live Preview */}
      <div className="goal-studio-stage">
        <div className="goal-studio-stage-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="goal-studio-tag">
              <span className="goal-studio-pulse" />
              <span>LIVE OBS PREVIEW</span>
            </div>
            <span className="goal-studio-subtitle">
              ตัวอย่างยอดบริจาค 60% — ขนาดจริงตามที่ตั้งค่า
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={15} color="#94a3b8" />
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Real-time Rendering</span>
          </div>
        </div>

        <div className="goal-studio-canvas">
          <GoalWidget
            title={title || 'เป้าหมายโดเนท'}
            target={target}
            current={(Number.isFinite(target) && target > 0 ? target : 15000) * 0.6}
            appearance={value}
          />
        </div>
      </div>
    </div>
  );
}

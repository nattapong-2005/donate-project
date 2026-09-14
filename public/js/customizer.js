document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const toast = document.getElementById('toast');
  const previewWrapper = document.getElementById('previewWrapper');
  const previewCard = document.getElementById('previewCard');
  const previewShimmer = document.getElementById('previewShimmer');
  const previewIconWrap = document.getElementById('previewIconWrap');
  const previewName = document.getElementById('previewName');
  const previewActionText = document.getElementById('previewActionText');
  const previewAmountWrap = document.getElementById('previewAmountWrap');
  const previewAmount = document.getElementById('previewAmount');
  const previewCurrency = document.getElementById('previewCurrency');
  const previewMessage = document.getElementById('previewMessage');
  const previewStage = document.getElementById('previewStage');

  // SVG Icons map
  const ICONS = {
    gift: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>`,
    heart: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    coin: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 6v2m0 8v2"></path></svg>`,
    star: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    fire: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`,
    trophy: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H8v4h8v-4h-1c-.55 0-1-.45-1-1v-2.34"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>`
  };

  // Presets definition
  const PRESETS = {
    frameless_clear: {
      alert_theme: 'frameless_clear',
      alert_font: 'LINESeedSansTH',
      alert_card_bg: 'transparent',
      alert_card_blur: 0,
      alert_card_width: 580,
      alert_border_color: 'transparent',
      alert_border_width: 0,
      alert_border_radius: 0,
      alert_shimmer_color: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
      alert_shimmer_show: 'false',
      alert_icon: 'gift',
      alert_icon_bg: 'transparent',
      alert_icon_color: '#38bdf8',
      alert_icon_border: 'transparent',
      alert_name_color: '#38bdf8',
      alert_action_text: 'โดเนทให้',
      alert_action_color: '#e2e8f0',
      alert_title_size: 28,
      alert_amount_bg: 'transparent',
      alert_amount_color: '#22c55e',
      alert_amount_border: 'transparent',
      alert_amount_size: 26,
      alert_msg_bg: 'transparent',
      alert_msg_color: '#ffffff',
      alert_msg_border: 'transparent',
      alert_msg_size: 18,
      alert_animation: 'slide-down',
      alert_glow: 'false',
      alert_shadow_show: 'false'
    },
    modern_light: {
      alert_theme: 'modern_light',
      alert_font: 'LINESeedSansTH',
      alert_card_bg: '#ffffff',
      alert_card_width: 580,
      alert_border_color: '#e2e8f0',
      alert_border_width: 1.5,
      alert_border_radius: 24,
      alert_shimmer_color: 'linear-gradient(90deg, #0f172a 0%, #2563eb 50%, #059669 100%)',
      alert_icon: 'gift',
      alert_icon_bg: '#f8fafc',
      alert_icon_color: '#0f172a',
      alert_name_color: '#0f172a',
      alert_action_text: 'โดเนทให้',
      alert_action_color: '#64748b',
      alert_title_size: 26,
      alert_amount_bg: '#ecfdf5',
      alert_amount_color: '#059669',
      alert_amount_border: '#a7f3d0',
      alert_amount_size: 22,
      alert_msg_bg: '#f8fafc',
      alert_msg_color: '#334155',
      alert_msg_size: 18,
      alert_animation: 'slide-down',
      alert_glow: 'false'
    },
    dark_luxury: {
      alert_theme: 'dark_luxury',
      alert_font: 'Kanit',
      alert_card_bg: '#0f172a',
      alert_card_width: 580,
      alert_border_color: '#334155',
      alert_border_width: 2,
      alert_border_radius: 24,
      alert_shimmer_color: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #d97706 100%)',
      alert_icon: 'trophy',
      alert_icon_bg: '#1e293b',
      alert_icon_color: '#fbbf24',
      alert_name_color: '#f8fafc',
      alert_action_text: 'โดเนทให้',
      alert_action_color: '#94a3b8',
      alert_title_size: 26,
      alert_amount_bg: '#451a03',
      alert_amount_color: '#fbbf24',
      alert_amount_border: '#b45309',
      alert_amount_size: 22,
      alert_msg_bg: '#1e293b',
      alert_msg_color: '#e2e8f0',
      alert_msg_size: 18,
      alert_animation: 'slide-down',
      alert_glow: 'true'
    },
    cyber_neon: {
      alert_theme: 'cyber_neon',
      alert_font: 'Chakra Petch',
      alert_card_bg: '#090d16',
      alert_card_width: 600,
      alert_border_color: '#06b6d4',
      alert_border_width: 2,
      alert_border_radius: 14,
      alert_shimmer_color: 'linear-gradient(90deg, #ec4899 0%, #8b5cf6 50%, #06b6d4 100%)',
      alert_icon: 'fire',
      alert_icon_bg: '#0f172a',
      alert_icon_color: '#38bdf8',
      alert_name_color: '#f43f5e',
      alert_action_text: 'ส่งพลังโดเนท!',
      alert_action_color: '#38bdf8',
      alert_title_size: 26,
      alert_amount_bg: '#1e1b4b',
      alert_amount_color: '#38bdf8',
      alert_amount_border: '#818cf8',
      alert_amount_size: 24,
      alert_msg_bg: '#0f172a',
      alert_msg_color: '#e0e7ff',
      alert_msg_size: 18,
      alert_animation: 'bounce',
      alert_glow: 'true'
    },
    sweet_pastel: {
      alert_theme: 'sweet_pastel',
      alert_font: 'Mitr',
      alert_card_bg: '#fff5f7',
      alert_card_width: 560,
      alert_border_color: '#fecdd3',
      alert_border_width: 2,
      alert_border_radius: 28,
      alert_shimmer_color: 'linear-gradient(90deg, #f43f5e 0%, #fb7185 50%, #fda4af 100%)',
      alert_icon: 'heart',
      alert_icon_bg: '#ffe4e6',
      alert_icon_color: '#e11d48',
      alert_name_color: '#9f1239',
      alert_action_text: 'ส่งหัวใจให้แล้ว!',
      alert_action_color: '#fb7185',
      alert_title_size: 26,
      alert_amount_bg: '#fce7f3',
      alert_amount_color: '#be185d',
      alert_amount_border: '#f472b6',
      alert_amount_size: 22,
      alert_msg_bg: '#ffffff',
      alert_msg_color: '#881337',
      alert_msg_size: 18,
      alert_animation: 'bounce',
      alert_glow: 'false',
      alert_card_blur: 0
    },
    glass_frost: {
      alert_theme: 'glass_frost',
      alert_font: 'Prompt',
      alert_card_bg: 'rgba(255, 255, 255, 0.75)',
      alert_card_blur: 16,
      alert_card_width: 580,
      alert_border_color: 'rgba(255, 255, 255, 0.7)',
      alert_border_width: 2,
      alert_border_radius: 24,
      alert_shimmer_color: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)',
      alert_icon: 'coin',
      alert_icon_bg: '#eff6ff',
      alert_icon_color: '#2563eb',
      alert_name_color: '#1e3a8a',
      alert_action_text: 'สนับสนุน',
      alert_action_color: '#60a5fa',
      alert_title_size: 26,
      alert_amount_bg: '#dbeafe',
      alert_amount_color: '#1d4ed8',
      alert_amount_border: '#93c5fd',
      alert_amount_size: 22,
      alert_msg_bg: 'rgba(255, 255, 255, 0.5)',
      alert_msg_color: '#1e293b',
      alert_msg_size: 18,
      alert_animation: 'zoom',
      alert_glow: 'false'
    },
    pure_clear: {
      alert_theme: 'pure_clear',
      alert_font: 'LINESeedSansTH',
      alert_card_bg: 'transparent',
      alert_card_blur: 0,
      alert_card_width: 580,
      alert_border_color: 'rgba(255, 255, 255, 0.45)',
      alert_border_width: 1.5,
      alert_border_radius: 24,
      alert_shimmer_color: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
      alert_icon: 'star',
      alert_icon_bg: 'rgba(255, 255, 255, 0.15)',
      alert_icon_color: '#38bdf8',
      alert_name_color: '#ffffff',
      alert_action_text: 'เปย์กำลังใจ!',
      alert_action_color: '#94a3b8',
      alert_title_size: 26,
      alert_amount_bg: 'rgba(255, 255, 255, 0.15)',
      alert_amount_color: '#38bdf8',
      alert_amount_border: 'rgba(56, 189, 248, 0.5)',
      alert_amount_size: 24,
      alert_msg_bg: 'rgba(0, 0, 0, 0.25)',
      alert_msg_color: '#f8fafc',
      alert_msg_size: 18,
      alert_animation: 'bounce',
      alert_glow: 'true'
    },
    dark_glass: {
      alert_theme: 'dark_glass',
      alert_font: 'Chakra Petch',
      alert_card_bg: 'rgba(15, 23, 42, 0.65)',
      alert_card_blur: 16,
      alert_card_width: 600,
      alert_border_color: '#06b6d4',
      alert_border_width: 2,
      alert_border_radius: 20,
      alert_shimmer_color: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%)',
      alert_icon: 'fire',
      alert_icon_bg: 'rgba(15, 23, 42, 0.8)',
      alert_icon_color: '#38bdf8',
      alert_name_color: '#f8fafc',
      alert_action_text: 'ส่งพลังโดเนท!',
      alert_action_color: '#38bdf8',
      alert_title_size: 26,
      alert_amount_bg: 'rgba(30, 27, 75, 0.7)',
      alert_amount_color: '#38bdf8',
      alert_amount_border: '#06b6d4',
      alert_amount_size: 24,
      alert_msg_bg: 'rgba(15, 23, 42, 0.5)',
      alert_msg_color: '#e2e8f0',
      alert_msg_size: 18,
      alert_animation: 'slide-down',
      alert_glow: 'true'
    },
    emerald_cash: {
      alert_theme: 'emerald_cash',
      alert_font: 'LINESeedSansTH',
      alert_card_bg: '#f0fdf4',
      alert_card_blur: 0,
      alert_card_width: 580,
      alert_border_color: '#86efac',
      alert_border_width: 2,
      alert_border_radius: 20,
      alert_shimmer_color: 'linear-gradient(90deg, #059669 0%, #10b981 50%, #34d399 100%)',
      alert_icon: 'coin',
      alert_icon_bg: '#dcfce7',
      alert_icon_color: '#15803d',
      alert_name_color: '#14532d',
      alert_action_text: 'เปย์สำเร็จ!',
      alert_action_color: '#16a34a',
      alert_title_size: 26,
      alert_amount_bg: '#bbf7d0',
      alert_amount_color: '#15803d',
      alert_amount_border: '#4ade80',
      alert_amount_size: 22,
      alert_msg_bg: '#ffffff',
      alert_msg_color: '#14532d',
      alert_msg_size: 18,
      alert_animation: 'slide-left',
      alert_glow: 'true'
    }
  };

  // State
  let currentSettings = { ...PRESETS.modern_light };

  // Connect to Socket.IO
  const socket = io();

  // Load initial settings
  fetch('/api/admin/settings')
    .then(res => res.json())
    .then(data => {
      if (data.success && data.settings) {
        currentSettings = { ...currentSettings, ...data.settings };
        populateControls(currentSettings);
        applyPreview(currentSettings);
      }
    })
    .catch(err => {
      console.warn('Failed to load settings:', err);
      populateControls(currentSettings);
      applyPreview(currentSettings);
    });

  // Color & Opacity helpers
  function hexToRgba(hex, alpha) {
    if (!hex) hex = '#ffffff';
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function parseColorAndOpacity(colorStr) {
    if (!colorStr) return { hex: '#ffffff', opacity: 1 };
    colorStr = colorStr.trim();
    if (colorStr.toLowerCase() === 'transparent' || colorStr === 'rgba(0, 0, 0, 0)') {
      return { hex: '#ffffff', opacity: 0 };
    }
    const rgbaMatch = colorStr.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
    if (rgbaMatch) {
      const r = parseInt(rgbaMatch[1], 10).toString(16).padStart(2, '0');
      const g = parseInt(rgbaMatch[2], 10).toString(16).padStart(2, '0');
      const b = parseInt(rgbaMatch[3], 10).toString(16).padStart(2, '0');
      const a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;
      return { hex: `#${r}${g}${b}`, opacity: a };
    }
    if (/^#[0-9a-f]{6}$/i.test(colorStr)) {
      return { hex: colorStr, opacity: 1 };
    }
    if (/^#[0-9a-f]{8}$/i.test(colorStr)) {
      const hex6 = colorStr.substring(0, 7);
      const a = parseInt(colorStr.substring(7, 9), 16) / 255;
      return { hex: hex6, opacity: Math.round(a * 100) / 100 };
    }
    return { hex: '#ffffff', opacity: 1 };
  }

  // Setup Two-way Color Binding
  function bindColorPair(pickerId, textId, key) {
    const picker = document.getElementById(pickerId);
    const text = document.getElementById(textId);
    if (!picker || !text) return;

    picker.addEventListener('input', () => {
      text.value = picker.value;
      currentSettings[key] = picker.value;
      applyPreview(currentSettings);
    });

    text.addEventListener('input', () => {
      if (/^#[0-9A-F]{6}$/i.test(text.value)) {
        picker.value = text.value;
      }
      currentSettings[key] = text.value;
      applyPreview(currentSettings);
    });
  }

  // Specialized Card Background & Opacity Controller
  const pickerCardBg = document.getElementById('pickerCardBg');
  const textCardBg = document.getElementById('textCardBg');
  const inputCardOpacity = document.getElementById('inputCardOpacity');
  const valCardOpacity = document.getElementById('valCardOpacity');
  const hintCardOpacity = document.getElementById('hintCardOpacity');
  const inputCardBlur = document.getElementById('inputCardBlur');
  const valCardBlur = document.getElementById('valCardBlur');
  const quickOpBtns = document.querySelectorAll('.btn-quick-op');

  function updateCardBgState(newOpacity, triggerPreview = true) {
    const opacityNum = Math.max(0, Math.min(100, parseInt(newOpacity) || 0));
    if (inputCardOpacity) inputCardOpacity.value = opacityNum;
    if (valCardOpacity) valCardOpacity.textContent = opacityNum;

    if (hintCardOpacity) {
      if (opacityNum === 0) hintCardOpacity.textContent = 'โปร่งใสทะลุจอ 100%';
      else if (opacityNum <= 40) hintCardOpacity.textContent = 'กึ่งโปร่งใสมาก';
      else if (opacityNum <= 80) hintCardOpacity.textContent = 'กระจกฝ้าโปร่งแสง';
      else hintCardOpacity.textContent = 'ทึบแสง';
    }

    const baseHex = (pickerCardBg && pickerCardBg.value) ? pickerCardBg.value : '#ffffff';
    let bgValue = '';
    if (opacityNum === 0) {
      bgValue = 'transparent';
    } else if (opacityNum === 100) {
      bgValue = baseHex;
    } else {
      bgValue = hexToRgba(baseHex, Math.round((opacityNum / 100) * 100) / 100);
    }

    currentSettings.alert_card_bg = bgValue;
    if (textCardBg) textCardBg.value = bgValue;

    // Update active state of quick buttons
    quickOpBtns.forEach(btn => {
      const btnOp = parseInt(btn.dataset.opacity);
      if (btnOp === opacityNum) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (triggerPreview) {
      applyPreview(currentSettings);
    }
  }

  if (pickerCardBg) {
    pickerCardBg.addEventListener('input', () => {
      const curOp = inputCardOpacity ? parseInt(inputCardOpacity.value) : 100;
      updateCardBgState(isNaN(curOp) ? 100 : curOp);
    });
  }

  if (inputCardOpacity) {
    inputCardOpacity.addEventListener('input', () => {
      updateCardBgState(inputCardOpacity.value);
    });
  }

  if (inputCardBlur) {
    inputCardBlur.addEventListener('input', () => {
      const blurVal = parseInt(inputCardBlur.value) || 0;
      if (valCardBlur) valCardBlur.textContent = blurVal;
      currentSettings.alert_card_blur = blurVal;
      applyPreview(currentSettings);
    });
  }

  quickOpBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetOp = parseInt(btn.dataset.opacity);
      const targetBlur = parseInt(btn.dataset.blur) || 0;

      if (inputCardBlur) {
        inputCardBlur.value = targetBlur;
        if (valCardBlur) valCardBlur.textContent = targetBlur;
        currentSettings.alert_card_blur = targetBlur;
      }

      updateCardBgState(targetOp);
    });
  });

  if (textCardBg) {
    textCardBg.addEventListener('input', () => {
      const parsed = parseColorAndOpacity(textCardBg.value);
      if (pickerCardBg && parsed.hex) pickerCardBg.value = parsed.hex;
      const opPercent = Math.round(parsed.opacity * 100);
      if (inputCardOpacity) inputCardOpacity.value = opPercent;
      if (valCardOpacity) valCardOpacity.textContent = opPercent;

      currentSettings.alert_card_bg = textCardBg.value;
      applyPreview(currentSettings);
    });
  }

  // Quick message transparency buttons
  const btnMsgBgClear = document.getElementById('btnMsgBgClear');
  const btnMsgBgGlass = document.getElementById('btnMsgBgGlass');
  const btnMsgBgReset = document.getElementById('btnMsgBgReset');
  const textMsgBg = document.getElementById('textMsgBg');
  const pickerMsgBg = document.getElementById('pickerMsgBg');

  if (btnMsgBgClear) {
    btnMsgBgClear.addEventListener('click', () => {
      currentSettings.alert_msg_bg = 'transparent';
      if (textMsgBg) textMsgBg.value = 'transparent';
      applyPreview(currentSettings);
    });
  }
  if (btnMsgBgGlass) {
    btnMsgBgGlass.addEventListener('click', () => {
      const glassColor = 'rgba(255, 255, 255, 0.25)';
      currentSettings.alert_msg_bg = glassColor;
      if (textMsgBg) textMsgBg.value = glassColor;
      applyPreview(currentSettings);
    });
  }
  if (btnMsgBgReset) {
    btnMsgBgReset.addEventListener('click', () => {
      currentSettings.alert_msg_bg = '#f8fafc';
      if (pickerMsgBg) pickerMsgBg.value = '#f8fafc';
      if (textMsgBg) textMsgBg.value = '#f8fafc';
      applyPreview(currentSettings);
    });
  }

  bindColorPair('pickerBorderColor', 'textBorderColor', 'alert_border_color');
  bindColorPair('pickerIconBg', 'textIconBg', 'alert_icon_bg');
  bindColorPair('pickerIconColor', 'textIconColor', 'alert_icon_color');
  bindColorPair('pickerNameColor', 'textNameColor', 'alert_name_color');
  bindColorPair('pickerActionColor', 'textActionColor', 'alert_action_color');
  bindColorPair('pickerAmountBg', 'textAmountBg', 'alert_amount_bg');
  bindColorPair('pickerAmountColor', 'textAmountColor', 'alert_amount_color');
  bindColorPair('pickerMsgBg', 'textMsgBg', 'alert_msg_bg');
  bindColorPair('pickerMsgColor', 'textMsgColor', 'alert_msg_color');

  // Sliders binding
  function bindSlider(sliderId, displayId, key, suffix = '') {
    const slider = document.getElementById(sliderId);
    const display = document.getElementById(displayId);
    if (!slider || !display) return;

    slider.addEventListener('input', () => {
      display.textContent = slider.value + suffix;
      currentSettings[key] = slider.value;
      applyPreview(currentSettings);
    });
  }

  bindSlider('inputCardWidth', 'valCardWidth', 'alert_card_width');
  bindSlider('inputBorderRadius', 'valBorderRadius', 'alert_border_radius');
  bindSlider('inputBorderWidth', 'valBorderWidth', 'alert_border_width');
  bindSlider('inputTitleSize', 'valTitleSize', 'alert_title_size');
  bindSlider('inputAmountSize', 'valAmountSize', 'alert_amount_size');
  bindSlider('inputMsgSize', 'valMsgSize', 'alert_msg_size');
  bindSlider('inputDuration', 'valDuration', 'alert_duration');

  // Dropdown bindings
  document.getElementById('inputFont').addEventListener('change', (e) => {
    currentSettings.alert_font = e.target.value;
    applyPreview(currentSettings);
  });

  document.getElementById('inputIcon').addEventListener('change', (e) => {
    currentSettings.alert_icon = e.target.value;
    applyPreview(currentSettings);
  });

  document.getElementById('inputAnimation').addEventListener('change', (e) => {
    currentSettings.alert_animation = e.target.value;
    applyPreview(currentSettings);
  });

  const inputGlow = document.getElementById('inputGlow');
  if (inputGlow) {
    inputGlow.addEventListener('change', (e) => {
      if (e.target.value === 'none') {
        currentSettings.alert_shadow_show = 'false';
        currentSettings.alert_glow = 'false';
      } else {
        currentSettings.alert_shadow_show = 'true';
        currentSettings.alert_glow = e.target.value;
      }
      applyPreview(currentSettings);
    });
  }

  const inputActionText = document.getElementById('inputActionText');
  const actionChips = document.querySelectorAll('.btn-action-chip');

  function updateActionChips(val) {
    const cleanVal = (val || '').trim();
    actionChips.forEach(chip => {
      chip.classList.toggle('active', chip.dataset.text === cleanVal);
    });
  }

  if (inputActionText) {
    inputActionText.addEventListener('input', (e) => {
      currentSettings.alert_action_text = e.target.value;
      updateActionChips(e.target.value);
      applyPreview(currentSettings);
    });
  }

  actionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.dataset.text;
      if (inputActionText) inputActionText.value = text;
      currentSettings.alert_action_text = text;
      updateActionChips(text);
      applyPreview(currentSettings);
    });
  });

  document.getElementById('inputShimmer').addEventListener('input', (e) => {
    currentSettings.alert_shimmer_color = e.target.value;
    applyPreview(currentSettings);
  });

  // Frameless Mode Quick Switchers
  const btnModeFrameless = document.getElementById('btnModeFrameless');
  const btnModeCard = document.getElementById('btnModeCard');

  function updateQuickModeButtons(s) {
    if (!btnModeFrameless || !btnModeCard) return;
    const isFrameless = (
      (s.alert_border_width == 0 || s.alert_border_color === 'transparent') &&
      (s.alert_card_bg === 'transparent' || s.alert_shadow_show === 'false' || s.alert_card_bg_opacity == 0)
    );

    if (isFrameless) {
      btnModeFrameless.classList.add('active-frameless');
      btnModeCard.classList.remove('active-card');
    } else {
      btnModeFrameless.classList.remove('active-frameless');
      btnModeCard.classList.add('active-card');
    }
  }

  if (btnModeFrameless) {
    btnModeFrameless.addEventListener('click', () => {
      currentSettings = { ...currentSettings, ...PRESETS.frameless_clear };
      populateControls(currentSettings);
      applyPreview(currentSettings);
      updateQuickModeButtons(currentSettings);
      showToast('✨ สลับเป็นแบบ ลอยโปร่งใส ไร้กรอบ ไร้พื้นหลัง ทั้งหมดแล้ว (อย่าลืมกดบันทึกนะคะ)', 'success');
    });
  }

  if (btnModeCard) {
    btnModeCard.addEventListener('click', () => {
      currentSettings = { ...currentSettings, ...PRESETS.modern_light };
      populateControls(currentSettings);
      applyPreview(currentSettings);
      updateQuickModeButtons(currentSettings);
      showToast('⬜ สลับกลับสู่โหมดการ์ดปกติแล้ว', 'success');
    });
  }

  // Quick Action: No Border (0px)
  const btnNoBorder = document.getElementById('btnNoBorder');
  if (btnNoBorder) {
    btnNoBorder.addEventListener('click', () => {
      currentSettings.alert_border_width = 0;
      currentSettings.alert_border_color = 'transparent';
      const inputBW = document.getElementById('inputBorderWidth');
      const valBW = document.getElementById('valBorderWidth');
      if (inputBW) inputBW.value = 0;
      if (valBW) valBW.textContent = '0';
      applyPreview(currentSettings);
      showToast('🚫 ปิดเส้นขอบการ์ดเรียบร้อย (0px)', 'success');
    });
  }

  // Quick Action: No Card Background
  const btnNoCardBg = document.getElementById('btnNoCardBg');
  if (btnNoCardBg) {
    btnNoCardBg.addEventListener('click', () => {
      updateCardBgState(0);
      showToast('🚫 ปิดสีพื้นหลังการ์ดเรียบร้อย (โปร่งใส 100%)', 'success');
    });
  }

  // Quick Action: Transparent Border Color
  const btnNoBorderColor = document.getElementById('btnNoBorderColor');
  if (btnNoBorderColor) {
    btnNoBorderColor.addEventListener('click', () => {
      currentSettings.alert_border_color = 'transparent';
      const textBC = document.getElementById('textBorderColor');
      if (textBC) textBC.value = 'transparent';
      applyPreview(currentSettings);
      showToast('ปรับสีเส้นขอบเป็นโปร่งใสแล้ว', 'success');
    });
  }

  // Shimmer Show Dropdown
  const inputShimmerShow = document.getElementById('inputShimmerShow');
  if (inputShimmerShow) {
    inputShimmerShow.addEventListener('change', (e) => {
      currentSettings.alert_shimmer_show = e.target.value;
      applyPreview(currentSettings);
    });
  }

  // Icon Box Toggle & Buttons
  const inputIconBoxToggle = document.getElementById('inputIconBoxToggle');
  const btnNoIconBg = document.getElementById('btnNoIconBg');
  const btnIconBgClear = document.getElementById('btnIconBgClear');

  function setIconBoxState(hasBox) {
    if (hasBox) {
      currentSettings.alert_icon_bg = '#f8fafc';
      currentSettings.alert_icon_border = '#e2e8f0';
      if (inputIconBoxToggle) inputIconBoxToggle.value = 'box';
    } else {
      currentSettings.alert_icon_bg = 'transparent';
      currentSettings.alert_icon_border = 'transparent';
      if (inputIconBoxToggle) inputIconBoxToggle.value = 'none';
    }
    const textIconBg = document.getElementById('textIconBg');
    if (textIconBg) textIconBg.value = currentSettings.alert_icon_bg;
    applyPreview(currentSettings);
    showToast(hasBox ? 'เปิดพื้นหลังกล่องไอคอน' : '🚫 ปิดพื้นหลังกล่องไอคอน (ลอยเฉพาะไอคอน)', 'success');
  }

  if (inputIconBoxToggle) {
    inputIconBoxToggle.addEventListener('change', (e) => setIconBoxState(e.target.value === 'box'));
  }
  if (btnNoIconBg) btnNoIconBg.addEventListener('click', () => setIconBoxState(false));
  if (btnIconBgClear) btnIconBgClear.addEventListener('click', () => setIconBoxState(false));

  // Amount Box Toggle & Buttons
  const inputAmountBoxToggle = document.getElementById('inputAmountBoxToggle');
  const btnNoAmountBg = document.getElementById('btnNoAmountBg');
  const btnAmountBgClear = document.getElementById('btnAmountBgClear');

  function setAmountBoxState(hasBox) {
    if (hasBox) {
      currentSettings.alert_amount_bg = '#ecfdf5';
      currentSettings.alert_amount_border = '#a7f3d0';
      if (inputAmountBoxToggle) inputAmountBoxToggle.value = 'pill';
    } else {
      currentSettings.alert_amount_bg = 'transparent';
      currentSettings.alert_amount_border = 'transparent';
      if (inputAmountBoxToggle) inputAmountBoxToggle.value = 'none';
    }
    const textAmountBg = document.getElementById('textAmountBg');
    if (textAmountBg) textAmountBg.value = currentSettings.alert_amount_bg;
    applyPreview(currentSettings);
    showToast(hasBox ? 'เปิดป้ายพื้นหลังยอดเงิน' : '🚫 ปิดพื้นหลังป้ายยอดเงิน (ลอยเฉพาะตัวเลข)', 'success');
  }

  if (inputAmountBoxToggle) {
    inputAmountBoxToggle.addEventListener('change', (e) => setAmountBoxState(e.target.value === 'pill'));
  }
  if (btnNoAmountBg) btnNoAmountBg.addEventListener('click', () => setAmountBoxState(false));
  if (btnAmountBgClear) btnAmountBgClear.addEventListener('click', () => setAmountBoxState(false));

  // Message Box Toggle & Buttons
  const inputMsgBoxToggle = document.getElementById('inputMsgBoxToggle');
  const btnNoMsgBoxBg = document.getElementById('btnNoMsgBoxBg');

  function setMsgBoxState(hasBox) {
    if (hasBox) {
      currentSettings.alert_msg_bg = '#f8fafc';
      currentSettings.alert_msg_border = '#e2e8f0';
      if (inputMsgBoxToggle) inputMsgBoxToggle.value = 'box';
    } else {
      currentSettings.alert_msg_bg = 'transparent';
      currentSettings.alert_msg_border = 'transparent';
      if (inputMsgBoxToggle) inputMsgBoxToggle.value = 'none';
    }
    const textMsgBg = document.getElementById('textMsgBg');
    if (textMsgBg) textMsgBg.value = currentSettings.alert_msg_bg;
    applyPreview(currentSettings);
    showToast(hasBox ? 'เปิดพื้นหลังกล่องข้อความ' : '🚫 ปิดพื้นหลังกล่องข้อความ (ลอยเฉพาะข้อความ)', 'success');
  }

  if (inputMsgBoxToggle) {
    inputMsgBoxToggle.addEventListener('change', (e) => setMsgBoxState(e.target.value === 'box'));
  }
  if (btnNoMsgBoxBg) btnNoMsgBoxBg.addEventListener('click', () => setMsgBoxState(false));

  // Preset Theme selection
  document.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const presetKey = card.dataset.preset;
      if (PRESETS[presetKey]) {
        currentSettings = { ...currentSettings, ...PRESETS[presetKey] };
        populateControls(currentSettings);
        applyPreview(currentSettings);
        showToast(`เลือกธีม ${card.querySelector('span').textContent} เรียบร้อยแล้ว`, 'success');
      }
    });
  });

  // Populate controls from state
  function populateControls(s) {
    if (s.alert_font) document.getElementById('inputFont').value = s.alert_font;
    if (s.alert_icon) document.getElementById('inputIcon').value = s.alert_icon;
    if (s.alert_animation) document.getElementById('inputAnimation').value = s.alert_animation;
    
    // Shadow & Glow
    if (s.alert_shadow_show === 'false' || s.alert_shadow_show === false) {
      if (inputGlow) inputGlow.value = 'none';
    } else if (s.alert_glow !== undefined) {
      if (inputGlow) inputGlow.value = String(s.alert_glow);
    }

    if (s.alert_action_text) {
      document.getElementById('inputActionText').value = s.alert_action_text;
      updateActionChips(s.alert_action_text);
    }
    if (s.alert_shimmer_color) document.getElementById('inputShimmer').value = s.alert_shimmer_color;
    if (inputShimmerShow && s.alert_shimmer_show !== undefined) {
      inputShimmerShow.value = String(s.alert_shimmer_show);
    }

    // Toggle Box Dropdowns
    if (inputIconBoxToggle) {
      inputIconBoxToggle.value = (s.alert_icon_bg === 'transparent') ? 'none' : 'box';
    }
    if (inputAmountBoxToggle) {
      inputAmountBoxToggle.value = (s.alert_amount_bg === 'transparent') ? 'none' : 'pill';
    }
    if (inputMsgBoxToggle) {
      inputMsgBoxToggle.value = (s.alert_msg_bg === 'transparent') ? 'none' : 'box';
    }

    // Sliders
    if (s.alert_card_width) {
      document.getElementById('inputCardWidth').value = s.alert_card_width;
      document.getElementById('valCardWidth').textContent = s.alert_card_width;
    }
    if (s.alert_border_radius !== undefined) {
      document.getElementById('inputBorderRadius').value = s.alert_border_radius;
      document.getElementById('valBorderRadius').textContent = s.alert_border_radius;
    }
    if (s.alert_border_width !== undefined) {
      document.getElementById('inputBorderWidth').value = s.alert_border_width;
      document.getElementById('valBorderWidth').textContent = s.alert_border_width;
    }
    if (s.alert_title_size) {
      document.getElementById('inputTitleSize').value = s.alert_title_size;
      document.getElementById('valTitleSize').textContent = s.alert_title_size;
    }
    if (s.alert_amount_size) {
      document.getElementById('inputAmountSize').value = s.alert_amount_size;
      document.getElementById('valAmountSize').textContent = s.alert_amount_size;
    }
    if (s.alert_msg_size) {
      document.getElementById('inputMsgSize').value = s.alert_msg_size;
      document.getElementById('valMsgSize').textContent = s.alert_msg_size;
    }
    if (s.alert_duration) {
      document.getElementById('inputDuration').value = s.alert_duration;
      document.getElementById('valDuration').textContent = s.alert_duration;
    }

    // Color Inputs
    function setColor(pickerId, textId, val) {
      if (!val) return;
      const text = document.getElementById(textId);
      const picker = document.getElementById(pickerId);
      if (text) text.value = val;
      if (picker && /^#[0-9A-F]{6}$/i.test(val)) picker.value = val;
    }

    // Sync Card Background & Opacity Controls
    if (s.alert_card_bg) {
      const parsed = parseColorAndOpacity(s.alert_card_bg);
      if (pickerCardBg && parsed.hex) pickerCardBg.value = parsed.hex;
      if (textCardBg) textCardBg.value = s.alert_card_bg;
      const opPercent = Math.round(parsed.opacity * 100);
      if (inputCardOpacity) inputCardOpacity.value = opPercent;
      if (valCardOpacity) valCardOpacity.textContent = opPercent;

      if (hintCardOpacity) {
        if (opPercent === 0) hintCardOpacity.textContent = 'โปร่งใสทะลุจอ 100%';
        else if (opPercent <= 40) hintCardOpacity.textContent = 'กึ่งโปร่งใสมาก';
        else if (opPercent <= 80) hintCardOpacity.textContent = 'กระจกฝ้าโปร่งแสง';
        else hintCardOpacity.textContent = 'ทึบแสง';
      }

      quickOpBtns.forEach(btn => {
        const btnOp = parseInt(btn.dataset.opacity);
        if (btnOp === opPercent) btn.classList.add('active');
        else btn.classList.remove('active');
      });
    }

    // Sync Backdrop Blur
    const blurVal = s.alert_card_blur !== undefined ? parseInt(s.alert_card_blur) || 0 : 0;
    if (inputCardBlur) inputCardBlur.value = blurVal;
    if (valCardBlur) valCardBlur.textContent = blurVal;

    setColor('pickerBorderColor', 'textBorderColor', s.alert_border_color);
    setColor('pickerIconBg', 'textIconBg', s.alert_icon_bg);
    setColor('pickerIconColor', 'textIconColor', s.alert_icon_color);
    setColor('pickerNameColor', 'textNameColor', s.alert_name_color);
    setColor('pickerActionColor', 'textActionColor', s.alert_action_color);
    setColor('pickerAmountBg', 'textAmountBg', s.alert_amount_bg);
    setColor('pickerAmountColor', 'textAmountColor', s.alert_amount_color);
    setColor('pickerMsgBg', 'textMsgBg', s.alert_msg_bg);
    setColor('pickerMsgColor', 'textMsgColor', s.alert_msg_color);

    // Sync Mode Switcher Buttons
    updateQuickModeButtons(s);
  }

  // Apply styles to Live Preview box
  function applyPreview(s) {
    if (!previewWrapper) return;
    const root = previewWrapper;

    // Font
    if (s.alert_font) root.style.fontFamily = `'${s.alert_font}', sans-serif`;
    
    // Card Width & Shape
    if (s.alert_card_width) root.style.width = s.alert_card_width + 'px';
    if (previewCard) {
      if (s.alert_card_bg) previewCard.style.background = s.alert_card_bg;
      const blur = s.alert_card_blur !== undefined ? parseInt(s.alert_card_blur) || 0 : 0;
      previewCard.style.backdropFilter = `blur(${blur}px)`;
      previewCard.style.webkitBackdropFilter = `blur(${blur}px)`;

      const isNoBorder = s.alert_border_width === '0' || s.alert_border_width === 0 || s.alert_border_color === 'transparent';
      if (isNoBorder) {
        previewCard.style.border = 'none';
      } else {
        previewCard.style.border = (s.alert_border_width || 1.5) + 'px solid ' + (s.alert_border_color || '#e2e8f0');
      }
      if (s.alert_border_radius !== undefined) previewCard.style.borderRadius = s.alert_border_radius + 'px';

      if (s.alert_shadow_show === 'false' || s.alert_shadow_show === false || (s.alert_card_bg === 'transparent' && isNoBorder)) {
        previewCard.style.boxShadow = 'none';
      } else if (s.alert_glow === 'true' || s.alert_glow === true) {
        const glowColor = s.alert_border_color && s.alert_border_color !== 'transparent' ? s.alert_border_color : '#2563eb';
        previewCard.style.boxShadow = `0 25px 50px -12px rgba(0,0,0,0.3), 0 0 30px ${glowColor}66`;
      } else {
        previewCard.style.boxShadow = '0 25px 50px -12px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(15, 23, 42, 0.04)';
      }
    }

    // Shimmer bar
    if (previewShimmer) {
      if (s.alert_shimmer_show === 'false' || s.alert_shimmer_show === false) {
        previewShimmer.style.display = 'none';
      } else {
        previewShimmer.style.display = 'block';
        if (s.alert_shimmer_color) previewShimmer.style.background = s.alert_shimmer_color;
      }
    }

    // Icon
    if (previewIconWrap) {
      if (s.alert_icon_bg) previewIconWrap.style.background = s.alert_icon_bg;
      if (s.alert_icon_color) previewIconWrap.style.color = s.alert_icon_color;
      if (s.alert_icon_border) previewIconWrap.style.borderColor = s.alert_icon_border;

      if (s.alert_icon_bg === 'transparent') {
        previewIconWrap.style.border = 'none';
        previewIconWrap.style.boxShadow = 'none';
      } else {
        previewIconWrap.style.border = '1.5px solid ' + (s.alert_icon_border || '#e2e8f0');
        previewIconWrap.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.05)';
      }

      const iconKey = s.alert_icon || 'gift';
      if (ICONS[iconKey]) {
        previewIconWrap.innerHTML = ICONS[iconKey];
        const svg = previewIconWrap.querySelector('svg');
        if (svg && s.alert_icon_color) svg.style.stroke = s.alert_icon_color;
      }
    }

    // Texts & Text Shadow
    const isFrameless = s.alert_card_bg === 'transparent' && (s.alert_border_width === '0' || s.alert_border_width === 0 || s.alert_border_color === 'transparent');
    const textShadowVal = isFrameless ? '0 2px 8px rgba(0, 0, 0, 0.85), 0 0 3px rgba(0, 0, 0, 0.9)' : 'none';

    if (previewName) {
      previewName.textContent = 'test';
      if (s.alert_name_color) previewName.style.color = s.alert_name_color;
      previewName.style.textShadow = textShadowVal;
      if (s.alert_title_size) previewName.parentElement.style.fontSize = s.alert_title_size + 'px';
    }
    if (previewActionText) {
      const act = (s.alert_action_text !== undefined ? s.alert_action_text : 'โดเนทให้').trim();
      previewActionText.textContent = act;
      if (s.alert_action_color) previewActionText.style.color = s.alert_action_color;
      previewActionText.style.textShadow = textShadowVal;
    }

    // Amount Badge / Inline Wrap inside Headline
    const amountTarget = previewAmountWrap || previewAmount;
    if (amountTarget) {
      if (s.alert_amount_bg) amountTarget.style.background = s.alert_amount_bg;
      if (s.alert_amount_color) amountTarget.style.color = s.alert_amount_color;
      if (s.alert_amount_border) amountTarget.style.borderColor = s.alert_amount_border;
      if (s.alert_amount_size) amountTarget.style.fontSize = s.alert_amount_size + 'px';
      amountTarget.style.textShadow = textShadowVal;

      if (s.alert_amount_bg === 'transparent') {
        amountTarget.style.border = 'none';
        amountTarget.style.boxShadow = 'none';
        amountTarget.style.padding = '0';
      } else {
        amountTarget.style.border = '1.5px solid ' + (s.alert_amount_border || '#a7f3d0');
        amountTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
        amountTarget.style.padding = '2px 14px';
      }
    }
    if (previewAmount) {
      previewAmount.textContent = '50';
    }
    if (previewCurrency) {
      previewCurrency.textContent = 'บาท';
    }

    // Message
    if (previewMessage) {
      previewMessage.textContent = 'สวัสดีครับ';
      if (s.alert_msg_bg) previewMessage.style.background = s.alert_msg_bg;
      if (s.alert_msg_color) previewMessage.style.color = s.alert_msg_color;
      if (s.alert_msg_size) previewMessage.style.fontSize = s.alert_msg_size + 'px';
      previewMessage.style.textShadow = textShadowVal;

      if (s.alert_msg_bg === 'transparent') {
        previewMessage.style.border = 'none';
        previewMessage.style.padding = '4px 0';
      } else {
        previewMessage.style.border = '1px solid ' + (s.alert_msg_border || '#e2e8f0');
        previewMessage.style.padding = '12px 18px';
      }
    }

    // Animation Class
    const animClass = s.alert_animation || 'slide-down';
    previewWrapper.className = `alert-wrapper anim-${animClass} show`;

    // Auto fit scale preview
    updatePreviewScale();
  }

  // Auto-fit scale preview in stage container
  function updatePreviewScale() {
    if (!previewStage || !previewWrapper) return;
    const stageWidth = previewStage.clientWidth - 24;
    const targetWidth = parseInt(currentSettings.alert_card_width) || 580;
    if (stageWidth > 0 && stageWidth < targetWidth) {
      const scale = Math.max(0.4, Math.min(1, stageWidth / targetWidth));
      previewWrapper.style.transform = `scale(${scale})`;
      previewWrapper.style.transformOrigin = 'center center';
    } else {
      previewWrapper.style.transform = 'scale(1)';
    }
  }

  window.addEventListener('resize', updatePreviewScale);

  // Mobile View Switcher (Controls vs Preview)
  const customizerContainer = document.getElementById('customizerContainer');
  const floatingToggle = document.getElementById('btnFloatingViewToggle');
  const floatingIcon = document.getElementById('floatingViewIcon');
  const floatingText = document.getElementById('floatingViewText');

  function setMobileView(view) {
    if (!customizerContainer) return;
    customizerContainer.setAttribute('data-mobile-view', view);
    document.querySelectorAll('.mobile-view-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.view === view);
    });

    if (view === 'preview') {
      if (floatingIcon) floatingIcon.textContent = '⚙️';
      if (floatingText) floatingText.textContent = 'แก้ไขดีไซน์';
      setTimeout(updatePreviewScale, 60);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (floatingIcon) floatingIcon.textContent = '👁️';
      if (floatingText) floatingText.textContent = 'ดูพรีวิวสด';
    }
  }

  if (floatingToggle) {
    floatingToggle.addEventListener('click', () => {
      const current = customizerContainer.getAttribute('data-mobile-view') || 'controls';
      setMobileView(current === 'controls' ? 'preview' : 'controls');
    });
  }

  document.querySelectorAll('.mobile-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setMobileView(btn.dataset.view);
    });
  });

  // Preview Stage Background Switcher
  document.querySelectorAll('.bg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const bgType = btn.dataset.bg;
      previewStage.className = `preview-stage bg-${bgType}`;
    });
  });

  // Trigger preview entrance/exit animation
  let isAnimating = false;
  document.getElementById('btnTriggerPreview').addEventListener('click', () => {
    if (isAnimating) return;
    isAnimating = true;

    const animClass = currentSettings.alert_animation || 'slide-down';
    previewWrapper.className = `alert-wrapper anim-${animClass} hide`;

    setTimeout(() => {
      previewWrapper.className = `alert-wrapper anim-${animClass}`;
      setTimeout(() => {
        previewWrapper.className = `alert-wrapper anim-${animClass} show`;
        isAnimating = false;
      }, 100);
    }, 400);
  });

  // Save Settings & Broadcast Live to OBS
  const btnSave = document.getElementById('btnSaveCustomizer');
  btnSave.addEventListener('click', async () => {
    btnSave.disabled = true;
    btnSave.innerHTML = '<span class="spinner"></span> กำลังบันทึก...';

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentSettings)
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'บันทึกการตั้งค่าไม่สำเร็จ');
      }

      showToast('✓ บันทึกและซิงค์สไตล์ขึ้นจอ OBS สำเร็จแล้ว!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btnSave.disabled = false;
      btnSave.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        <span>บันทึกและส่งขึ้น OBS ทันที</span>
      `;
    }
  });

  // Send real test alert to OBS
  document.getElementById('btnSendRealObsTest').addEventListener('click', async () => {
    try {
      const res = await fetch('/api/admin/test-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'test',
          amount: 50,
          message: 'สวัสดีครับ'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('🚀 ส่ง Test Alert (test โดเนทให้ 50 บาท) ไปที่จอ OBS Studio เรียบร้อยแล้ว!', 'success');
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      showToast('ไม่สามารถส่ง Test Alert ได้: ' + err.message, 'error');
    }
  });

  // Reset to default
  document.getElementById('btnResetDefault').addEventListener('click', () => {
    if (confirm('ต้องการคืนค่าเริ่มต้นทั้งหมดใช่หรือไม่?')) {
      currentSettings = { ...PRESETS.modern_light };
      populateControls(currentSettings);
      applyPreview(currentSettings);
      showToast('คืนค่าสไตล์เริ่มต้นแล้ว อย่าลืมกดบันทึกนะคะ', 'success');
    }
  });

  // Copy OBS URL
  document.getElementById('btnCopyObsUrl').addEventListener('click', () => {
    const url = document.getElementById('obsOverlayUrl').textContent.trim();
    navigator.clipboard.writeText(url).then(() => {
      showToast('คัดลอก URL เรียบร้อยแล้ว!', 'success');
    });
  });

  // Toast Helper
  let toastTimer;
  function showToast(msg, type = 'success') {
    clearTimeout(toastTimer);
    toast.className = `toast show ${type}`;
    toast.textContent = msg;

    toastTimer = setTimeout(() => {
      toast.className = 'toast';
    }, 3500);
  }
});

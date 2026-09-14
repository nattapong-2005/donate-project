document.addEventListener('DOMContentLoaded', () => {
  const alertWrapper = document.getElementById('alertWrapper');
  const donatorName = document.getElementById('donatorName');
  const alertAmount = document.getElementById('alertAmount');
  const alertCurrency = document.getElementById('alertCurrency');
  const alertAmountWrap = document.getElementById('alertAmountWrap');
  const alertMessage = document.getElementById('alertMessage');
  const alertAudio = document.getElementById('alertAudio');
  const alertActionText = document.getElementById('alertActionText');
  const alertIconWrap = document.getElementById('alertIconWrap');

  // SVG Icon Templates
  const ICONS = {
    gift: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>`,
    heart: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    coin: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 6v2m0 8v2"></path></svg>`,
    star: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    fire: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`,
    trophy: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H8v4h8v-4h-1c-.55 0-1-.45-1-1v-2.34"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>`
  };

  // Queue state
  const queue = [];
  let isPlaying = false;

  // Settings with defaults
  let settings = {
    alert_duration: 8,
    alert_volume: 80,
    tts_enabled: 'true',
    tts_min_amount: 20,
    alert_animation: 'slide-down'
  };

  function applyCustomStyles(s) {
    if (!s) return;
    const root = document.documentElement;

    if (s.alert_font) root.style.setProperty('--alert-font', `'${s.alert_font}', -apple-system, BlinkMacSystemFont, sans-serif`);
    // Card Background & Blur
    if (s.alert_card_bg) root.style.setProperty('--alert-card-bg', s.alert_card_bg);
    if (s.alert_card_blur !== undefined) root.style.setProperty('--alert-card-blur', s.alert_card_blur + 'px');
    if (s.alert_card_width) root.style.setProperty('--alert-card-width', s.alert_card_width + 'px');

    // Card Border
    if (s.alert_border_color) root.style.setProperty('--alert-border-color', s.alert_border_color);
    if (s.alert_border_width !== undefined) {
      root.style.setProperty('--alert-border-width', s.alert_border_width + 'px');
    }
    if (s.alert_border_radius) root.style.setProperty('--alert-border-radius', s.alert_border_radius + 'px');

    // Shimmer Bar Display
    if (s.alert_shimmer_color) root.style.setProperty('--alert-shimmer', s.alert_shimmer_color);
    if (s.alert_shimmer_show === 'false' || s.alert_shimmer_show === false) {
      root.style.setProperty('--alert-shimmer-display', 'none');
    } else {
      root.style.setProperty('--alert-shimmer-display', 'block');
    }

    // Card Shadow & Glow
    if (s.alert_shadow_show === 'false' || s.alert_shadow_show === false || s.alert_card_bg === 'transparent' && (s.alert_border_width === '0' || s.alert_border_width === 0 || s.alert_border_color === 'transparent')) {
      root.style.setProperty('--alert-shadow', 'none');
    } else if (s.alert_glow === 'true' || s.alert_glow === true) {
      const glowColor = s.alert_border_color && s.alert_border_color !== 'transparent' ? s.alert_border_color : '#2563eb';
      root.style.setProperty('--alert-shadow', `0 25px 50px -12px rgba(0,0,0,0.3), 0 0 35px ${glowColor}66`);
    } else {
      root.style.setProperty('--alert-shadow', '0 25px 50px -12px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(15, 23, 42, 0.04)');
    }

    // Icon Box
    if (s.alert_icon_bg) root.style.setProperty('--alert-icon-bg', s.alert_icon_bg);
    if (s.alert_icon_color) root.style.setProperty('--alert-icon-color', s.alert_icon_color);
    if (s.alert_icon_border) root.style.setProperty('--alert-icon-border', s.alert_icon_border);
    if (s.alert_icon_bg === 'transparent') {
      root.style.setProperty('--alert-icon-border-width', '0px');
      root.style.setProperty('--alert-icon-shadow', 'none');
    } else {
      root.style.setProperty('--alert-icon-border-width', '1.5px');
      root.style.setProperty('--alert-icon-shadow', '0 4px 12px rgba(15, 23, 42, 0.05)');
    }

    // Texts
    if (s.alert_name_color) root.style.setProperty('--alert-name-color', s.alert_name_color);
    if (s.alert_action_color) root.style.setProperty('--alert-action-color', s.alert_action_color);
    if (s.alert_title_size) root.style.setProperty('--alert-title-size', s.alert_title_size + 'px');

    // Amount Badge
    if (s.alert_amount_bg) root.style.setProperty('--alert-amount-bg', s.alert_amount_bg);
    if (s.alert_amount_color) root.style.setProperty('--alert-amount-color', s.alert_amount_color);
    if (s.alert_amount_border) root.style.setProperty('--alert-amount-border', s.alert_amount_border);
    if (s.alert_amount_size) root.style.setProperty('--alert-amount-size', s.alert_amount_size + 'px');
    if (s.alert_amount_bg === 'transparent') {
      root.style.setProperty('--alert-amount-border-width', '0px');
      root.style.setProperty('--alert-amount-shadow', 'none');
    } else {
      root.style.setProperty('--alert-amount-border-width', '1.5px');
      root.style.setProperty('--alert-amount-shadow', '0 2px 8px rgba(0, 0, 0, 0.08)');
    }

    // Message Box
    if (s.alert_msg_bg) root.style.setProperty('--alert-msg-bg', s.alert_msg_bg);
    if (s.alert_msg_color) root.style.setProperty('--alert-msg-color', s.alert_msg_color);
    if (s.alert_msg_border) root.style.setProperty('--alert-msg-border', s.alert_msg_border);
    if (s.alert_msg_size) root.style.setProperty('--alert-msg-size', s.alert_msg_size + 'px');
    if (s.alert_msg_bg === 'transparent') {
      root.style.setProperty('--alert-msg-border-width', '0px');
    } else {
      root.style.setProperty('--alert-msg-border-width', '1px');
    }

    // Text Shadow for readability over games
    if (s.alert_card_bg === 'transparent' && (s.alert_border_width === '0' || s.alert_border_width === 0 || s.alert_border_color === 'transparent')) {
      root.style.setProperty('--alert-text-shadow', '0 2px 8px rgba(0, 0, 0, 0.85), 0 0 3px rgba(0, 0, 0, 0.9)');
    } else {
      root.style.setProperty('--alert-text-shadow', 'none');
    }

    // Animation class
    const animClass = s.alert_animation || 'slide-down';
    if (alertWrapper) {
      alertWrapper.className = `alert-wrapper anim-${animClass}`;
    }

    // Action text
    if (alertActionText && s.alert_action_text !== undefined) {
      alertActionText.textContent = s.alert_action_text.trim();
    }

    // Icon
    if (alertIconWrap && s.alert_icon && ICONS[s.alert_icon]) {
      alertIconWrap.innerHTML = ICONS[s.alert_icon];
    }
  }

  // Load initial settings from server
  fetch('/api/admin/settings')
    .then(res => res.json())
    .then(data => {
      if (data.success && data.settings) {
        settings = { ...settings, ...data.settings };
        applyCustomStyles(settings);
      }
    })
    .catch(err => console.warn('Could not load overlay settings:', err));

  // Connect to Socket.IO
  const socket = io();

  socket.on('connect', () => {
    console.log('[Overlay] Connected to Alert Server');
  });

  socket.on('donation', (data) => {
    console.log('[Overlay] Received donation alert:', data);
    queue.push(data);
    processQueue();
  });

  socket.on('settings_updated', (newSettings) => {
    console.log('[Overlay] Settings updated in real-time:', newSettings);
    settings = { ...settings, ...newSettings };
    applyCustomStyles(settings);
  });

  // Synthesized Web Audio Chime (sparkling chime that never fails to play)
  function playSynthesizedChime(volumePercent) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime((volumePercent / 100) * 0.4, ctx.currentTime);
      masterGain.connect(ctx.destination);

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const startTime = ctx.currentTime + (index * 0.08);
        const duration = 0.6;

        noteGain.gain.setValueAtTime(0, startTime);
        noteGain.gain.linearRampToValueAtTime(0.8, startTime + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch (e) {
      console.warn('Web Audio chime error:', e);
    }
  }

  // Play audio effect
  function playAlertSound() {
    const vol = parseFloat(settings.alert_volume) || 80;
    
    // Attempt to play MP3 file if present
    if (alertAudio) {
      alertAudio.volume = Math.min(Math.max(vol / 100, 0), 1);
      alertAudio.currentTime = 0;
      alertAudio.play().catch(() => {
        // Fallback to Web Audio synthesis if browser blocks unmuted audio or mp3 not found
        playSynthesizedChime(vol);
      });
    } else {
      playSynthesizedChime(vol);
    }
  }

  // Play Thai Text-to-Speech (TTS)
  function speakDonation(data) {
    const ttsEnabled = String(settings.tts_enabled).toLowerCase() !== 'false';
    const minTts = parseFloat(settings.tts_min_amount) || 0;
    const amount = parseFloat(data.amount) || 0;

    if (!ttsEnabled || amount < minTts || !('speechSynthesis' in window)) {
      return;
    }

    // Cancel any previous speaking
    window.speechSynthesis.cancel();

    const action = (settings.alert_action_text ? settings.alert_action_text.trim() : 'โดเนทให้');
    let speakText = `${data.name} ${action} ${amount} บาท`;
    if (data.message && data.message.trim() !== '') {
      speakText += ` ข้อความ ${data.message}`;
    }

    const utterance = new SpeechSynthesisUtterance(speakText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = Math.min(Math.max((parseFloat(settings.alert_volume) || 80) / 100, 0), 1);

    // Pick Thai voice if present
    const voices = window.speechSynthesis.getVoices();
    const thaiVoice = voices.find(v => v.lang.includes('th') || v.lang.includes('TH'));
    if (thaiVoice) {
      utterance.voice = thaiVoice;
    } else {
      utterance.lang = 'th-TH';
    }

    window.speechSynthesis.speak(utterance);
  }

  // Queue runner
  function processQueue() {
    if (isPlaying || queue.length === 0) return;

    isPlaying = true;
    const item = queue.shift();

    // Populate data
    donatorName.textContent = item.name || 'test';
    const action = (settings.alert_action_text !== undefined ? settings.alert_action_text.trim() : 'โดเนทให้');
    if (alertActionText) alertActionText.textContent = action;

    const amountVal = parseFloat(item.amount) || 0;
    const formattedAmount = (amountVal % 1 === 0)
      ? amountVal.toLocaleString('th-TH')
      : amountVal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    if (alertAmount) alertAmount.textContent = formattedAmount;
    if (alertCurrency) alertCurrency.textContent = 'บาท';

    if (item.message && item.message.trim() !== '') {
      alertMessage.textContent = item.message;
      alertMessage.style.display = 'block';
    } else {
      alertMessage.textContent = '';
      alertMessage.style.display = 'none';
    }

    // Play sound and trigger TTS
    playAlertSound();
    speakDonation(item);

    // Show animation
    alertWrapper.classList.remove('hide');
    alertWrapper.classList.add('show');

    // Display duration
    const durationSec = parseFloat(settings.alert_duration) || 8;
    const durationMs = durationSec * 1000;

    setTimeout(() => {
      // Exit animation
      alertWrapper.classList.remove('show');
      alertWrapper.classList.add('hide');

      setTimeout(() => {
        alertWrapper.classList.remove('hide');
        isPlaying = false;
        // Process next item in queue
        processQueue();
      }, 500); // 500ms exit transition
    }, durationMs);
  }

  // Pre-fetch voices on load
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const alertWrapper = document.getElementById('alertWrapper');
  const donatorName = document.getElementById('donatorName');
  const alertAmount = document.getElementById('alertAmount');
  const alertMessage = document.getElementById('alertMessage');
  const alertAudio = document.getElementById('alertAudio');

  // Queue state
  const queue = [];
  let isPlaying = false;

  // Settings with defaults
  let settings = {
    alert_duration: 8,
    alert_volume: 80,
    tts_enabled: 'true',
    tts_min_amount: 20
  };

  // Load initial settings from server
  fetch('/api/admin/settings')
    .then(res => res.json())
    .then(data => {
      if (data.success && data.settings) {
        settings = { ...settings, ...data.settings };
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
    console.log('[Overlay] Settings updated:', newSettings);
    settings = { ...settings, ...newSettings };
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

    let speakText = `${data.name} สนับสนุน ${amount} บาท`;
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
    donatorName.textContent = item.name || 'ผู้สนับสนุนใจดี';
    const amountVal = parseFloat(item.amount) || 0;
    alertAmount.textContent = `+฿${amountVal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;

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

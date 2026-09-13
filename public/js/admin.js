document.addEventListener('DOMContentLoaded', () => {
  // Tabs
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // Socket.IO for real-time dashboard updates
  const socket = io();
  socket.on('donation', (data) => {
    showToast(`มีโดเนทใหม่จากคุณ ${data.name} ฿${data.amount}`);
    loadStats();
    loadDonations();
  });

  // Stats elements
  const statTodayAmount = document.getElementById('statTodayAmount');
  const statTodayCount = document.getElementById('statTodayCount');
  const statTotalAmount = document.getElementById('statTotalAmount');
  const statTotalCount = document.getElementById('statTotalCount');
  const statQuota = document.getElementById('statQuota');
  const statQuotaExpiry = document.getElementById('statQuotaExpiry');
  const statTopDonator = document.getElementById('statTopDonator');

  // Test Alert elements
  const testName = document.getElementById('testName');
  const testAmount = document.getElementById('testAmount');
  const testMessage = document.getElementById('testMessage');
  const btnSendTest = document.getElementById('btnSendTest');

  // Settings form elements
  const settingPromptPayId = document.getElementById('settingPromptPayId');
  const settingMinDonate = document.getElementById('settingMinDonate');
  const settingAlertDuration = document.getElementById('settingAlertDuration');
  const settingAlertVolume = document.getElementById('settingAlertVolume');
  const volumeDisplay = document.getElementById('volumeDisplay');
  const settingTtsEnabled = document.getElementById('settingTtsEnabled');
  const settingTtsMinAmount = document.getElementById('settingTtsMinAmount');
  const settingReceiverName = document.getElementById('settingReceiverName');
  const settingReceiverAccount = document.getElementById('settingReceiverAccount');
  const btnSaveSettings = document.getElementById('btnSaveSettings');

  // Blacklist elements
  const blacklistInput = document.getElementById('blacklistInput');
  const btnAddBlacklist = document.getElementById('btnAddBlacklist');
  const blacklistTags = document.getElementById('blacklistTags');

  // Donations table
  const donationsTableBody = document.getElementById('donationsTableBody');
  const btnRefreshDonations = document.getElementById('btnRefreshDonations');

  // Volume slider sync
  settingAlertVolume.addEventListener('input', () => {
    volumeDisplay.textContent = `${settingAlertVolume.value}%`;
  });

  // 1. Load Stats & SlipOK Quota
  async function loadStats() {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (!data.success) return;

      const s = data.stats;
      statTodayAmount.textContent = `฿${parseFloat(s.todayAmount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;
      statTodayCount.textContent = `${s.todayCount} รายการ`;
      statTotalAmount.textContent = `฿${parseFloat(s.totalAmount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;
      statTotalCount.textContent = `${s.totalCount} รายการ`;

      if (s.topDonator) {
        statTopDonator.textContent = `${s.topDonator.name} (฿${parseFloat(s.topDonator.total).toLocaleString('th-TH')})`;
      } else {
        statTopDonator.textContent = '-';
      }

      if (data.quota) {
        statQuota.textContent = `${data.quota.quota} สลิป`;
        statQuotaExpiry.textContent = data.quota.endDate ? `หมดอายุ ${data.quota.endDate}` : 'ปกติ';
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }

  // 2. Load Donations Table
  async function loadDonations() {
    try {
      const res = await fetch('/api/admin/donations?limit=30');
      const data = await res.json();
      if (!data.success) return;

      donationsTableBody.innerHTML = '';
      if (!data.donations || data.donations.length === 0) {
        donationsTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-dim); padding: 30px;">ยังไม่มีรายการโดเนท</td></tr>';
        return;
      }

      data.donations.forEach(d => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="color: var(--text-muted); font-size: 12px;">${d.created_at || '-'}</td>
          <td><strong>${escapeHtml(d.name)}</strong></td>
          <td style="color: #10b981; font-weight: 700;">฿${parseFloat(d.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
          <td style="max-width: 250px; word-break: break-word;">${escapeHtml(d.message || '-')}</td>
          <td style="font-family: monospace; font-size: 11px; color: var(--text-muted);">
            ${escapeHtml(d.sender_bank || '')} <br>
            <span style="opacity: 0.7;">${escapeHtml(d.transaction_ref || '')}</span>
          </td>
          <td><span class="badge verified">Verified</span></td>
          <td>
            <button class="btn secondary sm btn-replay" data-id="${d.id}" data-name="${escapeHtml(d.name)}" data-amount="${d.amount}" data-msg="${escapeHtml(d.message || '')}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
              Replay
            </button>
          </td>
        `;
        donationsTableBody.appendChild(tr);
      });

      // Bind replay buttons
      document.querySelectorAll('.btn-replay').forEach(btn => {
        btn.addEventListener('click', () => {
          replayAlert({
            id: btn.dataset.id,
            name: btn.dataset.name,
            amount: btn.dataset.amount,
            message: btn.dataset.msg
          });
        });
      });
    } catch (err) {
      console.error('Failed to load donations:', err);
    }
  }

  // 3. Test Alert
  btnSendTest.addEventListener('click', async () => {
    btnSendTest.disabled = true;
    try {
      const res = await fetch('/api/admin/test-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: testName.value.trim() || 'ผู้ชมทดสอบ',
          amount: parseFloat(testAmount.value) || 50,
          message: testMessage.value.trim() || 'ทดสอบระบบ Alert ขึ้นจอ OBS'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('ส่ง Test Alert ขึ้นจอ OBS เรียบร้อยแล้ว');
      } else {
        showToast(data.message || 'ส่งไม่สำเร็จ', true);
      }
    } catch (err) {
      showToast(err.message, true);
    } finally {
      btnSendTest.disabled = false;
    }
  });

  // Replay Alert
  async function replayAlert(item) {
    try {
      const res = await fetch('/api/admin/replay-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Replay Alert ของคุณ ${item.name} ขึ้นจอแล้ว`);
      }
    } catch (err) {
      showToast(err.message, true);
    }
  }

  // 4. Load Settings
  async function loadSettings() {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (!data.success) return;

      const s = data.settings;
      if (s.promptpay_id) settingPromptPayId.value = s.promptpay_id;
      if (s.min_donate) settingMinDonate.value = s.min_donate;
      if (s.alert_duration) settingAlertDuration.value = s.alert_duration;
      if (s.alert_volume) {
        settingAlertVolume.value = s.alert_volume;
        volumeDisplay.textContent = `${s.alert_volume}%`;
      }
      if (s.tts_enabled !== undefined) {
        settingTtsEnabled.value = s.tts_enabled;
      }
      if (s.tts_min_amount) settingTtsMinAmount.value = s.tts_min_amount;
      if (s.receiver_name) settingReceiverName.value = s.receiver_name;
      if (s.receiver_account) settingReceiverAccount.value = s.receiver_account;
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }

  // Save Settings
  btnSaveSettings.addEventListener('click', async () => {
    btnSaveSettings.disabled = true;
    try {
      const payload = {
        promptpay_id: settingPromptPayId.value.trim(),
        min_donate: settingMinDonate.value.trim(),
        alert_duration: settingAlertDuration.value.trim(),
        alert_volume: settingAlertVolume.value.trim(),
        tts_enabled: settingTtsEnabled.value,
        tts_min_amount: settingTtsMinAmount.value.trim(),
        receiver_name: settingReceiverName.value.trim(),
        receiver_account: settingReceiverAccount.value.trim()
      };

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        showToast('บันทึกการตั้งค่าเรียบร้อยแล้ว');
      } else {
        showToast(data.message || 'บันทึกไม่สำเร็จ', true);
      }
    } catch (err) {
      showToast(err.message, true);
    } finally {
      btnSaveSettings.disabled = false;
    }
  });

  // 5. Blacklist Words
  async function loadBlacklist() {
    try {
      const res = await fetch('/api/admin/blacklist');
      const data = await res.json();
      if (!data.success) return;

      blacklistTags.innerHTML = '';
      if (!data.blacklist || data.blacklist.length === 0) {
        blacklistTags.innerHTML = '<span style="color: var(--text-dim); font-size: 13px;">ยังไม่มีคำต้องห้าม</span>';
        return;
      }

      data.blacklist.forEach(item => {
        const span = document.createElement('span');
        span.className = 'tag-item';
        span.innerHTML = `
          ${escapeHtml(item.word)}
          <span class="tag-remove" data-id="${item.id}">&times;</span>
        `;
        blacklistTags.appendChild(span);
      });

      document.querySelectorAll('.tag-remove').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          await fetch(`/api/admin/blacklist/${id}`, { method: 'DELETE' });
          loadBlacklist();
        });
      });
    } catch (err) {
      console.error('Failed to load blacklist:', err);
    }
  }

  btnAddBlacklist.addEventListener('click', async () => {
    const word = blacklistInput.value.trim();
    if (!word) return;

    try {
      const res = await fetch('/api/admin/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word })
      });
      const data = await res.json();
      if (data.success) {
        blacklistInput.value = '';
        loadBlacklist();
        showToast(`เพิ่มคำว่า "${word}" เข้าสู่ Blacklist แล้ว`);
      }
    } catch (err) {
      showToast(err.message, true);
    }
  });

  // Refresh table button
  btnRefreshDonations.addEventListener('click', () => {
    loadDonations();
    loadStats();
    showToast('รีเฟรชข้อมูลแล้ว');
  });

  // Helper Toast
  function showToast(msg, isError = false) {
    const toast = document.getElementById('adminToast');
    toast.textContent = msg;
    toast.style.borderColor = isError ? 'var(--danger)' : 'var(--border-active)';
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3500);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Initial load
  loadStats();
  loadDonations();
  loadSettings();
  loadBlacklist();
});

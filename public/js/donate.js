document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const stepForm = document.getElementById('stepForm');
  const stepPayment = document.getElementById('stepPayment');
  const stepSuccess = document.getElementById('stepSuccess');

  const nameInput = document.getElementById('nameInput');
  const amountInput = document.getElementById('amountInput');
  const messageInput = document.getElementById('messageInput');
  const msgCount = document.getElementById('msgCount');

  const amountButtons = document.querySelectorAll('.amount-btn');
  const chipButtons = document.querySelectorAll('.chip-btn');
  const btnCreateQR = document.getElementById('btnCreateQR');

  const qrImage = document.getElementById('qrImage');
  const qrAmountDisplay = document.getElementById('qrAmountDisplay');
  const qrPromptPayId = document.getElementById('qrPromptPayId');

  const dropzone = document.getElementById('dropzone');
  const slipFileInput = document.getElementById('slipFileInput');
  const previewContainer = document.getElementById('previewContainer');
  const previewImg = document.getElementById('previewImg');
  const changeFileBtn = document.getElementById('changeFileBtn');

  const btnVerify = document.getElementById('btnVerify');
  const statusMsg = document.getElementById('statusMsg');
  const btnBackToForm = document.getElementById('btnBackToForm');
  const btnDonateAgain = document.getElementById('btnDonateAgain');

  // Success elements
  const receiptName = document.getElementById('receiptName');
  const receiptAmount = document.getElementById('receiptAmount');
  const receiptMessage = document.getElementById('receiptMessage');
  const receiptRef = document.getElementById('receiptRef');
  const receiptTime = document.getElementById('receiptTime');

  let selectedFile = null;
  let currentDonationData = {
    name: '',
    amount: 50,
    message: ''
  };

  // 1. Fetch initial config
  fetch('/api/donate/config')
    .then(res => res.json())
    .then(data => {
      if (data.success && data.minDonate) {
        amountInput.min = data.minDonate;
      }
    })
    .catch(err => console.error('Failed to load config:', err));

  // 2. Character counter
  messageInput.addEventListener('input', () => {
    msgCount.textContent = `${messageInput.value.length}/200`;
  });

  // 3. Amount preset buttons
  amountButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      amountButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      amountInput.value = btn.dataset.amount;
    });
  });

  // Prevent negative sign, plus sign, and scientific notation (e/E)
  amountInput.addEventListener('keydown', (e) => {
    if (['-', '+', 'e', 'E'].includes(e.key)) {
      e.preventDefault();
    }
  });

  // Sanitize on paste
  amountInput.addEventListener('paste', (e) => {
    const pasteData = (e.clipboardData || window.clipboardData).getData('text');
    if (!/^\d+(\.\d{1,2})?$/.test(pasteData.trim())) {
      e.preventDefault();
      showStatus('กรุณากรอกเฉพาะตัวเลขที่ถูกต้อง (ห้ามใส่เครื่องหมายติดลบหรือตัวอักษร)', 'error');
    }
  });

  amountInput.addEventListener('input', () => {
    // Strip any negative sign or invalid character
    if (/[^0-9.]/.test(amountInput.value)) {
      amountInput.value = amountInput.value.replace(/[^0-9.]/g, '');
    }

    amountButtons.forEach(b => {
      if (b.dataset.amount === amountInput.value) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
  });

  // 4. Quick message chips
  chipButtons.forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.dataset.msg;
      if (messageInput.value.trim() === '') {
        messageInput.value = text;
      } else {
        messageInput.value = `${messageInput.value} ${text}`.slice(0, 200);
      }
      msgCount.textContent = `${messageInput.value.length}/200`;
    });
  });

  // 5. Generate PromptPay QR
  btnCreateQR.addEventListener('click', async () => {
    hideStatus();
    const name = nameInput.value.trim() || 'ผู้สนับสนุนใจดี';
    const rawAmount = amountInput.value.trim();
    const message = messageInput.value.trim();

    // Strict positive numeric validation
    if (!rawAmount || !/^\d+(\.\d{1,2})?$/.test(rawAmount)) {
      showStatus('กรุณากรอกจำนวนเงินเป็นตัวเลขที่ถูกต้อง (ห้ามใส่เครื่องหมายติดลบหรือตัวอักษร)', 'error');
      return;
    }

    const amount = parseFloat(rawAmount);
    const minVal = parseFloat(amountInput.min) || 5;
    if (isNaN(amount) || amount < minVal) {
      showStatus(`ยอดเงินสนับสนุนขั้นต่ำคือ ${minVal} บาท`, 'error');
      return;
    }

    btnCreateQR.disabled = true;
    btnCreateQR.innerHTML = '<span class="spinner"></span> กำลังสร้าง PromptPay QR...';

    try {
      const res = await fetch('/api/donate/create-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, amount, message })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'สร้าง QR Code ไม่สำเร็จ');
      }

      currentDonationData = { name, amount, message };

      // Update QR display
      qrImage.src = data.qrDataUrl;
      qrAmountDisplay.textContent = `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;
      if (data.promptpayId) {
        qrPromptPayId.textContent = `พร้อมเพย์: ${data.promptpayId}`;
      }

      // Switch to payment step
      stepForm.style.display = 'none';
      stepPayment.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      showStatus(err.message, 'error');
    } finally {
      btnCreateQR.disabled = false;
      btnCreateQR.innerHTML = `<span>สร้าง QR Code ชำระเงิน</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
    }
  });

  // Back to step 1
  btnBackToForm.addEventListener('click', () => {
    stepPayment.classList.remove('active');
    stepForm.style.display = 'block';
    hideStatus();
  });

  // 6. File Selection & Drag & Drop & Paste Handlers
  dropzone.addEventListener('click', () => slipFileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  slipFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  changeFileBtn.addEventListener('click', () => {
    slipFileInput.click();
  });

  // Support Ctrl+V paste anywhere on the page
  window.addEventListener('paste', (e) => {
    if (stepPayment.classList.contains('active')) {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            handleFile(blob);
            showStatus('รับภาพสลิปจาก Clipboard เรียบร้อยแล้ว', 'success');
            break;
          }
        }
      }
    }
  });

  function handleFile(file) {
    if (!file.type.match('image.*')) {
      showStatus('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WEBP)', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showStatus('ขนาดไฟล์เกิน 5MB กรุณาเลือกไฟล์ใหม่', 'error');
      return;
    }

    selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewContainer.style.display = 'block';
      dropzone.style.display = 'none';
      btnVerify.disabled = false;
    };
    reader.readAsDataURL(file);
  }

  // 7. Verify Slip
  btnVerify.addEventListener('click', async () => {
    hideStatus();
    if (!selectedFile) {
      showStatus('กรุณาอัปโหลดรูปภาพสลิปก่อนกดยืนยัน', 'error');
      return;
    }

    btnVerify.disabled = true;
    btnVerify.innerHTML = '<span class="spinner"></span> กำลังตรวจสอบสลิปผ่าน SlipOK...';

    const formData = new FormData();
    formData.append('slip', selectedFile);
    formData.append('name', currentDonationData.name);
    formData.append('amount', currentDonationData.amount);
    formData.append('message', currentDonationData.message);

    try {
      const res = await fetch('/api/donate/verify', {
        method: 'POST',
        body: formData
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.message || 'การตรวจสอบสลิปล้มเหลว');
      }

      // Success! Show receipt
      const donation = result.data;
      receiptName.textContent = donation.name;
      receiptAmount.textContent = `฿${parseFloat(donation.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;
      receiptMessage.textContent = donation.message || '(ไม่มีข้อความ)';
      receiptRef.textContent = donation.transaction_ref;
      receiptTime.textContent = donation.created_at;

      stepPayment.classList.remove('active');
      stepSuccess.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      showStatus(err.message, 'error');
      btnVerify.disabled = false;
      btnVerify.innerHTML = `<span>ตรวจสอบการชำระเงิน</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    }
  });

  // Reset and donate again
  btnDonateAgain.addEventListener('click', () => {
    selectedFile = null;
    slipFileInput.value = '';
    previewContainer.style.display = 'none';
    dropzone.style.display = 'block';
    btnVerify.disabled = true;
    btnVerify.innerHTML = `<span>ตรวจสอบการชำระเงิน</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    messageInput.value = '';
    msgCount.textContent = '0/200';

    stepSuccess.style.display = 'none';
    stepForm.style.display = 'block';
    hideStatus();
  });

  function showStatus(text, type = 'error') {
    statusMsg.className = `status-msg ${type}`;
    statusMsg.textContent = text;
    statusMsg.style.display = 'block';
  }

  function hideStatus() {
    statusMsg.style.display = 'none';
  }
});

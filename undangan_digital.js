/* ==========================================================================
   UNDANGAN DIGITAL LUXURY EDITION - INTERACTION & CANVAS SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. FALLING PETALS & GOLD DUST CANVAS ENGINE
  // ==========================================
  const canvas = document.getElementById('petal-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = 35; // Flower petals & gold dust

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * -height;
        this.size = Math.random() * 6 + 4;
        this.speedY = Math.random() * 1.5 + 0.5;
        this.speedX = Math.sin(Math.random() * Math.PI) * 0.8;
        this.rotation = Math.random() * 360;
        this.spin = (Math.random() - 0.5) * 2;
        this.isGoldDust = Math.random() > 0.6; // 40% Petals, 60% Sparkles
        this.opacity = Math.random() * 0.7 + 0.3;
      }

      update() {
        this.y += this.speedY;
        this.x += Math.sin(this.y * 0.01) + this.speedX;
        this.rotation += this.spin;

        if (this.y > height + 20) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;

        if (this.isGoldDust) {
          // Floating Gold Sparkle
          ctx.beginPath();
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
          ctx.fillStyle = '#FCF6BA';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#D4AF37';
          ctx.fill();
        } else {
          // Soft Emerald/Gold Flower Petal
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(this.size, -this.size, this.size * 1.5, 0);
          ctx.quadraticCurveTo(this.size, this.size, 0, 0);
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(212, 175, 55, 0.7)' : 'rgba(24, 68, 59, 0.8)';
          ctx.fill();
        }

        ctx.restore();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animateParticles);
    }

    animateParticles();
  }

  // ==========================================
  // 2. DYNAMIC GUEST PERSONALIZATION & QR CODE
  // ==========================================
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('to') || urlParams.get('nama') || 'Tamu Undangan';

  const guestNameEl = document.getElementById('guest-name');
  const ticketGuestNameEl = document.getElementById('ticket-guest-name');
  const rsvpNameInput = document.getElementById('rsvp-name');

  if (guestNameEl) guestNameEl.textContent = guestName;
  if (ticketGuestNameEl) ticketGuestNameEl.textContent = guestName;
  if (rsvpNameInput && guestName !== 'Tamu Undangan') rsvpNameInput.value = guestName;

  // Generate Guest Pass QR Code
  const qrBox = document.getElementById('qrcode-box');
  if (qrBox) {
    if (typeof QRCode !== 'undefined') {
      new QRCode(qrBox, {
        text: `WEDDING-PASS|LUTFI-FITRI|${guestName}`,
        width: 140,
        height: 140,
        colorDark: '#0D231E',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
    } else {
      // Fallback QR SVG
      qrBox.innerHTML = `
        <svg width="140" height="140" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="#FFF"/>
          <path d="M10,10 H40 V40 H10 Z M20,20 H30 V30 H20 Z" fill="#0D231E"/>
          <path d="M60,10 H90 V40 H60 Z M70,20 H80 V30 H70 Z" fill="#0D231E"/>
          <path d="M10,60 H40 V90 H10 Z M20,70 H30 V80 H20 Z" fill="#0D231E"/>
          <rect x="50" y="50" width="10" height="10" fill="#D4AF37"/>
          <rect x="70" y="70" width="20" height="20" fill="#0D231E"/>
        </svg>
      `;
    }
  }

  // ==========================================
  // 3. COVER OPENING & VINYL AUDIO CONTROL
  // ==========================================
  const coverEl = document.getElementById('cover');
  const openBtn = document.getElementById('btn-open');
  const audioPlayer = document.getElementById('bg-audio');
  const vinylBtn = document.getElementById('btn-audio');
  let isPlaying = false;

  document.body.classList.add('locked');

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      coverEl.classList.add('opened');
      document.body.classList.remove('locked');

      // Attempt background music play
      if (audioPlayer) {
        audioPlayer.play().then(() => {
          isPlaying = true;
          if (vinylBtn) vinylBtn.classList.add('playing');
        }).catch((err) => {
          console.warn('Browser prevented autoplay:', err);
        });
      }

      // Smooth scroll to hero section
      const heroSec = document.getElementById('hero');
      if (heroSec) heroSec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (vinylBtn && audioPlayer) {
    vinylBtn.addEventListener('click', () => {
      if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
        vinylBtn.classList.remove('playing');
        showToast('🎵 Musik Dihentikan');
      } else {
        audioPlayer.play().then(() => {
          isPlaying = true;
          vinylBtn.classList.add('playing');
          showToast('🎶 Memutar Musik Undangan');
        });
      }
    });
  }

  // ==========================================
  // 4. LIVE COUNTDOWN TIMER
  // ==========================================
  const weddingDate = new Date('December 12, 2026 08:00:00 GMT+0700').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (distance < 0) {
      if (daysEl) daysEl.innerText = '00';
      if (hoursEl) hoursEl.innerText = '00';
      if (minutesEl) minutesEl.innerText = '00';
      if (secondsEl) secondsEl.innerText = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.innerText = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.innerText = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.innerText = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.innerText = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ==========================================
  // 5. GOOGLE CALENDAR INTEGRATION
  // ==========================================
  const btnCalAkad = document.getElementById('btn-cal-akad');
  const btnCalResepsi = document.getElementById('btn-cal-resepsi');

  if (btnCalAkad) {
    btnCalAkad.addEventListener('click', () => {
      const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Akad+Nikah+Lutfi+%26+Fitri&dates=20261212T010000Z/20261212T040000Z&details=Akad+Nikah+Moh.+Lutfi+%26+Fitriani+Nur+Azizah&location=Masjid+Agung+Emerald+Surabaya`;
      window.open(gCalUrl, '_blank');
    });
  }

  if (btnCalResepsi) {
    btnCalResepsi.addEventListener('click', () => {
      const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Resepsi+Pernikahan+Lutfi+%26+Fitri&dates=20261212T040000Z/20261212T080000Z&details=Resepsi+Pernikahan+Moh.+Lutfi+%26+Fitriani+Nur+Azizah&location=Grand+Ballroom+Royal+Palace+Surabaya`;
      window.open(gCalUrl, '_blank');
    });
  }

  // ==========================================
  // 6. SCROLL REVEAL & BOTTOM NAV HIGHLIGHT
  // ==========================================
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const sections = document.querySelectorAll('section, #hero');
  const navItems = document.querySelectorAll('.nav-item');

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, observerOptions);

  revealElements.forEach((el) => revealObserver.observe(el));

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach((sec) => {
      const secTop = sec.offsetTop;
      const secHeight = sec.clientHeight;
      if (pageYOffset >= secTop - 250) {
        current = sec.getAttribute('id');
      }
    });

    navItems.forEach((item) => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${current}`) {
        item.classList.add('active');
      }
    });
  });

  // ==========================================
  // 7. COPY TO CLIPBOARD & TOAST NOTIFICATION
  // ==========================================
  const toastEl = document.getElementById('toast');
  const copyButtons = document.querySelectorAll('.btn-copy');

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3200);
  }

  copyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const accountNum = btn.getAttribute('data-account');
      if (accountNum) {
        navigator.clipboard.writeText(accountNum).then(() => {
          showToast(`✨ No. Rekening ${accountNum} Berhasil Disalin!`);
        }).catch(() => {
          const tempInput = document.createElement('input');
          tempInput.value = accountNum;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
          showToast(`✨ No. Rekening ${accountNum} Berhasil Disalin!`);
        });
      }
    });
  });

  // ==========================================
  // 8. MODAL POPUPS (QRIS & LIGHTBOX)
  // ==========================================
  const qrisModal = document.getElementById('qris-modal');
  const btnShowQris = document.getElementById('btn-show-qris');
  const closeQris = document.getElementById('close-qris');

  if (btnShowQris && qrisModal) {
    btnShowQris.addEventListener('click', () => qrisModal.classList.add('active'));
  }
  if (closeQris && qrisModal) {
    closeQris.addEventListener('click', () => qrisModal.classList.remove('active'));
  }

  // Lightbox Modal for Gallery
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxDisplay = document.getElementById('lightbox-display');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeLightbox = document.getElementById('close-lightbox');

  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      const placeholder = item.querySelector('.gallery-placeholder');
      const text = item.querySelector('span') ? item.querySelector('span').innerText : 'Momen Bahagia';
      const icon = item.querySelector('i') ? item.querySelector('i').outerHTML : '';

      if (lightboxDisplay && lightboxModal) {
        lightboxDisplay.className = `lightbox-display ${placeholder ? placeholder.classList[1] : ''}`;
        lightboxDisplay.innerHTML = `${icon} <h3 style="margin-top:15px; font-family:var(--font-heading);">${text}</h3>`;
        lightboxCaption.innerText = `Lutfi & Fitri — ${text}`;
        lightboxModal.classList.add('active');
      }
    });
  });

  if (closeLightbox && lightboxModal) {
    closeLightbox.addEventListener('click', () => lightboxModal.classList.remove('active'));
  }

  // Close modals on outside click
  window.addEventListener('click', (e) => {
    if (e.target === qrisModal) qrisModal.classList.remove('active');
    if (e.target === lightboxModal) lightboxModal.classList.remove('active');
  });

  // ==========================================
  // 9. RSVP & BUKU TAMU LOCALSTORAGE SYSTEM
  // ==========================================
  const rsvpForm = document.getElementById('rsvp-form');
  const wishesListEl = document.getElementById('wishes-list');
  const wishesCountEl = document.getElementById('wishes-count');

  const defaultWishes = [
    {
      name: 'Rian & Keluarga',
      status: 'hadir',
      count: '2 Orang',
      message: 'Selamat untuk Lutfi & Fitri! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Aamiin 🤲✨',
      time: '1 jam yang lalu'
    },
    {
      name: 'Budi Santoso',
      status: 'hadir',
      count: '1 Orang',
      message: 'Barakallahu lakuma wa baraka alaikuma wa jamaa bainakuma fii khair sahabatku Lutfi! 💐',
      time: '3 jam yang lalu'
    },
    {
      name: 'Siti Rahma',
      status: 'halangan',
      count: '0 Orang',
      message: 'Selamat ya Lutfi & Fitri! Mohon maaf belum bisa hadir langsung, doa terbaik untuk kalian berdua 💖',
      time: '5 jam yang lalu'
    }
  ];

  function getStoredWishes() {
    const stored = localStorage.getItem('wedding_wishes_lutfi');
    if (!stored) {
      localStorage.setItem('wedding_wishes_lutfi', JSON.stringify(defaultWishes));
      return defaultWishes;
    }
    try {
      return JSON.parse(stored);
    } catch (e) {
      return defaultWishes;
    }
  }

  function renderWishes() {
    if (!wishesListEl) return;
    const wishes = getStoredWishes();
    wishesListEl.innerHTML = '';
    if (wishesCountEl) wishesCountEl.textContent = wishes.length;

    wishes.forEach((item) => {
      const wishItem = document.createElement('div');
      wishItem.className = 'wish-item';

      const isHadir = item.status === 'hadir';
      const statusBadge = isHadir
        ? `<span class="wish-status status-hadir"><i class="fas fa-check-circle"></i> Hadir (${item.count || '1 Orang'})</span>`
        : `<span class="wish-status status-halangan"><i class="fas fa-times-circle"></i> Berhalangan</span>`;

      wishItem.innerHTML = `
        <div class="wish-header">
          <span class="wish-name">${escapeHtml(item.name)}</span>
          ${statusBadge}
        </div>
        <div class="wish-message">${escapeHtml(item.message)}</div>
        <div class="wish-time"><i class="far fa-clock"></i> ${escapeHtml(item.time)}</div>
      `;

      wishesListEl.appendChild(wishItem);
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
  }

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('rsvp-name').value.trim();
      const statusInput = document.querySelector('input[name="rsvp-status"]:checked').value;
      const countInput = document.getElementById('rsvp-count').value;
      const messageInput = document.getElementById('rsvp-message').value.trim();

      if (!nameInput || !messageInput) {
        showToast('⚠️ Mohon lengkapi Nama dan Ucapan Doa!');
        return;
      }

      const newWish = {
        name: nameInput,
        status: statusInput,
        count: countInput,
        message: messageInput,
        time: 'Baru saja'
      };

      const currentWishes = getStoredWishes();
      currentWishes.unshift(newWish);
      localStorage.setItem('wedding_wishes_lutfi', JSON.stringify(currentWishes));

      renderWishes();
      rsvpForm.reset();
      showToast('💌 Terima kasih atas Doa dan Konfirmasinya!');
    });
  }

  renderWishes();
});

/**
 * Shanoob & Sajla Wedding Invitation - Standalone JavaScript Engine
 * Controls: Audio Synthesizer, Countdown Timer, Smooth Scroll Speed-Dial,
 * Calendar (.ics/Google), Photo Gallery Lightbox, and RSVP/Share Modals.
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------
  // 1. Web Audio API Soft Wedding Melody Synthesizer
  // -------------------------------------------------------------
  let isAudioPlaying = false;
  let audioCtx = null;
  let isCancelled = false;

  const btnMusicToggle = document.getElementById('btn-music-toggle');
  const musicPulseRing = document.getElementById('music-pulse-ring');
  const musicIconPlaying = document.getElementById('music-icon-playing');
  const musicIconMuted = document.getElementById('music-icon-muted');

  const notes = [220.0, 277.18, 329.63, 415.3, 440.0, 493.88, 554.37, 659.25, 739.99];
  const melodySequence = [0, 2, 4, 6, 7, 6, 4, 2, 1, 3, 5, 7, 8, 7, 5, 3, 0, 4, 6, 8, 7, 4, 2, 1];
  let currentStep = 0;

  function playWeddingMelody() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
      isCancelled = false;

      function scheduleNextNote() {
        if (isCancelled || !audioCtx || audioCtx.state === 'closed') return;

        const noteIndex = melodySequence[currentStep % melodySequence.length];
        const freq = notes[noteIndex];

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.6);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 1.8);

        currentStep++;
        setTimeout(scheduleNextNote, 520);
      }

      scheduleNextNote();
    } catch (e) {
      console.warn('Audio Context interaction pending');
    }
  }

  function toggleMusic() {
    if (isAudioPlaying) {
      isCancelled = true;
      if (audioCtx) {
        audioCtx.close().catch(() => {});
        audioCtx = null;
      }
      isAudioPlaying = false;
      if (musicPulseRing) musicPulseRing.style.display = 'none';
      if (musicIconPlaying) musicIconPlaying.style.display = 'none';
      if (musicIconMuted) musicIconMuted.style.display = 'block';
    } else {
      isAudioPlaying = true;
      playWeddingMelody();
      if (musicPulseRing) musicPulseRing.style.display = 'block';
      if (musicIconPlaying) musicIconPlaying.style.display = 'block';
      if (musicIconMuted) musicIconMuted.style.display = 'none';
    }
  }

  if (btnMusicToggle) {
    btnMusicToggle.addEventListener('click', toggleMusic);
  }

  // -------------------------------------------------------------
  // 2. Floating Circular Navigation Speed-Dial Menu
  // -------------------------------------------------------------
  const btnHomeCircle = document.getElementById('btn-home-circle');
  const floatingNavStack = document.getElementById('floating-nav-stack');
  const navBackdropOverlay = document.getElementById('nav-backdrop-overlay');
  const iconHome = document.getElementById('nav-icon-home');
  const iconClose = document.getElementById('nav-icon-close');

  let isNavOpen = false;

  function toggleNav() {
    isNavOpen = !isNavOpen;
    if (isNavOpen) {
      floatingNavStack.classList.remove('hidden');
      floatingNavStack.classList.add('flex', 'open');
      navBackdropOverlay.classList.remove('hidden');
      navBackdropOverlay.classList.add('open');
      btnHomeCircle.classList.add('active');
      if (iconHome) iconHome.style.display = 'none';
      if (iconClose) iconClose.style.display = 'block';
    } else {
      floatingNavStack.classList.add('hidden');
      floatingNavStack.classList.remove('flex', 'open');
      navBackdropOverlay.classList.add('hidden');
      navBackdropOverlay.classList.remove('open');
      btnHomeCircle.classList.remove('active');
      if (iconHome) iconHome.style.display = 'block';
      if (iconClose) iconClose.style.display = 'none';
    }
  }

  if (btnHomeCircle) {
    btnHomeCircle.addEventListener('click', toggleNav);
  }

  if (navBackdropOverlay) {
    navBackdropOverlay.addEventListener('click', () => {
      if (isNavOpen) toggleNav();
    });
  }

  // Scroll to section handler
  const navButtons = document.querySelectorAll('.nav-sub-btn');
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (isNavOpen) toggleNav();
    });
  });

  // Track active section on scroll
  const sectionIds = ['hero', 'date', 'couple', 'location', 'gallery', 'welcome'];
  window.addEventListener(
    'scroll',
    () => {
      const scrollPos = window.scrollY + window.innerHeight / 3;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(sectionIds[i]);
        if (section && scrollPos >= section.offsetTop) {
          navButtons.forEach((btn) => {
            if (btn.getAttribute('data-target') === sectionIds[i]) {
              btn.classList.add('active');
            } else {
              btn.classList.remove('active');
            }
          });
          break;
        }
      }
    },
    { passive: true }
  );

  // -------------------------------------------------------------
  // 3. Live Countdown Timer (Target: September 27, 2026, 12:00 PM IST)
  // -------------------------------------------------------------
  const countDays = document.getElementById('count-days');
  const countHours = document.getElementById('count-hours');
  const countMins = document.getElementById('count-mins');
  const countSecs = document.getElementById('count-secs');

  const targetDate = new Date('2026-09-27T12:00:00+05:30').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      if (countDays) countDays.textContent = '00';
      if (countHours) countHours.textContent = '00';
      if (countMins) countMins.textContent = '00';
      if (countSecs) countSecs.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n) => String(n).padStart(2, '0');

    if (countDays) countDays.textContent = pad(days);
    if (countHours) countHours.textContent = pad(hours);
    if (countMins) countMins.textContent = pad(minutes);
    if (countSecs) countSecs.textContent = pad(seconds);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // -------------------------------------------------------------
  // Save The Date Flip Animation: odometer count 1 -> 27, replays
  // every time the section is scrolled into view.
  // -------------------------------------------------------------
  const flipDisplay = document.getElementById('flip-day-display');
  const locationSection = document.getElementById('location');
  let isFlipping = false;

  function playFlipCount() {
    if (isFlipping || !flipDisplay) return;
    isFlipping = true;

    const pad = (n) => String(n).padStart(2, '0');
    let current = 1;
    flipDisplay.textContent = pad(current);

    const stepMs = 70; // speed of each digit flip
    const timer = setInterval(() => {
      flipDisplay.classList.add('animate-date-flip');

      setTimeout(() => {
        current += 1;
        flipDisplay.textContent = pad(current);
        flipDisplay.classList.remove('animate-date-flip');

        if (current >= 27) {
          clearInterval(timer);
          isFlipping = false;
        }
      }, stepMs * 0.5);
    }, stepMs);
  }

  if (flipDisplay && locationSection) {
    const flipObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          playFlipCount();
        }
      },
      { threshold: 0.3 }
    );
    flipObserver.observe(locationSection);
  }

  // -------------------------------------------------------------
  // 4. Save The Date Dropdown & Calendar Export
  // -------------------------------------------------------------
  const btnSaveDate = document.getElementById('btn-save-the-date');
  const calendarDropdown = document.getElementById('calendar-dropdown');
  const btnDownloadIcs = document.getElementById('btn-download-ics');

  if (btnSaveDate && calendarDropdown) {
    btnSaveDate.addEventListener('click', (e) => {
      e.stopPropagation();
      calendarDropdown.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      calendarDropdown.classList.remove('open');
    });
  }

  if (btnDownloadIcs) {
    btnDownloadIcs.addEventListener('click', () => {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Shanoob & Sajla Wedding//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:Wedding: Shanoob & Sajla
DESCRIPTION:We invite you to celebrate our wedding on September 27, 2026.
LOCATION:N Woods Convention Centre, Hospital Junction, Nechully
DTSTART:20260927T063000Z
DTEND:20260927T103000Z
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Shanoob_Sajla_Wedding.ics';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (calendarDropdown) calendarDropdown.classList.remove('open');
    });
  }

  // -------------------------------------------------------------
  // 5. Moments Photo Gallery Lightbox
  // -------------------------------------------------------------
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const btnCloseLightbox = document.getElementById('btn-close-lightbox');

  const galleryCards = document.querySelectorAll('.gallery-item');
  galleryCards.forEach((card) => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      const title = card.getAttribute('data-title');
      const desc = card.getAttribute('data-desc');

      if (lightboxImg && img) lightboxImg.src = img.src;
      if (lightboxTitle) lightboxTitle.textContent = title || '';
      if (lightboxDesc) lightboxDesc.textContent = desc || '';
      if (lightboxModal) lightboxModal.classList.add('open');
    });
  });
 
  if (btnCloseLightbox && lightboxModal) {
    btnCloseLightbox.addEventListener('click', () => {
      lightboxModal.classList.remove('open');
    });

    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.classList.remove('open');
      }
    });
  }
});
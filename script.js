/* ==========================================================================
   HELLO WORLD - INTERACTIVE ENGINE
   ========================================================================== */

(function () {
  'use strict';

  // --- Audio Synthesis (Web Audio API) ---
  let audioCtx = null;
  let soundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
  }

  function playChime(freq = 520, type = 'sine', duration = 0.3) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      // Soft exponential decay
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio safety fallback
    }
  }

  function playSparkChords() {
    if (!soundEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major Pentatonic high notes
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playChime(freq, 'sine', 0.45);
      }, idx * 60);
    });
  }

  // --- Sound Toggle ---
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundOnIcon = soundToggleBtn?.querySelector('.sound-on');
  const soundOffIcon = soundToggleBtn?.querySelector('.sound-off');

  soundToggleBtn?.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      soundOnIcon?.classList.remove('hidden');
      soundOffIcon?.classList.add('hidden');
      playChime(660, 'triangle', 0.2);
    } else {
      soundOnIcon?.classList.add('hidden');
      soundOffIcon?.classList.remove('hidden');
    }
  });

  // --- Realtime Clock & Time-aware Greeting ---
  const timeDisplay = document.getElementById('live-time-display');
  const greetingLabel = document.getElementById('dynamic-greeting-label');

  function updateClock() {
    const now = new Date();
    if (timeDisplay) {
      timeDisplay.textContent = now.toLocaleTimeString();
    }
    if (greetingLabel) {
      const hour = now.getHours();
      let timeOfDay = 'GOOD DAY';
      if (hour < 5) timeOfDay = 'NIGHT OWL MODE';
      else if (hour < 12) timeOfDay = 'GOOD MORNING';
      else if (hour < 17) timeOfDay = 'GOOD AFTERNOON';
      else timeOfDay = 'GOOD EVENING';

      greetingLabel.textContent = `${timeOfDay} • EXPLORER`;
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  // --- Multilingual Greeting Switcher ---
  const languages = [
    { code: 'en', name: 'English', greeting: 'Hello, World!', desc: 'English • Global Debut' },
    { code: 'hi', name: 'हिन्दी', greeting: 'नमस्ते, दुनिया!', desc: 'Hindi • Welcome with respect' },
    { code: 'es', name: 'Español', greeting: '¡Hola, Mundo!', desc: 'Spanish • Warm & Vibrant' },
    { code: 'ja', name: '日本語', greeting: 'こんにちは、世界！', desc: 'Japanese • Elegant & Pure' },
    { code: 'fr', name: 'Français', greeting: 'Bonjour le Monde!', desc: 'French • Artful & Expressive' }
  ];

  let currentLangIndex = 0;
  const mainGreetingEl = document.getElementById('main-greeting');
  const languageSubtextEl = document.getElementById('language-subtext');
  const langPills = document.querySelectorAll('.lang-pill');
  const cycleBtn = document.getElementById('cycle-btn');

  function setLanguage(index, triggerSound = true) {
    currentLangIndex = (index + languages.length) % languages.length;
    const selected = languages[currentLangIndex];

    if (mainGreetingEl) {
      const titleText = mainGreetingEl.querySelector('.title-text');
      if (titleText) {
        titleText.style.opacity = '0';
        titleText.style.transform = 'translateY(12px) scale(0.96)';

        setTimeout(() => {
          titleText.textContent = selected.greeting;
          titleText.style.opacity = '1';
          titleText.style.transform = 'translateY(0) scale(1)';
        }, 180);
      }
    }

    if (languageSubtextEl) {
      languageSubtextEl.innerHTML = `${selected.desc.split('•')[0].trim()} <span class="divider">•</span> ${selected.desc.split('•')[1]?.trim() || 'Global Greeting'}`;
    }

    langPills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.lang === selected.code);
    });

    if (triggerSound) {
      playChime(440 + currentLangIndex * 50, 'sine', 0.25);
    }
  }

  langPills.forEach((pill, idx) => {
    pill.addEventListener('click', () => {
      setLanguage(idx);
    });
  });

  cycleBtn?.addEventListener('click', () => {
    setLanguage(currentLangIndex + 1);
  });

  // --- Theme Switcher ---
  const themeBtns = document.querySelectorAll('.theme-btn');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTheme = btn.dataset.theme;
      document.body.className = `theme-${targetTheme}`;

      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      playChime(784, 'triangle', 0.2);
    });
  });

  // --- 3D Card Perspective Tilt Effect ---
  const cardContainer = document.querySelector('.card-perspective-container');
  const heroCard = document.getElementById('interactive-card');

  if (cardContainer && heroCard) {
    let bounds;

    function refreshBounds() {
      bounds = heroCard.getBoundingClientRect();
    }

    window.addEventListener('resize', refreshBounds);
    refreshBounds();

    cardContainer.addEventListener('mouseenter', refreshBounds);

    cardContainer.addEventListener('mousemove', (e) => {
      if (!bounds) refreshBounds();
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const leftX = mouseX - bounds.x;
      const topY = mouseY - bounds.y;
      const center = {
        x: leftX - bounds.width / 2,
        y: topY - bounds.height / 2
      };

      const maxRotate = 8;
      const rotateX = (-center.y / (bounds.height / 2)) * maxRotate;
      const rotateY = (center.x / (bounds.width / 2)) * maxRotate;

      heroCard.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;

      // Dynamic Glare
      const glareX = (leftX / bounds.width) * 100;
      const glareY = (topY / bounds.height) * 100;
      heroCard.style.setProperty('--mouse-x', `${glareX.toFixed(1)}%`);
      heroCard.style.setProperty('--mouse-y', `${glareY.toFixed(1)}%`);
    });

    cardContainer.addEventListener('mouseleave', () => {
      heroCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
      heroCard.style.setProperty('--mouse-x', '50%');
      heroCard.style.setProperty('--mouse-y', '50%');
    });
  }

  // --- Interactive Spark Burst & Counter ---
  const sparkBtn = document.getElementById('spark-btn');
  const clickCounter = document.getElementById('click-counter');
  let sparksCount = 0;

  function triggerSparkleBurst(x, y) {
    playSparkChords();
    sparksCount += 12;
    if (clickCounter) {
      clickCounter.textContent = `${sparksCount} Sparks`;
    }

    const particleCount = 20;
    const colors = [
      'var(--accent-primary)',
      'var(--accent-secondary)',
      '#ffffff',
      '#f59e0b'
    ];

    for (let i = 0; i < particleCount; i++) {
      const spark = document.createElement('div');
      spark.className = 'sparkle-burst';
      const size = Math.random() * 8 + 4;
      spark.style.width = `${size}px`;
      spark.style.height = `${size}px`;
      spark.style.background = colors[Math.floor(Math.random() * colors.length)];
      spark.style.boxShadow = `0 0 10px ${spark.style.background}`;
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;

      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5);
      const distance = Math.random() * 120 + 40;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      spark.style.setProperty('--tx', `${tx}px`);
      spark.style.setProperty('--ty', `${ty}px`);

      document.body.appendChild(spark);

      setTimeout(() => {
        spark.remove();
      }, 900);
    }
  }

  sparkBtn?.addEventListener('click', (e) => {
    const rect = sparkBtn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    triggerSparkleBurst(x, y);
  });

  // --- Dynamic Particle Canvas Background ---
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = 65;

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.8;
        this.baseSpeedX = (Math.random() - 0.5) * 0.7;
        this.baseSpeedY = (Math.random() - 0.5) * 0.7;
        this.speedX = this.baseSpeedX;
        this.speedY = this.baseSpeedY;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > width) this.speedX *= -1;
        if (this.y < 0 || this.y > height) this.speedY *= -1;
      }

      draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function initParticles() {
      resizeCanvas();
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });

    initParticles();

    // Mouse Interaction with Particles
    let mouse = { x: null, y: null, radius: 140 };
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    // FPS Meter Loop
    let lastTime = performance.now();
    let frameCount = 0;
    const fpsCounter = document.getElementById('fps-counter');

    function animate(currentTime) {
      ctx.clearRect(0, 0, width, height);

      // Connect nearby particles
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.hypot(dx, dy);

          if (distance < 110) {
            const alpha = (1 - distance / 110) * 0.15;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }

      // Update & Draw Particles with Mouse Gravity
      particles.forEach(p => {
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            p.x -= Math.cos(angle) * force * 2.2;
            p.y -= Math.sin(angle) * force * 2.2;
          }
        }

        p.update();
        p.draw();
      });

      // FPS calculation
      frameCount++;
      if (currentTime - lastTime >= 1000) {
        if (fpsCounter) {
          fpsCounter.textContent = `${frameCount} FPS`;
        }
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }
})();

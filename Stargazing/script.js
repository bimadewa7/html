(() => {
  const starField = document.getElementById('star-field');
  const moon = document.getElementById('moon');
  const moonDescription = document.getElementById('moon-description');

  const phases = [
    { key: 'new', name: 'Bulan baru' },
    { key: 'waxing-crescent', name: 'Bulan sabit muda' },
    { key: 'first-quarter', name: 'Perbani awal' },
    { key: 'waxing-gibbous', name: 'Cembung menuju purnama' },
    { key: 'full', name: 'Bulan purnama' },
    { key: 'waning-gibbous', name: 'Cembung menuju sabit' },
    { key: 'last-quarter', name: 'Perbani akhir' },
    { key: 'waning-crescent', name: 'Bulan sabit tua' }
  ];

  function makeStars() {
    if (!starField) return;
    const count = Math.min(115, Math.max(52, Math.floor((window.innerWidth * window.innerHeight) / 10500)));
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i += 1) {
      const star = document.createElement('span');
      const cross = i % 17 === 0;
      star.className = cross ? 'star star-cross' : 'star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.setProperty('--size', `${cross ? 8 : 1 + Math.random() * 2}px`);
      star.style.setProperty('--opacity', `${0.22 + Math.random() * 0.55}`);
      star.style.setProperty('--duration', `${6 + Math.random() * 8}s`);
      star.style.setProperty('--delay', `${-Math.random() * 10}s`);
      fragment.appendChild(star);
    }
    starField.replaceChildren(fragment);
  }

  // Approximate lunar age from a known new moon; visual use only, not astronomy.
  function getPhaseForLocalDate(date) {
    const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14);
    const localMiddayAsUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12);
    const synodicMonth = 29.530588853;
    const age = (((localMiddayAsUtc - knownNewMoon) / 86400000) % synodicMonth + synodicMonth) % synodicMonth;
    const index = Math.floor((age / synodicMonth) * phases.length + 0.5) % phases.length;
    return phases[index];
  }

  function updateMoon() {
    try {
      const now = new Date();
      const phase = getPhaseForLocalDate(now);
      moon.dataset.phase = phase.key;
      if (moonDescription) {
        moonDescription.setAttribute('aria-label', `${phase.name}, ilustrasi dekoratif untuk tanggal lokal hari ini`);
      }
    } catch (error) {
      if (moon) moon.dataset.phase = 'default';
      if (moonDescription) {
        moonDescription.setAttribute('aria-label', 'Ilustrasi bulan dekoratif');
      }
    }
  }

  function scheduleLocalMidnightUpdate() {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
    const delay = Math.max(1000, nextMidnight - now.getTime() + 1000);
    window.setTimeout(() => {
      updateMoon();
      scheduleLocalMidnightUpdate();
    }, delay);
  }

  makeStars();
  updateMoon();
  scheduleLocalMidnightUpdate();

  window.addEventListener('resize', () => {
    window.clearTimeout(window.__starResizeTimer);
    window.__starResizeTimer = window.setTimeout(makeStars, 180);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateMoon();
  });

  // Putar musik background berurutan
  const playlist = [
    'sounds/Last_Night_on_Earth.mp3'
  ];
  let currentTrackIndex = 0;
  const audio = new Audio(playlist[currentTrackIndex]);
  audio.volume = 0.5; // Pastikan volume tidak 0
  let hasStarted = false;

  audio.addEventListener('ended', () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    audio.src = playlist[currentTrackIndex];
    audio.play().catch(() => {});
  });

  function startAudio() {
    if (!hasStarted) {
      audio.play().then(() => {
        hasStarted = true;
        const hint = document.getElementById('click-hint');
        if (hint) {
          hint.style.opacity = '0';
          setTimeout(() => hint.remove(), 1000);
        }
      }).catch(err => console.log('Gagal memutar audio:', err));
    }
  }

  document.body.addEventListener('click', startAudio);
  document.body.addEventListener('touchstart', startAudio, { passive: true });
  document.addEventListener('keydown', startAudio);
})();

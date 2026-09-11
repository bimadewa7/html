/**
 * Bima Arya Dewa — Editorial Continuous Music Box & Seamless SPA Engine
 * Provides nonstop background audio across all pages, shuffle, pause, skip,
 * progress scrubber, volume, playlist drawer, and state persistence.
 */

(function () {
  'use strict';

  // ==========================================
  // 1. PLAYLIST DEFINITION
  // ==========================================
  const PLAYLIST = [
    {
      title: "A Night To Remember",
      artist: "Bima's Study Session",
      tag: "Acoustic Focus",
      file: "sounds/A_Night_To_Remember.mp3",
      coverCode: "ANTR",
    },
    {
      title: "Flawless",
      artist: "Bima's Study Session",
      tag: "Chill Tempo",
      file: "sounds/Flawless.mp3",
      coverCode: "FLWS",
    },
    {
      title: "The Shining",
      artist: "Bima's Study Session",
      tag: "Editorial Mood",
      file: "sounds/The_Shining.mp3",
      coverCode: "SHIN",
    }
  ];

  const STORAGE_KEY = 'bima_music_box_state_v1';

  // ==========================================
  // 2. STATE INITIALIZATION
  // ==========================================
  let state = {
    currentIndex: 0,
    currentTime: 0,
    isPlaying: false,
    isShuffle: false,
    repeatMode: 'all', // 'all' | 'one' | 'off'
    volume: 0.8,
    isMuted: false,
    isExpanded: false,
    playlistOpen: false,
    shuffleOrder: [0, 1, 2],
    shufflePos: 0
  };

  // Load persisted state
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed.currentIndex === 'number' && parsed.currentIndex >= 0 && parsed.currentIndex < PLAYLIST.length) {
        state.currentIndex = parsed.currentIndex;
      }
      if (typeof parsed.currentTime === 'number' && !isNaN(parsed.currentTime)) {
        // Compensate for load latency if it was playing
        const elapsed = parsed.timestamp ? (Date.now() - parsed.timestamp) / 1000 : 0;
        state.currentTime = Math.max(0, parsed.currentTime + (parsed.isPlaying ? Math.min(elapsed, 3) : 0));
      }
      if (typeof parsed.isShuffle === 'boolean') state.isShuffle = parsed.isShuffle;
      if (['all', 'one', 'off'].includes(parsed.repeatMode)) state.repeatMode = parsed.repeatMode;
      if (typeof parsed.volume === 'number') state.volume = Math.max(0, Math.min(1, parsed.volume));
      if (typeof parsed.isMuted === 'boolean') state.isMuted = parsed.isMuted;
      if (typeof parsed.isExpanded === 'boolean') state.isExpanded = parsed.isExpanded;
      if (typeof parsed.isPlaying === 'boolean') state.isPlaying = parsed.isPlaying;
      if (Array.isArray(parsed.shuffleOrder) && parsed.shuffleOrder.length === PLAYLIST.length) {
        state.shuffleOrder = parsed.shuffleOrder;
        state.shufflePos = typeof parsed.shufflePos === 'number' ? parsed.shufflePos : 0;
      }
    }
  } catch (err) {
    console.warn('[MusicBox] Could not read localStorage:', err);
  }

  function saveState() {
    try {
      const toSave = {
        currentIndex: state.currentIndex,
        currentTime: audio ? audio.currentTime : state.currentTime,
        isPlaying: audio ? !audio.paused : state.isPlaying,
        isShuffle: state.isShuffle,
        repeatMode: state.repeatMode,
        volume: state.volume,
        isMuted: state.isMuted,
        isExpanded: state.isExpanded,
        shuffleOrder: state.shuffleOrder,
        shufflePos: state.shufflePos,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (err) {
      // ignore storage quota errors
    }
  }

  // ==========================================
  // 3. SHUFFLE HELPER
  // ==========================================
  function generateShuffleOrder(currentIdx) {
    const indices = PLAYLIST.map((_, i) => i);
    // Fisher-Yates
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    // Put current song first in the new shuffle order
    if (typeof currentIdx === 'number') {
      const pos = indices.indexOf(currentIdx);
      if (pos > -1) {
        indices.splice(pos, 1);
        indices.unshift(currentIdx);
      }
    }
    return indices;
  }

  if (state.isShuffle && (!state.shuffleOrder || state.shuffleOrder.length !== PLAYLIST.length)) {
    state.shuffleOrder = generateShuffleOrder(state.currentIndex);
    state.shufflePos = 0;
  }

  // ==========================================
  // 4. AUDIO ELEMENT & EVENT HANDLERS
  // ==========================================
  let audio = null;
  let isSeeking = false;

  function initAudio() {
    if (audio) return audio;
    audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = state.isMuted ? 0 : state.volume;

    audio.src = PLAYLIST[state.currentIndex].file;
    if (state.currentTime > 0) {
      audio.currentTime = state.currentTime;
    }

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onTrackEnded);
    audio.addEventListener('play', () => {
      state.isPlaying = true;
      updateUI();
      saveState();
    });
    audio.addEventListener('pause', () => {
      state.isPlaying = false;
      updateUI();
      saveState();
    });
    audio.addEventListener('loadedmetadata', () => {
      updateTimeDisplay();
      if (state.currentTime > 0 && Math.abs(audio.currentTime - state.currentTime) > 1) {
        try { audio.currentTime = state.currentTime; } catch (e) {}
      }
    });
    audio.addEventListener('error', (e) => {
      console.warn('[MusicBox] Audio error:', e);
    });

    return audio;
  }

  function playTrack(index, startTime = 0) {
    if (!audio) initAudio();
    if (index < 0 || index >= PLAYLIST.length) index = 0;

    const isSameTrack = state.currentIndex === index && audio.src.includes(PLAYLIST[index].file);
    state.currentIndex = index;

    if (!isSameTrack) {
      audio.src = PLAYLIST[index].file;
      audio.currentTime = startTime;
    } else if (startTime > 0) {
      audio.currentTime = startTime;
    }

    const promise = audio.play();
    if (promise !== undefined) {
      promise.then(() => {
        state.isPlaying = true;
        hideResumeToast();
        updateUI();
        saveState();
      }).catch(err => {
        console.log('[MusicBox] Autoplay prevented by browser:', err);
        state.isPlaying = false;
        showResumeToast();
        updateUI();
      });
    }
  }

  function togglePlayPause() {
    if (!audio) initAudio();
    if (audio.paused) {
      const promise = audio.play();
      if (promise !== undefined) {
        promise.then(() => {
          state.isPlaying = true;
          hideResumeToast();
          updateUI();
          saveState();
        }).catch(() => {
          showResumeToast();
        });
      }
    } else {
      audio.pause();
      state.isPlaying = false;
      updateUI();
      saveState();
    }
  }

  function skipNext() {
    if (!audio) initAudio();
    if (state.isShuffle) {
      state.shufflePos = (state.shufflePos + 1) % state.shuffleOrder.length;
      if (state.shufflePos === 0 && state.repeatMode === 'off') {
        audio.pause();
        audio.currentTime = 0;
        state.isPlaying = false;
        updateUI();
        return;
      }
      playTrack(state.shuffleOrder[state.shufflePos]);
    } else {
      const nextIdx = state.currentIndex + 1;
      if (nextIdx >= PLAYLIST.length) {
        if (state.repeatMode === 'off') {
          audio.pause();
          audio.currentTime = 0;
          state.isPlaying = false;
          updateUI();
          return;
        }
        playTrack(0);
      } else {
        playTrack(nextIdx);
      }
    }
  }

  function skipPrevious() {
    if (!audio) initAudio();
    // If playing more than 3 seconds, replay current song first
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    if (state.isShuffle) {
      state.shufflePos = (state.shufflePos - 1 + state.shuffleOrder.length) % state.shuffleOrder.length;
      playTrack(state.shuffleOrder[state.shufflePos]);
    } else {
      const prevIdx = (state.currentIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
      playTrack(prevIdx);
    }
  }

  function toggleShuffle() {
    state.isShuffle = !state.isShuffle;
    if (state.isShuffle) {
      state.shuffleOrder = generateShuffleOrder(state.currentIndex);
      state.shufflePos = 0;
    }
    updateUI();
    saveState();
  }

  function toggleRepeat() {
    if (state.repeatMode === 'all') state.repeatMode = 'one';
    else if (state.repeatMode === 'one') state.repeatMode = 'off';
    else state.repeatMode = 'all';
    updateUI();
    saveState();
  }

  function onTrackEnded() {
    if (state.repeatMode === 'one') {
      audio.currentTime = 0;
      audio.play();
    } else {
      skipNext();
    }
  }

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function onTimeUpdate() {
    if (isSeeking) return;
    updateTimeDisplay();
    // throttle saving
    if (Math.floor(audio.currentTime) % 4 === 0) {
      saveState();
    }
  }

  function updateTimeDisplay() {
    const cur = audio ? audio.currentTime : state.currentTime;
    const dur = audio && audio.duration && !isNaN(audio.duration) ? audio.duration : 0;
    const pct = dur > 0 ? (cur / dur) * 100 : 0;

    const curText = formatTime(cur);
    const durText = formatTime(dur);

    const scrubber = document.getElementById('mbScrubber');
    const scrubberFill = document.getElementById('mbScrubberFill');
    const curTimeEl = document.getElementById('mbCurrentTime');
    const durTimeEl = document.getElementById('mbTotalTime');
    const miniTimeEl = document.getElementById('mbMiniTime');

    if (scrubber && !isSeeking) scrubber.value = pct;
    if (scrubberFill) scrubberFill.style.width = pct + '%';
    if (curTimeEl) curTimeEl.textContent = curText;
    if (durTimeEl) durTimeEl.textContent = durText;
    if (miniTimeEl) miniTimeEl.textContent = curText;
  }

  // ==========================================
  // 5. INJECT CSS & UI WIDGET
  // ==========================================
  function injectStyles() {
    if (document.getElementById('musicBoxStyles')) return;
    const style = document.createElement('style');
    style.id = 'musicBoxStyles';
    style.textContent = `
      /* Music Box Keyframe Animations */
      @keyframes mb-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      @keyframes mb-equalizer-1 { 0%, 100% { height: 4px; } 50% { height: 18px; } }
      @keyframes mb-equalizer-2 { 0%, 100% { height: 14px; } 50% { height: 6px; } }
      @keyframes mb-equalizer-3 { 0%, 100% { height: 8px; } 50% { height: 20px; } }
      @keyframes mb-equalizer-4 { 0%, 100% { height: 18px; } 50% { height: 10px; } }

      .mb-spinning {
        animation: mb-spin 7s linear infinite;
      }
      .mb-paused {
        animation-play-state: paused !important;
      }

      /* Animated equalizer bars */
      .mb-eq-bar {
        width: 3px;
        border-radius: 2px;
        background-color: #d99026;
        transition: height 0.15s ease;
      }
      .mb-eq-active .mb-eq-bar:nth-child(1) { animation: mb-equalizer-1 0.75s ease-in-out infinite; }
      .mb-eq-active .mb-eq-bar:nth-child(2) { animation: mb-equalizer-2 0.65s ease-in-out infinite; }
      .mb-eq-active .mb-eq-bar:nth-child(3) { animation: mb-equalizer-3 0.85s ease-in-out infinite; }
      .mb-eq-active .mb-eq-bar:nth-child(4) { animation: mb-equalizer-4 0.70s ease-in-out infinite; }

      /* Top SPA Loading Indicator */
      #spaProgressBar {
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        width: 0%;
        background: linear-gradient(90deg, #d99026, #3c7a62);
        z-index: 9999;
        transition: width 0.25s ease, opacity 0.25s ease;
        opacity: 0;
      }

      /* Vinyl Grooves Texture */
      .vinyl-record {
        background: radial-gradient(circle, #2b3b33 22%, #14211a 23%, #1b2e24 24%, #121c16 48%, #1f3328 50%, #111a14 70%, #1d3026 72%, #0e1711 100%);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), inset 0 0 0 2px rgba(255,255,255,0.05);
      }
      .vinyl-sheen {
        background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 45%, rgba(255,255,255,0.08) 55%, transparent 100%);
      }

      /* Scrubber range styling */
      input[type=range].mb-range {
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        cursor: pointer;
      }
      input[type=range].mb-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        height: 14px;
        width: 14px;
        border-radius: 50%;
        background: #d99026;
        border: 2px solid #ffffff;
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: transform 0.1s;
      }
      input[type=range].mb-range:hover::-webkit-slider-thumb {
        transform: scale(1.2);
      }
      input[type=range].mb-range::-moz-range-thumb {
        height: 14px;
        width: 14px;
        border-radius: 50%;
        background: #d99026;
        border: 2px solid #ffffff;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }

  function injectWidgetHTML() {
    if (document.getElementById('musicBoxRoot')) return;

    // SPA progress bar
    const progressEl = document.createElement('div');
    progressEl.id = 'spaProgressBar';
    document.body.appendChild(progressEl);

    // Main root container
    const root = document.createElement('div');
    root.id = 'musicBoxRoot';
    root.className = 'fixed bottom-6 right-6 z-50 select-none font-sans text-foreground';

    root.innerHTML = `
      <!-- ================= 1. RESUME TOAST (IF AUTOPLAY BLOCKED) ================= -->
      <div id="mbResumeToast" class="hidden mb-3 transform transition-all duration-300">
        <button id="mbResumeBtn" class="flex items-center gap-2.5 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-float hover:bg-primary-hover animate-bounce">
          <span class="size-2 rounded-full bg-gold animate-ping"></span>
          <span>Click to resume audio 🎵</span>
        </button>
      </div>

      <!-- ================= 2. COLLAPSED MINI DOCK ================= -->
      <div id="mbMiniDock" class="flex items-center gap-3 rounded-full border border-border bg-card/95 p-2 pr-4 shadow-float backdrop-blur-md transition-all duration-300 hover:border-gold/50">
        
        <!-- Vinyl disc avatar (click to expand) -->
        <button id="mbExpandBtn" type="button" aria-label="Expand Music Box" class="group relative flex size-11 items-center justify-center rounded-full overflow-hidden focus:outline-none">
          <div id="mbMiniVinyl" class="vinyl-record size-11 rounded-full p-2 flex items-center justify-center transition-transform group-hover:scale-105 mb-spinning mb-paused">
            <div class="vinyl-sheen absolute inset-0 rounded-full pointer-events-none"></div>
            <!-- Center golden label -->
            <div class="size-4 rounded-full bg-gold flex items-center justify-center text-[7px] font-bold text-ink shadow-inner">
              BA
            </div>
          </div>
          <!-- Playing glow ring -->
          <div id="mbMiniPulse" class="absolute -inset-0.5 rounded-full border border-gold/40 opacity-0 transition-opacity"></div>
        </button>

        <!-- Song info & waveform -->
        <div class="cursor-pointer max-w-[140px] sm:max-w-[170px]" id="mbInfoClickArea">
          <div class="flex items-center gap-1.5">
            <p id="mbMiniTitle" class="truncate font-display text-sm font-semibold text-primary leading-tight">
              ${PLAYLIST[state.currentIndex].title}
            </p>
          </div>
          <div class="flex items-center gap-2 mt-0.5">
            <!-- Animated equalizer bars -->
            <div id="mbMiniEq" class="flex items-end gap-0.5 h-3.5">
              <span class="mb-eq-bar h-1"></span>
              <span class="mb-eq-bar h-2"></span>
              <span class="mb-eq-bar h-3"></span>
              <span class="mb-eq-bar h-1"></span>
            </div>
            <span id="mbMiniTime" class="font-mono text-[11px] text-muted-foreground">00:00</span>
          </div>
        </div>

        <!-- Mini Controls -->
        <div class="flex items-center gap-1.5 pl-1 border-l border-border/70">
          <!-- Play / Pause -->
          <button id="mbMiniPlayBtn" type="button" aria-label="Play or pause" class="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 hover:bg-primary-hover shadow-sm">
            <svg id="mbMiniPlayIcon" class="size-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            <svg id="mbMiniPauseIcon" class="size-4 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          </button>

          <!-- Next -->
          <button id="mbMiniNextBtn" type="button" aria-label="Next song" class="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-primary transition-colors">
            <svg class="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
          </button>

          <!-- Expand Chevron -->
          <button id="mbMiniOpenChevron" type="button" aria-label="Open controls" class="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-primary transition-colors">
            <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
          </button>
        </div>

      </div>

      <!-- ================= 3. EXPANDED FULL EDITORIAL CARD ================= -->
      <div id="mbExpandedCard" class="hidden mb-2 w-[340px] sm:w-[370px] overflow-hidden rounded-3xl border border-border bg-card/95 shadow-float backdrop-blur-xl transition-all duration-300">
        
        <!-- Header bar -->
        <div class="flex items-center justify-between border-b border-border/80 px-5 py-3.5 bg-secondary/50">
          <div class="flex items-center gap-2">
            <span class="size-2 rounded-full bg-gold"></span>
            <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Music Box · Studio Audio</span>
          </div>
          
          <div class="flex items-center gap-1">
            <!-- Playlist drawer trigger -->
            <button id="mbPlaylistToggleBtn" type="button" aria-label="Toggle playlist" title="Playlist" class="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-primary transition-colors">
              <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/></svg>
            </button>
            <!-- Minimize card -->
            <button id="mbMinimizeBtn" type="button" aria-label="Minimize" class="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-primary transition-colors">
              <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
          </div>
        </div>

        <!-- Middle: Vinyl Showcase & Track Info -->
        <div class="p-6 text-center">
          
          <!-- Vinyl Disc Art -->
          <div class="relative mx-auto my-2 size-36 sm:size-40 flex items-center justify-center">
            <!-- Rotating Vinyl -->
            <div id="mbBigVinyl" class="vinyl-record relative size-full rounded-full p-4 flex items-center justify-center shadow-2xl mb-spinning mb-paused transition-transform">
              <div class="vinyl-sheen absolute inset-0 rounded-full pointer-events-none"></div>
              <!-- Vinyl Center Label -->
              <div class="size-16 rounded-full bg-[#faf8f3] border-4 border-gold/60 flex flex-col items-center justify-center shadow-md p-1">
                <span class="text-[8px] font-bold tracking-widest text-primary uppercase">BIMA</span>
                <span class="text-[6px] font-mono text-muted-foreground">33⅓ RPM</span>
                <div class="size-2 rounded-full bg-primary mt-0.5"></div>
              </div>
            </div>

            <!-- Stylized turntable arm needle -->
            <div class="pointer-events-none absolute -right-2 -top-2 w-12 h-14 origin-top-right transition-transform duration-500" id="mbTurntableArm">
              <svg class="w-full h-full text-gold drop-shadow" viewBox="0 0 50 60" fill="currentColor">
                <circle cx="45" cy="5" r="4" fill="#1f4738"/>
                <path d="M45 5 L20 40 L16 52" stroke="#d99026" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                <rect x="12" y="50" width="8" height="5" rx="1" fill="#1f4738"/>
              </svg>
            </div>
          </div>

          <!-- Track titles -->
          <div class="mt-4">
            <h4 id="mbFullTitle" class="font-display text-xl font-bold text-primary truncate">
              ${PLAYLIST[state.currentIndex].title}
            </h4>
            <p id="mbFullArtist" class="text-xs text-muted-foreground mt-1">
              ${PLAYLIST[state.currentIndex].artist} &nbsp;·&nbsp; <span class="text-gold font-medium">${PLAYLIST[state.currentIndex].tag}</span>
            </p>
          </div>

          <!-- Progress scrubber -->
          <div class="mt-5">
            <div class="relative flex items-center">
              <div class="absolute h-1.5 w-full rounded-full bg-secondary overflow-hidden pointer-events-none">
                <div id="mbScrubberFill" class="h-full bg-gold rounded-full w-0 transition-all"></div>
              </div>
              <input id="mbScrubber" type="range" min="0" max="100" value="0" step="0.1" class="mb-range relative z-10 w-full h-4" aria-label="Seek time" />
            </div>
            
            <div class="flex justify-between text-[11px] font-mono text-muted-foreground mt-1.5">
              <span id="mbCurrentTime">00:00</span>
              <span id="mbTotalTime">00:00</span>
            </div>
          </div>

          <!-- Main Player Controls -->
          <div class="mt-4 flex items-center justify-between px-2">
            
            <!-- Shuffle toggle -->
            <button id="mbShuffleBtn" type="button" aria-label="Shuffle" title="Shuffle" class="group relative grid size-10 place-items-center rounded-xl transition-colors hover:bg-secondary ${state.isShuffle ? 'text-gold' : 'text-muted-foreground'}">
              <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 4l4 4m0 0l-4 4m4-4H15a4 4 0 00-3.465 2M6 20l-4-4m0 0l4-4m-4 4h9a4 4 0 003.465-2M4 4h4a4 4 0 013.465 2M20 20h-4a4 4 0 01-3.465-2"/></svg>
              <span id="mbShuffleDot" class="absolute bottom-1.5 size-1 rounded-full bg-gold ${state.isShuffle ? 'block' : 'hidden'}"></span>
            </button>

            <!-- Previous -->
            <button id="mbPrevBtn" type="button" aria-label="Previous track" title="Previous" class="grid size-11 place-items-center rounded-2xl text-primary hover:bg-secondary hover:scale-105 transition-all">
              <svg class="size-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>

            <!-- Play / Pause (Large center) -->
            <button id="mbPlayBtn" type="button" aria-label="Play or pause" class="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-card hover:scale-105 hover:bg-primary-hover active:scale-95 transition-transform">
              <svg id="mbPlayIcon" class="size-7 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              <svg id="mbPauseIcon" class="size-7 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>

            <!-- Next -->
            <button id="mbNextBtn" type="button" aria-label="Next track" title="Next" class="grid size-11 place-items-center rounded-2xl text-primary hover:bg-secondary hover:scale-105 transition-all">
              <svg class="size-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>

            <!-- Loop / Repeat toggle -->
            <button id="mbRepeatBtn" type="button" aria-label="Repeat mode" title="Repeat" class="group relative grid size-10 place-items-center rounded-xl transition-colors hover:bg-secondary ${state.repeatMode !== 'off' ? 'text-gold' : 'text-muted-foreground'}">
              <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              <span id="mbRepeatBadge" class="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-gold text-[8px] font-bold text-white ${state.repeatMode === 'one' ? 'block' : 'hidden'}">1</span>
            </button>

          </div>

          <!-- Bottom: Volume Bar & Mode -->
          <div class="mt-5 pt-3 border-t border-border/70 flex items-center gap-3">
            <!-- Mute button -->
            <button id="mbMuteBtn" type="button" aria-label="Mute or unmute" class="text-muted-foreground hover:text-primary transition-colors">
              <svg id="mbVolumeHighIcon" class="size-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
              <svg id="mbVolumeMutedIcon" class="size-4.5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l4-4m0 4l-4-4"/></svg>
            </button>

            <!-- Volume Slider -->
            <input id="mbVolumeSlider" type="range" min="0" max="1" step="0.02" value="${state.volume}" class="mb-range w-full h-3" aria-label="Volume slider" />

            <!-- Nonstop Badge -->
            <span class="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-[9px] font-semibold text-leaf">
              <span class="size-1.5 rounded-full bg-leaf animate-pulse"></span>
              Nonstop
            </span>
          </div>

        </div>

        <!-- ================= 4. SLIDE-OUT PLAYLIST DRAWER ================= -->
        <div id="mbPlaylistDrawer" class="border-t border-border bg-secondary/40 px-5 py-4 ${state.playlistOpen ? 'block' : 'hidden'}">
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
            <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Soundtracks (${PLAYLIST.length})</span>
            <span class="text-[10px] text-muted-foreground">Click track to play</span>
          </div>

          <div class="space-y-1.5" id="mbTrackListItems">
            <!-- Dynamically filled in updatePlaylistUI() -->
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(root);
    bindWidgetEvents();
  }

  // ==========================================
  // 6. BIND WIDGET EVENTS
  // ==========================================
  function bindWidgetEvents() {
    // Resume button
    const resumeBtn = document.getElementById('mbResumeBtn');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => {
        if (!audio) initAudio();
        audio.play().then(() => {
          hideResumeToast();
          state.isPlaying = true;
          updateUI();
          saveState();
        }).catch(err => console.log(err));
      });
    }

    // Toggle expand/collapse
    const expandBtn = document.getElementById('mbExpandBtn');
    const infoClickArea = document.getElementById('mbInfoClickArea');
    const openChevron = document.getElementById('mbMiniOpenChevron');
    const minimizeBtn = document.getElementById('mbMinimizeBtn');

    const toggleExpand = () => {
      state.isExpanded = !state.isExpanded;
      updateExpandUI();
      saveState();
    };

    if (expandBtn) expandBtn.addEventListener('click', toggleExpand);
    if (infoClickArea) infoClickArea.addEventListener('click', toggleExpand);
    if (openChevron) openChevron.addEventListener('click', toggleExpand);
    if (minimizeBtn) minimizeBtn.addEventListener('click', toggleExpand);

    // Play / Pause buttons
    const miniPlayBtn = document.getElementById('mbMiniPlayBtn');
    const bigPlayBtn = document.getElementById('mbPlayBtn');
    if (miniPlayBtn) miniPlayBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePlayPause(); });
    if (bigPlayBtn) bigPlayBtn.addEventListener('click', togglePlayPause);

    // Skip Next buttons
    const miniNextBtn = document.getElementById('mbMiniNextBtn');
    const nextBtn = document.getElementById('mbNextBtn');
    if (miniNextBtn) miniNextBtn.addEventListener('click', (e) => { e.stopPropagation(); skipNext(); });
    if (nextBtn) nextBtn.addEventListener('click', skipNext);

    // Skip Prev button
    const prevBtn = document.getElementById('mbPrevBtn');
    if (prevBtn) prevBtn.addEventListener('click', skipPrevious);

    // Shuffle button
    const shuffleBtn = document.getElementById('mbShuffleBtn');
    if (shuffleBtn) shuffleBtn.addEventListener('click', toggleShuffle);

    // Repeat button
    const repeatBtn = document.getElementById('mbRepeatBtn');
    if (repeatBtn) repeatBtn.addEventListener('click', toggleRepeat);

    // Playlist drawer toggle
    const playlistToggleBtn = document.getElementById('mbPlaylistToggleBtn');
    if (playlistToggleBtn) {
      playlistToggleBtn.addEventListener('click', () => {
        state.playlistOpen = !state.playlistOpen;
        const drawer = document.getElementById('mbPlaylistDrawer');
        if (drawer) drawer.classList.toggle('hidden', !state.playlistOpen);
        updatePlaylistUI();
      });
    }

    // Progress Scrubber
    const scrubber = document.getElementById('mbScrubber');
    if (scrubber) {
      scrubber.addEventListener('input', () => {
        isSeeking = true;
        if (audio && audio.duration) {
          const seekTime = (scrubber.value / 100) * audio.duration;
          const curTimeEl = document.getElementById('mbCurrentTime');
          if (curTimeEl) curTimeEl.textContent = formatTime(seekTime);
          const fill = document.getElementById('mbScrubberFill');
          if (fill) fill.style.width = scrubber.value + '%';
        }
      });
      scrubber.addEventListener('change', () => {
        if (audio && audio.duration) {
          audio.currentTime = (scrubber.value / 100) * audio.duration;
          saveState();
        }
        isSeeking = false;
      });
    }

    // Volume Slider & Mute
    const volSlider = document.getElementById('mbVolumeSlider');
    const muteBtn = document.getElementById('mbMuteBtn');

    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.volume = val;
        state.isMuted = val === 0;
        if (audio) {
          audio.volume = val;
          audio.muted = state.isMuted;
        }
        updateVolumeUI();
        saveState();
      });
    }

    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        state.isMuted = !state.isMuted;
        if (audio) {
          audio.muted = state.isMuted;
          audio.volume = state.isMuted ? 0 : state.volume;
        }
        updateVolumeUI();
        saveState();
      });
    }

    // Global first click listener to resume if user clicked anywhere on page
    const resumeOnAnyInteraction = () => {
      if (state.isPlaying && audio && audio.paused) {
        audio.play().then(() => {
          hideResumeToast();
          updateUI();
        }).catch(() => {});
      }
      window.removeEventListener('click', resumeOnAnyInteraction);
      window.removeEventListener('keydown', resumeOnAnyInteraction);
      window.removeEventListener('touchstart', resumeOnAnyInteraction);
    };
    window.addEventListener('click', resumeOnAnyInteraction);
    window.addEventListener('keydown', resumeOnAnyInteraction);
    window.addEventListener('touchstart', resumeOnAnyInteraction);
  }

  function showResumeToast() {
    const toast = document.getElementById('mbResumeToast');
    if (toast) toast.classList.remove('hidden');
  }

  function hideResumeToast() {
    const toast = document.getElementById('mbResumeToast');
    if (toast) toast.classList.add('hidden');
  }

  function updateExpandUI() {
    const miniDock = document.getElementById('mbMiniDock');
    const card = document.getElementById('mbExpandedCard');

    if (state.isExpanded) {
      if (miniDock) miniDock.classList.add('hidden');
      if (card) card.classList.remove('hidden');
    } else {
      if (miniDock) miniDock.classList.remove('hidden');
      if (card) card.classList.add('hidden');
    }
  }

  function updateVolumeUI() {
    const volSlider = document.getElementById('mbVolumeSlider');
    const highIcon = document.getElementById('mbVolumeHighIcon');
    const muteIcon = document.getElementById('mbVolumeMutedIcon');

    if (volSlider) volSlider.value = state.isMuted ? 0 : state.volume;
    if (highIcon) highIcon.classList.toggle('hidden', state.isMuted || state.volume === 0);
    if (muteIcon) muteIcon.classList.toggle('hidden', !state.isMuted && state.volume > 0);
  }

  function updatePlaylistUI() {
    const list = document.getElementById('mbTrackListItems');
    if (!list) return;

    list.innerHTML = PLAYLIST.map((track, idx) => {
      const isActive = idx === state.currentIndex;
      return `
        <button type="button" data-index="${idx}" class="mb-track-item w-full flex items-center justify-between rounded-xl p-2 text-left transition-all ${isActive ? 'bg-primary text-primary-foreground font-semibold shadow-sm' : 'hover:bg-secondary text-foreground'}">
          <div class="flex items-center gap-2.5 truncate">
            <span class="grid size-6 place-items-center rounded-lg ${isActive ? 'bg-gold text-ink font-bold text-[10px]' : 'bg-secondary text-muted-foreground font-mono text-[10px]'}">
              ${isActive && state.isPlaying ? '▶' : (idx + 1)}
            </span>
            <div class="truncate">
              <p class="truncate text-xs leading-tight">${track.title}</p>
              <p class="text-[10px] ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}">${track.tag}</p>
            </div>
          </div>
          ${isActive ? '<span class="size-2 rounded-full bg-gold animate-pulse"></span>' : ''}
        </button>
      `;
    }).join('');

    // Bind click events on playlist rows
    list.querySelectorAll('.mb-track-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        playTrack(idx);
      });
    });
  }

  function updateUI() {
    const track = PLAYLIST[state.currentIndex];
    const isPlaying = state.isPlaying;

    // Track text
    const miniTitle = document.getElementById('mbMiniTitle');
    const fullTitle = document.getElementById('mbFullTitle');
    const fullArtist = document.getElementById('mbFullArtist');

    if (miniTitle) miniTitle.textContent = track.title;
    if (fullTitle) fullTitle.textContent = track.title;
    if (fullArtist) fullArtist.innerHTML = `${track.artist} &nbsp;·&nbsp; <span class="text-gold font-medium">${track.tag}</span>`;

    // Vinyl spinning & needle arm
    const miniVinyl = document.getElementById('mbMiniVinyl');
    const bigVinyl = document.getElementById('mbBigVinyl');
    const needleArm = document.getElementById('mbTurntableArm');
    const miniPulse = document.getElementById('mbMiniPulse');
    const miniEq = document.getElementById('mbMiniEq');

    if (miniVinyl) {
      miniVinyl.classList.toggle('mb-paused', !isPlaying);
    }
    if (bigVinyl) {
      bigVinyl.classList.toggle('mb-paused', !isPlaying);
    }
    if (needleArm) {
      needleArm.style.transform = isPlaying ? 'rotate(0deg)' : 'rotate(22deg)';
    }
    if (miniPulse) {
      miniPulse.style.opacity = isPlaying ? '1' : '0';
    }
    if (miniEq) {
      miniEq.classList.toggle('mb-eq-active', isPlaying);
    }

    // Play/Pause Icons
    const miniPlayIcon = document.getElementById('mbMiniPlayIcon');
    const miniPauseIcon = document.getElementById('mbMiniPauseIcon');
    const bigPlayIcon = document.getElementById('mbPlayIcon');
    const bigPauseIcon = document.getElementById('mbPauseIcon');

    if (miniPlayIcon) miniPlayIcon.classList.toggle('hidden', isPlaying);
    if (miniPauseIcon) miniPauseIcon.classList.toggle('hidden', !isPlaying);
    if (bigPlayIcon) bigPlayIcon.classList.toggle('hidden', isPlaying);
    if (bigPauseIcon) bigPauseIcon.classList.toggle('hidden', !isPlaying);

    // Shuffle status
    const shuffleBtn = document.getElementById('mbShuffleBtn');
    const shuffleDot = document.getElementById('mbShuffleDot');
    if (shuffleBtn) {
      shuffleBtn.classList.toggle('text-gold', state.isShuffle);
      shuffleBtn.classList.toggle('text-muted-foreground', !state.isShuffle);
    }
    if (shuffleDot) {
      shuffleDot.classList.toggle('hidden', !state.isShuffle);
    }

    // Repeat status
    const repeatBtn = document.getElementById('mbRepeatBtn');
    const repeatBadge = document.getElementById('mbRepeatBadge');
    if (repeatBtn) {
      repeatBtn.classList.toggle('text-gold', state.repeatMode !== 'off');
      repeatBtn.classList.toggle('text-muted-foreground', state.repeatMode === 'off');
    }
    if (repeatBadge) {
      repeatBadge.classList.toggle('hidden', state.repeatMode !== 'one');
    }

    updateExpandUI();
    updateVolumeUI();
    updatePlaylistUI();
    updateTimeDisplay();
  }

  // ==========================================
  // 7. SEAMLESS SPA NAVIGATION ENGINE
  // ==========================================
  /**
   * Seamlessly intercepts internal link clicks to load new pages
   * without destroying the DOM or stopping the audio playback!
   */
  function setupSeamlessNavigation() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Ignore external, anchor-only, mailto, tel, or javascript links
      if (
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        link.getAttribute('target') === '_blank'
      ) {
        return;
      }

      // Check if it's an internal HTML link
      const isHtmlLink = href.endsWith('.html') || href === './' || href === 'index.html';
      if (!isHtmlLink) return;

      // Extract filename
      const targetUrl = link.href;

      // Attempt SPA page swap
      e.preventDefault();
      loadPageSeamlessly(targetUrl, true);
    });

    // Handle browser Back / Forward buttons
    window.addEventListener('popstate', () => {
      loadPageSeamlessly(window.location.href, false);
    });
  }

  function setSpaProgress(pct, opacity = 1) {
    const bar = document.getElementById('spaProgressBar');
    if (bar) {
      bar.style.opacity = opacity;
      bar.style.width = pct + '%';
    }
  }

  async function loadPageSeamlessly(url, pushToHistory = true) {
    setSpaProgress(30, 1);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('HTTP ' + response.status);

      setSpaProgress(70, 1);
      const htmlText = await response.text();

      // Parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      // 1. Update Title
      if (doc.title) {
        document.title = doc.title;
      }

      // 2. Smoothly swap <main>
      const newMain = doc.querySelector('main');
      const currentMain = document.querySelector('main');

      if (newMain && currentMain) {
        // Fade out current main
        currentMain.style.transition = 'opacity 0.15s ease';
        currentMain.style.opacity = '0';

        await new Promise(r => setTimeout(r, 150));

        // Replace content and attributes
        currentMain.innerHTML = newMain.innerHTML;
        currentMain.className = newMain.className;
        currentMain.id = newMain.id || 'pageMain';

        // Fade in new main
        currentMain.style.opacity = '1';
      }

      // 3. Update active nav links
      updateActiveNavLinks(url);

      // 4. Update browser URL history
      if (pushToHistory) {
        window.history.pushState({ url }, '', url);
      }

      // 5. Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // 6. Close mobile drawer if open
      closeMobileDrawer();

      // 7. Re-initialize page-specific interactive scripts
      initCurrentPageFeatures();

      // Finish progress bar
      setSpaProgress(100, 1);
      setTimeout(() => setSpaProgress(100, 0), 200);

    } catch (err) {
      console.warn('[SPA Navigation] Fetch failed, falling back to standard navigation:', err);
      // Fallback for file:// CORS restrictions or offline:
      // Save current music state before full reload
      saveState();
      window.location.href = url;
    }
  }

  function updateActiveNavLinks(url) {
    const filename = url.split('/').pop().split('?')[0].split('#')[0] || 'index.html';
    const effectiveTarget = (filename === 'index.html' || filename === '') ? 'bio.html' : filename;

    // Desktop nav links
    const desktopLinks = document.querySelectorAll('header nav a');
    desktopLinks.forEach(a => {
      const href = a.getAttribute('href');
      const isTarget = href === filename || (href === 'bio.html' && effectiveTarget === 'bio.html') || (href === 'index.html' && effectiveTarget === 'bio.html');

      const indicator = a.querySelector('span');
      if (isTarget) {
        a.classList.remove('text-muted-foreground');
        a.classList.add('text-primary');
        if (indicator) {
          indicator.classList.remove('w-0', 'group-hover:w-full');
          indicator.classList.add('w-full');
        }
      } else {
        a.classList.remove('text-primary');
        a.classList.add('text-muted-foreground');
        if (indicator) {
          indicator.classList.remove('w-full');
          indicator.classList.add('w-0', 'group-hover:w-full');
        }
      }
    });

    // Mobile drawer links
    const mobileLinks = document.querySelectorAll('#mobileDrawer nav a');
    mobileLinks.forEach(a => {
      const href = a.getAttribute('href');
      const isTarget = href === filename || (href === 'bio.html' && effectiveTarget === 'bio.html') || (href === 'index.html' && effectiveTarget === 'bio.html');

      if (isTarget && !a.classList.contains('bg-primary')) {
        a.className = 'rounded-lg px-3 py-3 text-base font-medium bg-secondary text-primary';
      } else if (!isTarget && !a.classList.contains('bg-primary')) {
        a.className = 'rounded-lg px-3 py-3 text-base text-muted-foreground transition-colors hover:bg-secondary hover:text-primary';
      }
    });
  }

  function closeMobileDrawer() {
    const mobileDrawer = document.getElementById('mobileDrawer');
    const hamburgerIcon = document.getElementById('hamburgerIcon');
    const closeIcon = document.getElementById('closeIcon');
    if (mobileDrawer) {
      mobileDrawer.classList.add('max-h-0', 'opacity-0');
      mobileDrawer.classList.remove('max-h-96', 'opacity-100');
    }
    if (hamburgerIcon) hamburgerIcon.classList.remove('hidden');
    if (closeIcon) closeIcon.classList.add('hidden');
  }

  // ==========================================
  // 8. PAGE-SPECIFIC INITIALIZERS (AFTER SWAP)
  // ==========================================
  function initCurrentPageFeatures() {
    // 1. Mobile Menu re-binding
    const menuBtn = document.getElementById('menuBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const hamburgerIcon = document.getElementById('hamburgerIcon');
    const closeIcon = document.getElementById('closeIcon');
    if (menuBtn && mobileDrawer && !menuBtn._hasHandler) {
      menuBtn._hasHandler = true;
      let menuOpen = false;
      menuBtn.addEventListener('click', () => {
        menuOpen = !menuOpen;
        if (menuOpen) {
          mobileDrawer.classList.remove('max-h-0', 'opacity-0');
          mobileDrawer.classList.add('max-h-96', 'opacity-100');
          if (hamburgerIcon) hamburgerIcon.classList.add('hidden');
          if (closeIcon) closeIcon.classList.remove('hidden');
        } else {
          mobileDrawer.classList.add('max-h-0', 'opacity-0');
          mobileDrawer.classList.remove('max-h-96', 'opacity-100');
          if (hamburgerIcon) hamburgerIcon.classList.remove('hidden');
          if (closeIcon) closeIcon.classList.add('hidden');
        }
      });
    }

    // 2. Scroll Reveals
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(el => revealObserver.observe(el));

    // 3. Stat counters (Overview page: bio.html / index.html)
    const counters = document.querySelectorAll('.counter');
    if (counters.length > 0) {
      let counted = false;
      const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !counted) {
            counted = true;
            counters.forEach(c => {
              const target = +c.getAttribute('data-target');
              let current = 0;
              const inc = target / 50;
              const timer = setInterval(() => {
                current += inc;
                if (current >= target) {
                  c.textContent = target;
                  clearInterval(timer);
                } else {
                  c.textContent = Math.round(current);
                }
              }, 25);
            });
            countObserver.disconnect();
          }
        });
      }, { threshold: 0.2 });
      counters.forEach(c => countObserver.observe(c));
    }

    // 4. Achievements filters & accordions
    window.toggleAccordion = function (id) {
      const content = document.getElementById('content-' + id);
      const chevron = document.getElementById('chevron-' + id);
      if (!content) return;
      const isHidden = content.classList.contains('hidden');
      if (isHidden) {
        content.classList.remove('hidden');
        if (chevron) chevron.classList.add('rotate-180');
      } else {
        content.classList.add('hidden');
        if (chevron) chevron.classList.remove('rotate-180');
      }
    };

    window.setFilter = function (category) {
      const buttons = document.querySelectorAll('.filter-btn');
      buttons.forEach(btn => {
        btn.classList.remove('border-primary', 'bg-primary', 'text-primary-foreground');
        btn.classList.add('border-border', 'bg-card', 'text-muted-foreground');
      });

      const activeBtn = document.getElementById('btn-' + category);
      if (activeBtn) {
        activeBtn.classList.remove('border-border', 'bg-card', 'text-muted-foreground');
        activeBtn.classList.add('border-primary', 'bg-primary', 'text-primary-foreground');
      }

      const items = document.querySelectorAll('.timeline-item');
      items.forEach(item => {
        if (category === 'All' || item.getAttribute('data-category') === category) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    };

    // 5. Gallery Lightbox re-init
    const galleryItems = document.querySelectorAll('.gallery-card');
    if (galleryItems.length > 0) {
      let currentPhotoIdx = 0;
      const photos = [
        { src: 'images/photo-campus.jpg', title: 'Politeknik Negeri Semarang', desc: 'Main academic quad and administrative building.' },
        { src: 'images/photo-desk.jpg', title: 'Study & Reconciliation Desk', desc: 'Financial spreadsheet modeling and ledger review.' },
        { src: 'images/photo-competition.jpg', title: 'National Competition Day', desc: 'Representing Polines in computerized accounting.' },
        { src: 'images/photo-team.jpg', title: 'Team Collaborative Sprint', desc: 'Reconciling multi-period balance sheets.' },
        { src: 'images/photo-certificate.jpg', title: 'Awards & Credentials', desc: 'National accounting competition certificates.' },
        { src: 'images/photo-portrait.jpg', title: 'Bima Arya Dewa', desc: 'Semester 5 Computerized Accounting Student.' },
      ];

      window.openLightbox = function (index) {
        currentPhotoIdx = index;
        const modal = document.getElementById('lightboxModal');
        const img = document.getElementById('modalImage');
        const title = document.getElementById('modalTitle');
        const desc = document.getElementById('modalDesc');
        const counter = document.getElementById('modalCounter');

        if (!modal || !img) return;

        img.src = photos[index].src;
        if (title) title.textContent = photos[index].title;
        if (desc) desc.textContent = photos[index].desc;
        if (counter) counter.textContent = `${index + 1} / ${photos.length}`;

        modal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
      };

      window.closeLightbox = function () {
        const modal = document.getElementById('lightboxModal');
        if (modal) modal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      };

      window.changePhoto = function (dir) {
        currentPhotoIdx = (currentPhotoIdx + dir + photos.length) % photos.length;
        window.openLightbox(currentPhotoIdx);
      };
    }

    // 6. Contact page copy buttons and form
    window.copyText = function (text, btnId) {
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        const origHTML = btn.innerHTML;
        btn.innerHTML = `<svg class="size-4 text-leaf" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><span class="text-xs font-semibold text-leaf">Copied!</span>`;
        setTimeout(() => { btn.innerHTML = origHTML; }, 2000);
      }).catch(err => {
        console.warn('Clipboard write failed:', err);
      });
    };

    window.handleSubmit = function (e) {
      if (e && e.preventDefault) e.preventDefault();
      const form = document.getElementById('contactForm');
      const success = document.getElementById('successCard');
      if (form && success) {
        form.classList.add('hidden');
        success.classList.remove('hidden');
      }
      return false;
    };

    window.resetFormState = function () {
      const form = document.getElementById('contactForm');
      const success = document.getElementById('successCard');
      if (form && success) {
        form.reset();
        form.classList.remove('hidden');
        success.classList.add('hidden');
      }
    };
  }

  // ==========================================
  // 9. BOOTSTRAP ON LOAD
  // ==========================================
  function bootstrap() {
    injectStyles();
    injectWidgetHTML();
    initAudio();
    updateUI();
    setupSeamlessNavigation();
    initCurrentPageFeatures();

    // If state says it was playing, attempt to resume playback
    if (state.isPlaying) {
      const promise = audio.play();
      if (promise !== undefined) {
        promise.then(() => {
          hideResumeToast();
          updateUI();
        }).catch(() => {
          // Autoplay blocked by browser policy without gesture
          showResumeToast();
        });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

  // Save state on tab close or navigation
  window.addEventListener('beforeunload', saveState);

})();

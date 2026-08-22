const AUDIO_FILES = {
  sea: '/assets/audio/sea-loop.wav',
  wind: '/assets/audio/wind-loop.wav',
  bird1: '/assets/audio/bird-1.wav',
  bird2: '/assets/audio/bird-2.wav',
  bird3: '/assets/audio/bird-3.wav',
  footstep: '/assets/audio/footstep-earth.wav'
};

const SURFACE_PROFILES = {
  grass: { filterType: 'lowpass', filterFreq: 1800, gain: 0.85, rate: 0.95 },
  dirt: { filterType: null, filterFreq: 0, gain: 1.0, rate: 1.02 },
  stone: { filterType: 'highpass', filterFreq: 280, gain: 1.1, rate: 1.20 },
  wood: { filterType: 'peaking', filterFreq: 680, gain: 1.15, rate: 0.88 }
};

export async function createAudioSystem() {
  const encoded = Object.fromEntries(await Promise.all(Object.entries(AUDIO_FILES).map(async ([key, url]) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Audio ${url}: HTTP ${response.status}`);
    return [key, await response.arrayBuffer()];
  })));

  let context = null;
  let buffers = null;
  let master = null;
  let started = false;
  let unlocking = null;
  let footstepIndex = 0;
  let activeFootsteps = 0;
  let birdTimer = 7.0 + Math.random() * 6.0;
  let sparseBirdsCount = 0;
  let lastSurface = 'dirt';
  const loops = [];

  const startLoop = (buffer, level) => {
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain).connect(master);
    gain.gain.value = level;
    source.start();
    loops.push({ source, gain });
  };

  const playBirdCall = () => {
    if (!started || context.state !== 'running') return;
    const birdKeys = ['bird1', 'bird2', 'bird3'];
    const chosen = birdKeys[Math.floor(Math.random() * birdKeys.length)];
    const buffer = buffers[chosen];
    if (!buffer) return;

    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    source.playbackRate.value = 0.92 + Math.random() * 0.16;
    gain.gain.value = 0.065 + Math.random() * 0.045;

    source.connect(gain).connect(master);
    sparseBirdsCount += 1;
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
    };
    source.start();
  };

  const scheduleNextBird = () => {
    // 8-22 seconds normal, 25% chance of longer silence 22-38s
    if (Math.random() < 0.25) {
      birdTimer = 22.0 + Math.random() * 16.0;
    } else {
      birdTimer = 8.0 + Math.random() * 14.0;
    }
  };

  const unlock = async () => {
    if (started) {
      if (context?.state === 'suspended') await context.resume();
      return;
    }
    if (unlocking) return unlocking;
    unlocking = (async () => {
      context = new (window.AudioContext || window.webkitAudioContext)();
      buffers = Object.fromEntries(await Promise.all(Object.entries(encoded).map(async ([key, data]) => [key, await context.decodeAudioData(data.slice(0))])));
      master = context.createGain();
      master.gain.value = 0.58;
      master.connect(context.destination);

      // Clean atmospheric ambience: only non-tonal ocean surf and light wind
      startLoop(buffers.sea, 0.14);
      startLoop(buffers.wind, 0.05);

      await context.resume();
      started = true;
    })().catch((error) => {
      console.warn('[ISLAND audio]', error);
      unlocking = null;
    });
    return unlocking;
  };

  const gesture = () => unlock();
  window.addEventListener('pointerdown', gesture, { passive: true });
  window.addEventListener('keydown', gesture);

  return {
    unlock,
    update(dt) {
      if (!started || context.state !== 'running') return;
      // Update sparse bird ambiance
      birdTimer -= dt;
      if (birdTimer <= 0) {
        playBirdCall();
        scheduleNextBird();
      }
    },
    triggerFootstep({ surface = 'grass', running = false } = {}) {
      if (!started || context.state !== 'running') return;
      lastSurface = surface;

      const profile = SURFACE_PROFILES[surface] || SURFACE_PROFILES.grass;
      const baseGain = running ? 0.125 : 0.070;
      const pitchOffset = (footstepIndex++ % 2 ? 1 : -1) * 0.03 + (Math.random() * 0.04 - 0.02);
      const baseRate = running ? (1.05 + pitchOffset) : (0.97 + pitchOffset);

      const source = context.createBufferSource();
      const gain = context.createGain();
      source.buffer = buffers.footstep;
      source.playbackRate.value = Math.max(0.7, Math.min(1.4, baseRate * profile.rate));
      gain.gain.value = baseGain * profile.gain;

      if (profile.filterType) {
        const filter = context.createBiquadFilter();
        filter.type = profile.filterType;
        filter.frequency.value = profile.filterFreq;
        if (profile.filterType === 'peaking') filter.Q.value = 1.2;
        source.connect(filter);
        filter.connect(gain);
      } else {
        source.connect(gain);
      }

      gain.connect(master);
      activeFootsteps += 1;
      source.onended = () => {
        activeFootsteps -= 1;
        source.disconnect();
        gain.disconnect();
      };
      source.start();
    },
    async setSuspended(suspended) {
      if (!started) return;
      if (suspended && context.state === 'running') await context.suspend();
      else if (!suspended && context.state === 'suspended') await context.resume().catch(() => {});
    },
    getState() {
      return {
        ready: Boolean(buffers),
        started,
        state: context?.state || 'locked',
        loops: loops.length,
        activeFootsteps,
        sparseBirdsCount,
        currentSurface: lastSurface
      };
    }
  };
}

const AUDIO_FILES = {
  sea: '/assets/audio/sea-loop.wav',
  wind: '/assets/audio/wind-loop.wav',
  birds: '/assets/audio/birds-loop.wav',
  footstep: '/assets/audio/footstep-earth.wav'
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
  let stepClock = 0;
  let footstepIndex = 0;
  let activeFootsteps = 0;
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
      startLoop(buffers.sea, 0.16);
      startLoop(buffers.wind, 0.075);
      startLoop(buffers.birds, 0.11);
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
    update(dt, moving) {
      if (!started || context.state !== 'running') return;
      if (!moving) { stepClock = Math.min(stepClock, 0.18); return; }
      stepClock -= dt;
      if (stepClock > 0) return;
      stepClock = 0.4;
      const source = context.createBufferSource();
      const gain = context.createGain();
      source.buffer = buffers.footstep;
      source.playbackRate.value = footstepIndex++ % 2 ? 0.94 : 1.05;
      gain.gain.value = 0.105;
      source.connect(gain).connect(master);
      activeFootsteps += 1;
      source.onended = () => { activeFootsteps -= 1; source.disconnect(); gain.disconnect(); };
      source.start();
    },
    async setSuspended(suspended) {
      if (!started) return;
      if (suspended && context.state === 'running') await context.suspend();
      else if (!suspended && context.state === 'suspended') await context.resume().catch(() => {});
    },
    getState() {
      return { ready: Boolean(buffers), started, state: context?.state || 'locked', loops: loops.length, activeFootsteps };
    }
  };
}

export function createInput() {
  const keys = new Set();
  const vector = { x: 0, y: 0 };
  const joystick = document.querySelector('#joystick');
  const knob = joystick.querySelector('.joystick-knob');
  let pointerId = null;

  const updatePointer = (event) => {
    const rect = joystick.getBoundingClientRect();
    let x = event.clientX - (rect.left + rect.width / 2);
    let y = event.clientY - (rect.top + rect.height / 2);
    const limit = rect.width * 0.31;
    const length = Math.hypot(x, y);
    if (length > limit) { x *= limit / length; y *= limit / length; }
    vector.x = x / limit; vector.y = -y / limit;
    knob.style.transform = `translate(${x}px, ${y}px)`;
  };
  const release = (event) => {
    if (event.pointerId !== pointerId) return;
    pointerId = null; vector.x = 0; vector.y = 0; knob.style.transform = 'translate(0, 0)';
  };
  joystick.addEventListener('pointerdown', (event) => { pointerId = event.pointerId; joystick.setPointerCapture(pointerId); updatePointer(event); });
  joystick.addEventListener('pointermove', (event) => { if (event.pointerId === pointerId) updatePointer(event); });
  joystick.addEventListener('pointerup', release);
  joystick.addEventListener('pointercancel', release);
  window.addEventListener('keydown', (event) => keys.add(event.code));
  window.addEventListener('keyup', (event) => keys.delete(event.code));
  window.addEventListener('blur', () => keys.clear());

  return {
    read() {
      const x = vector.x + (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
      const y = vector.y + (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0);
      const length = Math.hypot(x, y);
      return length > 1 ? { x: x / length, y: y / length } : { x, y };
    },
    reset() { vector.x = 0; vector.y = 0; keys.clear(); knob.style.transform = 'translate(0, 0)'; }
  };
}

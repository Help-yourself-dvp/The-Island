#!/usr/bin/env python3
"""Generate clean, non-tonal, organic ambience and sparse bird one-shots."""
from pathlib import Path
import math
import random
import struct
import wave

RATE = 22050
OUT = Path(__file__).resolve().parents[1] / "public" / "assets" / "audio"
OUT.mkdir(parents=True, exist_ok=True)


def write_wav(name, samples):
    peak = max(1e-8, max(abs(v) for v in samples))
    gain = 0.90 / peak
    pcm = b"".join(struct.pack("<h", int(max(-1, min(1, value * gain)) * 32767)) for value in samples)
    with wave.open(str(OUT / name), "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(RATE)
        handle.writeframes(pcm)


def lowpass_filter(samples, cutoff_hz):
    rc = 1.0 / (2.0 * math.pi * cutoff_hz)
    dt = 1.0 / RATE
    alpha = dt / (rc + dt)
    out = []
    current = 0.0
    for s in samples:
        current += alpha * (s - current)
        out.append(current)
    return out


def highpass_filter(samples, cutoff_hz):
    rc = 1.0 / (2.0 * math.pi * cutoff_hz)
    dt = 1.0 / RATE
    alpha = rc / (rc + dt)
    out = []
    prev_in = 0.0
    current = 0.0
    for s in samples:
        current = alpha * (current + s - prev_in)
        prev_in = s
        out.append(current)
    return out


def make_white_noise(count, seed):
    rng = random.Random(seed)
    return [rng.uniform(-1.0, 1.0) for _ in range(count)]


def make_pink_noise(count, seed):
    rng = random.Random(seed)
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0
    out = []
    for _ in range(count):
        white = rng.uniform(-1.0, 1.0)
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.96900 * b2 + white * 0.1538520
        b3 = 0.86650 * b3 + white * 0.3104856
        b4 = 0.55000 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.0168980
        out.append(b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362)
        b6 = white * 0.115926
    return out


def sea():
    duration = 16.0
    count = int(duration * RATE)
    pink = make_pink_noise(count, 4102)
    # Filter to avoid sub-bass hum and harsh treble
    hp = highpass_filter(pink, 65.0)
    lp = lowpass_filter(hp, 1400.0)

    result = []
    for i in range(count):
        t = i / RATE
        # Multiple non-harmonic surge cycles that loop seamlessly over duration
        surge1 = 0.5 + 0.5 * math.sin(math.tau * t / duration * 3.0)
        surge2 = 0.5 + 0.5 * math.sin(math.tau * t / duration * 5.0 + 1.2)
        surge3 = 0.5 + 0.5 * math.sin(math.tau * t / duration * 2.0 - 0.7)
        envelope = 0.28 + 0.42 * (surge1 * 0.5 + surge2 * 0.3 + surge3 * 0.2)
        result.append(lp[i] * envelope)
    write_wav("sea-loop.wav", result)


def wind():
    duration = 16.0
    count = int(duration * RATE)
    pink = make_pink_noise(count, 771)
    # Wind highpass at 180 Hz completely eliminates low hum; lowpass at 2200 Hz for soft breeze
    hp = highpass_filter(pink, 180.0)
    lp = lowpass_filter(hp, 2200.0)

    result = []
    for i in range(count):
        t = i / RATE
        gust1 = 0.5 + 0.5 * math.sin(math.tau * t / duration * 2.0 + 0.4)
        gust2 = 0.5 + 0.5 * math.sin(math.tau * t / duration * 4.0 - 0.8)
        envelope = 0.35 + 0.45 * (gust1 * 0.65 + gust2 * 0.35)
        result.append(lp[i] * envelope)
    write_wav("wind-loop.wav", result)


def bird_chirp(filename, seed, pitch_base, sweeps):
    rng = random.Random(seed)
    # Total duration 0.5 - 0.8s
    total_duration = sweeps[-1][0] + sweeps[-1][1] + 0.05
    count = int(total_duration * RATE)
    result = [0.0] * count

    for start_t, dur, f_start, f_end, amp in sweeps:
        start_idx = int(start_t * RATE)
        dur_count = int(dur * RATE)
        for j in range(dur_count):
            t = j / RATE
            fraction = t / dur
            freq = f_start + (f_end - f_start) * fraction
            phase = math.tau * (f_start * t + 0.5 * (f_end - f_start) / dur * t * t)
            # Smooth bell envelope
            env = (math.sin(math.pi * fraction) ** 1.8) * amp
            # Soft overtone
            sample = math.sin(phase) + 0.18 * math.sin(phase * 2.01)
            idx = start_idx + j
            if idx < count:
                result[idx] += sample * env

    write_wav(filename, result)


def footstep():
    duration = 0.18
    count = int(duration * RATE)
    rng = random.Random(905)
    noise = [rng.uniform(-1.0, 1.0) for _ in range(count)]
    filtered_noise = lowpass_filter(noise, 2400.0)
    filtered_noise = highpass_filter(filtered_noise, 120.0)

    result = []
    for i in range(count):
        t = i / RATE
        envelope = math.exp(-t * 28.0) * min(1.0, t * 150.0)
        # Soft low impact pulse (no prolonged sine wave)
        thud = math.sin(math.tau * 75.0 * t) * math.exp(-t * 45.0)
        grit = filtered_noise[i] * 0.65
        result.append((thud * 0.55 + grit * 0.45) * envelope)
    write_wav("footstep-earth.wav", result)


if __name__ == "__main__":
    sea()
    wind()
    # Bird 1: sweet two-note descending-ascending chirp
    bird_chirp("bird-1.wav", 101, 2400, [
        (0.02, 0.14, 2300, 2900, 0.45),
        (0.20, 0.18, 2950, 2450, 0.50),
    ])
    # Bird 2: light high three-note warble
    bird_chirp("bird-2.wav", 202, 2800, [
        (0.02, 0.10, 2700, 3200, 0.38),
        (0.14, 0.10, 3100, 3400, 0.42),
        (0.26, 0.16, 3350, 2600, 0.46),
    ])
    # Bird 3: soft single forest chirp
    bird_chirp("bird-3.wav", 303, 2100, [
        (0.04, 0.22, 2100, 2650, 0.48),
    ])
    footstep()
    for file in sorted(OUT.glob("*.wav")):
        print(f"{file.name}: {file.stat().st_size} bytes")

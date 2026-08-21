#!/usr/bin/env python3
"""Generate deterministic, seamless Stage 0.5 ambience without third-party samples."""
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
    gain = 0.92 / peak
    pcm = b"".join(struct.pack("<h", int(max(-1, min(1, value * gain)) * 32767)) for value in samples)
    with wave.open(str(OUT / name), "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(RATE)
        handle.writeframes(pcm)


def periodic_noise(duration, seed, components, low_hz, high_hz):
    rng = random.Random(seed)
    count = int(duration * RATE)
    waves = []
    for index in range(components):
        target = low_hz + (high_hz - low_hz) * (index / max(1, components - 1)) ** 1.7
        cycles = max(1, round(target * duration))
        amplitude = rng.uniform(0.35, 1.0) / math.sqrt(index + 1)
        waves.append((cycles / duration, rng.random() * math.tau, amplitude))
    values = []
    for i in range(count):
        t = i / RATE
        values.append(sum(math.sin(math.tau * frequency * t + phase) * amplitude for frequency, phase, amplitude in waves))
    return values


def sea():
    duration = 12.0
    bed = periodic_noise(duration, 4102, 22, 28, 430)
    result = []
    for i, noise in enumerate(bed):
        t = i / RATE
        surge = 0.58 + 0.24 * math.sin(math.tau * t / duration * 3 - 0.8) + 0.12 * math.sin(math.tau * t / duration * 7)
        foam = math.sin(math.tau * 92 * t + 0.7 * math.sin(math.tau * 0.25 * t)) * 0.08
        result.append(noise * surge + foam)
    write_wav("sea-loop.wav", result)


def wind():
    duration = 12.0
    bed = periodic_noise(duration, 771, 30, 55, 1250)
    result = []
    for i, noise in enumerate(bed):
        t = i / RATE
        gust = 0.48 + 0.19 * math.sin(math.tau * t / duration * 2 + 1.2) + 0.11 * math.sin(math.tau * t / duration * 5 - 0.4)
        result.append(noise * gust)
    write_wav("wind-loop.wav", result)


def birds():
    duration = 20.0
    count = int(duration * RATE)
    result = [0.0] * count
    calls = [(2.4, 1850, 0.34), (6.8, 2320, 0.28), (11.6, 1680, 0.32), (16.3, 2100, 0.25)]
    for start, base, level in calls:
        for repeat in range(2):
            offset = start + repeat * 0.22
            length = 0.18
            begin = int(offset * RATE)
            for j in range(int(length * RATE)):
                t = j / RATE
                envelope = math.sin(math.pi * t / length) ** 2
                frequency = base + 950 * (t / length) + 140 * math.sin(math.tau * 9 * t)
                phase = math.tau * (base * t + 0.5 * 950 / length * t * t)
                result[begin + j] += math.sin(phase) * envelope * level
    write_wav("birds-loop.wav", result)


def footstep():
    duration = 0.22
    rng = random.Random(905)
    result = []
    filtered = 0.0
    for i in range(int(duration * RATE)):
        t = i / RATE
        filtered = filtered * 0.84 + rng.uniform(-1, 1) * 0.16
        envelope = math.exp(-t * 22) * min(1, t * 120)
        thud = math.sin(math.tau * 92 * t) * math.exp(-t * 30)
        grit = filtered * (0.7 + 0.3 * math.sin(math.tau * 37 * t))
        result.append((thud * 0.7 + grit * 0.48) * envelope)
    write_wav("footstep-earth.wav", result)


if __name__ == "__main__":
    sea()
    wind()
    birds()
    footstep()
    for file in sorted(OUT.glob("*.wav")):
        print(f"{file.name}: {file.stat().st_size} bytes")

#!/usr/bin/env python3
# Generador de loop de TRAP original (libre de derechos) — 808 + kick + snare + hats
import wave, struct, math, random

sr = 44100
bpm = 138
beat = 60.0 / bpm
step = beat / 4.0          # 16th note
bars = 4
steps = bars * 16
total = step * steps
N = int(total * sr)
buf = [0.0] * N
random.seed(7)

def add(sig, start_s):
    i0 = int(start_s * sr)
    for k, v in enumerate(sig):
        j = i0 + k
        if 0 <= j < N:
            buf[j] += v

def env(n, a, d):  # simple attack/exp-decay envelope over n samples
    out = []
    for k in range(n):
        t = k / sr
        e = min(1.0, t / a) if a > 0 else 1.0
        e *= math.exp(-t / d)
        out.append(e)
    return out

def note(semitone_from_A1):  # A1 = 55Hz reference
    return 55.0 * (2 ** (semitone_from_A1 / 12.0))

def sub808(freq, dur, gain=0.9):
    n = int(dur * sr)
    e = env(n, 0.004, dur * 0.42)
    out = []
    for k in range(n):
        t = k / sr
        # pitch glide down a couple semitones at the very start
        g = freq * (1.0 + 0.06 * math.exp(-t / 0.03))
        s = math.sin(2 * math.pi * g * t)
        s = math.tanh(s * 1.7) * 0.75      # slight saturation
        out.append(s * e[k] * gain)
    return out

def kick(dur=0.14, gain=1.0):
    n = int(dur * sr)
    out = []
    for k in range(n):
        t = k / sr
        f = 120 * math.exp(-t / 0.03) + 45
        s = math.sin(2 * math.pi * f * t)
        e = math.exp(-t / 0.11)
        out.append(s * e * gain)
    return out

def snare(dur=0.22, gain=0.7):
    n = int(dur * sr)
    out = []
    prev = 0.0
    for k in range(n):
        t = k / sr
        nz = random.uniform(-1, 1)
        hp = nz - prev; prev = nz          # crude high-pass -> brighter noise
        tone = math.sin(2 * math.pi * 190 * t) * 0.5
        e = math.exp(-t / 0.10)
        out.append((hp * 0.8 + tone) * e * gain)
    return out

def hat(dur=0.045, gain=0.33):
    n = int(dur * sr)
    out = []
    prev = 0.0
    for k in range(n):
        nz = random.uniform(-1, 1)
        hp = nz - prev; prev = nz
        e = math.exp(-(k / sr) / (dur * 0.4))
        out.append(hp * e * gain)
    return out

def bell(freq, dur, gain=0.16):
    n = int(dur * sr)
    out = []
    for k in range(n):
        t = k / sr
        s = math.sin(2*math.pi*freq*t) + 0.5*math.sin(2*math.pi*freq*2*t)
        e = math.exp(-t / (dur*0.5))
        out.append(s * e * gain)
    return out

# ---- 808 bassline (semitones from A1): F, F, Ab, Eb pattern (dark minor) ----
F, Ab, C, Eb = 8, 11, 15, 18          # relative to A1
bass_steps = {0:F, 6:F, 8:Ab, 11:C, 16:Eb, 22:Eb, 24:F, 30:Ab,
              32:F, 38:F, 40:Ab, 43:C, 48:Ab, 54:Ab, 56:C, 60:Eb}
for st, semi in bass_steps.items():
    dur = step * (random.choice([3,4,5]))
    add(sub808(note(semi - 12), dur), st * step)   # -12 => one octave lower (sub)

# ---- kicks ----
for st in [0,6,16,19,24,32,38,40,48,51,56]:
    add(kick(), st * step)

# ---- snares on the halftime backbeat (beat 3 of each bar) ----
for bar in range(bars):
    add(snare(), (bar*16 + 8) * step)

# ---- hats: 16ths with rolls ----
for st in range(steps):
    base = st * step
    # occasional 32nd/triplet rolls
    if st % 8 == 7:
        for r in range(3):
            add(hat(gain=0.22 + 0.04*r), base + r*(step/3))
    elif st % 16 == 14:
        for r in range(4):
            add(hat(gain=0.18), base + r*(step/4))
    else:
        g = 0.34 if st % 2 == 0 else 0.24
        add(hat(gain=g), base)

# ---- sparse bell melody for vibe ----
mel = {2:F+12, 10:Ab+12, 18:C+12, 34:F+12, 42:Eb+12, 50:C+12}
for st, semi in mel.items():
    add(bell(note(semi), step*3), st*step)

# ---- normalize + write 16-bit stereo WAV ----
peak = max(1e-6, max(abs(x) for x in buf))
norm = 0.89 / peak
w = wave.open('/Users/jhojanmonserrate/iCloud Drive (Archive)/Documents/Jhojan/blades kevin/website/tmpaudio/trap.wav', 'w')
w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
frames = bytearray()
for x in buf:
    v = int(max(-1.0, min(1.0, x * norm)) * 32767)
    frames += struct.pack('<hh', v, v)
w.writeframes(bytes(frames)); w.close()
print("wrote trap.wav  %.2fs" % total)

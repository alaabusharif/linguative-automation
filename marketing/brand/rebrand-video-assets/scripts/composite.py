"""
Linguative rebrand video — Segment B compositor (the constructed logo reveal).
Builds frames 306-420 (tau 0..4.75s) of the 24fps/1920x1080 sequence:
live Runway footage as background, with the approved logo constructed from
the real Fusion Construction Pack v2 layers (ribbon -> 9 letters -> sweep ->
tagline -> settle), landing at zero offset exactly on the approved final frame
by the last frame of the segment. No AI regeneration, no logo crossfade —
every visible pixel of the logo comes from the supplied construction-pack PNGs.
"""
import json, os, math
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

ROOT = os.path.dirname(os.path.abspath(__file__))
CP = os.path.join(ROOT, "construction-pack")
SRC = os.path.join(ROOT, "src_frames_hq")
OUT = os.path.join(ROOT, "out_frames")
os.makedirs(OUT, exist_ok=True)

with open(os.path.join(ROOT, "asset_bboxes.json")) as f:
    BB = json.load(f)

FPS = 24
SEG_B_START = 306   # 1-indexed frame numbers matching f%04d.png
SEG_B_END = 420
CANVAS = (1920, 1080)

# ---------- assets ----------
def load(name):
    return Image.open(os.path.join(CP, name)).convert("RGBA")

wordmark_exact = load("02_Wordmark_Exact_1920x1080.png")
tagline_exact = load("03_Tagline_Exact_1920x1080.png")
reflection_glow = load("04_Reflection_Glow_1920x1080.png")
final_frame = load("06_Final_Frame_Exact_1920x1080.png")
ribbon_matte = load("Mattes/Gold_Ribbon_Reveal_Matte_1920x1080.png")
wordmark_matte = load("Mattes/Wordmark_Matte_1920x1080.png")

letters = {}
for i in range(1, 10):
    letters[i] = load(f"Letter_Layers/Letter_{i:02d}_1920x1080.png")

RIBBON_BBOX = tuple(BB["ribbon_matte_bbox"])
WORDMARK_BBOX = tuple(BB["wordmark_bbox"])
TAGLINE_BBOX = tuple(BB["tagline_bbox"])
LETTER_BBOX = {int(k): tuple(v) for k, v in BB["letters"].items()}

# The live Runway particle cloud converges around here at the takeover point
# (measured from the source frames, not guessed) — far narrower than the
# full-width wordmark. Rather than shifting the assembled logo to meet it
# (rejected — breaks "keep the logo at its registered position"), letters
# reveal nearest-the-cloud-first with a small, per-letter converging drift
# that eases to exactly zero, so every letter still lands dead-on its real
# registered pixel position by the time it settles.
CLOUD_CENTER = (925.0, 460.0)

# ---------- easing ----------
def smoothstep(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)

def progress(tau, t0, t1):
    if t1 <= t0:
        return 1.0 if tau >= t0 else 0.0
    return smoothstep((tau - t0) / (t1 - t0))

# ---------- timing plan (seconds, local to segment B) ----------
RIBBON_T0, RIBBON_T1 = 0.0, 0.85
LETTER_T0 = 0.55
LETTER_STAGGER = 3 / FPS          # 0.125s
# Each letter is now a strict sequence, not a simultaneous flicker: dust
# particles travel onto the letter's real alpha-edge points and hold there
# brightly (the "outline" reading Ala asked for), THEN — only once the
# outline is fully formed — the solid metallic letter fades in slowly on
# top while the dust recedes, so the dust visibly resolves into the letter.
DUST_TRAVEL = 0.28   # particles converge from offscreen onto the edge
DUST_HOLD = 0.18      # outline holds at full brightness before the fill starts
LETTER_FADE = 0.55    # slow, smooth solid fade-in, starts only after DUST_HOLD
SWEEP_T0, SWEEP_T1 = 2.65, 3.25
# tagline: slower, more theatrical reveal — dust leads the wipe edge by
# DUST_LEAD seconds so it reads as condensing ahead of the fill, not with it
TAGLINE_T0, TAGLINE_T1 = 2.95, 4.2
DUST_LEAD = 0.15
# reflection: smoother and slower than the previous round — long, gentle
# fade that only finishes right at the cut into the static hold
REFLECTION_T0, REFLECTION_T1 = 3.35, 4.75
GRADE_T0, GRADE_T1 = 2.95, 4.75
SEG_B_DURATION = (SEG_B_END - SEG_B_START) / FPS  # 4.75s
CONVERGE_MAG = 40.0  # px — small, transient, eases to 0; never a group shift

def _letter_center(idx):
    x0, y0, x1, y1 = LETTER_BBOX[idx]
    return ((x0 + x1) / 2, (y0 + y1) / 2)

# reveal nearest-the-cloud-first so the construction reads as the cloud
# assembling into the wordmark, not as unrelated letters popping in on the
# far side of the frame from where the footage's own particles are
LETTER_ORDER = sorted(
    range(1, 10),
    key=lambda i: math.hypot(_letter_center(i)[0] - CLOUD_CENTER[0],
                              _letter_center(i)[1] - CLOUD_CENTER[1]),
)
LETTER_SLOT = {idx: slot for slot, idx in enumerate(LETTER_ORDER)}

def letter_phase_times(idx):
    """Four breakpoints per letter: dust starts traveling, dust has arrived
    and holds at full brightness, solid fade-in starts, solid fade-in ends."""
    t0 = LETTER_T0 + LETTER_SLOT[idx] * LETTER_STAGGER
    travel_end = t0 + DUST_TRAVEL
    hold_end = travel_end + DUST_HOLD
    fade_end = hold_end + LETTER_FADE
    return t0, travel_end, hold_end, fade_end

def letter_converge_vector(idx):
    lx, ly = _letter_center(idx)
    dx, dy = CLOUD_CENTER[0] - lx, CLOUD_CENTER[1] - ly
    dist = math.hypot(dx, dy) or 1.0
    return (dx / dist * CONVERGE_MAG, dy / dist * CONVERGE_MAG)

# ---------- background color grade ----------
live_corners = np.array(BB["live306_corners"] + BB["live420_corners"])
final_corners = np.array(BB["final_corners"])
live_avg = live_corners.mean(axis=0)
final_avg = final_corners.mean(axis=0)
GRADE_RATIO = np.clip(final_avg / np.clip(live_avg, 1, None), 0.05, 1.6)

def grade_background(frame_rgb, g):
    """g in [0,1]: blend live frame toward the approved artwork's tone + a
    mild top-to-bottom vignette, matching what the corner samples showed."""
    if g <= 0:
        return frame_rgb
    arr = np.asarray(frame_rgb).astype(np.float32)
    graded = arr * GRADE_RATIO.reshape(1, 1, 3)
    h = arr.shape[0]
    vign = np.linspace(1.0, 0.55, h, dtype=np.float32).reshape(h, 1, 1)
    graded = graded * (1.0 - g) + graded * vign * g  # vignette eases in with g too
    out = arr * (1 - g) + graded * g
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGB")

# ---------- letter compositing ----------
PAD = 40

def crop_tight(img, bbox):
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - PAD); y0 = max(0, y0 - PAD)
    x1 = min(CANVAS[0], x1 + PAD); y1 = min(CANVAS[1], y1 + PAD)
    return img.crop((x0, y0, x1, y1)), (x0, y0)

LETTER_CROPS = {i: crop_tight(letters[i], LETTER_BBOX[i]) for i in range(1, 10)}

# ---------- gold-dust condensation ----------
# Ala's note: the gold dust should visibly turn into the ribbon and trace the
# letter outlines, not just sit behind a separate fade-in. Rim points are
# sampled once from each asset's own alpha edge (a real edge, not guessed
# padding) and stamped with a soft gold sprite whose opacity rises, flickers,
# then dies away as the solid shape takes over — dust "resolving into" gold.
_rng = np.random.default_rng(20260925)

def _dot_sprite(radius=7, color=(255, 214, 150), power=2.0):
    d = radius * 2 + 1
    yy, xx = np.mgrid[0:d, 0:d]
    dist = np.hypot(xx - radius, yy - radius) / radius
    a = np.clip(1 - dist, 0, 1) ** power
    arr = np.zeros((d, d, 4), dtype=np.uint8)
    arr[:, :, 0] = color[0]
    arr[:, :, 1] = color[1]
    arr[:, :, 2] = color[2]
    arr[:, :, 3] = (a * 255).astype(np.uint8)
    return Image.fromarray(arr, "RGBA")

# Denser, brighter than the previous round (Ala: "the dust still doesn't
# outline the letters") — a fuller core (lower power) reads as a distinct
# bright particle, not a faint speck, while staying a discrete dot, never a
# continuous glow stroke.
_DOT = _dot_sprite(9, (255, 223, 165), power=1.3)
_DOT_SMALL = _dot_sprite(5, (255, 240, 205), power=1.3)

def _travel_offsets(n, seed):
    """Random outward start offsets so particles visibly travel onto their
    target edge point rather than flickering in place."""
    if n == 0:
        return np.empty((0, 2), dtype=np.float32)
    rng = np.random.default_rng(seed)
    angles = rng.uniform(0, 2 * math.pi, size=n)
    radii = rng.uniform(70, 150, size=n)
    return np.stack([np.cos(angles) * radii, np.sin(angles) * radii], axis=1).astype(np.float32)

def _edge_points(alpha_img, n_points, seed):
    """Sample points along the true alpha edge of a crop (dilate-minus-erode
    of the actual mask), not an assumed shape — works for any asset."""
    bw = alpha_img.point(lambda a: 255 if a > 100 else 0)
    dil = bw.filter(ImageFilter.MaxFilter(9))
    ero = bw.filter(ImageFilter.MinFilter(9))
    edge = np.array(dil).astype(np.int16) - np.array(ero).astype(np.int16)
    ys, xs = np.where(edge > 0)
    if len(xs) == 0:
        return np.empty((0, 2)), np.empty((0,))
    rng = np.random.default_rng(seed)
    idx = rng.choice(len(xs), size=min(n_points, len(xs)), replace=False)
    pts = np.stack([xs[idx], ys[idx]], axis=1).astype(np.float32)
    phases = rng.uniform(0, 2 * math.pi, size=len(pts))
    return pts, phases

def _dust_envelope(p, rise=0.30, peak=0.50, fall=0.85):
    """0 -> flicker on -> resolves into the solid shape by `fall`."""
    if p <= 0:
        return 0.0
    if p < rise:
        return smoothstep(p / rise)
    if p < peak:
        return 1.0
    if p < fall:
        return 1.0 - smoothstep((p - peak) / (fall - peak))
    return 0.0

def ImageEnhance_alpha(sprite, factor):
    a = sprite.getchannel("A").point(lambda v: int(v * factor))
    out = sprite.copy()
    out.putalpha(a)
    return out

def _letter_dust_alpha(tau, t0, travel_end, hold_end, fade_end):
    """0 before t0 -> ramps up while traveling -> holds at 1 (full bright
    outline) -> fades to 0 as the solid fill takes over. Strictly sequenced
    before the solid fade starts, never simultaneous with it."""
    if tau <= t0:
        return 0.0
    if tau < travel_end:
        return smoothstep((tau - t0) / (travel_end - t0))
    if tau < hold_end:
        return 1.0
    if tau < fade_end:
        return 1.0 - smoothstep((tau - hold_end) / (fade_end - hold_end))
    return 0.0

def _stamp_dust_travel(pts, phases, offsets, size, tau, t0, travel_end, env):
    """Particles start at a random outward offset and travel onto their real
    edge point as the travel phase advances — visible motion converging onto
    the outline, not an in-place flicker."""
    if env <= 0 or len(pts) == 0:
        return None
    travel_p = progress(tau, t0, travel_end)
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    sw = _DOT.size[0]
    for (x, y), ph, (ox_, oy_) in zip(pts, phases, offsets):
        px_ = x + (1 - travel_p) * ox_
        py_ = y + (1 - travel_p) * oy_
        # bright, dense flicker floor (0.55-1.0) so the outline reads clearly
        # as gathered particles, not a faint sparkle
        flicker = 0.55 + 0.45 * math.sin(tau * 8.0 + ph)
        a = env * max(0.0, flicker)
        if a <= 0.03:
            continue
        dot = _DOT if a >= 1 else ImageEnhance_alpha(_DOT, a)
        layer.alpha_composite(dot, (round(px_ - sw / 2), round(py_ - sw / 2)))
    return layer

LETTER_RIM = {}
for _i in range(1, 10):
    _pts, _phases = _edge_points(LETTER_CROPS[_i][0].getchannel("A"), 130, seed=1000 + _i)
    _offsets = _travel_offsets(len(_pts), seed=2000 + _i)
    LETTER_RIM[_i] = (_pts, _phases, _offsets)

def draw_letter(canvas, idx, tau):
    t0, travel_end, hold_end, fade_end = letter_phase_times(idx)
    if tau <= t0:
        return
    p_pos = progress(tau, t0, fade_end)  # drives scale + converge drift over the full letter lifetime
    crop, (ox, oy) = LETTER_CROPS[idx]
    cw, ch = crop.size
    scale = 0.94 + 0.06 * p_pos
    dx, dy = letter_converge_vector(idx)
    dx, dy = dx * (1 - p_pos), dy * (1 - p_pos)  # eases to exactly (0,0) — true registered spot

    # dust travels onto the letter's real alpha-edge points and holds there
    # brightly, in the SAME crop-local space as the letter so it scales and
    # drifts with it for free through the existing resize below
    pts, phases, offsets = LETTER_RIM[idx]
    dust_env = _letter_dust_alpha(tau, t0, travel_end, hold_end, fade_end)
    dust = _stamp_dust_travel(pts, phases, offsets, (cw, ch), tau, t0, travel_end, dust_env)
    base = crop
    if dust is not None:
        base = crop.copy()
        base.alpha_composite(dust)

    # solid fade only starts once the dust outline has fully held — dust
    # shapes the letter first, then the metallic fill fades in slowly
    solid_p = progress(tau, hold_end, fade_end)

    new_w, new_h = max(1, round(cw * scale)), max(1, round(ch * scale))
    resized_solid = crop.resize((new_w, new_h), Image.LANCZOS)
    resized = base.resize((new_w, new_h), Image.LANCZOS)
    if solid_p < 1.0:
        crop_a = np.array(resized_solid.getchannel("A")).astype(np.float32)
        dust_a = np.array(resized.getchannel("A")).astype(np.float32)
        dust_only = np.clip(dust_a - crop_a, 0, 255)
        final_a = np.clip(crop_a * solid_p + dust_only, 0, 255).astype(np.uint8)
        resized.putalpha(Image.fromarray(final_a, "L"))
    # keep the crop visually centered on its own bbox center while scaling
    cx, cy = ox + cw / 2, oy + ch / 2
    px = round(cx - new_w / 2 + dx)
    py = round(cy - new_h / 2 + dy)
    canvas.alpha_composite(resized, (px, py))

RIBBON_DUST_PTS, RIBBON_DUST_PHASES = _edge_points(
    ribbon_matte.crop(RIBBON_BBOX).convert("L").point(lambda v: 255 if v > 100 else 0),
    110, seed=42,
)

def draw_ribbon(canvas, tau):
    p = progress(tau, RIBBON_T0, RIBBON_T1)
    if p <= 0:
        return
    x0, y0, x1, y1 = RIBBON_BBOX
    wm_crop = wordmark_exact.crop((x0, y0, x1, y1))
    matte_crop = ribbon_matte.crop((x0, y0, x1, y1)).convert("L")
    matte_arr = np.array(matte_crop)
    w = x1 - x0
    threshold_x = int(w * p)
    xwipe = np.zeros_like(matte_arr)
    # soft leading edge over ~14px so the wipe isn't a hard knife-edge
    edge = 14
    xs = np.arange(w)
    ramp = np.clip((threshold_x - xs) / edge + 1, 0, 1) * 255
    xwipe[:, :] = ramp[np.newaxis, :]
    mask = np.minimum(matte_arr.astype(np.int32), xwipe.astype(np.int32)).astype(np.uint8)
    out = wm_crop.copy()
    orig_a = np.array(out.getchannel("A")).astype(np.int32)
    combined = np.minimum(orig_a, mask).astype(np.uint8)
    out.putalpha(Image.fromarray(combined, "L"))

    # gold dust condensing into the ribbon: a traveling sparkle band that
    # rides just ahead of the wipe edge and resolves into the solid gold
    # once the edge has passed a given point — the dust literally becomes
    # the ribbon, rather than the ribbon appearing independently of it
    band = 90
    if len(RIBBON_DUST_PTS):
        dxs = RIBBON_DUST_PTS[:, 0]
        lead = np.clip((dxs - (threshold_x - band)) / band, 0, 1)
        behind = np.clip(1 - (threshold_x - dxs) / band, 0, 1)
        env_per_pt = np.where(dxs <= threshold_x, behind, np.clip(1 - lead, 0, 1))
        env_per_pt = np.clip(env_per_pt, 0, 1) * (1 if p < 1.0 else 0.0)
        layer = Image.new("RGBA", (w, y1 - y0), (0, 0, 0, 0))
        sw = _DOT_SMALL.size[0]
        for (px_, py_), ph, e in zip(RIBBON_DUST_PTS, RIBBON_DUST_PHASES, env_per_pt):
            if e <= 0.03:
                continue
            flicker = 0.6 + 0.4 * math.sin(tau * 9 + ph)
            a = e * max(0.0, flicker)
            if a <= 0.03:
                continue
            dot = _DOT_SMALL if a >= 1 else ImageEnhance_alpha(_DOT_SMALL, a)
            layer.alpha_composite(dot, (round(px_ - sw / 2), round(py_ - sw / 2)))
        out.alpha_composite(layer)

    canvas.alpha_composite(out, (x0, y0))

def draw_sweep(canvas, tau):
    p = progress(tau, SWEEP_T0, SWEEP_T1)
    if p <= 0 or p >= 1:
        return
    x0, y0, x1, y1 = WORDMARK_BBOX
    w, h = x1 - x0, y1 - y0
    band_w = 140
    center_x = x0 - band_w + p * (w + 2 * band_w)
    xs = np.arange(x0, x1)
    dist = np.abs(xs - center_x)
    stripe = np.clip(1 - dist / (band_w / 2), 0, 1) ** 1.5
    stripe_row = (stripe * 255).astype(np.uint8)
    stripe_img = np.tile(stripe_row[np.newaxis, :, np.newaxis], (h, 1, 3)).astype(np.float32)
    # gold-white sweep tint
    tint = np.array([255, 244, 214], dtype=np.float32) / 255.0
    stripe_img = stripe_img * tint.reshape(1, 1, 3)

    canvas_arr = np.array(canvas.crop((x0, y0, x1, y1)))
    logo_alpha = canvas_arr[:, :, 3].astype(np.float32) / 255.0
    fade = min(1.0, p * 4) * min(1.0, (1 - p) * 4) if p < 0.25 or p > 0.75 else 1.0
    add = stripe_img * logo_alpha[:, :, np.newaxis] * fade
    rgb = canvas_arr[:, :, :3].astype(np.float32) + add
    canvas_arr[:, :, :3] = np.clip(rgb, 0, 255).astype(np.uint8)
    canvas.paste(Image.fromarray(canvas_arr, "RGBA"), (x0, y0))

TAGLINE_CROP = tagline_exact.crop(TAGLINE_BBOX)
TAGLINE_RIM_PTS, TAGLINE_RIM_PHASES = _edge_points(TAGLINE_CROP.getchannel("A"), 140, seed=77)

def draw_tagline(canvas, tau):
    p = progress(tau, TAGLINE_T0, TAGLINE_T1)
    if p <= 0:
        return
    x0, y0, x1, y1 = TAGLINE_BBOX
    crop = TAGLINE_CROP
    w, h = crop.size
    cx = w / 2
    half = np.arange(w) - cx
    edge = 50  # wide, soft gradient — a slower, more dramatic reveal
    reveal = np.clip((p * (cx + edge) - np.abs(half)) / edge, 0, 1) * 255
    orig_a = np.array(crop.getchannel("A")).astype(np.int32)
    mask = np.minimum(orig_a, np.tile(reveal.astype(np.int32), (h, 1))).astype(np.uint8)
    out = crop.copy()
    out.putalpha(Image.fromarray(mask, "L"))

    # dust condensing along the tagline's own outline, LEADING the wipe by
    # DUST_LEAD seconds so it clearly forms ahead of the fill rather than
    # simultaneously with it — light visibly "catching" each word before it
    # resolves, same sequenced language as the letters
    if len(TAGLINE_RIM_PTS):
        dust_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        dxs = TAGLINE_RIM_PTS[:, 0]
        point_frac = np.clip(np.abs(dxs - cx) / (cx + edge), 0, 1)
        reveal_tau = np.maximum(TAGLINE_T0, TAGLINE_T0 + point_frac * (TAGLINE_T1 - TAGLINE_T0) - DUST_LEAD)
        fade_win = 0.4
        sw = _DOT_SMALL.size[0]
        for (px_, py_), ph, rt in zip(TAGLINE_RIM_PTS, TAGLINE_RIM_PHASES, reveal_tau):
            local_p = progress(tau, rt, rt + fade_win)
            e = _dust_envelope(local_p, rise=0.3, peak=0.5, fall=0.9)
            if e <= 0.03:
                continue
            flicker = 0.6 + 0.4 * math.sin(tau * 8 + ph)
            a = e * max(0.0, flicker)
            if a <= 0.03:
                continue
            dot = _DOT_SMALL if a >= 1 else ImageEnhance_alpha(_DOT_SMALL, a)
            dust_layer.alpha_composite(dot, (round(px_ - sw / 2), round(py_ - sw / 2)))
        out.alpha_composite(dust_layer)

    # bright glint riding the two advancing wipe edges, dying away as the
    # reveal completes — the "dramatic" catch-the-light moment Ala asked for
    if p < 1.0:
        edge_glow_w = 46
        arr = np.array(out)
        rgb = arr[:, :, :3].astype(np.float32)
        a_ch = arr[:, :, 3].astype(np.float32) / 255.0
        right_edge = cx + p * (cx + edge)
        left_edge = cx - p * (cx + edge)
        xs = np.arange(w)
        band = (np.clip(1 - np.abs(xs - right_edge) / edge_glow_w, 0, 1)
                + np.clip(1 - np.abs(xs - left_edge) / edge_glow_w, 0, 1))
        band = np.clip(band, 0, 1) * (1 - p) * 220
        tint = np.array([255, 244, 214], dtype=np.float32) / 255.0
        add = band[np.newaxis, :, None] * tint * a_ch[:, :, None]
        rgb = np.clip(rgb + add, 0, 255)
        arr[:, :, :3] = rgb.astype(np.uint8)
        out = Image.fromarray(arr, "RGBA")

    canvas.alpha_composite(out, (x0, y0))

def draw_reflection(canvas, tau):
    # a second smoothstep pass on top of the already-eased progress() gives a
    # noticeably gentler ease-in/ease-out than a single smoothstep — slower
    # to start, slower to settle, per Ala's "smoother and a bit slower"
    p = smoothstep(progress(tau, REFLECTION_T0, REFLECTION_T1))
    if p <= 0:
        return
    layer = reflection_glow
    if p < 1.0:
        a = layer.getchannel("A").point(lambda v: int(v * p))
        layer = layer.copy()
        layer.putalpha(a)
    canvas.alpha_composite(layer)

def build_logo_layer(tau):
    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    draw_ribbon(canvas, tau)
    for i in range(1, 10):
        draw_letter(canvas, i, tau)
    draw_sweep(canvas, tau)
    draw_tagline(canvas, tau)
    draw_reflection(canvas, tau)
    return canvas

def shift_canvas(canvas, dy):
    if dy == 0:
        return canvas
    shifted = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    shifted.paste(canvas, (0, round(dy)))
    return shifted

# The raw Runway plate keeps constructing ITS OWN (wrong-font, wrong-tagline)
# logo underneath our reveal for the whole length of segment B — confirmed by
# inspecting the untouched frames, not assumed. It must never show through
# gaps in our construction, so this region is scrubbed to a soft blurred glow
# (not a flat cut) before our real letters/ribbon/tagline draw on top of it.
FEATHER = 100
MARGIN = 260  # must clear >= ~2x FEATHER so the mask is fully opaque (255)
              # over the whole risk area, not just at the rectangle's center
CLEAN_BBOX = (
    max(0, min(WORDMARK_BBOX[0], TAGLINE_BBOX[0]) - MARGIN),
    0,     # Runway's own in-progress particle formation rises well above the
           # resting wordmark's bbox (confirmed by inspecting raw frame 306)
    min(CANVAS[0], max(WORDMARK_BBOX[2], TAGLINE_BBOX[2]) + MARGIN),
    min(CANVAS[1], 900 + MARGIN),  # past the reflection band under Runway's tagline
)
CLEAN_BLUR_RADIUS = 55

def _feather_mask(size, bbox, feather):
    x0, y0, x1, y1 = bbox
    m = Image.new("L", size, 0)
    d = ImageDraw.Draw(m)
    d.rectangle([x0, y0, x1, y1], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(feather))
    return m

_CLEAN_MASK = _feather_mask(CANVAS, CLEAN_BBOX, FEATHER)

def scrub_runway_logo(bg_rgb):
    x0, y0, x1, y1 = CLEAN_BBOX
    region = bg_rgb.crop((x0, y0, x1, y1)).filter(ImageFilter.GaussianBlur(CLEAN_BLUR_RADIUS))
    blurred_full = bg_rgb.copy()
    blurred_full.paste(region, (x0, y0))
    return Image.composite(blurred_full, bg_rgb, _CLEAN_MASK)

def render_frame(frame_num):
    tau = (frame_num - SEG_B_START) / FPS
    bg = Image.open(os.path.join(SRC, f"f{frame_num:04d}.png")).convert("RGB")
    bg = scrub_runway_logo(bg)
    g = progress(tau, GRADE_T0, GRADE_T1)
    bg = grade_background(bg, g)
    bg = bg.convert("RGBA")

    logo = build_logo_layer(tau)
    bg.alpha_composite(logo)
    return bg.convert("RGB")

# Ala: "smoother transitions" — the scrub used to snap on at a single frame
# (SEG_B_START), which read as a texture pop right at the cut. This eases the
# SAME scrub in over ~1s beforehand instead, while tau stays negative so no
# construction element (ribbon/letters/etc, all separately tuned and
# approved) draws early — only the background texture handoff is softened.
# By inspection the raw footage's own old-tagline dust has already mostly
# dissolved by CROSSFADE_START, so nothing legible is touched, just grain.
CROSSFADE_START = 282

def render_leadin_frame(frame_num):
    raw = Image.open(os.path.join(SRC, f"f{frame_num:04d}.png")).convert("RGB")
    if frame_num < CROSSFADE_START:
        return raw
    scrubbed = render_frame(frame_num)  # tau < 0 here: scrub only, no logo yet
    alpha = smoothstep((frame_num - CROSSFADE_START) / (SEG_B_START - CROSSFADE_START))
    raw_arr = np.asarray(raw).astype(np.float32)
    scrub_arr = np.asarray(scrubbed).astype(np.float32)
    out = raw_arr * (1 - alpha) + scrub_arr * alpha
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGB")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        taus = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 4.75]
        for t in taus:
            fn = SEG_B_START + round(t * FPS)
            fn = min(fn, SEG_B_END)
            img = render_frame(fn)
            img.save(os.path.join(OUT, f"test_tau{t:.2f}_f{fn:04d}.jpg"), quality=92)
            print("wrote", fn, "tau", t)
    else:
        for fn in range(SEG_B_START, SEG_B_END + 1):
            img = render_frame(fn)
            img.save(os.path.join(OUT, f"f{fn:04d}.png"))
        print("done", SEG_B_START, SEG_B_END)

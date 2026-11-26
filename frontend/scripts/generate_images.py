#!/usr/bin/env python3
"""Generates ILLUSTRATIVE placeholder artwork (SVG) into public/images.
These are NOT photographs and NOT company fleet photos. Replace with real
photography (prefer WebP/AVIF) before production - see README.md."""
import math, random, os

W, H = 1600, 900
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "images")
os.makedirs(OUT, exist_ok=True)
LABEL = "Illustrative placeholder - not a company fleet photo"


def ridge(seed, base, amp, n=16):
    r = random.Random(seed)
    pts = []
    for i in range(n + 1):
        x = W * i / n
        y = base - amp * (0.35 + 0.65 * r.random()) * (0.6 + 0.4 * math.sin(i * 0.9 + seed))
        pts.append((x, y))
    return pts


def fill_poly(pts, fill, opacity=1.0):
    d = "M" + " L".join(f"{x:.0f},{y:.0f}" for x, y in pts) + f" L{W},{H} L0,{H} Z"
    return f'<path d="{d}" fill="{fill}" opacity="{opacity}"/>'


def peaks(seed, base, count, hmin, hmax, fill, snow=None):
    r = random.Random(seed)
    out = []
    for i in range(count):
        cx = W * (i + 0.5) / count + r.uniform(-60, 60)
        w = r.uniform(380, 640)
        h = r.uniform(hmin, hmax)
        l, rr, ap = cx - w / 2, cx + w / 2, (cx + r.uniform(-40, 40), base - h)
        sh1 = (cx - w * 0.14, base - h * 0.62)
        sh2 = (cx + w * 0.17, base - h * 0.55)
        out.append(f'<path d="M{l:.0f},{base} L{sh1[0]:.0f},{sh1[1]:.0f} L{ap[0]:.0f},{ap[1]:.0f} L{sh2[0]:.0f},{sh2[1]:.0f} L{rr:.0f},{base} Z" fill="{fill}"/>')
        if snow:
            t = 0.74
            a1 = (ap[0] - (ap[0] - sh1[0]) * (1 - t) * 1.6, ap[1] + (sh1[1] - ap[1]) * (1 - t) * 1.6)
            a2 = (ap[0] + (sh2[0] - ap[0]) * (1 - t) * 1.6, ap[1] + (sh2[1] - ap[1]) * (1 - t) * 1.6)
            mid = (ap[0] + 10, ap[1] + h * 0.17)
            out.append(f'<path d="M{a1[0]:.0f},{a1[1]:.0f} L{ap[0]:.0f},{ap[1]:.0f} L{a2[0]:.0f},{a2[1]:.0f} L{(a2[0]+mid[0])/2:.0f},{a2[1]+14:.0f} L{mid[0]:.0f},{mid[1]:.0f} L{(a1[0]+mid[0])/2:.0f},{a1[1]+16:.0f} Z" fill="{snow}"/>')
    return "".join(out)


def wheel(cx, cy, r):
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#1a1c1e"/><circle cx="{cx}" cy="{cy}" r="{r*0.62:.0f}" fill="#d8d8d2"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r*0.46:.0f}" fill="#2a2d30"/><circle cx="{cx}" cy="{cy}" r="{r*0.14:.0f}" fill="#b99a68"/>')


def scooty(color):
    return f'''<g>
<path d="M-340,-140 C-350,-230 -300,-300 -200,-300 L-60,-300 C-10,-300 20,-270 30,-220 L40,-150 L150,-150 C170,-240 175,-330 160,-420 L215,-430 C235,-330 235,-220 215,-150 L270,-140 L270,-100 L-300,-100 C-330,-100 -340,-120 -340,-140 Z" fill="{color}"/>
<path d="M-315,-300 C-300,-345 -230,-355 -120,-350 L-30,-345 L-45,-300 Z" fill="#202326"/>
<rect x="-40" y="-150" width="190" height="24" rx="8" fill="#26292c"/>
<path d="M150,-428 L130,-458 L255,-474 L275,-456 Z" fill="#202326"/>
<circle cx="228" cy="-392" r="26" fill="#f1e4c4"/>
<path d="M205,-420 L262,-100" stroke="#8d8f90" stroke-width="14" stroke-linecap="round"/>
{wheel(-230,-82,82)}{wheel(262,-82,82)}
</g>'''


def motorcycle(color):
    return f'''<g>
<path d="M-100,-130 L-330,-150 L-345,-128 L-100,-108 Z" fill="#9a9c9d"/>
<path d="M-330,-105 L-60,-170" stroke="#2a2d30" stroke-width="20" stroke-linecap="round"/>
<rect x="-120" y="-250" width="230" height="130" rx="22" fill="#34383b"/>
<rect x="-90" y="-230" width="60" height="60" rx="10" fill="#4a4f53"/>
<path d="M-60,-340 C0,-392 120,-382 175,-330 L150,-280 L-40,-280 Z" fill="{color}"/>
<path d="M-270,-300 C-200,-332 -80,-336 -40,-310 L-50,-278 L-275,-268 Z" fill="#202326"/>
<path d="M-345,-292 L-262,-302 L-272,-250 L-355,-250 Z" fill="{color}"/>
<path d="M330,-105 L200,-380" stroke="#a9abab" stroke-width="18" stroke-linecap="round"/>
<path d="M188,-398 L150,-424 L245,-432" stroke="#202326" stroke-width="13" fill="none" stroke-linecap="round"/>
<circle cx="238" cy="-336" r="34" fill="#f1e4c4"/>
<path d="M205,-285 C250,-290 300,-250 318,-205 L270,-205 C260,-235 235,-255 200,-258 Z" fill="{color}"/>
{wheel(-330,-105,105)}{wheel(330,-105,105)}
</g>'''


def car(color, compact=False):
    if compact:
        body = "M-440,-120 L-440,-215 C-440,-245 -415,-262 -380,-268 L-230,-285 L-150,-370 C-140,-382 -125,-386 -105,-386 L110,-386 C135,-386 150,-378 165,-360 L240,-280 L390,-262 C425,-255 440,-235 440,-205 L440,-120 Z"
        wins = '<path d="M-215,-290 L-150,-362 L-10,-366 L-10,-290 Z" fill="#aab6bf"/><path d="M30,-366 L120,-366 L190,-290 L30,-290 Z" fill="#aab6bf"/>'
    else:
        body = "M-470,-120 L-470,-230 C-470,-260 -440,-280 -400,-285 L-250,-300 L-190,-390 C-180,-405 -165,-410 -145,-410 L170,-410 C195,-410 210,-400 225,-380 L290,-290 L420,-270 C455,-262 470,-240 470,-210 L470,-120 Z"
        wins = '<path d="M-215,-300 L-165,-380 L-20,-384 L-20,-300 Z" fill="#aab6bf"/><path d="M20,-384 L160,-384 L240,-300 L20,-300 Z" fill="#aab6bf"/>'
    return f'''<g>
<path d="{body}" fill="{color}"/>{wins}
<rect x="-12" y="-300" width="8" height="150" fill="rgba(0,0,0,.25)"/>
<rect x="-470" y="-215" width="30" height="26" rx="6" fill="#c0392b"/><rect x="420" y="-232" width="38" height="24" rx="6" fill="#f1e4c4"/>
<rect x="-470" y="-130" width="940" height="20" fill="rgba(0,0,0,.35)"/>
<circle cx="-290" cy="-95" r="112" fill="#151719"/><circle cx="290" cy="-95" r="112" fill="#151719"/>
{wheel(-290,-95,95)}{wheel(290,-95,95)}
</g>'''


VEH = {"scooty": scooty, "bike": motorcycle, "car": car}


def road(color="#3a3d40"):
    return (f'<path d="M520,900 C700,790 1010,745 835,625 C775,588 785,572 800,562 L812,562 C812,578 840,592 890,625 C1080,752 800,810 1180,900 Z" fill="{color}"/>'
            '<path d="M850,900 C830,830 905,770 842,650" stroke="#f7f7f4" stroke-opacity=".55" stroke-width="5" stroke-dasharray="26 26" fill="none"/>')


def svg(inner, defs="", label=True):
    lab = (f'<text x="{W-24}" y="{H-20}" text-anchor="end" font-family="sans-serif" font-size="18" fill="#ffffff" fill-opacity=".62">{LABEL}</text>'
           if label else "")
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice"><defs>{defs}</defs>{inner}{lab}</svg>')


def scene(name, sky, sun, far, snow, mid, near, ground, feature=None, vehicle=None, vscale=0.5, vpos=(900, 860), vcolor="#b99a68", seed=1):
    defs = (f'<linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{sky[0]}"/><stop offset="1" stop-color="{sky[1]}"/></linearGradient>'
            f'<radialGradient id="g"><stop offset="0" stop-color="{sun[2]}" stop-opacity=".9"/><stop offset="1" stop-color="{sun[2]}" stop-opacity="0"/></radialGradient>'
            f'<linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{ground[0]}"/><stop offset="1" stop-color="{ground[1]}"/></linearGradient>')
    p = [f'<rect width="{W}" height="{H}" fill="url(#s)"/>',
         f'<circle cx="{sun[0]}" cy="{sun[1]}" r="320" fill="url(#g)"/><circle cx="{sun[0]}" cy="{sun[1]}" r="58" fill="{sun[2]}"/>',
         peaks(seed, 520, 4, 280, 430, far, snow),
         fill_poly(ridge(seed + 3, 560, 130), mid),
         fill_poly(ridge(seed + 7, 640, 110), near),
         f'<rect y="610" width="{W}" height="{H-610}" fill="url(#gr)"/>']
    if feature == "lake":
        p.append(f'<rect y="590" width="{W}" height="310" fill="#5e8aa0" opacity=".9"/><path d="M0,640 H1600 M0,700 H1600 M0,770 H1600" stroke="#fff" stroke-opacity=".25" stroke-width="3"/>')
        p.append(f'<path d="M0,900 L0,820 C300,780 700,830 1100,790 C1350,770 1500,790 1600,780 L1600,900 Z" fill="#6b7b55"/>')
    if feature == "road":
        p.append(road())
    if feature == "flags":
        p.append(road("#5a4a3a"))
        cols = ["#c0392b", "#f1c40f", "#2e86c1", "#f7f7f4", "#27ae60"]
        pts = "".join(f'<rect x="{150+i*58}" y="{330+ (i-6)**2*2.2:.0f}" width="34" height="46" fill="{cols[i%5]}" opacity=".9"/>' for i in range(13))
        p.append(f'<path d="M120,330 Q500,520 940,330" stroke="#f7f7f4" stroke-width="3" fill="none"/><g transform="translate(0,40)">{pts}</g>')
    if feature == "lakeroad":
        p.append(f'<rect y="590" width="{W}" height="140" fill="#5e8aa0"/><path d="M0,900 L0,740 C500,720 1100,760 1600,730 L1600,900 Z" fill="#6f7e58"/><path d="M0,830 C500,800 1100,830 1600,805 L1600,870 C1100,895 500,880 0,900 Z" fill="#3a3d40"/>')
    if vehicle:
        fn, color = VEH[vehicle[0]], vcolor
        v = fn(color, vehicle[1]) if vehicle[0] == "car" else fn(color)
        p.append(f'<ellipse cx="{vpos[0]}" cy="{vpos[1]+8}" rx="{330*vscale:.0f}" ry="{22*vscale:.0f}" fill="#000" opacity=".28"/><g transform="translate({vpos[0]},{vpos[1]}) scale({vscale})">{v}</g>')
    p.append(f'<rect width="{W}" height="{H}" fill="#151719" opacity=".08"/>')
    open(os.path.join(OUT, name + ".svg"), "w").write(svg("".join(p), defs))


def studio(name, kind, color, compact=False):
    defs = ('<linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7f7f4"/><stop offset="1" stop-color="#deded8"/></linearGradient>')
    v = VEH[kind](color, compact) if kind == "car" else VEH[kind](color)
    sc = 1.28 if kind != "car" else 1.15
    inner = (f'<rect width="{W}" height="{H}" fill="url(#b)"/>' + peaks(5, 600, 5, 160, 300, "#b99a68", None).replace('fill="#b99a68"', 'fill="#b99a68" opacity=".16"') +
             f'<rect y="700" width="{W}" height="200" fill="#d4d4cd"/><ellipse cx="800" cy="715" rx="520" ry="26" fill="#000" opacity=".2"/>'
             f'<g transform="translate(800,712) scale({sc})">{v}</g>')
    open(os.path.join(OUT, name + ".svg"), "w").write(svg(inner.replace("#ffffff", "#151719"), defs).replace('fill="#ffffff" fill-opacity=".62"', 'fill="#151719" fill-opacity=".5"'))


# ---- scenes ----
scene("hero-adventure", ("#1f2a33", "#e9b27a"), (1130, 330, "#ffd9a0"), "#51647a", "#f4efe6", "#33414f", "#232c33", ("#2a2a28", "#151719"), "road", ("bike", None), 0.62, (930, 835), "#b99a68", 11)
scene("pokhara-lakeside", ("#9cc3d9", "#f4e3c8"), (1250, 250, "#fff3d1"), "#7f9db5", "#ffffff", "#5b7f94", "#3f6a6f", ("#5e8aa0", "#3e6577"), "lake", None, seed=21)
scene("scooty-pokhara", ("#a9cbe0", "#f7e7cc"), (260, 260, "#fff3d1"), "#86a3b9", "#ffffff", "#628599", "#456f72", ("#5e8aa0", "#3e6577"), "lakeroad", ("scooty", None), 0.5, (860, 840), "#b99a68", 23)
scene("mustang-road", ("#e8c29a", "#f7e6c8"), (1300, 280, "#fff0cf"), "#a98563", "#f1e6d4", "#b9835a", "#8d5f3d", ("#a47651", "#6e482d"), "road", ("bike", None), 0.5, (940, 830), "#151719", 31)
scene("manang-valley", ("#7fb0d6", "#e6f1f4"), (320, 220, "#ffffff"), "#6d86a5", "#ffffff", "#4f7f62", "#2f5d49", ("#4a7a56", "#2f5d49"), "road", None, seed=41)
scene("muktinath-trail", ("#6f8fb3", "#f2dcc0"), (1230, 260, "#fff0cf"), "#8f7f7a", "#f4efe6", "#a58467", "#7d5f47", ("#8f6c4f", "#5a4130"), "flags", None, seed=51)
scene("mountain-road-bike", ("#27323d", "#f0b57c"), (520, 360, "#ffd9a0"), "#556a82", "#f4efe6", "#38485a", "#252f38", ("#2c2c2a", "#151719"), "road", ("bike", None), 0.56, (860, 840), "#c9a86a", 61)
scene("suv-scenic", ("#8fbfdc", "#f4ecd4"), (1180, 250, "#fff3d1"), "#7897b0", "#ffffff", "#527a5e", "#2f5a45", ("#496f52", "#2f5a45"), "road", ("car", False), 0.46, (900, 835), "#2a2d30", 71)

# ---- vehicle studio images ----
studio("v-city-scooty", "scooty", "#b99a68")
studio("v-touring-scooty", "scooty", "#2a2d30")
studio("v-commuter-bike", "bike", "#7a8a6a")
studio("v-adventure-bike", "bike", "#c05a2c")
studio("v-compact-suv", "car", "#2a2d30", False)
studio("v-hatchback", "car", "#8c9aa6", True)
print("done")

"""Original, code-drawn dish illustrations (SVG). Top-down view, flat style with soft shading.
Each dish gets a FORM (what it is served as) and a PALETTE (its real colours), chosen from its name and course."""
import math, random, re, hashlib

W = 600
CREAM = "#f6ead7"

def rng(seed):
    return random.Random(int(hashlib.md5(seed.encode()).hexdigest()[:8], 16))

# ---------- colours ----------
COL = {
    "red": ("#b8321f", "#d9502e"), "orange": ("#d9682b", "#f08a3c"), "yellow": ("#e0a826", "#f2c443"),
    "green": ("#3f6e2a", "#5f9a3a"), "brown": ("#6b3a1f", "#8f5430"), "white": ("#efe6d6", "#fbf6ec"),
    "cream": ("#e8d2a8", "#f3e2bf"), "golden": ("#c98a2b", "#e3a944"), "dark": ("#3a2418", "#5a3a26"),
    "pink": ("#d9849a", "#efa6b8"), "purple": ("#4a2240", "#6b3460"), "tan": ("#b98a52", "#d4a76c"),
    "black": ("#2a2a2a", "#3d3a36"),
}
BGS = ["#f3d9b1", "#f6e3c4", "#efd0a8", "#f1dcc0", "#ead2b5", "#f4e1c8"]

def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;")

# ---------- building blocks ----------
def shadow(cx, cy, r, op=0.22):
    return f'<ellipse cx="{cx+10}" cy="{cy+16}" rx="{r}" ry="{r*0.96}" fill="#5a3517" opacity="{op}"/>'

def plate(cx=300, cy=300, r=230, col="#fbf7ef"):
    return (shadow(cx, cy, r) + f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{col}"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r*0.8}" fill="none" stroke="#e7ddcc" stroke-width="3"/>')

def leaf(cx=300, cy=300, rot=-25):
    return (f'<g transform="rotate({rot} {cx} {cy})">'
            f'<ellipse cx="{cx+12}" cy="{cy+18}" rx="270" ry="190" fill="#3a5a1c" opacity=".25"/>'
            f'<ellipse cx="{cx}" cy="{cy}" rx="270" ry="190" fill="#4f8a2f"/>'
            f'<ellipse cx="{cx}" cy="{cy}" rx="250" ry="172" fill="#5c9a37"/>'
            f'<line x1="{cx-262}" y1="{cy}" x2="{cx+262}" y2="{cy}" stroke="#87bd5a" stroke-width="5"/>'
            + "".join(f'<line x1="{cx-200+i*44}" y1="{cy}" x2="{cx-170+i*44}" y2="{cy-150}" stroke="#76ad4c" stroke-width="2" opacity=".7"/>'
                      f'<line x1="{cx-200+i*44}" y1="{cy}" x2="{cx-170+i*44}" y2="{cy+150}" stroke="#76ad4c" stroke-width="2" opacity=".7"/>' for i in range(9))
            + "</g>")

def bowl(cx, cy, r, rim="#e9e1d3", inner=None, metal=False):
    rimc = "url(#brass)" if metal else rim
    s = shadow(cx, cy, r, 0.25) + f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{rimc}"/>'
    s += f'<circle cx="{cx}" cy="{cy}" r="{r*0.86}" fill="{inner or "#000"}"/>' if inner else ""
    return s

def curry_fill(cx, cy, r, pal, R):
    d, l = COL[pal]
    s = f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{d}"/>'
    s += f'<circle cx="{cx-r*0.18}" cy="{cy-r*0.2}" r="{r*0.72}" fill="{l}" opacity=".55"/>'
    for _ in range(int(r / 9)):  # oil/spice specks
        a = R.random() * 6.28; rr = R.random() * r * 0.85
        s += f'<circle cx="{cx+math.cos(a)*rr:.1f}" cy="{cy+math.sin(a)*rr:.1f}" r="{R.uniform(1.5,4):.1f}" fill="{d}" opacity=".6"/>'
    return s

def chunks(cx, cy, r, col, n, R, size=(16, 30)):
    s = ""
    for _ in range(n):
        a = R.random() * 6.28; rr = R.random() * r * 0.7; w = R.uniform(*size)
        x, y = cx + math.cos(a) * rr, cy + math.sin(a) * rr
        s += f'<rect x="{x-w/2:.1f}" y="{y-w/2:.1f}" width="{w:.1f}" height="{w*R.uniform(.7,1):.1f}" rx="{w*0.35:.1f}" fill="{col}" transform="rotate({R.randint(0,90)} {x:.1f} {y:.1f})"/>'
        s += f'<rect x="{x-w/2+3:.1f}" y="{y-w/2+3:.1f}" width="{w*0.45:.1f}" height="{w*0.3:.1f}" rx="4" fill="#fff" opacity=".18" transform="rotate({R.randint(0,90)} {x:.1f} {y:.1f})"/>'
    return s

def herbs(cx, cy, r, R, n=7, col="#3f7a2a"):
    s = ""
    for _ in range(n):
        a = R.random() * 6.28; rr = R.random() * r * 0.75
        x, y = cx + math.cos(a) * rr, cy + math.sin(a) * rr
        s += f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="9" ry="5" fill="{col}" transform="rotate({R.randint(0,180)} {x:.1f} {y:.1f})"/>'
        s += f'<ellipse cx="{x+7:.1f}" cy="{y+4:.1f}" rx="7" ry="4" fill="#5e9e3a" transform="rotate({R.randint(0,180)} {x:.1f} {y:.1f})"/>'
    return s

def chilli(x, y, rot, col="#c0281a"):
    return (f'<g transform="rotate({rot} {x} {y})"><path d="M{x-34} {y} q34 -16 68 0 q-34 12 -68 0z" fill="{col}"/>'
            f'<rect x="{x+30}" y="{y-4}" width="14" height="6" rx="3" fill="#3f7a2a"/></g>')

def cashews(cx, cy, r, R, n=5):
    s = ""
    for _ in range(n):
        a = R.random() * 6.28; rr = R.random() * r * 0.7
        x, y = cx + math.cos(a) * rr, cy + math.sin(a) * rr
        s += f'<path d="M{x-10:.1f} {y:.1f} a11 11 0 1 1 20 0 a6 6 0 1 0 -20 0z" fill="#f0d49c" transform="rotate({R.randint(0,360)} {x:.1f} {y:.1f})"/>'
    return s

def grains(cx, cy, r, pal, R, n=420):
    d, l = COL[pal]
    s = f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{l}"/><circle cx="{cx+r*0.12}" cy="{cy+r*0.14}" r="{r*0.8}" fill="{d}" opacity=".18"/>'
    for _ in range(n):
        a = R.random() * 6.28; rr = math.sqrt(R.random()) * r * 0.95
        x, y = cx + math.cos(a) * rr, cy + math.sin(a) * rr
        s += f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="5.5" ry="2.2" fill="{R.choice([l, "#fffaf0", d])}" opacity=".9" transform="rotate({R.randint(0,180)} {x:.1f} {y:.1f})"/>'
    return s

def side_bowl(cx, cy, r, pal, R):
    return bowl(cx, cy, r, metal=True) + curry_fill(cx, cy, r * 0.84, pal, R)

# ---------- forms ----------
def f_curry(p, R, garnish):
    s = plate()
    s += bowl(300, 300, 190, metal=p.get("metal", False))
    s += curry_fill(300, 300, 164, p["pal"], R)
    if p.get("pieces"): s += chunks(300, 300, 160, p["pieces"], R.randint(7, 11), R)
    return s + garnish(300, 300, 150)

def f_rice(p, R, garnish):
    s = plate()
    s += grains(300, 300, 175, p["pal"], R)
    if p.get("pieces"): s += chunks(300, 300, 150, p["pieces"], 6, R, (22, 34))
    return s + garnish(300, 300, 150)

def f_bread(p, R, garnish):
    s = plate()
    d, l = COL[p["pal"]]
    for i, (dx, dy) in enumerate([(-30, 20), (25, -15), (0, 0)]):
        s += f'<circle cx="{300+dx}" cy="{300+dy}" r="150" fill="{d}"/><circle cx="{300+dx}" cy="{300+dy}" r="140" fill="{l}"/>'
    for _ in range(26):
        a = R.random() * 6.28; rr = R.random() * 125
        s += f'<ellipse cx="{300+math.cos(a)*rr:.1f}" cy="{300+math.sin(a)*rr:.1f}" rx="{R.uniform(5,13):.1f}" ry="{R.uniform(3,8):.1f}" fill="{d}" opacity=".55"/>'
    if p.get("side"): s += side_bowl(470, 440, 60, p["side"], R)
    return s + garnish(300, 300, 90)

def f_crepe(p, R, garnish):
    s = leaf() if p.get("leaf") else plate()
    d, l = COL[p["pal"]]
    s += f'<path d="M110 300 Q300 120 490 300 Q300 470 110 300z" fill="{d}"/><path d="M130 300 Q300 150 470 300 Q300 440 130 300z" fill="{l}"/>'
    for _ in range(30):
        x = R.uniform(170, 430); y = R.uniform(240, 360)
        s += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{R.uniform(2,5):.1f}" fill="{d}" opacity=".5"/>'
    s += side_bowl(180, 470, 52, "white", R) + side_bowl(300, 500, 52, p.get("side", "orange"), R)
    return s + garnish(300, 300, 60)

def f_balls(p, R, garnish):
    s = plate()
    d, l = COL[p["pal"]]
    pts = [(300, 300), (220, 250), (380, 250), (220, 360), (380, 360), (300, 200), (300, 400)]
    for x, y in pts[: p.get("n", 7)]:
        s += f'<circle cx="{x+6}" cy="{y+9}" r="52" fill="#5a3517" opacity=".18"/><circle cx="{x}" cy="{y}" r="52" fill="{d}"/>'
        s += f'<circle cx="{x-12}" cy="{y-14}" r="34" fill="{l}" opacity=".7"/>'
        for _ in range(12):
            s += f'<circle cx="{x+R.uniform(-40,40):.1f}" cy="{y+R.uniform(-40,40):.1f}" r="2.4" fill="{d}" opacity=".6"/>'
    return s + garnish(300, 300, 120)

def f_bars(p, R, garnish):
    s = plate()
    d, l = COL[p["pal"]]
    for i in range(3):
        for j in range(2):
            x, y = 170 + i * 92, 210 + j * 100
            s += f'<rect x="{x+6}" y="{y+9}" width="80" height="80" rx="10" fill="#5a3517" opacity=".18"/><rect x="{x}" y="{y}" width="80" height="80" rx="10" fill="{d}"/>'
            if p.get("layers"):
                for k in range(4):
                    s += f'<rect x="{x}" y="{y+8+k*18}" width="80" height="7" fill="{l}" opacity=".8"/>'
            else:
                s += f'<rect x="{x+6}" y="{y+6}" width="68" height="68" rx="8" fill="{l}" opacity=".7"/>'
    return s + garnish(300, 300, 110)

def f_fried(p, R, garnish):
    s = plate()
    d, l = COL[p["pal"]]
    for _ in range(p.get("n", 7)):
        x, y = R.uniform(190, 410), R.uniform(190, 400)
        pts = " ".join(f"{x+math.cos(a)*R.uniform(34,48):.1f},{y+math.sin(a)*R.uniform(26,40):.1f}" for a in [i * 0.6 for i in range(11)])
        s += f'<polygon points="{pts}" fill="{d}" transform="translate(5 8)" opacity=".25"/><polygon points="{pts}" fill="{d}"/>'
        s += f'<circle cx="{x-8:.1f}" cy="{y-8:.1f}" r="18" fill="{l}" opacity=".7"/>'
    s += side_bowl(470, 450, 55, p.get("side", "green"), R)
    return s + garnish(300, 300, 120)

def f_ring(p, R, garnish):  # vada, achappam, jalebi-like rings
    s = plate()
    d, l = COL[p["pal"]]
    for x, y in [(230, 250), (370, 250), (300, 370)]:
        s += f'<circle cx="{x+5}" cy="{y+8}" r="70" fill="#5a3517" opacity=".2"/><circle cx="{x}" cy="{y}" r="70" fill="{d}"/><circle cx="{x-6}" cy="{y-8}" r="56" fill="{l}" opacity=".7"/><circle cx="{x}" cy="{y}" r="18" fill="#fbf7ef"/>'
    s += side_bowl(470, 450, 52, p.get("side", "white"), R)
    return s + garnish(300, 300, 100)

def f_skewer(p, R, garnish):
    s = plate()
    d, l = COL[p["pal"]]
    for k, y in enumerate([230, 300, 370]):
        s += f'<line x1="120" y1="{y}" x2="480" y2="{y-20}" stroke="#8a6a44" stroke-width="7" stroke-linecap="round"/>'
        for i in range(5):
            x = 170 + i * 64
            s += f'<rect x="{x}" y="{y-26-i*3}" width="52" height="46" rx="16" fill="{d}"/><rect x="{x+8}" y="{y-20-i*3}" width="26" height="16" rx="8" fill="{l}" opacity=".7"/>'
    s += '<circle cx="470" cy="450" r="30" fill="#f4e7c2"/><circle cx="470" cy="450" r="22" fill="#e9d48a"/>'  # lemon
    return s + herbs(300, 450, 60, R, 4)

def f_dumpling(p, R, garnish):
    s = shadow(300, 300, 220) + '<circle cx="300" cy="300" r="220" fill="#c9a36a"/><circle cx="300" cy="300" r="200" fill="#d9b67c"/>'
    for i in range(20):
        s += f'<line x1="{120+i*18}" y1="140" x2="{120+i*18}" y2="460" stroke="#c49a5c" stroke-width="2" opacity=".5"/>'
    d, l = COL[p["pal"]]
    for x, y in [(230, 230), (370, 230), (230, 370), (370, 370), (300, 300)]:
        s += f'<path d="M{x-50} {y+20} Q{x} {y-70} {x+50} {y+20} Q{x} {y+38} {x-50} {y+20}z" fill="{l}" stroke="{d}" stroke-width="3"/>'
        for k in range(5):
            s += f'<path d="M{x-30+k*15} {y-14} q4 10 0 24" stroke="{d}" stroke-width="2" fill="none"/>'
    return s + side_bowl(480, 470, 46, "red", R)

def f_drink(p, R, garnish):
    d, l = COL[p["pal"]]
    s = shadow(300, 300, 150) + f'<circle cx="300" cy="300" r="170" fill="#fbf7ef"/>'  # saucer
    s += f'<circle cx="300" cy="300" r="120" fill="#e9e1d3"/><circle cx="300" cy="300" r="106" fill="{d}"/><circle cx="285" cy="285" r="80" fill="{l}" opacity=".7"/>'
    if p.get("foam"): s += '<circle cx="300" cy="300" r="70" fill="#fbf3e2" opacity=".8"/>'
    s += f'<path d="M420 300 a40 40 0 1 1 0 0.1" fill="none"/>'
    s += '<path d="M410 260 q60 40 0 80" stroke="#e9e1d3" stroke-width="16" fill="none" stroke-linecap="round"/>'
    if p.get("biscuit"):  # round tea biscuits beside the cup
        for x, y in [(170, 455), (250, 490)]:
            s += f'<circle cx="{x+4}" cy="{y+6}" r="44" fill="#5a3517" opacity=".2"/><circle cx="{x}" cy="{y}" r="44" fill="#d9a85a"/><circle cx="{x-4}" cy="{y-4}" r="36" fill="#e9c27a"/>'
            s += "".join(f'<circle cx="{x+dx}" cy="{y+dy}" r="2.5" fill="#b07a32"/>' for dx, dy in [(-12, -8), (8, -12), (0, 6), (14, 10), (-10, 14)])
    return s + garnish(300, 300, 40)

def f_patty(p, R, garnish):  # tikki, galouti, cutlet
    s = plate()
    d, l = COL[p["pal"]]
    for x, y in [(225, 245), (375, 245), (300, 355)][: p.get("n", 3)]:
        s += f'<ellipse cx="{x+5}" cy="{y+8}" rx="66" ry="60" fill="#5a3517" opacity=".2"/><ellipse cx="{x}" cy="{y}" rx="66" ry="60" fill="{d}"/><ellipse cx="{x-6}" cy="{y-7}" rx="52" ry="46" fill="{l}" opacity=".75"/>'
        for _ in range(8):
            s += f'<circle cx="{x+R.uniform(-40,40):.1f}" cy="{y+R.uniform(-36,36):.1f}" r="3" fill="{d}" opacity=".7"/>'
    for i in range(3):
        s += f'<ellipse cx="{150+i*30}" cy="460" rx="26" ry="15" fill="none" stroke="#a24a7a" stroke-width="6"/>'
    s += side_bowl(455, 445, 48, p.get("side", "green"), R)
    return s + garnish(300, 300, 120)

def f_sweetbowl(p, R, garnish):  # kheer, payasam, rasgulla, gulab jamun in syrup
    s = plate()
    s += bowl(300, 300, 190, metal=p.get("metal", True))
    d, l = COL[p.get("syrup", "cream")]
    s += f'<circle cx="300" cy="300" r="164" fill="{d}"/><circle cx="285" cy="285" r="125" fill="{l}" opacity=".7"/>'
    if p.get("n"):
        bd, bl = COL[p["pal"]]
        for x, y in [(250, 255), (350, 255), (300, 345), (215, 345), (385, 345)][: p["n"]]:
            s += f'<circle cx="{x+4}" cy="{y+6}" r="46" fill="#3a2010" opacity=".2"/><circle cx="{x}" cy="{y}" r="46" fill="{bd}"/><circle cx="{x-10}" cy="{y-12}" r="22" fill="{bl}" opacity=".7"/>'
    return s + garnish(300, 300, 130)

def f_soup(p, R, garnish):
    s = plate()
    s += bowl(300, 300, 190, rim="#e9e1d3")
    s += curry_fill(300, 300, 164, p["pal"], R)
    if p.get("noodles"):
        for i in range(14):
            y = 190 + i * 16
            s += f'<path d="M180 {y} q30 -14 60 0 t60 0 t60 0 t60 0" stroke="#f3e2b0" stroke-width="5" fill="none" opacity=".9"/>'
    if p.get("pieces"): s += chunks(300, 300, 140, p["pieces"], 6, R)
    return s + garnish(300, 300, 130)

def f_halwa(p, R, garnish):
    s = plate()
    d, l = COL[p["pal"]]
    s += f'<path d="M140 330 Q150 190 300 180 Q450 190 460 330 Q300 400 140 330z" fill="{d}"/>'
    s += f'<path d="M180 300 Q200 220 300 214 Q400 220 420 300 Q300 340 180 300z" fill="{l}" opacity=".7"/>'
    s += '<path d="M200 250 Q300 226 380 250" stroke="#fff" stroke-width="7" opacity=".25" fill="none" stroke-linecap="round"/>'
    return s + cashews(300, 270, 110, R, 6)

def f_chutney(p, R, garnish):
    s = plate(r=200)
    s += side_bowl(300, 300, 150, p["pal"], R)
    return s + garnish(300, 300, 100)

def f_thali(p, R, garnish):
    s = shadow(300, 300, 240) + '<circle cx="300" cy="300" r="245" fill="url(#brass)"/><circle cx="300" cy="300" r="225" fill="#e9c97a"/>'
    pals = ["yellow", "red", "green", "brown", "white", "orange"]
    for i in range(6):
        a = -1.57 + i * 1.047
        s += side_bowl(300 + math.cos(a) * 150, 300 + math.sin(a) * 150, 58, pals[i], R)
    s += grains(300, 300, 70, "white", R, 120)
    return s

def f_fish(p, R, garnish):
    s = leaf()
    d, l = COL[p["pal"]]
    s += ('<g transform="rotate(-12 300 300)">'
          f'<path d="M140 300 Q260 170 420 300 Q260 430 140 300z" fill="{d}"/>'
          f'<path d="M420 300 L500 240 L490 300 L500 360z" fill="{d}"/>'
          f'<path d="M170 300 Q260 205 400 300 Q260 395 170 300z" fill="{l}" opacity=".6"/>'
          '<circle cx="190" cy="290" r="7" fill="#1d120c"/>'
          + "".join(f'<path d="M{230+i*36} 250 q14 50 0 100" stroke="{d}" stroke-width="5" fill="none" opacity=".6"/>' for i in range(5))
          + "</g>")
    s += '<circle cx="470" cy="470" r="34" fill="#f4e7c2"/><circle cx="470" cy="470" r="26" fill="#e9d48a"/>'
    for i in range(3):
        s += f'<ellipse cx="{130+i*30}" cy="470" rx="26" ry="16" fill="none" stroke="#a24a7a" stroke-width="6"/>'
    return s

def f_stack(p, R, garnish):  # idli, appam, puttu, neer dosa
    s = plate()
    d, l = COL[p["pal"]]
    for x, y in [(230, 250), (370, 250), (230, 370), (370, 370)]:
        s += f'<ellipse cx="{x+5}" cy="{y+8}" rx="68" ry="60" fill="#5a3517" opacity=".15"/><ellipse cx="{x}" cy="{y}" rx="68" ry="60" fill="{d}"/><ellipse cx="{x-6}" cy="{y-6}" rx="56" ry="48" fill="{l}"/>'
    s += side_bowl(470, 460, 50, p.get("side", "orange"), R)
    return s + garnish(300, 300, 60)

FORMS = {"curry": f_curry, "rice": f_rice, "bread": f_bread, "crepe": f_crepe, "balls": f_balls, "bars": f_bars,
         "fried": f_fried, "ring": f_ring, "skewer": f_skewer, "dumpling": f_dumpling, "drink": f_drink, "soup": f_soup,
         "halwa": f_halwa, "chutney": f_chutney, "thali": f_thali, "fish": f_fish, "stack": f_stack,
         "patty": f_patty, "sweetbowl": f_sweetbowl}

def render(dish_id, spec):
    R = rng(dish_id)
    bg = R.choice(BGS)
    g = spec.get("garnish", "herbs")
    def garnish(cx, cy, r):
        if g == "herbs": return herbs(cx, cy, r, R)
        if g == "chilli": return herbs(cx, cy, r, R, 4) + chilli(cx + 40, cy - 60, R.randint(-40, 40)) + chilli(cx - 50, cy + 50, R.randint(-40, 40))
        if g == "nuts": return cashews(cx, cy, r, R)
        if g == "cream": return f'<path d="M{cx-60} {cy} q30 -40 60 0 t60 0" stroke="#fbf3e2" stroke-width="10" fill="none" stroke-linecap="round"/>' + herbs(cx, cy, r * 0.6, R, 3)
        if g == "saffron":
            out = ""
            for _ in range(14):
                x, y, a = cx + R.uniform(-r, r) * .7, cy + R.uniform(-r, r) * .7, R.random() * 6.28
                out += f'<line x1="{x:.0f}" y1="{y:.0f}" x2="{x+math.cos(a)*12:.0f}" y2="{y+math.sin(a)*12:.0f}" stroke="#c0390f" stroke-width="3" stroke-linecap="round"/>'
            out += "".join(f'<path d="M{cx+R.uniform(-r,r)*.6:.0f} {cy+R.uniform(-r,r)*.6:.0f} q8 -8 16 0" stroke="#7a3d14" stroke-width="4" fill="none" stroke-linecap="round"/>' for _ in range(10))
            return out + herbs(cx, cy, r * .6, R, 4)
        return ""
    body = FORMS[spec["form"]](spec, R, garnish)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {W}" width="{W}" height="{W}">'
            '<defs><radialGradient id="brass" cx="40%" cy="35%"><stop offset="0" stop-color="#f6d98a"/><stop offset=".7" stop-color="#c9973e"/><stop offset="1" stop-color="#9c6d20"/></radialGradient>'
            '<radialGradient id="glow" cx="35%" cy="30%"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>'
            f'<rect width="{W}" height="{W}" fill="{bg}"/><rect width="{W}" height="{W}" fill="url(#glow)"/>'
            f'{body}</svg>')

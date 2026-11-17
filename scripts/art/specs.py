"""Choose how each dish is drawn: form + palette + garnish, from its name and course."""
import re

def has(name, *words):
    return any(re.search(r"\b" + w, name) for w in words)

def palette(n, course, veg):
    if has(n, "gongura", "saag", "sarson", "palak", "haakh", "kafuli", "hara dhania", "bathua", "methi", "thoran", "beans", "coriander", "walnut", "nellikka", "kangshoi", "dhania", "bhatt", "gundruk", "green", "ker sangri", "haak", "chakhwi", "bhendi", "gutke"): return "green"
    if has(n, "laal", "rogan", "vindaloo", "mirchi", "mircha", "chilli", "tandoori", "65", "aavakayi", "thecha", "pickle", "kaaram", "sorpotel", "balch", "tujji", "kolhapuri", "saoji", "chettinad", "mas podi", "arachuvitta", "red", "tamatar", "kodi vepudu", "ros ", "rasam", "malappuram", "fry"): return "red"
    if has(n, "kadhi", "dal", "parippu", "pongal", "khichdi", "pulihora", "chitranna", "dhokla", "khandvi", "locho", "khatta", "mango", "tenga", "erissery", "koottu", "kootu", "chana", "madra", "pappu", "dalma", "sambar", "tea", "kaaju", "mysore", "bobbat", "puran", "boondi", "ghewar", "jalebi", "bhujia", "sattu", "poha", "turmeric", "auraiya", "kaddu", "pitika", "khar", "ambal"): return "yellow"
    if has(n, "mutton", "beef", "gosht", "nihari", "haleem", "pork", "duck", "paya", "harissa", "korma", "maas", "sukka", "ularth", "roast", "rajma", "makhani", "chole", "chhole", "kosha", "smoked", "axone", "bhey", "wazwan", "matschgand", "gushtaba", "rabbit", "natukodi", "galouti", "kebab", "tunday", "seekh", "shikampuri", "kheema", "eromba", "phagshapa", "halwa", "baingan", "vankaya", "gatte", "dum aloo"): return "brown"
    if has(n, "idl", "appam", "neer", "puttu", "idiyappam", "rasag", "rosog", "sandesh", "doi", "coconut", "kobbari", "phirni", "kheer", "malaiyo", "daulat", "milk", "payasam", "paayasam", "undraalu", "modak", "kozhi ada", "pathiri", "pootharek", "petha", "pidi", "chhena gaja", "lassi", "dahibara", "momo", "pittha", "pitha", "jadoh", "galho", "pakhala", "kadubu", "pumaloi", "zan", "chak-hao"): return "white"
    if has(n, "butter", "paneer", "fish", "prawn", "xacuti", "ilish", "shorshe", "meen", "chepala", "machha", "masor", "lobster", "chicken", "kozhi", "bongulo", "kadai", "sambar", "bisi bele", "misal", "pav bhaji", "jigarthanda"): return "orange"
    return {"Sweets": "golden", "Breads": "tan", "Breakfast": "cream", "Snacks": "golden", "Rice": "golden", "Drinks": "tan", "Sides": "orange", "Mains": "orange"}.get(course, "golden")

MEAT = "#7a3a1c"

def spec_for(d):
    n = d["name"].lower(); c = d["course"]; veg = d["veg"]
    pal = palette(n, c, veg)
    pieces = None if veg else MEAT
    if veg and has(n, "paneer", "gatte", "dum aloo", "aloo", "rajma", "chole", "chana", "undhiyu", "vankaya", "baingan", "kadai"):
        pieces = {"paneer": "#f4ead2", "kadai": "#f4ead2"}.get(next((w for w in ("paneer", "kadai") if w in n), ""), "#d7a85a")

    # ---- named forms first ----
    if has(n, "thali", "bhojan", "dham", "wazwan", "mahaprasad", "sadya"): return dict(form="thali")
    if has(n, "biry", "biriy", "pulao", "pulav", "bath", "bhath", "chitranna", "pulihora", "khichdi", "jadoh", "galho", "pakhala", "sangati", "rice", "chawal", "pongal") and not has(n, "bisi", "curry"):
        if has(n, "sangati", "pakhala"): return dict(form="curry", pal="brown" if "sangati" in n else "white", pieces=MEAT if "natukodi" in n else None, garnish="herbs" if "sangati" in n else None)
        return dict(form="rice", pal="golden" if has(n, "biry", "biriy", "pot") else ("yellow" if pal in ("yellow", "golden") else "white" if pal in ("brown", "white") else "golden"), pieces=pieces, garnish="saffron" if has(n, "biry", "biriy", "pulao", "pulav") else "nuts" if "pongal" in n else "herbs")
    if has(n, "bisi bele"): return dict(form="curry", pal="orange", garnish="nuts", metal=True)
    if has(n, "dosa", "pesarattu", "chila", "chilla", "uttapam") and not has(n, "dosakaya"): return dict(form="crepe", pal="golden" if not has(n, "neer", "rava") else "cream", side="orange", leaf=has(n, "masala", "benne", "ghee", "kaaram"), garnish=None)
    if has(n, "idl", "appam", "puttu", "idiyappam", "kadubu", "pumaloi", "pitha", "pittha", "pidi", "kozhi ada", "undraalu", "modak", "dhokla", "khandvi", "locho", "sarva pindi"):
        if has(n, "modak", "undraalu", "kozhi ada"): return dict(form="dumpling", pal="white" if "modak" not in n else "cream")
        if has(n, "dhokla", "khandvi", "locho"): return dict(form="bars", pal="yellow", garnish="chilli" if "locho" in n else "herbs")
        return dict(form="stack", pal="white" if pal != "yellow" else "cream", side="orange" if has(n, "idl", "puttu") else "brown", garnish=None)
    if has(n, "momo", "dumpling", "skyu"): return dict(form="dumpling", pal="white")
    if has(n, "thukpa", "maggi", "soup", "paya", "kahwa", "rasam", "chaaru", "apong", "zan", "phagshapa", "aattukal"):
        if has(n, "kahwa", "apong"): return dict(form="drink", pal="golden" if "kahwa" in n else "cream", garnish=None)
        return dict(form="soup", pal="brown" if has(n, "paya", "aattukal", "phagshapa") else ("yellow" if "pappu" in n else "brown" if "ulava" in n else "red" if has(n, "rasam", "chaaru") else "orange" if has(n, "maggi", "thukpa") else "cream"), noodles=has(n, "thukpa", "maggi"), pieces=None if veg or has(n, "maggi") else MEAT, garnish="herbs")
    if c == "Drinks" or has(n, "lassi", "milk", "chai", "tea", "handia", "jigarthanda"):
        return dict(form="drink", pal={"lassi": "white", "badam": "cream", "jigarthanda": "brown", "handia": "cream", "butter tea": "cream"}.get(next((k for k in ("lassi", "badam", "jigarthanda", "handia", "butter tea") if k in n), ""), "tan"), foam=has(n, "lassi", "milk", "chai", "butter tea", "jigarthanda"), biscuit="osmania" in n, garnish="nuts" if has(n, "badam", "lassi") else None)
    if has(n, "karimeen", "pollichath", "polichattu", "pomfret", "trout", "amritsari fish", "ilish", "machha besara", "lobster") and "curry" not in n:
        if has(n, "amritsari"): return dict(form="fried", pal="golden", side="green", garnish="herbs")
        return dict(form="fish", pal="brown" if not has(n, "ilish", "besara") else "yellow")
    if has(n, "kebab", "tikka", "tandoori", "seekh"):
        if has(n, "galouti", "shikampuri", "tunday"): return dict(form="patty", pal="brown", garnish="herbs")
        return dict(form="skewer", pal="orange" if has(n, "tikka", "tandoori") else "brown")
    if has(n, "tikki", "kheema undalu", "cutlet", "bonda", "kola urundai", "punugulu", "paniyaram", "kobbari bondalu", "unnakkaya", "laddu", "ladoo", "pinni", "peda", "kaaju", "rasag", "rosog", "gulab", "chhena gaja", "bal mithai", "sandesh", "pootharek"):
        if has(n, "tikki"): return dict(form="patty", pal="golden", side="green", garnish="herbs")
        if has(n, "rasag", "rosog"): return dict(form="sweetbowl", pal="white", n=4, syrup="cream", garnish=None)
        if has(n, "sandesh", "peda", "kaaju", "chhena gaja", "bal mithai", "pootharek"): return dict(form="bars", pal={"sandesh": "white", "pootharek": "white", "kaaju": "cream", "peda": "tan", "bal mithai": "brown", "chhena gaja": "golden"}.get(next((k for k in ("sandesh", "pootharek", "kaaju", "peda", "bal mithai", "chhena gaja") if k in n), ""), "golden"), layers="pootharek" in n, garnish="nuts")
        return dict(form="balls", pal="golden" if not has(n, "kola", "kheema", "pinni") else "brown", n=7 if c == "Sweets" else 6, garnish="nuts" if c == "Sweets" else "herbs")
    if has(n, "vada", "vadai", "achappam", "jalebi", "sakinalu", "chakli", "murukku", "bhujia", "fafda", "chips", "kaaja", "khaja", "boorelu", "bobbatlu", "puran poli"):
        if has(n, "bobbatlu", "puran poli"): return dict(form="bread", pal="yellow", garnish=None)
        if has(n, "chips", "bhujia", "fafda"): return dict(form="fried", pal="yellow", n=9, side="green" if "fafda" in n else "red", garnish=None)
        if has(n, "kaaja", "khaja"): return dict(form="bars", pal="golden", layers=True, garnish=None)
        if has(n, "boorelu"): return dict(form="balls", pal="golden", n=5, garnish=None)
        return dict(form="ring", pal="golden" if not has(n, "jalebi") else "orange", side="white" if has(n, "vada", "vadai") else "yellow", garnish=None)
    if c != "Sweets" and not has(n, "salan") and has(n, "bajji", "pakora", "bhaji", "fry", "65", "vepudu", "egg", "omelette", "chicken fry", "nirachathu", "mirchi", "aktori", "babru", "fara", "bafauri", "dal pitha", "pyaaz kachori", "kachori", "singju", "chaat", "puchka", "kathi", "roll", "kothu", "vada pav", "pav bhaji", "misal", "kulche", "kees", "bhutta"):
        if has(n, "pav bhaji", "misal", "chole kulche", "kees"): return dict(form="curry", pal="orange" if "kees" not in n else "yellow", garnish="herbs", metal=True)
        if has(n, "bhutta"): return dict(form="skewer", pal="yellow")
        if has(n, "kothu", "singju", "chaat", "puchka", "tamatar"): return dict(form="rice" if "kothu" in n else "fried", pal="orange" if "kothu" in n else "golden", n=8, side="green", garnish="herbs")
        return dict(form="fried", pal="red" if has(n, "65", "vepudu", "fry", "malappuram") else "golden", side="green", garnish="herbs" if c != "Sweets" else None)
    if has(n, "halwa", "pak", "mawa", "barfi", "bebinca", "petha", "palkova", "kunda", "poduthol", "chandrakaanth", "prasadam", "sajjige", "mittha", "thekua", "tilkut", "malpua", "singori", "charolia", "sweet paan", "banarasi paan", "pitha"):
        if has(n, "bebinca"): return dict(form="bars", pal="golden", layers=True, garnish=None)
        if has(n, "mysore pak", "petha", "kunda", "thekua", "tilkut", "chandrakaanth", "singori", "paan"): return dict(form="bars", pal="cream" if has(n, "petha", "singori") else "green" if "paan" in n else "golden", garnish="nuts" if "paan" not in n else None)
        if has(n, "malpua"): return dict(form="bread", pal="golden", garnish="nuts")
        return dict(form="halwa", pal="orange" if has(n, "gajar", "kozhikode") else "golden" if has(n, "prasadam", "sajjige", "mittha") else "brown")
    if has(n, "chhena poda"): return dict(form="bars", pal="brown", garnish=None)
    if c == "Sweets" or has(n, "kheer", "payasam", "paayasam", "phirni", "doi", "daulat", "malaiyo", "pudding", "meetha", "ghewar", "puran"):
        if has(n, "ghewar", "double ka meetha", "bread pudding"): return dict(form="bars", pal="golden", garnish="nuts")
        return dict(form="sweetbowl", pal="brown", syrup="cream" if not has(n, "paruppu", "qubani", "chak-hao") else ("tan" if "paruppu" in n else "orange" if "qubani" in n else "purple"), garnish="nuts" if not has(n, "doi") else None)
    if c == "Breads" or has(n, "roti", "rotti", "rotte", "paratha", "parantha", "parota", "parotta", "naan", "kulcha", "bhature", "bhaturu", "luchi", "poi", "thepla", "siddu", "sidu", "pathiri", "sheermal", "khambir", "litti", "dhuska", "patande", "buns", "chatti pathiri"):
        if has(n, "litti", "dhuska", "buns", "siddu", "sidu"): return dict(form="balls", pal="tan" if "litti" in n else "golden", n=5, garnish="herbs" if "litti" in n else None)
        side = "brown" if has(n, "chole", "bhature", "beef", "luchi", "kachori") else ("green" if has(n, "sarson", "makki") else "orange" if c != "Breads" else None)
        return dict(form="bread", pal="cream" if has(n, "pathiri", "neypathiri", "luchi", "poi") else "tan", side=side, garnish=None)
    if c == "Sides" and has(n, "pacchadi", "chutney", "pickle", "aavakayi", "thecha", "podi", "injippuli", "chhum", "eromba", "bharta", "raita", "tungrymbai", "khar", "pitika", "kalakki", "balch", "pika pila", "wahan", "molaghee"):
        return dict(form="chutney", pal=pal if not has(n, "raita") else "white", garnish="chilli" if pal in ("red", "green") and not has(n, "raita") else "herbs")
    if c == "Sides" and has(n, "appadaalu", "vadiyalu"): return dict(form="fried", pal="cream", n=9, side="red", garnish=None)
    if has(n, "fish", "meen", "prawn", "chepala", "machha", "masor", "ilish", "pondicherry"):
        return dict(form="curry", pal=pal if pal in ("red", "yellow", "orange") else "orange", pieces="#f2b38a" if "prawn" in n else "#e8d9be", garnish="herbs", metal=has(n, "pulusu", "goan"))
    if has(n, "sukka", "varattiyathu", "ularth", "roast", "fry", "poriyal", "thoran", "bhujia", "sabzi", "vepudu", "chicken 65", "erissery", "koottu", "kootu", "ker sangri", "gutke", "bhendi", "kachri", "rugra", "gajar methi", "cholia"):
        return dict(form="halwa" if False else "curry", pal=pal, pieces=pieces or "#c6a25a", garnish="herbs")
    return dict(form="curry", pal=pal, pieces=pieces, garnish="cream" if has(n, "butter", "makhani", "korma", "malai") else "herbs", metal=has(n, "dal", "kadai", "kadhi", "sambar", "rajma", "chole", "mutton", "gosht"))

"""Draw an original illustration for every dish and point data/dishes.json at it.
Run from the project folder:  python3 scripts/art/generate.py"""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from illustrate import render
from specs import spec_for

db_path = "data/dishes.json"
db = json.load(open(db_path, encoding="utf8"))
for d in db["dishes"]:
    slug = d["id"].split("-", 1)[1]
    folder = f"public/images/{d['stateId']}"
    os.makedirs(folder, exist_ok=True)
    with open(f"{folder}/{slug}.svg", "w", encoding="utf8") as f:
        f.write(render(d["id"], spec_for(d)))
    d["image"] = f"/images/{d['stateId']}/{slug}.svg"
json.dump(db, open(db_path, "w", encoding="utf8"), ensure_ascii=False, indent=1)
print(f"Drew {len(db['dishes'])} dishes")

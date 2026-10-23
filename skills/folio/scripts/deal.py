#!/usr/bin/env python3
"""Deal art directions for a personal site from a profile.json.

Usage:
  deal.py --profile work/profile.json --options 3
  deal.py --profile work/profile.json --direction registre [--redraw type] [--redraw palette]
  deal.py --list

The deal is seeded by the person's name, so it is stable for one person and different between two
people in the same trade. --seed adds a salt when you want a fresh hand for the same person.
"""
import argparse, hashlib, json, os, random, sys

HERE = os.path.dirname(os.path.abspath(__file__))
LIB = json.load(open(os.path.join(HERE, "library.json"), encoding="utf-8"))


def rel_lum(hex_):
    h = hex_.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)


def contrast(a, b):
    la, lb = rel_lum(a), rel_lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def features(p):
    show_photo = bool(p.get("has_photo")) and bool(p.get("privacy", {}).get("show_photo", p.get("has_photo")))
    places = [x for x in p.get("places", []) if x]
    if not places:
        seen = []
        for item in p.get("experience", []) + p.get("education", []):
            pl = (item.get("place") or "").strip()
            if pl and pl not in seen:
                seen.append(pl)
        places = seen
    return {
        "photo": show_photo,
        "projects": len([x for x in p.get("projects", []) if x.get("title")]),
        "figures": len([x for x in p.get("figures", []) if x.get("value")]),
        "places": len(set(places)),
        "trade": (p.get("trade") or "other").lower(),
        "tags": sorted({t.lower() for t in p.get("sector_tags", []) + [p.get("seniority", "")] if t}),
        "name_len": len((p.get("name", {}) or {}).get("display", "")),
    }


def eligible(d, f):
    need = d.get("needs", {})
    if need.get("photo") and not f["photo"]:
        return False
    for k in ("figures", "places", "projects"):
        if k in need and f[k] < need[k]:
            return False
    return True


def weight(d, f):
    w = 1.0
    if f["trade"] in d["suits"]:
        w += 3.0
    w += 1.0 * len(set(f["tags"]) & set(d.get("tags", [])))
    if "short-name" in d.get("tags", []) and f["name_len"] and f["name_len"] <= 16:
        w += 1.0
    return w


def rng_for(p, salt=""):
    key = ((p.get("name", {}) or {}).get("display", "anon") + "|" + salt).encode()
    return random.Random(int(hashlib.sha256(key).hexdigest(), 16))


def deal(p, n, seed=""):
    f = features(p)
    pool = [(k, d) for k, d in LIB["directions"].items() if eligible(d, f)]
    r = rng_for(p, "dir|" + seed)
    chosen = []
    while pool and len(chosen) < n:
        weights = [weight(d, f) for _, d in pool]
        i = r.choices(range(len(pool)), weights=weights)[0]
        chosen.append(pool.pop(i))
    return f, chosen


def pick(p, did, slot, redraws, seed=""):
    d = LIB["directions"][did]
    opts = d[slot]
    r = rng_for(p, f"{slot}|{did}|{seed}")
    order = opts[:]
    r.shuffle(order)
    return order[redraws % len(order)]


def short(did, d, p, seed):
    t = LIB["type_systems"][pick(p, did, "type", 0, seed)]
    pal = LIB["palettes"][pick(p, did, "palette", 0, seed)]
    return (f"### {did} — {d['name']}\n{d['idea']}\n"
            f"- Type: {t['name']} ({t['mood']})\n- Palette: {pal['name']} ({pal['mode']})\n"
            f"- Fails when: {d['fails']}\n")


def palette_block(pal):
    lines = ["| Role | Value |", "| --- | --- |"]
    for k in ("bg", "surface", "ink", "muted", "accent", "accent_ink", "field_1", "field_1_ink", "field_2", "field_2_ink"):
        if k in pal:
            lines.append(f"| `--{k.replace('_', '-')}` | `{pal[k]}` |")
    checks = [("ink on bg", pal["ink"], pal["bg"], 7.0), ("muted on bg", pal["muted"], pal["bg"], 4.5),
              ("accent-ink on accent", pal["accent_ink"], pal["accent"], 4.5), ("ink on surface", pal["ink"], pal["surface"], 4.5)]
    for i in (1, 2):
        if f"field_{i}" in pal:
            checks.append((f"field-{i}-ink on field-{i}", pal[f"field_{i}_ink"], pal[f"field_{i}"], 4.5))
    out = []
    for label, a, b, need in checks:
        c = contrast(a, b)
        flag = "ok" if c >= need else f"LOW (need {need})"
        out.append(f"{label} {c:.1f}:1 {flag}")
    return "\n".join(lines) + "\n\nContrast: " + " · ".join(out)


def sheet(p, did, rt, rp, seed):
    d = LIB["directions"][did]
    tid = pick(p, did, "type", rt, seed)
    pid = pick(p, did, "palette", rp, seed)
    t, pal = LIB["type_systems"][tid], LIB["palettes"][pid]
    f = features(p)
    fetch = " ".join(f'"{x}"' for x in t["fetch"])
    out = [f"# Direction sheet: {d['name']}  (`{did}`)", "",
           f"Person: {(p.get('name') or {}).get('display', '?')} · trade: {f['trade']} · photo: {f['photo']} · "
           f"projects: {f['projects']} · figures: {f['figures']} · places: {f['places']}", "",
           "## The idea of this direction", d["idea"], "",
           "Now write yours: *On this page, [something that belongs to this person] becomes [this direction's device].*", "",
           f"## Type system: {t['name']}  (`{tid}`)", f"Mood: {t['mood']}", "",
           f"- Display: {t['display']['family']} {t['display']['weight']}, tracking {t['display']['tracking']}, leading {t['display']['leading']}"
           + (f", {t['display']['case']}" if t['display'].get('case') else ""),
           f"- Text: {t['text']['family']} {t['text']['weight']} (strong {t['text']['strong']})"
           + (f"; {t['text']['size_bump']}" if t['text'].get('size_bump') else "")
           + (f"; {t['text']['note']}" if t['text'].get('note') else ""),
           f"- Fallbacks: {t['fallback']}",
           f"- Fetch: `node <skill>/scripts/fetch_fonts.mjs --out site/public/fonts {fetch}`", "",
           f"## Palette: {pal['name']}  (`{pid}`, {pal['mode']})", palette_block(pal), "",
           "Proportions: ground 50–80 %, ink for text, accent under 5 % of any screen (the action and at most one other thing). "
           "At least two full-width fields (a surface step, the ink as a ground, or a palette field) break the page into chapters."
           + (" This palette has fields: whole sections take field_n with its own ink; neighbours differ in lightness." if pal.get("fields") else ""), "",
           "## Hero", f"- Desktop: {d['hero']['desktop']}", f"- Phone: {d['hero']['phone']}", "",
           "## Sections (use the shape for each role you keep; drop roles with no claim)"]
    for role, shape in d["sections"].items():
        out.append(f"- **{role}**: {shape}")
    out += ["", "## Motif (draw it, then bring it back in at least three sections)", d["motif"], "",
            "## Signature move", d["signature"], "",
            "## Scroll move (one, tied to scroll; see references/motion.md §Scroll)", d["scroll"], "",
            "## The live thing (pick one)"] + [f"- {x}" for x in d["live"]] + ["",
            "## How this direction fails", d["fails"], "",
            f"Redraws used: type {rt}, palette {rp}. Record any redraw and its reason in work/notes.md."]
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--profile")
    ap.add_argument("--options", type=int)
    ap.add_argument("--direction")
    ap.add_argument("--redraw", action="append", default=[], choices=["type", "palette"])
    ap.add_argument("--seed", default="")
    ap.add_argument("--list", action="store_true")
    a = ap.parse_args()

    if a.list:
        print("Directions:")
        for k, d in LIB["directions"].items():
            print(f"  {k:<12} {d['name']}  needs={d['needs'] or '-'}")
        print("Type systems:", ", ".join(LIB["type_systems"]))
        print("Palettes:", ", ".join(LIB["palettes"]))
        return
    if not a.profile:
        sys.exit("--profile is required")
    p = json.load(open(a.profile, encoding="utf-8"))
    if a.direction:
        if a.direction not in LIB["directions"]:
            sys.exit(f"unknown direction {a.direction}; see --list")
        d = LIB["directions"][a.direction]
        if not eligible(d, features(p)):
            print(f"<!-- warning: {a.direction} needs {d['needs']} which this profile does not meet -->")
        print(sheet(p, a.direction, a.redraw.count("type"), a.redraw.count("palette"), a.seed))
        return
    f, chosen = deal(p, a.options or 3, a.seed)
    print(f"Profile features: {f}\n")
    for did, d in chosen:
        print(short(did, d, p, a.seed))
    print("Choose the one that can carry something only this person has, then run with --direction <id>.")


if __name__ == "__main__":
    main()

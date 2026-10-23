#!/usr/bin/env python3
"""Extract text, links and images from a CV PDF, and write an empty profile skeleton.

Usage: extract_cv.py cv.pdf --out work

Writes:
  work/cv.txt          text in reading order (pdftotext -layout when available, else pypdf)
  work/links.json      every URI and mailto found in link annotations, plus emails/URLs in the text
  work/images/         embedded images, with sizes printed (the photo is usually the largest portrait one)
  work/profile.json    empty skeleton to fill (see references/content-model.md); never overwritten
"""
import argparse, json, os, re, shutil, subprocess, sys

try:
    from pypdf import PdfReader
except ImportError:
    sys.exit("pypdf is required: pip install pypdf")

SKELETON = {
    "language": "", "name": {"first": "", "last": "", "display": ""}, "headline": "", "trade": "",
    "sector_tags": [], "seniority": "", "location": {"city": "", "region": "", "country": "", "mobility": ""},
    "looking_for": "", "summary": "", "contact": {"email": "", "phone": "", "address": "", "links": []},
    "experience": [], "education": [], "certifications": [], "skills": [], "tools": [], "languages": [],
    "projects": [], "figures": [], "places": [], "interests": [], "has_photo": False, "photo": "",
    "privacy": {"show_phone": False, "show_address": False, "show_birthdate": False, "show_photo": False, "indexable": True, "hidden": []},
    "notes": [],
}


def text_of(pdf):
    if shutil.which("pdftotext"):
        try:
            out = subprocess.run(["pdftotext", "-layout", "-enc", "UTF-8", pdf, "-"], capture_output=True, text=True, check=True).stdout
            if out.strip():
                return out, "pdftotext -layout"
        except subprocess.CalledProcessError:
            pass
    r = PdfReader(pdf)
    parts = []
    for i, page in enumerate(r.pages):
        try:
            parts.append(page.extract_text(extraction_mode="layout") or "")
        except TypeError:
            parts.append(page.extract_text() or "")
    return "\n\f\n".join(parts), "pypdf"


def links_of(pdf, text):
    r = PdfReader(pdf)
    found = []
    for pi, page in enumerate(r.pages):
        for a in page.get("/Annots") or []:
            try:
                o = a.get_object()
                uri = o.get("/A", {}).get("/URI")
                if uri:
                    found.append({"page": pi + 1, "uri": str(uri)})
            except Exception:
                continue
    for m in re.finditer(r"[\w.+-]+@[\w-]+\.[\w.-]+", text):
        found.append({"page": None, "uri": "mailto:" + m.group(0), "from": "text"})
    for m in re.finditer(r"(https?://[^\s)>\]]+|(?:www\.)[^\s)>\]]+|(?:linkedin\.com|github\.com|behance\.net|dribbble\.com)/[^\s)>\]]+)", text):
        found.append({"page": None, "uri": m.group(0).rstrip(".,;"), "from": "text"})
    norm = lambda u: re.sub(r"^(https?://)?(www\.)?", "", u.lower()).rstrip("/")
    seen, out = set(), []
    for f in found:
        k = norm(f["uri"])
        if k not in seen:
            seen.add(k); out.append(f)
    return out


def images_of(pdf, outdir):
    r = PdfReader(pdf)
    os.makedirs(outdir, exist_ok=True)
    saved = []
    for pi, page in enumerate(r.pages):
        try:
            imgs = page.images
        except Exception:
            continue
        for ii, im in enumerate(imgs):
            name = f"p{pi + 1}-{ii}-{os.path.basename(im.name)}"
            path = os.path.join(outdir, name)
            try:
                with open(path, "wb") as fh:
                    fh.write(im.data)
                w, h = (im.image.size if getattr(im, "image", None) is not None else (0, 0))
            except Exception:
                continue
            saved.append({"path": path, "page": pi + 1, "width": w, "height": h,
                          "ratio": round(h / w, 2) if w else None})
    saved.sort(key=lambda s: s["width"] * s["height"], reverse=True)
    return saved


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf")
    ap.add_argument("--out", default="work")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)

    text, how = text_of(a.pdf)
    open(os.path.join(a.out, "cv.txt"), "w", encoding="utf-8").write(text)
    links = links_of(a.pdf, text)
    json.dump(links, open(os.path.join(a.out, "links.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    imgs = images_of(a.pdf, os.path.join(a.out, "images"))

    prof = os.path.join(a.out, "profile.json")
    if not os.path.exists(prof):
        json.dump(SKELETON, open(prof, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

    pages = len(PdfReader(a.pdf).pages)
    print(f"text: {len(text)} chars from {pages} page(s) via {how} -> {a.out}/cv.txt")
    print(f"links: {len(links)} -> {a.out}/links.json")
    for l in links:
        print("  ", l["uri"])
    print(f"images: {len(imgs)} -> {a.out}/images/")
    for s in imgs[:8]:
        shape = "portrait" if s["ratio"] and s["ratio"] > 1.05 else ("square" if s["ratio"] and s["ratio"] > 0.9 else "landscape")
        print(f"   {s['path']}  {s['width']}x{s['height']}  {shape}  page {s['page']}")
    if imgs:
        print("Look at the largest portrait or square image: if it is the person, set has_photo and photo in the profile.")
    print(f"profile skeleton: {prof} (fill it; see references/content-model.md)")
    if len(text.strip()) < 200:
        print("WARNING: very little text. The PDF may be scanned; OCR it or ask for a text version.")


if __name__ == "__main__":
    main()

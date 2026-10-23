# The profile

`work/profile.json` is the single source of facts for the site. `extract_cv.py` writes an empty
skeleton; you fill it from `work/cv.txt`. `deal.py` reads it to choose directions, so the fields it
uses (`trade`, `sector_tags`, `has_photo`, `projects`, `figures`, `places`) matter.

## Rules

- Copy facts as written. Dates in the CV's precision ("2021", "mars 2021", "2021-03"). Employer names
  exactly. Job titles exactly (you may fix case or a typo).
- `summary` is the person's own summary if the CV has one, else empty. You write the site's copy later,
  in `work/copy.md`, not here.
- `figures` holds only numbers that appear in the CV, each with its sentence of context and where it
  comes from. An empty list is normal.
- `notes` holds anything you inferred and anything missing.
- Keep the original language of the CV in every field; set `language` to its code (`fr`, `en`…).
- What the person adds when asked (projects, links, pictures, numbers, their aim) goes in the same fields
  with `"source": "person"` on the item, so the report can say where each fact came from.

## Fields

```json
{
  "language": "fr",
  "name": { "first": "Camille", "last": "Rousseau", "display": "Camille Rousseau" },
  "headline": "Infirmière en réanimation",
  "trade": "nurse",
  "sector_tags": ["health", "care", "public-service"],
  "seniority": "junior | confirmed | senior | student",
  "location": { "city": "Bordeaux", "region": "Nouvelle-Aquitaine", "country": "France", "mobility": "" },
  "looking_for": "Poste d'IDE en pédiatrie, Bordeaux métropole, à partir de janvier 2027",
  "summary": "",
  "contact": {
    "email": "",
    "phone": "",
    "address": "",
    "links": [ { "label": "LinkedIn", "url": "https://…" } ]
  },
  "experience": [
    {
      "role": "Infirmière de réanimation",
      "org": "Centre hospitalier de la Garonne",
      "org_kind": "public hospital",
      "place": "Bordeaux",
      "start": "2022-09",
      "end": "present",
      "contract": "CDI | CDD | alternance | stage | freelance | ''",
      "points": ["As written in the CV, one string per bullet"]
    }
  ],
  "education": [
    { "title": "Diplôme d'État d'infirmier", "school": "IFSI …", "place": "", "start": "2019", "end": "2022", "points": [] }
  ],
  "certifications": [ { "title": "AFGSU niveau 2", "date": "2023", "issuer": "" } ],
  "skills": [
    { "group": "Soins techniques", "items": ["Pose de VVC", "Ventilation invasive"] }
  ],
  "tools": ["As written"],
  "languages": [ { "name": "Anglais", "level": "B2" } ],
  "projects": [
    { "title": "", "role": "", "year": "", "what": "", "link": "", "images": [] }
  ],
  "figures": [
    { "value": "112 %", "context": "de l'objectif annuel atteint en 2024", "source": "experience[0].points[1]" }
  ],
  "places": ["Bordeaux", "Limoges"],
  "interests": ["As written"],
  "has_photo": false,
  "photo": "work/images/img-0.jpg",
  "privacy": {
    "show_phone": false,
    "show_address": false,
    "show_birthdate": false,
    "show_photo": false,
    "indexable": true,
    "hidden": ["phone", "address", "date of birth"]
  },
  "notes": ["trade inferred from job titles", "no LinkedIn link in the CV"]
}
```

## `trade` and `sector_tags`

`trade` is one plain word for the job family. `deal.py` matches these values; use the closest:

`developer`, `data`, `designer`, `architect`, `photographer`, `marketing`, `communication`, `sales`,
`business`, `finance`, `accounting`, `legal`, `hr`, `consultant`, `manager`, `project-manager`,
`engineer`, `researcher`, `teacher`, `nurse`, `doctor`, `health`, `social`, `hospitality`, `chef`,
`retail`, `logistics`, `craft`, `trades`, `sport`, `student`, `other`.

`sector_tags` are free words that help (`tech`, `public-service`, `luxury`, `industry`, `ngo`,
`international`, `reconversion`, `alternance`, `freelance`…). `reconversion`, `alternance`,
`freelance` and `international` change which directions are dealt; add them when true.

## When the CV has a photo

`extract_cv.py` saves every embedded image and prints their sizes. A photo is usually the largest image
with a portrait or square ratio on page one. Set `has_photo: true` and `photo` to its path only if it is
clearly a photo of the person (look at it with your image viewer). Logos and icons are not photos.
`privacy.show_photo` stays `false` until the person confirms. `privacy.indexable` records whether the
site may appear in search engines (default `true`; ask once).

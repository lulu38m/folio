# Directions

A direction is a way of composing a personal site: an idea, a hero, a shape per section, a type
system and a palette. `scripts/deal.py` deals three that suit the profile and prints the full sheet of
the one you choose. This file says what each is for, what it needs and how it fails, so you can choose
well. The sheet is the reference while building.

Why a deal and not a choice: asked to design a personal site, a model reaches for the same layout every
time. Dealing from a library, seeded by the person, makes two nurses or two developers get two
different sites, and stops the build from sliding back to the average.

| Direction | In one line | Needs | Strong for | Fails when |
| --- | --- | --- | --- | --- |
| `monument` | The name set as large as the screen allows; everything docked around it | – | Designers, creatives, students, chefs, short names | The first screen is only the name; long names not fitted line by line |
| `registre` | The career as a well-kept index: exact, dense, scannable | – | Developers, data, engineering, finance, legal, logistics | Dense becomes grey; lines everywhere make a spreadsheet |
| `chapitres` | Each part of the story is a chapter in its own flat colour field | – | Sales, marketing, students, alternance, HR, teaching | Neighbouring fields differ only in hue; more than three colours |
| `artefact` | The page takes the form of a printed thing from the person's trade | – | Care, kitchens, trades, logistics, teaching, sport, law | It becomes a costume or a joke; text shrinks to "form" size |
| `portrait` | A photograph used large carries the first screen and the colours | A good photo | People-facing jobs | The photo is weak; it is used small in a circle |
| `lettre` | A well-set letter in the person's voice, facts in the margin | – | Managers, consultants, researchers, career changers | Too long; the margin column empty below the fold |
| `chiffres` | Real results, one per screen, each with its sentence | 3+ figures in the CV | Sales, business, management | Figures without context; a row of stat cards |
| `itineraire` | The career as a drawn route between real places | 3+ places | Mobile careers, international, students, logistics | A thin line with dots (the generic timeline) |
| `atelier` | The work first, the CV as its caption | 2+ projects | Designers, developers with projects, architects, makers | Invented or grey-box projects |
| `affiche` | Each screen a typographic poster in condensed type | – | Students, sport, communication, hospitality | Capitals everywhere; a third size creeping in |

## Choosing among the three dealt

Hold each against the inventory in `work/notes.md`:

- Which one can carry something only this person has? (A nurse with a strong sense of the ward:
  `artefact` with a handover sheet. A salesman with four real results: `chiffres`. A student who moved
  between three cities: `itineraire`.)
- Which one the person's material can fill? A direction that needs a picture and gets none is a hole.
- Which one their reader expects to be surprised by, not confused by? A hospital recruiter reads a
  handover sheet instantly; a bank's HR may not read a poster.

Write one line on why. If none of the three can carry anything specific, deal again with `--seed 2`
rather than forcing one.

## The idea sentence

> On this page, **[something that belongs to this person]** becomes **[the direction's device]**.

Examples:

- "On this page, Camille's night shifts in resuscitation become the handover sheet the page is laid out
  as." (`artefact`)
- "On this page, Inès's six years of production systems become a register as exact as her runbooks."
  (`registre`)
- "On this page, Thomas's four regions become four colour chapters, one per territory he opened."
  (`chapitres`)

The colleague test: put another person in the same job in the sentence. If it still works, it belongs
to the job; go back to the inventory and find what only this person has (their places, their
specialisation, their numbers, their turn).

## Redraws

`--redraw type` or `--redraw palette` (repeatable) when you can state a reason: the face lacks a glyph
the name needs; the palette fights the colours of the person's photo or work; the person asked for a
light or dark page. Never redraw to get something more familiar. Record it in the notes.

# Critique: judging the render

`check_site.mjs` passing means nothing banned was measured. It says nothing about whether the page is
good. Judge the screenshots, never the code: you wrote the code and will read your intentions into it.
Adapted from taste-skill's critique (MIT).

## How to look

Open `desktop-fold.png`, `desktop-full.png`, then the tablet and phone pairs. One pass at a time.

1. **One second, then five.** What did you see first? There should be one answer: the name, the
   photograph, the figure, the artefact. Then five seconds as a recruiter: who is this, what do they do,
   what do they want, how do I reach them?
2. **Squint.** The page reduces to two or three large masses with clear size differences, or to many
   similar medium ones (nothing leads).
3. **Cover the name.** Could this page belong to another person in the same job? Swap the name and the
   city: if it still works, the page has no idea. Scroll: does the idea reach the experience, the skills
   and the contact, or does the page turn into stock blocks after the first screen?
4. **Edges.** Count the distinct left edges of text blocks down the page. Two or three, reused, is
   composed. Six means things were placed one at a time.
5. **Space and frame.** Equal margins? Any section with its content in one half and nothing in the
   other? Any stretch of nothing taller than half a screen? Gaps between sections clearly larger than
   gaps inside them?
6. **Type.** Is the jump from body to headline decisive? More than five sizes? Any orphan word on a
   headline's last line? Any paragraph wider than ~75 characters?
7. **Colour.** Name the proportions: ground, ink, accent. Is the accent only on the action and one
   other thing?
8. **Pictures.** Is every image doing a job (showing the person, the work, the world)? Same crop logic
   and treatment? Any grey box, stretched photo, stock face, icon standing in for a picture?
9. **Sameness.** One word per section's layout. The same word twice in a row, or three times on the
   page, is the template showing.
10. **Phone.** Its own composition, or the desktop squeezed? First screen still one clear thing with the
    h1, the sentence and the action?
11. **Substance.** Does every section deliver its information completely and at reading size? Would a
    recruiter leave knowing the last two roles, the dates, the level, what the person wants?
11b. **Fullness.** Scroll the full-page picture fast: does it read as a sequence of distinct screens
    (cover, field, poster, drawing…) or as one long sheet of type? Count the sections that hold only a
    heading and text on plain ground: more than one is a page that feels empty.
11c. **Motion.** Watch a recording of the page scrolling (screenshots cannot show it). Does something
    answer the scroll between the first screen and the contact? Is it the person's motif, or a fade?
12. **Collisions.** Anything on top of a headline or a button? An accent or a comma touching the line above
    in a tight display setting? Anything off the edge of the phone?
13. **Truth.** Is every fact on the page in the CV? Anything inflated, invented, or private that should
    be hidden (phone, address, age)?

## The score

Four criteria, 1–10 each, weighted like an Awwwards jury: **design 40 %, usability 30 %, creativity
20 %, content 10 %**.

- **Design**: 9–10 every screen holds as a poster; 8 confident, one or two soft spots; 7 clean and
  professional, little tension; 6 tidy but anonymous, reads as a kit; 5 or less weak hierarchy,
  accidental spacing, default type.
- **Usability**: 9–10 who, what and how to reach them in three seconds, flawless on a phone; 8 clear,
  minor friction; 7 one real problem; 6 or less you have to hunt.
- **Creativity**: 9–10 a concept specific to this person you have not seen applied this way; 8 a clear
  idea with one memorable move; 7 a tasteful known approach; 6 or less the category default.
- **Content**: 9–10 every line could only be about this person; 7–8 concrete, some generic lines; 6 or
  less slogans, filler.

`overall = 0.4·design + 0.3·usability + 0.2·creativity + 0.1·content`

Real award-winning sites land around 7.5–8 from a jury. If your first score for your own work is 9,
score it again as the juror who did not build it.

## Caps (override the arithmetic)

- Any FAIL left: overall ≤ 6.0. An `ALLOWED` break is not a FAIL; judge it instead: if it does not say
  something true about the person, or is done timidly, it counts as the tell it is (the cap below).
- A headline of three lines anywhere, an eyebrow, monospace labels, 01/02/03, a gradient, a shadow at
  rest, a hairline, a skill bar, a timeline with dots: overall ≤ 6.5, unless it is the page's one
  deliberate break (`rules.md` §8) and the break is defended in `work/notes.md` and done fully.
- Pass 3 fails (the page could be another person's): creativity ≤ 6.
- A section with half its width empty, unequal margins, or a blank stretch over half a screen: design
  ≤ 6.5.
- No action on the first screen: usability ≤ 7. The five-second pass fails: usability ≤ 6.
- Two or more sections of heading and text alone on plain ground, or no motif after the first screen:
  design ≤ 6.5.
- Nothing moves with the scroll: creativity ≤ 7.
- An invented fact: content ≤ 3, and fix it before anything else.
- A blank band where a reveal did not fire: usability ≤ 5.

## Write it down

```
ROUND n
Seen in one second: …
Idea (one sentence): …
Live thing: …
Layout words by section: hero=… / parcours=… / …
Scores: design _ · usability _ · creativity _ · content _ → overall _._
Caps applied: …
Top three problems (most visible first), each with the screenshot and the fix:
1. …
2. …
3. …
```

Name problems precisely: "the sentence starts 40px left of the name's edge", "the experience rows are
the third split in a row", "the phone hero crops the name to one line and the job falls below the fold".

## Fix in this order

1. The idea (if pass 3 fails, change the concept, not the details).
2. Hierarchy: one dominant element per screen.
3. Composition: edges, spacing, section variety, holes.
4. Typography: scale, breaks, measure.
5. Pictures. 6. Colour. 7. Details and states. 8. Motion.

Three rounds at most. Stop when a round finds nothing a stranger would notice. If round three is still
under 7.5, say so in the report with the remaining problems.

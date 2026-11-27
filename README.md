# math-flashcards

Grade 4 Math flashcards for phone review (DepEd Term 2).

Open the cards on a phone: https://kaijudon.github.io/math-flashcards/

## What is in the set

The set has 50 cards for the Grade 4 Mathematics Term 2 exam (SY 2026-2027).
The topics come from the DepEd Three-Term Budget of Work for Grade 4 Mathematics.

| Topic | Cards |
|---|---|
| Number sentences and MDAS | 10 |
| Conversion of units | 10 |
| Kinds of fractions | 5 |
| Add and subtract similar fractions | 5 |
| Dissimilar fractions | 10 |
| Equivalent fractions, factors, multiples | 10 |

## How to use it

1. Open the link in a phone browser.
2. Pick one topic or "All topics".
3. Tap an answer before the timer gets to 0:00.
   The card shows if the answer is correct, the right answer, a short explanation, and a common mistake.
4. At the end, the site shows the score.
   The phone keeps the best score for each topic.

## Practice rules (less help from AI tools)

The site cannot see other apps, so it cannot block AI tools.
It makes AI help slower and harder, and it shows the parent when it happens.

- Timer: each card has 60 seconds.
  Number sentences and MDAS cards, and conversion cards, have 90 seconds.
  When the time ends, the card counts as wrong and shows the answer.
- Leaving the app: if the app goes to the background, loses focus, or closes while a question is open, that card gives no point.
  The card shows a calm note, and the child can still answer it to practice.
- No copy: a long press, select, copy, and the context menu do not work on the quiz.
  The question and choice text is drawn by CSS from the card data, so it is not in the page text.
  Screen readers still read it, fractions included.
- Fresh numbers: 19 cards get new numbers each time they show (MDAS, unit conversions, similar fractions, equivalent fractions).
  A saved answer or a photo of an earlier run does not match the new card.
  Word problems and concept cards stay the same, so their content stays correct.
- Parent view: a log of each practice session behind a 4-digit PIN.

### What these rules cannot stop

- A second phone, tablet, or laptop with an AI tool.
- A photo of the screen taken with another device, or a screenshot sent to an AI tool.
- A person who helps the child.
- Clearing the site data in the browser settings.
  This also clears the log, so an empty log is a sign to ask about.

## Parent view

1. Open the site and tap "Parent view" at the bottom of the topic list.
2. On the first open, set a 4-digit PIN.
   Do this before the child uses the phone.
3. After that, type the PIN to see the log.

The log shows each session with the date, the topic, the score, the average time per card, the number of times the child left the app, and the number of timeouts.
Tap a session to see each card with its result and time.

The phone stores the PIN as a salted hash, not as the digits.
The PIN keeps a child out on a shared phone, but it is not strong security.
To reset a forgotten PIN, clear this site's data in the browser settings.
That also clears the best scores and the log.

The log stays on this phone only.
The site has no accounts, no backend, and no tracking.

## Files

- `cards.js` - all card questions, choices, answers, and explanations.
- `variants.js` - the number generators for the 19 cards with fresh numbers.
- `index.html`, `styles.css`, `app.js` - the site. There is no build step.
- `art.js` - Pip the owl and the topic pictures, as inline SVG.
- `log.js` - the practice log for the parent view.
- `parent.js` - the parent PIN and the log page.
- `fonts/` - the Nunito font (SIL Open Font License, see `fonts/OFL.txt`).
- `sw.js` - keeps a copy of the site so it opens offline after one visit.
- `tests/check-cards.js` - computes each answer again and compares it to the card.
- `tests/check-variants.js` - checks every number variant of every generated card.

Run both checks after you edit a card or a generator:

```sh
node tests/check-cards.js
node tests/check-variants.js
```

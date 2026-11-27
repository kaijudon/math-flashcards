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
- Practice report: the phone sends each session to a Google Sheet that the parent owns.
  See "Practice reports" below.

### What these rules cannot stop

- A second phone, tablet, or laptop with an AI tool.
- A photo of the screen taken with another device, or a screenshot sent to an AI tool.
- A person who helps the child.
- Clearing the site data in the browser settings.
  This also clears the sessions that are not sent yet.

## Practice reports

After each session, the phone sends the results to a Google Sheet that the parent owns.
The parent reads the sheet on another phone.
The child has nothing to set up, and the site has no parent page and no PIN.

The parent makes the sheet one time.
The steps are in [SETUP-PARENT.md](SETUP-PARENT.md).
Then the `/exec` link and the token word go into `config.js`.
While `REPORT_URL` in `config.js` is empty, the site sends nothing.

Each session gets one row in the "Sessions" tab.
The row has the date, the topic, the score, the average time per card, the number of times the child left the app, and the number of timeouts.
Each card gets one row in the "Cards" tab.

A session that the child stops before the end is also sent, as "Stopped at card N of M".
If the phone is offline, it keeps the sessions and sends them on the next open or when it is online again.
The sheet ignores a session that it already has, so a second send adds no rows.

The sheet gets scores and times only, with no name and no photo.
The site has no accounts and no tracking.

## Files

- `cards.js` - all card questions, choices, answers, and explanations.
- `variants.js` - the number generators for the 19 cards with fresh numbers.
- `index.html`, `styles.css`, `app.js` - the site. There is no build step.
- `art.js` - Pip the owl and the topic pictures, as inline SVG.
- `log.js` - the practice log on the phone.
- `report.js` - sends each session from the log to the parent's sheet, with an outbox for offline sessions.
- `config.js` - the sheet link (`REPORT_URL`) and the token word (`REPORT_TOKEN`).
- `apps-script/Code.gs` - the receiver that writes the rows into the Google Sheet.
- `SETUP-PARENT.md` - the parent's setup steps for the sheet.
- `fonts/` - the Nunito font (SIL Open Font License, see `fonts/OFL.txt`).
- `sw.js` - keeps a copy of the site so it opens offline after one visit.
- `tests/check-cards.js` - computes each answer again and compares it to the card.
- `tests/check-variants.js` - checks every number variant of every generated card.
- `tests/check-report.js` - checks the report body and the outbox with a fake fetch.
- `tests/check-apps-script.js` - runs `Code.gs` with a small Google Sheets stand-in (`tests/apps-script-mock.js`).

Run all the checks after you edit a card, a generator, or the report:

```sh
node tests/check-cards.js
node tests/check-variants.js
node tests/check-report.js
node tests/check-apps-script.js
```

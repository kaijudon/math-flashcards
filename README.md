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
3. Tap an answer.
   The card shows if the answer is correct, the right answer, a short explanation, and a common mistake.
4. At the end, the site shows the score.
   The phone keeps the best score for each topic.

## Files

- `cards.js` - all card questions, choices, answers, and explanations.
- `index.html`, `styles.css`, `app.js` - the site. There is no build step.
- `sw.js` - keeps a copy of the site so it opens offline after one visit.
- `tests/check-cards.js` - computes each answer again and compares it to the card.

Run the check after you edit a card:

```sh
node tests/check-cards.js
```

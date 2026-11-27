// Grade 4 Mathematics, DepEd Term 2 (SY 2026-2027) flashcards.
// Source: DepEd Three-Term Budget of Work, Grade 4 Mathematics, Term 2.
//
// Fraction markup: {3/4} is a fraction, {2 1/4} is a mixed number.
// The app renders these as stacked fractions.
// `answer` is the index of the correct choice.
// Run `node tests/check-cards.js` after any edit to re-check every answer.
// Cards with a generator in variants.js show fresh numbers in the app.
// For those cards, the numbers here are the base set, and
// tests/check-variants.js checks that the generator gives this card.

window.TOPICS = [
  { id: "T1", title: "Number sentences and MDAS" },
  { id: "T2", title: "Conversion of units" },
  { id: "T3", title: "Kinds of fractions" },
  { id: "T4", title: "Add and subtract similar fractions" },
  { id: "T5", title: "Dissimilar fractions" },
  { id: "T6", title: "Equivalent fractions, factors, multiples" }
];

window.CARDS = [
  // T1 - Number sentences and MDAS
  {
    id: "T1-1", topic: "T1",
    q: "8 + 4 × 3 = ?",
    choices: ["36", "20", "15", "24"], answer: 1,
    explain: "Multiply first: 4 × 3 = 12. Then add: 8 + 12 = 20.",
    mistake: "Going left to right gives 12 × 3 = 36. Do × and ÷ before + and −."
  },
  {
    id: "T1-4", topic: "T1",
    q: "24 ÷ 6 × 2 = ?",
    choices: ["2", "12", "8", "4"], answer: 2,
    explain: "× and ÷ have the same rank, so go left to right: 24 ÷ 6 = 4, then 4 × 2 = 8.",
    mistake: "Doing × before ÷ gives 24 ÷ 12 = 2. Go left to right."
  },
  {
    id: "T1-5", topic: "T1",
    q: "100 − 20 + 15 = ?",
    choices: ["95", "65", "105", "85"], answer: 0,
    explain: "+ and − have the same rank, so go left to right: 100 − 20 = 80, then 80 + 15 = 95.",
    mistake: "Adding first gives 100 − 35 = 65. Go left to right."
  },
  {
    id: "T1-6", topic: "T1",
    q: "7 × 8 − 48 ÷ 6 = ?",
    choices: ["8", "64", "42", "48"], answer: 3,
    explain: "Do × and ÷ first: 7 × 8 = 56 and 48 ÷ 6 = 8. Then subtract: 56 − 8 = 48.",
    mistake: "Subtracting first gives 56 − 48 = 8. Do × and ÷ first."
  },
  {
    id: "T1-7", topic: "T1",
    q: "9 + 27 ÷ 3 × 2 = ?",
    choices: ["24", "27", "18", "15"], answer: 1,
    explain: "Do ÷ and × first, left to right: 27 ÷ 3 = 9, then 9 × 2 = 18. Then add: 9 + 18 = 27.",
    mistake: "Adding first gives 36 ÷ 3 × 2 = 24. Do × and ÷ before +."
  },
  {
    id: "T1-8", topic: "T1",
    q: "45 − 15 ÷ 3 + 2 × 4 = ?",
    choices: ["32", "40", "48", "52"], answer: 2,
    explain: "Do ÷ and × first: 15 ÷ 3 = 5 and 2 × 4 = 8. Then go left to right: 45 − 5 + 8 = 48.",
    mistake: "Doing + before − gives 45 − 13 = 32. Do + and − from left to right."
  },
  {
    id: "T1-9", topic: "T1",
    q: "In 18 − 6 ÷ 2, which operation do you do first? What is the answer?",
    choices: [
      "Subtraction first. The answer is 6.",
      "Division first. The answer is 6.",
      "Subtraction first. The answer is 15.",
      "Division first. The answer is 15."
    ], answer: 3,
    explain: "Division comes before subtraction: 6 ÷ 2 = 3. Then 18 − 3 = 15.",
    mistake: "Subtracting first gives 12 ÷ 2 = 6."
  },
  {
    id: "T1-10", topic: "T1",
    q: "Ana buys 3 notebooks at ₱25 each. She pays with ₱100. Which number sentence gives her change?",
    choices: ["100 − 3 × 25 = ₱25", "100 − 25 = ₱75", "3 × 25 = ₱75", "100 + 3 × 25 = ₱175"], answer: 0,
    explain: "The notebooks cost 3 × 25 = ₱75. Her change is 100 − 75 = ₱25.",
    mistake: "₱75 is the cost of the notebooks, not the change. Take the cost away from ₱100."
  },
  {
    id: "T1-11", topic: "T1",
    q: "Mang Jose has 4 trays of eggs with 30 eggs on each tray. 15 eggs break. How many eggs are left?",
    choices: ["4 + 30 − 15 = 19 eggs", "4 × 30 + 15 = 135 eggs", "4 × 30 − 15 = 105 eggs", "30 − 15 = 15 eggs"], answer: 2,
    explain: "All the eggs: 4 × 30 = 120. Take away the broken eggs: 120 − 15 = 105.",
    mistake: "Broken eggs are taken away, so use −, not +. Use all 4 trays, not only 1."
  },
  {
    id: "T1-12", topic: "T1",
    q: "Nena has ₱500. She buys 2 kg of rice at ₱52 per kilo and one bottle of cooking oil for ₱75. How much money is left?",
    choices: ["₱373", "₱321", "₱396", "₱179"], answer: 1,
    explain: "Rice: 2 × 52 = ₱104. Then 500 − 104 − 75 = ₱321.",
    mistake: "₱373 forgets the second kilo of rice. Count every item."
  },

  // T2 - Conversion of units
  {
    id: "T2-2", topic: "T2",
    q: "450 cm = ___ m ___ cm",
    choices: ["45 m", "4 m 50 cm", "4 m 5 cm", "40 m 50 cm"], answer: 1,
    explain: "100 cm = 1 m. 450 cm = 400 cm + 50 cm = 4 m 50 cm.",
    mistake: "There are 100 cm in 1 m, not 10."
  },
  {
    id: "T2-3", topic: "T2",
    q: "2 km = ___ m",
    choices: ["200 m", "20 m", "2 000 m", "20 000 m"], answer: 2,
    explain: "1 km = 1 000 m. So 2 km = 2 × 1 000 = 2 000 m.",
    mistake: "1 km is 1 000 m, not 100 m."
  },
  {
    id: "T2-4", topic: "T2",
    q: "3 kg = ___ g",
    choices: ["3 000 g", "300 g", "30 g", "30 000 g"], answer: 0,
    explain: "1 kg = 1 000 g. So 3 kg = 3 × 1 000 = 3 000 g.",
    mistake: "1 kg is 1 000 g, not 100 g. Big unit to small unit: multiply."
  },
  {
    id: "T2-6", topic: "T2",
    q: "2 500 mL = ___ L ___ mL",
    choices: ["25 L", "2 L 50 mL", "250 L", "2 L 500 mL"], answer: 3,
    explain: "1 000 mL = 1 L. 2 500 mL = 2 000 mL + 500 mL = 2 L 500 mL.",
    mistake: "1 L is 1 000 mL, not 100 mL."
  },
  {
    id: "T2-7", topic: "T2",
    q: "3 minutes = ___ seconds",
    choices: ["300 seconds", "180 seconds", "63 seconds", "30 seconds"], answer: 1,
    explain: "1 minute = 60 seconds. So 3 minutes = 3 × 60 = 180 seconds.",
    mistake: "Time does not use 100. 1 minute is 60 seconds."
  },
  {
    id: "T2-8", topic: "T2",
    q: "240 minutes = ___ hours",
    choices: ["24 hours", "2 hours", "4 hours", "6 hours"], answer: 2,
    explain: "60 minutes = 1 hour. Small unit to big unit: divide. 240 ÷ 60 = 4 hours.",
    mistake: "1 hour is 60 minutes, not 100 minutes."
  },
  {
    id: "T2-9", topic: "T2",
    q: "3 days = ___ hours",
    choices: ["72 hours", "36 hours", "24 hours", "60 hours"], answer: 0,
    explain: "1 day = 24 hours. So 3 days = 3 × 24 = 72 hours.",
    mistake: "1 day is 24 hours, not 12. Big unit to small unit: multiply."
  },
  {
    id: "T2-11", topic: "T2",
    q: "Classes start at 7:30 a.m. and end at 11:45 a.m. How long are classes?",
    choices: ["4 hours 45 minutes", "3 hours 15 minutes", "5 hours 15 minutes", "4 hours 15 minutes"], answer: 3,
    explain: "7:30 to 11:30 is 4 hours. 11:30 to 11:45 is 15 minutes. Total: 4 hours 15 minutes.",
    mistake: "Count hours and minutes apart. A clock time is not a plain number like 4.15."
  },
  {
    id: "T2-12", topic: "T2",
    q: "A jeepney leaves at 2:40 p.m. The trip takes 1 hour 35 minutes. What time does it arrive?",
    choices: ["3:75 p.m.", "4:15 p.m.", "4:05 p.m.", "3:15 p.m."], answer: 1,
    explain: "2:40 + 1 hour = 3:40. 3:40 + 20 minutes = 4:00. 4:00 + 15 minutes = 4:15 p.m.",
    mistake: "There is no 3:75. 75 minutes is 1 hour 15 minutes, so carry 1 hour."
  },
  {
    id: "T2-13", topic: "T2",
    q: "A pitcher holds 2 L of buko juice. Each glass holds 250 mL. How many glasses can you fill?",
    choices: ["4 glasses", "6 glasses", "8 glasses", "10 glasses"], answer: 2,
    explain: "2 L = 2 000 mL. 2 000 ÷ 250 = 8 glasses.",
    mistake: "Change L to mL first: 2 L is 2 000 mL."
  },

  // T3 - Kinds of fractions and the number line
  {
    id: "T3-1", topic: "T3",
    q: "What kind of fraction is {7/4}?",
    choices: ["Proper fraction", "Improper fraction", "Mixed number", "Whole number"], answer: 1,
    explain: "The numerator 7 is bigger than the denominator 4, so {7/4} is an improper fraction.",
    mistake: "Small numbers do not make a proper fraction. Check if the top is bigger than the bottom."
  },
  {
    id: "T3-2", topic: "T3",
    q: "Which one is a proper fraction?",
    choices: ["{5/3}", "{1 2/3}", "{9/8}", "{3/5}"], answer: 3,
    explain: "In a proper fraction, the numerator is smaller than the denominator. In {3/5}, 3 is smaller than 5.",
    mistake: "{5/3} and {9/8} are improper. {1 2/3} is a mixed number."
  },
  {
    id: "T3-3", topic: "T3",
    q: "Write {9/4} as a mixed number.",
    choices: ["{2 1/4}", "{2/4}", "{3 1/4}", "{2 1/9}"], answer: 0,
    explain: "9 ÷ 4 = 2 remainder 1. The 2 is the whole number. The remainder 1 is the new numerator: {2 1/4}.",
    mistake: "Do not lose the remainder. Keep the same denominator, 4."
  },
  {
    id: "T3-4", topic: "T3",
    q: "Write {3 2/5} as an improper fraction.",
    choices: ["{10/5}", "{13/5}", "{17/5}", "{32/5}"], answer: 2,
    explain: "Multiply, then add: 3 × 5 + 2 = 17. Keep the denominator: {17/5}.",
    mistake: "Adding 3 + 5 + 2 = 10 is wrong. Multiply the whole number by the denominator first."
  },
  {
    id: "T3-6", topic: "T3",
    q: "A number line from 0 to 2 has a mark for every fourth. Where is {5/4}?",
    choices: [
      "Between 0 and 1, one mark before 1",
      "Between 1 and 2, one mark after 1",
      "Between 1 and 2, one mark before 2",
      "Exactly at 2"
    ], answer: 1,
    explain: "{4/4} = 1. So {5/4} is one more fourth after 1. That is {1 1/4}.",
    mistake: "Count the spaces from 0, not the marks."
  },

  // T4 - Add and subtract similar fractions
  {
    id: "T4-1", topic: "T4",
    q: "{2/7} + {3/7} = ?",
    choices: ["{5/14}", "{6/7}", "{5/7}", "{1/7}"], answer: 2,
    explain: "The denominators are the same. Add only the numerators: 2 + 3 = 5. Keep the 7: {5/7}.",
    mistake: "Do not add the denominators. {5/14} is wrong."
  },
  {
    id: "T4-3", topic: "T4",
    q: "{1 2/5} + {2 1/5} = ?",
    choices: ["{3 3/5}", "{3 3/10}", "{3 1/5}", "{4 3/5}"], answer: 0,
    explain: "Add the whole numbers: 1 + 2 = 3. Add the fractions: {2/5} + {1/5} = {3/5}. Answer: {3 3/5}.",
    mistake: "Add both parts: the whole numbers and the fractions. Do not add the denominators."
  },
  {
    id: "T4-4", topic: "T4",
    q: "{2 3/8} − {1/8} = ?",
    choices: ["{2 4/8}", "{1 2/8}", "{1 1/4}", "{2 2/8} = {2 1/4}"], answer: 3,
    explain: "Subtract the fractions: {3/8} − {1/8} = {2/8}. Keep the 2. {2 2/8} in simplest form is {2 1/4}.",
    mistake: "There is no whole number to take away, so the 2 stays."
  },
  {
    id: "T4-6", topic: "T4",
    q: "3 − {1/4} = ?",
    choices: ["{3 1/4}", "{2 3/4}", "{2 1/4}", "{3 3/4}"], answer: 1,
    explain: "Rename 3 as {2 4/4}. Then {2 4/4} − {1/4} = {2 3/4}.",
    mistake: "Taking away makes the number smaller, so {3 1/4} is wrong. Rename 3 as {2 4/4} first."
  },
  {
    id: "T4-7", topic: "T4",
    q: "Mia eats {3/8} of a bibingka. Ben eats {2/8} of the same bibingka. What part is left?",
    choices: ["{5/8}", "{1/8}", "{5/16}", "{3/8}"], answer: 3,
    explain: "They eat {3/8} + {2/8} = {5/8}. The whole bibingka is {8/8}. Left: {8/8} − {5/8} = {3/8}.",
    mistake: "{5/8} is the part they ate. The question asks for the part that is left."
  },

  // T5 - Dissimilar fractions: models, compare, order
  {
    id: "T5-1", topic: "T5",
    q: "Which is bigger: {1/3} or {1/5}?",
    choices: ["{1/5}", "{1/3}", "They are equal"], answer: 1,
    explain: "A pie cut into 3 parts has bigger slices than a pie cut into 5 parts. So {1/3} is bigger.",
    mistake: "A bigger denominator means smaller pieces, not a bigger fraction."
  },
  {
    id: "T5-2", topic: "T5",
    q: "Which sign goes in the blank? {2/3} ___ {3/4}",
    choices: [">", "<", "="], answer: 1,
    explain: "Use 12 as the same denominator: {2/3} = {8/12} and {3/4} = {9/12}. 8 < 9, so {2/3} < {3/4}.",
    mistake: "Make the denominators the same before you compare."
  },
  {
    id: "T5-3", topic: "T5",
    q: "Which sign goes in the blank? {1/2} ___ {3/6}",
    choices: [">", "<", "="], answer: 2,
    explain: "{1/2} = {3/6} because 1 × 3 = 3 and 2 × 3 = 6. They are equal.",
    mistake: "Different numbers can show the same amount."
  },
  {
    id: "T5-5", topic: "T5",
    q: "Which sign goes in the blank? {3/5} ___ {7/10}",
    choices: ["<", ">", "="], answer: 0,
    explain: "{3/5} = {6/10}. 6 < 7, so {3/5} < {7/10}.",
    mistake: "Change {3/5} to tenths first. Then compare the numerators."
  },
  {
    id: "T5-6", topic: "T5",
    q: "Order from smallest to largest: {1/2}, {1/4}, {1/8}",
    choices: ["{1/2}, {1/4}, {1/8}", "{1/4}, {1/8}, {1/2}", "{1/8}, {1/4}, {1/2}", "{1/2}, {1/8}, {1/4}"], answer: 2,
    explain: "All the numerators are 1. More parts means smaller parts, so {1/8} is smallest and {1/2} is largest.",
    mistake: "A bigger denominator means a smaller fraction when the numerators are the same."
  },
  {
    id: "T5-7", topic: "T5",
    q: "Order from largest to smallest: {2/3}, {1/2}, {5/6}",
    choices: ["{1/2}, {2/3}, {5/6}", "{5/6}, {2/3}, {1/2}", "{2/3}, {5/6}, {1/2}", "{5/6}, {1/2}, {2/3}"], answer: 1,
    explain: "Use sixths: {2/3} = {4/6}, {1/2} = {3/6}, {5/6} = {5/6}. Largest to smallest: {5/6}, {2/3}, {1/2}.",
    mistake: "Read the question. Largest to smallest is the reverse of smallest to largest."
  },
  {
    id: "T5-8", topic: "T5",
    q: "Order from smallest to largest: {3/4}, {2/5}, {7/10}",
    choices: ["{3/4}, {2/5}, {7/10}", "{7/10}, {3/4}, {2/5}", "{2/5}, {3/4}, {7/10}", "{2/5}, {7/10}, {3/4}"], answer: 3,
    explain: "Use twentieths: {3/4} = {15/20}, {2/5} = {8/20}, {7/10} = {14/20}. So {2/5}, {7/10}, {3/4}.",
    mistake: "Do not order by the denominators only. Make the denominators the same first."
  },
  {
    id: "T5-9", topic: "T5",
    q: "Carlo eats {3/8} of a pizza. Joy eats {1/4} of a pizza of the same size. Who eats more?",
    choices: ["Joy", "They eat the same", "Carlo"], answer: 2,
    explain: "{1/4} = {2/8}. {3/8} > {2/8}, so Carlo eats more.",
    mistake: "Change {1/4} to eighths before you compare."
  },
  {
    id: "T5-10", topic: "T5",
    q: "Lea runs {3/4} km. Jun runs {5/8} km. Who runs farther?",
    choices: ["Lea", "Jun", "They run the same distance"], answer: 0,
    explain: "{3/4} = {6/8}. {6/8} > {5/8}, so Lea runs farther.",
    mistake: "A bigger numerator alone does not mean a bigger fraction. Make the denominators the same first."
  },
  {
    id: "T5-11", topic: "T5",
    q: "A bar is cut into 4 equal parts and 2 parts are shaded. The same bar is cut into 8 equal parts. How many parts must you shade to show the same amount?",
    choices: ["2 parts", "6 parts", "8 parts", "4 parts"], answer: 3,
    explain: "{2/4} = {4/8}. Each fourth becomes 2 eighths, so 2 fourths become 4 eighths.",
    mistake: "Smaller parts mean you need more of them to shade the same amount."
  },

  // T6 - Equivalent fractions, multiples, factors, simplest form
  {
    id: "T6-1", topic: "T6",
    q: "{1/3} = {?/12}",
    choices: ["3", "4", "9", "12"], answer: 1,
    explain: "3 × 4 = 12, so multiply the numerator by 4 too: 1 × 4 = 4. {1/3} = {4/12}.",
    mistake: "Do the same thing to the top and the bottom."
  },
  {
    id: "T6-2", topic: "T6",
    q: "{2/5} = {6/?}",
    choices: ["9", "10", "15", "30"], answer: 2,
    explain: "2 × 3 = 6, so multiply the denominator by 3 too: 5 × 3 = 15. {2/5} = {6/15}.",
    mistake: "Adding 4 to both parts gives {6/9}, which is wrong. Multiply, do not add."
  },
  {
    id: "T6-3", topic: "T6",
    q: "Which one is NOT equal to {1/2}?",
    choices: ["{2/4}", "{4/6}", "{3/6}", "{5/10}"], answer: 1,
    explain: "Half of 6 is 3, so {1/2} = {3/6}, not {4/6}. The others are all one half.",
    mistake: "Check each one: is the numerator half of the denominator?"
  },
  {
    id: "T6-4", topic: "T6",
    q: "What are the first five multiples of 6?",
    choices: ["1, 2, 3, 6", "6, 12, 18, 24, 30", "6, 11, 16, 21, 26", "12, 18, 24, 30, 36"], answer: 1,
    explain: "Multiply 6 by 1, 2, 3, 4, and 5: 6, 12, 18, 24, 30.",
    mistake: "1, 2, 3, 6 are the factors of 6, not the multiples. The first multiple is the number itself."
  },
  {
    id: "T6-6", topic: "T6",
    q: "Which number is a multiple of 9?",
    choices: ["28", "42", "49", "36"], answer: 3,
    explain: "9 × 4 = 36, so 36 is a multiple of 9.",
    mistake: "Say the 9 times table: 9, 18, 27, 36, 45. 28, 42, and 49 are not on it."
  },
  {
    id: "T6-7", topic: "T6",
    q: "What are all the factors of 12?",
    choices: ["1, 2, 3, 4, 6, 12", "12, 24, 36, 48", "2, 3, 4, 6", "1, 2, 4, 6, 12"], answer: 0,
    explain: "Find the pairs that make 12: 1 × 12, 2 × 6, 3 × 4. Factors: 1, 2, 3, 4, 6, 12.",
    mistake: "12, 24, 36 are multiples, not factors. Do not forget 1 and 12."
  },
  {
    id: "T6-8", topic: "T6",
    q: "What are all the factors of 30?",
    choices: ["1, 2, 3, 10, 15, 30", "2, 3, 5, 6, 10, 15", "1, 2, 3, 5, 6, 10, 15, 30", "30, 60, 90, 120"], answer: 2,
    explain: "Pairs that make 30: 1 × 30, 2 × 15, 3 × 10, 5 × 6. Factors: 1, 2, 3, 5, 6, 10, 15, 30.",
    mistake: "Do not miss a pair like 5 × 6. Do not forget 1 and 30."
  },
  {
    id: "T6-10", topic: "T6",
    q: "Write {6/8} in simplest form.",
    choices: ["{3/8}", "{3/4}", "{12/16}", "{2/3}"], answer: 1,
    explain: "2 divides both 6 and 8: 6 ÷ 2 = 3 and 8 ÷ 2 = 4. So {6/8} = {3/4}.",
    mistake: "Divide the top and the bottom by the same number. {12/16} is equal but not simpler."
  },
  {
    id: "T6-11", topic: "T6",
    q: "Write {12/18} in simplest form.",
    choices: ["{6/9}", "{4/6}", "{3/4}", "{2/3}"], answer: 3,
    explain: "6 divides both 12 and 18: 12 ÷ 6 = 2 and 18 ÷ 6 = 3. So {12/18} = {2/3}.",
    mistake: "{6/9} and {4/6} are not finished. Keep dividing until no number except 1 divides both."
  },
  {
    id: "T6-12", topic: "T6",
    q: "In a group of 20 pupils, 8 wear eyeglasses. What fraction wear eyeglasses, in simplest form?",
    choices: ["{8/20}", "{3/5}", "{2/5}", "{4/10}"], answer: 2,
    explain: "8 of 20 is {8/20}. 4 divides both: 8 ÷ 4 = 2 and 20 ÷ 4 = 5. So {2/5}.",
    mistake: "{8/20} and {4/10} are not in simplest form. {3/5} is the part with no eyeglasses."
  }
];

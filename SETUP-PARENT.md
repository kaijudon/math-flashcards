# Parent setup: practice reports in a Google Sheet

After each practice session, the child's phone sends the results to a Google Sheet that you own.
You read the sheet on your own phone.
The child has nothing to set up.

The sheet gets the score, the time per card, the number of times the child left the app, and the timeouts.
It gets no name and no photo.

Do these steps one time.
A laptop is easiest.
On a phone, open the pages in Chrome and turn on "Desktop site" in the Chrome menu.

1. Open https://sheets.google.com, sign in, and make a "Blank spreadsheet".
   Give it a name, for example "Math practice".
2. In the sheet, click **Extensions > Apps Script**.
   A new tab opens with a file named `Code.gs`.
3. Delete all the text in `Code.gs`.
   Open https://github.com/kaijudon/math-flashcards/blob/main/apps-script/Code.gs, click the **Copy raw file** button, and paste the text into `Code.gs`.
4. Find the line `var TOKEN = "";`.
   Type a random word of your own between the quotes, for example `var TOKEN = "owl-7342-mango";`.
   Click the **Save project** button (the disk icon).
5. Click **Deploy > New deployment**.
6. Click the gear icon next to **Select type**, then click **Web app**.
7. Set **Execute as** to **Me**, and set **Who has access** to **Anyone**.
   Click **Deploy**.
8. Click **Authorize access** and pick your Google account.
   If Google shows "Google hasn't verified this app", click **Advanced**, then **Go to Untitled project (unsafe)**.
   This is your own script, so this is safe.
   Click **Allow**.
9. Under **Web app**, click **Copy** to copy the link that ends in `/exec`.
   Click **Done**.
10. Open that link in a new tab to test it.
    The page shows `{"ok":true,"service":"math-flashcards"}`.
11. Send the `/exec` link and your token word to firstmate.
    Firstmate puts both into `config.js` on the site.

After the next practice session, the sheet has two new tabs:

- **Sessions** - one row for each session: the date and time (Philippine time), the topic, the score, the percent, the times the child left the app, the timeouts, and the time per card.
  "Stopped at card 3 of 10" means that the child stopped before the end.
- **Cards** - one row for each card: right or wrong, left the app, timed out, and the seconds.

To read the sheet on your phone, open it in the Google Sheets app.

## Good to know

- "Who has access: Anyone" lets anyone with the link send a row to the sheet.
  It does not let anyone read the sheet.
  The sheet stays private to your Google account.
- The token word is in `config.js`, which is public.
  It stops random posts, but it is not a password.
- If the phone is offline, it keeps the sessions and sends them when it is online again.
  A session that is sent two times shows one time in the sheet.
- If you change `Code.gs` later, click **Deploy > Manage deployments**, click the pencil icon, set **Version** to **New version**, and click **Deploy**.
  The link stays the same.

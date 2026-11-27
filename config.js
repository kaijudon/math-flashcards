// Where the phone sends each practice session. See SETUP-PARENT.md.
//
// REPORT_URL is the Google Apps Script web app link that ends in /exec.
// REPORT_TOKEN is the same random word that is set in apps-script/Code.gs.
// This file is public, so the token only stops random posts. It is not a password.
// When REPORT_URL is empty, the site works as usual and sends nothing.
window.MF_CONFIG = {
  REPORT_URL: "",
  REPORT_TOKEN: ""
};

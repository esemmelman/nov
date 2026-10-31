# My ballot

Personal voting worksheet transcribed from four user-provided ballot photos (Orange County, precinct 32171, November 3, 2026). Contains 46 contests and measures. Measure descriptions are summaries of the photos, not independent verification of election information. Does not cast or submit a vote.

Open https://esemmelman.github.io/nov/ and create a passphrase (10 characters minimum; a long unique passphrase is recommended). Choices are saved only in browser localStorage, encrypted with AES-256-GCM using a PBKDF2-SHA-256 key (600,000 iterations, random 16-byte salt, random 12-byte IV per save). No passcode, key, or plaintext choices are stored. No analytics, external scripts, or network submission. Locks after five minutes without interaction or when hidden.

The application and question list are public. Encryption protects stored choices, not the public website itself. Short or predictable passphrases can be guessed offline. There is no passphrase recovery. Browser extensions, compromised devices, and modified application code can access choices while unlocked. GitHub Pages serves the static app over HTTPS.

Use Download encrypted backup to move between devices. Restore on another device by creating a temporary ballot, then selecting Restore encrypted backup and unlocking with the backup's original passphrase. Backups replace local choices. Clearing browser data without a backup loses saved choices.

Buildless HTML/CSS/JavaScript; no dependencies. Serve locally with `python -m http.server 8080`. GitHub Pages publishes the repository root on main.

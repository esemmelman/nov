# My ballot

Personal voting worksheet transcribed from four user-provided ballot photos (Orange County, precinct 32171, November 3, 2026). Contains 46 contests and measures. Measure descriptions are summaries of the photos, not independent verification of election information. Does not cast or submit a vote.

Open https://esemmelman.github.io/nov/ and create a passphrase (10 characters minimum; a long unique passphrase is recommended). Choices are saved in browser localStorage, encrypted with AES-256-GCM using a PBKDF2-SHA-256 key (600,000 iterations, random 16-byte salt, random 12-byte IV per save). No passcode, encryption key, or plaintext choices are stored. No analytics or external scripts. Optional encrypted cloud sync uses an isolated Supabase Edge Function and table. Locks after five minutes without interaction or when hidden.

The application and question list are public. Encryption protects stored choices, not the public website itself. Short or predictable passphrases can be guessed offline. There is no passphrase recovery. Browser extensions, compromised devices, and modified application code can access choices while unlocked. GitHub Pages serves the static app over HTTPS.

Use Download encrypted backup to move between devices. Restore on another device by creating a temporary ballot, then selecting Restore encrypted backup and unlocking with the backup's original passphrase. Backups replace local choices. Clearing browser data without a backup loses saved choices.

Buildless HTML/CSS/JavaScript; no dependencies. Serve locally with `python -m http.server 8080`. GitHub Pages publishes the repository root on main.

## Cross-device sync

1. Unlock your ballot on the first device and select **Enable sync / Show code**.
2. On another device, open the site, expand **Connect this device to an existing ballot**, enter the private sync code, and enter the original passcode in the passcode field above. Choose **Connect existing ballot**, then unlock.
3. Saves sync automatically; unlocked visible devices check for changes every 10 seconds. **Sync now** checks immediately. Offline edits remain encrypted locally and retry when connectivity returns or the ballot is unlocked. Keep the tab open until it says synced before switching devices.

Conflicting edits are never silently overwritten. A stale write is rejected. Download a backup of local choices if desired, then choose **Load newer cloud choices** to replace them with the cloud ballot. Restore from a backup disconnects sync so it cannot overwrite the cloud ballot accidentally.

The random 256-bit sync code is a bearer credential: keep it private. It is stored locally for automatic syncing and sent in a request header, never a URL. Only its namespaced SHA-256 hash is stored in Supabase, alongside AES-GCM ciphertext and a revision. Possession grants read/write access to ciphertext; the original passphrase is separately required to decrypt. No service credentials appear in frontend files. Pairing codes cannot be recovered from the server.

Project: bnaimitzvah (`fgomaujsdblpzxhnnqrg`). Isolated table: `public.nov_ballot_2026_vaults_v1`; endpoint: `nov-ballot-2026-sync-v1`. RLS is enabled with no browser-role grants or policies: only the capability-authenticated Edge Function accesses rows via the server-only service role. Revision-conditional PATCH prevents concurrent lost updates. Existing tables, functions, auth settings, and storage buckets are unchanged.

Run `node sync.test.cjs` for a live integration test using disposable encrypted data. It prints the test row hash for cleanup by an administrator; no private token is logged. Run `node client.test.cjs` to check client-side sync behavior with isolated fake browser contexts.

# WA 14 Curriculum & Calendar — deployment guide

This is the same tool you've been using inside Claude, adapted to run as a
real, free, standalone website — hosted on GitHub Pages, with data stored in
a free Firebase (Firestore) database instead of Claude's artifact storage.

Total cost: **$0**, using free tiers of GitHub and Firebase. No credit card
required for either at this scale.

---

## Part 1 — Set up the free database (Firebase)

1. Go to https://console.firebase.google.com and sign in with any Google
   account. Click **Add project**, give it a name (e.g. `wa14-calendar`),
   and finish the wizard (you can skip Google Analytics).
2. Once inside the project, click the **`</>`** (web app) icon on the
   project overview page to register a new web app. Give it any nickname.
   You do **not** need Firebase Hosting — skip that checkbox.
3. Firebase will show you a `firebaseConfig` object with your keys. Copy it.
4. Open `src/firebaseConfig.js` in this project and paste your values in,
   replacing the `REPLACE_ME` placeholders.
5. In the left sidebar, go to **Build → Firestore Database → Create
   database**. Choose **Start in production mode**, pick any region close to
   Bangladesh (e.g. `asia-south1`), and click Enable.
6. Go to the **Rules** tab of Firestore, delete what's there, and paste in
   the contents of `firestore.rules` from this project. Click **Publish**.

That's your database ready — no server to run, no hosting bill.

---

## Part 2 — Put the code on GitHub

1. Go to https://github.com/new and create a new repository (e.g.
   `wa14-curriculum-calendar`). Keep it **Public** (GitHub Pages' free tier
   requires a public repo, unless your org has GitHub Pro/Team/Enterprise).
2. On your computer (or GitHub Codespaces / GitHub's own web upload), get
   this project's files into that repo. Simplest path if you're not
   comfortable with git:
   - On the new repo's page, click **uploading an existing file**, and drag
     in every file/folder from this project (keeping the folder structure —
     `src/`, `.github/workflows/`, etc.)
   - Or, from a terminal, in this project folder:
     ```bash
     git init
     git remote add origin https://github.com/<your-username>/wa14-curriculum-calendar.git
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git push -u origin main
     ```
3. **Before pushing**, open `vite.config.js` and make sure the `base` value
   matches your repo name exactly, e.g. `/wa14-curriculum-calendar/`.

---

## Part 3 — Turn on GitHub Pages (this launches the site)

1. In your repo, go to **Settings → Pages**.
2. Under "Build and deployment", set **Source** to **GitHub Actions**.
3. Push to the `main` branch (or re-run the workflow manually from the
   **Actions** tab) — this project already includes
   `.github/workflows/deploy.yml`, which builds the app and publishes it
   automatically on every push.
4. After the workflow finishes (watch it under the **Actions** tab, ~1–2
   minutes), your site will be live at:
   ```
   https://<your-username>.github.io/wa14-curriculum-calendar/
   ```
   That URL is what you share with planners, staff, and Fellows.

---

## Part 4 — First login

Open the URL above and sign in with `mehdi@teachforbangladesh.org` — that's
the built-in Superadmin. From there, use the **Planners** tab to add other
planning-team members, and the **Fellows** tab to build the Fellow roster.

Everyone else just needs the URL — Staff (`name@teachforbangladesh.org`) get
read-only access automatically, and Fellows once they're added to the
roster.

---

## Updating the app later

Whenever you want to change the app itself (not the calendar data — that's
edited live in the app), edit the files in `src/` and push to `main` again.
The GitHub Action rebuilds and republishes automatically each time.

## Known limitations (same as the Claude-hosted version)

- **No real authentication.** Login is a client-side pattern check
  (email format + roster membership), not a password or verified identity.
  It stops casual/accidental access, not someone determined to poke at the
  source code or the Firestore project directly. If that ever needs to be
  airtight, the next step is adding Firebase Authentication with email
  verification — a bigger change, ask me if you want it done.
- **Firestore rules are open** to anyone who has your project's config
  (visible in the deployed JS bundle) — see the comment in
  `firestore.rules` for why, and the upgrade path if you need it locked
  down further.

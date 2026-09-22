This is Winter Academy 14's calendar and curriculum tool.

## Local setup

```bash
npm ci
npm run dev
```

During local development only, the sign-in screen includes **Test superuser** and **Test Fellow** buttons. These identities are stored in local browser storage and are removed from production builds. They are useful for checking role-based layouts and workflows, but they do not bypass Firestore security rules; use an authenticated Firebase account when testing live data reads and writes.

The app uses Firebase Authentication and Cloud Firestore. The Firebase web configuration is public client configuration and is bundled into the browser app; it must not be treated as a secret. Restrict the Firebase API key to the production domain and enable only the APIs this project uses.

## Firebase setup

1. Keep the project on the no-cost Spark plan unless paid Google Cloud services are required.
2. In Firebase Console, enable **Authentication > Sign-in method > Google**.
3. Add the GitHub Pages domain to Firebase Authentication's authorized domains.
4. Publish `firestore.rules` before deploying the frontend. The rules require a verified `@teachforbangladesh.org` Google account and limit writes by role.
5. Confirm Firestore usage stays within the Spark quota: 50,000 reads/day, 20,000 writes/day, 20,000 deletes/day, 1 GiB storage, and 10 GiB/month outbound transfer.

The current rules include a temporary transition bridge for the existing planning-team email addresses. Replace that bridge with Firebase custom claims managed by a trusted administrator before adding more privileged users. Never restore password or PIN authentication in the browser.

## Assessments and attendance

Staff can create session-linked assessments with single-choice, multiple-choice, check, and paragraph questions; each choice option has a stable ID so changing its text does not change its answer key. Paragraph questions support a rubric and expected concepts. Fellows receive active assigned assessments with persisted answers; paragraph responses are submitted as pending staff review.

The local development login includes demo controls for 10 Fellows, 5 sessions, 5 assessments, and demo questions. Demo records are prefixed with `DEMO` and can be removed from the Staff analytics view.

Question images accept a public image URL or common Google Drive share links, which are normalized to Drive's view endpoint. Drive files must be shared as **Anyone with the link → Viewer**. The Fellow experience displays the image above the question prompt. Do not store base64 images in Firestore.

Staff can use the **Review** tab to score paragraph responses, add feedback, and record the reviewer/date. An optional Google Apps Script AI proxy can provide a suggested score and feedback, but a staff member must approve and save the final score. Set `AI_SUGGEST_ENDPOINT` in `src/App.jsx` only to the deployed proxy URL; keep any model API key in Apps Script. Exports include answers, reviews, and AI suggestions.

The initial assessment persistence uses aggregate documents for compatibility with the existing app. It is suitable for local/demo testing, but production assessment use still requires stricter per-Fellow Firestore rules, server-authoritative grading/timing, protected answer keys, and per-record response storage.

## City system (year-round fellowship calendar)

The app hosts two Training Systems: **Winter Academy** (the 6–7 week academy calendar, sessions and assessments) and **City** (the year-round fellowship calendar of programming spaces, tasks and deadlines). Staff whose Training Systems include both get the picker automatically after sign-in; single-system staff go straight in. Staff systems come from the `systems` field on the staff record (see the City **Admin panel → City staff** tab) or the role defaults in `src/city/cohort.js`.

### Cohort model

A Fellow's cohort year (`cohort` on the roster record) decides everything, relative to the current year **Y** (`src/city/cohort.js`):

| Cohort | Meaning | Calendar |
| --- | --- | --- |
| `Y + 1` | In the Winter Academy now | Winter Academy only |
| `Y` | Year 1 Fellow | City, own cohort only |
| `Y - 1` | Year 2 Fellow | City, own cohort only |
| `Y - 2` or earlier | Alumni | No calendar access; the record is kept |

Fellowship access ends on **31 December of cohort + 1** (the end of the 2nd Fellowship year) and is revoked automatically; sign-in then explains that Fellowship access has ended. Year 1 and Year 2 see separate City calendars, and one space, task or deadline can target Year 1, Year 2 or both (`cohorts`).

### City data

All City documents sit beside the existing `wa14-*` documents:

- `wa14-city-sessions` — programming spaces, tasks and deadlines
- `wa14-city-staff-tasks` — staff-only planning tasks
- `wa14-city-settings` — the City year and the Fellow-visible months (`fellowMonths`)
- `wa14-city-types` — the editable **types** (calendar colours and the Spaces report's rows)
- `wa14-city-modes` — the editable **modes** (the report's breakdown columns)

Types, modes and Fellow visibility are staff-controlled: an individual item can be hidden from Fellows, and whole months can be hidden from the Fellow calendars (staff always see them). The **Spaces report** counts PD spaces and breaks them down by type × mode and by month, per cohort, year to date.

### Admin panel

The **Admin panel** (`#admin`) is a separate access point that Fellows can never reach. Its **Fellows** tab is open to AFA, Coach, Admin and Superadmin accounts and manages the full Fellow profile (cohort, grade, track, placement city, coach, AFA group); a Winter Academy AFA's new Fellows are pre-assigned next year's cohort. The **City staff** tab manages staff roles and Training Systems and requires full access.

Run `npm run test:render` to render every panel (Winter Academy **and** City) and to assert the cohort, visibility and reporting helpers.

## Deployment

GitHub Actions builds and deploys the Vite output to GitHub Pages on pushes to `main`. The generated `dist/` directory is intentionally ignored and should not be committed.

## Security notes

- Do not commit passwords, OAuth client secrets, service-account keys, or access tokens.
- Treat the former superadmin password and all historical PINs as compromised; rotate any real credentials that used them.
- Firestore rules are the security boundary. UI roles and hidden controls are not authorization.
- `xlsx` currently has high-severity advisories with no upstream fix. Treat imported spreadsheets as untrusted and plan to replace or isolate that dependency before processing files from unknown users.

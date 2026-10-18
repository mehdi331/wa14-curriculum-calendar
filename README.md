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

## Google Calendar publishing

Schedule updates are published by an organization-owned Google Apps Script project. Firebase Google sign-in does not grant browser access to Google Calendar, so calendar credentials never go into the webapp. A time-driven Apps Script trigger reads the canonical Firestore schedules and reconciles Google Calendar every five minutes; updates are automatic but not immediate.

The sync publishes scheduled Winter Academy sessions and Fellow-visible City items only:

- City uses separate Year 1 and Year 2 calendars plus a City Shared calendar for items visible to both cohorts. Cohort-only items go only to their cohort calendar; shared items go only to City Shared, avoiding duplicates for staff who subscribe to all three. Fellows are shared into City Shared and their own cohort calendar, while City staff can access all three.
- Winter Academy calendars are generated per exact Fellow audience. Room and AFA-group targeting follows the app's existing OR visibility rule, so a Fellow who matches through both routes still sees one copy. WA staff are shared on every applicable WA calendar.
- Staff-only tasks, WA weeks hidden from Fellows, City items hidden from Fellows, and City months hidden from Fellows are not published.
- Generated calendars are shared directly with the listed TFB Google accounts. Changes to the Fellow roster, rooms, staff, visibility settings or schedules are reconciled on the next run. Google sends calendar-share notifications when access is first granted.
- Google event IDs are deterministic. Reconciliation updates changed events and removes events that are deleted, unscheduled, hidden, moved to another audience, or no longer in the cohort.

### Apps Script setup

1. In Google Apps Script, create a project owned by the organization account that will own the generated calendars. Copy `scripts/google-calendar-sync/Code.js` into the project and use the contents of `scripts/google-calendar-sync/appsscript.json` as its manifest. Set the project time zone to `Asia/Dhaka`.
2. Enable the **Google Calendar API** advanced service (v3) in Apps Script and enable the Calendar API in the script's linked Google Cloud project.
3. In the Firebase project's Google Cloud IAM, grant the Apps Script owner's account **Cloud Datastore User** (`roles/datastore.user`) so the script can read schedule documents and write its private calendar registry/status. This IAM role bypasses Firestore security rules and can read/write the database, so use a dedicated, tightly controlled organization account, protect Apps Script editor access, and do not grant this role to ordinary staff. The script's Google identity owns all generated calendars. Do not add credentials or tokens to the webapp.
4. Set the Apps Script project property `FIREBASE_PROJECT_ID` to `wa-14-calendar` if using a different Firebase project. Review the script's requested OAuth scopes, then run `installCalendarSync` once as the owner and approve the Calendar, Firestore and trigger permissions. The first run creates the calendar backfill and installs a five-minute trigger.
5. Publish the updated `firestore.rules`. The rules allow only a superadmin to queue a manual sync request; the status remains readable to authenticated TFB users.
6. Sign in to the webapp as the Superadmin and use the **Google Calendar sync** panel's **Sync now** button to queue a reconciliation. Automatic runs continue every five minutes. The panel shows the last result and errors; detailed execution errors are also available in Apps Script **Executions**.

The script stores generated calendar IDs and reader ACLs in the Firestore collection `wa14_calendar_sync_calendars`. If a Fellow's exact WA audience changes, the old generated calendar is emptied and its managed reader access is removed; the calendar record is retained so it can be reused if that audience returns. The Apps Script owner can inspect or delete these generated calendars in Google Calendar. Apps Script checks for source changes every five minutes and reconciles when it detects one; **Sync now** forces a reconciliation. Apps Script and Calendar API quotas apply; a large number of unique WA audiences may require a Cloud Functions/Cloud Run publisher instead.

Run `npm run test:calendar-sync` to test cohort routing, visibility, and duplicate-free WA audience grouping. This local test does not contact Google or Firestore.

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
- Firestore rules are the authorization boundary for webapp clients; Google Cloud IAM principals such as the Calendar sync account bypass those rules, so restrict database IAM roles. UI roles and hidden controls are not authorization.
- `xlsx` currently has high-severity advisories with no upstream fix. Treat imported spreadsheets as untrusted and plan to replace or isolate that dependency before processing files from unknown users.

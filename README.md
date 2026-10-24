This is Winter Academy 14's calendar and curriculum tool.

## Local setup

```bash
npm ci
npm run dev
```

During local development only, the sign-in screen includes **Test superuser** and **Test Fellow** buttons. These identities are stored in local browser storage and are removed from production builds. They are useful for checking role-based layouts and workflows, but they do not bypass Firestore security rules; use an authenticated Firebase account when testing live data reads and writes.

### Local TnDOS desktop experiment

Start the Vite server as usual, then open `http://localhost:5173/wa14-curriculum-calendar/?tndos=1`. This development-only experiment uses a Windows 98-inspired desktop and beveled application-window controls with the existing app palette. The desktop wallpaper features a glowing TnDOS logo; role-appropriate Winter Academy or City menu items are arranged across the desktop. The bottom taskbar shows the signed-in profile, available systems, open sections, and clock. The profile button opens the Start menu with **Sleep** and **Log out**; click or press a key on the glowing TnDOS sleep screen to wake. The sign-in screen also features the TnDOS glow above the existing sign-in options. Select a system on the taskbar to switch its desktop icons. Selecting an icon opens that section in a titled app window. Use **Desktop** (or Escape) to return to the workspace; windows can also be moved, minimized, maximized, and closed. Authentication and calendar data flows remain unchanged. Without `?tndos=1`, the normal application opens; production builds always use the normal application.

The app uses Firebase Authentication and Cloud Firestore. The Firebase web configuration is public client configuration and is bundled into the browser app; it must not be treated as a secret. Restrict the Firebase API key to the production domain and enable only the APIs this project uses.

## Firebase setup

1. Keep the project on the no-cost Spark plan unless paid Google Cloud services are required.
2. In Firebase Console, enable **Authentication > Sign-in method > Google**.
3. Add the GitHub Pages domain to Firebase Authentication's authorized domains.
4. Publish `firestore.rules` before deploying the frontend. The rules require a verified `@teachforbangladesh.org` Google account and limit writes by role.
5. Confirm Firestore usage stays within the Spark quota: 50,000 reads/day, 20,000 writes/day, 20,000 deletes/day, 1 GiB storage, and 10 GiB/month outbound transfer.

The current rules include a temporary transition bridge for the existing planning-team email addresses. Replace that bridge with Firebase custom claims managed by a trusted administrator before adding more privileged users. Never restore password or PIN authentication in the browser.

The City Admin panel and the Winter Academy **Who's online** tab use short-lived Firestore presence records to show staff and Fellows across both systems. Signed-in users can write and clear only their own session records; the list is readable only to accounts whose Firebase custom claims identify them as planners, AFA/Coach, full/fellows access, or `adminPanel: true`. Ensure those claims are assigned to the same staff who can open the Admin panel, then publish the updated rules. A session is considered online for two minutes after its last heartbeat, so a closed browser or lost connection may remain listed briefly.

The City **Admin panel → Login history** records Firebase-authenticated app session starts, entries into or switches between systems, and explicit sign-outs in a separate `loginAudit` collection. This uses the existing Firestore Spark project and requires no paid backend. Events are client-reported and best-effort, not tamper-proof; users can only create records associated with their own account, while browser, platform, and device categories are approximate and can be spoofed. The app does not collect IP addresses, city/country, GPS, or precise location. Closing a tab or losing a connection cannot reliably record a sign-out. Only accounts authorized by `isPresenceAdmin()` can read or delete history. Publish the current `firestore.rules` to enable this view. Opening Login history removes at most 250 events older than 30 days; further expired records are cleaned up on later visits, so this is best-effort retention rather than an automatic deletion schedule. The history view shows the latest 100 events. Local development test accounts do not create audit records because they are not Firebase-authenticated.

For Google Workspace accounts, an organization administrator can also check the Admin console's sign-in audit logs; availability and retention depend on the Workspace edition and administrator permissions. Those logs are separate from this app history.

## Assessments and attendance

Staff can create session-linked assessments with single-choice, multiple-choice, check, and paragraph questions; each choice option has a stable ID so changing its text does not change its answer key. Paragraph questions support a rubric and expected concepts. Fellows receive active assigned assessments with persisted answers; paragraph responses are submitted as pending staff review.

The local development login includes demo controls for 10 Fellows, 5 sessions, 5 assessments, and demo questions. Demo records are prefixed with `DEMO` and can be removed from the Staff analytics view.

Question images accept a public image URL or common Google Drive share links, which are normalized to Drive's view endpoint. Drive files must be shared as **Anyone with the link → Viewer**. The Fellow experience displays the image above the question prompt. Do not store base64 images in Firestore.

Staff can use the **Review** tab to score paragraph responses, add feedback, and record the reviewer/date. An optional Google Apps Script AI proxy can provide a suggested score and feedback, but a staff member must approve and save the final score. Set `AI_SUGGEST_ENDPOINT` in `src/App.jsx` only to the deployed proxy URL; keep any model API key in Apps Script. Exports include answers, reviews, and AI suggestions.

The initial assessment persistence uses aggregate documents for compatibility with the existing app. It is suitable for local/demo testing, but production assessment use still requires stricter per-Fellow Firestore rules, server-authoritative grading/timing, protected answer keys, and per-record response storage.

Fellow attendance windows are configured individually in **Edit session**. Each session defaults to opening 3 minutes before start, recording check-ins as on time until the +2-minute mark, then accepting late check-ins for 10 more minutes (through +12). Staff can adjust the opening lead, on-time cutoff, and late-window duration separately for each session; each value must be a whole number from 0 to 120. For example, a 2-minute on-time cutoff and a 120-minute late duration keeps check-in open through +122 minutes. Existing sessions are initialized with these defaults, and earlier late cutoffs are migrated to equivalent durations. The separate attendance-required option defaults to enabled for Sync, Workshop, and Clinic modes and disabled for other modes. Excluded sessions do not appear in attendance records or Fellow attendance totals.

Attendance check-ins and staff edits update the existing `wa14/wa14-attendance` document in Firestore transactions, so concurrent check-ins are merged instead of overwriting one another. This uses the existing attendance permissions in `firestore.rules`.

Practice Teaching keeps an ordered learning-outcome list for each grade and subject, independent of schedule days. In each collaboration, staff assign a subject and one or more outcomes to every Fellow/day slot; outcomes may be reused across Fellows or days. Optional chapter/topic and page references stay attached to each outcome, and Fellows see only their own daily subject and selected outcomes. Existing day-keyed outcome lists are flattened in day order with their text and chapter/page metadata preserved. Existing collaboration subjects and outcome selections are migrated per Fellow/day where available.

## Google Calendar publishing

Use the **Download Calendar Workbook** button on the Winter Academy **Sessions** page, then import the downloaded `.xlsx` into a Google Sheet and add the repository's Apps Script source as a script bound to that spreadsheet. The script runs only when an authorized editor chooses **Google Calendar → Sync now** from the Sheet menu; there is no automatic timer and no webapp sync button. Anyone who can edit the Sheet can also run its bound script and change the generated calendars, so restrict Sheet and Apps Script editor access.

Running the Sheet menu command creates or updates generated calendars and events in Google Calendar; it does not create another file. The script shows a completion dialog with the number of calendars and events reconciled.

The workbook contains these machine-readable data tabs: `WA Sessions`, `WA Rooms`, `Fellows`, `Staff`, `WA Settings`, `City Items`, and `City Settings`. It includes stable IDs and only the roster/staff fields needed for event targeting and calendar sharing. Do not rename these tabs or their header columns.

### One-time Google Sheets setup

1. In the webapp, enter Winter Academy as a full-admin and open **Sessions**. Choose **Download Calendar Workbook**. Wait until the button is enabled if City data is still loading.
2. Create a Google Sheet owned by the organization account that should own the generated calendars. Choose **File → Import → Upload** and import the downloaded workbook. For the first import, create a new spreadsheet. Keep all workbook tabs.
3. In that Sheet, choose **Extensions → Apps Script**. Replace the starter code with `scripts/google-calendar-sync/Code.js`. In **Project Settings**, enable “Show `appsscript.json` manifest file” and copy the repository's `scripts/google-calendar-sync/appsscript.json` contents into the manifest. In the Apps Script editor's **Services** list, add the **Google Calendar API** advanced service (v3); enable the Calendar API in the linked Google Cloud project if prompted.
4. Save and reload the Google Sheet. Choose **Google Calendar → Sync now** and authorize the requested access to Google Calendar and the current spreadsheet. The first successful run creates the generated calendars and events. The script account owns those calendars.

### Updating calendars later

1. After schedules or visibility change in the webapp, export a fresh Calendar Workbook.
2. In the existing connected spreadsheet, replace the seven data tabs with the new workbook's versions. Do not delete or replace the spreadsheet itself: its bound script and the generated Calendar records must remain. Retain the `Instructions` tab if desired.
3. Reload the Sheet if needed, then choose **Google Calendar → Sync now**. A completion dialog reports calendar and event counts. On errors, it reports the failure and the Apps Script **Executions** page contains technical details.

The workbook is a snapshot, not a live connection to Firestore. Webapp edits do not reach Google Calendar until you export/import the updated data and run the Sheet menu command. Re-running with the same workbook is safe: deterministic event IDs update existing events rather than duplicating them. Removed, hidden, or re-targeted managed events are deleted or moved on the next successful run.

### Calendar audience and visibility behavior

- Winter Academy calendars are generated per exact Fellow audience, applying the app's room-membership **or** AFA-group visibility rule. A Fellow matching both routes receives one copy. WA staff are shared on each applicable calendar.
- City Year 1 and Year 2 events go to the matching cohort calendar; events visible to both cohorts go to City Shared only. City staff can access all three.
- Hidden WA weeks, staff-only City tasks, hidden City items/months, and items outside Fellow visibility are excluded.
- Generated calendars are shared directly with the TFB accounts in the workbook. Google may send calendar-share notifications when access is first granted. The workbook contains Fellow and staff email addresses; store it and the connected Sheet with appropriate access controls.
- The script does not need Firebase credentials, Firebase IAM roles, a web-app deployment, or a background trigger. Google Calendar changes require one-time Apps Script authorization and an explicit Sheet-menu run. Do not share the spreadsheet with people who should not be able to grant/revoke calendar access or publish events.

Run `npm run test:calendar-sync` to test workbook fields, audience routing, ACL changes, and managed-event update/removal behavior. These local tests do not contact Google.

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

The **Admin panel** (`#admin`) is a separate access point that Fellows can never reach. Its **Fellows** tab is open to AFA, Coach, Admin and Superadmin accounts and manages the full Fellow profile (cohort, grade, track, placement city, coach, AFA group); a Winter Academy AFA's new Fellows are pre-assigned next year's cohort. The **City staff** tab manages staff roles and Training Systems and requires full access. The cross-system **Who's online** view is available from City Admin and the Winter Academy sidebar to full-access staff.

Run `npm run test:render` to render every panel (Winter Academy **and** City) and to assert the cohort, visibility and reporting helpers. Run `npm run test:tndos` to verify the local-only desktop URL gate.

## Deployment

GitHub Actions builds and deploys the Vite output to GitHub Pages on pushes to `main`. The generated `dist/` directory is intentionally ignored and should not be committed.

## Security notes

- Do not commit passwords, OAuth client secrets, service-account keys, or access tokens.
- Treat the former superadmin password and all historical PINs as compromised; rotate any real credentials that used them.
- Firestore rules are the authorization boundary for webapp clients. Protect exported workbooks and Google Sheets because they contain Fellow/staff email addresses and schedule visibility data. UI roles and hidden controls are not authorization.
- `xlsx` currently has high-severity advisories with no upstream fix. Treat imported spreadsheets as untrusted and plan to replace or isolate that dependency before processing files from unknown users.

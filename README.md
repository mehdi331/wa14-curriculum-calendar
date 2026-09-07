This is Winter Academy 14's calendar and curriculum tool.

## Local setup

```bash
npm ci
npm run dev
```

The app uses Firebase Authentication and Cloud Firestore. The Firebase web configuration is public client configuration and is bundled into the browser app; it must not be treated as a secret. Restrict the Firebase API key to the production domain and enable only the APIs this project uses.

## Firebase setup

1. Keep the project on the no-cost Spark plan unless paid Google Cloud services are required.
2. In Firebase Console, enable **Authentication > Sign-in method > Google**.
3. Add the GitHub Pages domain to Firebase Authentication's authorized domains.
4. Publish `firestore.rules` before deploying the frontend. The rules require a verified `@teachforbangladesh.org` Google account and limit writes by role.
5. Confirm Firestore usage stays within the Spark quota: 50,000 reads/day, 20,000 writes/day, 20,000 deletes/day, 1 GiB storage, and 10 GiB/month outbound transfer.

The current rules include a temporary transition bridge for the existing planning-team email addresses. Replace that bridge with Firebase custom claims managed by a trusted administrator before adding more privileged users. Never restore password or PIN authentication in the browser.

## Deployment

GitHub Actions builds and deploys the Vite output to GitHub Pages on pushes to `main`. The generated `dist/` directory is intentionally ignored and should not be committed.

## Security notes

- Do not commit passwords, OAuth client secrets, service-account keys, or access tokens.
- Treat the former superadmin password and all historical PINs as compromised; rotate any real credentials that used them.
- Firestore rules are the security boundary. UI roles and hidden controls are not authorization.
- `xlsx` currently has high-severity advisories with no upstream fix. Treat imported spreadsheets as untrusted and plan to replace or isolate that dependency before processing files from unknown users.

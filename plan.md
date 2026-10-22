# Sign-in and session audit plan

## Goal

Compare Google Workspace sign-in auditing with an app-specific audit trail, then plan a privacy-conscious implementation that can answer who accessed the app, when, from which app/system, and what browser/device category was used. Any IP-derived location is approximate and must not be presented as GPS or a precise physical location.

## Work plan

1. **Document the Workspace audit route**
   - Check which Google Workspace Admin sign-in/audit events are available to the organization and which roles can view them.
   - Record the fields and retention available in the tenant, including whether IP, client, or device details are present.
   - Explain that Workspace logs cover Google account authentication broadly; they do not necessarily prove that a user opened this application or which application system they used.

2. **Design the app-specific audit path**
   - Inspect the current Firebase Auth, hosting, and deployment setup to decide where a trusted server endpoint can run.
   - On authenticated app-session start and explicit sign-out, send a minimal event to that endpoint.
   - Derive account identity from the verified Firebase token; derive source IP and user-agent on the server rather than trusting client-submitted values.
   - Record timestamp, user ID/email, event type, selected system, user-agent/device category, and source IP. If city/country is enabled, derive it from the IP using an approved provider or maintained local dataset and label it approximate.
   - Keep audit events separate from heartbeat-based online presence so the live list and sign-in history have clear, different meanings.

3. **Set privacy and security controls**
   - Define an explicit retention period, restricted administrator access, and a process for deleting expired audit records.
   - Avoid browser GPS collection. Document that IP may reveal a network or provider location rather than the user's actual location.
   - Decide whether to retain the raw IP, or discard it after deriving coarse location; minimize stored data.
   - Protect the endpoint against unauthenticated writes and automated abuse; validate event types and use server timestamps.

4. **Compare and present the options**
   - Provide a short comparison of Workspace-only, app-specific, and combined auditing, including implementation effort, accuracy, required permissions, cost/deployment implications, and limitations.
   - Recommend the combined approach if Workspace log availability is adequate: use Workspace logs for identity-provider authentication evidence and the app trail for app-specific sessions.

5. **If approved, implement and validate**
   - Add the server endpoint, audit storage, access controls, retention cleanup, and an Admin-panel history view with filters.
   - Test event creation, identity binding, app/system attribution, coarse-location labeling, access denial, retention cleanup, and behavior when logging is unavailable.
   - Update deployment and privacy documentation; verify build and focused tests.

## Decisions captured

- Compare both Google Workspace audit logs and an app-specific audit trail.
- For app-specific records, include IP-derived approximate city/country, with raw-IP retention to be decided during implementation review.
- Do not request or collect precise browser GPS location.
- Do not treat the existing two-minute Firestore heartbeat list as a historical sign-in audit.

## Not in scope

- Covert or precise location tracking.
- Treating browser user-agent strings as verified device identity.
- Changing authentication providers or access roles.

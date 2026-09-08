# Publication identity and finalization

These helpers do not publish packages, approve builds, select an npm dist-tag, or
replace the existing publisher. A merged release-branch PR is an **unverified
candidate**, not proof of shipment. Post Release records its exact source and
resolved default-branch tooling commit and runs a no-publish rehearsal. Candidate
code is read as data, never executed with a write token. The existing downstream
notification job is unchanged and is not publication evidence.

Coverage is stable-version production public CDN and npm package bytes only.
Other CDN destinations, mutable files, and npm dist-tag selection require separate
authoritative checks; a `complete` receipt here must not be presented as covering
those release paths or as overriding required publishing-job outcomes.

## Producer approval boundary

The publishing authority must export the **final** npm tarball and entire CDN
version directory from the same pinned, approved build. Hash after the last
packaging, signing, or content transformation. Do not repack for verification.
The CDN directory includes `js/MicrosoftTeams.min.js` and every other deployed
JavaScript, declaration, and source-map file. The producer must prove this is the
entire intended upload inventory before approval; the CLI cannot discover omitted
local files by querying the CDN. A retry must reuse the same plan, not reduce it
to failed targets. Keep the plan outside the payload being hashed.

The existing producer's full plan/provenance (actual provider, definition, run,
source, tooling, and output mapping) stays with that authority. This v1
`teamsjs-publication-projection` is a distinct public-safe variant, not the full
private plan. The producer assigns `build.evidenceId` a cryptographically random
UUIDv4 and retains an immutable mapping to the full approved provenance. Do not
hash guessable private identifiers and call that sanitization. The opaque identity
is not a new public build service or a substitute for reviewing the private record.
Export only this public-safe identity JSON:

```json
{
  "schemaVersion": 1,
  "kind": "teamsjs-publication-projection",
  "release": { "component": "@microsoft/teams-js", "version": "3.0.0", "channel": "stable" },
  "source": { "repository": "OfficeDev/microsoft-teams-library-js", "commit": "<full source SHA>" },
  "build": { "evidenceId": "<random UUIDv4 mapped to approved producer provenance>" },
  "tooling": { "revision": "<full reviewed helper SHA>" }
}
```

Replace placeholders with approved values. Semantic prerelease publication such
as `3.0.0-beta.1` is rejected until its destination adapter is separately approved.
Adding a GitHub prerelease label to stable version `3.0.0` does not change its
package channel. Candidate validation can record a semantic prerelease as
unverified data, but that is not a supported publication plan.

```bash
set -euo pipefail
node tools/cli/release-plan.js produce \
  "$APPROVED_IDENTITY_FILE" "$FINAL_NPM_TARBALL" "$FINAL_CDN_VERSION_DIRECTORY" "$NEW_PLAN_FILE"
```

The producer emits strict v1 JSON with `targets`: npm first, followed by the full
lexically sorted CDN inventory. Each target has `id`, `artifact`, fixed public
`destination`, and `integrity` (npm SHA-512, CDN SHA-384). It prints the SHA-256 of
the canonical plan (sorted object keys, preserved array order, no whitespace).
Persist this projection alongside the full provenance as immutable build
artifacts. An approver must bind this digest and source **independently** of the
files supplied to the consumer. Computing both an approval and a plan from the
same unreviewed input is not approval. Never derive expected hashes from a feed.

## Verify every destination after the actual publish attempt

```bash
set -euo pipefail
node tools/cli/release-plan.js verify \
  "$PLAN_FILE" "$APPROVED_PLAN_DIGEST" "$APPROVED_SOURCE_SHA" "$NEW_RECEIPT_FILE"
```

This read-only command verifies npm metadata (including source when `gitHead` is
present), downloads and hashes the actual tarball, and hashes every CDN object.
Redirects are rejected; requests have a 30-second bound and a 50 MiB response
limit. It records every target even after partial failure. Generic 404, auth,
network, and malformed responses are `unknown`, not authoritative absence.
Wrong metadata or bytes are `conflicting`. Neither outcome authorizes republishing.
It writes a v1 receipt `{schemaVersion, planDigest, observations, complete}` and
exits nonzero unless every observation is current `present-matching`. Each
observation records `targetId`, `state`, `observedAt`, and SRI or error `evidence`.
The receipt binds source/build/content through the plan digest. It is evidence,
not a signed approval; do not accept an arbitrary uploaded receipt as authority.

## Final metadata only after approval and complete verification

```bash
set -euo pipefail
node tools/cli/create-github-release.js \
  "$PLAN_FILE" "$RECEIPT_FILE" "$APPROVED_PLAN_DIGEST" "$APPROVED_SOURCE_SHA"
```

Use the reviewed tooling revision, not scripts from a candidate or uploaded
artifact. The command requires `GITHUB_TOKEN` with only repository contents-write
for metadata, a receipt no older than 15 minutes, and re-verifies publication
before writing. It creates `candidate/<version>/<planDigest>` at the approved
source and creates the final annotated `v<version>` reference exactly once.
Its annotation commits to the plan digest. Matching retries are read-only except
for missing metadata; conflicting or legacy final refs stop for maintainer review.
No tag PATCH, rollback, release edit, demotion, npm promotion, or latest selection
exists. GitHub release creation always uses `prerelease: true`, `make_latest: false`.
An external promotion cannot cause this helper to move its tag or alter the release.
Final remote fully-qualified refs and peeled source are checked after creation.
Metadata failure is retried as metadata, never by republishing packages.

**Operational prerequisite:** a reviewed producer adapter and approval handoff
must be integrated into the existing publisher before using these commands for a
real release. This PR does not provide that integration, create permissions, or
authorize publication. Do not use `unverified-candidate.json` as a plan/receipt.
No release-event consumer is added: events produced by `GITHUB_TOKEN` do not start
new Actions workflows, so finalization must be explicitly invoked in the approved
publishing graph rather than assumed to trigger it. Announcements and any manual
promotion require the complete receipt and existing operational approval gates.

Offline rehearsal (Node 18 or 20; synthetic files and HTTP doubles, no publishing):

```bash
set -euo pipefail
node --test tools/cli/release-plan.test.js tools/cli/create-github-release.test.js tools/cli/release-candidate.test.js
```

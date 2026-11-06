# TeamsJS release failure modes

Each entry gives the symptom you see, the cause, and the fix. Recovery steps that write anything are still
[⛔ gates](./SKILL.md#-confirmation-gates).

## Diagnosis loop

1. **Is it published?** Run the Prod step 9 checks (or the step 2 "is the version free" checks) before anything else.
   The registry and the CDN are the truth; a run status is not.
2. **Which task failed?** Open the run's timeline and read per-task results, not the run status.
3. **Why?** Read the failing task's log. Describe the symptom in your own words; never paste raw pipeline logs into a
   public PR or issue, because they carry tokens, request IDs and internal identities.

## Pipeline outcomes

### A successful Prod run ends "failed" at "View Published Package URLs"

- **Symptom:** since March 2026 every Prod run ends failed (one was canceled at the same step), even though the npm
  publish and the CDN upload succeeded; earlier runs ended succeeded or partially succeeded. "View Published Package
  URLs" is the only red task, and the template's closing "Publish to ARROW" step is skipped as a result.
- **Cause:** the script that step runs reads a stale artifact path.
- **Fix:** none needed for the release. Check that artifact retention, the ESRP npm publish and the 1CDN upload
  succeeded, verify as in Prod step 9, and carry on. Any other red task is a real failure. Fixed by
  [#3187](https://github.com/OfficeDev/microsoft-teams-library-js/pull/3187) once it lands and reaches the release
  branch. That step also prints an SDF CDN link on Prod runs; do not mistake it for the Prod URL.
- **Not to confuse with:** a successful DDL run, which normally ends "partially succeeded".

### Prod published with the wrong npm tag

- **Symptom:** after a Prod run, `latest` still points at the previous version and the new version carries `beta`.
- **Cause:** a typo in the release YAML once named the Prod publish task "tag beta" and published with that tag.
- **Fix:** before queuing, the npm task in `tools/releases/prod-release.yml` must say `tag latest` with
  `productstate: 'Latest'`. If it already happened, raise it with the maintainers; moving a dist-tag is a separate,
  approved npm operation, never a republish.

### The Prod run used the wrong CI build

- **Symptom:** the pipeline published the previous release's content, or the CDN folder has an unexpected version.
- **Cause:** the pipeline artifact defaulted to an older CI run of the same branch. Every release branch has a run
  from the branch push and one from the prep PR merge, and a reused branch can carry a run with old content.
- **Fix:** always set the artifact explicitly to the run from the prep PR merge, and check its `CDNFeed` folder name
  equals the version before queuing (Prod step 6).

### The Lockbox request cannot be approved by the release approvers

- **Symptom:** approvers say the request is not theirs, or it never appears for them.
- **Cause:** the request targets another service team.
- **Fix:** check the target in the request before asking. Fix the pipeline configuration through a reviewed PR
  rather than asking another team to approve.

### Expected noise

- `postrelease.yml`'s downstream notification fails with a credentials error on every release, so that repository is
  not notified. Report it to the maintainers; it does not affect publication.
- Every Prod run warns that the ESRP release task "will be blocked in future releases". It does not block today; track
  it as a future risk.

### The artifact retention (ARROW) task fails on an end-of-life Node runtime

- **Symptom:** the artifact retention task fails because the agent refuses end-of-life Node 16 task runtimes. In the Prod
  and SDF pipelines it runs before publishing, so nothing is published. In the DDL pipeline it runs after the upload, so
  the new list may already be at the origin: purge and verify anyway (DDL steps 3-4).
- **Cause:** `AssetRetention` versions 3-5 run on Node 16. Queue-time variable overrides are not allowed on these
  pipelines, so the agent setting cannot be switched off for one run.
- **Fix:** `main` uses `AssetRetention@6` in `tools/yaml-templates/security.yml` and the three release YAMLs since
  [#3198](https://github.com/OfficeDev/microsoft-teams-library-js/pull/3198); it runs on Node 20. If you see this
  failure, the queued branch predates that change: carry it into the release branch through a reviewed PR. PR builds
  skip this task, so only a `main` or release CI run proves a change to it.

### A pipeline fix merged to `main` is not in effect for the release

- **Cause:** the release pipelines read their YAML from the branch you queue, `release/<x.y.z>`.
- **Fix:** cut the release branch after the fix merges, or bring the fix into the release branch through a reviewed
  PR. Do not edit a release branch that has already deployed.
- **Timing:** even a YAML-only PR takes about an hour to go green, because the PR pipeline's web Playwright shards and
  Android end-to-end plans are the long poles. Merging to `main` and then carrying the fix into the release branch
  pushes Prod back by at least an hour and a half, so land pipeline fixes before release day.

### The Lockbox request waits for hours

- **Cause:** approval needs a second eligible person; the requester cannot approve their own request. Most Prod waits
  are under 10 minutes, but some have taken 6 to 8 hours and one more than a day, usually when the ask went to a
  channel nobody was watching.
- **Fix:** queue Prod by early afternoon, name an approver and a backup from the owning team beforehand, and post the
  request ID and run link in the owning team's chat, pinging them directly. Once the first manual approval is given,
  later Lockbox requests in the same run are approved automatically.

### The run fails at "Lockbox Approval Request" because the requester is not eligible

- **Symptom:** the first stage fails with `IneligibleDeploymentUserException` ("requestor is not eligible to deploy"),
  followed by `FailureInWaitForLockboxTaskException` in deployment preparation. This is the most common first-run
  failure in the release history, for Prod and DDL alike.
- **Cause:** the person who queued the run has no active deploy eligibility; it lapses after about 30 days unused.
- **Fix:** nothing was published, so it is safe to queue again once someone with active eligibility does it. Prevent
  it by confirming, or re-requesting, eligibility at least one business day before the release.

### You cannot request or approve Lockbox

- **Symptom:** you are missing from the Lockbox request's recipients, or the approval tool says you are not eligible.
- **Cause:** eligibility lapses after about 30 days without use (a warning arrives a few days before). Owning-team
  members also need to be in the release approver group the runbook names.
- **Fix:** renew eligibility through the access portal the internal runbook names before release day, from a managed
  device if the runbook requires it. Ask an eligible owning-team member to queue or approve meanwhile.

## Branches and versions

### Stale release branch

- **Symptom:** `release/<x.y.z>` already exists from an abandoned attempt, for example a prep PR closed unmerged.
- **Constraints:** downstream internal test pipelines look the branch up by its exact name, so you cannot use another
  name. The repository ruleset blocks deleting `release/*`; only an organization admin can.
- **Fix, preferred:** ask an organization admin to delete it, then cut it fresh from the source commit. Rulesets now
  block deleting and force-pushing `release/*`; older instructions that toggle "Allow deletions" in branch protection
  no longer apply, and repository admins cannot get around it, only organization admins.
- **Fix, if an admin is not available in time:** reuse it. Bring it up to the source commit through a reviewed PR into
  `release/<x.y.z>`, then continue with the prep PR. Squash merging keeps the later merge-back clean. Agree this with
  the release owner first; never force-push the branch.

### `main` moved during the release and the merge-back conflicts

- **Cause:** expected when PRs merge mid-release.
- **Fix:** merge back through `<alias>/cleanup_release_<x.y.z>` cut from the release branch, with `main` merged into
  it (Prod step 10). Never force-push `main` or change the deployed release branch.

### The merge-back re-adds change files the release consumed

- **Symptom:** after merging `main` into the cleanup branch, `change/` again holds files whose comments already appear
  in the new CHANGELOG section. It happened on the 2.59.0 merge-back.
- **Cause:** with a reused release branch, `main` gained those change files after the release branch's base, and the
  prep PR consumed them. Relative to the merge base the release side never touched them, so the merge keeps `main`'s
  copies.
- **Fix:** delete them in the cleanup branch before opening the PR. Left in place, the next release lists those
  entries again. Afterwards every file under `change/` that is not on `origin/release/<x.y.z>` must be the new `none`
  file or a change file whose comment is not in the new CHANGELOG section; other changes `main` gained after the cut
  are expected.

### A fix must ship on an older release line (hotfix)

- **Constraint:** the Prod pipeline always publishes with the npm `latest` tag (`productstate: 'Latest'`), and steps
  9-10 then expect `latest` and GitHub Latest. Releasing an older line through it would move `latest` backwards, away
  from the newest version. Past patch releases were each the newest version, so this has not happened yet.
- **Fix:** an older-line hotfix is a maintainer decision outside this skill: it needs a publish path that does not
  tag `latest`, and its GitHub release is not marked Latest. Stop before queuing and raise it with the maintainers.
  Once it is published, bring the fix to `main` through an intermediate branch, as above.

### The 1CDN upload fails after npm succeeded

- **Symptom:** the ESRP npm publish is green and the 1CDN task is red. It has happened on three releases.
- **Why not re-run:** npm cannot publish an existing version again, so a plain re-run fails at the npm task before it
  reaches the CDN, and the CDN upload never overwrites.
- **Fix:** do not retry blindly; check what reached the CDN first (Prod step 9). Agree a CDN-only recovery with the
  maintainers; one past release recovered with a reviewed run from a separate retry branch. Contact the CDN team
  through the channel in the internal runbook with the run and the failing task, described in your own words.

### The npm publish task fails with "return code 1"

- **Cause:** often transient; on two releases a later run published.
- **Fix:** before re-running, check whether the version already exists on npm (Prod step 9). If it does, the publish
  went through and the next problem is the CDN; if not, re-run with approval.

### A tag or GitHub release points at a commit without the bump

- **Cause:** the release was created before the prep PR merged.
- **Fix:** do not move a published tag. Deleting a GitHub release leaves tag `v<x.y.z>` in place, and a release
  recreated with that tag reuses its old commit. If nothing has been published, stop for a maintainer decision that
  covers both the pre-release and the unshipped tag; removing them is a **⛔ Gate 4** write, and the release is
  recreated at the verified commit (Prod steps 5 and 7) only after the tag is gone. If the version has been
  published, raise it with the maintainers before changing anything.

### `beachball check` or the bump rejects a change type

- **Cause:** `beachball.config.js` disallows `major` and `prerelease`, and beachball rejects those files before
  bumping; it does not silently demote them. Other prerelease-style types can still produce versions such as
  `3.0.0-0`.
- **Fix:** a major or prerelease version is a maintainer decision with explicit, reviewed intent. It is out of scope
  for this skill. Do not relax the config inside a release.

### The version looks free but publishing fails as a duplicate, or looks unpublished when it is live

- **Cause:** a lookup that failed was read as "not found", or a corporate npm proxy or public mirror answered instead
  of the public registry. Proxies and mirrors can lag: on the 2.59.0 release day the corporate proxy still showed
  `latest` 2.58.0 and no 2.59.0 more than 25 minutes after the publish, while jsDelivr and unpkg showed 2.59.0 within
  about 10 minutes. npmjs.com web pages refuse automated requests, so check them in a browser.
- **Fix:** a proxy or mirror can confirm that a version is present, never that it is absent or that a dist-tag is
  current. Prove a version free only from `registry.npmjs.org`, from another network if needed, and treat any lookup
  error, timeout or unexpected status as inconclusive. Never re-queue a publish because a proxy lacks the version.
  The CDN upload never overwrites, so an existing CDN folder also blocks a version.

## Build and tooling

### `preRelease.js` fails

- **"beachball is not recognized":** run `pnpm install` first.
- **The manifest is not found:** the build inside the script failed. Fix the build; there is no integrity hash
  without it.
- **File not found on macOS or Linux:** the script is `preRelease.js` with a capital R.
- Use Node 18, as CI does.

### The CI bundle does not match the carrier SRI

- **Cause:** the CI build was produced from different source than the local bump, or the build is not deterministic.
- **Fix:** stop. Do not queue Prod. Rebuild from the merged release branch and compare again; if it still differs,
  investigate before releasing, because a wrong SRI breaks every page that pins it.

### npm or the CDN shows the version on one side only

- **Cause:** half published, for example the npm publish succeeded and the CDN upload failed.
- **Fix:** do not promote the GitHub release or announce. Finish the missing side through the pipeline with approval,
  then repeat the Prod step 9 checks.

## Valid domains

### The live valid-domains list does not change after a DDL run

- **Symptom:** the DDL upload task succeeded, but
  `https://res.cdn.office.net/teams-js/validDomains/json/validDomains.json` still serves the old list, and its
  `Last-Modified` header predates the run.
- **Cause:** the file's path has no version and the CDN caches it for a year, so the edge keeps serving the previous
  copy after the upload. This is expected after every DDL run, not an exception.
- **Fix:** request a CDN cache purge right after the run (DDL steps 3-4), then compare again on `res.cdn.office.net`.
  A "submitted" purge request may still not have run: one with a long reason failed without any error or email. If
  the list is still stale about 45 minutes later, ask the CDN team through the support contact in the internal runbook
  whether the request was picked up. Do not re-run the DDL to refresh the cache, and do not change the SDK's fallback
  list to work around it. A cache-busting query string does not get past the edge cache, so it is not proof either
  way.

### New origins merged and released, but hosts still reject them

- **Cause:** once the SDK has fetched the live list from the CDN it validates against that list, not the list bundled
  in the npm package. A Prod release alone does not make new origins valid; only a DDL run that reaches the edge does.
- **Fix:** run the DDL and purge the CDN cache for the merged `validDomains.json`, then check the live list.

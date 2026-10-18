# Linguative article publishing — prepared, not activated

Ala requested automatic blog publishing on 18 October 2026. The existing self-hosted site stores articles in its application bundle; adding a writing reminder alone cannot publish new pages. This publisher extends that build without changing hosting platforms or the enquiry API.

## Workflow

1. ChatGPT prepares the exact EN/AR article, metadata, related services and preview for Ala.
2. Ala explicitly approves the exact content. The article's approval record identifies Ala, the review PR, and a SHA-256 hash of the complete bilingual article. A change to either language invalidates that approval hash.
3. The approved article is merged into `website/blog-publisher/catalog.json` on `main`. Configure branch protection so only Ala's approved publication changes reach main; an editable `approved` flag is not an authentication mechanism by itself. Repository write access controls this publishing channel.
4. A fixed, reviewed Python script on the existing host periodically reads that catalog over HTTPS, validates it, generates both article pages, adds them to Insights, updates the application routes, canonicals, hreflang, analytics page allowlist and sitemap, and backs up changed files outside webroot.
5. An unchanged catalog does nothing. Drafts do not publish. Failed writes restore completed changes. Published articles cannot disappear through catalog removal; retirement needs a separate redirect decision.

No subscription, external CMS account, root password in chat, or new inbound publishing endpoint is required. The server fetches content data only; it does not download or execute changing program code. The catalog in this PR is empty, so installing it will not publish a test article.

## What has and has not been verified

Prepared and locally tested against the reviewed 16 October self-hosted snapshot: bilingual rendering/metadata, safe text escaping, application JavaScript syntax, routes and index updates, consent-first analytics route additions, unchanged enquiry adapter, duplicate-run no-op, existing-article protection, content-approval hash checks and recovery after a simulated write failure.

Not installed on Axencloud. No production article or account setting has changed. The live browser layout and an actual server sync have not been verified. The publisher checks known build integration points and fails closed if the deployed application has changed incompatibly. It must be checked against the live build at installation, including any Experience-page deployment.

The existing 15 articles are retained. This first version manages newly approved articles; converting existing ones into managed content is separate, so the publisher refuses to overwrite an existing unregistered article slug.

## One-time host setup — after review and approval

Install this reviewed script outside webroot, as the existing website owner, for example:

`/var/www/linguative_n_usr/data/www/linguative.net/private/blog-publisher/publisher.py`

The folder needs to be writable by the website owner so it can hold its lock, state and release backups. Keep it inaccessible from the public web server. Use Python 3.9+ on Linux; the script uses only the standard library. It needs the existing website owner's write access to webroot and sibling `private/routes.json`; do not grant root login or broad new repository access.

The configured public source is fixed to this repository's `main` catalog. For an empty catalog, a sync should report `empty; no publication`. With a reviewed sample in a disposable site copy, confirm the same production build passes before enabling writes.

Dry run:

```sh
python3 /var/www/linguative_n_usr/data/www/linguative.net/private/blog-publisher/publisher.py --root /var/www/linguative_n_usr/data/www/linguative.net/webroot --sync
```

After the one-time setup is approved and tested, add a cron entry **under the existing website user**, not root, to run every 10 minutes:

```cron
*/10 * * * * python3 /var/www/linguative_n_usr/data/www/linguative.net/private/blog-publisher/publisher.py --root /var/www/linguative_n_usr/data/www/linguative.net/webroot --sync --apply >> /var/www/linguative_n_usr/data/www/linguative.net/private/blog-publisher/run.log 2>&1
```

This cron is documentation only; it has not been installed. Rotate the private log through the host's normal log policy. Preserve backups; review the written journal before manually restoring files. Runtime errors must be investigated rather than described as a successful publication. Forced process termination or host failure can still interrupt a multi-file change; the release journal retains actual before/after hashes for recovery. Do not claim publication until both live EN/AR URLs, metadata and navigation are checked.

The publisher writes a local JSON receipt and private log, not notification email. A sent email notification from `admin@linguative.net` remains part of the marketing handoff after live verification; it is not implemented inside this server script.

## Article data contract

Each entry has `slug`, `status`, `en`, `ar`, `approval`. `en` and `ar` contain `title`, `description`, `summary`, `sections` (heading, paragraphs, optional bullets), and `related` (approved service slugs). Text is escaped; raw HTML and executable snippets are not accepted as markup. Do not put confidential client records, internal rates, procurement details or unpublished permissions in the public catalog.

Approved records contain `by: "Ala"`, `record: "https://github.com/alaabusharif/linguative-automation/pull/<number>"`, and `content_sha256`. The hash input is precisely `{slug, en, ar}` encoded by the script's canonical JSON function. Only create this approval record after Ala's real approval; a test fixture is not publication authority.

Existing brand, client-reference, real-equipment, bilingual and one-team positioning rules remain. No automatic AI-written article bypasses review. No new article is justified solely by a single search impression.

## Verification

```sh
python3 -m unittest discover -s website/blog-publisher/tests -v
```

The three integration tests use a reviewed local site snapshot if available; otherwise they are explicitly skipped. The three approval/path validation tests run without a site snapshot. For a different snapshot path, update the test fixture configuration before executing the integration tests.

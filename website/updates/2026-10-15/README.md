# Linguative copy and consent-first analytics update — 15 October 2026

Prepared for review, not deployed. This update targets the current self-hosted build, not the older Base44 preview. Do not rebuild production from that preview: its form adapter differs from the live PHP endpoint.

## Changes

- Clearer English and Arabic introductions for event/conference management and conference technology/AV: locations, practical delivery and agreed responsibilities. Existing titles and service scope remain intact; no ranking or client claims added.
- Matching privacy notice wording explaining optional Google Analytics, technical connection information, international processing, excluded enquiry details, 180-day choice/cookie configuration and withdrawal.
- Verified existing GA4 measurement ID `G-W6K9P0BBG1`, property `337945309`, web stream `4169152303`. Enhanced measurement turned off in GA4 on 15 October to avoid duplicate/automatic events. No data collection verified yet.
- Google script loads only after explicit opt-in on linguative.net/www.linguative.net. Equal allow/decline controls, Arabic support, persistent Privacy choices button. Declining leaves forms usable. No advertising storage, Google signals or personalised advertising enabled by this code.
- Manual page views use a public route allowlist and strip queries/fragments. Referrers are reduced to origins. Contact clicks record only phone/email/WhatsApp category. Successful contact/quote submissions emit `generate_lead` only after the existing HTTP/JSON success check. No form contents or recipient addresses sent in custom parameters.
- All 64 sitemap pages plus two privacy pages reference new versioned assets. Existing PHP forms, server configuration, redirects, media and old assets remain untouched. The full payload is private review material; do not commit it to a public repository.

## Checks and limits

Run `node --test test_analytics.cjs`. The release validation also exercises the patched form function against mock success/failure responses and tests deployment dry run, mismatch rejection, apply and rollback on a disposable copy. No real enquiry is submitted. These tests do not establish live GA4 receipt, cookie/network behaviour in every browser, or legal compliance. After publishing, use Tag Assistant and GA4 DebugView/Realtime with explicit consent to verify exactly one page view per navigation and one lead per successful submission. Verify decline/withdrawal creates no further analytics events, normal forms work, and URL/form information is absent from requests. Then confirm `generate_lead` as the intended key event in GA4; do not count contact clicks as completed enquiries.

## Deployment

The installer defaults to a full preflight dry run and refuses any file that differs from the reviewed snapshot. Publish both copy and privacy/tag changes together. First review `copy-changes.json` and the consent UI. Hosting access is required; this package does not deploy itself.

```sh
python3 install_update.py --root /path/to/webroot --backup /private/path/linguative-before-20261015
python3 install_update.py --root /path/to/webroot --backup /private/path/linguative-before-20261015 --apply
```

Use an empty backup path outside the public webroot. The update backs up all replaced files and writes each file atomically, assets before HTML. Deployment is not a whole-site transaction: if interrupted, restore using rollback below. Do not manually copy only selected HTML files or overwrite index.php. Keep the old JS bundle until the rollback window has passed. Clear any page/CDN cache and verify EN/AR pages, forms and analytics.

```sh
python3 install_update.py --root /path/to/webroot --backup /private/path/linguative-before-20261015 --rollback
python3 install_update.py --root /path/to/webroot --backup /private/path/linguative-before-20261015 --rollback --apply
```

Rollback validates backups and refuses to overwrite files modified after this release. It restores the reviewed HTML and removes only the new assets whose hashes match.

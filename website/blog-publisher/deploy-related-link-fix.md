# Deploy the article-link hydration fix

This is a one-file update to the installed publisher, not a reinstallation. Article copy and cron are unchanged. The approved bilingual article remains held in PR #95 until this update is positively verified on the host.

## Reviewed source

- Review: https://github.com/alaabusharif/linguative-automation/pull/96
- Immutable source revision: `0cb925ce100ee71b71d4707086502222d8cd4a18`
- Publisher SHA-256: `d6812d29027c35688a5b82b734fce31a27f72c891cfb8db243c13be11715d8e9`
- Previously installed SHA-256: `36fb5ee7eb13466e61544439b04e58853024f1870b09f0299a73a11eae1f6b7c`

## Host update

Run as the existing site owner on the production host. This checks the existing version, verifies the fixed source, takes a backup, and replaces the private executable under the publisher's existing lock. Unexpected installed content aborts. Do not change the cron, publish the draft catalog, or overwrite private configuration.

```bash
python3 - <<'PY'
import datetime, fcntl, hashlib, os, pathlib, shutil, tempfile, urllib.request
folder = pathlib.Path('/var/www/linguative_n_usr/data/www/linguative.net/private/blog-publisher')
target = folder / 'publisher.py'
expected_old = '36fb5ee7eb13466e61544439b04e58853024f1870b09f0299a73a11eae1f6b7c'
expected_new = 'd6812d29027c35688a5b82b734fce31a27f72c891cfb8db243c13be11715d8e9'
url = 'https://raw.githubusercontent.com/alaabusharif/linguative-automation/0cb925ce100ee71b71d4707086502222d8cd4a18/website/blog-publisher/publisher.py'
digest = lambda b: hashlib.sha256(b).hexdigest()
with (folder / 'lock').open('a') as lock:
    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    old = target.read_bytes()
    if digest(old) == expected_new:
        print('Fixed publisher already installed; no changes')
    else:
        if digest(old) != expected_old:
            raise SystemExit('STOP: installed publisher differs from the reviewed baseline')
        with urllib.request.urlopen(url, timeout=30) as response:
            blob = response.read(100000)
        if digest(blob) != expected_new:
            raise SystemExit('STOP: downloaded publisher checksum differs')
        compile(blob, str(target), 'exec')
        stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
        backup = folder / ('publisher.py.before-link-fix-' + stamp)
        shutil.copy2(target, backup)
        fd, temporary = tempfile.mkstemp(prefix='.publisher-link-fix-', dir=folder)
        try:
            with os.fdopen(fd, 'wb') as output:
                output.write(blob)
            os.chmod(temporary, target.stat().st_mode & 0o777)
            os.replace(temporary, target)
        finally:
            if os.path.exists(temporary):
                os.unlink(temporary)
        if digest(target.read_bytes()) != expected_new:
            raise SystemExit('STOP: post-install checksum differs')
        print('Fixed publisher installed; backup:', backup.name)
    print('SHA-256:', digest(target.read_bytes()))
PY
python3 /var/www/linguative_n_usr/data/www/linguative.net/private/blog-publisher/publisher.py --root /var/www/linguative_n_usr/data/www/linguative.net/webroot --sync
```

The final command is a dry run. With main's empty catalog it should report `empty; no publication`; it does not prove a real article has been published.

## Release handoff

Record host output and the checked hash in PR #95. Recheck compatibility with the current deployed site. Ala's exact EN/AR approval was given in ChatGPT on 20 October 2026; PR #95 records the attribution and digest. No further copy approval is needed if `{slug,en,ar}` remains unchanged.

Only after host verification, change article status to approved, preserve the exact content digest and approval record, and merge the scoped catalog handoff when checks permit it. Let the existing cron publish it. Verify both public language URLs, actual content, canonicals/hreflang, Insights links and sitemap before reporting Published. Do not infer Google indexing from HTTP 200.

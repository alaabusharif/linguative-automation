"""Hash-guarded deployment. Dry run by default. Back up outside the public webroot."""
import argparse,hashlib,json,os,pathlib,shutil,tempfile
HERE=pathlib.Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()
def digest(p): return sha(p.read_bytes()) if p.exists() else None
def atomic(p,data,mode=0o644):
    p.parent.mkdir(parents=True,exist_ok=True)
    fd,name=tempfile.mkstemp(dir=p.parent,prefix='.linguative-update-')
    try:
        with os.fdopen(fd,'wb') as f:f.write(data)
        os.chmod(name,mode);os.replace(name,p)
    finally:
        if os.path.exists(name):os.unlink(name)
def run(root,backup,apply=False,rollback=False):
    root=root.resolve();backup=backup.resolve()
    if root==backup or root in backup.parents:raise ValueError('Backup must be outside the public webroot')
    records=json.loads((HERE/'manifest.json').read_text())['files']
    # Validate the entire update before changing any file.
    for r in records:
        rel=pathlib.PurePosixPath(r['path'])
        if rel.is_absolute() or '..' in rel.parts:raise ValueError('Unsafe path')
        target=root/r['path']
        if root not in target.resolve().parents:raise ValueError('Symlink escapes webroot')
        if rollback:
            if digest(target) not in [r['before'],r['after']]:raise ValueError('Modified since update: '+r['path'])
            if r['before'] is not None and digest(backup/r['path'])!=r['before']:raise ValueError('Missing or changed backup: '+r['path'])
        else:
            if digest(target)!=r['before']:raise ValueError('Site differs from reviewed snapshot: '+r['path'])
            if digest(HERE/'payload'/r['path'])!=r['after']:raise ValueError('Payload checksum failed: '+r['path'])
    if not apply:print('Dry run passed: '+str(len(records))+' files. Nothing changed.');return
    if not rollback:
        if backup.exists():raise ValueError('Use a new, empty backup path')
        backup.mkdir(parents=True)
        for r in records:
            if r['before'] is not None:
                dst=backup/r['path'];dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(root/r['path'],dst)
    for r in records:
        target=root/r['path']
        if rollback and r['before'] is None:
            if target.exists():target.unlink()
        else:
            source=(backup if rollback else HERE/'payload')/r['path']
            atomic(target,source.read_bytes(),target.stat().st_mode & 0o777 if target.exists() else 0o644)
    print(('Rollback' if rollback else 'Update')+' complete. Verify the live site and analytics before declaring success.')
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--root',type=pathlib.Path,required=True);p.add_argument('--backup',type=pathlib.Path,required=True);p.add_argument('--apply',action='store_true');p.add_argument('--rollback',action='store_true');a=p.parse_args();run(a.root,a.backup,a.apply,a.rollback)

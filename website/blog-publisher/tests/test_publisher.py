import copy,importlib.util,json,pathlib,shutil,subprocess,tempfile,unittest
from unittest import mock
MODULE=pathlib.Path(__file__).parents[1]/'publisher.py';spec=importlib.util.spec_from_file_location('publisher',MODULE);p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
SNAPSHOT=pathlib.Path('/workspace/scratch/linguative-experience-20261016/snapshot')
def example():
 c={'title':'Test article <safe>','description':'A test-only description.','summary':'An internal test only.','sections':[{'heading':'Test heading','paragraphs':['Text <script>alert(1)</script> stays escaped.'],'bullets':['One item']}],'related':['simultaneous-interpretation']}
 a={'slug':'publisher-test-only','status':'approved','en':c,'ar':dict(c,title='مقال للاختبار فقط')}
 a['approval']={'by':'Ala','record':'https://github.com/alaabusharif/linguative-automation/pull/1','content_sha256':p.sha(p.canonical({k:a[k] for k in ['slug','en','ar']}))}
 return {'version':1,'articles':[a]}
class Validation(unittest.TestCase):
 def test_drafts_do_not_publish(self):
  c=example();c['articles'][0]['status']='draft';self.assertEqual(p.validate(c),[])
 def test_changed_content_requires_new_approval(self):
  c=example();c['articles'][0]['en']['title']='Changed'
  with self.assertRaises(ValueError):p.validate(c)
 def test_paths_and_bilingual_validation(self):
  c=example();c['articles'][0]['slug']='../../private/config'
  with self.assertRaises(ValueError):p.validate(c)
  c=example();del c['articles'][0]['ar']
  with self.assertRaises(ValueError):p.validate(c)
@unittest.skipUnless(SNAPSHOT.exists(),'Integration needs the current site snapshot')
class Site(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.root=pathlib.Path(self.tmp.name)/'site/webroot';shutil.copytree(SNAPSHOT,self.root)
  private=self.root.parent/'private';private.mkdir();routes=['/' if f.name=='index.html' else '/'+f.relative_to(self.root).as_posix()[:-5] for f in self.root.rglob('*.html')];(private/'routes.json').write_text(json.dumps(routes));self.c=example()
 def tearDown(self):self.tmp.cleanup()
 def test_build_publish_noop_and_update(self):
  before=(self.root/'index.html').read_bytes();self.assertEqual(p.run(self.root,self.c)['status'],'dry-run passed');self.assertEqual((self.root/'index.html').read_bytes(),before)
  r=p.run(self.root,self.c,True);self.assertEqual(r['status'],'published')
  for lang in ['', 'ar/']:
   s=(self.root/lang/'insights/publisher-test-only.html').read_text();self.assertIn('dir="rtl"' if lang else 'dir="ltr"',s);self.assertIn('&lt;script&gt;',s);self.assertNotIn('<script>alert',s);self.assertIn('hreflang="ar" href="https://linguative.net/ar/insights/publisher-test-only"',s)
   index=(self.root/lang/'insights.html').read_text();self.assertEqual(index.count('href="/'+lang+'insights/publisher-test-only"'),1)
  bundle=next((self.root/'assets').glob('index-blog-*.js'));subprocess.run(['node','--check',str(bundle)],check=True)
  self.assertEqual(p.run(self.root,self.c,True)['status'],'unchanged')
  c=example();c['articles'][0]['en']['title']='Revised test';c['articles'][0]['approval']['content_sha256']=p.sha(p.canonical({k:c['articles'][0][k] for k in ['slug','en','ar']}))
  self.assertEqual(p.run(self.root,c,True)['status'],'published');self.assertIn('Revised test',(self.root/'insights.html').read_text())
  latest=(self.root/'index.html').read_text();import re
  ref=re.search(r'src="(/assets/index-blog-[^"]+)',latest)[1];subprocess.run(['node','--check',str(self.root/ref.lstrip('/'))],check=True)
  self.assertIn('window.LinguativeAnalytics?.trackLead',(self.root/ref.lstrip('/')).read_text())
  empty={'version':1,'articles':[]}
  with self.assertRaises(ValueError):p.run(self.root,empty,True)
 def test_existing_pages_are_protected(self):
  c=example();c['articles'][0]['slug']='conference-interpretation-equipment-rental-brief';c['articles'][0]['approval']['content_sha256']=p.sha(p.canonical({k:c['articles'][0][k] for k in ['slug','en','ar']}))
  with self.assertRaises(ValueError):p.run(self.root,c,True)
 def test_write_failure_rolls_back(self):
  original={f.relative_to(self.root):f.read_bytes() for f in self.root.rglob('*') if f.is_file()};writer=p.atomic;calls=0
  def fail_once(path,data):
   nonlocal calls
   calls+=1
   if calls==5:raise OSError('Simulated interrupted publication')
   return writer(path,data)
  with mock.patch.object(p,'atomic',fail_once):
   with self.assertRaises(OSError):p.run(self.root,self.c,True)
  self.assertEqual(original,{f.relative_to(self.root):f.read_bytes() for f in self.root.rglob('*') if f.is_file()})
if __name__=='__main__':unittest.main()

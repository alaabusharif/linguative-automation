import copy,importlib.util,json,os,pathlib,shutil,subprocess,tempfile,unittest
from unittest import mock
MODULE=pathlib.Path(__file__).parents[1]/'publisher.py';spec=importlib.util.spec_from_file_location('publisher',MODULE);p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
SNAPSHOT=pathlib.Path(os.environ.get('LINGUATIVE_TEST_SNAPSHOT','/workspace/scratch/linguative-experience-20261016/snapshot'))
def example():
 c={'title':'Test article <safe>','description':'A test-only description.','summary':'An internal test only.','intro':'A test short answer.','eyebrow':'Practical planning guide','readingTime':'3 min read','checklistTitle':'Test checklist','checklist':['Test checklist item'],'faq':[['Test question?','Test answer.']],'relatedHeading':'Related services','ctaLabel':'Request a quote ↗','sections':[{'heading':'Test heading','paragraphs':['Text <script>alert(1)</script> stays escaped.'],'bullets':['One item']}],'related':['simultaneous-interpretation']}
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
 def test_matches_existing_article_design(self):
  self.assertEqual(p.run(self.root,self.c,True)['status'],'published')
  for prefix in ['', 'ar/']:
   old=p.DOM((self.root/prefix/p.TEMPLATE).read_text()).root
   new=p.DOM((self.root/prefix/'insights/publisher-test-only.html').read_text()).root
   # Existing hero sizing, typography, grid, sidebar, article, checklist, FAQ,
   # related services and final CTA must retain their exact design attributes.
   for tag,cls in [
    ('section','relative isolate overflow-hidden bg-navy text-ivory'),
    ('article','mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24'),
    ('div','grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-20'),
    ('aside','max-w-sm'),
    ('section','mt-8 bg-navy p-7 text-ivory sm:p-9'),
    ('section','mt-14'),
    ('section','mx-auto max-w-7xl border-t border-gold/35 px-5 py-14 sm:px-8'),
    ('section','lng-cta-band bg-navy text-ivory')]:
    self.assertEqual(new.one(tag,cls).attrs,old.one(tag,cls).attrs)
   self.assertEqual(new.one('h1').attrs,old.one('h1').attrs)
   self.assertEqual(new.one('section','lng-cta-band bg-navy text-ivory').render(),old.one('section','lng-cta-band bg-navy text-ivory').render())
   self.assertEqual([n.attrs for n in new.nodes('link') if n.attrs.get('rel')=='stylesheet'],[n.attrs for n in old.nodes('link') if n.attrs.get('rel')=='stylesheet'])
   self.assertEqual(len(new.nodes('script',type='application/ld+json')),len(old.nodes('script',type='application/ld+json')))
   self.assertEqual(new.one('a',href='#section-1').children,['Test heading'])
   self.assertEqual(len(new.nodes('a',href=('/insights/' if prefix else '/ar/insights/')+'publisher-test-only')),1)
  import re
  ref=re.search(r'src="(/assets/index-blog-[^"]+)',(self.root/'index.html').read_text())[1]
  bundle=(self.root/ref.lstrip('/')).read_text()
  self.assertNotIn('LinguativeBlogPage',bundle)
  self.assertIn('articleSlug:"publisher-test-only"',bundle)
  self.assertIn('children:n.byline||(',bundle)
  self.assertIn('dateModified:n.modified||',bundle)
 def test_empty_catalog_never_writes_site(self):
  before={f.relative_to(self.root):f.read_bytes() for f in self.root.rglob('*') if f.is_file()}
  self.assertEqual(p.run(self.root,{'version':1,'articles':[]},True)['status'],'empty; no publication')
  self.assertEqual(before,{f.relative_to(self.root):f.read_bytes() for f in self.root.rglob('*') if f.is_file()})
 def test_incompatible_build_stops_before_publication(self):
  import re
  ref=re.search(r'src="(/assets/index-[^"?]+)',(self.root/'index.html').read_text())[1]
  (self.root/ref.lstrip('/')).write_text('Unknown application build')
  before={f.relative_to(self.root):f.read_bytes() for f in self.root.rglob('*') if f.is_file()}
  with self.assertRaises(AssertionError):p.run(self.root,self.c,True)
  self.assertEqual(before,{f.relative_to(self.root):f.read_bytes() for f in self.root.rglob('*') if f.is_file()})
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

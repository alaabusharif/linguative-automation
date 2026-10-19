"""Linguative approved article publisher. Stdlib only; dry run unless --apply.
Install a reviewed copy outside webroot. Sync fetches data, never executable code.
"""
import argparse,datetime as dt,hashlib,html,json,os,pathlib,re,tempfile,urllib.request,fcntl,copy
from html.parser import HTMLParser
ORIGIN='https://linguative.net'
CATALOG='https://raw.githubusercontent.com/alaabusharif/linguative-automation/main/website/blog-publisher/catalog.json'
SERVICES={'translation','transcription','simultaneous-interpretation','consecutive-interpretation','conference-interpretation-equipment-rental','conference-technology-av','hybrid-virtual-conference-solutions','event-conference-management','video-production-subtitling'}
sha=lambda b:hashlib.sha256(b).hexdigest()
def canonical(obj):return json.dumps(obj,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def text(s):
 if not isinstance(s,str) or not s.strip() or len(s)>12000:raise ValueError('Missing, empty or excessive text')
 return s

def validate(catalog):
 if catalog.get('version')!=1 or not isinstance(catalog.get('articles'),list) or len(catalog['articles'])>100:raise ValueError('Invalid catalog')
 slugs=set();articles=[]
 for a in catalog['articles']:
  slug=a.get('slug','')
  if not re.fullmatch('[a-z0-9]+(?:-[a-z0-9]+)*',slug) or len(slug)>100 or slug in slugs:raise ValueError('Invalid or duplicate slug')
  slugs.add(slug)
  if a.get('status')!='approved':continue
  approval=a.get('approval',{})
  if approval.get('by')!='Ala' or not re.fullmatch(r'https://github\.com/alaabusharif/linguative-automation/pull/[1-9][0-9]*',approval.get('record','')):raise ValueError('Explicit approval reference is required')
  content={'slug':slug,'en':a.get('en'),'ar':a.get('ar')}
  if approval.get('content_sha256')!=sha(canonical(content)):raise ValueError('Approval does not match exact bilingual content')
  for lang in ['en','ar']:
   c=a.get(lang)
   if not isinstance(c,dict):raise ValueError('Both EN and AR are required')
   for key in ['title','description','summary','intro','eyebrow','readingTime','checklistTitle','relatedHeading','ctaLabel']:text(c.get(key))
   if not isinstance(c.get('checklist'),list) or not 1<=len(c['checklist'])<=20:raise ValueError('Article needs a checklist')
   for item in c['checklist']:text(item)
   if not isinstance(c.get('faq'),list) or not 1<=len(c['faq'])<=12:raise ValueError('Article needs FAQ entries')
   for pair in c['faq']:
    if not isinstance(pair,list) or len(pair)!=2:raise ValueError('Invalid FAQ pair')
    for item in pair:text(item)
   if c.get('quoteService','') not in SERVICES|{''}:raise ValueError('Unknown quote service')
   sections=c.get('sections')
   if not isinstance(sections,list) or not 1<=len(sections)<=20:raise ValueError('Article needs sections')
   for section in sections:
    text(section.get('heading'))
    paragraphs=section.get('paragraphs')
    if not isinstance(paragraphs,list) or not 1<=len(paragraphs)<=12:raise ValueError('Article needs paragraphs')
    for p in paragraphs:text(p)
    for b in section.get('bullets',[]):text(b)
   if not isinstance(c.get('related'),list) or not 1<=len(c['related'])<=9 or not set(c['related'])<=SERVICES:raise ValueError('Unknown related service')
  articles.append(a)
 return articles

def atomic(p,b):
 p=pathlib.Path(p);p.parent.mkdir(parents=True,exist_ok=True);stat=p.stat() if p.exists() else p.parent.stat()
 fd,tmp=tempfile.mkstemp(prefix='.lng-blog-',dir=p.parent)
 try:
  with os.fdopen(fd,'wb') as f:f.write(b)
  os.chmod(tmp,(stat.st_mode&0o777) if p.exists() else 0o644)
  if hasattr(os,'geteuid') and os.geteuid()==0:os.chown(tmp,stat.st_uid,stat.st_gid)
  os.replace(tmp,p)
 finally:
  if os.path.exists(tmp):os.unlink(tmp)

# Clone the existing article document rather than introducing a second design.
TEMPLATE='insights/conference-interpretation-equipment-rental-brief.html'
class Node:
 def __init__(self,tag='',attrs=(),children=()):self.tag=tag;self.attrs=dict(attrs);self.children=list(children)
 def nodes(self,tag=None,cls=None,**attrs):
  found=[]
  for child in self.children:
   if not isinstance(child,Node):continue
   if (tag is None or child.tag==tag) and (cls is None or child.attrs.get('class')==cls) and all(child.attrs.get(k)==v for k,v in attrs.items()):found.append(child)
   found.extend(child.nodes(tag,cls,**attrs))
  return found
 def one(self,tag=None,cls=None,**attrs):
  found=self.nodes(tag,cls,**attrs)
  if len(found)!=1:raise ValueError('Article template changed: expected one '+str((tag,cls,attrs)))
  return found[0]
 def put(self,value):self.children=[value];return self
 def render(self):
  if self.tag in ('!','?'):return self.children[0]
  body=''.join(c.render() if isinstance(c,Node) else c if self.tag in ('script','style') else html.escape(c,quote=False) for c in self.children)
  if not self.tag:return body
  attrs=''.join(' '+k+('="'+html.escape(v,quote=True)+'"' if v is not None else '') for k,v in self.attrs.items())
  return '<'+self.tag+attrs+'>'+('' if self.tag in DOM.void else body+'</'+self.tag+'>')
class DOM(HTMLParser):
 void={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
 def __init__(self,source):
  super().__init__(convert_charrefs=True);self.root=Node();self.stack=[self.root];self.feed(source);self.close()
  if len(self.stack)!=1:raise ValueError('Unbalanced article template')
 def handle_starttag(self,tag,attrs):
  node=Node(tag,attrs);self.stack[-1].children.append(node)
  if tag not in self.void:self.stack.append(node)
 def handle_startendtag(self,tag,attrs):
  self.handle_starttag(tag,attrs)
  if tag not in self.void:self.handle_endtag(tag)
 def handle_endtag(self,tag):
  if len(self.stack)<2 or self.stack[-1].tag!=tag:raise ValueError('Unexpected closing tag '+tag)
  self.stack.pop()
 def handle_data(self,data):self.stack[-1].children.append(data)
 def handle_comment(self,data):self.stack[-1].children.append(Node('!',children=['<!--'+data+'-->']))
 def handle_decl(self,data):self.stack[-1].children.append(Node('!',children=['<!'+data+'>']))

def article_data(a,lang):
 c=a[lang]
 return dict(title=c['title'],metaTitle=c['title']+' | Linguative',metaDescription=c['description'],dek=c['summary'],intro=c['intro'],eyebrow=c['eyebrow'],readingTime=c['readingTime'],sections=[dict(heading=s['heading'],body=s['paragraphs'],**({'bullets':s['bullets']} if s.get('bullets') else {})) for s in c['sections']],checklistTitle=c['checklistTitle'],checklist=c['checklist'],faq=c['faq'],related=c['related'],relatedHeading=c['relatedHeading'],quoteService=c.get('quoteService',''),ctaLabel=c['ctaLabel'],date=a['_date'],modified=a['_modified'],byline=('إعداد: فريق شركة الإبداع اللغوي · ' if lang=='ar' else 'By the Linguative editorial team · ')+a['_date'])

def schemas(a,lang,n):
 pre='/ar' if lang=='ar' else '';url=ORIGIN+pre+'/insights/'+a['slug']
 article={'@context':'https://schema.org','@type':'Article','@id':url+'#article','url':url,'isPartOf':{'@id':ORIGIN+'/#website'},'headline':n['title'],'dateCreated':n['date'],'dateModified':n['modified'],'description':n['metaDescription'],'inLanguage':lang,'mainEntityOfPage':url,'author':{'@id':ORIGIN+'/#organization'},'publisher':{'@id':ORIGIN+'/#organization'}}
 faq={'@context':'https://schema.org','@type':'FAQPage','mainEntity':[{'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':v}} for q,v in n['faq']]}
 crumbs={'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'الرئيسية' if lang=='ar' else 'Home','item':ORIGIN+('/ar' if lang=='ar' else '/')},{'@type':'ListItem','position':2,'name':'المعرفة والموارد' if lang=='ar' else 'Insights','item':ORIGIN+pre+'/insights'},{'@type':'ListItem','position':3,'name':n['title'],'item':url}]}
 return [article,faq,crumbs]

def new_page(template,a,lang,service_titles):
 n=article_data(a,lang);pre='/ar' if lang=='ar' else '';url=ORIGIN+pre+'/insights/'+a['slug'];doc=DOM(template).root
 doc.one('html').attrs.update(lang=lang,dir='rtl' if lang=='ar' else 'ltr')
 doc.one('title').put(n['metaTitle'])
 for m in doc.nodes('meta'):
  name=m.attrs.get('name',m.attrs.get('property'))
  if name in ('description','og:description','twitter:description'):m.attrs['content']=n['metaDescription']
  elif name in ('og:title','twitter:title'):m.attrs['content']=n['metaTitle']
  elif name=='og:url':m.attrs['content']=url
  elif name=='og:type':m.attrs['content']='article'
 for link in doc.nodes('link'):
  if link.attrs.get('rel')=='canonical':link.attrs['href']=url
  elif link.attrs.get('hreflang') in ('en','ar','x-default'):link.attrs['href']=ORIGIN+('/ar' if link.attrs['hreflang']=='ar' else '')+'/insights/'+a['slug']
 original=('/insights/' if lang=='ar' else '/ar/insights/')+TEMPLATE.split('/')[-1][:-5]
 for link in doc.one('header').nodes('a'):
  if link.attrs.get('href')==original:link.attrs['href']=('/insights/' if lang=='ar' else '/ar/insights/')+a['slug']
 ld={x['@type']:x for x in schemas(a,lang,n)}
 for script in doc.nodes('script',type='application/ld+json'):
  value=json.loads(''.join(script.children))
  if isinstance(value,dict) and value.get('@type') in ld:script.put(json.dumps(ld.pop(value['@type']),ensure_ascii=False,separators=(',',':')).replace('<',r'\u003c'))
 if ld:raise ValueError('Article structured-data template changed')
 main=doc.one('main');hero,article,related,cta=[x for x in main.children if isinstance(x,Node)]
 hero.one('p',cls='linguative-eyebrow text-gold').put(n['eyebrow']);hero.one('h1').put(n['title'])
 hero.one('p',cls='text-lg leading-relaxed text-ivory/78 sm:text-xl').put(n['dek'])
 hero.one('p',cls='mt-5 text-sm text-ivory/60').put(n['readingTime']);hero.one('p',cls='mt-3 text-sm text-ivory/70').put(n['byline'])
 aside=article.one('aside');toc=aside.one('ol');toc_item=copy.deepcopy(toc.nodes('li')[0]);toc.children=[]
 for i,section in enumerate(n['sections'],1):
  item=copy.deepcopy(toc_item);item.one('a').attrs['href']='#section-'+str(i);item.one('a').put(section['heading']);toc.children.append(item)
 aside.one('p',cls='mt-5 text-lg leading-relaxed text-navy/78').put(n['intro'])
 quote=aside.one('a',cls='mt-7 inline-flex min-h-11 items-center border-b border-gold text-sm font-semibold text-gold-dark');quote.put(n['ctaLabel']);quote.attrs['href']=pre+'/request-a-quote'+('?service='+n['quoteService'] if n['quoteService'] else '')
 body=article.one('div',cls='max-w-3xl');section_template=copy.deepcopy(body.nodes('section',id='section-1')[0]);check=copy.deepcopy(body.one('section',cls='mt-8 bg-navy p-7 text-ivory sm:p-9'));faq=copy.deepcopy(body.one('section',cls='mt-14'));body.children=[]
 for i,section in enumerate(n['sections'],1):
  node=copy.deepcopy(section_template);node.attrs['id']='section-'+str(i);node.one('h2').put(section['heading']);paragraphs=node.one('div',cls='mt-5 space-y-4');prototype=copy.deepcopy(paragraphs.nodes('p')[0]);paragraphs.children=[]
  for value in section['body']:paragraphs.children.append(copy.deepcopy(prototype).put(value))
  node.children=[x for x in node.children if not isinstance(x,Node) or x.tag!='ul']
  if section.get('bullets'):node.children.append(Node('ul',{'class':'mt-6 grid gap-3 sm:grid-cols-2'},[Node('li',{'class':'border-s-2 border-gold ps-4 text-sm leading-relaxed text-navy/70'},[v]) for v in section['bullets']]))
  body.children.append(node)
 check.one('h2').put(n['checklistTitle']);items=check.one('ol');prototype=copy.deepcopy(items.nodes('li')[0]);items.children=[]
 for i,value in enumerate(n['checklist'],1):
  node=copy.deepcopy(prototype);spans=node.nodes('span');spans[0].put(str(i).zfill(2));spans[1].put(value);items.children.append(node)
 answers=faq.one('div',cls='mt-6');prototype=copy.deepcopy(answers.nodes('div',cls='border-t border-navy/10 py-6')[0]);answers.children=[]
 for question,answer in n['faq']:
  node=copy.deepcopy(prototype);node.one('h3').put(question);node.one('p').put(answer);answers.children.append(node)
 body.children.extend([check,faq]);related.one('h2').put(n['relatedHeading']);items=related.one('ul');prototype=copy.deepcopy(items.nodes('li')[0]);items.children=[]
 for slug in n['related']:
  node=copy.deepcopy(prototype);link=node.one('a');link.attrs['href']=pre+'/services/'+slug;link.put(service_titles[slug]+' ↗');items.children.append(node)
 return doc.render()

def build(root,catalog,state):
 articles=validate(catalog)
 if not articles:return {}
 now=dt.datetime.now(dt.timezone.utc).isoformat();today=now[:10]
 for a in articles:
  record=state.get('articles',{}).get(a['slug'],{});a['_date']=record.get('published',today);a['_modified']=record.get('modified',today) if record.get('approval',{}).get('content_sha256')==a['approval']['content_sha256'] else today
 files={p.relative_to(root).as_posix():p.read_text() for p in root.rglob('*.html') if p.is_file() and p.parent!=root/'api' and p.relative_to(root).as_posix() in state['_routes_files']}
 assert 'about.html' in files and 'ar/about.html' in files and 'insights.html' in files
 home=files['index.html'];oldbundle=re.findall(r'<script\b[^>]*src="(/assets/index-[^"?]+\.js)',home);assert len(oldbundle)==1
 oldbundle=oldbundle[0];js=(root/oldbundle.lstrip('/')).read_text()
 # Version guard: fail closed if the deployed app no longer has the reviewed integration points.
 anchor='(0,k.jsx)(W,{path:`/about`,element:(0,k.jsx)(Rs,{lang:`en`})})'
 assert js.count(anchor)==1 and 'Object.entries(Ms).map' in js,'Unsupported site build'
 js=re.sub(r'/\*LNG_BLOG_ROUTES_START\*/.*?/\*LNG_BLOG_ROUTES_END\*/','',js,flags=re.S)
 js=re.sub(r'/\*LNG_BLOG_DATA_START\*/.*?/\*LNG_BLOG_DATA_END\*/','',js,flags=re.S)
 # Use the exact existing React article component and its current CSS classes.
 start=js.index('function Y({lang:e,articleSlug:t})');end=js.index('async function ',start)
 native=js[start:end]
 old='dateCreated:n.date,dateModified:`2026-10-10`';new='dateCreated:n.date,dateModified:n.modified||`2026-10-10`'
 if new not in native:
  assert native.count(old)==1,'Article dates changed';native=native.replace(old,new)
 byline=re.search(r'(className:`mt-3 text-sm text-ivory/70`,children:)(t\?.*?)(\}\)\]\})',native)
 if 'children:n.byline||(' not in native:
  assert byline,'Article byline changed';native=native[:byline.start(2)]+'n.byline||('+byline[2]+')'+native[byline.end(2):]
 js=js[:start]+native+js[end:]
 entries={a['slug']:{lang:article_data(a,lang) for lang in ['en','ar']} for a in articles}
 data='/*LNG_BLOG_DATA_START*/var LinguativeBlogData='+json.dumps(entries,ensure_ascii=False).replace('<',r'\u003c')+';Object.assign(Ms,LinguativeBlogData);/*LNG_BLOG_DATA_END*/'
 routes='/*LNG_BLOG_ROUTES_START*/'+','.join('(0,k.jsx)(W,{path:'+json.dumps(('/ar' if lang=='ar' else '')+'/insights/'+a['slug'])+',element:(0,k.jsx)(Y,{lang:'+json.dumps(lang)+',articleSlug:'+json.dumps(a['slug'])+'})})' for a in articles for lang in ['en','ar'])+',/*LNG_BLOG_ROUTES_END*/'
 js=js.replace(anchor,routes+anchor);boot='var rc=document.getElementById(`root`);';assert js.count(boot)==1;js=js.replace(boot,data+boot)
 newbundle='/assets/index-blog-'+sha(js.encode())[:12]+'.js';out={newbundle.lstrip('/'):js.encode()}
 oldtag=re.findall(r'<script\b[^>]*src="(/assets/analytics-consent-[^"]+\.js)',home);assert len(oldtag)==1;oldtag=oldtag[0];tag=(root/oldtag.lstrip('/')).read_text()
 m=re.search(r'\}\)\((\{.*\})\);\s*$',tag,re.S);assert m,'Analytics route allowlist missing';route_titles=json.loads(m[1])
 for a in articles:
  for lang in ['en','ar']:route_titles[('/ar' if lang=='ar' else '')+'/insights/'+a['slug']]=a[lang]['title']+' | Linguative'
 tag=tag[:m.start(1)]+json.dumps(route_titles,ensure_ascii=False)+tag[m.end(1):];newtag='/assets/analytics-consent-'+sha(tag.encode())[:12]+'.js';out[newtag.lstrip('/')]=tag.encode()
 for f,s in files.items():
  s=re.sub(r'<script\b[^>]*>\s*\(function\s*\(\)\s*\{\s*function syncQuoteLanguageTags\(\).*?</script>','',s,flags=re.S)
  out[f]=s.replace(oldbundle,newbundle).replace(oldtag,newtag).encode()
 for lang in ['en','ar']:
  pre='/ar' if lang=='ar' else '';f=('ar/' if lang=='ar' else '')+'insights.html';s=out[f].decode()
  # The existing list is server-rendered, so new links work before hydration too.
  for a in articles:
   href=pre+'/insights/'+a['slug']
   if 'href="'+href+'"' in s:
    pattern=r'(<a\b[^>]*href="'+re.escape(href)+r'"[^>]*>).*?(</a>)'
    s=re.sub(pattern,lambda m:m[1]+html.escape(a[lang]['title'])+' ↗'+m[2],s,flags=re.S)
    continue
   p=s.index('class="lng-insight-topic');end=s.index('</ol>',p)
   row='<li class="lng-insight-topic flex gap-4 border-t border-navy/10 py-5"><span class="font-heading text-xs text-gold-dark">'+str(len(re.findall('class="lng-insight-topic',s))+1).zfill(2)+'</span><a class="text-lg leading-relaxed text-navy hover:text-gold-dark" href="'+href+'">'+html.escape(a[lang]['title'])+' ↗</a></li>'
   s=s[:end]+row+s[end:]
  out[f]=s.encode()
  template=out[('ar/' if lang=='ar' else '')+TEMPLATE].decode()
  service_titles={}
  for slug in SERVICES:
   service=DOM(files[('ar/' if lang=='ar' else '')+'services/'+slug+'.html']).root
   service_titles[slug]=''.join(x for x in service.one('h1').children if isinstance(x,str))
  for a in articles:out[('ar/' if lang=='ar' else '')+'insights/'+a['slug']+'.html']=new_page(template,a,lang,service_titles).encode()
 sitemap=(root/'sitemap.xml').read_text()
 for a in articles:
  for lang in ['en','ar']:
   url=ORIGIN+('/ar' if lang=='ar' else '')+'/insights/'+a['slug']
   if '<loc>'+url+'</loc>' not in sitemap:sitemap=sitemap.replace('</urlset>','<url><loc>'+url+'</loc></url></urlset>')
 out['sitemap.xml']=sitemap.encode();return out

def run(root,catalog,apply=False):
 root=root.resolve();private=root.parent/'private';routesfile=private/'routes.json';assert routesfile.is_file()
 work=private/'blog-publisher';work.mkdir(exist_ok=True)
 with (work/'lock').open('w') as lock:
  fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
  statefile=work/'state.json';state=json.loads(statefile.read_text()) if statefile.exists() else {'articles':{}}
  approved=validate(catalog);digest=sha(canonical(catalog))
  if state.get('catalog_sha256')==digest:return {'status':'unchanged'}
  routes=json.loads(routesfile.read_text());assert isinstance(routes,list)
  existing={a['slug'] for a in approved};previous=set(state['articles'])
  if previous-existing:raise ValueError('Removing a published article needs a separate reviewed redirect/retirement change')
  for a in approved:
   for lang in ['en','ar']:
    p=('/ar' if lang=='ar' else '')+'/insights/'+a['slug']
    if p in routes and a['slug'] not in previous:raise ValueError('Refusing to overwrite an existing article')
  state['_routes_files']=['index.html' if r=='/' else r.lstrip('/')+'.html' for r in routes]
  input_paths=[routesfile,root/'sitemap.xml']+[root/f for f in state['_routes_files'] if (root/f).is_file()]
  home=(root/'index.html').read_text()
  input_paths.extend(root/p.lstrip('/') for p in re.findall(r'<script\b[^>]*src="(/assets/[^"?]+\.js)',home))
  baseline={p:p.read_bytes() for p in input_paths}
  output=build(root,copy.deepcopy(catalog),state)
  if any(not p.exists() or p.read_bytes()!=b for p,b in baseline.items()):raise ValueError('Site changed during preparation; aborting')
  if not output:return {'status':'empty; no publication'}
  newroutes=routes+[('/ar' if lang=='ar' else '')+'/insights/'+a['slug'] for a in approved for lang in ['en','ar'] if ('/ar' if lang=='ar' else '')+'/insights/'+a['slug'] not in routes]
  plan=[(root/f,b) for f,b in output.items()]+[(routesfile,(json.dumps(newroutes,ensure_ascii=False,indent=2)+'\n').encode())]
  if not apply:return {'status':'dry-run passed','files':len(plan),'articles':[a['slug'] for a in approved]}
  backup=work/('release-'+dt.datetime.now(dt.timezone.utc).strftime('%Y%m%dT%H%M%S%f'));backup.mkdir();journal=[]
  for i,(p,b) in enumerate(plan):
   before=p.read_bytes() if p.exists() else None
   if before is not None:(backup/str(i)).write_bytes(before)
   journal.append({'path':str(p),'backup':str(i) if before is not None else None,'before':sha(before) if before is not None else None,'after':sha(b)})
  (backup/'journal.json').write_text(json.dumps(journal,indent=2))
  changed=[]
  try:
   # Assets, then articles/pages, and routes/sitemap last. Restore all completed writes if any fails.
   ordered=sorted(zip(plan,journal),key=lambda x:0 if '/assets/' in str(x[0][0]) else 2 if x[0][0]==routesfile or x[0][0].name=='sitemap.xml' else 1)
   for (p,b),j in ordered:
    old=p.read_bytes() if p.exists() else None
    if (sha(old) if old is not None else None)!=j['before']:raise ValueError('Concurrent site change; aborting')
    atomic(p,b);changed.append(j)
   today=dt.datetime.now(dt.timezone.utc).date().isoformat()
   for a in approved:
    prior=state['articles'].get(a['slug'],{})
    modified=prior.get('modified',today) if prior.get('approval',{}).get('content_sha256')==a['approval']['content_sha256'] else today
    state['articles'][a['slug']]={'published':prior.get('published',today),'approval':a['approval'],'modified':modified}
   state.pop('_routes_files',None);state['catalog_sha256']=digest;state['last_backup']=str(backup);atomic(statefile,canonical(state))
  except Exception:
   for j in reversed(changed):
    p=pathlib.Path(j['path'])
    if j['backup'] is None:p.unlink()
    else:atomic(p,(backup/j['backup']).read_bytes())
   raise
  return {'status':'published','articles':[a['slug'] for a in approved],'backup':str(backup)}

if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--root',required=True,type=pathlib.Path);p.add_argument('--catalog',type=pathlib.Path);p.add_argument('--sync',action='store_true');p.add_argument('--apply',action='store_true');a=p.parse_args()
 if bool(a.catalog)==a.sync:p.error('Choose local --catalog or the fixed approved --sync source')
 if a.sync:
  with urllib.request.urlopen(urllib.request.Request(CATALOG,headers={'User-Agent':'Linguative-Blog-Publisher/1.0'}),timeout=30) as response:
   blob=response.read(2000001)
   if len(blob)>2000000:raise ValueError('Catalog exceeds 2 MB')
  catalog=json.loads(blob)
 else:catalog=json.loads(a.catalog.read_text())
 print(json.dumps(run(a.root,catalog,a.apply),ensure_ascii=False))

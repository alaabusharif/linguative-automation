"""Linguative approved article publisher. Stdlib only; dry run unless --apply.
Install a reviewed copy outside webroot. Sync fetches data, never executable code.
"""
import argparse,datetime as dt,hashlib,html,json,os,pathlib,re,tempfile,urllib.request,fcntl,copy
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
   for key in ['title','description','summary']:text(c.get(key))
   sections=c.get('sections')
   if not isinstance(sections,list) or not 1<=len(sections)<=20:raise ValueError('Article needs sections')
   for section in sections:
    text(section.get('heading'))
    paragraphs=section.get('paragraphs')
    if not isinstance(paragraphs,list) or not 1<=len(paragraphs)<=12:raise ValueError('Article needs paragraphs')
    for p in paragraphs:text(p)
    for b in section.get('bullets',[]):text(b)
   if not isinstance(c.get('related',[]),list) or not set(c.get('related',[]))<=SERVICES:raise ValueError('Unknown related service')
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

def main_html(a,lang):
 c=a[lang];pre='/ar' if lang=='ar' else '';esc=html.escape
 sections=''.join('<section class="border-t border-gold/30 py-9"><h2 class="font-heading text-2xl text-navy">'+esc(s['heading'])+'</h2>'+''.join('<p class="mt-5 leading-relaxed text-navy/80">'+esc(p)+'</p>' for p in s['paragraphs'])+('<ul class="mt-5 space-y-3">'+''.join('<li>• '+esc(b)+'</li>' for b in s.get('bullets',[]))+'</ul>' if s.get('bullets') else '')+'</section>' for s in c['sections'])
 related=''.join('<li><a class="border-b border-gold" href="'+pre+'/services/'+x+'">'+esc(x.replace('-',' ').title() if lang=='en' else {'translation':'الترجمة التحريرية','transcription':'التفريغ النصي','simultaneous-interpretation':'الترجمة الفورية','consecutive-interpretation':'الترجمة التتابعية','conference-interpretation-equipment-rental':'تأجير معدات الترجمة الفورية','conference-technology-av':'تقنيات المؤتمرات والصوت والصورة','hybrid-virtual-conference-solutions':'حلول المؤتمرات الهجينة والافتراضية','event-conference-management':'إدارة الفعاليات والمؤتمرات','video-production-subtitling':'إنتاج الفيديو والترجمة المرئية'}[x])+'</a></li>' for x in c.get('related',[]))
 return '<section class="bg-navy text-ivory"><div class="mx-auto max-w-5xl px-5 py-20"><p class="linguative-eyebrow text-gold">'+('المعرفة والموارد' if lang=='ar' else 'Linguative Insights')+'</p><h1 class="mt-6 font-heading text-4xl leading-tight">'+esc(c['title'])+'</h1><p class="mt-6 text-lg leading-relaxed">'+esc(c['summary'])+'</p><p class="mt-5 text-sm">'+('إعداد: فريق شركة الإبداع اللغوي · ' if lang=='ar' else 'By the Linguative editorial team · ')+a['_date']+'</p></div></section><article class="mx-auto max-w-3xl px-5 py-16">'+sections+'<nav class="mt-10"><h2 class="font-heading text-2xl">'+('خدمات ذات صلة' if lang=='ar' else 'Related services')+'</h2><ul class="mt-5 space-y-3">'+related+'</ul></nav></article><section class="bg-navy text-ivory"><div class="mx-auto max-w-3xl px-5 py-16"><h2 class="font-heading text-3xl">'+('خطّط لمشروعك مع فريق واحد' if lang=='ar' else 'Plan your project with one team')+'</h2><a class="mt-7 inline-flex border-b border-gold py-3 text-gold" href="'+pre+'/request-a-quote">'+('اطلب عرض سعر ↗' if lang=='ar' else 'Request a quote ↗')+'</a></div></section>'

def schema(a,lang):
 c=a[lang];url=ORIGIN+('/ar' if lang=='ar' else '')+'/insights/'+a['slug']
 return {'@context':'https://schema.org','@type':'Article','headline':c['title'],'description':c['description'],'url':url,'mainEntityOfPage':url,'datePublished':a['_date'],'dateModified':a['_modified'],'inLanguage':lang,'author':{'@id':ORIGIN+'/#organization'},'publisher':{'@id':ORIGIN+'/#organization'}}

def new_page(template,a,lang,bundle,tag):
 c=a[lang];pre='/ar' if lang=='ar' else '';url=ORIGIN+pre+'/insights/'+a['slug'];esc=lambda x:html.escape(x,quote=True)
 head=re.search(r'<head\b[^>]*>(.*?)</head>',template,re.S)[1]
 head=re.sub(r'<title>.*?</title>','<title>'+esc(c['title']+' | Linguative')+'</title>',head,flags=re.S)
 head=re.sub(r'(<meta\b[^>]*(?:name|property)="(?:description|og:description|twitter:description)"[^>]*content=")[^"]*',lambda m:m[1]+esc(c['description']),head)
 head=re.sub(r'(<meta\b[^>]*(?:name|property)="(?:og:title|twitter:title)"[^>]*content=")[^"]*',lambda m:m[1]+esc(c['title']+' | Linguative'),head)
 head=re.sub(r'(<meta\b[^>]*property="og:url"[^>]*content=")[^"]*',lambda m:m[1]+url,head)
 head=re.sub(r'(<meta\b[^>]*property="og:type"[^>]*content=")[^"]*',lambda m:m[1]+'article',head)
 head=re.sub(r'(<link\b[^>]*rel="canonical"[^>]*href=")[^"]*',lambda m:m[1]+url,head)
 head=re.sub(r'(<link\b[^>]*hreflang="(en|ar|x-default)"[^>]*href=")[^"]*',lambda m:m[1]+ORIGIN+('/ar' if m[2]=='ar' else '')+'/insights/'+a['slug'],head)
 head=re.sub(r'<script\b[^>]*>\s*\(function\s*\(\)\s*\{\s*function syncQuoteLanguageTags\(\).*?</script>','',head,flags=re.S)
 header=re.search(r'<header\b.*?</header>',template,re.S)[0];footer=re.search(r'<footer\b.*?</footer>',template,re.S)[0]
 header=header.replace(('/about' if lang=='ar' else '/ar/about'),('/insights/' if lang=='ar' else '/ar/insights/')+a['slug'])
 # About is no longer the active navigation item; Insights is.
 header=re.sub(r' aria-current="page"','',header).replace(' border-gold text-gold','')
 header=re.sub(r'(<a\b[^>]*href="'+re.escape(pre+'/insights')+r'")',r'\1 aria-current="page"',header)
 ld='<script type="application/ld+json">'+json.dumps(schema(a,lang),ensure_ascii=False,separators=(',',':')).replace('<',r'\u003c')+'</script>'
 return '<!doctype html><html lang="'+lang+'" dir="'+('rtl' if lang=='ar' else 'ltr')+'"><head>'+head+'</head><body><div id="root"><div class="min-h-screen bg-background">'+ld+header+'<main>'+main_html(a,lang)+'</main>'+footer+'</div></div></body></html>'

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
 entries={a['slug']:{lang:{'html':main_html(a,lang),'title':a[lang]['title'],'description':a[lang]['description'],'schema':schema(a,lang)} for lang in ['en','ar']} for a in articles}
 data='/*LNG_BLOG_DATA_START*/var LinguativeBlogData='+json.dumps(entries,ensure_ascii=False)+';Object.assign(Ms,LinguativeBlogData);function LinguativeBlogPage({lang:e,slug:s}){let a=LinguativeBlogData[s][e];ns(e,a.title+` | Linguative`,a.description);return(0,k.jsxs)(`div`,{className:`min-h-screen bg-background`,children:[(0,k.jsx)(Yo,{data:a.schema}),(0,k.jsx)(Ro,{lang:e}),(0,k.jsx)(`main`,{dangerouslySetInnerHTML:{__html:a.html}}),(0,k.jsx)(Uo,{lang:e})]})}/*LNG_BLOG_DATA_END*/'
 routes='/*LNG_BLOG_ROUTES_START*/'+','.join('(0,k.jsx)(W,{path:'+json.dumps(('/ar' if lang=='ar' else '')+'/insights/'+a['slug'])+',element:(0,k.jsx)(LinguativeBlogPage,{lang:'+json.dumps(lang)+',slug:'+json.dumps(a['slug'])+'})})' for a in articles for lang in ['en','ar'])+',/*LNG_BLOG_ROUTES_END*/'
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
  template=out[('ar/' if lang=='ar' else '')+'about.html'].decode()
  for a in articles:out[('ar/' if lang=='ar' else '')+'insights/'+a['slug']+'.html']=new_page(template,a,lang,newbundle,newtag).encode()
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
   for a in approved:state['articles'][a['slug']]={'published':state['articles'].get(a['slug'],{}).get('published',today),'approval':a['approval'],'modified':today}
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

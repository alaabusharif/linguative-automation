"""Build a hash-guarded update from the current self-hosted site snapshot."""
import argparse, hashlib, html, json, pathlib, re, shutil
HERE=pathlib.Path(__file__).parent
sha=lambda b: hashlib.sha256(b).hexdigest()

def build(snapshot, output):
    original=json.loads((snapshot.parent/'snapshot.json').read_text())
    pages={x['path']:(snapshot/x['path']).read_text() for x in original['pages']}
    for f in ['privacy-policy.html','ar/privacy-policy.html']: pages[f]=(snapshot/f).read_text()
    bundle=(snapshot/original['bundle'].lstrip('/')).read_text()
    assert sha((snapshot/original['bundle'].lstrip('/')).read_bytes())==original['bundle_sha256']
    changes=[]
    def replace_page(f,old,new):
        nonlocal bundle
        assert old in pages[f], (f,old[:60])
        # Escape both quotes and ampersands as the prerenderer does.
        for a,b in [(old,new),(html.escape(old,quote=False),html.escape(new,quote=False)),(html.escape(old),html.escape(new))]:
            if a in pages[f]: pages[f]=pages[f].replace(a,b);break
        else: raise AssertionError(f)
        assert old in bundle,(f,'bundle text missing')
        bundle=bundle.replace(old,new)
        changes.append({'page':f,'before':old,'after':new})
    for f,new in [
        ('services/event-conference-management.html','Linguative helps institutional and corporate teams plan and deliver conferences in Amman, at the Dead Sea and in Aqaba. Registration, guest guidance, supplier coordination, event branding and on-site delivery can be brought together with interpretation and conference technology in one agreed scope, giving your organising team a clear point of coordination.'),
        ('ar/services/event-conference-management.html','تساعد شركة الإبداع اللغوي المؤسسات والشركات على تنظيم المؤتمرات وتنفيذها في عمّان والبحر الميت والعقبة. ويمكن الجمع بين تسجيل المشاركين وإرشاد الضيوف وتنسيق الموردين والهوية البصرية والتنفيذ الميداني، إلى جانب الترجمة وتقنيات المؤتمرات، ضمن نطاق عمل واحد متفق عليه ونقطة تنسيق واضحة لفريق التنظيم.'),
        ('services/conference-technology-av.html','Linguative coordinates the microphones, sound, screens, cameras and live technical operation needed for conferences in Jordan. We review the venue’s existing setup, identify any additional equipment required, and agree who is responsible for installation, testing and operation. Interpretation channels and remote-speaker support can be coordinated where required.'),
        ('ar/services/conference-technology-av.html','تنسّق شركة الإبداع اللغوي احتياجات المؤتمرات في الأردن من الميكروفونات والصوت والشاشات والكاميرات والتشغيل الفني المباشر. نراجع تجهيزات الموقع ونحدد المعدات الإضافية اللازمة، مع الاتفاق على مسؤوليات التركيب والاختبار والتشغيل. ويمكن تنسيق قنوات الترجمة الفورية ودعم المتحدثين عن بُعد بحسب متطلبات الفعالية.')]:
        candidates=[html.unescape(re.sub('<[^>]+>','',q)) for q in re.findall(r'<p\b[^>]*>(.*?)</p>',pages[f],re.S)]
        old=next(q for q in candidates if len(q)>190)
        replace_page(f,old,new)
    enold='Any future optional analytics or advertising tools will require an assessment and the applicable information and controls before activation.'
    ennew='With your consent, we use Google Analytics to understand visits to public pages and count successful enquiries and contact-link clicks. Google receives technical connection information, including IP addresses used during processing, and may process data outside Jordan or the European Economic Area. Our event parameters exclude enquiry contents, names, email addresses, phone numbers and URL query strings. Analytics is optional and does not affect use of our forms. You can decline or withdraw consent through Privacy choices. We remember your choice for 180 days; analytics cookies are configured for 180 days. We do not enable advertising storage, Google signals or personalised advertising in this implementation.'
    arold='ويستلزم أي تفعيل مستقبلي لأدوات التحليل الاختيارية أو الإعلان تقييماً والمعلومات والضوابط المنطبقة قبل التفعيل.'
    arnew='بموافقتكم، نستخدم Google Analytics لفهم زيارات الصفحات العامة وإحصاء الاستفسارات المرسلة بنجاح والنقرات على روابط التواصل. تتلقى Google معلومات الاتصال التقنية، بما فيها عناوين بروتوكول الإنترنت المستخدمة أثناء المعالجة، وقد تعالج البيانات خارج الأردن أو المنطقة الاقتصادية الأوروبية. لا تتضمن معلمات الأحداث محتوى الاستفسارات أو الأسماء أو عناوين البريد الإلكتروني أو أرقام الهاتف أو معلمات الاستعلام في الروابط. التحليلات اختيارية ولا تؤثر في استخدام النماذج. يمكن رفضها أو سحب الموافقة عبر خيارات الخصوصية. نحفظ اختياركم لمدة 180 يوماً، وتُضبط ملفات تعريف ارتباط التحليلات لمدة 180 يوماً. لا نفعّل تخزين الإعلانات أو Google signals أو الإعلانات المخصصة في هذا التنفيذ.'
    replace_page('privacy-policy.html',enold,ennew)
    replace_page('ar/privacy-policy.html',arold,arnew)
    replace_page('privacy-policy.html','Effective date: 12 October 2026. Material changes will be reflected in the published version.','Effective date: 12 October 2026. Analytics information updated: 15 October 2026. Material changes will be reflected in the published version.')
    hook='if(!t.ok||n.success!==!0)throw Error(`Submission failed`);return{data:n}'
    replacement='if(!t.ok||n.success!==!0)throw Error(`Submission failed`);try{window.LinguativeAnalytics?.trackLead({form_type:e.kind===`quote`?`quote`:`contact`,site_language:e.lang===`ar`?`ar`:`en`})}catch{}return{data:n}'
    assert bundle.count(hook)==1
    bundle=bundle.replace(hook,replacement)
    routes={('/' if f=='index.html' else '/'+f[:-5]):html.unescape(re.search('<title>(.*?)</title>',s,re.S)[1]) for f,s in pages.items()}
    analytics=(HERE/'analytics-consent.js').read_text().replace('/*ROUTE_MAP*/ {}',json.dumps(routes,ensure_ascii=False))
    newbundle='assets/index-copy-analytics-'+sha(bundle.encode())[:12]+'.js'
    tag='assets/analytics-consent-'+sha(analytics.encode())[:12]+'.js'
    payload={newbundle:bundle.encode(),tag:analytics.encode()}
    for f,s in pages.items():
        assert s.count(original['bundle'])==1,(f,'bundle reference')
        s=s.replace(original['bundle'],'/'+newbundle)
        assert s.count('</head>')==1
        payload[f]=s.replace('</head>','<script defer src="/'+tag+'"></script></head>').encode()
    output.mkdir(parents=True,exist_ok=True)
    manifest=[]
    for f,data in payload.items():
        dst=output/'payload'/f;dst.parent.mkdir(parents=True,exist_ok=True);dst.write_bytes(data)
        old=snapshot/f
        manifest.append({'path':f,'before':sha(old.read_bytes()) if old.exists() else None,'after':sha(data)})
    (output/'manifest.json').write_text(json.dumps({'files':manifest,'measurement_id':'G-W6K9P0BBG1','status':'prepared, not deployed'},indent=2))
    (output/'copy-changes.json').write_text(json.dumps(changes,ensure_ascii=False,indent=2))
    for f in ['install_update.py','README.md','analytics-consent.js','test_analytics.cjs']: shutil.copy2(HERE/f,output/f)
    print(json.dumps({'html_pages':len(pages),'payload_files':len(payload),'copy_edits':len(changes),'bundle':newbundle,'tag':tag}))
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('snapshot',type=pathlib.Path);p.add_argument('output',type=pathlib.Path);a=p.parse_args();build(a.snapshot,a.output)

/* Linguative: consent-first analytics. Deploy with the generated public route map. */
(function (routes) {
  'use strict';
  if (window.LinguativeAnalytics) return;
  const ID = 'G-W6K9P0BBG1';
  const KEY = 'linguative.analytics-choice.v1';
  const TTL = 180 * 24 * 60 * 60 * 1000;
  const production = ['linguative.net', 'www.linguative.net'].includes(location.hostname);
  let choice = null;
  let loaded = false;
  let lastPage = '';
  let panel;
  let choicesButton;
  let previousFocus;
  const denied = { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
  const texts = {
    en: { title: 'Optional analytics', body: 'With your permission, we use Google Analytics to understand page visits and count successful enquiries. We do not send the contents of your enquiry. You can decline and still use every form, or change your choice later.', accept: 'Allow analytics', decline: 'Decline analytics', choices: 'Privacy choices', privacy: 'Privacy notice' },
    ar: { title: 'تحليلات اختيارية', body: 'بموافقتكم، نستخدم Google Analytics لفهم زيارات الصفحات وإحصاء الاستفسارات المرسلة بنجاح. لا نرسل محتوى استفساركم إلى هذه الخدمة. يمكنكم الرفض واستخدام جميع النماذج، أو تغيير اختياركم لاحقاً.', accept: 'السماح بالتحليلات', decline: 'رفض التحليلات', choices: 'خيارات الخصوصية', privacy: 'إشعار الخصوصية' }
  };
  function language() { return location.pathname === '/ar' || location.pathname.startsWith('/ar/') ? 'ar' : 'en'; }
  function readChoice() {
    try {
      const v = JSON.parse(localStorage.getItem(KEY));
      return v && v.version === 1 && ['granted', 'denied'].includes(v.value) && Number.isFinite(v.expires) && v.expires > Date.now() ? v : null;
    } catch { return null; }
  }
  function permitted() {
    if (choice && choice.expires <= Date.now()) {
      choice = null;
      disable();
      showPanel();
    }
    return production && choice && choice.value === 'granted';
  }
  function path() { return location.pathname.replace(/\/+$/, '') || '/'; }
  function safePage() {
    const p = path();
    return Object.prototype.hasOwnProperty.call(routes, p) ? { path: p, title: routes[p], url: 'https://linguative.net' + p } : null;
  }
  function safeReferrer() {
    try { return new URL(document.referrer).origin + '/'; } catch { return ''; }
  }
  function command() { window.dataLayer.push(arguments); }
  function loadTag() {
    if (!permitted() || loaded) return;
    loaded = true;
    window['ga-disable-' + ID] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = command;
    command('consent', 'default', denied);
    command('consent', 'update', { ...denied, analytics_storage: 'granted' });
    command('js', new Date());
    const p = safePage();
    command('config', ID, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: TTL / 1000,
      cookie_flags: 'SameSite=Lax;Secure',
      page_location: p ? p.url : 'https://linguative.net/',
      page_referrer: safeReferrer()
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    script.id = 'linguative-google-tag';
    document.head.appendChild(script);
  }
  function emit(name, parameters) {
    if (!permitted()) return false;
    const p = safePage();
    if (!p) return false;
    loadTag();
    command('event', name, { send_to: ID, page_location: p.url, page_title: p.title, page_referrer: safeReferrer(), ...parameters });
    return true;
  }
  function pageView() {
    const p = safePage();
    if (!p || !permitted() || p.path === lastPage) return;
    if (emit('page_view', { site_language: language() })) lastPage = p.path;
  }
  function removeCookies() {
    const names = document.cookie.split(';').map(s => s.trim().split('=')[0]).filter(n => n === '_ga' || n.startsWith('_ga_'));
    for (const name of names) {
      for (const domain of ['', '; domain=linguative.net', '; domain=.linguative.net', '; domain=www.linguative.net']) {
        document.cookie = name + '=; Max-Age=0; path=/' + domain + '; SameSite=Lax; Secure';
      }
    }
  }
  function disable() {
    window['ga-disable-' + ID] = true;
    if (loaded) command('consent', 'update', denied);
    removeCookies();
    lastPage = '';
  }
  function hidePanel() {
    if (panel) panel.hidden = true;
    if (choicesButton) choicesButton.hidden = false;
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
  }
  function setChoice(value, persist) {
    choice = { version: 1, value: value, expires: Date.now() + TTL };
    if (persist) { try { localStorage.setItem(KEY, JSON.stringify(choice)); } catch { /* Session-only choice if storage is unavailable. */ } }
    if (value === 'granted') {
      if (loaded) { window['ga-disable-' + ID] = false; command('consent', 'update', { ...denied, analytics_storage: 'granted' }); }
      loadTag();
      pageView();
    } else disable();
    hidePanel();
  }
  function showPanel() {
    if (!panel) return;
    previousFocus = document.activeElement;
    panel.hidden = false;
    choicesButton.hidden = true;
    const button = panel.querySelector('button');
    if (button) button.focus();
  }
  function make(tag, text) {
    const e = document.createElement(tag);
    if (text) e.textContent = text;
    return e;
  }
  function render() {
    const lang = language(), t = texts[lang];
    const wasOpen = panel ? !panel.hidden : !choice;
    if (panel) panel.remove();
    if (choicesButton) choicesButton.remove();
    panel = make('section');
    panel.id = 'linguative-analytics-choice';
    panel.lang = lang;
    panel.dir = lang === 'ar' ? 'rtl' : 'ltr';
    panel.setAttribute('aria-labelledby', 'linguative-analytics-title');
    panel.style.cssText = 'position:fixed;z-index:10000;bottom:16px;left:16px;right:16px;max-width:640px;margin:auto;background:#f8f5f0;color:#071a2e;border:1px solid #c9a46a;padding:20px;box-shadow:0 8px 30px #071a2e22;font-family:inherit;font-size:15px;line-height:1.65';
    const title = make('h2', t.title); title.id = 'linguative-analytics-title'; title.style.cssText = 'font-size:19px;font-weight:600;margin:0 0 8px';
    panel.appendChild(title);
    const p = make('p', t.body); p.style.cssText = 'margin:0 0 12px'; panel.appendChild(p);
    const controls = make('div'); controls.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;align-items:center';
    for (const [label, value] of [[t.accept, 'granted'], [t.decline, 'denied']]) {
      const b = make('button', label); b.type = 'button';
      b.style.cssText = 'min-height:44px;padding:9px 14px;border:1px solid #071a2e;background:#f8f5f0;color:#071a2e;font:inherit;cursor:pointer';
      b.addEventListener('click', () => setChoice(value, true)); controls.appendChild(b);
    }
    const a = make('a', t.privacy); a.href = (lang === 'ar' ? '/ar' : '') + '/privacy-policy';
    a.style.cssText = 'color:#071a2e;text-decoration:underline;text-underline-offset:3px;padding:10px 0'; controls.appendChild(a);
    panel.appendChild(controls); panel.hidden = !wasOpen; document.body.appendChild(panel);
    choicesButton = make('button', t.choices); choicesButton.type = 'button'; choicesButton.lang = lang;
    choicesButton.id = 'linguative-privacy-choices';
    choicesButton.style.cssText = 'position:fixed;z-index:9999;bottom:12px;left:12px;min-height:44px;padding:8px 12px;background:#f8f5f0;color:#071a2e;border:1px solid #c9a46a;font:inherit;font-size:13px;cursor:pointer';
    choicesButton.hidden = wasOpen; choicesButton.addEventListener('click', showPanel); document.body.appendChild(choicesButton);
  }
  function navigate() { render(); pageView(); }
  window.LinguativeAnalytics = Object.freeze({
    trackLead: function (p) {
      if (!p || !['contact', 'quote'].includes(p.form_type)) return false;
      return emit('generate_lead', { form_type: p.form_type, site_language: p.site_language === 'ar' ? 'ar' : 'en' });
    },
    openChoices: showPanel,
    status: function () { return { production: production, consent: choice ? choice.value : 'unset', tagLoaded: loaded }; }
  });
  function start() {
    choice = readChoice();
    if (!choice || choice.value !== 'granted') disable();
    render();
    pageView();
    for (const method of ['pushState', 'replaceState']) {
      const original = history[method];
      history[method] = function () { const result = original.apply(this, arguments); navigate(); return result; };
    }
    window.addEventListener('popstate', navigate);
    window.addEventListener('storage', function (event) {
      if (event.key !== KEY) return;
      choice = readChoice();
      if (!choice || choice.value !== 'granted') disable();
      else if (loaded) { window['ga-disable-' + ID] = false; command('consent', 'update', { ...denied, analytics_storage: 'granted' }); }
      render(); pageView();
    });
    document.addEventListener('click', function (event) {
      const a = event.target && typeof event.target.closest === 'function' ? event.target.closest('a[href]') : null;
      if (!a) return;
      let channel = '';
      try { const u = new URL(a.href, location.origin); channel = u.protocol === 'tel:' ? 'phone' : u.protocol === 'mailto:' ? 'email' : ['wa.me','api.whatsapp.com','web.whatsapp.com'].includes(u.hostname) ? 'whatsapp' : ''; } catch { return; }
      if (channel) emit('contact_click', { contact_channel: channel, site_language: language() });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})(/*ROUTE_MAP*/ {});

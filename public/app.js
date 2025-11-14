alert('app.js loaded');
(function(){
  // ====== グローバルUI参照入れ物 ======
  const ui = {};
  const CORE_STORE_PRESET = [
    {StoreID:'PAW', Name:'Pawfect One', Type:'PET', Active:true, Sort:1, Color:'#6ecad1', Description:'ドッグケア（犬）'},
    {StoreID:'TBL', Name:'TBL', Type:'HUMAN', Active:true, Sort:2, Color:'#fbbf24', Description:'ビューティーケア（人）'},
    {StoreID:'TBL-ACU', Name:'TBL(鍼灸)', Type:'HUMAN', Active:true, Sort:3, Color:'#f97316', Description:'ビューティーケア（人）/鍼灸'}
  ];
  (function(){
    // 未定義でも落ちないように no-op を注入
    const maybeFns = [
      'wireCustomer','wirePetReg','wireService','wireStaff','wirePayments','wireBilling',
      'wireCalendar','wireNotes','wireBoard','reloadTickets',
      'listStaff','listPayments','listStaffNotes','listReservations',
      'selectCustomer','loadPets','refreshVisits','onSaveVisit',
      'populateCalendarDropdowns'
    ];
    maybeFns.forEach(n=>{
      if (typeof window[n] !== 'function') window[n] = function(){ /* no-op */ };
    });

    window.__safeCall = function(fn, ...args){
      try{ if (typeof fn === 'function') return fn(...args); }catch(e){ console.error('[safeCall]', e); }
    };
    window.__safeSet = function(node, prop, value){
      if (node && node[prop] !== undefined) node[prop] = value;
    };
  })();

  // Helper: animate tab/pane transitions with direction support
  window.__animateTabTransition = function(newEl, oldEl, direction='up', opts={}){
    try{
      if (!newEl) return;
      const root = document.documentElement;
      const durCss = getComputedStyle(root).getPropertyValue('--page-transition-duration') || '320ms';
      const parsed = parseInt(durCss.match(/\d+/)?.[0] || '320', 10);
      const duration = opts.duration || (Number.isFinite(parsed) ? parsed : 320);
      // map direction -> classes
      const enterBase = (direction === 'left') ? 'pane-enter-left' : (direction === 'right') ? 'pane-enter-right' : 'pane-enter';
      const exitBase = (direction === 'left') ? 'pane-exit-left' : (direction === 'right') ? 'pane-exit-right' : 'pane-exit';

      // prepare elements
      if (oldEl === newEl) return;
      // ensure newEl is visible for measurement
      newEl.classList.add(enterBase);
      newEl.style.display = 'flex';
      // force reflow
      void newEl.offsetWidth;
      newEl.classList.add('pane-enter-active');

      if (oldEl){
        oldEl.classList.add(exitBase);
        // force reflow
        void oldEl.offsetWidth;
        oldEl.classList.add('pane-exit-active');
      }

      // cleanup after duration + small buffer
      const buffer = 40;
      setTimeout(()=>{
        // remove transitional classes
        newEl.classList.remove(enterBase, 'pane-enter-active');
        newEl.classList.add('active');
        newEl.style.display = '';
        if (oldEl){
          oldEl.classList.remove(exitBase, 'pane-exit-active', 'active');
          oldEl.style.display = 'none';
        }
      }, duration + buffer);
    }catch(e){ console.error('[animateTab]', e); }
  };

  // ===== Modal helpers: show/hide with overlay, aria handling, and animations =====
  (function(){
    const overlays = new WeakMap();

    function createOverlay(){
      const o = document.createElement('div');
      o.className = 'modal-overlay';
      o.tabIndex = -1;
      return o;
    }

    window.showModal = function(el, opts){
      if (!el) return;
      opts = opts || {};
      try{
        // if already shown, no-op
        if (!el.hasAttribute('hidden')) return;
        // overlay if requested (default true for center dialogs)
        const needOverlay = opts.overlay !== false;
        let overlay = null;
        if (needOverlay){
          overlay = createOverlay();
          document.body.appendChild(overlay);
          // force reflow then show
          void overlay.offsetWidth;
          overlay.classList.add('show');
          overlays.set(el, overlay);
        }

        // prepare dialog animation classes
        el.removeAttribute('hidden');
        el.classList.add('dialog-enter');
        // ensure centered transform origin preserved if help-panel uses translate(-50%,-50%)
        void el.offsetWidth;
        el.classList.add('dialog-enter-active');

        // focus management: focus first focusable or the element itself
        const focusable = el.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        (focusable || el).focus?.();

        // bind escape to close
        const escHandler = (e)=>{ if (e.key === 'Escape') window.hideModal(el); };
        el.__escHandler = escHandler;
        document.addEventListener('keydown', escHandler);
      }catch(e){ console.error('[showModal]', e); }
    };

    window.hideModal = function(el){
      if (!el) return;
      try{
        // if already hidden, no-op
        if (el.hasAttribute('hidden')) return;
        // overlay handling
        const overlay = overlays.get(el);
        if (overlay){
          overlay.classList.remove('show');
          setTimeout(()=>{ try{ overlay.remove(); }catch(_){} }, 260);
          overlays.delete(el);
        }

        // animate out
        el.classList.remove('dialog-enter','dialog-enter-active');
        el.classList.add('dialog-exit');
        // force reflow
        void el.offsetWidth;
        el.classList.add('dialog-exit-active');
        setTimeout(()=>{
          try{ el.classList.remove('dialog-exit','dialog-exit-active'); }catch(_){}
          try{ el.setAttribute('hidden',''); }catch(_){}
        }, 280);

        // remove escape handler
        if (el.__escHandler){ document.removeEventListener('keydown', el.__escHandler); el.__escHandler = null; }
      }catch(e){ console.error('[hideModal]', e); }
    };

    // wire quick close buttons globally: elements with .quick-panel-close or .help-panel-close
    document.addEventListener('click', (e)=>{
      const c = e.target.closest('.quick-panel-close, .help-panel-close');
      if (!c) return;
      const parent = c.closest('.quick-panel, .help-panel');
      if (parent) window.hideModal(parent);
    });
  })();

  // Button micro-interactions: press animation and toggle-check behavior
  (function(){
    document.addEventListener('click', (e)=>{
      const btn = e.target.closest('button[data-toggle-check], button.btn-toggle-check');
      if (!btn) return;
      try{
        // quick press animation
        btn.classList.add('btn-press');
        setTimeout(()=> btn.classList.remove('btn-press'), 160);

        // toggle check state if requested
        const wantsToggle = btn.hasAttribute('data-toggle-check') || btn.classList.contains('btn-toggle-check');
        if (!wantsToggle) return;
        const isChecked = btn.classList.toggle('checked');
        btn.setAttribute('aria-pressed', isChecked ? 'true' : 'false');
        // ensure a .checkmark element exists
        let ck = btn.querySelector('.checkmark');
        if (!ck){
          ck = document.createElement('span');
          ck.className = 'checkmark';
          ck.setAttribute('aria-hidden','true');
          // Inline minimal SVG check icon
          ck.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M20 6 L9 17 L4 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
          btn.appendChild(ck);
        }
      }catch(err){ console.error('[btn-toggle]', err); }
    }, true);
  })();

  // ===== Motion & micro-interaction utilities =====
  (function(){
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Ripple: attach to buttons and elements with .ripple-target
    window.__attachRipple = function(root=document){
      if (prefersReduced) return;
      root.addEventListener('pointerdown', (ev)=>{
        try{
          const el = ev.target.closest('button, .btn, .ripple-target');
          if (!el) return;
          const style = getComputedStyle(el);
          if (style.position === 'static') el.style.position = 'relative';
          el.style.overflow = 'hidden';
          const rect = el.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height) * 1.2;
          const span = document.createElement('span');
          span.className = 'ripple';
          const x = ev.clientX - rect.left - size/2;
          const y = ev.clientY - rect.top - size/2;
          span.style.width = span.style.height = size + 'px';
          span.style.left = x + 'px';
          span.style.top = y + 'px';
          el.appendChild(span);
          span.addEventListener('animationend', ()=> { try{ span.remove(); }catch(_){} }, { once:true });
        }catch(e){ console.error('[ripple]', e); }
      }, true);
    };

    // Toast API: create/dismiss simple toasts
    window.__toastContainer = null;
    window.__showToast = function(text, opts){
      opts = opts || {};
      const timeout = typeof opts.timeout === 'number' ? opts.timeout : 3500;
      try{
        if (!window.__toastContainer){
          const c = document.createElement('div');
          c.className = 'app-toast-container';
          document.body.appendChild(c);
          window.__toastContainer = c;
        }
        const t = document.createElement('div');
        t.className = 'app-toast';
        if (opts.ariaLive) t.setAttribute('aria-live','polite');
        t.textContent = String(text || '');
        window.__toastContainer.appendChild(t);
        // trigger show
        requestAnimationFrame(()=> t.classList.add('show'));
        const timer = setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=> t.remove(), 260); }, timeout);
        t.dismiss = ()=> { clearTimeout(timer); t.classList.remove('show'); setTimeout(()=> t.remove(), 200); };
        return t;
      }catch(e){ console.error('[toast]', e); }
    };

    // Reveal init: IntersectionObserver driven
    window.__initReveal = function(root=document){
      try{
        if (prefersReduced){
          root.querySelectorAll('.reveal').forEach(el=> el.classList.add('is-visible'));
          return;
        }
        const obs = new IntersectionObserver((entries)=>{
          entries.forEach(ent=>{
            if (ent.isIntersecting) ent.target.classList.add('is-visible');
          });
        }, { threshold: 0.12 });
        root.querySelectorAll('.reveal').forEach(el=> obs.observe(el));
      }catch(e){ console.error('[reveal]', e); }
    };

    // Enhanced notification system
    window.__notificationContainer = null;
    window.__showNotification = function(text, type='info', opts={}){
      opts = opts || {};
      const timeout = typeof opts.timeout === 'number' ? opts.timeout : 4000;
      try{
        if (!window.__notificationContainer){
          const c = document.createElement('div');
          c.className = 'notification-container';
          document.body.appendChild(c);
          window.__notificationContainer = c;
        }
        const n = document.createElement('div');
        n.className = `notification ${type}`;
        if (opts.ariaLive) n.setAttribute('aria-live','polite');
        n.textContent = String(text || '');
        window.__notificationContainer.appendChild(n);
        // trigger show
        requestAnimationFrame(()=> n.classList.add('show'));
        const timer = setTimeout(()=>{ 
          n.classList.remove('show'); 
          setTimeout(()=> { try{ n.remove(); }catch(_){} }, 280); 
        }, timeout);
        n.dismiss = ()=> { clearTimeout(timer); n.classList.remove('show'); setTimeout(()=> { try{ n.remove(); }catch(_){} }, 280); };
        return n;
      }catch(e){ console.error('[notification]', e); }
    };

    // Card entrance animation
    window.__initCardEntrance = function(root=document){
      try{
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
          root.querySelectorAll('.card-entrance').forEach(el=> el.classList.add('is-visible'));
          return;
        }
        const obs = new IntersectionObserver((entries)=>{
          entries.forEach(ent=>{
            if (ent.isIntersecting) ent.target.classList.add('is-visible');
          });
        }, { threshold: 0.1 });
        root.querySelectorAll('.card-entrance').forEach(el=> obs.observe(el));
      }catch(e){ console.error('[cardEntrance]', e); }
    };

    // Save completion animation
    window.__triggerSaveComplete = function(button, opts={}){
      if (!button) return;
      try{
        button.classList.add('save-complete','show-check');
        const duration = opts.duration || 400;
        setTimeout(()=>{
          button.classList.remove('show-check');
          setTimeout(()=> button.classList.remove('save-complete'), 100);
        }, duration);
      }catch(e){ console.error('[saveComplete]', e); }
    };

    // Auto init on DOM ready - native emoji, no replacement needed
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', ()=>{ 
        window.__attachRipple(); 
        window.__initReveal(); 
        window.__initCardEntrance();
      });
    } else {
      window.__attachRipple(); 
      window.__initReveal();
      window.__initCardEntrance();
    }
  })();

  // ====== ローカルフォールバック用 簡易DB（GAS以外での動作確認） ======
  const mock = (function(){
    const today = ()=> new Date().toISOString().slice(0,10);
    const toYMD = (date)=> new Date(date).toISOString().slice(0,10);
    const S = {
      lookups: {
        services: [{ServiceID:'SM-90', Name:'マッサージ90分', Category:'ボディ', Duration:90, Price:9000, Tax:0.1, Active:true}],
        staff: [{StaffID:'ST-1', Name:'山田', Role:'セラピスト', Active:true}],
        payments: [{PaymentCode:'CASH', Name:'現金', Sort:0, Active:true},{PaymentCode:'CARD', Name:'カード', Sort:1, Active:true}],
        stores: CORE_STORE_PRESET.map(s=> ({...s}))
      },
      customers: [{CustomerID:'C100', StoreID:'PAW', Name:'田中 太郎', Phone:'090-1111-2222', Email:'tanaka@example.jp', Address:'東京都', Notes:'次回は肩ケア希望', MemoPinned:true, MemoDue:today(), Tags:[{label:'VIP', color:'#f97316'},{label:'常連', color:'#0ea5b7'}]}],
      pets: [{PetID:'P100', StoreID:'PAW', CustomerID:'C100', Name:'ポチ', Breed:'トイプードル', Sex:'男の子', WeightKg:'3.5', Notes:'腰に負担注意', MemoPinned:false, MemoDue:'', Tags:[{label:'シニア', color:'#6366f1'}]}],
      visits: [
        {OrderID:'INV-1001', StoreID:'PAW', VisitDate:today(), CustomerID:'C100', PetID:'P100', PaymentMethod:'CASH', Staff:'山田', Total:9000, CashPortion:9000, ARPortion:0, PrepaidUsed:0, Notes:'初回体験', CreatedAt:today()},
        {OrderID:'INV-1002', StoreID:'PAW', VisitDate:today(), CustomerID:'C100', PetID:'P100', PaymentMethod:'CARD', Staff:'山田', Total:12000, CashPortion:6000, ARPortion:6000, PrepaidUsed:0, Notes:'後払い分あり', CreatedAt:today()}
      ],
      reservations: [],
      notes: [],
      tickets: [],
      seq: 1
    };
    const defaultStoreId = CORE_STORE_PRESET[0]?.StoreID || 'PAW';
    const id = (p)=> p + (S.seq++);

    const toTagObj = (tag)=>{
      if (!tag) return null;
      if (typeof tag === 'string'){
        const trimmed = tag.trim();
        if (!trimmed) return null;
        const [labelPart, colorPart] = trimmed.split('|');
        const label = (labelPart||'').trim();
        if (!label) return null;
        let color = (colorPart||'').trim();
        if (color && !color.startsWith('#')) color = '#' + color.replace(/[^0-9a-f]/ig,'').slice(0,6);
        if (color.length>7) color = color.slice(0,7);
        return { label, color };
      }
      const label = String(tag.label || tag.name || tag.Label || '').trim();
      if (!label) return null;
      let color = '';
      if (tag.color != null) color = String(tag.color).trim();
      else if (tag.Color != null) color = String(tag.Color).trim();
      if (color && !color.startsWith('#')) color = '#' + color.replace(/[^0-9a-f]/ig,'').slice(0,6);
      if (color.length>7) color = color.slice(0,7);
      return { label, color };
    };

    const parseTagList = (value)=>{
      if (!value) return [];
      if (Array.isArray(value)) return value.map(toTagObj).filter(Boolean);
      if (typeof value === 'string'){
        const text = value.trim();
        if (!text) return [];
        try{
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) return parsed.map(toTagObj).filter(Boolean);
        }catch(_){
          return text.split(/[,\n]/).map(toTagObj).filter(Boolean);
        }
        return [];
      }
      return [];
    };

    const normalizeSearch = (value)=>{
      if (value == null) return '';
      return String(value).toLowerCase()
        .replace(/[Ａ-Ｚａ-ｚ０-９]/g, ch=> String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
        .replace(/[‐－―ー−]/g, '-');
    };

    const tokensOf = (value)=> normalizeSearch(value).split(/\s+/).filter(Boolean);

    const resolveStoreId = (value)=>{
      if (!value) return '';
      if (typeof value === 'string') return value;
      if (typeof value === 'object') return value.storeId || value.StoreID || value.id || '';
      return '';
    };

    const matchesStore = (recordStore, requested)=>{
      const want = resolveStoreId(requested);
      if (!want) return true;
      return String(recordStore||'').trim().toUpperCase() === String(want).trim().toUpperCase();
    };
    const toDateOnly = (value)=>{
      if (!value) return null;
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return null;
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };

    const diffDays = (from, to)=>{
      const a = toDateOnly(from);
      const b = toDateOnly(to);
      if (!a || !b) return 0;
      return Math.round((a.getTime() - b.getTime()) / 86400000);
    };

    const formatYMD = (value)=>{
      if (!value && value !== 0) return '';
      const d = toDateOnly(value);
      if (!d) return String(value);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth()+1).padStart(2,'0');
      const dd = String(d.getDate()).padStart(2,'0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const formatYen = (value)=> '¥' + Number(value||0).toLocaleString('ja-JP');

    const formatReservationItem = (rec, todayStr, customersMap, petsMap, servicesMap)=>{
      if (!rec) return null;
      const cust = customersMap.get(String(rec.CustomerID||'')) || {};
      const pet = petsMap.get(String(rec.PetID||'')) || {};
      const service = servicesMap.get(String(rec.ServiceID||'')) || {};
      const diff = diffDays(rec.Date, todayStr);
      let status = 'UPCOMING';
      let statusLabel = '';
      if (diff === 0){ status = 'TODAY'; statusLabel = '本日'; }
      else if (diff < 0){ status = 'PAST'; statusLabel = '完了'; }
      else { status = 'UPCOMING'; statusLabel = diff === 1 ? '明日' : `あと${diff}日`; }
      const time = [rec.Start, rec.End].filter(Boolean).join('〜');
      const petName = pet.DogName || pet.Name || '';
      const meta = [];
      const serviceName = service.Name || rec.ServiceID || '';
      if (serviceName) meta.push(`施術:${serviceName}`);
      if (petName) meta.push(`ご愛犬:${petName}`);
      if (rec.Staff) meta.push(`担当:${rec.Staff}`);
      if (rec.Notes) meta.push(`メモ:${rec.Notes}`);
      const dateText = formatYMD(rec.Date);
      return {
        type:'reservation',
        id: rec.ReservationID || '',
        title: `${dateText||''} ${time}`.trim(),
        subtitle: cust.Name ? `顧客:${cust.Name}` : '',
        meta,
        date: dateText,
        dateLabel: dateText,
        time,
        customerName: cust.Name || '',
        petName,
        staff: rec.Staff || '',
        status,
        statusLabel
      };
    };

    const formatInvoiceItem = (visit, customersMap, petsMap)=>{
      if (!visit) return null;
      const cust = customersMap.get(String(visit.CustomerID||'')) || {};
      const pet = petsMap.get(String(visit.PetID||'')) || {};
      const pending = Number(visit.ARPortion||0) > 0;
      const meta = [];
      const petName = pet.DogName || pet.Name || '';
      if (petName) meta.push(`ご愛犬:${petName}`);
      const visitDate = formatYMD(visit.VisitDate || visit.CreatedAt || '');
      if (visitDate) meta.push(`来店日:${visitDate}`);
      const payment = visit.PaymentName || visit.PaymentMethod || '';
      if (payment) meta.push(`支払:${payment}`);
      if (pending) meta.push(`未収:${formatYen(visit.ARPortion||0)}`);
      return {
        type:'invoice',
        id: visit.OrderID || visit.VisitID || '',
        title: `${visit.OrderID || '(請求)'} ${formatYen(visit.Total||0)}`,
        subtitle: cust.Name ? `顧客:${cust.Name}` : '',
        meta,
        orderId: visit.OrderID || '',
        status: pending ? 'PENDING' : 'PAID',
        statusLabel: pending ? '支払待ち' : '支払済み'
      };
    };

    const formatNoteItem = (note)=>{
      if (!note) return null;
      const meta = [];
      if (note.Audience) meta.push(`対象:${note.Audience}`);
      const created = formatYMD(note.CreatedAt || note.Datetime || '');
      if (created) meta.push(`登録:${created}`);
      const pinned = !!note.Pinned;
      return {
        type:'note',
        id: note.NoteID || note.id || '',
        title: note.Title || '(無題)',
        subtitle: note.Category ? `カテゴリ:${note.Category}` : '',
        meta,
        pinned,
        status: pinned ? 'PINNED' : '',
        statusLabel: pinned ? 'PIN' : ''
      };
    };

    const formatTicketItem = (ticket)=>{
      if (!ticket) return null;
      const meta = [];
      if (ticket.Assignee) meta.push(`担当:${ticket.Assignee}`);
      if (ticket.Status) meta.push(`状態:${ticket.Status}`);
      const logged = formatYMD(ticket.Datetime || ticket.CreatedAt || '');
      if (logged) meta.push(`登録:${logged}`);
      return {
        type:'ticket',
        id: ticket.TicketID || ticket.id || '',
        title: ticket.Title || '(申請)',
        subtitle: ticket.Category ? `カテゴリ:${ticket.Category}` : '',
        meta,
        status: ticket.Status || '',
        statusLabel: ticket.Status || ''
      };
    };
    return {
      can: ()=> (typeof google!=='undefined' && google.script && google.script.run),
      call(fn, ...args){
        if (this.can()) return null;
        switch(fn){
          case 'getLookups': return JSON.parse(JSON.stringify(S.lookups));
          case 'listCustomersLite': {
            const param = args[0];
            const storeId = resolveStoreId(param);
            return S.customers
              .filter(c=> matchesStore(c.StoreID, storeId))
              .map(c=>({CustomerID:c.CustomerID, Name:c.Name, StoreID:c.StoreID}));
          }
          case 'createCustomer': {
            const p = args[0]||{};
            const storeId = resolveStoreId(p.StoreID) || defaultStoreId;
            const c = {CustomerID:id('C'), StoreID:storeId, Name:p.Name||'(無名)', Phone:p.Phone||'', Email:p.Email||'', Address:p.Address||'', Gender:p.Gender||'', Notes:p.Notes||'', MemoDue:p.MemoDue||'', MemoPinned:!!p.MemoPinned, Tags:parseTagList(p.Tags), UpdatedAt:today()};
            S.customers.push(c); return c;
          }
          case 'globalSearch': {
            const keyword = String(args[0]||'');
            const opt = args[1] || {};
            const storeId = resolveStoreId(opt);
            const limit = Math.max(1, Number(opt.limit || 5));
            const tokens = tokensOf(keyword);
            const hasTokens = tokens.length > 0;
            const todayStr = today();
            const customersMap = new Map(S.customers.map(c=>[String(c.CustomerID||''), c]));
            const petsMap = new Map(S.pets.map(p=>[String(p.PetID||''), p]));
            const servicesMap = new Map((S.lookups.services||[]).map(s=>[String(s.ServiceID||''), s]));
            const matchesTokens = (values)=>{
              if (!hasTokens) return true;
              const hay = normalizeSearch(values.join(' '));
              const hayPlain = hay.replace(/-/g,'');
              return tokens.every(tok => hay.includes(tok) || hayPlain.includes(tok.replace(/-/g,'')));
            };
            const out = { query: keyword, customers: [], pets: [], reservations: [], invoices: [], notes: [], tickets: [] };

            const customerList = S.customers
              .filter(c => matchesStore(c.StoreID, storeId))
              .map(c => {
                const tags = parseTagList(c.Tags);
                const pets = S.pets.filter(p=> p.CustomerID === c.CustomerID);
                const values = [c.CustomerID, c.Name, c.Phone, c.Email, c.Address, c.Notes];
                tags.forEach(t=> values.push(t?.label||''));
                pets.forEach(p=> values.push(p.Name||p.DogName||'', p.Breed||''));
                if (!matchesTokens(values)) return null;
                const tagText = tags.map(t=> t.label).filter(Boolean).join('・');
                const petNames = pets.map(p=> p.Name || p.DogName || '').filter(Boolean).join('・');
                const memoDue = formatYMD(c.MemoDue || '');
                return {
                  type:'customer',
                  id:c.CustomerID,
                  title:c.Name || '(無名)',
                  subtitle:`CID:${c.CustomerID || ''}${c.Phone ? ` / ${c.Phone}` : ''}`,
                  meta:[
                    c.Address ? `住所:${c.Address}` : '',
                    petNames ? `ご愛犬:${petNames}` : '',
                    tagText ? `タグ:${tagText}` : '',
                    memoDue ? `メモ期限:${memoDue}` : ''
                  ].filter(Boolean),
                  keyword:c.CustomerID || keyword
                };
              })
              .filter(Boolean)
              .slice(0, hasTokens ? limit : 0);
            out.customers = customerList;

            const petList = S.pets
              .filter(p => matchesStore(p.StoreID, storeId))
              .map(p => {
                const owner = customersMap.get(String(p.CustomerID||'')) || {};
                const tags = parseTagList(p.Tags);
                const values = [p.PetID, p.CustomerID, p.Name, p.Breed, p.Notes, owner.Name];
                tags.forEach(t=> values.push(t?.label||''));
                if (!matchesTokens(values)) return null;
                const tagText = tags.map(t=> t.label).filter(Boolean).join('・');
                return {
                  type:'pet',
                  id:p.PetID,
                  title:p.Name || '(無名)',
                  subtitle:`PID:${p.PetID || ''}${owner.Name ? ` / 飼い主:${owner.Name}` : ''}`,
                  meta:[
                    p.Breed ? `犬種:${p.Breed}` : '',
                    p.Sex ? `性別:${p.Sex}` : '',
                    tagText ? `タグ:${tagText}` : ''
                  ].filter(Boolean),
                  keyword:p.PetID || p.Name || keyword
                };
              })
              .filter(Boolean)
              .slice(0, hasTokens ? limit : 0);
            out.pets = petList;

            const reservationLimit = hasTokens ? limit : Math.min(limit, 6);
            out.reservations = (S.reservations||[])
              .filter(rec => matchesStore(rec.StoreID, storeId))
              .filter(rec => {
                if (!hasTokens){
                  const diff = diffDays(rec.Date, todayStr);
                  return diff >= -1 && diff <= 7;
                }
                const cust = customersMap.get(String(rec.CustomerID||'')) || {};
                const pet = petsMap.get(String(rec.PetID||'')) || {};
                const service = servicesMap.get(String(rec.ServiceID||'')) || {};
                return matchesTokens([
                  rec.Date, rec.Start, rec.End, rec.Staff, rec.Notes,
                  rec.ServiceID, service.Name, cust.Name, cust.Phone, cust.Email, pet.Name || pet.DogName || '', pet.Breed || ''
                ]);
              })
              .sort((a,b)=> `${a.Date||''} ${a.Start||''}`.localeCompare(`${b.Date||''} ${b.Start||''}`))
              .slice(0, reservationLimit)
              .map(rec => formatReservationItem(rec, todayStr, customersMap, petsMap, servicesMap))
              .filter(Boolean);

            out.invoices = (S.visits||[])
              .filter(v => matchesStore(v.StoreID, storeId))
              .filter(v => {
                if (!hasTokens) return Number(v.ARPortion||0) > 0;
                const cust = customersMap.get(String(v.CustomerID||'')) || {};
                const pet = petsMap.get(String(v.PetID||'')) || {};
                return matchesTokens([
                  v.OrderID, v.VisitID, v.PaymentMethod, v.Notes,
                  cust.Name, cust.Phone, pet.Name || pet.DogName || '', pet.Breed || ''
                ]);
              })
              .sort((a,b)=> new Date(b.VisitDate||0) - new Date(a.VisitDate||0))
              .slice(0, limit)
              .map(v => formatInvoiceItem(v, customersMap, petsMap))
              .filter(Boolean);

            out.notes = (S.notes||[])
              .filter(note => {
                if (!storeId) return true;
                const recStore = note && (note.StoreID || note.storeId || '');
                if (!recStore) return true;
                return matchesStore(recStore, storeId);
              })
              .filter(note => {
                if (!note) return false;
                if (!hasTokens) return !!note.Pinned;
                return matchesTokens([note.Title, note.Category, note.Audience, note.Body]);
              })
              .sort((a,b)=>{
                const pinnedDiff = (b?.Pinned?1:0) - (a?.Pinned?1:0);
                if (pinnedDiff !== 0) return pinnedDiff;
                return new Date(b?.CreatedAt||0) - new Date(a?.CreatedAt||0);
              })
              .slice(0, limit)
              .map(formatNoteItem)
              .filter(Boolean);

            out.tickets = (S.tickets||[])
              .filter(ticket => {
                if (!storeId) return true;
                const recStore = ticket && (ticket.StoreID || ticket.storeId || '');
                if (!recStore) return true;
                return matchesStore(recStore, storeId);
              })
              .filter(ticket => {
                if (!ticket) return false;
                if (!hasTokens) return !['完了','クローズ','対応済'].includes(String(ticket.Status||'').trim());
                return matchesTokens([ticket.Title, ticket.Category, ticket.Assignee, ticket.Description, ticket.Impact, ticket.RelatedID]);
              })
              .sort((a,b)=> new Date(b?.Datetime||0) - new Date(a?.Datetime||0))
              .slice(0, limit)
              .map(formatTicketItem)
              .filter(Boolean);

            return out;
          }

          case 'getOpsSnapshot': {
            const opt = args[0] || {};
            const storeId = resolveStoreId(opt);
            const todayStr = today();
            const customersMap = new Map(S.customers.map(c=>[String(c.CustomerID||''), c]));
            const petsMap = new Map(S.pets.map(p=>[String(p.PetID||''), p]));
            const servicesMap = new Map((S.lookups.services||[]).map(s=>[String(s.ServiceID||''), s]));

            const reservations = (S.reservations||[])
              .filter(rec => matchesStore(rec.StoreID, storeId))
              .filter(rec => {
                const diff = diffDays(rec.Date, todayStr);
                return diff >= -1 && diff <= 7;
              })
              .sort((a,b)=> `${a.Date||''} ${a.Start||''}`.localeCompare(`${b.Date||''} ${b.Start||''}`))
              .slice(0, 8)
              .map(rec => formatReservationItem(rec, todayStr, customersMap, petsMap, servicesMap))
              .filter(Boolean);

            const invoices = (S.visits||[])
              .filter(v => matchesStore(v.StoreID, storeId))
              .filter(v => Number(v.ARPortion||0) > 0)
              .sort((a,b)=> new Date(b.VisitDate||0) - new Date(a.VisitDate||0))
              .slice(0, 10)
              .map(v => formatInvoiceItem(v, customersMap, petsMap))
              .filter(Boolean);

            const notes = (S.notes||[])
              .filter(note => {
                if (!storeId) return true;
                const recStore = note && (note.StoreID || note.storeId || '');
                if (!recStore) return true;
                return matchesStore(recStore, storeId);
              })
              .sort((a,b)=>{
                const pinnedDiff = (b?.Pinned?1:0) - (a?.Pinned?1:0);
                if (pinnedDiff !== 0) return pinnedDiff;
                return new Date(b?.CreatedAt||0) - new Date(a?.CreatedAt||0);
              })
              .slice(0, 10)
              .map(formatNoteItem)
              .filter(Boolean);

            const tickets = (S.tickets||[])
              .filter(ticket => {
                if (!storeId) return true;
                const recStore = ticket && (ticket.StoreID || ticket.storeId || '');
                if (!recStore) return true;
                return matchesStore(recStore, storeId);
              })
              .filter(ticket => !['完了','クローズ','対応済'].includes(String(ticket?.Status||'').trim()))
              .sort((a,b)=> new Date(b?.Datetime||0) - new Date(a?.Datetime||0))
              .slice(0, 10)
              .map(formatTicketItem)
              .filter(Boolean);

            return { reservations, invoices, notes, tickets };
          }
          case 'searchOwners': {
            const keyword = args[0];
            const f = args[1]||{};
            const storeId = resolveStoreId(f.storeId);
            const tokens = tokensOf(keyword);
            const tagKw = normalizeSearch(f.tag||'');
            const notesKw = normalizeSearch(f.notes||'');
            return S.customers
              .filter(c => matchesStore(c.StoreID, storeId))
              .map(c => {
                const tags = parseTagList(c.Tags);
                const pets = S.pets.filter(p=>p.CustomerID===c.CustomerID).map(p=>({Name:p.Name,Breed:p.Breed}));
                const combined = normalizeSearch([c.Name, c.Phone, c.Email, c.Address, c.Notes, c.CustomerID].join(' '));
                const combinedNoHyphen = combined.replace(/-/g,'');
                const tagText = normalizeSearch(tags.map(t=> t.label||'').join(' '));
                return {
                  CustomerID:c.CustomerID, StoreID:c.StoreID, Name:c.Name, Phone:c.Phone, Email:c.Email,
                  Address:c.Address, Notes:c.Notes, UpdatedAt:c.UpdatedAt,
                  MemoDue:c.MemoDue||'', MemoPinned:!!c.MemoPinned,
                  Tags: tags,
                  Pets: pets,
                  PrepaidBalance: 0,
                  __combo: combined,
                  __comboPlain: combinedNoHyphen,
                  __tagText: tagText
                };
              })
              .filter(entry => {
                if (!tokens.length) return true;
                return tokens.every(tok => entry.__combo.includes(tok) || entry.__comboPlain.includes(tok.replace(/-/g,'')) || entry.__tagText.includes(tok));
              })
              .filter(entry => !notesKw || normalizeSearch(entry.Notes).includes(notesKw))
              .filter(entry => !tagKw || entry.Tags.some(t=> normalizeSearch(t.label).includes(tagKw)))
              .map(entry => {
                delete entry.__combo;
                delete entry.__comboPlain;
                delete entry.__tagText;
                return entry;
              });
          }
          case 'searchPets': {
            const keyword = args[0];
            const f = args[1]||{};
            const storeId = resolveStoreId(f.storeId);
            const tokens = tokensOf(keyword);
            const tagKw = normalizeSearch(f.tag||'');
            const notesKw = normalizeSearch(f.notes||'');
            const owners = new Map(S.customers.map(c=>[c.CustomerID, c]));
            const latestByPet = new Map();
            S.visits
              .filter(v => matchesStore(v.StoreID, storeId))
              .forEach(v=>{
                const pid = v.PetID;
                if (!pid) return;
                const ymd = normalizeSearch(v.VisitDate||'');
                const cur = latestByPet.get(pid);
                if (!cur || cur < ymd) latestByPet.set(pid, ymd);
              });
            return S.pets
              .filter(p => matchesStore(p.StoreID, storeId))
              .map(p => {
                const tags = parseTagList(p.Tags);
                const owner = owners.get(p.CustomerID) || {};
                const combined = normalizeSearch([p.Name, p.Breed, p.Sex, owner.Name, p.PetID, p.CustomerID].join(' '));
                const tagText = normalizeSearch(tags.map(t=> t.label||'').join(' '));
                return {
                  PetID:p.PetID, StoreID:p.StoreID, PetName:p.Name, Name:p.Name, Breed:p.Breed, Sex:p.Sex,
                  WeightKg:p.WeightKg, OwnerName:owner.Name||'',
                  LatestVisit: latestByPet.get(p.PetID) || '',
                  Notes:p.Notes||'', MemoDue:p.MemoDue||'', MemoPinned:!!p.MemoPinned,
                  Tags: tags,
                  CustomerID:p.CustomerID,
                  __combo: combined,
                  __tagText: tagText
                };
              })
              .filter(entry => {
                if (!tokens.length) return true;
                return tokens.every(tok => entry.__combo.includes(tok) || entry.__tagText.includes(tok));
              })
              .filter(entry => !notesKw || normalizeSearch(entry.Notes).includes(notesKw))
              .filter(entry => !tagKw || entry.Tags.some(t=> normalizeSearch(t.label).includes(tagKw)))
              .map(entry => {
                delete entry.__combo;
                delete entry.__tagText;
                return entry;
              });
          }

          case 'getPetsByCustomer': { const cid=args[0]; return S.pets.filter(p=> p.CustomerID===cid); }
          case 'createPet': {
            const p = args[0]||{};
            const storeId = resolveStoreId(p.StoreID) || defaultStoreId;
            const q = {PetID:id('P'), StoreID:storeId, CustomerID:p.CustomerID, Name:p.Name, NameKana:p.NameKana||'', Species:p.Species||'ご愛犬', Breed:p.Breed||'', Sex:p.Sex||'', DOB:p.DOB||'', WeightKg:p.WeightKg||'', Color:p.Color||'', Hospital:p.Hospital||'', NeuterStatus:p.NeuterStatus||'', NeuterDate:p.NeuterDate||'', Condition:p.Condition||'', Allergies:p.Allergies||'', Notes:p.Notes||'', MemoDue:p.MemoDue||'', MemoPinned:!!p.MemoPinned, Tags:parseTagList(p.Tags)};
            S.pets.push(q); return q;
          }
          case 'createService': {
            const p=args[0]||{}; const s={ServiceID:p.ServiceID||id('SVC-'), Name:p.Name||'', Category:p.Category||'', Duration:+p.Duration||0, Price:+p.Price||0, Tax:+p.Tax||0, Active: p.Active!==false, From:p.From||'', To:p.To||''};
            const i=S.lookups.services.findIndex(x=>x.ServiceID===s.ServiceID); if(i>=0) S.lookups.services[i]=s; else S.lookups.services.push(s);
            return s;
          }
          case 'createStaff': { const p=args[0]||{}; const s={StaffID:id('ST-'), Name:p.Name||'', Role:p.Role||'', Phone:p.Phone||'', Email:p.Email||'', Active:p.Active!==false}; S.lookups.staff.push(s); return s; }
          case 'createPayment': {
            const p=args[0]||{}; const m={PaymentCode:p.Code||id('PM-'), Name:p.Name||'', Sort:+(p.Sort||0), Active:p.Active!==false};
            const i=S.lookups.payments.findIndex(x=>x.PaymentCode===m.PaymentCode); if(i>=0) S.lookups.payments[i]=m; else S.lookups.payments.push(m); return m;
          }
          case 'createVisit': {
            const p=args[0]||{};
            const storeId = resolveStoreId(p.StoreID) || defaultStoreId;
            const v={VisitID:id('V-'), StoreID:storeId, CustomerID:p.CustomerID, PetID:p.PetID||'', ServiceID:p.ServiceID, ServiceName:(S.lookups.services.find(s=>s.ServiceID===p.ServiceID)?.Name)||'', Quantity:+(p.Quantity||1), PaymentMethod:p.PaymentMethod||'', Staff:p.Staff||'', VisitDate:p.VisitDate||today(), Notes:p.Notes||'', Total: (+(S.lookups.services.find(s=>s.ServiceID===p.ServiceID)?.Price||0)) * +(p.Quantity||1), CashPortion:+(p.CashPortion||0), ARPortion:+(p.ARPortion||0), PrepaidUsed:+(p.PrepaidUsed||0)};
            v.OrderID = v.VisitID;
            S.visits.push(v); return v;
          }
          case 'listStores': {
            return JSON.parse(JSON.stringify(S.lookups.stores||[]));
          }
          case 'saveStore': {
            const p = args[0]||{};
            const store = {
              StoreID: resolveStoreId(p.StoreID) || id('STO-'),
              Name: p.Name || '未設定',
              Type: String(p.Type||'PET').toUpperCase()==='HUMAN' ? 'HUMAN' : 'PET',
              Color: p.Color || '#6ecad1',
              Description: p.Description || '',
              Sort: Number(p.Sort||0),
              Active: p.Active === undefined ? true : !!p.Active
            };
            const stores = S.lookups.stores || (S.lookups.stores = []);
            const idx = stores.findIndex(s=> s.StoreID === store.StoreID);
            if (idx >= 0) stores[idx] = store; else stores.push(store);
            return store;
          }
          case 'searchInvoices': {
            const q = String(args[0]||'').toLowerCase();
            const f = args[1]||{};
            const from = f.from || '';
            const to = f.to || '';
            const status = String(f.status||'').toUpperCase();
            const payment = f.payment || '';
            const storeId = resolveStoreId(f.storeId);
            const customers = new Map(S.customers.map(c=>[String(c.CustomerID), c]));
            const pets = new Map(S.pets.map(p=>[String(p.PetID), p]));
            const list = S.visits.filter(v=>{
              const date = v.VisitDate||'';
              if (from && date < from) return false;
              if (to && date > to) return false;
              if (!matchesStore(v.StoreID, storeId)) return false;
              if (payment && String(v.PaymentMethod||'')!==String(payment)) return false;
              const pending = Number(v.ARPortion||0) > 0;
              if (status==='PENDING' && !pending) return false;
              if (status==='PAID' && pending) return false;
              if (q){
                const cust = customers.get(String(v.CustomerID))||{};
                const pet = pets.get(String(v.PetID))||{};
                const hay = [v.OrderID, v.CustomerID, v.PetID, cust.Name, pet.Name, v.Notes, v.PaymentMethod].join(' ').toLowerCase();
                if (!hay.includes(q)) return false;
              }
              return true;
            }).map(v=>{
              const cust = customers.get(String(v.CustomerID))||{};
              const pet = pets.get(String(v.PetID))||{};
              const pending = Number(v.ARPortion||0) > 0;
              return {
                OrderID: v.OrderID || v.VisitID || '',
                StoreID: v.StoreID || '',
                VisitDate: v.VisitDate || '',
                CustomerID: v.CustomerID || '',
                CustomerName: cust.Name || '',
                PetID: v.PetID || '',
                PetName: pet.Name || '',
                PaymentMethod: v.PaymentMethod || '',
                PaymentName: v.PaymentMethod || '',
                Total: Number(v.Total||0),
                Balance: pending ? Number(v.ARPortion||0) : 0,
                PrepaidUsed: Number(v.PrepaidUsed||0),
                Status: pending ? 'PENDING' : 'PAID',
                StatusLabel: pending ? '支払待ち' : '支払済み',
                Notes: v.Notes || ''
              };
            });
            list.sort((a,b)=> String(b.VisitDate||'').localeCompare(String(a.VisitDate||'')));
            const pendingRows = list.filter(r=> r.Status==='PENDING');
            return {
              results: list,
              summary: {
                count: list.length,
                total: list.reduce((sum,row)=> sum + Number(row.Total||0), 0),
                pendingCount: pendingRows.length,
                pendingTotal: pendingRows.reduce((sum,row)=> sum + Number(row.Balance||0), 0),
                period: { from: from||'', to: to||'' }
              }
            };
          }
                // run emoji → feather replacer on initial render
                // Native emoji used directly - no replacement needed
    __safeCall(window.__initCardEntrance); // trigger card entrance for any dynamically loaded content
          case 'downloadMonthlySales': {
            const param = args[0];
            const ym = (param && typeof param === 'object') ? String(param.month||'') : String(param||'');
            const storeId = resolveStoreId(param);
            const labelYm = ym || today().slice(0,7);
            const parts = ym.split('-');
            const year = Number(parts[0]) || new Date().getFullYear();
            const monthIdx = (Number(parts[1])||1) - 1;
            const from = toYMD(new Date(year, monthIdx, 1));
            const to = toYMD(new Date(year, monthIdx+1, 0));
            const invoiceRes = this.call('searchInvoices', '', {from, to, storeId}) || {results:[]};
            const rows = [['VisitDate','OrderID','CustomerID','CustomerName','PetID','PetName','PaymentMethod','Total','Balance','Status']];
            (invoiceRes.results||[]).forEach(r=>{
              rows.push([
                r.VisitDate||'', r.OrderID||'', r.CustomerID||'', r.CustomerName||'',
                r.PetID||'', r.PetName||'', r.PaymentMethod||'', Number(r.Total||0), Number(r.Balance||0), r.Status||''
              ].map(v=>`"${String(v).replace(/"/g,'""')}"`));
            });
            const csv = rows.map(r=> r.join(',')).join('\r\n');
            const base64 = (typeof btoa==='function') ? btoa(unescape(encodeURIComponent(csv))) : '';
            return { filename: `sales-${labelYm}.csv`, mimeType:'text/csv', base64 };
          }
          case 'getDailySalesReport': {
            const range = args[0]||{};
            let from = range.from || '';
            let to = range.to || '';
            if (!from || !to){
              const days = Number(range.preset || range.days || 30) || 30;
              const end = new Date(); end.setHours(0,0,0,0);
              const start = new Date(end); start.setDate(start.getDate() - (days-1));
              from = toYMD(start); to = toYMD(end);
            }else if (from > to){ const tmp = from; from = to; to = tmp; }
            const storeId = resolveStoreId(range.storeId);
            const customers = new Map(S.customers.map(c=>[String(c.CustomerID), c]));
            const pets = new Map(S.pets.map(p=>[String(p.PetID), p]));
            const dailyMap = new Map();
            const details = {};
            const summaryCustomers = new Set();
            (S.visits||[]).forEach(v=>{
              const date = v.VisitDate || '';
              if (!date || date < from || date > to) return;
              if (!matchesStore(v.StoreID, storeId)) return;
              if (!dailyMap.has(date)) dailyMap.set(date, { date, total:0, count:0, cash:0, ar:0, prepaid:0, customers:new Set() });
              const bucket = dailyMap.get(date);
              const total = Number(v.Total||0);
              bucket.total += total;
              bucket.count += 1;
              bucket.cash += Number(v.CashPortion||0);
              bucket.ar += Number(v.ARPortion||0);
              bucket.prepaid += Number(v.PrepaidUsed||0);
              const custId = String(v.CustomerID||'');
              if (custId){ bucket.customers.add(custId); summaryCustomers.add(custId); }
              const list = details[date] || (details[date] = []);
              list.push({
                orderId: v.OrderID || v.VisitID || '',
                customerId: v.CustomerID || '',
                customerName: customers.get(String(v.CustomerID))?.Name || '',
                petId: v.PetID || '',
                petName: pets.get(String(v.PetID))?.Name || '',
                paymentMethod: v.PaymentMethod || '',
                paymentName: v.PaymentMethod || '',
                total,
                balance: Number(v.ARPortion||0),
                cashPortion: Number(v.CashPortion||0),
                prepaidUsed: Number(v.PrepaidUsed||0),
                staff: v.Staff || '',
                notes: v.Notes || '',
                items: []
              });
            });
            const daily = Array.from(dailyMap.values()).map(row=>{
              const unique = row.customers ? row.customers.size : 0;
              return {
                date: row.date,
                total: row.total,
                count: row.count,
                cash: row.cash,
                ar: row.ar,
                prepaid: row.prepaid,
                uniqueCustomers: unique,
                unitPrice: unique ? row.total / unique : (row.count ? row.total / row.count : 0)
              };
            }).sort((a,b)=> a.date.localeCompare(b.date));
            const summaryTotal = daily.reduce((sum,row)=> sum + Number(row.total||0), 0);
            const summaryCount = daily.reduce((sum,row)=> sum + Number(row.count||0), 0);
            const summary = {
              total: summaryTotal,
              count: summaryCount,
              average: daily.length ? summaryTotal / daily.length : 0,
              max: daily.reduce((m,row)=> Math.max(m, Number(row.total||0)), 0),
              cash: daily.reduce((sum,row)=> sum + Number(row.cash||0), 0),
              ar: daily.reduce((sum,row)=> sum + Number(row.ar||0), 0),
              prepaid: daily.reduce((sum,row)=> sum + Number(row.prepaid||0), 0),
              uniqueCustomers: summaryCustomers.size,
              unitPrice: summaryCustomers.size ? summaryTotal / summaryCustomers.size : (summaryCount ? summaryTotal / summaryCount : 0)
            };
            return { period:{from,to}, daily, summary, details };
          }
          case 'downloadDailySalesCsv': {
            const report = this.call('getDailySalesReport', args[0]||{}) || { period:{}, daily:[] };
            const rows = [['Date','Sales','VisitCount','Cash','AR','Prepaid','UniqueCustomers','CustomerUnitPrice']];
            (report.daily||[]).forEach(row=>{
              rows.push([
                row.date||'',
                Number(row.total||0),
                Number(row.count||0),
                Number(row.cash||0),
                Number(row.ar||0),
                Number(row.prepaid||0),
                Number(row.uniqueCustomers||0),
                Number(row.unitPrice||0)
              ]);
            });
            const csv = rows.map(r=> r.join(',')).join('\r\n');
            const label = `${report.period?.from || 'start'}-${report.period?.to || 'end'}`.replace(/\s+/g,'');
            const base64 = (typeof btoa==='function') ? btoa(unescape(encodeURIComponent(csv))) : '';
            return { filename:`daily-sales-${label}.csv`, mimeType:'text/csv', base64 };
          }
          case 'listVisitsByCustomer': { const cid=args[0]; return S.visits.filter(v=>v.CustomerID===cid).sort((a,b)=> new Date(b.VisitDate)-new Date(a.VisitDate)).slice(0,20); }
          case 'createReservation': {
            const p=args[0]||{};
            // 予約本体
            const r={ReservationID:id('R-'), CustomerID:p.CustomerID, PetID:p.PetID, ServiceID:p.ServiceID,
            Staff:p.Staff||'', Date:p.Date, Start:p.Start, End:p.End, Title:p.Title||'', Notes:p.Notes||''};
            // リマインド情報（前日）
            const rem = p.Reminder || {};
            r.ReminderEnabled = !!rem.Enabled;
            r.ReminderTime = (rem.Time || '09:00'); // "HH:MM"
            if (r.ReminderEnabled && r.Date){
            const d = new Date(p.Date + 'T00:00:00');
            d.setDate(d.getDate()-1); // 前日
            const [hh,mm] = r.ReminderTime.split(':').map(Number);
            d.setHours(hh||9, mm||0, 0, 0);
            r.ReminderAt = d.toISOString();
            }else{r.ReminderAt = ''; }
            S.reservations.push(r);return r;
          }
          case 'sendTomorrowReminders': {
            const now = new Date();
            const tmr = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1);
            const ds = tmr.toISOString().slice(0,10);
            const targets = S.reservations.filter(r=> r.Date===ds && r.ReminderEnabled);
           // 実送はしないが、ここでメール送信/GAS連携を想定。返却で件数を通知。
            return { count: targets.length, reservations: targets };
          }

          case 'listReservations': {
           return S.reservations.slice().sort((a,b)=> (a.Date + a.Start).localeCompare(b.Date + b.Start));}

          case 'createStaffNote': { const p=args[0]||{}; const n={NoteID:id('N-'), Category:p.Category||'', Title:p.Title||'', Audience:p.Audience||'', Pinned:!!p.Pinned, Body:p.Body||'', CreatedAt:new Date().toISOString()}; S.notes.unshift(n); return n; }
          case 'listStaffNotes': { return S.notes.slice(0,20); }
          case 'createTicket': { const p=args[0]||{}; const t={TicketID:id('T-'), Category:p.Category||'', Title:p.Title||'', Related:p.Related||'', Assignee:p.Assignee||'', Impact:p.Impact||'', Desc:p.Desc||'', CreatedAt:new Date().toISOString()}; S.tickets.unshift(t); return t; }
          case 'listTickets': { return S.tickets.slice(0,20); }
          case 'getCustomerBundle': {
            const cid=args[0]; const customer=S.customers.find(c=>c.CustomerID===cid); const pets=S.pets.filter(p=>p.CustomerID===cid); const visits=S.visits.filter(v=>v.CustomerID===cid).sort((a,b)=> new Date(b.VisitDate)-new Date(a.VisitDate)); return {customer, pets, visits};
          }
          case 'getPetBundleUnified': { const pid=args[0]; const pet=S.pets.find(p=>p.PetID===pid); const visits=S.visits.filter(v=>v.PetID===pid).sort((a,b)=> new Date(b.VisitDate)-new Date(a.VisitDate)); return {pet, visits, images:[], journal:[]}; }
          case 'upsertPetCard': return {ok:true};
          case 'savePetImage': return {ok:true};
          default: throw new Error('未対応のモック関数: '+fn);
        }
      }
    };
  })();

  function canRun(){ return typeof google!=='undefined' && google.script && google.script.run; }
  function callServer(fnName, ...args){
    if (canRun()){
      return new Promise((resolve, reject)=>{
        try{ google.script.run.withSuccessHandler(resolve).withFailureHandler(reject)[fnName](...args); }
        catch(e){ reject(e); }
      });
    }else{
      try{ return Promise.resolve(mock.call(fnName, ...args)); }
      catch(e){ return Promise.reject(e); }
    }
  }
  async function ensureDirectoryLoaded(force){
    if (force){ membersLoaded = false; }
    if (!customersLite.length || force){
      await loadCustomersLite();
    }
    if (!membersLoaded || force){
      await loadStoreMembers().catch(()=>{});
    }
    renderDirectoryCustomers();
    renderDirectoryMembers();
  }

  async function ensureMerchLoaded(force){
    if (force){ merchLoaded = false; }
    if (merchLoaded && !force){
      renderMerchDashboard();
      return;
    }
    await loadMerchDashboard({ force });
  }

  async function loadMerchDashboard(options={}){
    if (merchLoading && !options.force) return;
    merchLoading = true;
    showLoading('merch', '物販ダッシュボードを読み込み中…', { cancelable: true });
    if (ui.btnReloadMerch) toggleBtn(ui.btnReloadMerch, true);
    const storeId = getCurrentStoreId();
    const payload = storeId ? { storeId } : {};
    try{
      const res = await callServer('getMerchandiseDashboard', payload);
      merchData = {
        goods: Array.isArray(res?.goods) ? res.goods : [],
        goodsSummary: res?.goodsSummary || {},
        inventory: res?.inventory || { items:[], summary:{} },
        purchases: res?.purchases || { items:[], summary:{} }
      };
      merchLoaded = true;
      renderMerchDashboard();
    }catch(e){
      console.error(e);
      merchData = { goods:[], goodsSummary:{}, inventory:{ items:[], summary:{} }, purchases:{ items:[], summary:{} } };
      merchLoaded = true;
      renderMerchDashboard(true);
    }finally{
      merchLoading = false;
      hideLoading('merch');
      if (ui.btnReloadMerch) toggleBtn(ui.btnReloadMerch, false);
    }
  }

  function renderMerchDashboard(error){
    if (ui.merchSummaryTotal){
      const total = Number(merchData?.goodsSummary?.total || (merchData.goods?.length || 0));
      ui.merchSummaryTotal.textContent = `${total} 件`;
    }
    if (ui.merchSummaryActive){
      const active = Number(merchData?.goodsSummary?.active || 0);
      ui.merchSummaryActive.textContent = `${active} 件`;
    }
    if (ui.merchSummaryAverage){
      const avg = Number(merchData?.goodsSummary?.averagePrice || 0);
      ui.merchSummaryAverage.textContent = formatYen(avg);
    }
    if (ui.merchSummaryCategories){
      const cats = Array.isArray(merchData?.goodsSummary?.categories) ? merchData.goodsSummary.categories : [];
      ui.merchSummaryCategories.textContent = cats.length
        ? cats.slice(0,4).map(c => `${escapeHtml(c.category || '未分類')}(${c.count || 0})`).join('・')
        : '-';
    }
    if (error){
      if (ui.merchGoodsList) ui.merchGoodsList.innerHTML = '<div class="muted-text">物販データの取得に失敗しました。</div>';
      if (ui.inventoryList) ui.inventoryList.innerHTML = '';
      if (ui.purchaseList) ui.purchaseList.innerHTML = '';
      return;
    }
    if (ui.merchGoodsList){
      const goods = Array.isArray(merchData.goods) ? merchData.goods : [];
      ui.merchGoodsList.innerHTML = goods.length
        ? goods.slice(0, 200).map(renderMerchItem).join('')
        : '<div class="muted-text">商品が登録されていません。</div>';
    }
    const inventoryItems = Array.isArray(merchData.inventory?.items) ? merchData.inventory.items : [];
    const inventorySummary = merchData.inventory?.summary || {};
    if (ui.inventorySummaryTracked) ui.inventorySummaryTracked.textContent = `${inventorySummary.tracked ?? inventoryItems.length}`;
    if (ui.inventorySummaryOnHand) ui.inventorySummaryOnHand.textContent = `${Number(inventorySummary.totalOnHand || 0)}`;
    if (ui.inventorySummaryAlerts){
      const alerts = inventorySummary.lowStock != null
        ? Number(inventorySummary.lowStock || 0)
        : inventoryItems.filter(item => String(item.Status || '').toUpperCase() !== 'OK').length;
      ui.inventorySummaryAlerts.textContent = `${alerts}`;
    }
    if (ui.inventoryList){
      ui.inventoryList.innerHTML = inventoryItems.length
        ? inventoryItems.map(renderInventoryItem).join('')
        : '<div class="muted-text">在庫データが登録されていません。</div>';
    }
    const purchaseItems = Array.isArray(merchData.purchases?.items) ? merchData.purchases.items : [];
    const purchaseSummary = merchData.purchases?.summary || {};
    if (ui.purchaseSummaryPending) ui.purchaseSummaryPending.textContent = `${purchaseSummary.pendingOrders ?? purchaseItems.filter(item => !/完了|受領|済/.test(String(item.Status || ''))).length} 件`;
    if (ui.purchaseSummaryIncoming) ui.purchaseSummaryIncoming.textContent = `${Number(purchaseSummary.incomingQuantity || 0)}`;
    if (ui.purchaseSummaryNext) ui.purchaseSummaryNext.textContent = purchaseSummary.nextArrival || '-';
    if (ui.purchaseList){
      ui.purchaseList.innerHTML = purchaseItems.length
        ? purchaseItems.map(renderPurchaseItem).join('')
        : '<div class="muted-text">進行中の発注はありません。</div>';
    }
  }

  function renderMerchItem(item){
    const title = escapeHtml(item.Name || '(未設定)');
    const category = item.Category ? `<span class="badge">${escapeHtml(item.Category)}</span>` : '';
    const status = item.Active === false ? '<span class="badge">販売停止</span>' : '<span class="badge">販売中</span>';
    const sku = item.SKU ? `<span class="muted-text">SKU:${escapeHtml(item.SKU)}</span>` : '';
    const unit = escapeHtml(item.Unit || '個');
    const price = formatYen(item.Price || 0);
    const memo = item.Description ? `<div class="meta">${escapeHtml(item.Description)}</div>` : '';
    return `<div class="merch-item">
      <div class="title">${title}</div>
      <div class="meta">${status}${category}</div>
      <div class="meta">${price} / ${unit} ${sku}</div>
      ${memo}
    </div>`;
  }

  function inventoryStatusLabel(status){
    switch(String(status || '').toUpperCase()){
      case 'OUT': return '在庫切れ';
      case 'LOW': return '残りわずか';
      case 'OK': return '良好';
      case 'MISSING': return '未登録';
      default: return status || '未設定';
    }
  }

  function renderInventoryItem(item){
    const title = escapeHtml(item.ProductName || '(商品未登録)');
    const status = String(item.Status || '').toUpperCase() || 'MISSING';
    const statusLabel = inventoryStatusLabel(status);
    const onHand = Number(item.OnHand || 0);
    const safety = item.SafetyStock ? `<span>安全在庫 ${Number(item.SafetyStock)}</span>` : '';
    const updated = item.UpdatedAt ? escapeHtml(item.UpdatedAt) : '-';
    const memo = item.Memo ? `<div class="meta">${escapeHtml(item.Memo)}</div>` : '';
    return `<div class="inventory-item">
      <div class="title">${title}</div>
      <div class="meta"><span class="inventory-status" data-status="${escapeHtml(status)}">${statusLabel}</span><span>在庫 ${onHand}</span>${safety}</div>
      <div class="meta">更新日: ${updated}</div>
      ${memo}
    </div>`;
  }

  function renderPurchaseItem(item){
    const title = escapeHtml(item.ProductName || '(商品未登録)');
    const status = escapeHtml(item.Status || '発注中');
    const vendor = item.Vendor ? `<span>${escapeHtml(item.Vendor)}</span>` : '';
    const ordered = item.OrderedAt ? escapeHtml(item.OrderedAt) : '-';
    const expected = item.ExpectedAt ? escapeHtml(item.ExpectedAt) : '-';
    const qty = Number(item.Quantity || 0);
    const total = item.Total != null ? formatYen(item.Total) : '';
    const memo = item.Memo ? `<div class="meta">${escapeHtml(item.Memo)}</div>` : '';
    return `<div class="purchase-item">
      <div class="title">${title}</div>
      <div class="meta"><span class="status">${status}</span><span>数量 ${qty}</span>${total ? `<span>${total}</span>` : ''}</div>
      <div class="meta">発注日: ${ordered} / 入荷予定: ${expected} ${vendor}</div>
      ${memo}
    </div>`;
  }

  async function ensureEventsLoaded(force){
    if (force){ eventsLoaded = false; }
    if (eventsLoaded && !force){
      renderEventsList();
      return;
    }
    await loadEventsDashboard({ force });
  }

  async function loadEventsDashboard(options={}){
    if (eventsLoading && !options.force) return;
    eventsLoading = true;
    showLoading('events', 'イベント情報を読み込み中…', { cancelable: true });
    if (ui.btnReloadEvents) toggleBtn(ui.btnReloadEvents, true);
    const storeId = getCurrentStoreId();
    const payload = storeId ? { storeId } : {};
    try{
      const res = await callServer('getEventDashboard', payload);
      eventsData = {
        events: Array.isArray(res?.events) ? res.events : [],
        summary: res?.summary || {}
      };
      eventsLoaded = true;
      renderEventsList();
    }catch(e){
      console.error(e);
      eventsData = { events:[], summary:{} };
      eventsLoaded = true;
      if (ui.eventsList) ui.eventsList.innerHTML = '<div class="muted-text">イベント情報の取得に失敗しました。</div>';
      if (ui.eventsEmpty) ui.eventsEmpty.hidden = false;
      updateEventsSummary({});
    }finally{
      eventsLoading = false;
      hideLoading('events');
      if (ui.btnReloadEvents) toggleBtn(ui.btnReloadEvents, false);
    }
  }

  function updateEventsSummary(summary){
    const data = summary || {};
    if (ui.eventSummaryUpcoming) ui.eventSummaryUpcoming.textContent = `${data.upcoming || 0} 件`;
    if (ui.eventSummaryToday) ui.eventSummaryToday.textContent = `${data.today || 0} 件`;
    if (ui.eventSummaryStaff) ui.eventSummaryStaff.textContent = `${data.staffInvolved || 0} 名`;
    if (ui.eventSummaryNext){
      const next = data.nextEvent;
      if (next){
        const parts = [next.date, next.time, next.title].filter(Boolean).map(escapeHtml);
        ui.eventSummaryNext.textContent = parts.join(' ') || '-';
      }else{
        ui.eventSummaryNext.textContent = '-';
      }
    }
  }

  function matchTokensForEvent(event, tokens){
    if (!tokens.length) return true;
    const fields = [
      event.Title,
      event.Location,
      event.Status,
      Array.isArray(event.Staff) ? event.Staff.join(' ') : event.StaffRaw
    ].map(normalizeKeyword).join(' ');
    if (!fields) return false;
    return tokens.every(tok => fields.includes(tok));
  }

  function renderEventsList(){
    if (!ui.eventsList) return;
    if (!eventsLoaded && eventsLoading){
      ui.eventsList.innerHTML = '<div class="muted-text">読み込み中です…</div>';
      return;
    }
    const tokens = tokenizeKeyword(ui.eventFilterKeyword?.value || '');
    const statusFilter = String(ui.eventFilterStatus?.value || '').toLowerCase();
    const list = Array.isArray(eventsData.events) ? eventsData.events : [];
    const today = toYMDLocal(new Date());
    const filtered = list.filter(ev => {
      const start = ev.StartDate || '';
      const end = ev.EndDate || ev.StartDate || '';
      if (statusFilter === 'upcoming' && (!end || end < today)) return false;
      if (statusFilter === 'today' && !(start && start <= today && end >= today)) return false;
      if (statusFilter === 'past' && (!end || end >= today)) return false;
      if (!tokens.length) return true;
      return matchTokensForEvent(ev, tokens);
    });
    updateEventsSummary(eventsData.summary || {});
    if (!filtered.length){
      ui.eventsList.innerHTML = '<div class="muted-text">該当するイベントがありません。</div>';
      if (ui.eventsEmpty) ui.eventsEmpty.hidden = false;
    }else{
      ui.eventsList.innerHTML = filtered.slice(0, 200).map(renderEventCard).join('');
      if (ui.eventsEmpty) ui.eventsEmpty.hidden = true;
    }
  }

  function renderEventCard(ev){
    const title = escapeHtml(ev.Title || '(イベント)');
    const status = ev.Status ? `<span class="badge">${escapeHtml(ev.Status)}</span>` : '';
    const start = ev.StartDate ? escapeHtml(ev.StartDate) : '';
    const end = ev.EndDate && ev.EndDate !== ev.StartDate ? ` 〜 ${escapeHtml(ev.EndDate)}` : '';
    const time = ev.StartTime || ev.EndTime ? `${escapeHtml(ev.StartTime || '')}〜${escapeHtml(ev.EndTime || '')}` : '';
    const location = ev.Location ? `<div class="meta">場所: ${escapeHtml(ev.Location)}</div>` : '';
    const staffChips = Array.isArray(ev.Staff) && ev.Staff.length
      ? `<div class="chips">${ev.Staff.map(name => `<span class="chip">${escapeHtml(name)}</span>`).join('')}</div>`
      : '';
    const desc = ev.Description ? `<div class="meta">${escapeHtml(ev.Description)}</div>` : '';
    return `<div class="event-card">
      <div class="title">${title} ${status}</div>
      <div class="time">${[start + end, time].filter(Boolean).join(' / ') || '-'}</div>
      ${location}
      ${staffChips}
      ${desc}
    </div>`;
  }

  function setAccountingPresetDays(days){
    const end = new Date();
    end.setHours(0,0,0,0);
    const start = new Date(end);
    start.setDate(start.getDate() - Math.max(0, (Number(days)||1) - 1));
    const from = toYMDLocal(start);
    const to = toYMDLocal(end);
    if (ui.accountingFrom) ui.accountingFrom.value = from;
    if (ui.accountingTo) ui.accountingTo.value = to;
    ensureAccountingBreakdown(true);
  }

  async function ensureAccountingBreakdown(force){
    if (force){ accountingLoaded = false; }
    if (accountingLoading) return;
    if (accountingLoaded && !force){
      renderAccountingBreakdown(accountingData);
      return;
    }
    await loadAccountingBreakdown();
  }

  async function loadAccountingBreakdown(){
    if (accountingLoading) return;
    accountingLoading = true;
    showLoading('accounting', '会計内訳を読み込み中…', { cancelable: true });
    toggleBtn(ui.btnAccountingReload, true);
    const params = {};
    const from = ui.accountingFrom?.value || '';
    const to = ui.accountingTo?.value || '';
    if (from) params.from = from;
    if (to) params.to = to;
    const storeId = getCurrentStoreId();
    if (storeId) params.storeId = storeId;
    try{
      const res = await callServer('getAccountingBreakdown', params);
      accountingData = res || null;
      accountingLoaded = true;
      renderAccountingBreakdown(accountingData);
    }catch(e){
      console.error(e);
      accountingLoaded = false;
      renderAccountingBreakdown(null, e);
    }finally{
      accountingLoading = false;
      hideLoading('accounting');
      toggleBtn(ui.btnAccountingReload, false);
    }
  }

  function renderAccountingBreakdown(data, error){
    if (!ui.accountingTypeList || !ui.accountingCategoryBody || !ui.accountingItemBody || !ui.accountingPaymentBody) return;
    if (error){
      ui.accountingTypeList.innerHTML = '';
      ui.accountingCategoryBody.innerHTML = '';
      ui.accountingItemBody.innerHTML = '';
      ui.accountingPaymentBody.innerHTML = '';
      if (ui.accountingEmpty){ ui.accountingEmpty.hidden = false; ui.accountingEmpty.textContent = '内訳の取得に失敗しました。'; }
      if (ui.accountingBreakdownPeriod) ui.accountingBreakdownPeriod.textContent = '-';
      if (ui.accountingTotalAmount) ui.accountingTotalAmount.textContent = '¥0';
      if (ui.accountingTotalVisits) ui.accountingTotalVisits.textContent = '0 件';
      if (ui.accountingTotalItems) ui.accountingTotalItems.textContent = '0 明細';
      return;
    }
    if (!data){
      ui.accountingTypeList.innerHTML = '';
      ui.accountingCategoryBody.innerHTML = '';
      ui.accountingItemBody.innerHTML = '';
      ui.accountingPaymentBody.innerHTML = '';
      if (ui.accountingEmpty){ ui.accountingEmpty.hidden = false; ui.accountingEmpty.textContent = '内訳がまだ表示されていません。'; }
      if (ui.accountingBreakdownPeriod) ui.accountingBreakdownPeriod.textContent = '-';
      if (ui.accountingTotalAmount) ui.accountingTotalAmount.textContent = '¥0';
      if (ui.accountingTotalVisits) ui.accountingTotalVisits.textContent = '0 件';
      if (ui.accountingTotalItems) ui.accountingTotalItems.textContent = '0 明細';
      return;
    }
    if (ui.accountingEmpty) ui.accountingEmpty.hidden = true;
    if (ui.accountingBreakdownPeriod){
      const from = data.period?.from || '';
      const to = data.period?.to || '';
      ui.accountingBreakdownPeriod.textContent = `期間: ${from || '-'} 〜 ${to || '-'}`;
    }
    if (ui.accountingTotalAmount) ui.accountingTotalAmount.textContent = formatYen(data.totals?.amount || 0);
    if (ui.accountingTotalVisits) ui.accountingTotalVisits.textContent = `${data.totals?.visits || 0} 件`;
    if (ui.accountingTotalItems) ui.accountingTotalItems.textContent = `${data.totals?.items || 0} 明細`;
    const typeRows = Array.isArray(data.byType) ? data.byType : [];
    ui.accountingTypeList.innerHTML = typeRows.length
      ? typeRows.map(row => `<li>${escapeHtml(row.label || row.key || '未設定')}：${formatYen(row.total || 0)}（${row.quantity || 0}件）</li>`).join('')
      : '<li>データがありません</li>';
    const categoryRows = Array.isArray(data.byCategory) ? data.byCategory : [];
    ui.accountingCategoryBody.innerHTML = categoryRows.length
      ? categoryRows.map(row => `<tr><td>${escapeHtml(row.label || row.key || '未分類')}</td><td>${formatYen(row.total || 0)}</td><td>${row.quantity || 0}</td></tr>`).join('')
      : '<tr><td colspan="3">データがありません</td></tr>';
    const itemRows = Array.isArray(data.byItem) ? data.byItem : [];
    ui.accountingItemBody.innerHTML = itemRows.length
      ? itemRows.map(row => `<tr><td>${escapeHtml(row.label || row.key || '未設定')}</td><td>${escapeHtml(row.category || '')}</td><td>${formatYen(row.total || 0)}</td><td>${row.quantity || 0}</td></tr>`).join('')
      : '<tr><td colspan="4">データがありません</td></tr>';
    const paymentRows = Array.isArray(data.payments) ? data.payments : [];
    ui.accountingPaymentBody.innerHTML = paymentRows.length
      ? paymentRows.map(row => `<tr><td>${escapeHtml(row.label || row.key || '未設定')}</td><td>${formatYen(row.total || 0)}</td><td>${row.count || 0}</td><td>${formatYen(row.balance || 0)}</td></tr>`).join('')
      : '<tr><td colspan="4">データがありません</td></tr>';
  }

  function loadStoreMembers(){
    membersLoaded = false;
    const storeId = getCurrentStoreId();
    const payload = storeId ? { storeId } : {};
    showLoading('members', '会員データを読み込み中…', { cancelable: true });
    return callServer('listStoreMembers', payload).then(res => {
      storeMembers = Array.isArray(res?.members) ? res.members : [];
      memberSummary = res?.summary || {};
      membersLoaded = true;
      renderDirectoryMembers();
      hideLoading('members');
    }).catch(e => {
      console.error(e);
      storeMembers = [];
      memberSummary = {};
      membersLoaded = true;
      renderDirectoryMembers(true);
      hideLoading('members');
    });
  }

  function matchTokensForCustomer(customer, tokens){
    if (!tokens.length) return true;
    const fields = [
      customer.CustomerID,
      customer.Name,
      customer.Kana,
      customer.Phone,
      customer.Email,
      customer.Address,
      customer.Notes,
      (Array.isArray(customer.Tags) ? customer.Tags.map(t => t.label).join(' ') : '')
    ].map(normalizeKeyword).join(' ');
    if (!fields) return false;
    return tokens.every(tok => fields.includes(tok));
  }

  function renderDirectoryCustomers(){
    if (!ui.directoryCustomerList) return;
    const tokens = tokenizeKeyword(ui.directoryCustomerFilter?.value || '');
    const list = (customersLite || []).filter(c => belongsToCurrentStore(c.StoreID || c.storeId));
    const filtered = tokens.length ? list.filter(c => matchTokensForCustomer(c, tokens)) : list;
    if (!filtered.length){
      ui.directoryCustomerList.innerHTML = '<div class="muted-text">顧客データが見つかりません。</div>';
    }else{
      const limit = 250;
      const rows = filtered.slice(0, limit).map(renderCustomerEntry).join('');
      const note = (filtered.length > limit)
        ? `<div class="muted-text">他 ${filtered.length - limit} 件は検索条件を絞り込んでください。</div>`
        : '';
      ui.directoryCustomerList.innerHTML = rows + note;
    }
    if (ui.directoryCustomerSummary){ ui.directoryCustomerSummary.textContent = `${filtered.length} 件`; }
  }

  function renderCustomerEntry(c){
    const name = escapeHtml(c.Name || '(無名)');
    const cid = escapeHtml(c.CustomerID || '');
    const phone = c.Phone ? `<span>${escapeHtml(c.Phone)}</span>` : '';
    const email = c.Email ? `<span>${escapeHtml(c.Email)}</span>` : '';
    const address = c.Address ? `<span>${escapeHtml(c.Address)}</span>` : '';
    const tagList = normalizeTags(c.Tags);
    const tags = tagList.length
      ? `<div class="tags">${tagList.map(renderDirectoryTag).join('')}</div>`
      : '';
    const memoDue = c.MemoDue ? `<span class="badge">メモ期限 ${escapeHtml(c.MemoDue)}</span>` : '';
    const prepaid = Number(c.PrepaidBalance || 0);
    const prepaidBadge = prepaid ? `<span class="badge">前受金 ${formatYen(prepaid)}</span>` : '';
    const memo = c.Notes ? `<div class="meta">メモ: ${escapeHtml(c.Notes)}</div>` : '';
    return `<div class="directory-entry">
      <div class="title">${name} <span class="muted-text">CID:${cid}</span></div>
      <div class="meta">${[phone, email, address].filter(Boolean).join(' ')}</div>
      ${tags}
      <div class="meta">${[memoDue, prepaidBadge].filter(Boolean).join(' ')}</div>
      ${memo}
    </div>`;
  }

  function renderDirectoryTag(tag){
    const formatted = formatTag(tag);
    if (!formatted) return '';
    const color = normalizeColor(formatted.color || '');
    const soft = color ? hexToRgba(color, 0.18) : '';
    const styleParts = [];
    if (color){ styleParts.push(`--tag-color:${color}`); }
    if (soft){ styleParts.push(`--tag-color-soft:${soft}`); }
    const styleAttr = styleParts.length ? ` style="${styleParts.join(';')}"` : '';
    const dataAttr = color ? ` data-color="${escapeHtml(color)}"` : '';
    return `<span class="tag"${dataAttr}${styleAttr}>${escapeHtml(formatted.label)}</span>`;
  }

  function matchTokensForMember(member, tokens){
    if (!tokens.length) return true;
    const fields = [
      member.MemberID,
      member.CustomerName,
      member.PlanName,
      member.Status,
      member.StartDate,
      member.EndDate
    ].map(normalizeKeyword).join(' ');
    if (!fields) return false;
    return tokens.every(tok => fields.includes(tok));
  }

  function renderDirectoryMembers(error){
    if (!ui.directoryMemberList) return;
    if (error){
      ui.directoryMemberList.innerHTML = '<div class="muted-text">会員データの取得に失敗しました。</div>';
      if (ui.directoryMemberSummary) ui.directoryMemberSummary.textContent = '-';
      return;
    }
    if (!membersLoaded){
      ui.directoryMemberList.innerHTML = '<div class="muted-text">読み込み中です…</div>';
      return;
    }
    const tokens = tokenizeKeyword(ui.directoryMemberFilter?.value || '');
    const list = Array.isArray(storeMembers) ? storeMembers.slice() : [];
    const filtered = tokens.length ? list.filter(m => matchTokensForMember(m, tokens)) : list;
    if (!filtered.length){
      ui.directoryMemberList.innerHTML = '<div class="muted-text">会員が見つかりません。</div>';
    }else{
      const limit = 200;
      const rows = filtered.slice(0, limit).map(renderMemberEntry).join('');
      const note = (filtered.length > limit)
        ? `<div class="muted-text">他 ${filtered.length - limit} 件は検索条件を絞り込んでください。</div>`
        : '';
      ui.directoryMemberList.innerHTML = rows + note;
    }
    if (ui.directoryMemberSummary){
      const active = Number(memberSummary?.active || 0);
      const total = memberSummary?.total != null ? Number(memberSummary.total) : filtered.length;
      const ending = Number(memberSummary?.endingSoon || 0);
      const monthly = Number(memberSummary?.monthlyFee || 0);
      const endingText = ending ? ` / 解約予定 ${ending}` : '';
      const monthlyText = monthly ? ` / 月額計 ${formatYen(monthly)}` : '';
      ui.directoryMemberSummary.textContent = `アクティブ ${active} / 全体 ${total}${endingText}${monthlyText}`;
    }
  }

  function renderMemberEntry(member){
    const name = escapeHtml(member.CustomerName || '(無名)');
    const mid = escapeHtml(member.MemberID || '');
    const plan = member.PlanName ? `<div class="meta">プラン: ${escapeHtml(member.PlanName)}</div>` : '';
    const start = member.StartDate ? escapeHtml(member.StartDate) : '';
    const end = member.EndDate ? escapeHtml(member.EndDate) : '';
    const period = start || end ? `${start || '開始未設定'} 〜 ${end || '継続中'}` : '';
    const status = String(member.Status || '').toUpperCase();
    const statusLabel = status === 'ACTIVE' ? '利用中' : '停止中';
    const monthly = member.MonthlyFee ? `<span class="badge">月額 ${formatYen(member.MonthlyFee)}</span>` : '';
    let remaining = '';
    if (typeof member.RemainingDays === 'number'){
      if (member.RemainingDays >= 0) remaining = `<span class="badge">残り${member.RemainingDays}日</span>`;
      else remaining = `<span class="badge">終了${Math.abs(member.RemainingDays)}日前</span>`;
    }
    const statusBadge = `<span class="badge">${statusLabel}</span>`;
    return `<div class="directory-entry">
      <div class="title">${name} <span class="muted-text">MID:${mid}</span></div>
      <div class="meta">${statusBadge}${monthly}${remaining}</div>
      ${plan}
      ${period ? `<div class="meta">${period}</div>` : ''}
    </div>`;
  }

  let lookups = { services:[], staff:[], payments:[] };
  let stores = [];
  let currentStore = null;
  let customersLite = [];
  let customersLiteMap = new Map();
  let serviceMap = new Map();
  let currentCustomer = null;
  let currentPets = [];
  let searchMode = 'owner';

  let lastQuery = '';
  let lastFilters = {};
  let lastResults = [];
  let lastElapsed = 0;
  let searchToken = 0;

  let invoiceLoaded = false;
  let invoiceLoading = false;
  let lastInvoiceState = null;
  let dailyRange = { preset:'30' };
  let dailyLoading = false;
  let dailyMenuVisible = false;
  let lastDailyReport = null;
  let lastDailyPeriod = null;
  let dailySelectedDate = '';
  let dailyOutsideHandlerBound = false;

  let globalSearchTimer = 0;
  let globalSearchToken = 0;
  let globalSearchOpen = false;
  let lastGlobalSearch = '';
  const globalSearchMap = new WeakMap();
  let opsLoaded = false;
  let opsLoading = false;
  let lastOpsSnapshot = null;
  let opsMsgTimer = 0;
  let syncRunning = false;
  let syncMsgTimer = 0;
  let quickReservationData = [];
  let storeMembers = [];
  let memberSummary = {};
  let membersLoaded = false;
  let merchData = { goods:[], goodsSummary:{}, inventory:{ items:[], summary:{} }, purchases:{ items:[], summary:{} } };
  let merchLoaded = false;
  let merchLoading = false;
  let eventsData = { events:[], summary:{} };
  let eventsLoaded = false;
  let eventsLoading = false;
  let accountingData = null;
  let accountingLoaded = false;
  let accountingLoading = false;
  let directoryCustomerTimer = 0;
  let directoryMemberTimer = 0;
  let eventFilterTimer = 0;
  let quickReservationPromise = null;
  let quickNotesData = [];
  let quickNotesPromise = null;
  let quickSalesReport = null;
  let quickSalesPromise = null;
  let quickSalesStoreId = '';
  let quickSalesMonthKey = '';
  let quickPanelsOutsideBound = false;
  let quickPanelsKeyBound = false;
  let homeShortcutDelegationBound = false;


  const tagState = {
    customer: [],
    pet: []
  };
  const STORE_STORAGE_KEY = 'pfo-current-store';
  // Role presets for simplified UI views. Only control visibility (display:none).
  const ROLE_PRESETS = {
    accounting: {
      tabs: ['billing','ops','home'],
      homePriority: ['billing','open-sales','open-reservations'] ,
      quickTopN: 3
    },
    reception: {
      tabs: ['home','calendar','customer','directory'],
      homePriority: ['customer','calendar','open-search','open-reservations'],
      quickTopN: 4
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  function start(){
    mountUI();
    bootGuard();
    __safeCall(initRolePresetsUI);
    __safeCall(initDisplayMode);
    __safeCall(wireTabs);
    __safeCall(wireRecord);
    __safeCall(wireCustomer);
    __safeCall(wirePetReg);
    __safeCall(wireService);
    __safeCall(wireStaff);
    __safeCall(wirePayments);
    __safeCall(wireStores);
    __safeCall(wireCalendar);
    __safeCall(wireBilling);
    __safeCall(wireNotes);
    __safeCall(wireBoard);
    __safeCall(loadLookups);
    __safeCall(loadStores);
    __safeCall(loadCustomersLite);
    __safeCall(reloadTickets);
    setupHomeTiles();
    setupHomeDashboard();
    setupRoleShortcuts();
    setupHomeBackButtons();
    setupTagControls();
    setupSettings();
    setupPhotoPreviews();
    setupJournal();
    setupGlobalSearch();
    setupHelpPanel();
    setupQuickPanels();
    setupSyncControls();
    setupOps();
    setupDirectory();
    setupMerch();
    setupEvents();
    setupAccountingBreakdownUI();
  }



  function mountUI(){
    ui.navButtons  = Array.from(document.querySelectorAll('.nav-icon'));
    ui.panes = Array.from(document.querySelectorAll('.tab-pane'));
    ui.homeTiles = Array.from(document.querySelectorAll('.home-tile'));
    ui.homeBackButtons = Array.from(document.querySelectorAll('.home-back'));
    ui.storeSwitcher = byId('storeSwitcher'); ui.storeSelect = byId('storeSelect'); ui.storeGroups = byId('storeGroups'); ui.storeMeta = byId('storeMeta');
    ui.settingsShortcuts = document.querySelectorAll('#settingsShortcuts button');
    ui.settingsPanes = Array.from(document.querySelectorAll('.settings-pane'));
    // 記録
    ui.globalSearch = byId('globalSearch');
    ui.globalSearchInput = byId('globalSearchInput');
    ui.globalSearchPanel = byId('globalSearchPanel');
    ui.globalSearchResults = byId('globalSearchResults');
    ui.globalSearchEmpty = byId('globalSearchEmpty');
    ui.globalSearchStatus = byId('globalSearchStatus');
    ui.globalSearchClose = byId('globalSearchClose');
    ui.btnSyncNow = byId('btnSyncNow');
    ui.syncStatus = byId('syncStatus');
    ui.btnHelp = byId('btnHelp');
    ui.helpPanel = byId('helpPanel');
    ui.helpBackdrop = byId('helpBackdrop');
    ui.btnHelpClose = byId('btnHelpClose');
  ui.roleSelector = byId('roleSelector');
  ui.displayModeSelector = byId('displayModeSelector');
  ui.displayModeAnnounce = byId('displayModeAnnounce');
    ui.btnQuickReservations = byId('btnQuickReservations');
    ui.btnQuickNotes = byId('btnQuickNotes');
    ui.todayReservationCount = byId('todayReservationCount');
    ui.reservationStaffSummary = byId('reservationStaffSummary');
    ui.reservationPanel = byId('reservationPanel');
    ui.reservationPanelSummary = byId('reservationPanelSummary');
    ui.reservationTimeline = byId('reservationTimeline');
    ui.reservationTimelineEmpty = byId('reservationTimelineEmpty');
    ui.reservationTimelineWrapper = byId('reservationTimelineWrapper');
    ui.btnCloseReservationPanel = byId('btnCloseReservationPanel');
    ui.staffNotesSummaryCount = byId('staffNotesSummaryCount');
    ui.staffNotesImportantSummary = byId('staffNotesImportantSummary');
    ui.staffNotesPanel = byId('staffNotesPanel');
    ui.staffNotesGeneral = byId('staffNotesGeneral');
    ui.staffNotesByStaff = byId('staffNotesByStaff');
    ui.btnCloseNotesPanel = byId('btnCloseNotesPanel');
    ui.btnQuickSales = byId('btnQuickSales');
    ui.salesPanel = byId('salesPanel');
    ui.btnCloseSalesPanel = byId('btnCloseSalesPanel');
    ui.salesDailyStats = byId('salesDailyStats');
    ui.salesMonthlyStats = byId('salesMonthlyStats');
    ui.salesByStaff = byId('salesByStaff');
    ui.salesByMenu = byId('salesByMenu');
    ui.quickSalesToday = byId('quickSalesToday');
    ui.directoryCustomerFilter = byId('directoryCustomerFilter');
    ui.directoryCustomerList = byId('directoryCustomerList');
    ui.directoryCustomerSummary = byId('directoryCustomerSummary');
    ui.directoryMemberFilter = byId('directoryMemberFilter');
    ui.directoryMemberList = byId('directoryMemberList');
    ui.directoryMemberSummary = byId('directoryMemberSummary');
    ui.btnReloadMerch = byId('btnReloadMerch');
    ui.merchSummaryTotal = byId('merchSummaryTotal');
    ui.merchSummaryActive = byId('merchSummaryActive');
    ui.merchSummaryAverage = byId('merchSummaryAverage');
    ui.merchSummaryCategories = byId('merchSummaryCategories');
    ui.merchGoodsList = byId('merchGoodsList');
    ui.inventoryList = byId('inventoryList');
    ui.inventorySummaryTracked = byId('inventorySummaryTracked');
    ui.inventorySummaryOnHand = byId('inventorySummaryOnHand');
    ui.inventorySummaryAlerts = byId('inventorySummaryAlerts');
    ui.purchaseList = byId('purchaseList');
    ui.purchaseSummaryPending = byId('purchaseSummaryPending');
    ui.purchaseSummaryIncoming = byId('purchaseSummaryIncoming');
    ui.purchaseSummaryNext = byId('purchaseSummaryNext');
    ui.eventsList = byId('eventsList');
    ui.eventsEmpty = byId('eventsEmpty');
    ui.btnReloadEvents = byId('btnReloadEvents');
    ui.eventFilterKeyword = byId('eventFilterKeyword');
    ui.eventFilterStatus = byId('eventFilterStatus');
    ui.eventSummaryUpcoming = byId('eventSummaryUpcoming');
    ui.eventSummaryToday = byId('eventSummaryToday');
    ui.eventSummaryStaff = byId('eventSummaryStaff');
    ui.eventSummaryNext = byId('eventSummaryNext');
    ui.accountingFrom = byId('accountingFrom');
    ui.accountingTo = byId('accountingTo');
    ui.btnAccountingPreset7 = byId('btnAccountingPreset7');
    ui.btnAccountingPreset30 = byId('btnAccountingPreset30');
    ui.btnAccountingReload = byId('btnAccountingReload');
    ui.accountingBreakdownPeriod = byId('accountingBreakdownPeriod');
    ui.accountingTotalAmount = byId('accountingTotalAmount');
    ui.accountingTotalVisits = byId('accountingTotalVisits');
    ui.accountingTotalItems = byId('accountingTotalItems');
    ui.accountingTypeList = byId('accountingTypeList');
    ui.accountingCategoryBody = byId('accountingCategoryBody');
    ui.accountingItemBody = byId('accountingItemBody');
    ui.accountingPaymentBody = byId('accountingPaymentBody');
    ui.accountingEmpty = byId('accountingEmpty');
    ui.homeStatusButtons = Array.from(document.querySelectorAll('.home-status-tile'));
    ui.homeShortcutButtons = Array.from(document.querySelectorAll('.home-shortcut-btn'));
    ui.homeDashboardActions = Array.from(document.querySelectorAll('.home-dashboard-action'));
    ui.homeReservationCount = byId('homeReservationCount');
    ui.homeReservationNext = byId('homeReservationNext');
    ui.homeReservationRange = byId('homeReservationRange');
    ui.homeReservationStaff = byId('homeReservationStaff');
    ui.homeNotesGeneralCount = byId('homeNotesGeneralCount');
    ui.homeNotesImportantCount = byId('homeNotesImportantCount');
    ui.homeNotesHighlight = byId('homeNotesHighlight');
    ui.homeSalesToday = byId('homeSalesToday');
    ui.homeSalesMonth = byId('homeSalesMonth');
    ui.homeSalesHighlight = byId('homeSalesHighlight');
    ui.homeReservationChartBars = byId('homeReservationChartBars');
    ui.homeReservationChartLegend = byId('homeReservationChartLegend');
    ui.homeReservationDetails = byId('homeReservationDetails');
    ui.homeNotesStats = byId('homeNotesStats');
    ui.homeNotesDetails = byId('homeNotesDetails');
    ui.homeSalesChartBars = byId('homeSalesChartBars');
    ui.homeSalesChartLegend = byId('homeSalesChartLegend');
    ui.homeSalesDetails = byId('homeSalesDetails');
    ui.homeOverviewEmpty = byId('homeOverviewEmpty');
    ui.btnOpsRefresh = byId('btnOpsRefresh');
    ui.opsMsg = byId('opsMsg');
    ui.opsReservations = byId('opsReservations');
    ui.opsReservationsEmpty = byId('opsReservationsEmpty');
    ui.opsInvoices = byId('opsInvoices');
    ui.opsInvoicesEmpty = byId('opsInvoicesEmpty');
    ui.opsNotes = byId('opsNotes');
    ui.opsBoard = byId('opsBoard');
    ui.opsCommEmpty = byId('opsCommEmpty');
    ui.opsStats = byId('opsStats');
    ui.modeOwner = byId('modeOwner'); ui.modePet = byId('modePet');
    ui.searchInput = byId('searchInput'); ui.btnSearch = byId('btnSearch');
    ui.resultsToolbar = byId('resultsToolbar'); ui.resCount = byId('resCount'); ui.resTime = byId('resTime'); ui.activeFilters = byId('activeFilters');
    ui.sortSelect = byId('sortSelect'); ui.viewComfort = byId('viewComfort'); ui.viewCompact = byId('viewCompact');
    ui.searchResults = byId('searchResults'); ui.resultDetail = byId('resultDetail');
    ui.recordForm = byId('recordForm'); ui.selectedCustomerName = byId('selectedCustomerName');
    ui.petSelect = byId('petSelect'); ui.serviceSelect = byId('serviceSelect'); ui.qtyInput = byId('qtyInput');
    ui.paymentSelect = byId('paymentSelect'); ui.staffSelect = byId('staffSelect');ui.visitDate = byId('visitDate');ui.prepaidBalance  = byId('prepaidBalance'); ui.usePrepaid = byId('usePrepaid');
    ui.notes = byId('notes'); ui.btnSaveVisit = byId('btnSaveVisit'); ui.btnAddPet = byId('btnAddPet'); ui.visitMsg = byId('visitMsg'); ui.visitList = byId('visitList');
    ui.filterFrom = byId('filterFrom'); ui.filterTo = byId('filterTo'); ui.filterService = byId('filterService'); ui.filterHealth = byId('filterHealth'); ui.filterAllergy = byId('filterAllergy'); ui.filterTag = byId('filterTag'); ui.filterNotes = byId('filterNotes'); ui.btnClearFilters = byId('btnClearFilters');
    // 顧客
    ui.customerForm = byId('customerForm');
    ui.newCustName = byId('newCustName'); ui.newCustPhone = byId('newCustPhone'); ui.newCustEmail = byId('newCustEmail'); ui.newCustAddress = byId('newCustAddress'); ui.newCustGender = byId('newCustGender'); ui.newCustNotes = byId('custNotes'); ui.custMemoDue = byId('custMemoDue'); ui.custMemoPinned = byId('custMemoPinned'); ui.custTagInput = byId('custTagInput'); ui.custTagColor = byId('custTagColor'); ui.custTagList = byId('custTagList'); ui.btnAddCustTag = byId('btnAddCustTag'); ui.btnCreateCustomer = byId('btnCreateCustomer'); ui.custMsg = byId('custMsg'); ui.custLineId = byId('custLineId'); ui.custLineName = byId('custLineName'); ui.custLineOptIn = byId('custLineOptIn'); ui.custProfilePhoto = byId('custProfilePhoto'); ui.custPhotoPreview = byId('custPhotoPreview');
    // ペット
    ui.newPetForm = byId('newPetForm'); ui.petOwnerSelect = byId('petOwnerSelect'); ui.petName = byId('petName'); ui.petNameKana = byId('petNameKana'); ui.petSpecies = byId('petSpecies'); ui.petBreed = byId('petBreed'); ui.petSex = byId('petSex'); ui.petDOB = byId('petDOB'); ui.petWeight = byId('petWeight'); ui.petColor = byId('petColor'); ui.petHospital = byId('petHospital'); ui.petNeuter = byId('petNeuter'); ui.petNeuterDate = byId('petNeuterDate'); ui.petNotes = byId('petNotes'); ui.petMemoDue = byId('petMemoDue'); ui.petMemoPinned = byId('petMemoPinned'); ui.petTagInput = byId('petTagInput'); ui.petTagColor = byId('petTagColor'); ui.petTagList = byId('petTagList'); ui.btnAddPetTag = byId('btnAddPetTag'); ui.btnSavePet = byId('btnSavePet'); ui.petMsg = byId('petMsg'); ui.pethealthHistory = byId('pethealthHistory'); ui.petAllergies = byId('petAllergies'); ui.petFacePhoto = byId('petFacePhoto'); ui.petBodyPhoto = byId('petBodyPhoto'); ui.petProfilePhoto = byId('petProfilePhoto'); ui.petPhotoPreview = byId('petPhotoPreview');
    // 施術
    ui.svcId = byId('svcId'); ui.svcName = byId('svcName'); ui.svcCat = byId('svcCat'); ui.svcDur = byId('svcDur'); ui.svcPrice = byId('svcPrice'); ui.svcTax = byId('svcTax'); ui.svcFrom = byId('svcFrom'); ui.svcTo = byId('svcTo'); ui.svcActive = byId('svcActive'); ui.btnCreateService = byId('btnCreateService'); ui.btnClearSvc = byId('btnClearSvc'); ui.svcMsg = byId('svcMsg');
    // 担当者
    ui.staffForm = byId('staffForm');
    ui.stName = byId('stName'); ui.stRole = byId('stRole'); ui.stPhone = byId('stPhone'); ui.stEmail = byId('stEmail'); ui.stActive = byId('stActive'); ui.btnCreateStaff = byId('btnCreateStaff'); ui.staffMsg = byId('staffMsg'); ui.staffList = byId('staffList');
    // カレンダー
    ui.reservationForm = byId('reservationForm');
    ui.calCustomer = byId('calCustomer'); ui.calPet = byId('calPet'); ui.calService = byId('calService'); ui.calStaff = byId('calStaff'); ui.calDate = byId('calDate'); ui.calStart = byId('calStart'); ui.calEnd = byId('calEnd'); ui.calTitle = byId('calTitle'); ui.calNotes = byId('calNotes'); ui.btnCreateReservation = byId('btnCreateReservation'); ui.calMsg = byId('calMsg'); ui.reservationList = byId('reservationList');
    // 支払い方法
    ui.paymentForm = byId('paymentForm');
    ui.pmCode = byId('pmCode'); ui.pmName = byId('pmName'); ui.pmSort = byId('pmSort'); ui.pmActive = byId('pmActive'); ui.btnCreatePayment = byId('btnCreatePayment'); ui.pmMsg = byId('pmMsg'); ui.paymentList = byId('paymentList');
    // 店舗
    ui.storeId = byId('storeId'); ui.storeName = byId('storeName'); ui.storeType = byId('storeType');
    ui.storeColor = byId('storeColor'); ui.storeDescription = byId('storeDescription');
    ui.storeSort = byId('storeSort'); ui.storeActive = byId('storeActive');
    ui.storeList = byId('storeList'); ui.btnSaveStore = byId('btnSaveStore'); ui.btnResetStore = byId('btnResetStore'); ui.storeMsg = byId('storeMsg');
    ui.journalPetSelect = byId('journalPetSelect'); ui.journalDate = byId('journalDate'); ui.journalStaff = byId('journalStaff'); ui.journalTitle = byId('journalTitle'); ui.journalSummary = byId('journalSummary'); ui.journalPhoto = byId('journalPhoto'); ui.journalTag = byId('journalTag'); ui.btnAddJournal = byId('btnAddJournal'); ui.btnRefreshJournal = byId('btnRefreshJournal'); ui.journalList = byId('journalList'); ui.journalMsg = byId('journalMsg');
    // 請求管理
    ui.invKeyword = byId('invKeyword'); ui.invStatus = byId('invStatus'); ui.invFrom = byId('invFrom'); ui.invTo = byId('invTo');
    ui.invPayment = byId('invPayment'); ui.btnInvoiceSearch = byId('btnInvoiceSearch'); ui.btnInvoicePending = byId('btnInvoicePending');
    ui.invoiceMsg = byId('invoiceMsg'); ui.invoiceSummary = byId('invoiceSummary'); ui.invoiceResults = byId('invoiceResults'); ui.invoiceEmpty = byId('invoiceEmpty');
    ui.invoiceSummaryCount = byId('invoiceSummaryCount'); ui.invoiceSummaryTotal = byId('invoiceSummaryTotal');
    ui.invoiceSummaryPendingCount = byId('invoiceSummaryPendingCount'); ui.invoiceSummaryPendingTotal = byId('invoiceSummaryPendingTotal'); ui.invoiceSummaryPeriod = byId('invoiceSummaryPeriod');
    ui.invMonth = byId('invMonth'); ui.btnDownloadSales = byId('btnDownloadSales');
    ui.dailyReport = byId('dailyReport'); ui.btnDailyRange = byId('btnDailyRange'); ui.btnDailyDownload = byId('btnDailyDownload');
    ui.dailyRangeMenu = byId('dailyRangeMenu'); ui.dailyRangeLabel = byId('dailyRangeLabel'); ui.dailySummaryLine = byId('dailySummaryLine');
    ui.dailyCustomFrom = byId('dailyCustomFrom'); ui.dailyCustomTo = byId('dailyCustomTo'); ui.btnDailyApply = byId('btnDailyApply'); ui.btnDailyCancel = byId('btnDailyCancel');
    ui.dailyChart = document.getElementById('dailySalesChart'); ui.dailyChartEmpty = byId('dailyChartEmpty'); ui.dailyMsg = byId('dailyMsg');
    ui.dailySalesList = byId('dailySalesList'); ui.dailyAccountingBody = byId('dailyAccountingBody'); ui.dailyStrategyBody = byId('dailyStrategyBody'); ui.dailyDetailPanel = byId('dailyDetailPanel'); ui.dailyDetailTitle = byId('dailyDetailTitle'); ui.dailyDetailStats = byId('dailyDetailStats'); ui.dailyDetailBody = byId('dailyDetailBody');
    // 連絡事項
    ui.noteForm = byId('noteForm');
    ui.ntCategory = byId('ntCategory'); ui.ntTitle = byId('ntTitle'); ui.ntAudience = byId('ntAudience'); ui.ntPinned = byId('ntPinned'); ui.ntBody = byId('ntBody'); ui.btnCreateNote = byId('btnCreateNote'); ui.ntMsg = byId('ntMsg'); ui.noteList = byId('noteList');
    // 掲示板
    ui.ticketForm = byId('ticketForm');
    ui.ticketCategory = byId('ticketCategory'); ui.ticketTitle = byId('ticketTitle'); ui.ticketRelated = byId('ticketRelated'); ui.ticketAssignee = byId('ticketAssignee'); ui.ticketImpact = byId('ticketImpact'); ui.ticketDesc = byId('ticketDesc'); ui.btnCreateTicket = byId('btnCreateTicket'); ui.ticketMsg = byId('ticketMsg'); ui.ticketList = byId('ticketList');
    // ホーム（参照だけでOK） — 追加不要ならスキップ可

    // 空き枠チェック
    ui.avlDate = byId('avlDate');ui.avlStaff = byId('avlStaff');ui.avlService = byId('avlService');ui.avlFrom = byId('avlFrom');ui.avlTo = byId('avlTo');ui.avlStep = byId('avlStep');ui.btnCheckAvail = byId('btnCheckAvail');ui.availList = byId('availList');
    // 前日リマインド
    ui.chkReminder = byId('chkReminder');ui.reminderTime = byId('reminderTime');ui.btnSendTomorrowReminders = byId('btnSendTomorrowReminders');
    // 既定値
    if (ui.avlDate) ui.avlDate.valueAsDate = new Date();
    if (ui.visitDate) ui.visitDate.valueAsDate = new Date();
  }

  // Emoji → Feather replacer utility
  // Scans text nodes under a root node and replaces configured emoji with
  // <i data-feather="..."></i> placeholders, then calls feather.replace().
  function runEmojiToFeatherReplacer(root){
    try{
      if (!root) root = document.body;
      const map = {
        '📌': 'map-pin',
        '🔄': 'rotate-cw',
        '🔁': 'rotate-cw',
        '📘': 'book',
        '💹': 'trending-up',
        '❔': 'help-circle',
        '🔍': 'search',
        '🐾': 'heart' // fallback for pet-related marker (Feather has no paw)
      };

      const emojis = Object.keys(map).map(e => e);
      if (!emojis.length) return;

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
      const nodes = [];
      while(walker.nextNode()){
        const n = walker.currentNode;
        if (!n || !n.nodeValue) continue;
        // quick check: contain any configured emoji
        for (let i=0;i<emojis.length;i++){
          if (n.nodeValue.indexOf(emojis[i]) !== -1){ nodes.push(n); break; }
        }
      }

      nodes.forEach(textNode => {
        if (!textNode.parentNode) return;
        let txt = textNode.nodeValue;
        const frag = document.createDocumentFragment();
        // replace all occurrences in a single pass
        const parts = [];
        let cursor = 0;
        while(cursor < txt.length){
          let matchIdx = -1;
          let matchEmoji = null;
          for (const em of emojis){
            const idx = txt.indexOf(em, cursor);
            if (idx !== -1 && (matchIdx === -1 || idx < matchIdx)){
              matchIdx = idx; matchEmoji = em;
            }
          }
          if (matchIdx === -1){ parts.push({text: txt.slice(cursor)}); break; }
          if (matchIdx > cursor) parts.push({text: txt.slice(cursor, matchIdx)});
          parts.push({emoji: matchEmoji});
          cursor = matchIdx + (matchEmoji ? matchEmoji.length : 1);
        }

        parts.forEach(p => {
          if (p.text) frag.appendChild(document.createTextNode(p.text));
          if (p.emoji){
            const iconName = map[p.emoji] || 'circle';
            const iel = document.createElement('i');
            iel.setAttribute('data-feather', iconName);
            iel.className = 'icon';
            // keep a small accessible label
            iel.setAttribute('aria-hidden', 'true');
            frag.appendChild(iel);
          }
        });

        textNode.parentNode.replaceChild(frag, textNode);
      });

      if (typeof feather !== 'undefined' && feather && typeof feather.replace === 'function'){
        try{ feather.replace(); }catch(e){ console.debug('feather.replace failed', e); }
      }

    }catch(e){ console.error('emoji replacer error', e); }
  }

  // Native OS emoji support - no custom replacement needed
  window.__runEmojiToFeatherReplacer = function(){ /* disabled for native emoji */ };

  // Initialize role preset UI and handlers
  function initRolePresetsUI(){
    if (!ui.roleSelector) return;
    const saved = localStorage.getItem('pfo-role') || 'default';
    try{ ui.roleSelector.value = saved; }catch(e){}
    applyRolePreset(saved);
    ui.roleSelector.addEventListener('change', ()=>{
      const v = ui.roleSelector.value || 'default';
      localStorage.setItem('pfo-role', v);
      applyRolePreset(v);
    });
  }

  function applyRolePreset(roleKey){
    // clear previous hiding
    document.querySelectorAll('.hidden-by-role').forEach(el=> el.classList.remove('hidden-by-role'));
    if (!roleKey || roleKey === 'default') return;
    const preset = ROLE_PRESETS[roleKey];
    if (!preset) return;
    const allowedTabs = new Set(preset.tabs || []);
    // nav buttons
    (ui.navButtons||[]).forEach(btn=>{
      const tab = btn.dataset.tab;
      if (!tab) return;
      if (!allowedTabs.has(tab)) btn.classList.add('hidden-by-role');
    });
    // home tiles / shortcuts / status tiles
    const pri = preset.homePriority || [];
    const priSet = new Set(pri.map(String));
    document.querySelectorAll('.home-tile, .home-status-tile, .home-shortcut-btn').forEach(el=>{
      const keys = [el.dataset.action, el.dataset.tab, el.dataset.pane, el.dataset.mode, el.id].filter(Boolean).map(String);
      const text = (el.textContent||'').trim();
      const matched = keys.some(k=> priSet.has(k)) || pri.some(p => p && text.indexOf(p) !== -1);
      if (!matched) el.classList.add('hidden-by-role');
    });
  }

  // ===== Display mode (auto / mobile / desktop) =====
  async function initDisplayMode(){
    // UI element exists
    if (!ui.displayModeSelector) return;
    // set selector to current dataset value or localStorage
    const current = document.documentElement.getAttribute('data-display-mode') || localStorage.getItem('displayMode') || 'auto';
    try{ ui.displayModeSelector.value = current; }catch(e){}
    // apply immediately
    applyDisplayMode(current, {announce:false});

    // attempt to fetch server-side saved value (one roundtrip)
    try{
      const res = await fetch('/me/settings', { method:'GET', credentials:'same-origin' });
      if (res.ok){
        const json = await res.json();
        if (json && json.displayMode && json.displayMode !== current){
          applyDisplayMode(json.displayMode);
          try{ ui.displayModeSelector.value = json.displayMode; }catch(e){}
        }
      }
    }catch(_){ /* server unavailable -> localStorage used */ }

    ui.displayModeSelector.addEventListener('change', async ()=>{
      const v = ui.displayModeSelector.value || 'auto';
      applyDisplayMode(v);
      // first try to persist to server (single roundtrip), fallback to localStorage
      try{
        const put = await fetch('/me/settings', { method:'PUT', credentials:'same-origin', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ displayMode: v }) });
        if (!put.ok) throw new Error('put-failed');
        // success -> also update localStorage for CSR fallback
        localStorage.setItem('displayMode', v);
      }catch(err){
        // fallback
        try{ localStorage.setItem('displayMode', v); }catch(_){ }
      }
    });
  }

  function applyDisplayMode(mode, opts){
    opts = opts || {};
    const key = mode === 'auto' ? 'auto' : (mode === 'mobile' ? 'mobile' : (mode === 'desktop' ? 'desktop' : 'auto'));
    document.documentElement.setAttribute('data-display-mode', key);
    // announce
    if (ui.displayModeAnnounce && !opts.announce === false){
      try{ ui.displayModeAnnounce.textContent = '表示モード: ' + (key === 'auto' ? '自動' : (key === 'mobile' ? 'モバイル' : 'デスクトップ')); }catch(e){}
    } else if (ui.displayModeAnnounce){
      try{ ui.displayModeAnnounce.textContent = '表示モード: ' + (key === 'auto' ? '自動' : (key === 'mobile' ? 'モバイル' : 'デスクトップ')); }catch(e){}
    }
  }

  // Global loading overlay helpers
  let __globalLoadingKey = null;
  function showLoading(key, text, opts={}){
    try{
      __globalLoadingKey = key || String(Math.random()).slice(2);
      const node = document.getElementById('globalLoading');
      const txt = document.getElementById('globalLoadingText');
      const cancel = document.getElementById('globalLoadingCancel');
      if (txt) txt.textContent = text || '読み込み中…';
      if (node){ node.hidden = false; node.setAttribute('aria-hidden','false'); }
      if (cancel){
        if (opts && opts.cancelable){ cancel.hidden = false; cancel.onclick = ()=>{
          // mark cancelled by clearing key so callers can check
          __globalLoadingKey = null;
          cancel.hidden = true;
          if (node){ node.hidden = true; node.setAttribute('aria-hidden','true'); }
        }; }
        else { cancel.hidden = true; cancel.onclick = null; }
      }
    }catch(e){ console.error('showLoading', e); }
  }
  function hideLoading(key){
    try{
      // if key provided only hide when matches, otherwise always hide
      if (key && __globalLoadingKey && key !== __globalLoadingKey) return;
      __globalLoadingKey = null;
      const node = document.getElementById('globalLoading');
      const cancel = document.getElementById('globalLoadingCancel');
      if (node){ node.hidden = true; node.setAttribute('aria-hidden','true'); }
      if (cancel){ cancel.hidden = true; cancel.onclick = null; }
    }catch(e){ console.error('hideLoading', e); }
  }


  function runShortcut(node){
    if (!node) return;
    const mode = node.dataset.mode || '';
    const target = node.dataset.tab || '';
    const pane = node.dataset.pane || '';
    const action = node.dataset.action || node.dataset.roleAction || '';
    const focus = node.dataset.focus || '';
    if (mode === 'pet' && isHumanStore()){ setMode('owner'); }
    else if (mode === 'owner' || mode === 'pet'){ setMode(mode); }
    if (action === 'sync-now'){ refreshFromSheets(); return; }
    if (action === 'open-reservations'){ openReservationPanel().catch(()=>{}); return; }
    if (action === 'open-notes'){ openNotesPanel().catch(()=>{}); return; }
    if (action === 'open-sales'){ openSalesPanel().catch(()=>{}); return; }
    if (action === 'open-search'){ openGlobalSearch(true); return; }
    if (target){
      if (target === 'pet' && isHumanStore()){
        selectTab('customer');
      }else{
        selectTab(target);
        if (target === 'settings' && pane) showSettingsPane(pane);
        if (target === 'pet' && pane === 'journal') focusJournal();
      }
      if (target === 'record'){ onSearch(); if (ui.searchInput) ui.searchInput.focus(); }
      if (focus){ window.setTimeout(()=> focusOpsSection(focus), 150); }
      return;
    }
    if (focus){ focusOpsSection(focus); }
  }

  function setupHomeTiles(){
    if (!Array.isArray(ui.homeTiles)) return;
    ui.homeTiles.forEach(tile => {
      if (tile.dataset.bound) return;
      tile.addEventListener('click', ev=>{
        if (ev) {
          ev.preventDefault?.();
          ev.stopPropagation?.();
        }
        runShortcut(tile);
      });
      tile.dataset.bound = '1';
    });
  }

  function setupHomeDashboard(){
    const nodes = [
      ...(ui.homeStatusButtons || []),
      ...(ui.homeShortcutButtons || []),
      ...(ui.homeDashboardActions || [])
    ];
    nodes.forEach(node => {
      if (!node || node.dataset.bound) return;
      node.addEventListener('click', ev=>{
        if (ev) {
          ev.preventDefault?.();
          ev.stopPropagation?.();
        }
        runShortcut(node);
      });
      node.dataset.bound = '1';
    });
    if (!homeShortcutDelegationBound){
      document.addEventListener('click', handleHomeShortcutClick);
      homeShortcutDelegationBound = true;
    }
  }
  function setupRoleShortcuts(){
    const tabButtons = Array.from(document.querySelectorAll('.role-tabs button'));
    const rolePanels = Array.from(document.querySelectorAll('.role-panel'));
    if (tabButtons.length){
      tabButtons.forEach(btn => {
        if (btn.dataset.bound) return;
        btn.addEventListener('click', ()=>{
          const role = btn.dataset.role || '';
          tabButtons.forEach(b => {
            const active = b === btn;
            b.classList.toggle('active', active);
            b.setAttribute('aria-selected', active ? 'true' : 'false');
          });
          rolePanels.forEach(panel => {
            const active = panel.dataset.role === role;
            panel.classList.toggle('active', active);
            panel.setAttribute('aria-hidden', active ? 'false' : 'true');
          });
        });
        btn.dataset.bound = '1';
      });
      rolePanels.forEach(panel => {
        if (!panel.dataset.roleHiddenBound){
          const active = panel.classList.contains('active');
          panel.setAttribute('aria-hidden', active ? 'false' : 'true');
          panel.dataset.roleHiddenBound = '1';
        }
      });
    }

    const roleLinks = Array.from(document.querySelectorAll('.role-link'));
    roleLinks.forEach(link => {
      if (!link.dataset.homeShortcut) link.dataset.homeShortcut = '1';
      if (link.dataset.roleTab && !link.dataset.tab) link.dataset.tab = link.dataset.roleTab;
      if (link.dataset.rolePane && !link.dataset.pane) link.dataset.pane = link.dataset.rolePane;
      if (link.dataset.roleMode && !link.dataset.mode) link.dataset.mode = link.dataset.roleMode;
      if (link.dataset.roleAction && !link.dataset.action){
        const action = link.dataset.roleAction;
        if (action === 'search') link.dataset.action = 'open-search';
        else if (action === 'notes') link.dataset.action = 'open-notes';
        else link.dataset.action = action;
      }
      if (link.dataset.bound) return;
      link.addEventListener('click', ev => {
        if (ev){
          ev.preventDefault?.();
          ev.stopPropagation?.();
        }
        runShortcut(link);
      });
      link.dataset.bound = '1';
    });
  }


  function handleHomeShortcutClick(ev){
    const node = ev.target?.closest?.('[data-home-shortcut]');
    if (!node) return;
    if (node.disabled) return;
    runShortcut(node);
  }

  function setupHomeBackButtons(){
    if (!Array.isArray(ui.homeBackButtons)) return;
    ui.homeBackButtons.forEach(btn => {
      if (btn.dataset.bound) return;
      btn.addEventListener('click', ()=>{
        const target = btn.dataset.tab || 'home';
        selectTab(target);
        if (target === 'home'){
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
      btn.dataset.bound = '1';
    });
  }

  function setupTagControls(){
    resetTags('customer');
    resetTags('pet');
    ui.btnAddCustTag?.addEventListener('click', ()=> addTag('customer'));
    ui.btnAddPetTag?.addEventListener('click', ()=> addTag('pet'));
    ui.custTagInput?.addEventListener('keydown', e=>{ if (e.key==='Enter'){ e.preventDefault(); addTag('customer'); } });
    ui.petTagInput?.addEventListener('keydown', e=>{ if (e.key==='Enter'){ e.preventDefault(); addTag('pet'); } });
  }

  function setupSettings(){
    const buttons = Array.from(ui.settingsShortcuts||[]);
    buttons.forEach(btn=>{
      if (btn.dataset.bound) return;
      btn.addEventListener('click', ()=> showSettingsPane(btn.dataset.pane));
      btn.dataset.bound = '1';
    });
    showSettingsPane('store');
  }

  function showSettingsPane(pane){
    const target = pane || 'store';
    Array.from(ui.settingsShortcuts||[]).forEach(btn=>{
      btn.classList.toggle('active', btn.dataset.pane === target);
    });
    (ui.settingsPanes||[]).forEach(box=>{
      box.classList.toggle('active', box.dataset.pane === target);
    });
    if (target === 'store'){ loadStores({ keepSelection:true, silent:true }); }
    if (target === 'staff'){ listStaff(); }
    if (target === 'payments'){ listPayments(); }
  }

  function setupPhotoPreviews(){
    ui.custProfilePhoto?.addEventListener('input', refreshCustomerPhotoPreview);
    ['input','change'].forEach(evt=>{
      ui.petFacePhoto?.addEventListener(evt, refreshPetPhotoPreview);
      ui.petBodyPhoto?.addEventListener(evt, refreshPetPhotoPreview);
      ui.petProfilePhoto?.addEventListener(evt, refreshPetPhotoPreview);
    });
    refreshCustomerPhotoPreview();
    refreshPetPhotoPreview();
  }

  function renderPreview(container, items){
    if (!container) return;
    container.innerHTML = '';
    const valid = (items||[]).map(it=>({ url:(it.url||'').trim(), label:it.label||'' })).filter(it=> it.url);
    if (!valid.length){
      container.innerHTML = '<span class="muted-text">プレビューなし</span>';
      return;
    }
    valid.forEach(it=>{
      const fig = document.createElement('figure');
      fig.className = 'preview-item';
      const img = document.createElement('img');
      img.src = it.url;
      img.alt = it.label || 'プレビュー画像';
      fig.appendChild(img);
      if (it.label){
        const cap = document.createElement('figcaption');
        cap.textContent = it.label;
        fig.appendChild(cap);
      }
      container.appendChild(fig);
    });
  }

  function refreshCustomerPhotoPreview(){
    renderPreview(ui.custPhotoPreview, [{ url: ui.custProfilePhoto?.value || '', label: 'プロフィール' }]);
  }

  function refreshPetPhotoPreview(){
    renderPreview(ui.petPhotoPreview, [
      { url: ui.petFacePhoto?.value || '', label: '顔' },
      { url: ui.petBodyPhoto?.value || '', label: '全身' },
      { url: ui.petProfilePhoto?.value || '', label: 'お気に入り' }
    ]);
  }

  function setupJournal(){
    if (ui.journalPetSelect && !ui.journalPetSelect.dataset.bound){
      ui.journalPetSelect.addEventListener('change', ()=> refreshJournal(ui.journalPetSelect.value));
      ui.journalPetSelect.dataset.bound = '1';
    }
    ui.btnAddJournal?.addEventListener('click', addJournalEntry);
    ui.btnRefreshJournal?.addEventListener('click', ()=> refreshJournal(ui.journalPetSelect?.value || ''));
    loadJournalPets();
  }

  function focusJournal(){
    const card = document.querySelector('.pet-journal-card');
    if (card){ card.scrollIntoView({ behavior:'smooth', block:'start' }); }
    if (ui.journalPetSelect && !ui.journalPetSelect.value){ ui.journalPetSelect.focus(); }
  }

  async function loadJournalPets(){
    if (!ui.journalPetSelect) return;
    if (isHumanStore()){ fillSelect(ui.journalPetSelect, [{value:'',label:'ビューティーケア（人）では不要です'}]); return; }
    try{
      showLoading('journalPets','記録用のご愛犬を読み込み中…', { cancelable: true });
      const storeId = getCurrentStoreId();
      const pets = await callServer('searchPets', '', storeId ? { storeId } : {}) || [];
      const options = pets.map(p=>({
        value: p.PetID || p.PetId || '',
        label: `${p.PetName || p.Name || '(無名)'}${p.OwnerName ? ` / ${p.OwnerName}` : ''}`
      })).filter(opt=> opt.value);
      fillSelect(ui.journalPetSelect, [{value:'',label:'ご愛犬を選択'}, ...options]);
      hideLoading('journalPets');
    }catch(e){
      console.error(e);
      fillSelect(ui.journalPetSelect, [{value:'',label:'取得できません'}]);
      hideLoading('journalPets');
    }
  }

  async function refreshJournal(petId){
    if (!ui.journalList) return;
     if (!petId){ ui.journalList.innerHTML = '<span class="muted-text">ご愛犬を選択すると記録が表示されます</span>'; return; }
    ui.journalList.innerHTML = '<div class="loading-box"><span class="spinner"></span><span>読み込み中…</span></div>';
    try{
      const list = await callServer('listPetJournal', petId) || [];
      if (!list.length){
        ui.journalList.innerHTML = '<span class="muted-text">登録された記録はありません</span>';
        return;
      }
      ui.journalList.innerHTML = list.map(entry=> renderJournalEntry(entry)).join('');
      ui.journalList.querySelectorAll('button[data-entry]')?.forEach(btn=>{
        btn.addEventListener('click', ()=> deleteJournalEntry(btn.dataset.entry, petId));
      });
    }catch(e){
      console.error(e);
      ui.journalList.innerHTML = '<span class="muted-text">記録の取得に失敗しました</span>';
    }
  }

  function renderJournalEntry(entry){
    const date = entry.PerformedAt || '';
    const tags = Array.isArray(entry.Tags) ? entry.Tags : [];
    const tagChips = tags.map(t=> `<span class="badge">${escapeHtml(t.label||'')}</span>`).join('');
    const photo = entry.PhotoURL ? `<div class="journal-photo"><img src="${escapeHtml(entry.PhotoURL)}" alt="記録写真"></div>` : '';
    return `<article class="journal-entry">\n      <header>\n        <div class="left">\n          <div class="title">${escapeHtml(entry.Title||'記録')}</div>\n          <div class="meta">${escapeHtml(date||'-')} ${escapeHtml(entry.Staff||'')}</div>\n        </div>\n        <div class="right">\n          <button type="button" class="btn-ghost" data-entry="${escapeHtml(entry.EntryID||'')}">削除</button>\n        </div>\n      </header>\n      <div class="body">${photo}<p>${escapeHtml(entry.Summary||'')}</p></div>\n      ${tagChips?`<div class="tags">${tagChips}</div>`:''}\n    </article>`;
  }

  async function addJournalEntry(){
    if (!ui.journalPetSelect || !ui.btnAddJournal) return;
    const petId = ui.journalPetSelect.value;
    if (!petId){ msg(ui.journalMsg,'err','ご愛犬を選択してください'); return; }
    const payload = {
      PetID: petId,
      PerformedAt: ui.journalDate?.value || '',
      Staff: (ui.journalStaff?.value || '').trim(),
      Title: (ui.journalTitle?.value || '').trim(),
      Summary: (ui.journalSummary?.value || '').trim(),
      PhotoURL: (ui.journalPhoto?.value || '').trim(),
      Tags: buildJournalTags(ui.journalTag?.value || '')
    };
    if (!payload.Title && !payload.Summary){ msg(ui.journalMsg,'err','タイトルかメモを入力してください'); return; }
    try{
      toggleBtn(ui.btnAddJournal,true);
      msg(ui.journalMsg,'','保存中…');
      await callServer('savePetJournalEntry', payload);
      msg(ui.journalMsg,'ok','記録を保存しました');
      ['journalTitle','journalSummary','journalPhoto','journalTag'].forEach(id=> __safeSet(byId(id),'value',''));
      refreshJournal(petId);
    }catch(e){
      console.error(e);
      msg(ui.journalMsg,'err','保存に失敗しました: '+(e?.message||e));
    }finally{
      toggleBtn(ui.btnAddJournal,false);
    }
  }

  function buildJournalTags(text){
    const raw = String(text||'').split(/[,\s]+/).map(s=> s.trim()).filter(Boolean);
    if (!raw.length) return '[]';
    const payload = raw.map(label=>({ label }));
    try{ return JSON.stringify(payload); }catch(_){ return '[]'; }
  }

  async function deleteJournalEntry(entryId, petId){
    if (!entryId) return;
    try{
      await callServer('deletePetJournalEntry', entryId);
      refreshJournal(petId);
    }catch(e){
      console.error(e);
      msg(ui.journalMsg,'err','削除に失敗しました: '+(e?.message||e));
    }
  }

  function wireStores(){
    if (ui.storeSelect && !ui.storeSelect.dataset.bound){
      ui.storeSelect.addEventListener('change', ()=>{
        const id = ui.storeSelect.value;
        if (id) setCurrentStore(id);
      });
      ui.storeSelect.dataset.bound = '1';
    }
    if (ui.storeGroups && !ui.storeGroups.dataset.bound){
      ui.storeGroups.addEventListener('click', e=>{
        const btn = e.target.closest('button[data-store-id]');
        if (!btn) return;
        const id = btn.dataset.storeId;
        if (id) setCurrentStore(id);
      });
      ui.storeGroups.dataset.bound = '1';
    }
    ui.btnSaveStore?.addEventListener('click', saveStore);
    ui.btnResetStore?.addEventListener('click', ()=> clearStoreForm());
    if (ui.storeList && !ui.storeList.dataset.bound){
      ui.storeList.addEventListener('click', e=>{
        const btn = e.target.closest('button[data-action][data-id]');
        if (!btn) return;
        const id = btn.dataset.id;
        if (!id) return;
        if (btn.dataset.action === 'select'){ setCurrentStore(id, { allowInactive: btn.dataset.allowInactive === 'true' }); }
        else if (btn.dataset.action === 'edit'){ fillStoreForm(findStore(id)); selectTab('settings'); showSettingsPane('store'); }
      });
      ui.storeList.dataset.bound = '1';
    }
  }

  function findStore(id){
    return stores.find(s=> String(s.StoreID||s.storeId||'') === String(id));
  }

  async function loadStores(options={}){
    let list = [];
    try{
      const res = await callServer('listStores');
      if (Array.isArray(res)) list = res;
    }catch(e){
      console.error(e);
    }
    stores = ensureCoreStores(list.map(normalizeStore).filter(Boolean));
    stores.sort((a,b)=> (Number(a.Sort||0)-Number(b.Sort||0)) || String(a.Name||'').localeCompare(String(b.Name||''),'ja'));
    renderStoreList();
    renderStoreGroups();
    populateStoreSelect({ keepSelection: options.keepSelection !== false });
    const storedId = loadStoredStoreId();
    if (!currentStore){
      const preferred = storedId && stores.some(s=> s.StoreID === storedId)
        ? storedId
        : (stores.find(s=> s.Active !== false)?.StoreID || stores[0]?.StoreID);
      if (preferred) setCurrentStore(preferred, { silent:true });
    }else{
      setCurrentStore(currentStore.StoreID, { silent:true });
    }
    applyStoreMode();
  }

  function normalizeStore(raw){
    if (!raw) return null;
    const type = String(raw.Type || raw.StoreType || raw.type || 'PET').toUpperCase() === 'HUMAN' ? 'HUMAN' : 'PET';
    const id = String(raw.StoreID || raw.Id || raw.ID || raw.storeId || '').trim();
    return {
      StoreID: id || `STORE-${Date.now()}`,
      Name: String(raw.Name || raw.StoreName || '未設定').trim() || '未設定',
      Type: type,
      Color: raw.Color || raw.ThemeColor || '#6ecad1',
      Description: raw.Description || raw.Memo || '',
      Sort: Number(raw.Sort ?? raw.DisplayOrder ?? 0),
      Active: raw.Active === undefined ? true : !!raw.Active
    };
  }

  function ensureCoreStores(list){
    if (!Array.isArray(list)) list = [];
    const seen = new Set(list.map(s=> String(s.StoreID||'').trim()));
    CORE_STORE_PRESET.forEach(def=>{
      const id = String(def.StoreID||'').trim();
      if (!id || seen.has(id)) return;
      list.push(normalizeStore(def));
      seen.add(id);
    });
    return list;
  }

  function getSelectableStores(){
    return stores.filter(store=> store.Active !== false);
  }
  function renderStoreList(){
    if (!ui.storeList) return;
    if (!stores.length){
      ui.storeList.innerHTML = '<div class="muted-text">店舗がまだ登録されていません。</div>';
      return;
    }
    ui.storeList.innerHTML = stores.map(store=>{
      const active = currentStore && store.StoreID === currentStore.StoreID ? ' active' : '';
      const typeLabel = store.Type === 'HUMAN' ? 'ビューティーケア（人）' : 'ドッグケア（犬）';
      const statusLabel = store.Active === false ? '非表示' : '利用中';
      const titleStyle = store.Color ? ` style="border-left:6px solid ${escapeHtml(store.Color)}; padding-left:10px;"` : '';
      const desc = store.Description ? escapeHtml(store.Description) : 'メモは未登録です。';
      const allowInactiveAttr = store.Active === false ? ' data-allow-inactive="true"' : '';
      return `<div class="store-card${active}" data-id="${escapeHtml(store.StoreID)}">
        <div class="title"${titleStyle}>${escapeHtml(store.Name||'未設定')}</div>
        <div class="meta"><span class="badge">${escapeHtml(typeLabel)}</span><span class="badge">${escapeHtml(statusLabel)}</span><span class="badge">順番: ${store.Sort||0}</span></div>
        <div class="meta">${desc}</div>
        <div class="actions">
          <button type="button" class="btn-primary" data-action="select" data-id="${escapeHtml(store.StoreID)}"${allowInactiveAttr}>この店舗を表示</button>
          <button type="button" class="btn-ghost" data-action="edit" data-id="${escapeHtml(store.StoreID)}">編集</button>
        </div>
      </div>`;
    }).join('');
  }

  function renderStoreGroups(){
    if (!ui.storeGroups) return;
    // Store groups hidden for unified brand display
    // Internal store management still functions for data filtering
    ui.storeGroups.innerHTML = '';
    return;
    
    // Original functionality preserved below for reference
    // const selectableStores = getSelectableStores();
    if (!stores.length){
      ui.storeGroups.innerHTML = '<div class="muted-text">店舗がまだ登録されていません。</div>';
      return;
    }
    if (!selectableStores.length){
      ui.storeGroups.innerHTML = '<div class="muted-text">表示できる店舗がありません。設定で店舗を有効化してください。</div>';
      return;
    }
    const groups = new Map();
    selectableStores.forEach(store=>{
      const type = store.Type === 'HUMAN' ? 'HUMAN' : 'PET';
      const bucket = groups.get(type) || [];
      bucket.push(store);
      groups.set(type, bucket);
    });
      const order = [
        { type:'PET', label:'ドッグケア（犬）', icon:'🐾' },
        { type:'HUMAN', label:'ビューティーケア（人）', icon:'💆' }
      ];
    const html = order.map(group=>{
      const list = groups.get(group.type) || [];
      if (!list.length) return '';
      const pills = list.map(store=>{
        const active = currentStore && store.StoreID === currentStore.StoreID;
        const classes = 'store-pill' + (active ? ' active' : '');
        const aria = active ? 'true' : 'false';
        const icon = group.icon;
        return `<button type="button" class="${classes}" data-store-id="${escapeHtml(store.StoreID)}" aria-pressed="${aria}"><span class="icon">${icon}</span><span>${escapeHtml(store.Name||store.StoreID)}</span></button>`;
      }).join('');
      return `<div class="store-group" data-type="${group.type}"><div class="group-label">${group.label}</div><div class="group-pills">${pills}</div></div>`;
    }).filter(Boolean).join('');
    ui.storeGroups.innerHTML = html || '<div class="muted-text">表示できる店舗がありません。設定で店舗を有効化してください。</div>';
  }

  function populateStoreSelect(options={}){
    if (!ui.storeSelect) return;
    
    // Store switching restricted to admin users only
    const currentUserRole = getCurrentUserRole(); // To be implemented
    const isAdmin = currentUserRole === 'admin' || currentUserRole === 'manager';
    if (!isAdmin) {
      // Hide store selection for non-admin users
      ui.storeSelect.style.display = 'none';
      return;
    }
    
    const selectableStores = getSelectableStores();
    const prev = options.keepSelection ? (currentStore?.StoreID || ui.storeSelect.value) : (currentStore?.StoreID || '');
    if (!selectableStores.length){
      ui.storeSelect.innerHTML = '<option value="">表示できる店舗がありません</option>';
      ui.storeSelect.value = '';
      return;
    }
    ui.storeSelect.innerHTML = selectableStores.map(store=> `<option value="${escapeHtml(store.StoreID)}">${escapeHtml(store.Name||store.StoreID)}</option>`).join('');
    if (prev && selectableStores.some(store=> store.StoreID === prev)){
      ui.storeSelect.value = prev;
    }else if (currentStore && currentStore.Active === false){
      ui.storeSelect.selectedIndex = -1;
      ui.storeSelect.value = '';
    }else{
      ui.storeSelect.value = selectableStores[0]?.StoreID || '';
    }
  }

  function fillStoreForm(store){
    const s = store ? {...store} : {StoreID:'', Name:'', Type:'PET', Color:'#6ecad1', Description:'', Sort:0, Active:true};
    if (ui.storeId) ui.storeId.value = s.StoreID || '';
    if (ui.storeName) ui.storeName.value = s.Name || '';
    if (ui.storeType) ui.storeType.value = s.Type || 'PET';
    if (ui.storeColor) ui.storeColor.value = s.Color || '#6ecad1';
    if (ui.storeDescription) ui.storeDescription.value = s.Description || '';
    if (ui.storeSort) ui.storeSort.value = Number.isFinite(Number(s.Sort)) ? Number(s.Sort) : 0;
    if (ui.storeActive) ui.storeActive.value = s.Active === false ? 'false' : 'true';
  }

  function clearStoreForm(){ fillStoreForm(null); }

  function gatherStorePayload(){
    return {
      StoreID: ui.storeId?.value || '',
      Name: (ui.storeName?.value || '').trim(),
      Type: String(ui.storeType?.value || 'PET').toUpperCase() === 'HUMAN' ? 'HUMAN' : 'PET',
      Color: ui.storeColor?.value || '',
      Description: (ui.storeDescription?.value || '').trim(),
      Sort: Number(ui.storeSort?.value || 0),
      Active: ui.storeActive?.value !== 'false'
    };
  }

  async function saveStore(){
    const payload = gatherStorePayload();
    if (!payload.Name){ msg(ui.storeMsg,'err','店舗名を入力してください'); return; }
    try{
      toggleBtn(ui.btnSaveStore,true);
      msg(ui.storeMsg,'','保存中…');
      const saved = await callServer('saveStore', payload);
      msg(ui.storeMsg,'ok','店舗を保存しました');
      clearStoreForm();
      await loadStores({ keepSelection:true });
      const targetId = saved?.StoreID || payload.StoreID;
      if (targetId) setCurrentStore(targetId);
    }catch(e){
      console.error(e);
      msg(ui.storeMsg,'err','店舗の保存に失敗しました: '+(e?.message||e));
    }finally{
      toggleBtn(ui.btnSaveStore,false);
    }
  }

  function setCurrentStore(storeId, options={}){
    const allowInactive = options.allowInactive === true;
    const selectableStores = getSelectableStores();
    let next = null;

    if (storeId){
      const candidate = findStore(storeId);
      if (candidate && (allowInactive || candidate.Active !== false)){
        next = candidate;
      }else if (!allowInactive){
        next = selectableStores.find(store=> store.StoreID === storeId) || null;
      }
    }

    if (!next){
      next = selectableStores[0] || (allowInactive ? findStore(storeId) : null) || stores[0] || null;
    }

    currentStore = next;

    if (ui.storeSelect){
      if (currentStore && selectableStores.some(store=> store.StoreID === currentStore.StoreID)){
        ui.storeSelect.value = currentStore.StoreID;
      }else if (selectableStores.length){
        ui.storeSelect.selectedIndex = -1;
        ui.storeSelect.value = '';
      }else{
        ui.storeSelect.value = '';
      }
    }

    if (!options.silent){
      if (currentStore && currentStore.Active !== false){
        persistStoreId(currentStore.StoreID);
      }else{
        persistStoreId('');
      }
    }

    applyStoreMode();
    loadCustomersLite();
    loadJournalPets();
    if (opsLoaded){ loadOpsSnapshot(true); }
    if (invoiceLoaded){ loadDailySales(undefined, { silent:true, keepList:true }); }
    const recordTab = document.getElementById('tab-record');
    if (recordTab?.classList.contains('active')) onSearch();
    renderReservationQuickSummary();
    renderStaffNotesSummary();
    ensureQuickSales({ force:true, silent:true }).catch(()=>{});
    membersLoaded = false;
    merchLoaded = false;
    eventsLoaded = false;
    accountingLoaded = false;
    renderDirectoryCustomers();
    renderDirectoryMembers();
    if (isTabActive('directory')) ensureDirectoryLoaded();
    if (isTabActive('merch')) ensureMerchLoaded();
    if (isTabActive('events')) ensureEventsLoaded();
    if (isTabActive('billing')) ensureAccountingBreakdown(true);
  }

  function applyStoreMode(){
    const type = currentStoreType();
    document.body.dataset.storeType = type;
    updateStoreMeta();
    if (ui.modePet){ ui.modePet.disabled = type==='HUMAN'; }
    if (type === 'HUMAN' && searchMode === 'pet'){ setMode('owner'); }
    const activePane = document.querySelector('.tab-pane.active');
    if (type === 'HUMAN' && activePane?.id === 'tab-pet'){ selectTab('customer'); }
    renderStoreList();
    renderStoreGroups();
  }

  function updateStoreMeta(){
    if (!ui.storeMeta){ return; }
    if (!currentStore){ ui.storeMeta.textContent = ''; return; }
    const typeLabel = currentStore.Type === 'HUMAN' ? '人サロン' : '犬サロン';
    const status = currentStore.Active === false ? '（非表示）' : '';
    ui.storeMeta.textContent = `${currentStore.Name || ''} / ${typeLabel}${status}`.trim();
  }

  function loadStoredStoreId(){
    try{ return localStorage.getItem(STORE_STORAGE_KEY) || ''; }
    catch(_){ return ''; }
  }

  function persistStoreId(id){
    try{
      if (id) localStorage.setItem(STORE_STORAGE_KEY, id);
      else localStorage.removeItem(STORE_STORAGE_KEY);
    }catch(_){ /* ignore */ }
  }

  function currentStoreType(){
    return String(currentStore?.Type || currentStore?.type || 'PET').toUpperCase();
  }

  function getCurrentStoreId(){
    return String(currentStore?.StoreID || currentStore?.storeId || '').trim();
  }

  function isHumanStore(){
    return currentStoreType() === 'HUMAN';
  }

  function belongsToCurrentStore(storeId){
    const currentId = getCurrentStoreId();
    if (!currentId) return true;
    if (!storeId) return true;
    return String(storeId).trim() === currentId;
  }

  function addTag(target){
    const input = target==='customer'? ui.custTagInput : ui.petTagInput;
    const colorInput = target==='customer'? ui.custTagColor : ui.petTagColor;
    if (!input) return;
    const label = (input.value||'').trim();
    if (!label) return;
    const color = normalizeColor(colorInput?.value || '');
    const bucket = tagState[target] || (tagState[target] = []);
    const existing = bucket.findIndex(t => t.label.toLowerCase() === label.toLowerCase());
    const tag = { label, color };
    if (existing >= 0) bucket[existing] = tag;
    else bucket.push(tag);
    renderTagList(target);
    input.value = '';
  }

  function removeTag(target, index){
    const bucket = tagState[target] || [];
    if (index >=0 && index < bucket.length){ bucket.splice(index,1); renderTagList(target); }
  }

  function renderTagList(target){
    const list = target==='customer'? ui.custTagList : ui.petTagList;
    if (!list) return;
    const bucket = tagState[target] || [];
    list.innerHTML = '';
    if (!bucket.length){
      const span = document.createElement('span');
      span.className='muted-text';
      span.textContent='追加されたタグはありません';
      list.appendChild(span);
      return;
    }
    bucket.forEach((tag, idx)=>{
      const chip = document.createElement('span');
      chip.className='tag-chip';
      const sw = document.createElement('span');
      sw.className='swatch';
      sw.style.backgroundColor = tag.color || '#94a3b8';
      chip.appendChild(sw);
      chip.appendChild(document.createTextNode(tag.label));
      const btn = document.createElement('button');
      btn.type='button';
      btn.textContent='×';
      btn.setAttribute('aria-label', `${tag.label} を削除`);
      btn.addEventListener('click', ()=> removeTag(target, idx));
      chip.appendChild(btn);
      list.appendChild(chip);
    });
  }

  function resetTags(target){
    tagState[target] = [];
    const colorInput = target==='customer'? ui.custTagColor : ui.petTagColor;
    if (colorInput) colorInput.value = defaultTagColor(target);
    renderTagList(target);
  }

  function serializeTags(target){
    const bucket = (tagState[target] || []).map(t=>({ label: t.label, color: t.color || '' }));
    if (!bucket.length) return '[]';
    try{ return JSON.stringify(bucket); }catch(_){ return '[]'; }
  }

  function defaultTagColor(target){
    return target==='customer' ? '#f97316' : '#6366f1';
  }

  function normalizeColor(color){
    if (!color) return '';
    const str = String(color).trim();
    if (!str) return '';
    if (/^#[0-9a-f]{3,8}$/i.test(str)) return str.length>7? str.slice(0,7) : str;
    return '';
  }
  function hexToRgba(color, alpha){
    const hex = normalizeColor(color);
    if (!hex) return '';
    const clamp = (val)=> Math.min(1, Math.max(0, val));
    let r=0, g=0, b=0;
    if (hex.length === 4){
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    }else{
      r = parseInt(hex.slice(1,3), 16);
      g = parseInt(hex.slice(3,5), 16);
      b = parseInt(hex.slice(5,7), 16);
    }
    const a = clamp(alpha ?? 1);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  function bootGuard(){
    // Show a local/dev banner only when the hostname indicates a local environment.
    // This avoids showing "local" banner in production when GAS is not available but the site is served from the deploy URL.
    const hostname = (location && location.hostname) ? location.hostname : '';
    const localHosts = ['localhost','127.0.0.1','0.0.0.0','::1'];
    const isLocal = localHosts.includes(hostname);
    if (isLocal){
      const bar = document.createElement('div');
      bar.style.cssText = 'position:fixed;left:0;right:0;top:0;background:#fffbeb;color:#92400e;border-bottom:1px solid #fcd34d;padding:10px 14px;z-index:9999;font-weight:700';
      bar.textContent = 'これはローカル表示です。GAS未接続のためダミー保存で動作中（本番はデプロイURLから開いてください）。';
      document.body.appendChild(bar);
      window.addEventListener('error', e=>{
        const box = document.createElement('div');
        box.style.cssText='position:fixed;bottom:10px;left:10px;max-width:70vw;background:#fee2e2;color:#7f1d1d;border:1px solid #fecaca;padding:8px 10px;z-index:9999;border-radius:8px;font-size:12px';
        box.textContent='JSエラー: '+(e.message||e.error?.message||e.filename);
        document.body.appendChild(box);
      });
    }
  }

  // User role management - to be integrated with authentication system
  function getCurrentUserRole(){
    // TODO: Integrate with actual authentication/role system
    // For now, return 'staff' to restrict store switching
    // Admin users should have 'admin' or 'manager' role
    return localStorage.getItem('userRole') || 'staff';
  }
  
  function setUserRole(role){
    localStorage.setItem('userRole', role);
  }
  
  // Expose for debugging/testing
  window.setUserRole = setUserRole;
  window.getCurrentUserRole = getCurrentUserRole;

  // ====== タブ ======
  function wireTabs(){ (ui.navButtons||[]).forEach(btn => btn.addEventListener('click', () => selectTab(btn.dataset.tab))); }
  function selectTab(name){
    if (name === 'pet' && isHumanStore()) name = 'customer';
    const btn = document.querySelector(`.nav-icon[data-tab="${name}"]`);
    const newPane = byId('tab-' + name);
    const currentPane = document.querySelector('.tab-pane.active');

    // update nav buttons (immediate)
    (ui.navButtons||[]).forEach(b=> b.classList.toggle('active', b === btn));

    // If same pane, just trigger any lazily-loaded data and return
    if (currentPane === newPane){
      if (name==='calendar'){ __safeCall(populateCalendarDropdowns); __safeCall(listReservations); }
      if (name==='directory'){ ensureDirectoryLoaded(); }
      if (name==='merch'){ ensureMerchLoaded(); }
      if (name==='events'){ ensureEventsLoaded(); }
      if (name==='ops'){ loadOpsSnapshot(); }
      if (name==='billing'){ __safeCall(ensureBillingLoaded); ensureAccountingBreakdown(); }
      if (name==='notes'){ __safeCall(listStaffNotes); }
      if (name==='board'){ __safeCall(reloadTickets); }
      if (name==='settings'){ showSettingsPane('store'); }
      return;
    }

    // animation timing (ms) - keep within 200-400ms
    const dur = 340;

    // determine direction from pane ordering (left/right) when possible
    let direction = 'up';
    try{
      if (ui.panes && Array.isArray(ui.panes) && currentPane && newPane){
        const ci = ui.panes.indexOf(currentPane);
        const ni = ui.panes.indexOf(newPane);
        if (ci >= 0 && ni >= 0){ direction = ni < ci ? 'left' : (ni > ci ? 'right' : 'up'); }
      }
    }catch(e){ /* ignore */ }

    // clear any in-progress timers on panes
    try{ if (newPane?.__animTimer){ clearTimeout(newPane.__animTimer); newPane.__animTimer = null; } }catch(e){}
    try{ if (currentPane?.__animTimer){ clearTimeout(currentPane.__animTimer); currentPane.__animTimer = null; } }catch(e){}

    // delegate to the shared animator (adds/removes classes and performs cleanup)
    try{ __animateTabTransition(newPane, currentPane, direction, { duration: dur }); }catch(e){ console.error('[selectTab.animate]', e); }

    // attach simple guard timers so rapid navigation clears previous transitions
    const guard = setTimeout(()=>{ try{ if (newPane) newPane.__animTimer = null; if (currentPane) currentPane.__animTimer = null; }catch(_){ } }, dur + 60);
    if (newPane) newPane.__animTimer = guard; else if (currentPane) currentPane.__animTimer = guard;

    // trigger lazy loaders for the requested pane
    if (name==='calendar'){ __safeCall(populateCalendarDropdowns); __safeCall(listReservations); }
    if (name==='directory'){ ensureDirectoryLoaded(); }
    if (name==='merch'){ ensureMerchLoaded(); }
    if (name==='events'){ ensureEventsLoaded(); }
    if (name==='ops'){ loadOpsSnapshot(); }
    if (name==='billing'){ __safeCall(ensureBillingLoaded); ensureAccountingBreakdown(); }
    if (name==='notes'){ __safeCall(listStaffNotes); }
    if (name==='board'){ __safeCall(reloadTickets); }
    if (name==='settings'){ showSettingsPane('store'); }
  }
  window.selectTab = selectTab;
  
  function isTabActive(name){
    const pane = byId('tab-' + name);
    return !!(pane && pane.classList.contains('active'));
  }

  // ====== ルックアップ読み込み ======
  function loadLookups(){
    return callServer('getLookups').then(res=>{
      lookups = res || {services:[], staff:[], payments:[]};
      if (Array.isArray(res?.stores)){
        stores = res.stores.slice();
        populateStoreSelect({ keepSelection:true });
      }
      
    }).catch(()=>{
      lookups = {
        services:[{ServiceID:'SM-90', Name:'マッサージ90分', Category:'ボディ'}],
        staff:[{Name:'山田'}],
        payments:[{PaymentCode:'CASH', Name:'現金'},{PaymentCode:'CARD', Name:'カード'}]
      };
      if (!stores.length){
        stores = ensureCoreStores([]);
        populateStoreSelect({ keepSelection:true });
      }
      }).finally(()=>{
      applyLookupsToUI();
    });
   }
   function updateLookupMaps(){
    serviceMap = new Map((lookups.services||[]).map(s=> [String(s.ServiceID||''), s]));
  }
 

   function applyLookupsToUI(){
    updateLookupMaps();
    const serviceOptions = (lookups.services||[]).map(s=>({value: s.ServiceID, label: `${s.Name}（${s.ServiceID}）`}));
    const paymentOptions = (lookups.payments||[]).map(p=>({value: p.PaymentCode, label: p.Name}));
    const staffOptions = (lookups.staff||[]).map(s=>({value: s.Name, label: s.Name}));
    fillSelect(ui.serviceSelect, serviceOptions);
    fillSelect(ui.paymentSelect, paymentOptions);
    fillSelect(ui.staffSelect, staffOptions);
    fillSelect(ui.filterService, [{value:'',label:'すべて'}, ...serviceOptions]);
    const cats = Array.from(new Set((lookups.services||[]).map(s=> s.Category).filter(Boolean))).sort();
    fillSelect(ui.svcCat, [{value:'',label:'選択してください'}, ...cats.map(c=>({value:c,label:c}))]);
    fillSelect(ui.calService, [{value:'',label:'選択してください'}, ...(lookups.services||[]).map(s=>({value:s.ServiceID,label:`${s.Name}` }))]);
    fillSelect(ui.calStaff, [{value:'',label:'選択してください'}, ...staffOptions]);
    fillSelect(ui.invPayment, [{value:'',label:'すべて'}, ...(lookups.payments||[]).map(p=>({value:p.PaymentCode, label:p.Name||p.PaymentCode}))]);
    listStaff();
    listPayments();
    fillSelect(ui.avlService, [{value:'',label:'選択してください'}, ...(lookups.services||[]).map(s=>({value:s.ServiceID,label:s.Name}))]);
    fillSelect(ui.avlStaff, [{value:'',label:'選択してください'}, ...staffOptions]);
    renderReservationQuickSummary();
    renderStaffNotesSummary();

  }

  function loadCustomersLite(){
    const storeParam = getCurrentStoreId();
    showLoading('customers', '顧客一覧を読み込み中…', { cancelable: true });
    return callServer('listCustomersLite', storeParam ? { storeId: storeParam } : undefined).then(list=>{
      customersLite = (list||[]).filter(c=> belongsToCurrentStore(c.StoreID || c.storeId));
      customersLiteMap = new Map(customersLite.map(c=> [String(c.CustomerID||''), c]));
      fillSelect(ui.petOwnerSelect, [{value:'',label:'選択してください'}, ...customersLite.map(c=>({value:c.CustomerID,label:`${c.Name||'(無名)'}（${c.CustomerID}）`}))]);
      fillSelect(ui.calCustomer, [{value:'',label:'選択してください'}, ...customersLite.map(c=>({value:c.CustomerID,label:`${c.Name||'(無名)'}（${c.CustomerID}）`}))]);
      renderReservationQuickSummary();
      renderDirectoryCustomers();
      hideLoading('customers');
    }).catch(()=>{
      customersLite = [];
      customersLiteMap = new Map();
      fillSelect(ui.petOwnerSelect, [{value:'',label:'選択してください'}]);
      fillSelect(ui.calCustomer, [{value:'',label:'選択してください'}]);
      renderReservationQuickSummary();
      renderDirectoryCustomers();
      hideLoading('customers');
    });
  }
  function setupGlobalSearch(){
    if (!ui.globalSearchInput || !ui.globalSearchPanel) return;
    ui.globalSearchInput.addEventListener('focus', ()=> openGlobalSearch());
    ui.globalSearchInput.addEventListener('input', onGlobalSearchInput);
    ui.globalSearchInput.addEventListener('keydown', e=>{ if (e.key==='Escape'){ e.preventDefault(); closeGlobalSearch(); } });
    ui.globalSearchClose?.addEventListener('click', ()=> closeGlobalSearch());
    if (ui.globalSearchResults){
      ui.globalSearchResults.addEventListener('click', e=>{
        const btn = e.target.closest('.global-search-item');
        if (!btn) return;
        const payload = globalSearchMap.get(btn);
        if (!payload) return;
        handleGlobalSearchAction(payload);
      });
    }
    document.addEventListener('click', e=>{
      if (!globalSearchOpen) return;
      if (ui.globalSearch?.contains(e.target) || ui.globalSearchPanel?.contains(e.target)) return;
      closeGlobalSearch();
    });
  }

  function openGlobalSearch(force){
    if (!ui.globalSearchPanel) return;
    ui.globalSearchPanel.hidden = false;
    globalSearchOpen = true;
    updateGlobalSearchStatus();
    if (force && ui.globalSearchInput){
      ui.globalSearchInput.focus();
      ui.globalSearchInput.select();
    }
  }

  function closeGlobalSearch(){
    if (!ui.globalSearchPanel) return;
    ui.globalSearchPanel.hidden = true;
    globalSearchOpen = false;
    if (globalSearchTimer){
      clearTimeout(globalSearchTimer);
      globalSearchTimer = 0;
    }
  }

  function updateGlobalSearchStatus(text){
    if (!ui.globalSearchStatus) return;
    if (text){ ui.globalSearchStatus.textContent = text; return; }
    if (!lastGlobalSearch){
      ui.globalSearchStatus.textContent = 'キーワードを入力してください';
    }else{
      ui.globalSearchStatus.textContent = `"${lastGlobalSearch}" の結果`;
    }
  }

  function onGlobalSearchInput(){
    if (!ui.globalSearchInput) return;
    const q = ui.globalSearchInput.value.trim();
    lastGlobalSearch = q;
    openGlobalSearch();
    if (globalSearchTimer){ clearTimeout(globalSearchTimer); }
    if (!q){
      if (ui.globalSearchResults) ui.globalSearchResults.innerHTML = '';
      if (ui.globalSearchEmpty){
        ui.globalSearchEmpty.hidden = false;
        ui.globalSearchEmpty.textContent = 'キーワードを入力すると結果が表示されます。';
      }
      updateGlobalSearchStatus();
      return;
    }
    if (ui.globalSearchEmpty) ui.globalSearchEmpty.hidden = true;
    updateGlobalSearchStatus('検索中…');
    globalSearchTimer = setTimeout(()=> performGlobalSearch(q), 260);
  }

  async function performGlobalSearch(query){
    const token = ++globalSearchToken;
    try{
      const storeId = getCurrentStoreId();
      const payload = storeId ? { storeId } : {};
      const res = await callServer('globalSearch', query, payload);
      if (token !== globalSearchToken) return;
      renderGlobalSearchResults(res || {}, query);
    }catch(e){
      console.error(e);
      if (token !== globalSearchToken) return;
      if (ui.globalSearchResults) ui.globalSearchResults.innerHTML = '';
      if (ui.globalSearchEmpty){
        ui.globalSearchEmpty.hidden = false;
        ui.globalSearchEmpty.textContent = '検索に失敗しました。';
      }
      updateGlobalSearchStatus('エラーが発生しました');
    }
  }

  function renderGlobalSearchResults(data, query){
    lastGlobalSearch = query || '';
    if (!ui.globalSearchResults) return;
    ui.globalSearchResults.innerHTML = '';
    const sections = [
      { key:'customers', title:'お客様' },
      { key:'pets', title:'ご愛犬' },
      { key:'reservations', title:'予約' },
      { key:'invoices', title:'請求' },
      { key:'notes', title:'スタッフ連絡' },
      { key:'tickets', title:'申請/変更' }
    ];
    let any = false;
    sections.forEach(section => {
      const list = Array.isArray(data?.[section.key]) ? data[section.key].filter(Boolean) : [];
      if (!list.length) return;
      any = true;
      const sec = document.createElement('div');
      sec.className = 'global-search-section';
      const title = document.createElement('h4');
      title.textContent = section.title;
      sec.appendChild(title);
      const wrap = document.createElement('div');
      wrap.className = 'global-search-list';
      list.forEach(item => {
        if (!item) return;
        const entry = createGlobalSearchItem(item);
        wrap.appendChild(entry);
      });
      sec.appendChild(wrap);
      ui.globalSearchResults.appendChild(sec);
    });
    if (ui.globalSearchEmpty){
      if (any){
        ui.globalSearchEmpty.hidden = true;
      }else{
        ui.globalSearchEmpty.hidden = false;
        ui.globalSearchEmpty.textContent = query ? '該当する結果がありません。' : 'キーワードを入力すると結果が表示されます。';
      }
    }
    updateGlobalSearchStatus();
  }

  function createGlobalSearchItem(item){
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'global-search-item';
    const main = document.createElement('div');
    main.className = 'primary';
    main.textContent = item.title || item.name || item.label || '(不明)';
    if (item.statusLabel){
      main.appendChild(document.createTextNode(' '));
      const badge = document.createElement('span');
      badge.className = 'ops-badge';
      badge.textContent = item.statusLabel;
      main.appendChild(badge);
    }
    btn.appendChild(main);
    const details = [];
    if (item.subtitle) details.push(item.subtitle);
    if (Array.isArray(item.meta)) item.meta.filter(Boolean).forEach(text => details.push(text));
    if (details.length){
      const meta = document.createElement('div');
      meta.className = 'secondary';
      details.forEach(text => {
        const span = document.createElement('span');
        span.textContent = text;
        meta.appendChild(span);
      });
      btn.appendChild(meta);
    }
    globalSearchMap.set(btn, item);
    return btn;
  }

  function handleGlobalSearchAction(item){
    if (!item) return;
    closeGlobalSearch();
    const type = String(item.type || '').toLowerCase();
    if (type === 'customer'){
      if (ui.searchInput){
        ui.searchInput.value = item.keyword || item.name || item.id || '';
      }
      setMode('owner');
      selectTab('record');
      onSearch();
      return;
    }
    if (type === 'pet'){
      if (!isHumanStore()) setMode('pet'); else setMode('owner');
      if (ui.searchInput){
        ui.searchInput.value = item.keyword || item.name || item.id || '';
      }
      selectTab('record');
      onSearch();
      return;
    }
    if (type === 'reservation'){
      selectTab('calendar');
      if (ui.calDate && item.date) ui.calDate.value = item.date;
      if (ui.calMsg){
        const label = [item.dateLabel || item.date || '', item.time || '', item.customerName || ''].filter(Boolean).join(' ');
        msg(ui.calMsg,'', label ? `${label} の予約を確認してください` : '予約詳細を確認してください');
      }
      return;
    }
    if (type === 'invoice'){
      selectTab('billing');
      if (ui.invKeyword) ui.invKeyword.value = item.orderId || item.id || '';
      runInvoiceSearch();
      return;
    }
    if (type === 'note'){
      selectTab('notes');
      return;
    }
    if (type === 'ticket'){
      selectTab('board');
      return;
    }
    if (item.tab){ selectTab(item.tab); }
  }

  function setupHelpPanel(){
    if (!ui.btnHelp || !ui.helpPanel) return;
    ui.btnHelp.addEventListener('click', ()=> openHelpPanel());
    ui.btnHelpClose?.addEventListener('click', ()=> closeHelpPanel());
    ui.helpBackdrop?.addEventListener('click', ()=> closeHelpPanel());
    document.addEventListener('keydown', e=>{ if (e.key==='Escape' && !ui.helpPanel.hidden){ closeHelpPanel(); } });
  }

  function openHelpPanel(){
    if (!ui.helpPanel) return;
    ui.helpPanel.hidden = false;
    if (ui.helpBackdrop) ui.helpBackdrop.hidden = false;
    if (ui.btnHelpClose){ ui.btnHelpClose.focus(); }
  }

  function closeHelpPanel(){
    if (!ui.helpPanel) return;
    ui.helpPanel.hidden = true;
    if (ui.helpBackdrop) ui.helpBackdrop.hidden = true;
  }
   // ====== ヘッダーのクイックサマリー（予約 / 連絡事項 / 売上） ======
  function setupQuickPanels(){
    renderReservationQuickSummary();
    renderStaffNotesSummary();
    renderQuickSalesSummary();

    if (ui.btnQuickReservations && !ui.btnQuickReservations.dataset.bound){
      ui.btnQuickReservations.addEventListener('click', async ev=>{
        ev.stopPropagation();
        if (ui.reservationPanel?.hidden === false){ closeReservationPanel(); }
        else { await openReservationPanel(); }
      });
      ui.btnQuickReservations.dataset.bound = '1';
    }
    if (ui.btnCloseReservationPanel && !ui.btnCloseReservationPanel.dataset.bound){
      ui.btnCloseReservationPanel.addEventListener('click', ()=> closeReservationPanel());
      ui.btnCloseReservationPanel.dataset.bound = '1';
    }
    if (ui.reservationPanel && !ui.reservationPanel.dataset.stopClick){
      ui.reservationPanel.addEventListener('click', ev=> ev.stopPropagation());
      ui.reservationPanel.dataset.stopClick = '1';
    }

    if (ui.btnQuickNotes && !ui.btnQuickNotes.dataset.bound){
      ui.btnQuickNotes.addEventListener('click', async ev=>{
        ev.stopPropagation();
        if (ui.staffNotesPanel?.hidden === false){ closeNotesPanel(); }
        else { await openNotesPanel(); }
      });
      ui.btnQuickNotes.dataset.bound = '1';
    }
    if (ui.btnCloseNotesPanel && !ui.btnCloseNotesPanel.dataset.bound){
      ui.btnCloseNotesPanel.addEventListener('click', ()=> closeNotesPanel());
      ui.btnCloseNotesPanel.dataset.bound = '1';
    }
    if (ui.staffNotesPanel && !ui.staffNotesPanel.dataset.stopClick){
      ui.staffNotesPanel.addEventListener('click', ev=> ev.stopPropagation());
      ui.staffNotesPanel.dataset.stopClick = '1';
    }

    if (ui.btnQuickSales && !ui.btnQuickSales.dataset.bound){
      ui.btnQuickSales.addEventListener('click', async ev=>{
        ev.stopPropagation();
        if (ui.salesPanel?.hidden === false){ closeSalesPanel(); }
        else { await openSalesPanel(); }
      });
      ui.btnQuickSales.dataset.bound = '1';
    }
    if (ui.btnCloseSalesPanel && !ui.btnCloseSalesPanel.dataset.bound){
      ui.btnCloseSalesPanel.addEventListener('click', ()=> closeSalesPanel());
      ui.btnCloseSalesPanel.dataset.bound = '1';
    }
    if (ui.salesPanel && !ui.salesPanel.dataset.stopClick){
      ui.salesPanel.addEventListener('click', ev=> ev.stopPropagation());
      ui.salesPanel.dataset.stopClick = '1';
    }

    if (!quickPanelsOutsideBound){
      document.addEventListener('click', handleQuickOutsideClick);
      quickPanelsOutsideBound = true;
    }
    if (!quickPanelsKeyBound){
      document.addEventListener('keydown', handleQuickKeydown);
      quickPanelsKeyBound = true;
    }

    ensureQuickReservations({ silent:true }).catch(()=>{});
    ensureQuickNotes({ silent:true }).catch(()=>{});
    window.setTimeout(()=> ensureQuickSales({ silent:true }).catch(()=>{}), 300);
  }

  async function openReservationPanel(options={}){
    try{ await ensureQuickReservations(options); }
    catch(e){
      console.error(e);
      if (ui.reservationPanelSummary) ui.reservationPanelSummary.textContent = '予約の取得に失敗しました。';
    }
    if (!ui.reservationPanel) return;
    ui.reservationPanel.hidden = false;
    ui.btnQuickReservations?.setAttribute('aria-expanded','true');
    renderReservationQuickSummary();
  }

  function closeReservationPanel(){
    if (!ui.reservationPanel) return;
    ui.reservationPanel.hidden = true;
    ui.btnQuickReservations?.setAttribute('aria-expanded','false');
  }

  async function openNotesPanel(options={}){
    try{ await ensureQuickNotes(options); }
    catch(e){
      console.error(e);
      if (ui.staffNotesGeneral) ui.staffNotesGeneral.innerHTML = '<div class="muted-text">連絡事項の取得に失敗しました。</div>';
      if (ui.staffNotesByStaff) ui.staffNotesByStaff.innerHTML = '<div class="muted-text">連絡事項の取得に失敗しました。</div>';
    }
    if (!ui.staffNotesPanel) return;
    ui.staffNotesPanel.hidden = false;
    ui.btnQuickNotes?.setAttribute('aria-expanded','true');
    renderStaffNotesSummary();
    renderStaffNotesPanel();
  }

  function closeNotesPanel(){
    if (!ui.staffNotesPanel) return;
    ui.staffNotesPanel.hidden = true;
    ui.btnQuickNotes?.setAttribute('aria-expanded','false');
  }

  async function openSalesPanel(options={}){
    if (ui.salesDailyStats) ui.salesDailyStats.textContent = '読み込み中です…';
    if (ui.salesMonthlyStats) ui.salesMonthlyStats.textContent = '読み込み中です…';
    if (ui.salesByStaff) ui.salesByStaff.textContent = '読み込み中です…';
    if (ui.salesByMenu) ui.salesByMenu.textContent = '読み込み中です…';
    try{ await ensureQuickSales(options); }
    catch(e){
      console.error(e);
      setQuickSalesError('売上の取得に失敗しました。');
    }
    if (!ui.salesPanel) return;
    ui.salesPanel.hidden = false;
    ui.btnQuickSales?.setAttribute('aria-expanded','true');
    renderQuickSalesSummary();
    renderQuickSalesPanel();
  }

  function closeSalesPanel(){
    if (!ui.salesPanel) return;
    ui.salesPanel.hidden = true;
    ui.btnQuickSales?.setAttribute('aria-expanded','false');
  }

  function handleQuickOutsideClick(ev){
    const target = ev.target;
    if (ui.reservationPanel && !ui.reservationPanel.hidden){
      if (!ui.reservationPanel.contains(target) && !ui.btnQuickReservations?.contains(target)){ closeReservationPanel(); }
    }
    if (ui.staffNotesPanel && !ui.staffNotesPanel.hidden){
      if (!ui.staffNotesPanel.contains(target) && !ui.btnQuickNotes?.contains(target)){ closeNotesPanel(); }
    }
    if (ui.salesPanel && !ui.salesPanel.hidden){
      if (!ui.salesPanel.contains(target) && !ui.btnQuickSales?.contains(target)){ closeSalesPanel(); }
    }
  }

  function handleQuickKeydown(ev){
    if (ev.key !== 'Escape') return;
    let closed = false;
    if (ui.salesPanel && !ui.salesPanel.hidden){ closeSalesPanel(); closed = true; }
    if (ui.staffNotesPanel && !ui.staffNotesPanel.hidden){ closeNotesPanel(); closed = true; }
    if (ui.reservationPanel && !ui.reservationPanel.hidden){ closeReservationPanel(); closed = true; }
    if (closed) ev.stopPropagation();
  }
  function setupSyncControls(){
    if (!ui.btnSyncNow) return;
    ui.btnSyncNow.addEventListener('click', ()=> refreshFromSheets());
  }

  function setSyncButtonState(loading){
    if (!ui.btnSyncNow) return;
    const icon = ui.btnSyncNow.querySelector('.icon');
    const label = ui.btnSyncNow.querySelector('.label');
    if (loading){
      ui.btnSyncNow.classList.add('loading');
      ui.btnSyncNow.disabled = true;
      if (label) label.textContent = '更新中…';
    }else{
      ui.btnSyncNow.classList.remove('loading');
      ui.btnSyncNow.disabled = false;
      if (label) label.textContent = '最新に更新';
    }
    ui.btnSyncNow.setAttribute('aria-busy', loading ? 'true' : 'false');
    if (icon) icon.textContent = '🔄';
  }

  function setSyncStatus(kind, text){
    if (!ui.syncStatus) return;
    if (syncMsgTimer){ clearTimeout(syncMsgTimer); syncMsgTimer = 0; }
    ui.syncStatus.className = 'sync-status' + (kind ? ` ${kind}` : '');
    ui.syncStatus.textContent = text || '';
    if (kind === 'ok'){
      syncMsgTimer = window.setTimeout(()=>{ setSyncStatus('', ''); }, 3200);
    }
  }

  async function refreshFromSheets(){
    if (syncRunning) return;
    syncRunning = true;
    setSyncButtonState(true);
    setSyncStatus('', 'スプレッドシートから更新中…');
    try{
      await loadLookups();
      await loadStores({ keepSelection:true });
      await loadCustomersLite();
      await populateCalendarDropdowns();
      await loadOpsSnapshot(true);
      await reloadTickets();
      if (isTabActive('notes')){
        await listStaffNotes();
      }
      if (isTabActive('calendar')){
        await listReservations();
      }
      invoiceLoaded = false;
      if (isTabActive('billing')){
        await ensureBillingLoaded();
      }
      if (isTabActive('record') && (ui.searchInput?.value || '').trim()){
        onSearch();
      }
      await Promise.all([
       ensureQuickReservations({ force:true, silent:true }).catch(()=>{}),
       ensureQuickNotes({ force:true, silent:true }).catch(()=>{}),
       ensureQuickSales({ force:true, silent:true }).catch(()=>{})
      ]);
      renderReservationQuickSummary();
      renderStaffNotesSummary();
      renderQuickSalesSummary();
      setSyncStatus('ok','最新のデータを読み込みました');
    }catch(e){
      console.error(e);
      setSyncStatus('err','更新に失敗しました: '+(e?.message||e));
    }finally{
      setSyncButtonState(false);
      syncRunning = false;
    }
  }
  function setupOps(){
    ui.btnOpsRefresh?.addEventListener('click', ()=> loadOpsSnapshot(true));
  }
  function setupDirectory(){
    if (ui.directoryCustomerFilter){
      ui.directoryCustomerFilter.addEventListener('input', ()=>{
        if (directoryCustomerTimer){ clearTimeout(directoryCustomerTimer); }
        directoryCustomerTimer = setTimeout(()=>{
          directoryCustomerTimer = 0;
          renderDirectoryCustomers();
        }, 180);
      });
    }
    if (ui.directoryMemberFilter){
      ui.directoryMemberFilter.addEventListener('input', ()=>{
        if (directoryMemberTimer){ clearTimeout(directoryMemberTimer); }
        directoryMemberTimer = setTimeout(()=>{
          directoryMemberTimer = 0;
          renderDirectoryMembers();
        }, 200);
      });
    }
  }

  function setupMerch(){
    ui.btnReloadMerch?.addEventListener('click', ()=> loadMerchDashboard({ force:true }));
  }

  function setupEvents(){
    ui.btnReloadEvents?.addEventListener('click', ()=> loadEventsDashboard({ force:true }));
    const refreshEvents = ()=>{
      if (eventFilterTimer){ clearTimeout(eventFilterTimer); }
      eventFilterTimer = setTimeout(()=>{
        eventFilterTimer = 0;
        renderEventsList();
      }, 160);
    };
    ui.eventFilterKeyword?.addEventListener('input', refreshEvents);
    ui.eventFilterStatus?.addEventListener('change', refreshEvents);
  }

  function setupAccountingBreakdownUI(){
    ui.btnAccountingPreset7?.addEventListener('click', ()=> setAccountingPresetDays(7));
    ui.btnAccountingPreset30?.addEventListener('click', ()=> setAccountingPresetDays(30));
    ui.btnAccountingReload?.addEventListener('click', ()=> ensureAccountingBreakdown(true));
    if (ui.accountingFrom && ui.accountingTo && !ui.accountingFrom.value && !ui.accountingTo.value){
      setAccountingPresetDays(30);
    }
  }

  async function loadOpsSnapshot(force){
    if (opsLoading) return;
    if (opsLoaded && !force){
      if (lastOpsSnapshot) renderOpsSnapshot(lastOpsSnapshot);
      return;
    }
    if (force && lastOpsSnapshot){
      renderOpsSnapshot(lastOpsSnapshot);
    }
    opsLoading = true;
    cancelOpsMsgTimer();
    if (ui.opsMsg){
      const label = force ? '更新中…' : '読み込み中…';
      msg(ui.opsMsg, '', label);
    }
    try{
      const storeId = getCurrentStoreId();
      const payload = storeId ? { storeId } : {};
      const data = await callServer('getOpsSnapshot', payload);
      opsLoaded = true;
      lastOpsSnapshot = data || {};
      renderOpsSnapshot(lastOpsSnapshot);
      if (ui.opsMsg){
        if (force){
          msg(ui.opsMsg, 'ok', '最新の情報に更新しました');
          clearOpsMsgSoon();
        }else{
          msg(ui.opsMsg, '', '');
        }
      }
    }catch(e){
      console.error(e);
      if (ui.opsMsg) msg(ui.opsMsg, 'err', 'ハブ情報の取得に失敗しました: '+(e?.message||e));
    }finally{
      opsLoading = false;
    }
  }

  function cancelOpsMsgTimer(){
    if (opsMsgTimer){
      clearTimeout(opsMsgTimer);
      opsMsgTimer = 0;
    }
  }

  function clearOpsMsgSoon(){
    cancelOpsMsgTimer();
    if (!ui.opsMsg) return;
    opsMsgTimer = setTimeout(()=>{
      msg(ui.opsMsg, '', '');
      opsMsgTimer = 0;
    }, 1800);
  }

  function renderOpsSnapshot(data){
    const reservations = Array.isArray(data?.reservations) ? data.reservations.filter(Boolean) : [];
    const invoices = Array.isArray(data?.invoices) ? data.invoices.filter(Boolean) : [];
    const notes = Array.isArray(data?.notes) ? data.notes.filter(Boolean) : [];
    const tickets = Array.isArray(data?.tickets) ? data.tickets.filter(Boolean) : [];
    renderOpsList(ui.opsReservations, ui.opsReservationsEmpty, reservations);
    renderOpsList(ui.opsInvoices, ui.opsInvoicesEmpty, invoices);
    renderOpsList(ui.opsNotes, null, notes);
    renderOpsList(ui.opsBoard, null, tickets);
    if (ui.opsCommEmpty){
      ui.opsCommEmpty.hidden = (notes.length + tickets.length) > 0;
    }
    if (ui.opsStats){
      const bits = [];
      const todayCount = reservations.filter(r => String(r.status||'').toUpperCase()==='TODAY').length;
      const upcomingCount = reservations.length;
      const pendingInvoices = invoices.filter(inv => String(inv.status||'').toUpperCase()==='PENDING').length;
      const pinnedNotes = notes.filter(n => n.pinned).length;
      if (upcomingCount) bits.push(`予約 ${upcomingCount}件`);
      if (todayCount) bits.push(`本日 ${todayCount}件`);
      if (pendingInvoices) bits.push(`未収 ${pendingInvoices}件`);
      if (pinnedNotes) bits.push(`ピン留め ${pinnedNotes}件`);
      ui.opsStats.textContent = bits.join(' / ');
    }
  }

  function renderOpsList(listEl, emptyEl, items){
    if (!listEl) return;
    listEl.innerHTML = '';
    const arr = Array.isArray(items) ? items.filter(Boolean) : [];
    if (!arr.length){
      if (emptyEl) emptyEl.hidden = false;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;
    arr.forEach(item => {
      const entry = createOpsItem(item);
      listEl.appendChild(entry);
    });
  }

  function createOpsItem(item){
    const box = document.createElement('div');
    box.className = 'ops-item';
    const main = document.createElement('div');
    main.className = 'primary';
    main.textContent = item.title || item.name || item.label || '(不明)';
    if (item.statusLabel){
      main.appendChild(document.createTextNode(' '));
      const badge = document.createElement('span');
      badge.className = 'ops-badge';
      badge.textContent = item.statusLabel;
      main.appendChild(badge);
    }
    box.appendChild(main);
    const details = [];
    if (item.subtitle) details.push(item.subtitle);
    if (Array.isArray(item.meta)) item.meta.filter(Boolean).forEach(text => details.push(text));
    if (details.length){
      const meta = document.createElement('div');
      meta.className = 'meta';
      details.forEach(text => {
        const span = document.createElement('span');
        span.textContent = text;
        meta.appendChild(span);
      });
      box.appendChild(meta);
    }
    return box;
  }

  // ====== 検索/記録 ======
  function wireRecord(){
    ui.btnSearch?.addEventListener('click', onSearch);
    ui.searchInput?.addEventListener('keydown', e=>{ if (e.key==='Enter') onSearch(); });
    ui.modeOwner?.addEventListener('click', ()=> setMode('owner'));
    ui.modePet?.addEventListener('click', ()=> setMode('pet'));
    ui.btnSaveVisit?.addEventListener('click', onSaveVisit);
    ui.btnAddPet?.addEventListener('click', ()=>{ selectTab('pet'); });

    ui.sortSelect?.addEventListener('change', ()=> applySortAndRender());
    ui.viewComfort?.addEventListener('click', ()=> setViewMode('comfort'));
    ui.viewCompact?.addEventListener('click', ()=> setViewMode('compact'));

    ui.btnClearFilters?.addEventListener('click', ()=>{
      ui.searchInput.value='';
      ui.filterFrom.value=''; ui.filterTo.value='';
      if (ui.filterService) ui.filterService.value='';
      ui.filterHealth.value=''; ui.filterAllergy.value='';
      if (ui.filterTag) ui.filterTag.value='';
      ui.filterNotes.value='';
      onSearch();
    });
  }

  // ==== 新規：お客様配線 ====
  function wireCustomer(){
    ui.btnCreateCustomer?.addEventListener('click', async ()=>{
      const name=(ui.newCustName.value||'').trim();
      const phone=(ui.newCustPhone.value||'').trim();
      if (!name || !phone){ msg(ui.custMsg,'err','お名前 と 電話 は必須です'); return; }
      const payload = {
        Name:name, Phone:phone,
        Email:(ui.newCustEmail.value||'').trim(),
        Address:(ui.newCustAddress.value||'').trim(),
        Gender:ui.newCustGender.value||'',
        Notes:(ui.newCustNotes.value||'').trim(),
        MemoDue: ui.custMemoDue?.value || '',
        MemoPinned: ui.custMemoPinned?.value === 'true',
        Tags: serializeTags('customer'),
        LineUserID: (ui.custLineId?.value || '').trim(),
        LineDisplayName: (ui.custLineName?.value || '').trim(),
        LineOptIn: ui.custLineOptIn?.value || '',
        ProfilePhotoURL: (ui.custProfilePhoto?.value || '').trim(),
        StoreID: getCurrentStoreId()
      };
      try{
        toggleBtn(ui.btnCreateCustomer, true);
        msg(ui.custMsg,'','登録中…');
        const res = await callServer('createCustomer', payload);
        const cid = res && (res.CustomerID || res.customerId || res.id);
        msg(ui.custMsg,'ok', cid ? `登録しました（CID:${cid}）` : '登録しました');
        await loadCustomersLite();
        // ★ 登録成功後 自動クリア
        clearContainer(ui.customerForm);
        resetTags('customer');
        if (ui.custMemoPinned) ui.custMemoPinned.value = 'false';
        if (ui.custMemoDue) ui.custMemoDue.value = '';
        refreshCustomerPhotoPreview();
      }catch(e){
        console.error(e); msg(ui.custMsg,'err','登録に失敗しました: '+(e?.message||e));
      }finally{ toggleBtn(ui.btnCreateCustomer, false); }
    });
  }

  // ==== ご愛犬配線 ====
  function wirePetReg(){
    ui.petNeuter?.addEventListener('change', ()=>{
      const on = ui.petNeuter.value==='済み';
      ui.petNeuterDate.disabled = !on;
      if(!on) ui.petNeuterDate.value='';
    });

    ui.btnSavePet?.addEventListener('click', async ()=>{
      const ownerId = ui.petOwnerSelect.value;
      const petName = (ui.petName.value||'').trim();
      const breed = (ui.petBreed.value||'').trim();
      const sex = ui.petSex.value;
      const w = ui.petWeight.value;
      if (!ownerId){ msg(ui.petMsg,'err','お客様を選択してください'); return; }
      if (!petName || !breed || !sex || !w){ msg(ui.petMsg,'err','必須項目（ご愛犬のお名前/犬種/性別/体重）を入力してください'); return; }
      const payload = {
        CustomerID:ownerId, DogName:petName, Name:petName, NameKana:(ui.petNameKana.value||'').trim(),
        Species:(ui.petSpecies.value||'').trim()||'ご愛犬', Breed:breed, Sex:sex,
        DOB:ui.petDOB.value||'', WeightKg:parseFloat(w)||null,
        Color:(ui.petColor.value||'').trim(), Hospital:(ui.petHospital.value||'').trim(),
        NeuterStatus:ui.petNeuter.value||'', NeuterDate:ui.petNeuterDate.value||'',
        Condition:(ui.pethealthHistory.value||'').trim(), Allergies:(ui.petAllergies.value||'').trim(),
        Notes: (ui.petNotes.value||'').trim(),
        MemoDue: ui.petMemoDue?.value || '',
        MemoPinned: ui.petMemoPinned?.value === 'true',
        Tags: serializeTags('pet'),
        FacePhotoURL: (ui.petFacePhoto?.value || '').trim(),
        BodyPhotoURL: (ui.petBodyPhoto?.value || '').trim(),
        ProfilePhotoURL: (ui.petProfilePhoto?.value || '').trim(),
        StoreID: getCurrentStoreId(),
        UsePrepaid: (ui.usePrepaid ? ui.usePrepaid.value!=='false' : true)
      };
      try{
        toggleBtn(ui.btnSavePet,true); msg(ui.petMsg,'','保存中…');
        const res = await callServer('createPet', payload);
        const pid = res && (res.PetID || res.petId || res.id);
        msg(ui.petMsg,'ok', pid ? `ご愛犬を追加しました（PID:${pid}）` : 'ご愛犬を追加しました');
        // 記録タブ選択中ならペット選択肢を更新
        if (currentCustomer?.id === ownerId){ await loadPets(ownerId); }
        // 予約タブ用
        if (ui.calCustomer.value === ownerId){ await populateCalendarDropdowns(); }
        // ★ 登録成功後 自動クリア（お客様選択は保持）
        clearContainer(ui.newPetForm, { keepIds:['petOwnerSelect'] });
        ui.petNeuterDate.disabled = true;
        resetTags('pet');
        if (ui.petMemoPinned) ui.petMemoPinned.value = 'false';
        if (ui.petMemoDue) ui.petMemoDue.value = '';
        refreshPetPhotoPreview();
      }catch(e){
        console.error(e); msg(ui.petMsg,'err','保存に失敗しました: '+(e?.message||e));
      }finally{ toggleBtn(ui.btnSavePet,false); }
    });

    ui.btnClear2?.addEventListener('click', ()=>{
      clearContainer(ui.newPetForm, { keepIds:['petOwnerSelect'] });
      ui.petNeuterDate.disabled = true;
      msg(ui.petMsg,'','');
      refreshPetPhotoPreview();
    });
  }

  // ==== 施術マスタ ====
  function wireService(){
    ui.btnCreateService?.addEventListener('click', async ()=>{
      const id=(ui.svcId.value||'').trim();
      const name=(ui.svcName.value||'').trim();
      if (!id || !name){ msg(ui.svcMsg,'err','施術ID と 施術名 は必須です'); return; }
      const payload = {
        ServiceID:id, Name:name, Category:ui.svcCat.value||'',
        Duration:+(ui.svcDur.value||0), Price:+(ui.svcPrice.value||0),
        Tax: parseFloat(ui.svcTax.value||0) || 0, From:ui.svcFrom.value||'', To:ui.svcTo.value||'', Active: ui.svcActive.value==='true'
      };
      try{
        toggleBtn(ui.btnCreateService,true); msg(ui.svcMsg,'','登録中…');
        await callServer('createService', payload);
        msg(ui.svcMsg,'ok','登録しました');
        await loadLookups();
        // ★ 自動クリア
        ui.btnClearSvc.click();
      }catch(e){
        console.error(e); msg(ui.svcMsg,'err','登録に失敗しました: '+(e?.message||e));
      }finally{ toggleBtn(ui.btnCreateService,false); }
    });

    ui.btnClearSvc?.addEventListener('click', ()=>{
      ['svcId','svcName','svcDur','svcPrice','svcTax','svcFrom','svcTo'].forEach(id=> __safeSet(byId(id),'value',''));
      ui.svcCat.value=''; ui.svcActive.value='true'; msg(ui.svcMsg,'','');
    });
  }

  // ==== 担当者 ====
  function wireStaff(){
    ui.btnCreateStaff?.addEventListener('click', async ()=>{
      const name=(ui.stName.value||'').trim();
      if (!name){ msg(ui.staffMsg,'err','氏名は必須です'); return; }
      const payload={ Name:name, Role:(ui.stRole.value||'').trim(), Phone:(ui.stPhone.value||'').trim(), Email:(ui.stEmail.value||'').trim(), Active: ui.stActive.value==='true' };
      try{
        toggleBtn(ui.btnCreateStaff,true); msg(ui.staffMsg,'','登録中…');
        await callServer('createStaff', payload);
        msg(ui.staffMsg,'ok','登録しました');
        await loadLookups();
        // ★ 自動クリア
        clearContainer(ui.staffForm);
      }catch(e){
        console.error(e); msg(ui.staffMsg,'err','登録に失敗しました: '+(e?.message||e));
      }finally{ toggleBtn(ui.btnCreateStaff,false); }
    });
  }

  function listStaff(){
    const arr = (lookups.staff||[]);
    ui.staffList.innerHTML = arr.length? arr.map(s=>`
      <div class="result-card">
        <div class="head"><div class="title">${escapeHtml(s.Name||'(無名)')}</div></div>
        <div class="meta">
          <div>役割: ${escapeHtml(s.Role||'-')}</div>
          <div>状態: ${(s.Active===false)?'無効':'有効'}</div>
          <div>電話: ${escapeHtml(s.Phone||'-')}</div>
          <div>メール: ${escapeHtml(s.Email||'-')}</div>
        </div>
      </div>
    `).join('') : '登録がありません';
  }

  // ==== 支払い方法 ====
  function wirePayments(){
    ui.btnCreatePayment?.addEventListener('click', async ()=>{
      const code=(ui.pmCode.value||'').trim(), name=(ui.pmName.value||'').trim();
      if (!code || !name){ msg(ui.pmMsg,'err','コード と 名称 は必須です'); return; }
      const payload={ Code:code, Name:name, Sort:+(ui.pmSort.value||0), Active: ui.pmActive.value==='true' };
      try{
        toggleBtn(ui.btnCreatePayment,true); msg(ui.pmMsg,'','登録中…');
        await callServer('createPayment', payload);
        msg(ui.pmMsg,'ok','登録しました');
        await loadLookups();
        // ★ 自動クリア
        clearContainer(ui.paymentForm);
      }catch(e){
        console.error(e); msg(ui.pmMsg,'err','登録に失敗しました: '+(e?.message||e));
      }finally{ toggleBtn(ui.btnCreatePayment,false); }
    });
  }

  function listPayments(){
    const arr = (lookups.payments||[]).slice().sort((a,b)=>(a.Sort||0)-(b.Sort||0));
    ui.paymentList.innerHTML = arr.length? arr.map(p=>`
      <div class="result-card">
        <div class="head"><div class="title">${escapeHtml(p.Name||'')}</div><div class="sub">コード: ${escapeHtml(p.PaymentCode||'')}</div></div>
        <div class="meta">
          <div>表示順: ${p.Sort??0}</div>
          <div>状態: ${(p.Active===false)?'無効':'有効'}</div>
        </div>
      </div>
    `).join('') : '登録がありません';
  }

  // ==== 請求管理 ====
  function wireBilling(){
    if (!ui.btnInvoiceSearch) return;
    ui.btnInvoiceSearch.addEventListener('click', ()=> runInvoiceSearch());
    ui.btnInvoicePending?.addEventListener('click', ()=>{ if (ui.invStatus) ui.invStatus.value='PENDING'; runInvoiceSearch({forceStatus:'PENDING'}); });
    ui.invKeyword?.addEventListener('keydown', e=>{ if (e.key==='Enter') runInvoiceSearch(); });
    ui.invFrom?.addEventListener('keydown', e=>{ if (e.key==='Enter') runInvoiceSearch(); });
    ui.invTo?.addEventListener('keydown', e=>{ if (e.key==='Enter') runInvoiceSearch(); });
    ui.btnDownloadSales?.addEventListener('click', ()=> downloadMonthlySales());
    setupDailyReportControls();
    setInvoiceMonthDefault();
  }

  function ensureBillingLoaded(){
    if (!invoiceLoaded){
      invoiceLoaded = true;
      if (ui.invStatus) ui.invStatus.value = 'PENDING';
      setInvoiceMonthDefault(true);
      runInvoiceSearch({forceStatus:'PENDING'});
      loadDailySales(undefined, { silent:true });
    }else if (lastInvoiceState){
      renderInvoiceSummary(lastInvoiceState.summary, lastInvoiceState.filters);
      renderInvoiceResults(lastInvoiceState.results);
      if ((!lastInvoiceState.results || !lastInvoiceState.results.length) && ui.invoiceEmpty){
        ui.invoiceEmpty.style.display = 'block';
      }
    }
    if (lastDailyReport){ renderDailyReport(lastDailyReport); }
  }

  function setInvoiceMonthDefault(force){
    if (!ui.invMonth) return;
    if (!force && ui.invMonth.value) return;
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    ui.invMonth.value = ym;
  }

  async function runInvoiceSearch(opts={}){
    if (!ui.btnInvoiceSearch || invoiceLoading) return;
    const query = (ui.invKeyword?.value || '').trim();
    let status = (ui.invStatus?.value || '').toUpperCase();
    if (opts.forceStatus){ status = opts.forceStatus; if (ui.invStatus) ui.invStatus.value = opts.forceStatus; }
    const filters = {
      status,
      from: ui.invFrom?.value || '',
      to: ui.invTo?.value || '',
      payment: ui.invPayment?.value || ''
    };
    const storeId = getCurrentStoreId();
    if (storeId) filters.storeId = storeId;

    invoiceLoading = true;
    toggleBtn(ui.btnInvoiceSearch, true);
    toggleBtn(ui.btnInvoicePending, true);
    msg(ui.invoiceMsg, '', '検索中…');
    if (ui.invoiceSummary) ui.invoiceSummary.style.display = 'none';
    if (ui.invoiceEmpty) ui.invoiceEmpty.style.display = 'none';
    if (ui.invoiceResults) ui.invoiceResults.innerHTML = '<div class="loading-box"><span class="spinner"></span>検索中…</div>';

    try{
      const res = await callServer('searchInvoices', query, filters);
      const list = Array.isArray(res?.results) ? res.results : [];
      const summary = res?.summary || (function(){
        const pendingList = list.filter(r=> String(r.Status||'').toUpperCase()==='PENDING');
        return {
          count: list.length,
          total: list.reduce((a,x)=> a + Number(x.Total||0), 0),
          pendingCount: pendingList.length,
          pendingTotal: pendingList.reduce((a,x)=> a + Number(x.Balance||0), 0),
          period: { from: filters.from || '', to: filters.to || '' }
        };
      })();
      renderInvoiceSummary(summary, filters);
      renderInvoiceResults(list);
      if (!list.length && ui.invoiceEmpty){ ui.invoiceEmpty.style.display = 'block'; }
      msg(ui.invoiceMsg, 'ok', `検索が完了しました（${list.length}件）`);
      lastInvoiceState = { query, filters, summary, results: list };
    }catch(e){
      console.error(e);
      msg(ui.invoiceMsg, 'err', '請求の取得に失敗しました: '+(e?.message||e));
      if (ui.invoiceResults) ui.invoiceResults.innerHTML = '';
      if (ui.invoiceSummary) ui.invoiceSummary.style.display = 'none';
      if (ui.invoiceEmpty) ui.invoiceEmpty.style.display = 'block';
    }finally{
      toggleBtn(ui.btnInvoiceSearch, false);
      toggleBtn(ui.btnInvoicePending, false);
      invoiceLoading = false;
    }
  }

  function renderInvoiceSummary(summary, filters){
    if (!ui.invoiceSummary) return;
    if (!summary){ ui.invoiceSummary.style.display = 'none'; return; }
    ui.invoiceSummary.style.display = 'flex';
    if (ui.invoiceSummaryCount) ui.invoiceSummaryCount.textContent = `${summary.count||0} 件`;
    if (ui.invoiceSummaryTotal) ui.invoiceSummaryTotal.textContent = formatYen(summary.total||0);
    if (ui.invoiceSummaryPendingCount) ui.invoiceSummaryPendingCount.textContent = `${summary.pendingCount||0} 件`;
    if (ui.invoiceSummaryPendingTotal) ui.invoiceSummaryPendingTotal.textContent = formatYen(summary.pendingTotal||0);
    const from = summary.period?.from || filters?.from || '';
    const to = summary.period?.to || filters?.to || '';
    const label = (from || to) ? `${from || '指定なし'} 〜 ${to || '指定なし'}` : '-';
    if (ui.invoiceSummaryPeriod) ui.invoiceSummaryPeriod.textContent = label;
  }

  function renderInvoiceResults(list){
    if (!ui.invoiceResults) return;
    if (!list || !list.length){ ui.invoiceResults.innerHTML = ''; return; }
    const rows = list.map(row=>{
      const status = String(row.Status||'').toUpperCase();
      const statusClass = (status==='PENDING') ? 'pending' : 'paid';
      const paymentName = row.PaymentName || row.PaymentMethod || '';
      const paymentMeta = row.PaymentMemo ? `<div class="muted-text">${escapeHtml(row.PaymentMemo)}</div>` : '';
      return `<tr>
        <td>${escapeHtml(row.VisitDate||'')}</td>
        <td>${escapeHtml(row.OrderID||'')}</td>
        <td><div>${escapeHtml(row.CustomerName||'-')}</div><div class="muted-text">CID:${escapeHtml(row.CustomerID||'')}</div></td>
        <td><div>${escapeHtml(row.PetName||'-')}</div><div class="muted-text">PID:${escapeHtml(row.PetID||'')}</div></td>
        <td><div>${escapeHtml(paymentName||'-')}</div>${paymentMeta}</td>
        <td>${formatYen(row.Total)}</td>
        <td>${formatYen(row.Balance)}</td>
        <td><span class="status-pill ${statusClass}">${escapeHtml(row.StatusLabel||row.Status||'')}</span></td>
        <td>${escapeHtml(row.Notes||'')}</td>
      </tr>`;
    }).join('');
    ui.invoiceResults.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>請求日</th><th>請求ID</th><th>顧客</th><th>ご愛犬</th><th>支払い方法</th><th>税込合計</th><th>残高</th><th>状態</th><th>メモ</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  async function downloadMonthlySales(){
    if (!ui.btnDownloadSales) return;
    setInvoiceMonthDefault(true);
    const month = ui.invMonth?.value || '';
    if (!month){ msg(ui.invoiceMsg,'err','対象月を入力してください'); return; }
    try{
      toggleBtn(ui.btnDownloadSales, true);
      msg(ui.invoiceMsg,'','CSVを生成しています…');
      const payload = { month };
      const storeId = getCurrentStoreId();
      if (storeId) payload.storeId = storeId;
      const file = await callServer('downloadMonthlySales', payload);
      if (!file || !file.base64){ throw new Error('データが取得できませんでした'); }
      triggerCsvDownload(file);
      msg(ui.invoiceMsg,'ok',`${file.filename||'sales.csv'} をダウンロードしました`);
    }catch(e){
      console.error(e);
      msg(ui.invoiceMsg,'err','CSVの生成に失敗しました: '+(e?.message||e));
    }finally{
      toggleBtn(ui.btnDownloadSales, false);
    }
  }

  function triggerCsvDownload(file){
    if (!file?.base64) return;
    const mime = file.mimeType || 'text/csv';
    const link = document.createElement('a');
    link.href = `data:${mime};base64,${file.base64}`;
    link.download = file.filename || 'sales.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function setupDailyReportControls(){
    if (!ui.dailyReport) return;
    if (ui.btnDailyRange && !ui.btnDailyRange.dataset.bound){
      ui.btnDailyRange.addEventListener('click', ev=>{ ev.stopPropagation(); toggleDailyRangeMenu(!dailyMenuVisible); });
      ui.btnDailyRange.dataset.bound = '1';
    }
    if (ui.btnDailyDownload && !ui.btnDailyDownload.dataset.bound){
      ui.btnDailyDownload.addEventListener('click', ()=> downloadDailySales());
      ui.btnDailyDownload.dataset.bound = '1';
    }
    if (ui.dailyRangeMenu && !ui.dailyRangeMenu.dataset.bound){
      ui.dailyRangeMenu.addEventListener('click', ev=> ev.stopPropagation());
      ui.dailyRangeMenu.dataset.bound = '1';
    }
    if (ui.dailyRangeMenu){
      ui.dailyRangeMenu.querySelectorAll('button[data-range]').forEach(btn=>{
        if (btn.dataset.bound) return;
        btn.addEventListener('click', ()=>{
          const preset = btn.dataset.range || '30';
          dailyRange = { preset };
          highlightDailyPreset(preset);
          toggleDailyRangeMenu(false);
          loadDailySales({ preset });
        });
        btn.dataset.bound = '1';
      });
    }
    if (ui.btnDailyApply && !ui.btnDailyApply.dataset.bound){
      ui.btnDailyApply.addEventListener('click', ()=> applyDailyCustom());
      ui.btnDailyApply.dataset.bound = '1';
    }
    if (ui.btnDailyCancel && !ui.btnDailyCancel.dataset.bound){
      ui.btnDailyCancel.addEventListener('click', ()=> toggleDailyRangeMenu(false));
      ui.btnDailyCancel.dataset.bound = '1';
    }
    if (ui.dailySalesList && !ui.dailySalesList.dataset.bound){
      ui.dailySalesList.addEventListener('click', e=>{
        const row = e.target.closest('tr[data-date]');
        if (row && row.dataset.date){
          showDailyDetail(row.dataset.date);
        }
      });
      ui.dailySalesList.dataset.bound = '1';
    }
    if (!dailyOutsideHandlerBound){
      document.addEventListener('click', handleDailyOutsideClick);
      dailyOutsideHandlerBound = true;
    }
    highlightDailyPreset(dailyRange?.preset || '');
  }

  function handleDailyOutsideClick(ev){
    if (!dailyMenuVisible) return;
    if (ui.dailyRangeMenu?.contains(ev.target)) return;
    if (ui.btnDailyRange?.contains(ev.target)) return;
    toggleDailyRangeMenu(false);
  }

  function toggleDailyRangeMenu(force){
    if (!ui.dailyRangeMenu) return;
    const show = force === undefined ? !dailyMenuVisible : !!force;
    dailyMenuVisible = show;
    ui.dailyRangeMenu.hidden = !show;
    if (show){
      if (ui.dailyCustomFrom && lastDailyPeriod?.from) ui.dailyCustomFrom.value = lastDailyPeriod.from;
      if (ui.dailyCustomTo && lastDailyPeriod?.to) ui.dailyCustomTo.value = lastDailyPeriod.to;
    }
  }

  function applyDailyCustom(){
    if (!ui.dailyCustomFrom || !ui.dailyCustomTo){ toggleDailyRangeMenu(false); return; }
    const from = ui.dailyCustomFrom.value;
    const to = ui.dailyCustomTo.value;
    if (!from || !to){ msg(ui.dailyMsg,'err','開始日と終了日を入力してください'); return; }
    const normFrom = from < to ? from : to;
    const normTo = from < to ? to : from;
    dailyRange = { from: normFrom, to: normTo };
    highlightDailyPreset('');
    toggleDailyRangeMenu(false);
    loadDailySales({ from: normFrom, to: normTo });
  }

  function buildDailyPayload(){
    if (dailyRange && dailyRange.from && dailyRange.to){
      return { from: dailyRange.from, to: dailyRange.to };
    }
    if (lastDailyPeriod && lastDailyPeriod.from && lastDailyPeriod.to){
      return { from: lastDailyPeriod.from, to: lastDailyPeriod.to };
    }
    const preset = (dailyRange && dailyRange.preset) ? String(dailyRange.preset) : '30';
    return { preset };
  }

  async function loadDailySales(rangeOverride, options={}){
    if (!ui.dailyReport || dailyLoading) return;
    if (rangeOverride){
      dailyRange = Object.assign({}, rangeOverride);
    }
    const payload = Object.assign({}, buildDailyPayload(), rangeOverride || {});
    const storeId = getCurrentStoreId();
    if (storeId) payload.storeId = storeId;
    dailyLoading = true;
    if (!options.silent){ msg(ui.dailyMsg,'','集計中…'); }
    if (ui.dailyChartEmpty) ui.dailyChartEmpty.style.display = 'none';
    if (!options.keepList){
      if (ui.dailyAccountingBody) ui.dailyAccountingBody.innerHTML = '<tr><td colspan="5" class="muted">集計中…</td></tr>';
      if (ui.dailyStrategyBody) ui.dailyStrategyBody.innerHTML = '<tr><td colspan="5" class="muted">集計中…</td></tr>';
    }
    try{
      const report = await callServer('getDailySalesReport', payload);
      lastDailyReport = report || {};
      lastDailyPeriod = report?.period || null;
      highlightDailyPreset(dailyRange?.preset || '');
      renderDailyReport(report);
      if (!options.silent){ msg(ui.dailyMsg,'ok','日別売上を更新しました'); }
      else { msg(ui.dailyMsg,'',''); }
    }catch(e){
      console.error(e);
      msg(ui.dailyMsg,'err','日別売上の取得に失敗しました: '+(e?.message||e));
      if (ui.dailyChartEmpty) ui.dailyChartEmpty.style.display = 'flex';
      if (ui.dailyChart) ui.dailyChart.innerHTML = '';
      if (!options.keepList){
        if (ui.dailyAccountingBody) ui.dailyAccountingBody.innerHTML = '';
        if (ui.dailyStrategyBody) ui.dailyStrategyBody.innerHTML = '';
      }
      lastDailyReport = null;
      lastDailyPeriod = null;
      dailySelectedDate = '';
    }finally{
      dailyLoading = false;
    }
  }

  function renderDailyReport(report){
    if (!ui.dailyReport) return;
    const period = report?.period;
    if (period){
      if (ui.dailyRangeLabel) ui.dailyRangeLabel.textContent = `表示期間: ${formatRangeLabel(period)}`;
    }else if (ui.dailyRangeLabel){
      ui.dailyRangeLabel.textContent = '表示期間: -';
    }
    if (ui.dailySummaryLine){
      const summary = report?.summary;
      if (summary){
        ui.dailySummaryLine.textContent = `合計 ${formatYen(summary.total||0)} / 平均日商 ${formatYen(summary.average||0)} / 来店件数 ${summary.count||0}件 / 顧客数 ${summary.uniqueCustomers||0}人 / 顧客単価 ${formatYen(summary.unitPrice||0)}`;
      }else{
        ui.dailySummaryLine.textContent = '';
      }
    }
    const list = Array.isArray(report?.daily) ? report.daily.slice() : [];
    renderDailyChart(list);
    renderDailyList(list);
    if (list.length){
      const exists = list.find(d=> d.date === dailySelectedDate);
      const target = exists ? dailySelectedDate : list[list.length-1].date;
      showDailyDetail(target, true);
    }else if (ui.dailyDetailPanel){
      ui.dailyDetailPanel.style.display = 'none';
      dailySelectedDate = '';
    }
  }

  function highlightDailyPreset(preset){
    if (!ui.dailyRangeMenu) return;
    ui.dailyRangeMenu.querySelectorAll('button[data-range]').forEach(btn=>{
      btn.classList.toggle('active', !!preset && btn.dataset.range === String(preset));
    });
  }

  function renderDailyChart(list){
    if (!ui.dailyChart) return;
    if (!list.length){
      ui.dailyChart.innerHTML = '';
      if (ui.dailyChartEmpty) ui.dailyChartEmpty.style.display = 'flex';
      return;
    }
    if (ui.dailyChartEmpty) ui.dailyChartEmpty.style.display = 'none';
    const width = 640, height = 240;
    const left = 52, right = 16, top = 20, bottom = 40;
    const maxVal = Math.max(...list.map(d=> Number(d.total||0)), 0) || 1;
    const usableW = width - left - right;
    const usableH = height - top - bottom;
    const points = list.map((row, idx)=>{
      const value = Number(row.total||0);
      const ratio = maxVal ? (value / maxVal) : 0;
      const x = left + (list.length<=1 ? usableW/2 : (idx/(list.length-1))*usableW);
      const y = top + (usableH - (ratio * usableH));
      return { x, y, value, date: row.date };
    });
    let linePath = '';
    let areaPath = '';
    if (points.length){
      linePath = `M${points[0].x},${points[0].y}` + points.slice(1).map(p=> ` L${p.x},${p.y}`).join('');
      areaPath = `M${left},${top+usableH}` + points.map(p=> ` L${p.x},${p.y}`).join('') + ` L${left+usableW},${top+usableH} Z`;
    }
    const gridSteps = 4;
    const grids = [];
    for (let i=0;i<=gridSteps;i++){
      const ratio = i / gridSteps;
      const y = top + (usableH - (ratio * usableH));
      const val = maxVal * ratio;
      grids.push(`<line class="grid" x1="${left}" y1="${y}" x2="${left+usableW}" y2="${y}"></line>`);
      grids.push(`<text class="tick" x="${left-8}" y="${y+4}" text-anchor="end">${formatTickValue(val)}</text>`);
    }
    const axisLabels = [];
    if (points.length){
      const first = points[0];
      const mid = points[Math.floor(points.length/2)];
      const last = points[points.length-1];
      const used = new Map();
      [first, mid, last].forEach((pt, idx)=>{
        if (!pt) return;
        if (used.has(pt.date)) return;
        used.set(pt.date, true);
        axisLabels.push(`<text class="tick" x="${pt.x}" y="${height-12}" text-anchor="middle">${formatAxisLabel(pt.date)}</text>`);
      });
    }
    const circles = points.map(p=> `<circle class="point" cx="${p.x}" cy="${p.y}" r="4"><title>${formatAxisLabel(p.date)}: ${formatYen(p.value)}</title></circle>`);
    ui.dailyChart.innerHTML = `
      <g class="grid-lines">${grids.join('')}</g>
      ${areaPath?`<path class="area" d="${areaPath}"></path>`:''}
      ${linePath?`<path class="line" d="${linePath}"></path>`:''}
      ${circles.join('')}
      ${axisLabels.join('')}
    `;
  }

  function renderDailyList(list){
    if (!ui.dailyAccountingBody || !ui.dailyStrategyBody) return;
    if (!list.length){
      ui.dailyAccountingBody.innerHTML = '<tr><td colspan="5" class="muted">集計期間内の売上がまだありません。</td></tr>';
      ui.dailyStrategyBody.innerHTML = '<tr><td colspan="5" class="muted">集計期間内の売上がまだありません。</td></tr>';
      return;
    }
    const sorted = list.slice().sort((a,b)=> String(b.date).localeCompare(String(a.date)));
    ui.dailyAccountingBody.innerHTML = sorted.map(row=>{
      const active = row.date === dailySelectedDate ? ' class="active"' : '';
      return `<tr data-date="${escapeHtml(row.date)}"${active}><td>${formatDateJP(row.date)}</td><td>${formatYen(row.total||0)}</td><td>${formatYen(row.cash||0)}</td><td>${formatYen(row.ar||0)}</td><td>${formatYen(row.prepaid||0)}</td></tr>`;
    }).join('');
    ui.dailyStrategyBody.innerHTML = sorted.map(row=>{
      const active = row.date === dailySelectedDate ? ' class="active"' : '';
      return `<tr data-date="${escapeHtml(row.date)}"${active}><td>${formatDateJP(row.date)}</td><td>${formatYen(row.total||0)}</td><td>${row.count||0}件</td><td>${row.uniqueCustomers||0}人</td><td>${formatYen(row.unitPrice||0)}</td></tr>`;
    }).join('');
  }

  function showDailyDetail(date, silent){
    if (!date || !lastDailyReport) return;
    dailySelectedDate = date;
    if (ui.dailySalesList){
      ui.dailySalesList.querySelectorAll('tr[data-date]').forEach(row=>{
        row.classList.toggle('active', row.dataset.date === date);
      });
    }
    const dayMeta = (lastDailyReport.daily || []).find(d=> d.date === date);
    const details = (lastDailyReport.details || {})[date] || [];
    if (!dayMeta){
      if (ui.dailyDetailPanel) ui.dailyDetailPanel.style.display = 'none';
      return;
    }
    if (ui.dailyDetailPanel) ui.dailyDetailPanel.style.display = 'flex';
    if (ui.dailyDetailTitle) ui.dailyDetailTitle.textContent = `${formatDateJP(dayMeta.date)}（${weekdayLabel(dayMeta.date)}）`;
    if (ui.dailyDetailStats){
      ui.dailyDetailStats.textContent = `合計 ${formatYen(dayMeta.total||0)} / 来店件数 ${dayMeta.count||0}件 / 顧客数 ${dayMeta.uniqueCustomers||0}人 / 顧客単価 ${formatYen(dayMeta.unitPrice||0)} / 現金 ${formatYen(dayMeta.cash||0)} / 未収 ${formatYen(dayMeta.ar||0)} / 前受金 ${formatYen(dayMeta.prepaid||0)}`;
    }
    if (ui.dailyDetailBody){
      if (details.length){
        ui.dailyDetailBody.innerHTML = details.map(visit=>{
          const items = (visit.items||[]).map(it=> `<li>${escapeHtml(it.serviceName||it.serviceId||'-')} <span>×${escapeHtml(it.quantity||1)} / ${formatYen(it.lineTotal||0)}</span></li>`).join('');
          const metaParts = [
            visit.orderId ? `請求ID: ${escapeHtml(visit.orderId)}` : '',
            visit.paymentName || visit.paymentMethod ? `支払い: ${escapeHtml(visit.paymentName||visit.paymentMethod)}` : '',
            visit.staff ? `担当: ${escapeHtml(visit.staff)}` : '',
            (visit.balance && Number(visit.balance)>0) ? `残高 ${formatYen(visit.balance)}` : ''
          ].filter(Boolean).map(txt=> `<span>${txt}</span>`).join('');
          const notes = visit.notes ? `<div class="visit-notes">${escapeHtml(visit.notes)}</div>` : '';
          const titleName = isHumanStore() ? escapeHtml(visit.customerName||'-') : `${escapeHtml(visit.customerName||'-')} × ${escapeHtml(visit.petName||'-')}`;
          return `<div class="daily-visit-card">
            <div class="visit-head"><div class="visit-title">${titleName}</div><div class="visit-amount">${formatYen(visit.total||0)}</div></div>
            <div class="visit-meta">${metaParts||'<span>詳細情報</span>'}</div>
            ${items?`<ul class="visit-items">${items}</ul>`:''}
            ${notes}
          </div>`;
        }).join('');
      }else{
        ui.dailyDetailBody.innerHTML = '<div class="muted-text">この日の売上詳細はまだ登録されていません。</div>';
      }
    }
    if (!silent){ msg(ui.dailyMsg,'ok', `${formatDateJP(dayMeta.date)}の売上詳細を表示しています`); }
  }

  async function downloadDailySales(){
    if (!ui.btnDailyDownload) return;
    try{
      toggleBtn(ui.btnDailyDownload, true);
      msg(ui.dailyMsg,'','CSVを生成しています…');
      const payload = Object.assign({}, buildDailyPayload());
      const storeId = getCurrentStoreId();
      if (storeId) payload.storeId = storeId;
      const file = await callServer('downloadDailySalesCsv', payload);
      if (!file || !file.base64){ throw new Error('データが取得できませんでした'); }
      triggerCsvDownload(file);
      msg(ui.dailyMsg,'ok', `${file.filename||'daily-sales.csv'} をダウンロードしました`);
    }catch(e){
      console.error(e);
      msg(ui.dailyMsg,'err','CSVの生成に失敗しました: '+(e?.message||e));
    }finally{
      toggleBtn(ui.btnDailyDownload, false);
    }
  }

  function formatRangeLabel(period){
    if (!period) return '-';
    const from = period.from || '-';
    const to = period.to || '-';
    return `${from} 〜 ${to}`;
  }

  function formatAxisLabel(dateStr){
    const d = formatDateJP(dateStr);
    const parts = d.split('(');
    return parts[0] || d;
  }

  function formatTickValue(value){
    if (!value) return '0';
    if (value >= 1000000){ return (value/1000000).toFixed(1).replace(/\.0$/,'') + 'M'; }
    if (value >= 1000){ return (value/1000).toFixed(1).replace(/\.0$/,'') + 'K'; }
    return Math.round(value).toLocaleString('ja-JP');
  }

  // ==== 予約（カレンダー） ====
  function wireCalendar(){
    if (ui.calDate && !ui.calDate.value) ui.calDate.valueAsDate = new Date();
    if (ui.calStart && !ui.calStart.value) ui.calStart.value = '10:00';
    if (ui.calEnd && !ui.calEnd.value) ui.calEnd.value = '11:00';
    if (ui.reminderTime && !ui.reminderTime.value) ui.reminderTime.value = '09:00';

    ui.calCustomer?.addEventListener('change', async ()=>{ await populateCalendarDropdowns(); });

    // 予約作成
    ui.btnCreateReservation?.addEventListener('click', async ()=>{
      const cid = ui.calCustomer.value, pid = ui.calPet.value, svc = ui.calService.value, stf = ui.calStaff.value;
      const date = ui.calDate.value, start=ui.calStart.value, end=ui.calEnd.value;
      if (!cid || !pid || !svc || !stf || !date || !start || !end){ msg(ui.calMsg,'err','必須項目が未入力です'); return; }

    
       // 前日リマインド情報
      const wantRem = (ui.chkReminder?.value!=='false');
      const remTime = ui.reminderTime?.value || '09:00'; // "HH:MM"

      const payload = {
        CustomerID:cid, PetID:pid, ServiceID:svc, Staff:stf,
        Date:date, Start:start, End:end, Title:(ui.calTitle.value||'').trim(),
        Notes:(ui.calNotes.value||'').trim(),
        Reminder: { Enabled: wantRem, Time: remTime }
      };


    try{
        toggleBtn(ui.btnCreateReservation,true); msg(ui.calMsg,'','登録中…');
        await callServer('createReservation', payload);
        msg(ui.calMsg,'ok','予約を登録しました（カレンダー同期はサーバ側で実装）');
        await listReservations();
        // 自動クリア
        clearContainer(ui.reservationForm);
        if (ui.calDate) ui.calDate.valueAsDate = new Date();
        if (ui.calStart) ui.calStart.value = ui.calStart.value || '10:00';
        if (ui.calEnd) ui.calEnd.value = ui.calEnd.value || '11:00';
        if (ui.reminderTime) ui.reminderTime.value = ui.reminderTime.value || '09:00';
        await populateCalendarDropdowns(); // ペット選択肢もリセット
      }catch(e){
        console.error(e); msg(ui.calMsg,'err','登録に失敗しました: '+(e?.message||e));
      }finally{ toggleBtn(ui.btnCreateReservation,false); }
    });

    // 空き枠チェック
    ui.btnCheckAvail?.addEventListener('click', async ()=>{ await runAvailabilityCheck(); });

    // 前日リマインド（テスト実行：明日分）
    ui.btnSendTomorrowReminders?.addEventListener('click', async ()=>{
    try{
      const res = await callServer('sendTomorrowReminders'); // モックは後述で追加
      const n = res?.count ?? (res?.reservations?.length ?? 0);
      msg(ui.calMsg,'ok',`テスト送信: 明日分 ${n} 件`);
    }catch(e){
      console.error(e);
      msg(ui.calMsg,'err','テスト送信に失敗しました: '+(e?.message||e));
    }
  });
}
async function runAvailabilityCheck(){
  const date = ui.avlDate?.value || '';
  const stf  = ui.avlStaff?.value || '';
  const svc  = ui.avlService?.value || '';
  const from = ui.avlFrom?.value || '10:00';
  const to   = ui.avlTo?.value || '19:00';
  const step = parseInt(ui.avlStep?.value || '30', 10);

  if (!date || !stf || !svc){ msg(ui.calMsg,'err','空き枠チェック：日付/担当者/施術を選択してください'); return; }

  const svcObj = (lookups.services||[]).find(s=> s.ServiceID===svc);
  const duration = svcObj?.Duration || 60; // 分
  const all = await callServer('listReservations'); // 予約一覧（モックは全件返すように下で修正）
  const day = (all||[]).filter(r=> r.Date===date && r.Staff===stf);

  // 既存予約（同担当者/同日）の時間帯を分単位で用意
  const existing = day.map(r=> ({ start:r.Start, end:r.End }));

  const slots = computeAvailability(from, to, step, duration, existing);
  renderAvailList(slots, {date, staff:stf, service:svc});
}

function computeAvailability(fromHHMM, toHHMMEnd, stepMin, durationMin, existingSlots){
  const toMin = (hhmm)=>{ const [h,m]=hhmm.split(':').map(Number); return h*60+m; };
  const toHHMM = (min)=> String(Math.floor(min/60)).padStart(2,'0') + ':' + String(min%60).padStart(2,'0');
  const overlap = (a1,a2,b1,b2)=> Math.max(a1,b1) < Math.min(a2,b2);

  const F = toMin(fromHHMM), T = toMin(toHHMMEnd);
  const busy = (existingSlots||[]).map(e=>({ s:toMin(e.start), e:toMin(e.end) }));
  const out = [];
  for(let s=F; s+durationMin<=T; s+=stepMin){
    const e = s + durationMin;
    const conflict = busy.some(b=> overlap(s,e,b.s,b.e));
    if (!conflict) out.push({ start: toHHMM(s), end: toHHMM(e) });
  }
  return out;
}

function renderAvailList(slots, ctx){
  if (!ui.availList){ return; }
  if (!slots.length){
    ui.availList.innerHTML = '空き枠はありません';
    return;
  }
  ui.availList.innerHTML = slots.map(s=>
    `<button type="button" class="tab" data-start="${s.start}" data-end="${s.end}">${s.start}〜${s.end}</button>`
  ).join(' ');

  ui.availList.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      // 候補を予約フォームへ反映
      if (ui.calDate) ui.calDate.value = ctx.date;
      if (ui.calStart) ui.calStart.value = btn.dataset.start;
      if (ui.calEnd) ui.calEnd.value = btn.dataset.end;
      if (ui.calStaff) ui.calStaff.value = ctx.staff;
      if (ui.calService) ui.calService.value = ctx.service;
      msg(ui.calMsg,'ok','空き枠を予約フォームに反映しました');
      // 予約タブは既に開いている想定。ホームから来た場合にも対応するなら selectTab('calendar') を呼ぶ。
    });
  });
}


  async function populateCalendarDropdowns(){
    if (!ui.calCustomer || !ui.calPet){ return; }
    const cid = ui.calCustomer.value;
    if (!cid){ fillSelect(ui.calPet,[{value:'',label:'選択してください'}]); return; }
    try{
      const pets = await callServer('getPetsByCustomer', cid) || [];
      fillSelect(ui.calPet, [{value:'',label:'選択してください'}, ...pets.map(p=>({value:p.PetID,label:`${p.Name}（${p.Breed||''}）`}))]);
    }catch(e){
      console.error(e);
      fillSelect(ui.calPet, [{value:'',label:'取得できませんでした'}]);
    }
  }

  async function listReservations(){
    try{
      const list = await callServer('listReservations');
      applyQuickReservationData(list);
      ui.reservationList.innerHTML = (list && list.length)? list.map(r=>{
        const svcName = (lookups.services||[]).find(s=>s.ServiceID===r.ServiceID)?.Name || r.ServiceID || '';
        return `<div class="result-card">
          <div class="head"><div class="title">${escapeHtml(r.Title||'(無題)')}</div></div>
          <div class="meta">
            <div>${escapeHtml(r.Date||'')} ${escapeHtml(r.Start||'')}〜${escapeHtml(r.End||'')}</div>
            <div>施術: ${escapeHtml(svcName)}</div>
            <div>担当: ${escapeHtml(r.Staff||'')}</div>
            <div>PID: ${escapeHtml(r.PetID||'')}</div>
          </div>
        </div>`;
      }).join('') : '予約はありません';
    }catch(e){
      console.error(e);
      ui.reservationList.textContent = '予約一覧の取得に失敗しました';
    }
  }

  // ==== 連絡事項 ====
  function wireNotes(){
    ui.btnCreateNote?.addEventListener('click', async ()=>{
      const title=(ui.ntTitle.value||'').trim();
      if (!title){ msg(ui.ntMsg,'err','タイトルは必須です'); return; }
      const payload={ Category:(ui.ntCategory.value||'').trim(), Title:title, Audience:(ui.ntAudience.value||'').trim(), Pinned: ui.ntPinned.value==='true', Body:(ui.ntBody.value||'').trim() };
      try{
        toggleBtn(ui.btnCreateNote,true); msg(ui.ntMsg,'','登録中…');
        await callServer('createStaffNote', payload);
        msg(ui.ntMsg,'ok','登録しました');
        await listStaffNotes();
        // ★ 自動クリア
        clearContainer(ui.noteForm);
      }catch(e){
        console.error(e); msg(ui.ntMsg,'err','登録に失敗しました: '+(e?.message||e));
      }finally{ toggleBtn(ui.btnCreateNote,false); }
    });
  }

  async function listStaffNotes(){
    try{
      const list = await callServer('listStaffNotes');
      applyQuickNotesData(list);
      ui.noteList.innerHTML = (list && list.length)? list.map(n=>`
        <div class="result-card">
          <div class="head"><div class="title">${n.Pinned?'📌 ':''}${escapeHtml(n.Title||'(無題)')}</div><div class="sub">${escapeHtml(n.Category||'')}</div></div>
          <div class="meta"><div>対象: ${escapeHtml(n.Audience||'-')}</div><div>${escapeHtml(n.CreatedAt||'')}</div></div>
          <div style="margin-top:6px">${escapeHtml(n.Body||'')}</div>
        </div>
      `).join('') : '連絡はありません';
    }catch(e){
      console.error(e);
      ui.noteList.textContent = '連絡事項の取得に失敗しました';
    }
  }

  // ==== 申請/変更（掲示板） ====
  function wireBoard(){
    ui.btnCreateTicket?.addEventListener('click', async ()=>{
      const title=(ui.ticketTitle.value||'').trim();
      if (!title){ msg(ui.ticketMsg,'err','タイトルは必須です'); return; }
      const payload = {
        Category: ui.ticketCategory.value||'',
        Title: title,
        Related: (ui.ticketRelated.value||'').trim(),
        Assignee:(ui.ticketAssignee.value||'').trim(),
        Impact:(ui.ticketImpact.value||'').trim(),
        Desc:(ui.ticketDesc.value||'').trim()
      };
      try{
        toggleBtn(ui.btnCreateTicket,true); msg(ui.ticketMsg,'','申請中…');
        await callServer('createTicket', payload);
        msg(ui.ticketMsg,'ok','申請しました');
        await reloadTickets();
        // ★ 自動クリア
        clearContainer(ui.ticketForm);
      }catch(e){
        console.error(e); msg(ui.ticketMsg,'err','申請に失敗しました: '+(e?.message||e));
      }finally{ toggleBtn(ui.btnCreateTicket,false); }
    });
  }

  async function reloadTickets(){
    try{
      const list = await callServer('listTickets');
      ui.ticketList.innerHTML = (list && list.length)? list.map(t=>`
        <div class="result-card">
          <div class="head"><div class="title">[${escapeHtml(t.Category||'')}] ${escapeHtml(t.Title||'')}</div></div>
          <div class="meta">
            <div>関連ID: ${escapeHtml(t.Related || t.RelatedID || '-')}</div>
            <div>担当: ${escapeHtml(t.Assignee||'-')}</div>
            <div>作成: ${escapeHtml(t.CreatedAt||t.Datetime||'')}</div>
            <div></div>
          </div>
          <div style="margin-top:6px"><b>影響範囲:</b> ${escapeHtml(t.Impact||'-')}</div>
          <div style="margin-top:6px"><b>内容:</b> ${escapeHtml(t.Desc || t.Description || '-')}</div>
        </div>
      `).join('') : '申請はありません';
    }catch(e){
      console.error(e);
      ui.ticketList.textContent = '申請一覧の取得に失敗しました';
    }
  }

  function setMode(m){
    if (m === 'pet' && isHumanStore()) m = 'owner';
    searchMode = m;
    ui.modeOwner?.classList.toggle('active', m==='owner');
    ui.modePet?.classList.toggle('active', m==='pet');
    ui.modeOwner?.setAttribute('aria-selected', m==='owner');
    ui.modePet?.setAttribute('aria-selected', m==='pet');
    ui.searchResults.innerHTML='';
    ui.resultDetail.style.display='none';
    ui.resultsToolbar.style.display='none';
  }

  function gatherFilters(){
    return {
      from: ui.filterFrom?.value || '',
      to: ui.filterTo?.value || '',
      service: ui.filterService?.value || '',
      health: ui.filterHealth?.value || '',
      allergy: ui.filterAllergy?.value || '',
      tag: (ui.filterTag?.value || '').trim(),
      notes: (ui.filterNotes?.value || '').trim()
    };
  }

  function onSearch(){
    const raw = (ui.searchInput.value || '').trim();
    const q = raw.replace(/\s+/g,' ').trim();
    const f = gatherFilters();
    const storeId = getCurrentStoreId();
    if (storeId) f.storeId = storeId;
    lastQuery = raw; lastFilters = f; lastResults = []; lastElapsed = 0;
    ui.searchResults.classList.remove('result-compact');
    ui.searchResults.innerHTML = `<div class="loading-box"><span class="spinner"></span>検索中…</div>`;
    ui.resultsToolbar.style.display='none';

    const token = ++searchToken;
    const t0 = performance.now();

    const onDone = (list)=>{
      if (token !== searchToken) return;
      lastElapsed = Math.max(0, Math.round(performance.now()-t0));
      let shown = [];
      if (searchMode==='owner') { shown = renderOwnerResults(list||[], f, q); }
      else { shown = renderPetResults(list||[], f, q); }
      lastResults = Array.isArray(shown) ? shown : [];
      setupToolbar(shown);
      // ★ 検索成功後：キーワードだけクリア（結果は維持）
      clearSearchInputs();
    };
    const onErr = (err)=>{
      if (token !== searchToken) return;
      ui.searchResults.textContent = 'エラー: '+(err && err.message ? err.message : err);
    };

    if (searchMode==='owner'){
      callServer('searchOwners', q, f).then(onDone).catch(onErr);
    } else {
      callServer('searchPets', q, f).then(onDone).catch(onErr);
    }
  }

  function setupToolbar(arr){
    const count = Array.isArray(arr) ? arr.length : (Array.isArray(lastResults) ? lastResults.length : 0);
    ui.resultsToolbar.style.display='flex';
    ui.resCount.textContent = `${count} 件`;
    ui.resTime.textContent = '';

    const pills = [];
    if (lastQuery) pills.push(pill('キーワード', lastQuery));
    if (lastFilters.from) pills.push(pill('開始', lastFilters.from));
    if (lastFilters.to) pills.push(pill('終了', lastFilters.to));
    if (lastFilters.service) pills.push(pill('施術', labelOf(ui.filterService)));
    if (lastFilters.health) pills.push(pill('既往歴', lastFilters.health));
    if (lastFilters.allergy) pills.push(pill('アレルギー', lastFilters.allergy));
    if (lastFilters.tag) pills.push(pill('タグ', lastFilters.tag));
    if (lastFilters.notes) pills.push(pill('メモ', lastFilters.notes));
    ui.activeFilters.innerHTML = pills.length ? pills.map(x=>x.outerHTML).join(' ') : '';

    function pill(label, value){
      const s = document.createElement('span');
      s.className='pill'; s.innerHTML = `${label}: <span class="hit-kw">${escapeHtml(value)}</span>`; return s;
    }
  }

  function applyClientFilter(row, f){
    const notes = (row.Notes || row.Memo || '').toLowerCase();
    if (f.notes && !notes.includes(f.notes.toLowerCase())) return false;
    if (f.tag){
      const tags = normalizeTags(row.Tags);
      const kw = f.tag.toLowerCase();
      if (!tags.some(t => (t.label||'').toLowerCase().includes(kw))) return false;
    }
    return true;
  }

  function highlight(text, kw){
    if (!kw) return escapeHtml(text||'');
    const esc = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return escapeHtml(String(text||'')).replace(new RegExp(esc, 'gi'), m=>`<span class="mark">${m}</span>`);
  }

  function normalizeTags(value){
    if (!value) return [];
    if (Array.isArray(value)) return value.map(formatTag).filter(Boolean);
    if (typeof value === 'string'){
      const text = value.trim();
      if (!text) return [];
      try{
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) return parsed.map(formatTag).filter(Boolean);
      }catch(_){
        const parts = text.split(/[,\n]/).map(s=>s.trim()).filter(Boolean);
        return parts.map(formatTag).filter(Boolean);
      }
    }
    return [];
  }

  function formatTag(tag){
    if (!tag) return null;
    if (typeof tag === 'string'){
      const trimmed = tag.trim();
      if (!trimmed) return null;
      const [labelPart, colorPart] = trimmed.split('|');
      const label = (labelPart||'').trim();
      if (!label) return null;
      let color = (colorPart||'').trim();
      if (color && !color.startsWith('#')) color = '#' + color.replace(/[^0-9a-f]/ig,'').slice(0,6);
      color = normalizeColor(color);
      return { label, color };
    }
    const label = String(tag.label || tag.name || tag.Label || '').trim();
    if (!label) return null;
    let color = '';
    if (tag.color != null) color = String(tag.color).trim();
    else if (tag.Color != null) color = String(tag.Color).trim();
    if (color && !color.startsWith('#')) color = '#' + color.replace(/[^0-9a-f]/ig,'').slice(0,6);
    color = normalizeColor(color);
    return { label, color };
  }

  function makeTagChip(tag){
    const chip = el('span',{class:'tag-chip'},[]);
    const sw = el('span',{class:'swatch', style:`background-color:${tag.color || '#94a3b8'}`},[]);
    chip.appendChild(sw);
    chip.appendChild(document.createTextNode(tag.label));
    return chip;
  }

  function formatDueDate(d){
    if (!d) return '';
    const text = String(d).trim();
    if (!text) return '';
    const date = new Date(text);
    if (!isNaN(date)) return toDate(date);
    return text;
  }

  function isPinned(val){
    if (val === true) return true;
    if (typeof val === 'string'){
      const s = val.trim().toLowerCase();
      return s === 'true' || s === '1';
    }
    if (typeof val === 'number') return val !== 0;
    return false;
  }

  function buildMemoLine(content, due, pinned, title){
    const memoTitle = title || '共有メモ';
    const bodyText = (content && String(content).trim()) ? String(content) : 'メモは登録されていません';
    const wrap = el('div',{class:`memo-line${pinned?' pinned':''}`},[]);
    const head = el('div',{class:'memo-head'},[]);
    head.appendChild(el('span',{},[memoTitle]));
    const right = el('div',{},[]);
    const dueLabel = formatDueDate(due);
    if (dueLabel) right.appendChild(el('span',{class:'due'},[`期限: ${dueLabel}`]));
    if (pinned) right.appendChild(el('span',{class:'memo-pin'},['📌 ピン留め']));
    head.appendChild(right);
    wrap.appendChild(head);
    wrap.appendChild(el('div',{class:'memo-body'},[document.createTextNode(bodyText)]));
    return wrap;
  }

  function renderOwnerResults(list, f, q){
    const box = ui.searchResults; box.innerHTML='';
    box.classList.remove('result-compact');
    if (!list.length){ box.textContent='該当なし'; ui.resultsToolbar.style.display='flex'; ui.resCount.textContent='0 件'; return []; }
    const storeFiltered = list.filter(c=> belongsToCurrentStore(c.StoreID || c.storeId));
    const filtered=storeFiltered.filter(c=> applyClientFilter(c,f));
    if (!filtered.length){ box.textContent='該当なし（条件を緩めてください）'; ui.resultsToolbar.style.display='flex'; ui.resCount.textContent='0 件'; return []; }
    lastResults = filtered.slice();
    function draw(arr){
      box.innerHTML = '';
      arr.forEach(c=>{
        const card = el('div',{class:'result-card card-entrance', tabindex:'0'});
        const titleHtml = `${highlight(c.Name||'(名前なし)', q)} <span class="idpill">CID:${c.CustomerID||''}</span>`;
        const head = el('div',{class:'head'});
        head.appendChild(el('div',{},[ elFrag(`<div class="title">${titleHtml}</div>`), el('div',{class:'sub'},[c.Phone||c.Email||'']) ]));
        card.appendChild(head);

        const badges = el('div',{class:'badges'},[]);
        const hitPills=[];
        if (lastFilters.health){
          const src = `${c.healthHistory||c.Condition||c.Notes||''}`.toLowerCase();
          if (src.includes(lastFilters.health.toLowerCase())) hitPills.push(`既往歴に「${lastFilters.health}」を含む`);
        }
        if (lastFilters.allergy){
          const src = `${c.allergies||c.Allergies||c.Notes||''}`.toLowerCase();
          if (src.includes(lastFilters.allergy.toLowerCase())) hitPills.push(`アレルギーに「${lastFilters.allergy}」を含む`);
        }
        if (lastFilters.notes){
          const src = `${c.Notes||c.Memo||''}`.toLowerCase();
          if (src.includes(lastFilters.notes.toLowerCase())) hitPills.push(`メモに「${lastFilters.notes}」を含む`);
        }
        hitPills.forEach(t=> badges.appendChild(el('span',{class:'badge'},[t])));

        if (c.LineUserID){
          const label = c.LineOptIn==='false' ? 'LINE停止中' : 'LINE連携';
          badges.appendChild(el('span',{class:'badge'},[label]));
        }
        if (c.Pets && c.Pets.length){
          const petsLine = c.Pets.map(p=> `${p.Name}${p.Breed?`/${p.Breed}`:''}`).filter(Boolean).join(' ・ ');
          badges.appendChild(el('span',{class:'badge'},[`ご愛犬 ${c.Pets.length}件`]));
          badges.appendChild(el('span',{class:'badge'},[petsLine]));
        }
        if (typeof c.PrepaidBalance === 'number'){
          badges.appendChild(el('span',{class:'badge'},[`前受金: ¥${Number(c.PrepaidBalance||0).toLocaleString()}`]));
        }
        if (c.Address) badges.appendChild(el('span',{class:'badge'},[c.Address]));
        card.appendChild(badges);

        const meta = el('div',{class:'meta'},[]);
        meta.appendChild(el('div',{},[`電話: ${c.Phone||'-'}`]));
        meta.appendChild(el('div',{},[`メール: ${c.Email||'-'}`]));
        meta.appendChild(el('div',{},[`メモ期限: ${c.MemoDue?formatDueDate(c.MemoDue):'-'}`]));
        meta.appendChild(el('div',{},[`最終更新: ${c.UpdatedAt||'-'}`]));
        card.appendChild(meta);

        const tags = normalizeTags(c.Tags);
        if (tags.length){
          card.appendChild(el('div',{class:'tag-list'}, tags.map(makeTagChip)));
        }

        card.appendChild(buildMemoLine(c.Notes||c.Memo||'', c.MemoDue||'', isPinned(c.MemoPinned), '共有メモ'));

        card.addEventListener('click', ()=> showOwnerDetail(c.CustomerID, c.Name));
        card.addEventListener('keydown', (e)=>{ if(e.key==='Enter') showOwnerDetail(c.CustomerID, c.Name); });
        box.appendChild(card);
      });
    }
    renderOwnerResults.draw = draw;
    applySortAndRender();
    return filtered;
  }

  function renderPetResults(list, f, q){
    const box = ui.searchResults; box.innerHTML='';
    box.classList.remove('result-compact');
    if (!list.length){ box.textContent='該当なし'; ui.resultsToolbar.style.display='flex'; ui.resCount.textContent='0 件'; return []; }
    const storeFiltered = list.filter(p=> belongsToCurrentStore(p.StoreID || p.storeId || p.CustomerStoreID));
    const filtered=storeFiltered.filter(p=> applyClientFilter(p,f));
    if (!filtered.length){ box.textContent='該当なし（条件を緩めてください）'; ui.resultsToolbar.style.display='flex'; ui.resCount.textContent='0 件'; return []; }
    lastResults = filtered.slice();

    function draw(arr){
      box.innerHTML='';
      arr.forEach(p=>{
        const card = el('div',{class:'result-card card-entrance', tabindex:'0'});
        const titleHtml = `${highlight(p.PetName||p.Name||'(名前なし)', q)} <span class="idpill">PID:${p.PetID||''}</span>`;
        const head = el('div',{class:'head'});
        const sub1 = p.OwnerName ? `お客様: ${p.OwnerName}` : '';
        head.appendChild(el('div',{},[ elFrag(`<div class="title">${titleHtml}</div>`), el('div',{class:'sub'},[sub1]) ]));
        card.appendChild(head);

        const badges = el('div',{class:'badges'},[]);
        const hitPills=[];
        if (lastFilters.health){
          const src = `${p.healthHistory||p.Condition||''}`.toLowerCase();
          if (src.includes(lastFilters.health.toLowerCase())) hitPills.push(`既往歴に「${lastFilters.health}」`);
        }
        if (lastFilters.allergy){
          const src = `${p.allergies||p.Allergies||''}`.toLowerCase();
          if (src.includes(lastFilters.allergy.toLowerCase())) hitPills.push(`アレルギー「${lastFilters.allergy}」`);
        }
        if (lastFilters.notes){
          const src = `${p.Notes||p.Memo||''}`.toLowerCase();
          if (src.includes(lastFilters.notes.toLowerCase())) hitPills.push(`メモに「${lastFilters.notes}」`);
        }
        hitPills.forEach(t=> badges.appendChild(el('span',{class:'badge'},[t])));

        if (p.Breed) badges.appendChild(el('span',{class:'badge'},[`犬種:${p.Breed}`]));
        if (p.Sex) badges.appendChild(el('span',{class:'badge'},[`性別:${p.Sex}`]));
        if (p.WeightKg) badges.appendChild(el('span',{class:'badge'},[`体重:${p.WeightKg}kg`]));
        card.appendChild(badges);

        const meta = el('div',{class:'meta'},[]);
        const latest = p.LatestVisit ? toDate(p.LatestVisit) : '-';
        meta.appendChild(el('div',{},[`最終来店: ${latest}`]));
        meta.appendChild(el('div',{},[`メモ期限: ${p.MemoDue?formatDueDate(p.MemoDue):'-'}`]));
        card.appendChild(meta);

        const tags = normalizeTags(p.Tags);
        if (tags.length){
          card.appendChild(el('div',{class:'tag-list'}, tags.map(makeTagChip)));
        }

        card.appendChild(buildMemoLine(p.Notes||p.Memo||'', p.MemoDue||'', isPinned(p.MemoPinned), 'カルテメモ'));

        card.addEventListener('click', ()=> showPetDetail(p.PetID, p.PetName||p.Name||'(名前なし)'));
        card.addEventListener('keydown', (e)=>{ if(e.key==='Enter') showPetDetail(p.PetID, p.PetName||p.Name||'(名前なし)'); });

        box.appendChild(card);
      });
    }
    renderPetResults.draw = draw;
    applySortAndRender();
    return filtered;
  }

  // ===== 並び替え／表示切替 =====
  function applySortAndRender(){
    if (!Array.isArray(lastResults)) return;
    const val = (ui.sortSelect?.value)||'name-asc';
    const byName = (row)=> String(searchMode==='owner' ? (row.Name||'') : (row.PetName||row.Name||''));
    const byVisit = (row)=> { const d = new Date(row.LatestVisit || row.VisitDate || 0); return d.getTime() || 0; };
    const arr = lastResults.slice();
    switch(val){
      case 'name-asc':  arr.sort((a,b)=> byName(a).localeCompare(byName(b),'ja')); break;
      case 'name-desc': arr.sort((a,b)=> byName(b).localeCompare(byName(a),'ja')); break;
      case 'visit-desc':arr.sort((a,b)=> byVisit(b)-byVisit(a)); break;
      case 'visit-asc': arr.sort((a,b)=> byVisit(a)-byVisit(b)); break;
    }
    if (searchMode==='owner' && typeof renderOwnerResults.draw==='function') renderOwnerResults.draw(arr);
    else if (searchMode==='pet' && typeof renderPetResults.draw==='function') renderPetResults.draw(arr);
  }

  function setViewMode(mode){
    const compact = (mode==='compact');
    ui.searchResults.classList.toggle('result-compact', compact);
    ui.viewComfort?.classList.toggle('active', !compact);
    ui.viewCompact?.classList.toggle('active', compact);
  }

  // ===== 詳細パネル =====
  function showOwnerDetail(customerId, name){
    const panel = ui.resultDetail;
    panel.style.display='block'; panel.textContent='詳細読込中…';
    callServer('getCustomerBundle', customerId)
      .then(bundle=>{ renderOwnerDetail(panel, name, bundle||{}); selectCustomer(customerId, name); })
      .catch(()=>{ panel.textContent='詳細を取得できませんでした'; });
  }

  function renderOwnerDetail(panel, name, bundle){
    panel.innerHTML = '';
    panel.appendChild(el('h4',{},[`お客様詳細：${name}（CID:${bundle.customer?.CustomerID||''}）`]));
    if (bundle.customer){
      if (bundle.customer.ProfilePhotoURL){
        const wrap = el('div',{class:'detail-photo'},[]);
        const img = el('img',{src:bundle.customer.ProfilePhotoURL, alt:'お客様写真'});
        wrap.appendChild(img);
        panel.appendChild(wrap);
      }
      const tags = normalizeTags(bundle.customer.Tags);
      if (tags.length){
        panel.appendChild(el('div',{class:'tag-list'}, tags.map(makeTagChip)));
      }
      panel.appendChild(buildMemoLine(bundle.customer.Notes||'', bundle.customer.MemoDue||'', isPinned(bundle.customer.MemoPinned), '共有メモ'));
      const lineInfo = [];
      if (bundle.customer.LineUserID){ lineInfo.push(`LINE ID: ${bundle.customer.LineUserID}`); }
      if (bundle.customer.LineDisplayName){ lineInfo.push(`表示名: ${bundle.customer.LineDisplayName}`); }
      if (bundle.customer.LineOptIn){ lineInfo.push(`通知: ${bundle.customer.LineOptIn==='false'?'停止':'許可'}`); }
      if (lineInfo.length){ panel.appendChild(el('div',{class:'muted-text'},[lineInfo.join(' / ')])); }
    }
    if (bundle.pets?.length){
      const ul = el('div',{}); 
      bundle.pets.forEach(p=>{
        ul.appendChild(el('div',{},[
          el('i',{class:'icon','data-feather':'heart','aria-hidden':'true'},[]),
          ` ${p.Name}（${p.Breed||''}） `,
          el('span',{class:'idpill'},[`PID:${p.PetID||''}`])
        ]));
      });
      panel.appendChild(ul);
    }
    const vs = bundle.visits||[];
    if (vs.length){
      panel.appendChild(el('div',{class:'divider'}));
      panel.appendChild(el('div',{style:'margin:6px 0;font-weight:700;'},['施術履歴']));
      vs.forEach(v=>{
        const d=v.VisitDate?new Date(v.VisitDate):null;
        const ds=d?`${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`:'';
        panel.appendChild(el('div',{},[
          `• ${ds}｜${v.ServiceName}（${v.ServiceID}） ×${v.Quantity}｜${Number(v.Total||0).toLocaleString()}円｜${v.PaymentMethod}｜担当:${v.Staff||''}`
        ]));
      });
    }
  }

  function showPetDetail(petId, name){
    const panel = ui.resultDetail;
    panel.style.display='block'; panel.textContent='詳細読込中…';
    callServer('getPetBundleUnified', petId)
      .then(b=>{ renderPetDetail(panel, name, b||{}); })
      .catch(()=>{ panel.textContent='詳細を取得できませんでした'; });
  }

  function renderPetDetail(panel, name, bundle){
    function toDateStr_(d){ if(!d) return ''; const x=new Date(d); const y=x.getFullYear(); const m=String(x.getMonth()+1).padStart(2,'0'); const dd=String(x.getDate()).padStart(2,'0'); return `${y}-${m}-${dd}`; }
    panel.innerHTML='';
    panel.appendChild(el('h4',{},[`ご愛犬詳細：${name}（PID:${bundle.pet?.PetID||''}）`]));
    if (bundle.pet){
      const p=bundle.pet;
      const photos = [
        { url:(p.FacePhotoURL||'').trim(), label:'顔' },
        { url:(p.BodyPhotoURL||'').trim(), label:'全身' },
        { url:(p.ProfilePhotoURL||'').trim(), label:'お気に入り' }
      ].filter(it=> it.url);
      if (photos.length){
        const wrap = el('div',{class:'detail-photo-grid'},[]);
        photos.forEach(ph=>{
          const fig = el('figure',{class:'preview-item'},[]);
          fig.appendChild(el('img',{src:ph.url, alt:ph.label||'ご愛犬写真'}));
          if (ph.label) fig.appendChild(el('figcaption',{},[ph.label]));
          wrap.appendChild(fig);
        });
        panel.appendChild(wrap);
      }
      panel.appendChild(el('div',{},[`犬種:${p.Breed||'-'} / 性別:${p.Sex||'-'}`]));
      const tags = normalizeTags(p.Tags);
      if (tags.length){
        panel.appendChild(el('div',{class:'tag-list'}, tags.map(makeTagChip)));
      }
      panel.appendChild(buildMemoLine(p.Notes||'', p.MemoDue||'', isPinned(p.MemoPinned), 'カルテメモ'));
    }
    const vs=bundle.visits||[];
    if (vs.length){
      panel.appendChild(el('div',{style:'margin:6px 0;font-weight:700;'},['施術履歴']));
      vs.forEach(v=>{
        const d=v.VisitDate?new Date(v.VisitDate):null;
        const ds=d?`${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`:'';
        panel.appendChild(el('div',{},[
          `• ${ds}｜${v.ServiceName}（${v.ServiceID}） ×${v.Quantity}｜${Number(v.Total||0).toLocaleString()}円｜${v.PaymentMethod}｜担当:${v.Staff||''}`
        ]));
      });
    }
    const journalList = Array.isArray(bundle.journal) ? bundle.journal : [];
    if (journalList.length){
      panel.appendChild(el('div',{style:'margin:6px 0;font-weight:700;'},['記録ブック']));
      journalList.forEach(entry=>{
        const line = el('div',{class:'journal-inline'},[]);
        const ds = entry.PerformedAt ? formatDueDate(entry.PerformedAt) : '';
        line.appendChild(el('div',{class:'journal-inline-head'},[`• ${ds||'-'} / ${entry.Staff||''}`]));
        if (entry.Title){ line.appendChild(el('div',{class:'journal-inline-title'},[entry.Title])); }
        if (entry.Summary){ line.appendChild(el('div',{class:'journal-inline-body'},[entry.Summary])); }
        if (entry.PhotoURL){
          line.appendChild(el('a',{href:entry.PhotoURL,target:'_blank',rel:'noopener'},['写真を見る']));
        }
        panel.appendChild(line);
      });
    }

    // --- カルテ（健康・ケア） ---
    const p0=bundle.pet||{}; 
    const healthBox=el('div',{class:'card'},[]);
    healthBox.appendChild(el('div',{style:'font-weight:700;margin:6px 0'},['カルテ（健康・ケア）']));
    const grid=el('div',{class:'grid'},[]);
    grid.appendChild(el('label',{},['ワクチン接種日', el('input',{type:'date', id:'hVacc', value: toDateStr_(p0.VaccineDate)})]));
    grid.appendChild(el('label',{},['狂犬病接種日', el('input',{type:'date', id:'hRab', value: toDateStr_(p0.RabiesDate)})]));
    grid.appendChild(el('label',{},['次回ワクチン', el('input',{type:'date', id:'hNextVacc', value: toDateStr_(p0.NextVaccine)})]));
    grid.appendChild(el('label',{},['次回狂犬病', el('input',{type:'date', id:'hNextRab', value: toDateStr_(p0.NextRabies)})]));
    grid.appendChild(el('label',{},['既往歴詳細', el('textarea',{id:'hCond', rows:'2'},[p0.Condition||''])]));
    grid.appendChild(el('label',{},['発症日', el('input',{type:'date', id:'hOnset', value: toDateStr_(p0.OnsetDate)})]));
    grid.appendChild(el('label',{},['治療内容', el('textarea',{id:'hTreat', rows:'2'},[p0.Treatment||''])]));
    grid.appendChild(el('label',{},['アレルギー（食）', el('input',{id:'hAFood', value: p0.AllergyFood||''})]));
    grid.appendChild(el('label',{},['アレルギー（環境）', el('input',{id:'hAEnv', value: p0.AllergyEnv||''})]));
    grid.appendChild(el('label',{},['食事', el('textarea',{id:'hDiet', rows:'2'},[p0.Diet||''])]));
    grid.appendChild(el('label',{},['サプリ', el('input',{id:'hSupp', value: p0.Supplements||''})]));
    grid.appendChild(el('label',{},['おやつ', el('input',{id:'hSnacks', value: p0.Snacks||''})]));
    grid.appendChild(el('label',{},['性格タグ（カンマ区切り）', el('input',{id:'hTags', value: p0.PersonalityTags||''})]));
    healthBox.appendChild(grid);
    const act=el('div',{class:'actions'},[]);
    const btnSaveH=el('button',{class:'btn-primary', type:'button'},['カルテを保存']);
    act.appendChild(btnSaveH);
    const hMsg=el('div',{class:'msg'},[]);
    healthBox.appendChild(act); healthBox.appendChild(hMsg);
    panel.appendChild(healthBox);

    btnSaveH.addEventListener('click', ()=>{
      const petId = bundle.pet?.PetID;
      const customerId = bundle.pet?.CustomerID || (currentCustomer?.id) || (document.getElementById('petOwnerSelect')?.value || '');
      if (!petId || !customerId){ msg(hMsg,'err','PetID / CustomerID が取得できません'); return; }
      const payload={ 
        PetID: petId, CustomerID: customerId,
        VaccineDate: byId('hVacc').value, RabiesDate: byId('hRab').value,
        NextVaccine: byId('hNextVacc').value, NextRabies: byId('hNextRab').value,
        Condition: byId('hCond').value, OnsetDate: byId('hOnset').value,
        Treatment: byId('hTreat').value, AllergyFood: byId('hAFood').value, AllergyEnv: byId('hAEnv').value,
        Diet: byId('hDiet').value, Supplements: byId('hSupp').value, Snacks: byId('hSnacks').value,
        PersonalityTags: byId('hTags').value
      };
      msg(hMsg,'','保存中…');
      callServer('upsertPetCard', payload)
        .then(()=>{ msg(hMsg,'ok','保存しました'); })
        .catch(e=>{ msg(hMsg,'err','エラー: '+(e?.message||e)); });
    });

    // --- 画像アップロード（Drive保存） ---
    const imgBox = el('div',{class:'card'},[]);
    imgBox.appendChild(el('div',{style:'font-weight:700;margin:6px 0'},['画像アップロード（Drive自動保存）']));
    const imgGrid = el('div',{class:'grid'},[]);
    const bodySel = el('select',{id:'imgBody'},[]);
    ;['FACE','BODY','HEAD','BACK','ABDOMEN','L-FRONT-LEG','R-FRONT-LEG'].forEach(c=> bodySel.appendChild(el('option',{value:c},[c])));
    imgGrid.appendChild(el('label',{},['部位', bodySel]));
    imgGrid.appendChild(el('label',{},['症状メモ', el('input',{id:'imgSym', placeholder:'例: 皮膚発赤'})]));
    const fileIn = el('input',{type:'file', id:'imgFiles', accept:'image/*', multiple:'multiple'},[]);
    imgGrid.appendChild(el('label',{},['画像ファイル', fileIn]));
    imgBox.appendChild(imgGrid);
    const act2 = el('div',{class:'actions'},[]);
    const btnUp = el('button',{class:'btn-primary', type:'button'},['アップロード']);
    act2.appendChild(btnUp);
    const upMsg = el('div',{class:'msg'},[]);
    imgBox.appendChild(act2); imgBox.appendChild(upMsg);
    panel.appendChild(imgBox);

    btnUp.addEventListener('click', ()=>{
      const files = document.getElementById('imgFiles').files;
      if (!files || !files.length){ msg(upMsg,'err','ファイルを選択してください'); return; }
      const petId = bundle.pet?.PetID; if (!petId){ msg(upMsg,'err','PetID が取得できません'); return; }
      const body = document.getElementById('imgBody').value; const sym = document.getElementById('imgSym').value;
      const tasks = Array.from(files).map(f=> new Promise((resolve,reject)=>{
        const fr=new FileReader();
        fr.onload=()=>{
          const base64=String(fr.result).split(',')[1];
          callServer('savePetImage', { PetID: petId, BodyPartCode: body, Symptom: sym, filename: f.name, mimeType: f.type, base64 })
            .then(resolve).catch(reject);
        };
        fr.onerror=()=> reject(fr.error||'読込エラー');
        fr.readAsDataURL(f);
      }));
      msg(upMsg,'','アップロード中…');
      Promise.allSettled(tasks).then(rs=>{
        const ok=rs.filter(x=>x.status==='fulfilled').length; const ng=rs.length-ok;
        msg(upMsg, ok? 'ok':'err', `完了: ${ok}件 / 失敗: ${ng}件`);
      });
    });

    const imgs = bundle.images||[];
    if (imgs.length){
      const box=el('div',{class:'card'},[]);
      box.appendChild(el('div',{style:'font-weight:700;margin:6px 0'},['画像一覧']));
      const g=el('div',{class:'imgGrid'},[]);
      imgs.slice(0,18).forEach(r=>{
        const it=el('div',{class:'imgItem'},[]);
        const a=el('a',{href:r.ImageURL, target:'_blank'},[]);
        const im=el('img',{src:r.ImageURL, alt:r.Symptom||r.BodyPartCode||''},[]);
        a.appendChild(im); it.appendChild(a);
        it.appendChild(el('div',{},[`${r.BodyPartCode||''} ${r.Symptom?('｜'+r.Symptom):''}`]));
        g.appendChild(it);
      });
      box.appendChild(g);
      panel.appendChild(box);
    }
  }

  // ===== 記録フォーム =====
  async function selectCustomer(customerId, name){
    currentCustomer = { id: customerId, name: name };
    ui.recordForm.style.display='block';
    ui.selectedCustomerName.textContent = `選択中：${name}（CID:${customerId}）`;
    await loadPets(customerId);
    await refreshVisits(customerId);
    try{
      const bal = await callServer('getPrepaidBalance', customerId);
      if (ui.prepaidBalance) ui.prepaidBalance.value = `${Number(bal||0).toLocaleString()} 円`;
    }catch(_){}
  }

  async function loadPets(customerId){
    if (isHumanStore()){ fillSelect(ui.petSelect, [{value:'',label:'（ビューティーケア（人）では選択不要）'}]); return; }
    try{
      const pets = await callServer('getPetsByCustomer', customerId) || [];
      currentPets = pets;
      fillSelect(ui.petSelect, pets.length ? pets.map(p=>({value:p.PetID, label:`${p.Name}${p.Breed?`（${p.Breed}）`:''}`})) : [{value:'',label:'該当なし'}]);
    }catch(e){
      console.error(e);
      fillSelect(ui.petSelect, [{value:'',label:'取得できません'}]);
    }
  }

  async function refreshVisits(customerId){
    try{
      const list = await callServer('listVisitsByCustomer', customerId);
      ui.visitList.innerHTML = (list && list.length) ? list.map(v=>{
        const d=v.VisitDate?new Date(v.VisitDate):null;
        const ds=d?`${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`:'';
        return `<div>• ${ds}｜${escapeHtml(v.ServiceName||v.ServiceID||'')} ×${v.Quantity}｜${Number(v.Total||0).toLocaleString()}円｜${escapeHtml(v.PaymentMethod||'')}｜担当:${escapeHtml(v.Staff||'')}</div>`;
      }).join('') : '履歴はありません';
    }catch(e){
      console.error(e);
      ui.visitList.textContent = '履歴の取得に失敗しました';
    }
  }

  async function onSaveVisit(){
    if (!currentCustomer?.id){ msg(ui.visitMsg,'err','先にお客様を選択してください'); return; }
    const requirePet = !isHumanStore();
    const payload = {
      CustomerID: currentCustomer.id,
      PetID: requirePet ? ui.petSelect.value : '',
      ServiceID: ui.serviceSelect.value,
      Quantity: +(ui.qtyInput.value||1),
      PaymentMethod: ui.paymentSelect.value,
      Staff: ui.staffSelect.value,
      VisitDate: ui.visitDate.value,
      Notes: (ui.notes.value||'').trim(),
      StoreID: getCurrentStoreId()
    };
    if ((requirePet && !payload.PetID) || !payload.ServiceID || !payload.PaymentMethod || !payload.Staff || !payload.VisitDate){
      msg(ui.visitMsg,'err', requirePet ? '必須項目（ご愛犬/施術/支払方法/担当者/来店日）を入力してください' : '必須項目（施術/支払方法/担当者/来店日）を入力してください'); return;
    }
    try{
      toggleBtn(ui.btnSaveVisit,true); msg(ui.visitMsg,'','保存中…');
      await callServer('createVisit', payload);
      msg(ui.visitMsg,'ok','記録を保存しました');
      // Trigger save completion animation and notification
      __safeCall(window.__triggerSaveComplete, ui.btnSaveVisit);
      __safeCall(window.__showNotification, '来店記録を保存しました', 'success');
      // ★ 自動クリア（来店日だけは本日に再セット）
      clearVisitForm();
      await refreshVisits(currentCustomer.id);
    }catch(e){
      console.error(e); msg(ui.visitMsg,'err','保存に失敗しました: '+(e?.message||e));
      __safeCall(window.__showNotification, '保存に失敗しました', 'error');
    }finally{ toggleBtn(ui.btnSaveVisit,false); }
  }
  async function ensureQuickReservations(options={}){
    if (quickReservationPromise && !options.force){
      return quickReservationPromise;
    }
    if (!options.force && quickReservationData.length){
      renderReservationQuickSummary();
      return quickReservationData;
    }
    quickReservationPromise = callServer('listReservations').then(list=>{
      applyQuickReservationData(list);
      return quickReservationData;
    }).catch(err=>{
      console.error(err);
      if (!options.silent && ui.reservationPanelSummary){
        ui.reservationPanelSummary.textContent = '予約の取得に失敗しました。';
      }
      throw err;
    }).finally(()=>{ quickReservationPromise = null; });
    return quickReservationPromise;
  }

  function applyQuickReservationData(list){
    quickReservationData = Array.isArray(list) ? list.slice() : [];
    renderReservationQuickSummary();
  }

  function renderReservationQuickSummary(){
    if (!ui.todayReservationCount) return;
    const todayList = getTodayReservations();
    const totalText = `${todayList.length}件`;
    ui.todayReservationCount.textContent = totalText;
    if (ui.homeReservationCount) ui.homeReservationCount.textContent = totalText;
    const staffCounts = aggregateStaffCounts(todayList);
    if (staffCounts.length){
      const summaryText = staffCounts.slice(0,3).map(([name,count])=> `${name} ${count}件`).join(' / ');
      ui.reservationStaffSummary.textContent = summaryText;
      if (ui.homeReservationStaff){
        const [topName, topCount] = staffCounts[0];
        const extra = staffCounts.length > 1 ? ` / 他${staffCounts.length-1}名` : '';
        ui.homeReservationStaff.textContent = `最多 ${topName} ${topCount}件${extra}`;
      }
    }else{
      ui.reservationStaffSummary.textContent = '担当別 0件';
      if (ui.homeReservationStaff) ui.homeReservationStaff.textContent = '担当割り当てなし';
    }
    let range = '';
    if (ui.reservationPanelSummary){
      if (todayList.length){
        const startTimes = todayList.map(r=> parseMinutes(r.Start)).filter(v=> v!=null).sort((a,b)=> a-b);
        const endTimes = todayList.map(r=> parseMinutes(r.End)).filter(v=> v!=null).sort((a,b)=> b-a);
        if (startTimes.length){
          const first = formatHHMMFromMinutes(startTimes[0]);
          const last = formatHHMMFromMinutes((endTimes[0] != null ? endTimes[0] : startTimes[startTimes.length-1]));
          range = first && last ? `${first} 〜 ${last}` : (first || last || '');
          ui.reservationPanelSummary.textContent = range ? `本日の予約 ${todayList.length}件（${range}）` : `本日の予約 ${todayList.length}件`;
        }else{
          ui.reservationPanelSummary.textContent = `本日の予約 ${todayList.length}件`;
        }
      }else{
        ui.reservationPanelSummary.textContent = '本日の予約はありません。';
      }
    }else if (todayList.length){
      const startTimes = todayList.map(r=> parseMinutes(r.Start)).filter(v=> v!=null).sort((a,b)=> a-b);
      const endTimes = todayList.map(r=> parseMinutes(r.End)).filter(v=> v!=null).sort((a,b)=> b-a);
      if (startTimes.length){
        const first = formatHHMMFromMinutes(startTimes[0]);
        const last = formatHHMMFromMinutes((endTimes[0] != null ? endTimes[0] : startTimes[startTimes.length-1]));
        range = first && last ? `${first} 〜 ${last}` : (first || last || '');
      }
    }
    if (ui.homeReservationRange){
      ui.homeReservationRange.textContent = range || '未設定';
    }
    if (ui.homeReservationNext){
      const upcoming = findUpcomingReservation(todayList);
      ui.homeReservationNext.textContent = upcoming ? formatUpcomingReservation(upcoming) : '予約はありません';
    }
    if (ui.reservationTimeline){
      if (ui.reservationPanel?.hidden === false){
        renderReservationTimeline(todayList);
      }else{
        if (ui.reservationTimelineEmpty) ui.reservationTimelineEmpty.hidden = todayList.length > 0;
        if (!todayList.length) ui.reservationTimeline.innerHTML = '';
      }
    }
    renderHomeReservationOverview(todayList);
  }

  function renderHomeReservationOverview(todayList){
    renderHomeReservationChart();
    if (!ui.homeReservationDetails) return;
    if (!Array.isArray(todayList) || !todayList.length){
      ui.homeReservationDetails.innerHTML = '<div class="muted-text">本日の予約はありません。</div>';
      ui.homeReservationDetails.dataset.hasData = '0';
      updateHomeOverviewState();
      return;
    }
    const sorted = todayList.slice().sort((a,b)=>{
      const sa = parseMinutes(a?.Start);
      const sb = parseMinutes(b?.Start);
      const va = sa == null ? 99999 : sa;
      const vb = sb == null ? 99999 : sb;
      return va - vb;
    });
    const items = sorted.map(renderHomeReservationItem);
    ui.homeReservationDetails.innerHTML = items.join('');
    ui.homeReservationDetails.dataset.hasData = items.length ? '1' : '0';
    updateHomeOverviewState();
  }

  function renderHomeReservationItem(reservation){
    if (!reservation) return '';
    const time = formatTimeRange(reservation.Start, reservation.End) || '時刻未設定';
    const staff = normalizeStaffLabel(reservation.Staff);
    const customer = (reservation.CustomerName || getCustomerName(reservation.CustomerID) || '（未設定）').trim();
    const service = (reservation.ServiceName || reservation.Menu || getServiceName(reservation.ServiceID) || '').trim();
    const memoRaw = (reservation.Notes || reservation.Memo || '').replace(/\s+/g,' ').trim();
    const memo = memoRaw.length > 32 ? memoRaw.slice(0, 32) + '…' : memoRaw;
    const metaParts = [service, memo].filter(Boolean);
    const meta = metaParts.length ? `<span class="meta">${escapeHtml(metaParts.join(' / '))}</span>` : '';
    return `<div class="overview-item reservation"><div class="primary"><span class="time">${escapeHtml(time)}</span><span class="customer">${escapeHtml(customer)}</span>${meta}</div><div class="secondary"><span>${escapeHtml(staff)}</span></div></div>`;
  }

  function renderHomeReservationChart(){
    if (!ui.homeReservationChartBars && !ui.homeReservationChartLegend) return;
    const list = Array.isArray(quickReservationData) ? quickReservationData : [];
    const days = 7;
    const today = new Date();
    const points = [];
    for (let i = days - 1; i >= 0; i--){
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const key = toYMDLocal(date);
      const count = list.filter(item => belongsToCurrentStore(item?.StoreID) && normalizeYMDValue(item?.Date) === key).length;
      points.push({ key, date, count, isToday: i === 0 });
    }
    const max = Math.max(1, ...points.map(p=> p.count));
    if (ui.homeReservationChartBars){
      ui.homeReservationChartBars.innerHTML = points.map(point => {
        const height = Math.round((point.count / max) * 100);
        const label = point.date ? formatChartDayLabel(point.date) : point.key;
        return `<div class="spark-bar${point.isToday ? ' is-today' : ''}" style="--bar-height:${height}%" aria-label="${escapeHtml(label)} ${point.count}件"><span class="value">${point.count}</span><span class="label">${escapeHtml(label)}</span></div>`;
      }).join('');
    }
    if (ui.homeReservationChartLegend){
      const total = points.reduce((sum, p)=> sum + p.count, 0);
      const avg = points.length ? total / points.length : 0;
      ui.homeReservationChartLegend.textContent = `直近7日 平均 ${formatAverage(avg)}件 / 合計 ${total}件`;
    }
  }

  function getTodayReservations(){
    const today = todayYMD();
    return quickReservationData.filter(rec=> normalizeYMDValue(rec?.Date) === today && belongsToCurrentStore(rec?.StoreID));
  }

  function aggregateStaffCounts(list){
    const counts = new Map();
    (list||[]).forEach(rec=>{
      const label = normalizeStaffLabel(rec?.Staff);
      counts.set(label, (counts.get(label)||0) + 1);
    });
    return Array.from(counts.entries()).sort((a,b)=> (b[1]-a[1]) || a[0].localeCompare(b[0], 'ja'));
  }

  function findUpcomingReservation(list){
    if (!Array.isArray(list) || !list.length) return null;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const enriched = list.map(item => ({ item, start: parseMinutes(item?.Start) })).filter(entry => entry.start != null).sort((a,b)=> a.start - b.start);
    if (!enriched.length) return null;
    const match = enriched.find(entry => entry.start >= currentMinutes) || enriched[0];
    return match?.item || null;
  }

  function formatUpcomingReservation(reservation){
    if (!reservation) return '';
    const time = formatTimeRange(reservation.Start, reservation.End);
    const staff = normalizeStaffLabel(reservation.Staff);
    const customer = getCustomerName(reservation.CustomerID) || String(reservation.CustomerName || '').trim();
    const parts = [];
    if (time) parts.push(time);
    if (customer) parts.push(`${customer}様`);
    if (staff) parts.push(`担当:${staff}`);
    return parts.join(' / ') || '';
  }

  function renderReservationTimeline(list){
    if (!ui.reservationTimeline) return;
    if (!Array.isArray(list) || !list.length){
      ui.reservationTimeline.innerHTML = '';
      if (ui.reservationTimelineEmpty) ui.reservationTimelineEmpty.hidden = false;
      return;
    }
    if (ui.reservationTimelineEmpty) ui.reservationTimelineEmpty.hidden = true;
    const startHour = 10;
    const endHour = 20;
    const step = 15;
    const startMin = startHour * 60;
    const endMin = endHour * 60;
    const slotCount = Math.max(1, Math.round((endMin - startMin) / step));
    const hourLabels = [];
    for (let h = startHour; h <= endHour; h++){ hourLabels.push(`${String(h).padStart(2,'0')}:00`); }
    const hourHtml = `<div class="timeline-hours" style="--hour-label-count:${hourLabels.length};">${hourLabels.map(label=> `<span>${escapeHtml(label)}</span>`).join('')}</div>`;
    const headHtml = `<div class="timeline-head"><div class="timeline-staff">スタッフ</div>${hourHtml}</div>`;
    const hourCount = Math.max(1, Math.round((endMin - startMin) / 60));
    const staffList = aggregateStaffCounts(list).map(([name])=> name).slice(0,5);
    const rowsHtml = staffList.map(name=>{
      const events = list.filter(rec=> normalizeStaffLabel(rec?.Staff) === name);
      const eventsHtml = events.map(res=> buildTimelineEvent(res, startMin, endMin, step, slotCount)).filter(Boolean).join('');
      return `<div class="timeline-row"><div class="timeline-staff">${escapeHtml(name)}</div><div class="timeline-track" style="--slot-count:${slotCount}; --hour-count:${hourCount};">${eventsHtml}</div></div>`;
    }).join('');
    ui.reservationTimeline.innerHTML = headHtml + rowsHtml;
  }

  function buildTimelineEvent(reservation, startMin, endMin, step, slotCount){
    if (!reservation) return '';
    const rawStart = parseMinutes(reservation.Start);
    const rawEnd = parseMinutes(reservation.End);
    let start = rawStart != null ? rawStart : startMin;
    let end = rawEnd != null ? rawEnd : start + step;
    if (end <= start) end = start + step;
    const clampStart = Math.max(startMin, Math.min(endMin, start));
    const clampEnd = Math.max(clampStart + step, Math.min(endMin, end));
    if (clampStart >= endMin || clampEnd <= startMin) return '';
    const slotStart = Math.floor((clampStart - startMin) / step);
    const slotEnd = Math.ceil((clampEnd - startMin) / step);
    const colStart = Math.max(1, slotStart + 1);
    const colEnd = Math.min(slotCount + 1, Math.max(colStart + 1, slotEnd + 1));
    const timeText = formatTimeRange(reservation.Start, reservation.End);
    const serviceName = getServiceName(reservation.ServiceID);
    const customerName = getCustomerName(reservation.CustomerID);
    const baseLabel = (reservation.Title || '').trim() || serviceName || (customerName ? `${customerName}様` : '予約');
    const metaParts = [];
    if (serviceName && serviceName !== baseLabel) metaParts.push(serviceName);
    if (customerName) metaParts.push(`顧客:${customerName}`);
    const petId = reservation.PetID ? String(reservation.PetID).trim() : '';
    if (petId) metaParts.push(`ペット:${petId}`);
    if (reservation.Notes) metaParts.push(reservation.Notes);
    const metaText = metaParts.join(' / ');
    const titleAttr = `${timeText} ${baseLabel}${metaText ? ' / ' + metaText : ''}`;
    return `<div class="timeline-event" style="grid-column:${colStart}/${colEnd};" title="${escapeHtml(titleAttr)}"><div class="event-time">${escapeHtml(timeText)}</div><div class="event-label">${escapeHtml(baseLabel)}</div>${metaText ? `<div class="event-meta">${escapeHtml(metaText)}</div>` : ''}</div>`;
  }

  async function ensureQuickNotes(options={}){
    if (quickNotesPromise && !options.force){
      return quickNotesPromise;
    }
    if (!options.force && quickNotesData.length){
      renderStaffNotesSummary();
      return quickNotesData;
    }
    quickNotesPromise = callServer('listStaffNotes').then(list=>{
      applyQuickNotesData(list);
      return quickNotesData;
    }).catch(err=>{
      console.error(err);
      if (!options.silent){
        if (ui.staffNotesGeneral) ui.staffNotesGeneral.innerHTML = '<div class="muted-text">連絡事項の取得に失敗しました。</div>';
        if (ui.staffNotesByStaff) ui.staffNotesByStaff.innerHTML = '<div class="muted-text">連絡事項の取得に失敗しました。</div>';
      }
      throw err;
    }).finally(()=>{ quickNotesPromise = null; });
    return quickNotesPromise;
  }

  function applyQuickNotesData(list){
    quickNotesData = Array.isArray(list) ? list.slice() : [];
    renderStaffNotesSummary();
  }

  function renderStaffNotesSummary(){
    if (!ui.staffNotesSummaryCount || !ui.staffNotesImportantSummary) return;
    const list = quickNotesData || [];
    const general = list.filter(note=> isGeneralNote(note));
    ui.staffNotesSummaryCount.textContent = `全体 ${general.length}件`;
    if (ui.homeNotesGeneralCount) ui.homeNotesGeneralCount.textContent = `全体 ${general.length}件`;
    const important = aggregateImportantNotes(list);
    if (important.length){
      ui.staffNotesImportantSummary.textContent = important.slice(0,3).map(([name,count])=> `${name} ${count}件`).join(' / ');
    }else{
      ui.staffNotesImportantSummary.textContent = '重要: 0件';
    }
    const importantTotal = important.reduce((sum, [,count])=> sum + count, 0);
    if (ui.homeNotesImportantCount) ui.homeNotesImportantCount.textContent = `${importantTotal}件`;
    if (ui.homeNotesHighlight){
      const highlight = getHomeNoteHighlight(list);
      ui.homeNotesHighlight.textContent = highlight || '優先メモはありません';
    }
    if (ui.staffNotesPanel && ui.staffNotesPanel.hidden === false){
      renderStaffNotesPanel();
    }
    renderHomeNotesOverview();
  }

  function renderHomeNotesOverview(){
    const list = Array.isArray(quickNotesData) ? quickNotesData : [];
    if (ui.homeNotesStats){
      const generalCount = list.filter(note=> isGeneralNote(note)).length;
      const importantCount = list.filter(note=> note?.Pinned).length;
      const topTargets = aggregateImportantNotes(list).slice(0,3);
      const parts = [
        `<span class="stat-pill">全体 ${generalCount}件</span>`,
        `<span class="stat-pill">重要 ${importantCount}件</span>`
      ];
      if (topTargets.length){
        const label = topTargets.map(([name,count])=> `${name} ${count}件`).join(' / ');
        parts.push(`<span class="stat-pill accent">${escapeHtml(label)}</span>`);
      }
      ui.homeNotesStats.innerHTML = parts.join('');
    }
    if (ui.homeNotesDetails){
      if (!list.length){
        ui.homeNotesDetails.innerHTML = '<div class="muted-text">連絡事項は登録されていません。</div>';
        ui.homeNotesDetails.dataset.hasData = '0';
        updateHomeOverviewState();
        return;
      }
      const sorted = list.slice().sort((a,b)=>{
        const ta = new Date(a?.UpdatedAt || a?.CreatedAt || 0).getTime();
        const tb = new Date(b?.UpdatedAt || b?.CreatedAt || 0).getTime();
        return (Number.isNaN(tb)?0:tb) - (Number.isNaN(ta)?0:ta);
      }).slice(0,8);
      ui.homeNotesDetails.innerHTML = sorted.map(renderHomeNoteItem).join('');
      ui.homeNotesDetails.dataset.hasData = sorted.length ? '1' : '0';
    }
    updateHomeOverviewState();
  }

  function renderHomeNoteItem(note){
    if (!note) return '';
    const title = (note.Title || '').trim() || '(無題)';
    const bodyRaw = (note.Body || '').replace(/\s+/g, ' ').trim();
    const body = bodyRaw.length > 40 ? bodyRaw.slice(0, 40) + '…' : bodyRaw;
    const audienceList = parseNoteAudience(note);
    const audience = audienceList.length ? audienceList.join('・') : '全体';
    const timestamp = formatDateTimeLabel(note.UpdatedAt || note.CreatedAt || '');
    const pinned = !!note.Pinned;
    const bodyHtml = body ? `<span class="meta">${escapeHtml(body)}</span>` : '';
    const secondary = [audience, timestamp].filter(Boolean).map(text=> `<span>${escapeHtml(text)}</span>`).join('');
    return `<div class="overview-item note${pinned ? ' is-pinned' : ''}"><div class="primary"><span class="title">${pinned ? '📌 ' : ''}${escapeHtml(title)}</span>${bodyHtml}</div><div class="secondary">${secondary}</div></div>`;
  }

  function renderStaffNotesPanel(){
    if (!ui.staffNotesGeneral || !ui.staffNotesByStaff) return;
    const list = quickNotesData || [];
    const general = list.filter(note=> isGeneralNote(note));
    if (general.length){
      ui.staffNotesGeneral.innerHTML = general.map(renderQuickNoteCard).join('');
    }else{
      ui.staffNotesGeneral.innerHTML = '<div class="muted-text">全体への連絡事項はありません。</div>';
    }
    const grouped = new Map();
    list.forEach(note=>{
      if (!note?.Pinned) return;
      const targets = parseNoteAudience(note).filter(name=> !isGeneralKeyword(name));
      if (!targets.length) return;
      targets.forEach(name=>{
        const label = name || '（未設定）';
        const bucket = grouped.get(label) || [];
        bucket.push(note);
        grouped.set(label, bucket);
      });
    });
    if (!grouped.size){
      ui.staffNotesByStaff.innerHTML = '<div class="muted-text">重要な連絡事項はありません。</div>';
      return;
    }
    const sorted = Array.from(grouped.entries()).sort((a,b)=> (b[1].length - a[1].length) || a[0].localeCompare(b[0], 'ja')).slice(0,5);
    ui.staffNotesByStaff.innerHTML = sorted.map(([name, notes])=> `<div class="quick-note-group"><h4>${escapeHtml(name)}</h4>${notes.map(renderQuickNoteCard).join('')}</div>`).join('');
  }

  async function ensureQuickSales(options={}){
    const today = todayYMD();
    const monthKey = today.slice(0,7);
    const storeId = getCurrentStoreId();
    if (!options.force && quickSalesReport && quickSalesStoreId === storeId && quickSalesMonthKey === monthKey){
      if (!options.silent){
        renderQuickSalesSummary();
      }
      return quickSalesReport;
    }
    if (quickSalesPromise) return quickSalesPromise;
    const payload = buildSalesPayload(today, monthKey, storeId);
    quickSalesPromise = callServer('getDailySalesReport', payload).then(report=>{
      quickSalesReport = report || {};
      quickSalesStoreId = storeId;
      quickSalesMonthKey = monthKey;
      renderQuickSalesSummary();
      if (ui.salesPanel && ui.salesPanel.hidden === false){
        renderQuickSalesPanel();
      }
      return quickSalesReport;
    }).catch(err=>{
      console.error(err);
      if (!options.silent){ setQuickSalesError('売上の取得に失敗しました。'); }
      throw err;
    }).finally(()=>{ quickSalesPromise = null; });
    return quickSalesPromise;
  }

  function renderQuickSalesSummary(){
    const today = todayYMD();
    const dailyRow = Array.isArray(quickSalesReport?.daily) ? quickSalesReport.daily.find(row=> row.date === today) : null;
    const total = Number(dailyRow?.total || 0);
    if (ui.quickSalesToday){
      ui.quickSalesToday.textContent = `今日 ${formatYen(total)}`;
    }
    if (ui.homeSalesToday){
      ui.homeSalesToday.textContent = `今日 ${formatYen(total)}`;
    }
    const summary = quickSalesReport?.summary || {};
    if (ui.homeSalesMonth){
      ui.homeSalesMonth.textContent = formatYen(summary.total || 0);
    }
    const topStaff = getTopSalesStaff(quickSalesReport);
    if (ui.homeSalesHighlight){
      ui.homeSalesHighlight.textContent = topStaff ? `${topStaff.name} ${formatYen(topStaff.total)}` : 'なし';
    }
    if (ui.salesPanel && ui.salesPanel.hidden === false){
      if (quickSalesReport){ renderQuickSalesPanel(); }
      else { setQuickSalesError('売上データがまだ読み込まれていません。'); }
    }
    renderHomeSalesOverview();
  }

  function renderHomeSalesOverview(){
    renderHomeSalesChart();
    renderHomeSalesDetails();
    updateHomeOverviewState();
  }

  function renderHomeSalesChart(){
    if (!ui.homeSalesChartBars && !ui.homeSalesChartLegend) return;
    const rows = Array.isArray(quickSalesReport?.daily) ? quickSalesReport.daily : [];
    const sortedRows = rows.slice().sort((a,b)=>{
      const da = toDateOnly(a?.date || a?.Day || a?.day);
      const db = toDateOnly(b?.date || b?.Day || b?.day);
      const ta = da ? da.getTime() : 0;
      const tb = db ? db.getTime() : 0;
      return ta - tb;
    });
    const recent = sortedRows.slice(-7);
    if (ui.homeSalesChartBars){
      if (!recent.length){
        ui.homeSalesChartBars.innerHTML = '<div class="spark-empty">売上データがまだありません。</div>';
      }else{
        const todayKey = todayYMD();
        const max = Math.max(1, ...recent.map(row=> Number(row?.total||0)));
        ui.homeSalesChartBars.innerHTML = recent.map(row=>{
          const value = Number(row?.total || 0);
          const date = toDateOnly(row?.date || row?.Day || row?.day);
          const label = date ? formatChartDayLabel(date) : String(row?.date || '');
          const height = Math.round((value / max) * 100);
          const isToday = normalizeYMDValue(row?.date || row?.Day || row?.day) === todayKey;
          return `<div class="spark-bar${isToday ? ' is-today' : ''}" style="--bar-height:${height}%" aria-label="${escapeHtml(label)} ${formatYen(value)}"><span class="value">${escapeHtml(formatCompactYen(value))}</span><span class="label">${escapeHtml(label)}</span></div>`;
        }).join('');
      }
    }
    if (ui.homeSalesChartLegend){
      if (!recent.length){
        ui.homeSalesChartLegend.textContent = '売上データがまだ読み込まれていません。';
      }else{
        const total = recent.reduce((sum,row)=> sum + Number(row?.total || 0), 0);
        const avg = recent.length ? total / recent.length : 0;
        ui.homeSalesChartLegend.textContent = `直近7日 平均 ${formatYen(Math.round(avg))} / 合計 ${formatYen(total)}`;
      }
    }
  }

  function renderHomeSalesDetails(){
    if (!ui.homeSalesDetails) return;
    const today = todayYMD();
    const details = quickSalesReport?.details;
    const visits = Array.isArray(details?.[today]) ? details[today] : [];
    if (!visits.length){
      ui.homeSalesDetails.innerHTML = '<div class="muted-text">本日の売上はまだ登録されていません。</div>';
      ui.homeSalesDetails.dataset.hasData = '0';
      return;
    }
    const sorted = visits.slice().sort((a,b)=>{
      const sa = parseMinutes(a?.start || a?.Start || a?.StartTime || a?.VisitStart);
      const sb = parseMinutes(b?.start || b?.Start || b?.StartTime || b?.VisitStart);
      const va = sa == null ? 99999 : sa;
      const vb = sb == null ? 99999 : sb;
      return va - vb;
    });
    ui.homeSalesDetails.innerHTML = sorted.map(renderHomeSalesItem).join('');
    ui.homeSalesDetails.dataset.hasData = '1';
  }

  function renderHomeSalesItem(visit){
    if (!visit) return '';
    const time = formatVisitTime(visit) || '時間未設定';
    const customer = (visit.customerName || visit.CustomerName || getCustomerName(visit.customerId || visit.CustomerID) || '（未設定）').trim();
    const staff = normalizeStaffLabel(visit.staff || visit.Staff);
    const total = formatYen(Number(visit.total || visit.Total || 0));
    const items = Array.isArray(visit.items) ? visit.items : [];
    const serviceNames = items.map(item=> (item?.serviceName || item?.ServiceName || item?.serviceId || item?.ServiceID || '').trim()).filter(Boolean);
    const summary = serviceNames.slice(0,3).join('・');
    const meta = summary ? `<span class="meta">${escapeHtml(summary)}</span>` : '';
    return `<div class="overview-item sale"><div class="primary"><span class="time">${escapeHtml(time)}</span><span class="customer">${escapeHtml(customer)}</span>${meta}</div><div class="secondary"><span class="staff">${escapeHtml(staff)}</span><span class="amount">${escapeHtml(total)}</span></div></div>`;
  }

  function formatVisitTime(visit){
    if (!visit) return '';
    const start = visit.start || visit.Start || visit.StartTime || visit.VisitStart || visit.VisitDate;
    const end = visit.end || visit.End || visit.EndTime || visit.VisitEnd || '';
    return formatTimeRange(start, end);
  }

  function updateHomeOverviewState(){
    if (!ui.homeOverviewEmpty) return;
    const hasReservations = ui.homeReservationDetails?.dataset?.hasData === '1';
    const hasNotes = ui.homeNotesDetails?.dataset?.hasData === '1';
    const hasSales = ui.homeSalesDetails?.dataset?.hasData === '1';
    const hasData = !!(hasReservations || hasNotes || hasSales);
    ui.homeOverviewEmpty.hidden = hasData;
  }

  function renderQuickSalesPanel(){
    if (!ui.salesDailyStats || !ui.salesMonthlyStats || !ui.salesByStaff || !ui.salesByMenu){ return; }
    if (!quickSalesReport){
      setQuickSalesError('売上データがまだ読み込まれていません。');
      return;
    }
    const today = todayYMD();
    const dailyRow = Array.isArray(quickSalesReport.daily) ? quickSalesReport.daily.find(row=> row.date === today) : null;
    const summary = quickSalesReport.summary || {};
    const dailyStats = [
      { label:'売上', value: formatYen(dailyRow?.total || 0) },
      { label:'来店件数', value: `${dailyRow?.count || 0}件` },
      { label:'現金', value: formatYen(dailyRow?.cash || 0) },
      { label:'未収', value: formatYen(dailyRow?.ar || 0) }
    ];
    ui.salesDailyStats.innerHTML = dailyStats.map(stat=> `<div class="quick-stat"><div class="label">${escapeHtml(stat.label)}</div><div class="value">${escapeHtml(stat.value)}</div></div>`).join('');
    const monthlyStats = [
      { label:'月合計', value: formatYen(summary.total || 0) },
      { label:'来店件数', value: `${summary.count || 0}件` },
      { label:'顧客数', value: `${summary.uniqueCustomers || 0}人` },
      { label:'顧客単価', value: formatYen(summary.unitPrice || 0) }
    ];
    ui.salesMonthlyStats.innerHTML = monthlyStats.map(stat=> `<div class="quick-stat"><div class="label">${escapeHtml(stat.label)}</div><div class="value">${escapeHtml(stat.value)}</div></div>`).join('');

    const details = quickSalesReport.details || {};
    const staffTotals = new Map();
    const menuTotals = new Map();
    Object.values(details).forEach(dayList=>{
      (dayList||[]).forEach(visit=>{
        const staff = normalizeStaffLabel(visit?.staff);
        staffTotals.set(staff, (staffTotals.get(staff)||0) + Number(visit?.total || 0));
        const items = Array.isArray(visit?.items) ? visit.items : [];
        if (items.length){
          items.forEach(item=>{
            const name = (item?.serviceName || item?.serviceId || 'その他').trim() || 'その他';
            const amount = Number(item?.lineTotal || (Number(item?.unitPrice||0) * Number(item?.quantity||1))) || 0;
            menuTotals.set(name, (menuTotals.get(name)||0) + amount);
          });
        }else{
          menuTotals.set('その他', (menuTotals.get('その他')||0) + Number(visit?.total || 0));
        }
      });
    });
    const staffList = Array.from(staffTotals.entries()).sort((a,b)=> (b[1]-a[1]) || a[0].localeCompare(b[0], 'ja')).slice(0,5);
    ui.salesByStaff.innerHTML = staffList.length ? staffList.map(([name,total])=> `<div class="quick-list-item"><span class="label">${escapeHtml(name)}</span><span class="amount">${formatYen(total)}</span></div>`).join('') : '<div class="muted-text">集計対象がありません。</div>';
    const menuList = Array.from(menuTotals.entries()).sort((a,b)=> (b[1]-a[1]) || a[0].localeCompare(b[0], 'ja')).slice(0,5);
    ui.salesByMenu.innerHTML = menuList.length ? menuList.map(([name,total])=> `<div class="quick-list-item"><span class="label">${escapeHtml(name)}</span><span class="amount">${formatYen(total)}</span></div>`).join('') : '<div class="muted-text">集計対象がありません。</div>';
  }

  function setQuickSalesError(message){
    const textMsg = escapeHtml(message || '売上を取得できませんでした。');
    if (ui.salesDailyStats) ui.salesDailyStats.innerHTML = `<div class="muted-text">${textMsg}</div>`;
    if (ui.salesMonthlyStats) ui.salesMonthlyStats.innerHTML = `<div class="muted-text">${textMsg}</div>`;
    if (ui.salesByStaff) ui.salesByStaff.innerHTML = `<div class="muted-text">${textMsg}</div>`;
    if (ui.salesByMenu) ui.salesByMenu.innerHTML = `<div class="muted-text">${textMsg}</div>`;
    const resetText = '今日 ¥0';
    if (ui.quickSalesToday) ui.quickSalesToday.textContent = resetText;
    if (ui.homeSalesToday) ui.homeSalesToday.textContent = resetText;
    if (ui.homeSalesMonth) ui.homeSalesMonth.textContent = '¥0';
    if (ui.homeSalesHighlight) ui.homeSalesHighlight.textContent = 'なし';
    if (ui.homeSalesChartBars) ui.homeSalesChartBars.innerHTML = `<div class="spark-empty">${textMsg}</div>`;
    if (ui.homeSalesChartLegend) ui.homeSalesChartLegend.textContent = message || '売上データがまだありません。';
    if (ui.homeSalesDetails){
      ui.homeSalesDetails.innerHTML = `<div class="muted-text">${textMsg}</div>`;
      ui.homeSalesDetails.dataset.hasData = '0';
    }
    updateHomeOverviewState();
  }

  function getTopSalesStaff(report){
    if (!report || !report.details) return null;
    const totals = new Map();
    Object.values(report.details).forEach(dayList=>{
      (dayList||[]).forEach(visit=>{
        const staff = normalizeStaffLabel(visit?.staff);
        const amount = Number(visit?.total || 0);
        if (!staff) return;
        totals.set(staff, (totals.get(staff)||0) + amount);
      });
    });
    if (!totals.size) return null;
    const [name, total] = Array.from(totals.entries()).sort((a,b)=> (b[1]-a[1]) || a[0].localeCompare(b[0], 'ja'))[0];
    return { name, total };
  }

  function buildSalesPayload(today, monthKey, storeId){
    let from = monthKey + '-01';
    const parts = monthKey.split('-').map(Number);
    if (parts.length === 2 && parts.every(n=> !Number.isNaN(n))){
      const start = new Date(parts[0], parts[1]-1, 1);
      from = toYMDLocal(start);
    }
    const payload = { from, to: today };
    if (storeId) payload.storeId = storeId;
    return payload;
  }

  function aggregateImportantNotes(list){
    const counts = new Map();
    (list||[]).forEach(note=>{
      if (!note?.Pinned) return;
      const targets = parseNoteAudience(note).filter(name=> !isGeneralKeyword(name));
      targets.forEach(name=>{
        const label = name || '（未設定）';
        counts.set(label, (counts.get(label)||0) + 1);
      });
    });
    return Array.from(counts.entries()).sort((a,b)=> (b[1]-a[1]) || a[0].localeCompare(b[0], 'ja'));
  }

  function getHomeNoteHighlight(list){
    if (!Array.isArray(list) || !list.length) return '';
    const pinned = list.find(note=> note?.Pinned);
    const general = list.find(note=> isGeneralNote(note));
    const candidate = pinned || general || list[0];
    const summary = summarizeNoteForHome(candidate);
    return summary ? `最新: ${summary}` : '';
  }

  function summarizeNoteForHome(note){
    if (!note) return '';
    const title = (note?.Title || '').trim();
    if (title) return title;
    const body = (note?.Body || '').replace(/\s+/g, ' ').trim();
    if (!body) return '';
    return body.length > 36 ? body.slice(0, 36) + '…' : body;
  }


  function renderQuickNoteCard(note){
    if (!note) return '';
    const title = (note.Title || '').trim() || '(無題)';
    const category = (note.Category || '').trim();
    const created = formatDateTimeLabel(note.CreatedAt);
    const body = (note.Body || '').trim();
    const metaParts = [];
    if (category) metaParts.push(category);
    if (created) metaParts.push(created);
    const metaText = metaParts.join(' / ');
    return `<div class="quick-note-card"><div class="note-title">${note.Pinned ? '📌 ' : ''}${escapeHtml(title)}</div>${metaText ? `<div class="note-meta">${escapeHtml(metaText)}</div>` : ''}${body ? `<div>${escapeHtml(body)}</div>` : ''}</div>`;
  }

  function parseNoteAudience(note){
    const raw = String(note?.Audience || '').trim();
    if (!raw) return [];
    return raw.split(/[、,，\/／・\s]+/).map(part=> part.trim()).filter(Boolean);
  }

  function isGeneralKeyword(name){
    const label = String(name||'').trim();
    if (!label) return false;
    const upper = label.toUpperCase();
    return upper === 'ALL' || upper === '全体' || upper === '全員' || upper === 'スタッフ全員';
  }

  function isGeneralNote(note){
    const targets = parseNoteAudience(note);
    if (!targets.length) return true;
    return targets.every(target => isGeneralKeyword(target));
  }

  function parseMinutes(value){
    if (value === null || value === undefined) return null;
    const str = String(value).trim();
    if (!str) return null;
    const match = str.match(/^(\d{1,2}):(\d{2})$/);
    if (match){
      const h = Number(match[1]);
      const m = Number(match[2]);
      if (Number.isNaN(h) || Number.isNaN(m)) return null;
      return h*60 + m;
    }
    const date = new Date(str);
    if (!Number.isNaN(date.getTime())){
      return date.getHours()*60 + date.getMinutes();
    }
    return null;
  }

  function formatHHMM(value){
    if (!value && value !== 0) return '';
    const parsed = parseMinutes(value);
    if (parsed == null) return String(value);
    return formatHHMMFromMinutes(parsed);
  }

  function formatHHMMFromMinutes(mins){
    if (mins == null || !isFinite(mins)) return '';
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  }

  function formatTimeRange(start, end){
    const s = formatHHMM(start);
    const e = formatHHMM(end);
    if (s && e) return `${s}〜${e}`;
    if (s) return s;
    if (e) return `〜${e}`;
    return '時刻未設定';
  }
  function formatChartDayLabel(date){
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = '日月火水木金土'[date.getDay()] || '';
    return `${month}/${day}${weekday ? `(${weekday})` : ''}`;
  }

  function formatAverage(value){
    if (!Number.isFinite(value)) return '0';
    const rounded = Math.round(value * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  }

  function toDateOnly(value){
    if (value instanceof Date){
      return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }
    const str = String(value ?? '').trim();
    if (!str) return null;
    const date = new Date(str);
    if (Number.isNaN(date.getTime())) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function formatCompactYen(value){
    const num = Number(value || 0);
    if (!Number.isFinite(num)) return '¥0';
    const abs = Math.abs(num);
    if (abs >= 100000000){
      return `¥${formatAverage(num / 100000000)}億`;
    }
    if (abs >= 10000){
      return `¥${formatAverage(num / 10000)}万`;
    }
    return formatYen(Math.round(num));
  }


  function normalizeYMDValue(value){
    if (!value && value !== 0) return '';
    if (value instanceof Date) return toYMDLocal(value);
    const str = String(value).trim();
    if (!str) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    const d = new Date(str);
    if (Number.isNaN(d.getTime())) return '';
    return toYMDLocal(d);
  }

  function toYMDLocal(date){
    if (!(date instanceof Date)) return '';
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth()+1).padStart(2,'0');
    const dd = String(date.getDate()).padStart(2,'0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function todayYMD(){
    const now = new Date();
    return toYMDLocal(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  }

  function normalizeStaffLabel(name){
    const str = String(name||'').trim();
    return str || '（未設定）';
  }

  function getServiceName(id){
    if (!id && id !== 0) return '';
    const key = String(id);
    return serviceMap.get(key)?.Name || '';
  }

  function getCustomerName(id){
    if (!id && id !== 0) return '';
    const key = String(id);
    return customersLiteMap.get(key)?.Name || '';
  }

  function formatDateTimeLabel(value){
    if (!value && value !== 0) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    const hh = String(d.getHours()).padStart(2,'0');
    const mi = String(d.getMinutes()).padStart(2,'0');
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  }

  // ===== ユーティリティ =====
  function el(tag, attrs={}, children=[]){
    const e=document.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=>{
      if(k==='class') e.className=v; else if(v!=null) e.setAttribute(k,v);
    });
    children.filter(x=>x!=null).forEach(c=> e.appendChild(typeof c==='string'?document.createTextNode(c):c));
    return e;
  }
  function elFrag(html){ const t=document.createElement('template'); t.innerHTML=html; return t.content; }
  function byId(id){ return document.getElementById(id); }
  function normalizeKeyword(value){
    return String(value || '')
      .toLowerCase()
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
      .replace(/[‐－―ー−]/g, '-')
      .trim();
  }
  function tokenizeKeyword(value){
    return normalizeKeyword(value).split(/\s+/).filter(Boolean);
  } 
  function fillSelect(select, items){
    if (!select) return;
    select.innerHTML='';
    (items||[]).forEach(i=>{
      const opt=document.createElement('option'); opt.value=i.value; opt.textContent=i.label; select.appendChild(opt);
    });
    if (!items || !items.length){ const opt=document.createElement('option'); opt.value=''; opt.textContent='選択してください'; select.appendChild(opt); }
  }
  function labelOf(select){ if (!select) return ''; const idx=select.selectedIndex; return idx>=0 ? select.options[idx].text : ''; }
  function msg(node, kind, text){ if (!node) return; node.className='msg'+(kind?(' '+kind):''); node.textContent=text||''; }
  function escapeHtml(str){ return (String(str||'')).replace(/[&<>"']/g, s=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[s])); }
  function formatDateJP(value){
    if (!value) return '-';
    const d = new Date(String(value)+'T00:00:00');
    if (!isNaN(d.getTime())){
      const label = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      return `${label}（${weekdayLabel(d)}）`;
    }
    return `${value}（${weekdayLabel(value)}）`;
  }
  function weekdayLabel(value){
    const names = ['日曜','月曜','火曜','水曜','木曜','金曜','土曜'];
    const d = value instanceof Date ? value : new Date(String(value)+'T00:00:00');
    if (isNaN(d.getTime())) return '-';
    return names[d.getDay()] || '-';
  }
  function formatYen(value){ const num = Number(value||0); if (!isFinite(num)) return '¥0'; return '¥' + num.toLocaleString('ja-JP'); }
  function shorten(str, max){ const s=String(str||''); return s.length>max? s.slice(0,max-1)+'…' : s; }
  function toDate(d){ try{ const x=new Date(d); return `${x.getFullYear()}/${x.getMonth()+1}/${x.getDate()}`; }catch(e){ return ''; } }
  function toggleBtn(btn, on){ if (!btn) return; btn.disabled=!!on; btn.style.opacity = on? .6 : 1; }

  function clearSearchInputs(){ if (ui.searchInput) ui.searchInput.value=''; }

  function clearContainer(root, opts){
    const keep = new Set((opts?.keepIds)||[]);
    if (!root) return;
    const els = root.querySelectorAll('input, textarea, select');
    els.forEach(el=>{
      if (keep.has(el.id)) return;
      if (el.tagName==='SELECT'){ el.selectedIndex = 0; }
      else if (el.type==='checkbox' || el.type==='radio'){ el.checked=false; }
      else { el.value=''; }
    });
  }

  function clearVisitForm(){
    if (!ui.recordForm) return;
    if (ui.petSelect) ui.petSelect.selectedIndex = 0;
    if (ui.serviceSelect) ui.serviceSelect.selectedIndex = 0;
    if (ui.qtyInput) ui.qtyInput.value = 1;
    if (ui.paymentSelect) ui.paymentSelect.selectedIndex = 0;
    if (ui.staffSelect) ui.staffSelect.selectedIndex = 0;
    if (ui.visitDate) ui.visitDate.valueAsDate = new Date();
    if (ui.notes) ui.notes.value = '';
  }

  // 空実装（互換）
  window.listStaff = window.listStaff || function(){};
  window.listPayments = window.listPayments || function(){};
  window.listStaffNotes = window.listStaffNotes || function(){};
  window.listReservations = window.listReservations || function(){};
  window.selectCustomer = window.selectCustomer || function(){};
  window.loadPets = window.loadPets || function(){};
  window.refreshVisits = window.refreshVisits || function(){};
  window.onSaveVisit = window.onSaveVisit || function(){};
  
  // === Firebase Authentication System ===

// Firebase configuration (環境変数で設定 - 機密情報なし)
 const firebaseConfig = {
  apiKey: "AIzaSyBlS4UBKJkixm-C-6VEzEZh0uW6COpCgP8",
  authDomain: "unite-e8567.firebaseapp.com",
  projectId: "unite-e8567",
  storageBucket: "unite-e8567.firebasestorage.app",
  messagingSenderId: "1010079914673",
  appId: "1:1010079914673:web:66048f89ee3da841ae6090",
  measurementId: "G-12BZYF52XS"
};

// ★ あや本人のメールアドレス（ここが鍵）
 const OWNER_EMAIL = "duffy.chocolate.aya@gmail.com";

// Firebase初期化
 let app, auth, db, functions;
 try {
  app = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  functions = firebase.functions();
} catch (error) {
  console.warn("Firebase initialization failed:", error);
}

// 認証状態管理
 let currentUser = null;
 let isAuthenticated = false;

// 認証状態の変更を監視
 if (auth) {
  auth.onAuthStateChanged(async (user) => {
    // 一旦リセット
    currentUser = null;
    isAuthenticated = false;

    if (user) {
      if (user.email === OWNER_EMAIL) {
        // ★ あや本人 → 使用OK
        currentUser = user;
        isAuthenticated = true;
      } else {
        // ★ 別のメールでログインしてきた → すぐ追い出す
        showNotification("このアカウントではアクセスできません", "error");
        try {
          await auth.signOut();
        } catch (e) {
          console.error("Force sign out error:", e);
        }
      }
    }

    updateAuthUI();
    updateFeatureAccess();
  });
}

// 認証UI更新
 function updateAuthUI() {
  const loginButton = document.getElementById("loginButton");
  const userInfo = document.getElementById("userInfo");
  const userName = document.getElementById("userName");

  if (isAuthenticated && currentUser) {
    if (loginButton) loginButton.style.display = "none";
    if (userInfo) userInfo.style.display = "flex";
    if (userName)
      userName.textContent = currentUser.displayName || currentUser.email;
  } else {
    if (loginButton) loginButton.style.display = "flex";
    if (userInfo) userInfo.style.display = "none";
  }
}

 // 機能アクセス制御
 function updateFeatureAccess() {
  const restrictedElements = document.querySelectorAll("[data-requires-auth]");
  restrictedElements.forEach((element) => {
    if (isAuthenticated) {
      element.classList.remove("disabled");
      element.removeAttribute("disabled");
    } else {
      element.classList.add("disabled");
      element.setAttribute("disabled", "true");
    }
  });
}

 // ログイン機能
 async function loginWithEmail(email, password) {
  try {
    const result = await auth.signInWithEmailAndPassword(email, password);
    hideAuthModal();
    showNotification("ログインしました", "success");
    return result.user;
  } catch (error) {
    console.error("Email login error:", error);
    showAuthError(getAuthErrorMessage(error.code));
    throw error;
  }
}

 async function loginWithGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    hideAuthModal();
    showNotification("ログインしました", "success");
    return result.user;
  } catch (error) {
    console.error("Google login error:", error);
    showAuthError(getAuthErrorMessage(error.code));
    throw error;
  }
}

// ログアウト機能
 async function logout() {
  try {
    await auth.signOut();
    showNotification("ログアウトしました", "info");
  } catch (error) {
    console.error("Logout error:", error);
    showNotification("ログアウトエラー", "error");
  }
}

// 認証が必要な操作のラッパー
 function requireAuth(callback) {
  return function (...args) {
    if (!isAuthenticated) {
      showAuthModal();
      return Promise.reject(new Error("認証が必要です"));
    }
    return callback.apply(this, args);
  };
}

// エラーメッセージ変換
 function getAuthErrorMessage(errorCode) {
  const errorMessages = {
    "auth/user-not-found": "ユーザーが見つかりません",
    "auth/wrong-password": "パスワードが正しくありません",
    "auth/invalid-email": "メールアドレスの形式が正しくありません",
    "auth/user-disabled": "このアカウントは無効になっています",
    "auth/too-many-requests":
      "試行回数が多すぎます。しばらく後でお試しください",
    "auth/network-request-failed": "ネットワークエラーが発生しました",
  };
  return errorMessages[errorCode] || "ログインエラーが発生しました";
}

// モーダル表示/非表示
 function showAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }
}

 function hideAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) {
    modal.hidden = true;
    document.body.style.overflow = "";
  }
}

// エラー表示
 function showAuthError(message) {
  const errorElement = document.getElementById("authError");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
    setTimeout(() => {
      errorElement.style.display = "none";
    }, 5000);
  }
}

// 通知表示
 function showNotification(message, type = "info") {
  console.log(`${type.toUpperCase()}: ${message}`);
}

  
  // === Sophisticated Glass-morphism UI Initialization ===
  
  // Initialize Feather icons for unified line icon system
  if (typeof feather !== 'undefined') {
    feather.replace({
      'stroke-width': 1.5,
      'width': 20,
      'height': 20
    });
  }
  
  // Apply priority classes to cards based on importance
  function applyCardPriority() {
    // High priority cards (reservations, sales)
    const highPrioritySelectors = [
      '[data-tab="calendar"]',
      '[data-tab="billing"]',
      '.home-tile[data-home-shortcut="1"]'
    ];
    
    highPrioritySelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el.classList.contains('home-tile') || el.classList.contains('status-button')) {
          el.classList.add('priority-high');
        }
      });
    });
    
    // Low priority cards (auxiliary functions)
    const lowPrioritySelectors = [
      '[data-tab="settings"]',
      '[data-tab="board"]'
    ];
    
    lowPrioritySelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el.classList.contains('home-tile') || el.classList.contains('nav-icon')) {
          el.classList.add('priority-low');
        }
      });
    });
  }
  
  // 認証関連のイベントハンドラー設定
  function setupAuthEventListeners() {
    // ログインボタン
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
      loginButton.addEventListener('click', showAuthModal);
    }
    
    // ログアウトボタン
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
      logoutButton.addEventListener('click', logout);
    }
    
    // モーダル閉じるボタン
    const closeAuthModal = document.getElementById('closeAuthModal');
    if (closeAuthModal) {
      closeAuthModal.addEventListener('click', hideAuthModal);
    }
    
    // モーダル外クリックで閉じる
    const authModal = document.getElementById('authModal');
    if (authModal) {
      authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
          hideAuthModal();
        }
      });
    }
    
    // 認証タブ切り替え
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetTab = e.target.dataset.tab;
        switchAuthTab(targetTab);
      });
    });
    
    // メールログインフォーム
    const emailForm = document.getElementById('emailLoginForm');
    if (emailForm) {
      emailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
          await loginWithEmail(email, password);
        } catch (error) {
          // エラーは loginWithEmail 内で処理
        }
      });
    }
    
    // Googleログインボタン
    const googleLoginButton = document.getElementById('googleLoginButton');
    if (googleLoginButton) {
      googleLoginButton.addEventListener('click', loginWithGoogle);
    }
    
    // 制限された操作にガードを追加
    addAuthGuards();
  }
  
  // 認証タブ切り替え
  function switchAuthTab(activeTab) {
    // タブボタンの状態更新
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === activeTab);
    });
    
    // コンテンツの表示/非表示
    document.getElementById('emailAuth').style.display = activeTab === 'email' ? 'block' : 'none';
    document.getElementById('googleAuth').style.display = activeTab === 'google' ? 'block' : 'none';
  }
  
  // 認証ガードをボタンに追加
  function addAuthGuards() {
    // 機能ボタンに認証要求属性を追加
    const restrictedSelectors = [
      '[data-tab="record"]',
      '[data-tab="directory"]', 
      '[data-tab="customer"]',
      '[data-tab="pet"]',
      '[data-tab="calendar"]',
      '[data-tab="merch"]',
      '[data-tab="events"]',
      '[data-tab="ops"]',
      '[data-tab="billing"]',
      '[data-tab="notes"]',
      '[data-tab="board"]',
      '[data-home-shortcut]',
      '.status-button'
    ];
    
    restrictedSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.setAttribute('data-requires-auth', 'true');
        
        // 既存のクリックイベントを認証ガードでラップ
        const originalHandler = element.onclick;
        element.onclick = function(e) {
          if (!isAuthenticated) {
            e.preventDefault();
            e.stopPropagation();
            showAuthModal();
            return false;
          }
          
          if (originalHandler) {
            return originalHandler.call(this, e);
          }
        };
        
        // addEventListener で登録されたイベントもガード
        const originalAddEventListener = element.addEventListener;
        element.addEventListener = function(type, listener, options) {
          if (type === 'click') {
            const guardedListener = function(e) {
              if (!isAuthenticated) {
                e.preventDefault();
                e.stopPropagation();
                showAuthModal();
                return;
              }
              listener.call(this, e);
            };
            return originalAddEventListener.call(this, type, guardedListener, options);
          }
          return originalAddEventListener.call(this, type, listener, options);
        };
      });
    });
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    applyCardPriority();
    setupAuthEventListeners();
    
    // Featherアイコンを再初期化（認証UIのアイコン用）
    if (typeof feather !== 'undefined') {
      setTimeout(() => feather.replace(), 100);
    }
  });
  
})(); /* IIFE */

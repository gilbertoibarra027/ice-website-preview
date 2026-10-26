/* I.C.E. site scripts — no dependencies. */
(function(){
  document.documentElement.classList.remove('no-js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu
  var btn = document.querySelector('.menu-btn'), menu = document.getElementById('nav-menu');
  if(btn && menu){
    btn.addEventListener('click', function(){
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('open', !open);
    });
    menu.querySelectorAll('a[href^="#"]').forEach(function(a){ a.addEventListener('click', function(){ if(menu.classList.contains('open')) btn.click(); }); });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && menu.classList.contains('open')){ btn.click(); btn.focus(); }
    });
  }

  // Scroll reveal
  var els = document.querySelectorAll('.reveal');
  if(!reduce && 'IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    }, {threshold:.12, rootMargin:'0px 0px -40px 0px'});
    els.forEach(function(el){ io.observe(el); });
  } else { els.forEach(function(el){ el.classList.add('in'); }); }

  // I.C.E. system diagram
  document.querySelectorAll('[data-system]').forEach(function(sys){
    var cap = sys.parentElement.querySelector('.system-caption');
    var nodes = sys.querySelectorAll('.node');
    var def = cap ? cap.innerHTML : '';
    function set(node){
      nodes.forEach(function(n){ n.classList.toggle('active', n === node); });
      sys.querySelectorAll('.link').forEach(function(l){
        var on = node && l.dataset.pair.indexOf(node.dataset.key) > -1;
        l.style.stroke = on ? node.dataset.color : '';
        l.style.strokeWidth = on ? 3 : '';
      });
      if(cap) cap.innerHTML = node ? '<strong>' + node.dataset.title + '</strong><p>' + node.dataset.desc + '</p>' : def;
    }
    nodes.forEach(function(n){
      n.addEventListener('mouseenter', function(){ set(n); });
      n.addEventListener('focus', function(){ set(n); });
      n.addEventListener('click', function(){ set(n); });
      n.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); set(n); } });
    });
    sys.addEventListener('mouseleave', function(){ set(null); });
  });

  // Tabs (method page)
  document.querySelectorAll('[role="tablist"]').forEach(function(list){
    var tabs = list.querySelectorAll('[role="tab"]');
    function select(t){
      tabs.forEach(function(x){
        var on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
        document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
      });
    }
    tabs.forEach(function(t, i){
      t.addEventListener('click', function(){ select(t); });
      t.addEventListener('keydown', function(e){
        var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if(k){ var n = tabs[(i + k + tabs.length) % tabs.length]; select(n); n.focus(); }
      });
    });
  });

  // Contact form — client-side validation only.
  // TODO(integration): set FORM_ENDPOINT to your Formspree / CRM / ESP endpoint and flip LIVE to true.
  var FORM_ENDPOINT = 'https://formspree.io/f/xyeeezdg';
  var LIVE = true;
  var form = document.getElementById('contact-form');
  if(form){
    var rules = {
      name: function(v){ return v.trim().length >= 2 || 'Please enter your name.'; },
      email: function(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Please enter a valid email address.'; },
      topic: function(v){ return !!v || 'Please choose a topic.'; },
      message: function(v){ return v.trim().length >= 10 || 'Please write a short message (10+ characters).'; },
      consent: function(v, el){ return el.checked || 'Please confirm you agree to be contacted.'; }
    };
    function check(el){
      var r = rules[el.name]; if(!r) return true;
      var res = r(el.value, el), field = el.closest('.field') || el.closest('.check'), err = document.getElementById(el.name + '-err');
      if(res === true){ field.removeAttribute('data-invalid'); el.removeAttribute('aria-invalid'); if(err) err.textContent=''; return true; }
      field.setAttribute('data-invalid',''); el.setAttribute('aria-invalid','true'); if(err) err.textContent = res; return false;
    }
    Object.keys(rules).forEach(function(n){
      var el = form.elements[n];
      el.addEventListener('blur', function(){ check(el); });
      el.addEventListener('change', function(){ if(el.hasAttribute('aria-invalid')) check(el); });
    });
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if(form.elements.company_website.value){ return; } // honeypot: silently drop bots
      var first = null;
      Object.keys(rules).forEach(function(n){ var el = form.elements[n]; if(!check(el) && !first) first = el; });
      if(first){ first.focus(); return; }
      if(LIVE){
        fetch(FORM_ENDPOINT, {method:'POST', body:new FormData(form), headers:{Accept:'application/json'}})
          .then(function(r){ if(!r.ok) throw 0; done(); })
          .catch(function(){ alert('Something went wrong. Please try again later.'); });
      } else { done(); }
    });
    function done(){
      var box = document.getElementById('form-success');
      form.hidden = true; box.hidden = false; box.focus();
    }
  }

  var y = document.getElementById('year'); if(y) y.textContent = new Date().getFullYear();
})();

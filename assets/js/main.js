(function(){
  // page-load entrance
  var mark=function(){document.body.classList.add('loaded');};
  if(document.readyState==='complete')mark();else window.addEventListener('load',mark);
  document.body.classList.add('loaded');

  // header scrolled state
  var hdr=document.querySelector('.site-header');
  if(hdr){
    var onScroll=function(){hdr.classList.toggle('scrolled',window.scrollY>20);};
    onScroll();window.addEventListener('scroll',onScroll,{passive:true});
  }

  // mobile menu
  var tog=document.querySelector('.menu-toggle');
  if(tog){
    tog.addEventListener('click',function(){
      var open=document.body.classList.toggle('menu-open');
      tog.setAttribute('aria-expanded',open?'true':'false');
    });
    document.querySelectorAll('.mobile-panel a').forEach(function(a){
      a.addEventListener('click',function(){document.body.classList.remove('menu-open');});
    });
  }

  // scroll reveal
  var reveals=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
    },{threshold:.16});
    reveals.forEach(function(el){io.observe(el);});
  }else{
    reveals.forEach(function(el){el.classList.add('in');});
  }

  // contact form -> mailto (no backend; keeps it honest)
  var form=document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit',function(ev){
      ev.preventDefault();
      var d=new FormData(form);
      var lines=[];
      d.forEach(function(v,k){lines.push(k+'：'+v);});
      var body=encodeURIComponent(lines.join('\n'));
      var subject=encodeURIComponent('官网合作需求 - '+(d.get('公司名称')||''));
      window.location.href='mailto:business@bizuogehao.com?subject='+subject+'&body='+body;
    });
  }
})();

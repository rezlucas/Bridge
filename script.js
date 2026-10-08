(function(){
  // Menu mobile
  var top=document.getElementById('top'), menuBtn=top&&top.querySelector('.menu-btn');
  if(menuBtn){
    var setMenu=function(open){top.classList.toggle('open',open);menuBtn.setAttribute('aria-expanded',open);menuBtn.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');};
    menuBtn.addEventListener('click',function(){setMenu(!top.classList.contains('open'));});
    document.getElementById('menu').addEventListener('click',function(e){if(e.target.closest('a'))setMenu(false);});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&top.classList.contains('open')){setMenu(false);menuBtn.focus();}});
    document.addEventListener('click',function(e){if(top.classList.contains('open')&&!top.contains(e.target))setMenu(false);});
  }

  // Vídeo: carrega o player do YouTube só ao clicar
  var play=document.getElementById('play');
  if(play){
    play.addEventListener('click',function(){
      var f=document.createElement('iframe');
      f.src='https://www.youtube-nocookie.com/embed/NggeLcQHzAI?autoplay=1&rel=0&playsinline=1';
      f.title='Após 10 anos, nossa primeira turma de alunos está se formando na universidade';
      f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.referrerPolicy='strict-origin-when-cross-origin';
      f.allowFullscreen=true;
      this.replaceWith(f);
      f.focus();
    });
  }

  // Inscrição: registra o lead na planilha e segue para o pagamento
  var form=document.getElementById('lead-form');
  if(form){
    var erro=document.getElementById('lead-erro'), btn=document.getElementById('lead-submit'), btnHtml=btn.innerHTML;
    var campos=['nome','email','telefone','empresa','cargo'];
    var val=function(n){return (form.elements[n].value||'').trim();};
    var valido=function(n,v){
      if(!v) return false;
      if(n==='email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if(n==='telefone') return v.replace(/\D/g,'').length>=10;
      return true;
    };
    form.addEventListener('input',function(e){if(e.target.getAttribute('aria-invalid')==='true'&&valido(e.target.name,e.target.value.trim()))e.target.setAttribute('aria-invalid','false');});
    window.addEventListener('pageshow',function(){btn.disabled=false;btn.innerHTML=btnHtml;});
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var primeiro=null;
      campos.forEach(function(n){var ok=valido(n,val(n));form.elements[n].setAttribute('aria-invalid',ok?'false':'true');if(!ok&&!primeiro)primeiro=form.elements[n];});
      if(primeiro){erro.hidden=false;primeiro.focus();return;}
      erro.hidden=true;btn.disabled=true;btn.textContent='Indo para o pagamento…';
      var checkout=form.getAttribute('data-checkout'), endpoint=form.getAttribute('data-leads-endpoint');
      var seguir=function(){window.location.href=checkout;};
      if(!endpoint){seguir();return;}
      var dados=new URLSearchParams();
      campos.forEach(function(n){dados.append(n,val(n));});
      var q=new URLSearchParams(window.location.search);
      ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(function(k){if(q.get(k))dados.append(k,q.get(k));});
      dados.append('pagina',window.location.href.split('#')[0]);
      // O pagamento nunca fica esperando a planilha: no máximo 2,5 s
      var envio=fetch(endpoint,{method:'POST',mode:'no-cors',keepalive:true,body:dados}).catch(function(){});
      Promise.race([envio,new Promise(function(r){setTimeout(r,2500);})]).then(seguir);
    });
  }
})();

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

  // Inscrição: registra o lead na planilha e abre o WhatsApp da equipe para confirmar a vaga
  var form=document.getElementById('lead-form');
  if(form){
    var erro=document.getElementById('lead-erro'), btn=document.getElementById('lead-submit'), btnHtml=btn.innerHTML;
    var obrigatorios=['nome','empresa','cargo','email','telefone'];
    var enviados=['nome','empresa','cargo','setor','email','telefone','perfil','perfil_outro'];
    var perfil=form.elements.perfil, outroCampo=document.getElementById('lead-perfil-outro-campo'), outro=form.elements.perfil_outro;
    perfil.addEventListener('change',function(){var on=perfil.value==='Outro';outroCampo.hidden=!on;outro.required=on;if(on){outro.focus();}else{outro.value='';outro.setAttribute('aria-invalid','false');}});
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
      var campos=obrigatorios.concat(perfil.value==='Outro'?['perfil_outro']:[]);
      campos.forEach(function(n){var ok=valido(n,val(n));form.elements[n].setAttribute('aria-invalid',ok?'false':'true');if(!ok&&!primeiro)primeiro=form.elements[n];});
      if(primeiro){erro.hidden=false;primeiro.focus();return;}
      erro.hidden=true;btn.disabled=true;btn.textContent='Abrindo o WhatsApp…';
      var endpoint=form.getAttribute('data-leads-endpoint'), fone=form.getAttribute('data-whatsapp');
      var perfilTxt=perfil.value==='Outro'?'Outro: '+val('perfil_outro'):perfil.value;
      var msg='Olá, Michele. Acabei de preencher o formulário do BRIDGE (24 e 25 nov 2026) e gostaria de reservar minha vaga na lista de seleção.\n\n'+
        'Nome: '+val('nome')+'\nEmpresa: '+val('empresa')+'\nCargo: '+val('cargo')+(val('setor')?'\nSetor: '+val('setor'):'')+
        '\nE-mail: '+val('email')+'\nTelefone: '+val('telefone')+'\nPerfil: '+perfilTxt;
      var seguir=function(){window.location.href='https://wa.me/'+fone+'?text='+encodeURIComponent(msg);};
      if(!endpoint){seguir();return;}
      var dados=new URLSearchParams();
      enviados.forEach(function(n){dados.append(n,val(n));});
      var q=new URLSearchParams(window.location.search);
      ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(function(k){if(q.get(k))dados.append(k,q.get(k));});
      dados.append('pagina',window.location.href.split('#')[0]);
      // O WhatsApp nunca fica esperando a planilha: no máximo 2,5 s
      var envio=fetch(endpoint,{method:'POST',mode:'no-cors',keepalive:true,body:dados}).catch(function(){});
      Promise.race([envio,new Promise(function(r){setTimeout(r,2500);})]).then(seguir);
    });
  }

  // Barra fixa "Garantir minha vaga": aparece depois da capa e some na inscrição
  var bar=document.getElementById('sticky-cta'), hero=document.getElementById('topo'), insc=document.getElementById('inscricao');
  if(bar&&hero&&insc&&'IntersectionObserver' in window){
    var heroVisivel=true, inscVisivel=false, barBtn=bar.querySelector('a');
    var atualizar=function(){
      var on=!heroVisivel&&!inscVisivel;
      bar.classList.toggle('on',on);document.body.classList.toggle('cta-on',on);
      bar.setAttribute('aria-hidden',on?'false':'true');barBtn.tabIndex=on?0:-1;
    };
    new IntersectionObserver(function(es){heroVisivel=es[0].isIntersecting;atualizar();}).observe(hero);
    new IntersectionObserver(function(es){inscVisivel=es[0].isIntersecting;atualizar();},{threshold:.15}).observe(insc);
  }
})();

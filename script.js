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
})();

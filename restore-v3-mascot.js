/* Exact V3 mascot markup; previous user-approved removal of location label retained. */
(()=>{
 const html='<div class="hero-doodle"></div><div class="hero-star">✳</div><div class="main-character"><span class="eyes">◉ ◉</span><span class="mouth">oh, hello.</span></div><div class="floating-sticky sticker-a">47 tabs open.<br>One actual idea.</div><div class="floating-sticky sticker-b">Strategy, but<br>with personality.</div><div class="floating-sticky sticker-c">No generic<br>“synergy” pls.</div>';
 function restore(){
  const v=document.querySelector('.home-hero.home-hero-editorial .hero-visual');
  if(!v)return;
  v.classList.remove('ah-visual','hero-visual-approved');
  v.classList.add('v3-original-mascot');
  v.innerHTML=html;
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restore,{once:true});else restore();
})();
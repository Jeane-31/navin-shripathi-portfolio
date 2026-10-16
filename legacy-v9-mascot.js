/* Restored exactly from the deployed 2026-10-09 V9 mascot component.
   Original V9 CSS and global styles provide the animation. */
(() => {
 const restore=()=>{
  const v=document.querySelector('.home-hero.home-hero-editorial .hero-visual');
  if(!v)return;
  v.classList.remove('hero-visual-approved');
  v.classList.add('ah-visual');
  v.innerHTML='<div class="hero-doodle"></div><div class="hero-star">✳</div><div class="main-character"><div class="ah-eyes"><span></span><span></span></div><span class="mouth">oh, hello.</span></div><div class="floating-sticky sticker-a">47 tabs open.<br>One actual idea.</div><div class="floating-sticky sticker-b">Strategy, but<br>with personality.</div><div class="floating-sticky sticker-c">No generic<br>“synergy” pls.</div><span class="ah-bling"></span>';
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restore,{once:true});else restore();
})();
/* V13: approved homepage with one hand-drawn SVG arrow; no dynamic curves. */
(() => {
  function setup() {
    const section = document.querySelector('.home-hero.home-hero-editorial');
    const heading = section?.querySelector('.hero-words h1');
    const visual = section?.querySelector('.hero-visual');
    if (!heading || !visual) return;
    heading.className = 'approved-hero-title';
    heading.setAttribute('aria-label', 'I turn 3 sec attention into interest. And interest into intent');
    heading.innerHTML = '<span class="approved-line approved-line-1">I turn <span class="approved-3sec">3 sec<i class="three-spark" aria-hidden="true"></i></span></span><span class="approved-line approved-line-2"><span class="approved-attention">attention</span> into</span><span class="approved-line approved-line-3"><span class="approved-interest">interest.</span><svg class="hero-crafted-arrow" viewBox="0 0 140 130" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><path d="M 7 17 C 64 0, 103 30, 101 67 C 100 86, 86 99, 79 107"/><path d="M 72 91 L 79 107 L 95 101"/></svg></span><span class="approved-line approved-line-4">And interest <em class="approved-intent">into intent</em></span>';
    visual.classList.add('hero-visual-approved');
    visual.innerHTML = '<div class="hero-doodle"></div><div class="hero-star">✳</div><div class="main-character"><div class="approved-eyes"><span class="approved-eye"></span><span class="approved-eye"></span></div><span class="mouth">oh, hello.</span></div><div class="floating-sticky sticker-a">47 tabs open.<br>One actual idea.</div><div class="floating-sticky sticker-b">Strategy, but<br>with personality.</div><div class="floating-sticky sticker-c">No generic<br>“synergy” pls.</div><span class="hero-bling" aria-hidden="true"></span>';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, {once:true});
  else setup();
})();
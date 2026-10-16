/* V14 selected-work and Harihar showcase enhancement; all other pages untouched. */
(() => {
 function apply(){
  // The selected-work title is now authored directly by app.js as a fixed two-line heading.
  const art=document.querySelector('.takeover[aria-labelledby="client-harihar"] .takeover-art');
  if(!art)return;
  art.classList.add('v14-approval-art');
  art.innerHTML='<div class="art-gridword">HARIHAR</div><div class="orbit orbit-a"></div><div class="orbit orbit-b"></div><div class="floating-note note-a">The approval department</div><div class="floating-note note-b">Safalam Luxuria</div><div class="media-stage primary v14-brand-stage"><img src="./assets/safalam-clean.webp" alt="Safalam Luxuria branding poster with Kasindra and phone number removed" loading="lazy" decoding="async"></div><div class="media-stage secondary v14-papa-stage"><div class="video-surface" data-video-id="papa-reel"><video class="portfolio-video js-portfolio-video" aria-label="Papa Approve Karse campaign reel" autoplay muted loop playsinline webkit-playsinline preload="metadata" poster="./assets/papa-reel-still.jpg"><source src="./assets/papa-reel.mp4" type="video/mp4">Your browser does not support this video.</video><button type="button" class="video-sound-button js-video-sound" aria-label="Unmute this reel" aria-pressed="false">🔇 <span>Sound</span></button></div></div><div class="v14-brand-signatures"><img src="./assets/sammoda-mark.webp" alt="Sammoda Grandeur" loading="lazy"><span aria-hidden="true"></span><img src="./assets/harihar-mark.webp" alt="Harihar Realty" loading="lazy"></div><div class="stage-caption">No crop. No cheating. The original artwork stays original.</div>';
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();

(()=>{'use strict';
const db=window.PORTFOLIO_DATA;if(!db)return;
const body=document.body,page=body.dataset.page||'home',slug=body.dataset.slug||'',root=body.dataset.root||'./';
const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)];
const clientMap=Object.fromEntries(db.clients.map(c=>[c.slug,c]));
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
const storage={get(k,f=null){try{const v=localStorage.getItem(k);return v===null?f:v}catch(e){return f}},set(k,v){try{localStorage.setItem(k,String(v))}catch(e){}}};
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const categoryOf=c=>/Education|Edtech|Career Services/i.test(c.category)?'Education & Services':/Genomics|Diagnostics|Healthcare/i.test(c.category)?'Science & Health':/Jewellery|Furniture|Interiors|E-commerce/i.test(c.category)?'Lifestyle & Commerce':/Construction Materials|Infrastructure/i.test(c.category)?'Materials & Industry':'Property & Places';

class SoundDirector{
  constructor(){
    const remembered=storage.get('navin-sound-mode',storage.get('navin-v3-sound')==='yes'?'full':'off');
    this.mode=remembered==='off'?'off':'full';
    this.volume=Math.max(.68,Math.min(1,Number(storage.get('navin-sound-volume','.68'))||.68));
    this.ctx=null;this.master=null;this.lastHover=0;this.scrollStep=0;this.pulseTimer=null;
  }
  ensure(){
    if(!this.ctx){
      const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
      this.ctx=new AC();this.master=this.ctx.createGain();this.master.gain.value=this.volume*.30;
      const compressor=this.ctx.createDynamicsCompressor();compressor.threshold.value=-16;compressor.knee.value=18;compressor.ratio.value=5;compressor.attack.value=.003;compressor.release.value=.2;
      this.master.connect(compressor);compressor.connect(this.ctx.destination);
    }
    if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});
    return true;
  }
  output(pan=0){
    if(!this.ensure())return null;
    if(this.ctx.createStereoPanner){const p=this.ctx.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,pan));p.connect(this.master);return p}
    return this.master;
  }
  tone(freq=520,duration=.09,opts={}){
    if(this.mode==='off'&&!opts.force)return;
    const out=this.output(opts.pan||0);if(!out)return;
    clearTimeout(this.pulseTimer);body.classList.add('sound-pulse');this.pulseTimer=setTimeout(()=>body.classList.remove('sound-pulse'),100);
    const now=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();
    o.type=opts.type||'sine';o.frequency.setValueAtTime(freq,now);if(opts.to)o.frequency.exponentialRampToValueAtTime(Math.max(40,opts.to),now+duration);
    const level=opts.level||.15;g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(level,now+(opts.attack||.008));g.gain.exponentialRampToValueAtTime(.0001,now+duration);
    o.connect(g);g.connect(out);o.start(now);o.stop(now+duration+.02);
  }
  click(force=false){this.tone(520,.075,{to:650,type:'sine',level:.13,force});this.tone(1040,.045,{type:'triangle',level:.045,force})}
  hover(){const now=performance.now();if(this.mode!=='full'||now-this.lastHover<95)return;this.lastHover=now;this.tone(760,.038,{to:820,level:.035,pan:-.08})}
  scroll(direction=1){if(this.mode!=='full')return;this.scrollStep=(this.scrollStep+1)%4;this.tone(155+this.scrollStep*12,.045,{to:direction>0?190:135,type:'sine',level:.032,pan:this.scrollStep%2?.18:-.18})}
  swipe(direction=1){if(this.mode==='off')return;const pan=direction>0?.72:-.72;this.tone(direction>0?310:420,.17,{to:direction>0?620:230,type:'triangle',level:.11,pan});setTimeout(()=>this.tone(direction>0?760:590,.07,{type:'sine',level:.07,pan}),55)}
  success(){if(this.mode==='off')return;[659,784,988].forEach((n,i)=>setTimeout(()=>this.tone(n,.13,{type:i===2?'triangle':'sine',level:.1,pan:(i-1)*.25}),i*58))}
  signature(client=slug,force=false){
    if(this.mode==='off'&&!force)return;
    const scales={arsh:[294,440,587],aaryahi:[523,659,880],harihar:[330,392,523],sangath:[262,392,494],evara:[349,523,698],ab:[220,330,440]};
    const key=client||'navin',hash=[...key].reduce((n,c)=>n+c.charCodeAt(0),0),notes=scales[key]||[220+(hash%7)*22,330+(hash%5)*28,494+(hash%3)*37];
    notes.forEach((n,i)=>setTimeout(()=>this.tone(n,.18,{type:i===1?'triangle':'sine',level:.09,pan:(i-1)*.34,force}),i*82));
    reactMascot('heard that ✳');
  }
  setMode(mode){this.mode=mode==='off'?'off':'full';storage.set('navin-sound-mode',this.mode);storage.set('navin-v3-sound',this.mode==='off'?'no':'yes');syncSoundUI();if(this.mode==='full')this.click(true)}
}
const sounds=new SoundDirector();window.NavinSound=sounds;

let mascot=null,mascotBubble=null,idleTimer=null,sleepTimer=null;
const roleCopy={home:['Idea wrangler','brief? nice.'],library:['Multiverse guide','pick a world.'],method:['Chaos organiser','there is a method.'],about:['Human footnote','yes, the tabs are real.'],contact:['Inbox wingman','send the interesting one.'],case:['World tour guide','look closer.'],'404':['Lost-page scout','this is not the page.']};
function buildMascot(){
  let [role,line]=roleCopy[page]||roleCopy.case;
  if(page==='case'&&clientMap[slug]){role=clientMap[slug].name+' guide';line=(clientMap[slug].theme?.label||'look closer.').toLowerCase()}
  if(page==='home'&&$('.main-character')){
    mascot=$('.main-character');const mouth=$('.mouth',mascot);if(mouth)mouth.textContent=line;
    const tag=document.createElement('span');tag.className='mascot-role';tag.textContent=role;mascot.appendChild(tag);
    mascot.setAttribute('role','button');mascot.tabIndex=0;mascot.setAttribute('aria-label',role+'. Play this page’s sound.');
  }else{
    const wrap=document.createElement('div');wrap.className='page-mascot';wrap.innerHTML=`<button type="button" class="page-mascot-face" aria-label="${escapeHTML(role)}. Play this page’s sound."><span class="mini-eyes">◉ ◉</span><span class="mini-mouth">${escapeHTML(line)}</span></button><span class="page-mascot-role">${escapeHTML(role)}</span><span class="mascot-bubble" aria-live="polite"></span>`;body.appendChild(wrap);mascot=$('.page-mascot-face',wrap);mascotBubble=$('.mascot-bubble',wrap);
  }
  mascot?.addEventListener('click',()=>{if(sounds.mode==='off'){wakeMascot('sound is off — switch it on up top.');return}sounds.signature(slug||page);wakeMascot('my tiny theme song.');});
  mascot?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();mascot.click()}});
  resetIdle();
  ['pointerdown','keydown','scroll'].forEach(event=>window.addEventListener(event,resetIdle,{passive:true}));
}
function resetIdle(){if(!mascot)return;clearTimeout(idleTimer);clearTimeout(sleepTimer);mascot.classList.remove('is-curious','is-dozing');idleTimer=setTimeout(()=>{mascot?.classList.add('is-curious');sayMascot(page==='case'?'the next card remembers you.':'still here. still curious.')},11000);sleepTimer=setTimeout(()=>{mascot?.classList.remove('is-curious');mascot?.classList.add('is-dozing');sayMascot('resting one tab.')},24000)}
function sayMascot(text){if(!mascotBubble&&mascot){mascotBubble=document.createElement('span');mascotBubble.className='mascot-bubble';mascot.appendChild(mascotBubble)}if(!mascotBubble)return;mascotBubble.textContent=text;mascotBubble.classList.add('is-visible');setTimeout(()=>mascotBubble?.classList.remove('is-visible'),2600)}
function wakeMascot(text){if(!mascot)return;resetIdle();mascot.classList.add('is-reacting');sayMascot(text);setTimeout(()=>mascot?.classList.remove('is-reacting'),520)}
function reactMascot(text='nice sound choice.'){wakeMascot(text)}

function buildSoundToggle(){
  const old=$('#sound-toggle');if(!old)return;
  const button=old.cloneNode(true);old.replaceWith(button);button.removeAttribute('aria-haspopup');button.removeAttribute('aria-expanded');
  button.addEventListener('click',()=>{const turnOn=sounds.mode==='off';sounds.setMode(turnOn?'full':'off');wakeMascot(turnOn?'full sound. full personality.':'quiet mode activated.')});
  syncSoundUI();
}
function syncSoundUI(){
  const button=$('#sound-toggle'),on=sounds.mode==='full';body.classList.toggle('sound-is-on',on);if(button){button.dataset.mode=sounds.mode;button.textContent=on?'♫ Sound on':'♩ Sound off';button.setAttribute('aria-label',on?'Turn full sound off':'Turn full sound on');button.setAttribute('aria-pressed',String(on))}
}

function bindGlobalSounds(){
  let lastY=scrollY,lastTickY=scrollY;
  window.addEventListener('scroll',()=>{const y=scrollY;if(Math.abs(y-lastTickY)>=145){sounds.scroll(y>lastY?1:-1);lastTickY=y}lastY=y},{passive:true});
  document.addEventListener('portfolio:deckchange',e=>sounds.swipe(Math.sign(e.detail?.delta||1)));
  document.addEventListener('click',e=>{const target=e.target.closest('a,button,[role="button"]');if(!target||target.id==='sound-toggle'||target.closest('.main-character,.page-mascot'))return;sounds.click()});
  document.addEventListener('pointerover',e=>{const target=e.target.closest('a,button,.shuffle-card,.library-tile');if(target&&!target.contains(e.relatedTarget))sounds.hover()});
  document.addEventListener('portfolio:legacy-chime',e=>{if(sounds.mode!=='off')sounds.tone(e.detail?.frequency||520,.08,{to:(e.detail?.frequency||520)*1.12,level:.06})});
}

const visitorRoutes={
  hiring:{label:'I’m hiring',title:'Start with the range.',body:'See how strategy stays connected to scripts, shoots, campaigns and the people making them.',links:[['Selected worlds','#selected'],['How I work','#method'],['The human',root+'about.html']]},
  brand:{label:'I have a brand',title:'Start with the knot.',body:'Bring the messy brief. The route moves from the real audience problem to a campaign system that can survive production.',links:[['The method',root+'method.html'],['Property world',root+'clients/harihar.html'],['Send the brief',root+'contact.html']]},
  agency:{label:'I run an agency',title:'Start with the overlap.',body:'Strategy, creative direction and delivery can plug into a wider team without disappearing after the deck.',links:[['Capabilities',root+'about.html'],['Client multiverse',root+'library.html'],['Open a conversation',root+'contact.html']]},
  browse:{label:'Show me the work',title:'No preamble. Pick a world.',body:'Jump into the selected stories, then open the wider client universe when curiosity wins.',links:[['Selected worlds','#selected'],['Every client',root+'library.html'],['Surprise me','#selected']]}
};
function buildVisitorRoutes(){
  if(page!=='home')return;const hero=$('.home-hero');if(!hero)return;
  const section=document.createElement('section');section.className='visitor-routes';section.setAttribute('aria-labelledby','route-title');
  section.innerHTML=`<div class="route-intro"><span class="eyebrow">Choose your own way in</span><h2 id="route-title">What brought you here?</h2><p>The same portfolio, edited around the question already in your head.</p></div><div class="route-choices">${Object.entries(visitorRoutes).map(([key,r])=>`<button type="button" data-route="${key}">${escapeHTML(r.label)} <span>↗</span></button>`).join('')}</div><div class="route-result" aria-live="polite"></div>`;
  hero.insertAdjacentElement('afterend',section);
  const show=key=>{const r=visitorRoutes[key]||visitorRoutes.browse,result=$('.route-result',section);storage.set('navin-visitor-route',key);$$('[data-route]',section).forEach(b=>{const on=b.dataset.route===key;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});result.innerHTML=`<div><span>${escapeHTML(r.label)}</span><h3>${escapeHTML(r.title)}</h3><p>${escapeHTML(r.body)}</p></div><nav aria-label="Recommended route">${r.links.map(([label,url])=>`<a href="${url}">${escapeHTML(label)} <span>↗</span></a>`).join('')}</nav>`;result.classList.remove('route-refresh');void result.offsetWidth;result.classList.add('route-refresh');wakeMascot('route recalculated.');sounds.signature(key)};
  $$('[data-route]',section).forEach(b=>b.addEventListener('click',()=>show(b.dataset.route)));show(storage.get('navin-visitor-route','browse'));
}

function enhanceDecks(){
  $$('.shuffle-deck').forEach(deck=>{
    const cards=$$('.shuffle-card',deck),stage=deck.parentElement;if(!cards.length||$('.deck-tools',stage))return;
    const tools=document.createElement('div');tools.className='deck-tools';tools.innerHTML='<div class="deck-view-switch" role="group" aria-label="Creative work view"><button type="button" data-deck-view="deck" class="active" aria-pressed="true">Deck</button><button type="button" data-deck-view="sheet" aria-pressed="false">Contact sheet</button></div><button type="button" class="deck-surprise">Surprise me ✳</button>';
    const sheet=document.createElement('div');sheet.className='contact-sheet';sheet.hidden=true;sheet.setAttribute('aria-label','All creative work');
    sheet.innerHTML=cards.map((card,i)=>`<button type="button" class="contact-sheet-card" data-sheet-index="${i}" aria-label="Open card ${i+1}"><img src="${escapeHTML(card.dataset.poster)}" alt="" loading="lazy"><span>${String(i+1).padStart(2,'0')}</span></button>`).join('');
    stage.insertBefore(tools,deck);stage.insertBefore(sheet,deck.nextSibling);
    const setView=view=>{const isSheet=view==='sheet';deck.hidden=isSheet;sheet.hidden=!isSheet;stage.classList.toggle('is-contact-sheet',isSheet);$$('[data-deck-view]',tools).forEach(b=>{const on=b.dataset.deckView===view;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});if(isSheet)wakeMascot('everything, all at once.')};
    $$('[data-deck-view]',tools).forEach(b=>b.addEventListener('click',()=>setView(b.dataset.deckView)));
    const go=index=>deck.dispatchEvent(new CustomEvent('portfolio:deck-to',{detail:{index}}));
    $$('.contact-sheet-card',sheet).forEach(b=>b.addEventListener('click',()=>{go(Number(b.dataset.sheetIndex));setView('deck');deck.focus({preventScroll:true})}));
    $('.deck-surprise',tools).addEventListener('click',()=>{const current=Number(deck.dataset.current||0);let next=current;if(cards.length>1)while(next===current)next=Math.floor(Math.random()*cards.length);go(next);setView('deck');wakeMascot('wild card selected.');sounds.signature(deck.dataset.client)});
  });
}

function buildUniverseMap(){
  if(page!=='library'||$('.client-universe'))return;const anchor=$('.filter-wrap');if(!anchor)return;
  const groups=['Education & Services','Science & Health','Lifestyle & Commerce','Materials & Industry','Property & Places'];
  const section=document.createElement('section');section.className='client-universe';section.setAttribute('aria-labelledby','universe-title');
  section.innerHTML=`<div class="universe-heading"><span class="eyebrow">Client-universe map / 21 worlds</span><h2 id="universe-title">Same brain.<br><span>Different worlds.</span></h2><p>Follow the category or ignore the orbit. Every dot opens a full client chapter.</p></div><div class="universe-orbits">${groups.map((group,g)=>`<div class="universe-cluster cluster-${g+1}"><h3>${escapeHTML(group)}</h3><div>${db.clients.filter(c=>categoryOf(c)===group).map(c=>`<a href="${root}clients/${c.slug}.html" style="--node:${escapeHTML(c.theme?.accent||c.accent||'#7854c5')}" data-client-node="${escapeHTML(c.slug)}"><i aria-hidden="true"></i>${escapeHTML(c.name)}</a>`).join('')}</div></div>`).join('')}</div>`;
  anchor.before(section);
  $$('[data-client-node]',section).forEach(node=>node.addEventListener('pointerenter',()=>{const c=clientMap[node.dataset.clientNode];if(c)applyTheme(c.theme?.bg||c.accent)}));
}

function applyTheme(color){const meta=$('meta[name="theme-color"]');if(meta&&color)meta.content=color}
function clientThemes(){
  if(page==='case'&&clientMap[slug])applyTheme(clientMap[slug].theme?.bg||clientMap[slug].accent);
  if(page==='home'&&'IntersectionObserver' in window){let active='';const obs=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){const c=db.clients.find(x=>entry.target.id==='client-'+x.slug||entry.target.querySelector('#client-'+x.slug));if(c&&active!==c.slug){active=c.slug;applyTheme(c.theme?.bg||c.accent);if(sounds.mode==='full')sounds.signature(c.slug)}}}),{rootMargin:'-35% 0px -45%',threshold:0});$$('.takeover').forEach(s=>obs.observe(s))}
}

function animatedFavicon(){
  let link=$('link[rel~="icon"]');if(!link){link=document.createElement('link');link.rel='icon';document.head.appendChild(link)}
  const colors=['#d8fa80','#d5bafd','#ff987d','#b6e5ff'],frames=colors.map((fill,i)=>`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="${18+i*2}" fill="${fill}"/><text x="32" y="43" text-anchor="middle" font-family="Arial" font-size="38" font-weight="900" fill="#202820">n.</text></svg>`)}`);let n=0;link.href=frames[0];
  setInterval(()=>{if(!document.hidden&&!reduceMotion.matches)link.href=frames[n++%frames.length]},900);
}

function installTransitions(){
  const overlay=document.createElement('div');overlay.className='world-transition';overlay.setAttribute('aria-hidden','true');overlay.innerHTML='<span>Same brain.</span><strong>Different world.</strong><small></small>';body.appendChild(overlay);
  document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||a.target==='_blank'||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.defaultPrevented)return;let url;try{url=new URL(a.href,location.href)}catch(err){return}if(url.origin!==location.origin||!url.pathname.includes('/clients/'))return;if(reduceMotion.matches)return;e.preventDefault();const id=url.pathname.split('/').pop().replace('.html',''),client=clientMap[id];$('small',overlay).textContent=client?.name||'Another client chapter';overlay.classList.add('is-active');sounds.signature(id);setTimeout(()=>{location.href=url.href},520)});
}

function copyEmailPersonality(){
  const card=$('.contact-card');if(!card)return;const button=document.createElement('button');button.type='button';button.className='copy-email';button.innerHTML='<span>Copy email</span><small>for the tab you actually use</small>';const small=$('.small',card);small?.insertAdjacentElement('afterend',button);
  button.addEventListener('click',async()=>{const email=db.personal.email||'nnshri2000@gmail.com';try{await navigator.clipboard.writeText(email)}catch(e){const t=document.createElement('textarea');t.value=email;t.setAttribute('readonly','');t.style.position='fixed';t.style.opacity='0';body.appendChild(t);t.select();document.execCommand('copy');t.remove()}button.classList.add('is-copied');button.querySelector('span').textContent='Copied! Your move.';button.querySelector('small').textContent=email;sounds.success();wakeMascot('copied. no typo risk.');showToast('Copied. The inbox is ready for something interesting.');setTimeout(()=>{button.classList.remove('is-copied');button.querySelector('span').textContent='Copy email';button.querySelector('small').textContent='for the tab you actually use'},3600)});
}
function showToast(message,action){let toast=$('.experience-toast');if(toast)toast.remove();toast=document.createElement('div');toast.className='experience-toast';toast.setAttribute('role','status');toast.innerHTML=`<span>${escapeHTML(message)}</span>${action?'<button type="button">'+escapeHTML(action.label)+'</button>':''}`;body.appendChild(toast);requestAnimationFrame(()=>toast.classList.add('is-visible'));if(action)$('button',toast).addEventListener('click',()=>{action.run();toast.remove()});setTimeout(()=>{toast.classList.remove('is-visible');setTimeout(()=>toast.remove(),240)},5200)}

function scrollMemory(){
  if(location.hash)return;const key='navin-scroll:'+location.pathname,last=Number(storage.get(key,'0'))||0;history.scrollRestoration='manual';
  if(last>180)setTimeout(()=>{const max=document.documentElement.scrollHeight-innerHeight;if(max>0){scrollTo({top:Math.min(last,max),behavior:'auto'});showToast('Back where you left off.',{label:'Start at top',run:()=>{scrollTo({top:0,behavior:reduceMotion.matches?'auto':'smooth'});storage.set(key,0)}})}},90);
  let timer;addEventListener('scroll',()=>{clearTimeout(timer);timer=setTimeout(()=>storage.set(key,Math.round(scrollY)),180)},{passive:true});
}

function buildMotionLayer(){
  if(reduceMotion.matches)return;
  const progress=document.createElement('div');progress.className='experience-scroll-progress';progress.setAttribute('aria-hidden','true');body.appendChild(progress);
  let scrollFrame=0;const syncScroll=()=>{scrollFrame=0;const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);progress.style.setProperty('--scroll-progress',String(Math.min(1,scrollY/max)))};addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(syncScroll)},{passive:true});syncScroll();
  const revealTargets=$$('.visitor-routes>* ,.takeover-copy,.takeover-art,.library-tile,.universe-cluster,.about-grid>* ,.contact-card>* ,.story-panel .scene-copy,.story-panel .scene-art');
  revealTargets.forEach((el,i)=>{el.classList.add('xp-reveal');el.style.setProperty('--reveal-delay',(i%6)*55+'ms')});
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('xp-visible');observer.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -7%'});revealTargets.forEach(el=>observer.observe(el))}else revealTargets.forEach(el=>el.classList.add('xp-visible'));
  const hero=$('.hero-visual');if(hero){hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();hero.style.setProperty('--xp-x',((e.clientX-r.left)/r.width-.5).toFixed(3));hero.style.setProperty('--xp-y',((e.clientY-r.top)/r.height-.5).toFixed(3))});hero.addEventListener('pointerleave',()=>{hero.style.setProperty('--xp-x','0');hero.style.setProperty('--xp-y','0')})}
  $$('.takeover').forEach(section=>{section.addEventListener('pointermove',e=>{const r=section.getBoundingClientRect();section.style.setProperty('--world-x',((e.clientX-r.left)/r.width-.5).toFixed(3));section.style.setProperty('--world-y',((e.clientY-r.top)/r.height-.5).toFixed(3))});section.addEventListener('pointerleave',()=>{section.style.setProperty('--world-x','0');section.style.setProperty('--world-y','0')})});
  $$('.btn,.feature-link,.deck-surprise').forEach(el=>{el.classList.add('xp-magnetic');el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--mag-x',((e.clientX-r.left-r.width/2)*.10)+'px');el.style.setProperty('--mag-y',((e.clientY-r.top-r.height/2)*.16)+'px')});el.addEventListener('pointerleave',()=>{el.style.setProperty('--mag-x','0px');el.style.setProperty('--mag-y','0px')})});
  $$('.contact-sheet-card,[data-client-node]').forEach((el,i)=>el.style.setProperty('--motion-index',String(i%12)));
  const orb=document.createElement('span');orb.className='experience-cursor-orb';orb.setAttribute('aria-hidden','true');body.appendChild(orb);let pointerFrame=0,px=-80,py=-80;addEventListener('pointermove',e=>{px=e.clientX;py=e.clientY;if(!pointerFrame)pointerFrame=requestAnimationFrame(()=>{pointerFrame=0;orb.style.translate=`${px}px ${py}px`})},{passive:true});
  document.addEventListener('click',e=>{if(!e.target.closest('a,button,[role="button"]'))return;const burst=document.createElement('span');burst.className='experience-burst';burst.style.left=e.clientX+'px';burst.style.top=e.clientY+'px';burst.innerHTML='<i></i><i></i><i></i><i></i><i></i><i></i>';body.appendChild(burst);setTimeout(()=>burst.remove(),720)});
}

function finishLoading(){document.documentElement.classList.remove('experience-loading');document.documentElement.classList.add('experience-ready')}
function init(){
  buildMascot();buildSoundToggle();bindGlobalSounds();buildVisitorRoutes();enhanceDecks();buildUniverseMap();clientThemes();animatedFavicon();installTransitions();copyEmailPersonality();scrollMemory();buildMotionLayer();
  requestAnimationFrame(()=>setTimeout(finishLoading,220));
}
if(document.readyState==='complete')setTimeout(init,0);else addEventListener('load',init,{once:true});
})();

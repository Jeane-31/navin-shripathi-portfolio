(()=>{'use strict';
const db=window.PORTFOLIO_DATA;if(!db)return;
const page=document.body.dataset.page||'home',slug=document.body.dataset.slug||'',root=document.body.dataset.root||'./';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clientMap=Object.fromEntries(db.clients.map(c=>[c.slug,c]));
const featured=['arsh','aaryahi','harihar','sangath','evara','ab'];
const urlFor=c=>root+'clients/'+c.slug+'.html';
const src=k=>db.assets[k]?root+db.assets[k].src:'';
const email=db.personal.email||'nnshri2000@gmail.com';
const assetExists=k=>!!db.assets[k];
const chips=(vals=[],className='pill')=>vals.map(x=>`<span class="${className}">${esc(x)}</span>`).join('');
let sound=false,audio=null;
try{sound=localStorage.getItem('navin-v3-sound')==='yes'}catch(e){}
function chime(n=520){if(!sound)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();const now=audio.currentTime;const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(n,now);o.frequency.exponentialRampToValueAtTime(n*1.22,now+.05);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.018,now+.012);g.gain.exponentialRampToValueAtTime(.0001,now+.105);o.connect(g);g.connect(audio.destination);o.start(now);o.stop(now+.11)}catch(e){}}
const isVideo=k=>db.assets[k]&&db.assets[k].kind==='reel';
// All reel surfaces autoplay silently, loop and play inline. On desktop, audio is
// temporarily enabled on hover; touch devices have an explicit sound button.
// Small, playful sound cues live on every video surface — gallery, scene and viewer.
const reelSoundLines={
  'aaryahi-reel-details':'Psst… hover for sound ✳',
  'aaryahi-reel-crafted':'Crafted to be heard. Hover for sound ♫',
  'aaryahi-reel-minimal':'Quiet look, loud vibe. Hover for sound ↗',
  'aaryahi-reel-moments':'This moment has a soundtrack. Hover for sound ✦',
  'aaryahi-reel-elegance':'A little audio sparkle? Hover for sound ✨',
  'aaryahi-reel-outfit':'Plot twist: it talks. Hover for sound ↗',
  'papa-reel':'Papa says: hover for sound ☺',
  'harihar-reel-big':'Shhh… something big. Hover to hear 👀',
  'harihar-reel-lagan':'Papa gets the mic. Hover for sound ♫',
  'harihar-reel-decisions':'Big decision energy. Hover for sound ✳',
  'harihar-reel-investment':'Hear Papa’s hot take. Hover for sound ↗',
  'harihar-reel-dreams':'Villa dreams have a soundtrack. Hover ♫',
  'harihar-reel-luxury':'Luxury sounds better. Hover for audio ✦',
  'harihar-reel-balcony':'Balcony breeze, now with audio. Hover ✦',
  'sangath-reel':'Wait, there’s audio! Hover for sound ↗',
  'sangath-pro-featured-reel':'Doors open. Audio on hover ♫',
  'sangath-reel-why-wait':'Dream-home energy. Hover for sound ✳',
  'sangath-reel-why-settle':'Choice sounds better. Hover for audio ↗',
  'sangath-reel-sample-house':'Sample house, now with sound ♫',
  'sangath-reel-visit-province':'Green kingdom soundtrack. Hover ✦',
  'sangath-reel-freedom-month':'Freedom month has a jingle. Hover ✳',
  'sangath-reel-numbers':'Hear the numbers talk. Hover for sound ☺',
  'sangath-reel-luxury-light':'Luxury and light, with audio ✨',
  'sangath-reel-specifications':'Specs are nice. Sound is nicer. Hover ♫',
  'sangath-reel-experience':'Experience the difference. Hover ↗',
  'sangath-reel-not-same':'Not the same, not silent. Hover ✦',
  'sangath-reel-money-moves':'Money moves. Audio too. Hover ⚡',
  'sangath-reel-secure-investments':'Secure investments, louder point. Hover ♫',
  'evara-new-01':'Design deserves a soundtrack. Hover ✦',
  'evara-comfort':'Comfort sounds good. Hover ♫',
  'evara-streets':'Street to space — press play with sound ↗',
  'evara-lifestyle-upgrade':'The upgrade has audio. Hover ✳',
  'evara-feels-like-you':'Feels like home. Sounds even better ♫',
  'evara-reflect-your-vibe':'Your vibe, now with sound ✦',
  'evara-new-chapter':'New chapter, new soundtrack. Hover ↗',
  'evara-luxury-felt':'Luxury sounds like this. Hover ♫',
  'evara-crafting-spaces':'Hear the craft. Hover for sound ✳',
  'evara-new-02':'Soundtrack, meet design. Hover ♫',
  'evara-reel':'Hear the details. Hover for sound ♫',
  'ab-reel-house-longevity':'Built for decades. Hover for sound 🧱',
  'ab-reel-strength-forged':'Hot take. Literally. Hover for sound 🔥',
  'ab-reel-crucial-stage':'Into the fire. Hover for sound ✳',
  'ab-reel-weak-brick':'One brick. Big stakes. Hover to hear ↗',
  'ab-reel-clay-confidence':'Clay has a story. Hover for sound ♫',
  'ab-reel-strong-foundation':'Strong stories deserve sound. Hover ✦',
  'ab-reel-4am':'4 AM, still making noise. Hover ♫'
};
const reelSoundFallback=['The soundtrack has entered. Hover for sound ♫','Curious ears? Hover for sound ↗','Soundtrack unlocked: hover for sound ✦','Plot twist: audio. Hover for sound ☺'];
function reelSoundCue(k){const line=reelSoundLines[k]||reelSoundFallback[[...k].reduce((n,c)=>n+c.charCodeAt(0),0)%reelSoundFallback.length];return `<span class="video-cue" aria-hidden="true"><span class="video-cue-desktop">${esc(line)}</span><span class="video-cue-touch">Tap 🔊 for the full plot ✳</span><span class="video-cue-playing">Sound's on. You're welcome ♫</span></span>`}
function inlineReel(k,alt,openable=false){const a=db.assets[k];if(!a)return '';const interaction=openable?` class="portfolio-video js-portfolio-video js-open-art" data-asset="${esc(k)}" tabindex="0" role="button" aria-label="Open full-size reel: ${esc(a.title)}"`:` class="portfolio-video js-portfolio-video" aria-label="${esc(alt||a.alt||a.title)}"`;return `<div class="video-surface" data-video-id="${esc(k)}"><video${interaction} autoplay muted loop playsinline webkit-playsinline preload="metadata" ${a.poster?`poster="${esc(root+a.poster)}"`:''}><source src="${esc(src(k))}" type="video/mp4">Your browser does not support this video.</video>${reelSoundCue(k)}<button type="button" class="video-sound-button js-video-sound" aria-label="Unmute this reel" aria-pressed="false">🔇 <span>Sound</span></button></div>`}
function still(k,alt,loading='lazy'){const a=db.assets[k];if(!a)return `<div class="art-note"><strong>More in the client folder.</strong><span>This chapter keeps the original material close.</span></div>`;if(isVideo(k))return inlineReel(k,alt);return `<img src="${esc(src(k))}" alt="${esc(alt||a.alt||a.title)}" loading="${loading}" decoding="async">`}
function mediaFull(k){const a=db.assets[k];if(!a)return '';return isVideo(k)?inlineReel(k,a.alt||a.title):`<img src="${esc(src(k))}" alt="${esc(a.alt||a.title)}">`}
function workButton(k,kind='wall-item'){const a=db.assets[k];if(!a)return '';if(isVideo(k))return `<div class="${kind} video-work-tile">${inlineReel(k,a.alt||a.title,true)}${kind==='wall-item'?`<p>${esc(a.title)}</p>`:`<figcaption>${esc(a.title)}</figcaption>`}</div>`;return `<button type="button" class="${kind} js-open-art" data-asset="${esc(k)}" aria-label="Open full image: ${esc(a.title)}">${still(k,a.alt||a.title)}${kind==='wall-item'?`<p>${esc(a.title)}</p><small>${esc(a.date||'')} · ${esc(a.kind==='carousel'?'Carousel slide':'Original artwork')}</small>`:`<figcaption>${esc(a.title)}</figcaption>`}</button>`}
function cssVars(vars={}){return Object.entries(vars).filter(([,v])=>v!==undefined&&v!==null&&v!=='').map(([k,v])=>`--${k}:${v}`).join(';')}
function logoStage(c){const key=c.libraryLogo;if(!key||!assetExists(key))return '';const card=c.libraryCard||{};const stageStyle=cssVars({'surface':card.surface,'surface-border':card.border,'surface-shadow':card.shadow,'surface-pad':card.pad,'glow-a':card.glowA,'glow-b':card.glowB,'logo-shadow':card.logoShadow,'logo-maxh':card.maxH,'logo-scale':card.scale,'logo-maxw':card.maxW});return `<div class="logo-stage" style="${stageStyle}">${still(key,c.name+' logo','eager')}</div>`}
function libraryTileStyle(c){const card=c.libraryCard||{};return cssVars({'cbg':card.bg||c.theme?.bg||'#fffdf8','cink':card.ink||'#1f2620','cmuted':card.muted||'#4b554b','cbuttonbg':card.buttonBg||'rgba(255,255,255,.82)','cbuttonborder':card.buttonBorder||'rgba(30,36,28,.14)','cbuttonink':card.buttonInk||'#1f2620'})}
function header(){let links=[['Main character work','index.html#selected'],['Client multiverse','library.html'],['No magic trick','method.html'],['Who is this guy?','about.html'],['Send a fun brief','contact.html']];$('#header').innerHTML=`<header class="site-header"><div class="navwrap"><a class="wordmark" href="${root}index.html" aria-label="Navin Shripathi, homepage"><span class="mark">n.</span><span>navin<span style="color:#7854c5">.</span> <em>shripathi</em></span></a><nav class="navlinks" id="navigation" aria-label="Main navigation">${links.map(([t,p])=>`<a href="${root+p}" ${page==='library'&&p==='library.html'?'class="active"':page==='method'&&p==='method.html'?'class="active"':''}>${t}</a>`).join('')}</nav><div class="nav-right"><button class="sound-btn" type="button" id="sound-toggle" aria-pressed="${sound}" aria-label="${sound?'Turn sound off':'Turn sound on'}">${sound?'♪ Sound on':'♩ Sound off'}</button><button type="button" class="menu-btn" aria-expanded="false" aria-controls="navigation" id="nav-toggle">Menu ☰</button></div></div></header>`;$('#nav-toggle').addEventListener('click',e=>{const n=$('#navigation'),show=n.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',show)});$('#sound-toggle').addEventListener('click',e=>{sound=!sound;try{localStorage.setItem('navin-v3-sound',sound?'yes':'no')}catch{};e.currentTarget.textContent=sound?'♪ Sound on':'♩ Sound off';e.currentTarget.setAttribute('aria-pressed',sound);e.currentTarget.setAttribute('aria-label',sound?'Turn sound off':'Turn sound on');chime(610)})}
function footer(){$('#footer').innerHTML=`<footer class="site-footer"><div class="footer-top"><b>Got a brief?<br>I've got questions.<br>Good ones.</b><a class="btn" href="mailto:${esc(email)}?subject=${encodeURIComponent('A good brief (hopefully)')}">Let's make something ↗</a></div><div class="footer-small"><span>© 2026 Navin Shripathi · Ahmedabad, India · Built with curious thinking and an unreasonable number of tabs.</span><span><a href="${root}library.html">Client library</a> · <a href="${root}about.html">The human</a></span></div></footer>`}
function splitHeadline(str=''){const words=String(str).trim().split(/\s+/).filter(Boolean);if(words.length<5)return `<span>${esc(str)}</span>`;const cut=Math.ceil(words.length*.48);return `<span>${esc(words.slice(0,cut).join(' '))}</span><em>${esc(words.slice(cut).join(' '))}</em>`}
function featureTags(c){return (c.motifs||c.projects||[]).slice(0,4).map(x=>`<span>${esc(x)}</span>`).join('')}
function visual(c,secondary=false){const a=c.featuredHero||c.hero||c.media?.[0],b=c.featuredSecondary||(c.media||[]).find(x=>x!==a);return `<div class="takeover-art"><div class="art-gridword">${esc((c.name.split('×')[0]||c.name).trim().split(' ')[0].slice(0,14).toUpperCase())}</div><div class="orbit orbit-a"></div><div class="orbit orbit-b"></div><div class="floating-note note-a">${esc(c.theme.label)}</div><div class="floating-note note-b">${esc(c.projects?.[0]||c.category)}</div><div class="media-stage primary ${secondary?'stacked':''}">${a?still(a,`${c.name} original creative: ${db.assets[a].title}`):'<div class="art-note"><strong>Story assembling</strong></div>'}</div>${b?`<div class="media-stage secondary">${still(b,`${c.name} supporting creative: ${db.assets[b].title}`)}</div>`:''}<div class="stage-caption">No crop. No cheating. The original artwork stays original.</div></div>`}
function takeover(c,index){const t=c.theme;return `<section class="takeover reveal-on-scroll" style="--cbg:${esc(t.bg)};--caccent:${esc(t.accent)};--cink:${esc(t.ink)}" data-motif="${esc(t.motif)}" aria-labelledby="client-${esc(c.slug)}"><div class="takeover-copy"><div class="feature-meta"><span>${String(index+1).padStart(2,'0')}</span><span>${esc(c.category)}</span></div><p class="feature-client">${esc(c.name)}</p><h3 id="client-${esc(c.slug)}">${splitHeadline(c.funTitle||c.headline||c.name)}</h3><p class="takeover-dek">${esc(c.funSub||c.teaser||'A client story with strategy, creative direction and the making bit all in one place.')}</p><div class="feature-pills">${featureTags(c)}</div><a class="feature-link" href="${urlFor(c)}">Enter project <span aria-hidden="true">↗</span></a></div>${visual(c)}</section>`}
function home(){const featureCards=featured.map((s,i)=>takeover(clientMap[s],i)).join('');$('#main').innerHTML=`<section class="home-hero home-hero-editorial"><div class="hero-words"><span class="tag"><i class="dot" aria-hidden="true"></i> Navin Shripathi / strategist, creative director, certified tab hoarder</span><h1>Marketing strategy,<br><i>but make it</i><span> feel alive.</span></h1><p class="lead">I connect the whole thing: insight, positioning, content systems, campaign concepts, scripts, shoots, ads, reporting and the mildly chaotic part where humans have to actually make it.</p><div class="hero-actions"><a class="btn" href="#selected">Roll the highlights ↘</a><a class="btn btn-outline" href="${root}about.html">Meet the plot-twist person ↗</a></div></div><div class="hero-visual" aria-hidden="true"><div class="hero-doodle"></div><div class="hero-star">✳</div><div class="main-character"><span class="eyes">◉ ◉</span><span class="mouth">brief? nice.</span></div><div class="floating-sticky sticker-a">Research first.<br>Drama later.</div><div class="floating-sticky sticker-b">Funny when useful.<br>Sharp always.</div><div class="floating-sticky sticker-c">Not “just content”.<br>The whole system.</div><span class="hero-seal">Ahmedabad-based. Internet-powered. Chronically curious.</span></div></section><div class="marquee-home" aria-hidden="true"><div class="ticker">${Array(2).fill(['A STRATEGIST WHO LIKES THE MAKING TOO','CAMPAIGN THINKING WITHOUT THE CORPORATE WALLPAPER','BIG IDEAS. BETTER EXECUTION. FEWER BUZZWORDS.','YES THE COPY IS DOING SOMETHING','NO THE VISUALS ARE NOT JUST DECORATION'].map(v=>`<span>${v}</span>`).join('')).join('')}</div></div><section class="container selected-intro" id="selected"><span class="eyebrow">01 — Selected work / six very different worlds</span><h2 class="selected-worlds-title"><span class="selected-worlds-first">Different brands. <span class="selected-worlds-emphasis">Different worlds.</span></span><span class="selected-worlds-second">Same brain.</span></h2></section>${featureCards}${methodIntro('home')}${methodRail('method-home')}<section class="container section-pad"><span class="eyebrow">03 — The plot in one line</span><h2 class="section-title">A good idea is cute.<br><span class="scribble">Getting it made well</span> is hotter.</h2><p class="body-large">I work across the thinking, making and tuning, with actual teams, actual production and actual delivery. No “visionary” fog. Just smart work with personality and follow-through.</p><div class="hero-actions"><a class="btn" href="${root}about.html">More about the human →</a><a class="btn btn-outline" href="${root}contact.html">say hello, not “dear, sir” →</a></div></section>`}
const methodSteps=[
{n:'01',kicker:'The detective phase',title:'Stalk the problem. Professionally.',body:'What are people trying to solve? What do they already believe? What is everyone else in the category repeating like it’s the law?',tag:'Research / people / context',shape:'⌕',note1:'Audience > assumptions',note2:'Open 17 more tabs'},
{n:'02',kicker:'Find the angle',title:'Locate the plot. Delete the fluff.',body:'Turn the mess into a sharp positioning idea. Not “premium lifestyle” for the 900th time. Something specific enough to be interesting.',tag:'Strategy / positioning / message',shape:'✳',note1:'One clear point of view',note2:'Buzzwords: denied'},
{n:'03',kicker:'Make it stop the scroll',title:'Give the idea a personality.',body:'Campaign concepts, visual language, scripts, reels and unexpected ways in. Funny when it helps. Quiet when that works harder.',tag:'Creative / concept / writing',shape:'✦',note1:'Hook → story → feeling',note2:'No copy-paste personality'},
{n:'04',kicker:'The making part',title:'Make the thing. With actual people.',body:'Briefs, designers, shoots, edits, creators, approvals, publishing. It takes coordination to make creative look effortless.',tag:'Production / collaboration / launch',shape:'↗',note1:'The calendar has entered',note2:'Everyone aligned (ideally)'},
{n:'05',kicker:'The feedback loop',title:'Let the data have an opinion.',body:'Watch the signals, refine the work and keep the next round smarter than the last. Ego is not a reporting metric.',tag:'Review / optimise / repeat',shape:'∞',note1:'Listen. Adjust. Repeat.',note2:'A prettier next draft'}
];
function methodIntro(where){return `<section class="method-intro container" id="method"><span class="eyebrow">${where==='home'?'02 — How the chaos gets organised':'The operating system / mostly human'}</span><h2>A method, <span class="scribble">not a magic trick.</span></h2><p>There is a process behind the fun. Scroll down and watch the idea transform from a tiny problem into an actual piece of work. No smoke machine required.</p></section>`}
function methodRail(id){return `<section class="story-shell method-shell js-horizontal" data-kind="method" id="${id}" tabindex="0" aria-label="Five part marketing process, scroll to explore"><div class="story-sticky"><div class="story-ui"><div class="story-ui-title">A method, not a magic trick. <span class="js-scene-label">01 / 05</span></div><div class="scene-progress" role="group" aria-label="Method chapters">${methodSteps.map((_,i)=>`<button type="button" class="js-jump ${i===0?'on':''}" data-jump="${i}" aria-label="Jump to method phase ${i+1}"></button>`).join('')}</div><div class="story-ctrl"><button class="js-prev" type="button" aria-label="Previous phase">←</button><button class="js-next" type="button" aria-label="Next phase">→</button></div></div><div class="story-track">${methodSteps.map((s,i)=>`<article class="story-panel method-panel" data-number="${s.n}" data-active="${i===0?'true':'false'}"><div class="scene-copy"><span class="eyebrow">${esc(s.kicker)} / ${s.n} of 05</span><h2>${esc(s.title)}</h2><p>${esc(s.body)}</p><div class="scene-chips"><span>${esc(s.tag)}</span></div>${i===0?'<span class="jump-note">Scroll ↓ to move sideways →</span>':''}</div><div class="scene-art"><div class="method-art" aria-hidden="true"><div class="method-core"><span>${esc(s.shape)}</span></div><div class="method-note n1">${esc(s.note1)}</div><div class="method-note n2">${esc(s.note2)}</div></div></div></article>`).join('')}</div></div></section>`}
function methodPage(){$('#main').innerHTML=methodIntro('page')+methodRail('method-standalone')+`<section class="container section-pad"><p class="eyebrow">After the nice diagram...</p><h2 class="section-title">It only works if it survives reality.</h2><p class="body-large">A good strategy should still make sense in the edit room, in the ad account and in a client meeting at 6:30 PM. That's why I like staying involved from the first messy question to the next creative iteration.</p><a class="btn" href="${root}index.html#selected">See that process in actual work ↗</a></section>`}
const sceneHeadlines={
'arsh':['Not just a feed. A conversion journey.','An education-services offer needed a clear path from attention to enquiry.','Campaign messaging met layered webinars.','The work was in the funnel, not the posting calendar.','Original brand creative from the supplied archive.','When the goal is conversion, design the journey—not just the post.'],
'harihar':['Three projects. One plot to untangle.','A father, a commute and an X factor.','One developer story, three very different answers.','The part with scripts, sets and spreadsheets.','This actually made it out of the brainstorm.','Different buyers. Connected thinking.'],
'sangath':['A familiar name gets a new chapter.','A legacy can be useful. And complicated.','Province and Prominence were not twins.','From idea to collaborators to creative.','A few frames from the brand world.','New energy, same recognisable roots.'],
'laxmi':['A floor plan is not a whole story.','The commute. The light. The actual life.','Make the everyday part aspirational.','This is where planning meets production.','Real work from the account.','Specific beats generic every Tuesday.'],
'genexplore':['Science, but readable by humans.','One science brand. Several audiences.','Clarity without oversimplifying.','The work between the idea and the post.','The lab, the learning, the visuals.','Get the meaning right before the aesthetic.'],
'aaryahi':['From counter to click, with character.','Jewellery had to make sense online.','Details, trust and the shopping experience.','The brief touched more than a feed.','A few pieces from the actual collection.','The store and the social need to agree.'],
'ab':['Who said bricks need boring marketing?','The process was hiding in plain sight.','Clay and heat became the storyline.','Production content took a production plan.','Here is what that looked like.','A better product story starts at the source.'],
};
function hlines(c){return sceneHeadlines[c.slug]||[c.funTitle, c.teaser, c.headline, 'A little less solo act. A lot more coordination.', 'A look at the actual work.', c.learning]}
const chainFor=c=>c.slug==='ekobloc'?['Product truth','Content themes','Plan the posts','Explain clearly']:c.slug==='nova'?['Business questions','Positioning','Content direction','Refine thinking']:c.slug==='radhe'?['Creative archive','Project folder','Details pending']:['Understand','Find the angle','Make it together','Launch + review'];
const creativeIntroductions={
'arsh':'A black, white and orange world built around urgency, possibility and the journey from first click to the next conversation.',
'harihar':'Family comedy, villa ambition and everyday buyer logic share the same frame, with each project finding its own way into the conversation.',
'sangath':'Homes, business spaces and a long-standing name move between aspiration, utility and a distinctly green visual world.',
'laxmi':'Floor plans open into scenes of everyday life, where light, movement and the feeling of coming home do the persuasive work.',
'balraj':'Different developments find their own rhythm while staying connected through a clear, confident property language.',
'genexplore':'Science becomes visual, understandable and human without losing the precision that gives the work its credibility.',
'alok':'A focused project story turns architecture, location and aspiration into one clean, recognisable point of view.',
'aaryahi':'Silver is styled like a mood rather than a catalogue, where product detail meets quiet confidence and the moments jewellery gets invited into.',
'ganesh':'Residential ambition and institutional scale sit inside one broad world, shaped by place, purpose and public-facing clarity.',
'trust':'Distinct residential stories move through one connected system, balancing project personality with a familiar sense of trust.',
'shyam':'Each address gets its own character, from urban energy to quieter ideas of space, greenery and belonging.',
'aryaman':'Place, mythology and campaign energy come together in a property world that feels memorable before it feels conventional.',
'ab':'Clay, heat and strength become the story, turning an industrial process into something visual, human and unexpectedly satisfying to watch.',
'evara':'Interiors feel less like furniture listings and more like scenes you want to step into: texture, light, comfort and a little showroom theatre.',
'sreevas':'The work draws attention to the feeling around a home, letting everyday aspirations lead the project story.',
'nest':'Market choices become easier to read when local context, property detail and buyer guidance share the same clear voice.',
'perfect':'Home search is framed as a guided decision, with useful context and possibility taking the place of property-listing noise.',
'ekobloc':'Material performance becomes the creative spine, giving a technical product a direct, practical and recognisable voice.',
'nova':'Industrial space is presented as momentum: room to build, operate and imagine what the next stage of a business could look like.',
'gateway':'Architecture and aspiration meet in a polished project world designed to make arrival feel like part of the promise.',
'shreenathji':'Local knowledge leads the story, turning neighbourhood context and buyer questions into approachable property communication.'
};
function creativeIntroduction(c){return creativeIntroductions[c.slug]||`${c.name} comes into focus through the ideas, visual language and decisions that make this project world its own.`}
function artFigure(c,k,caption='The original work, in full'){return `<div class="scene-art"><div class="art-glob" aria-hidden="true"></div><div class="art-image">${k?still(k,c.name+' — '+db.assets[k].title,'eager'):`<div class="art-note"><strong>Still gathering the story.</strong></div>`}</div><div class="mini-sticker" aria-hidden="true">${esc(c.funSticker.slice(0,49))}</div></div>`}
function clientStory(c){const heads=hlines(c),media=c.media.filter(assetExists),prj=c.projects||[],t=c.theme;const sceneTag=(n,text)=>`<span class="eyebrow">Scene ${n} / ${esc(text)}</span>`;const galleryPreview=media.slice(0,3).map(k=>workButton(k,'work-thumbnail')).join('');const pageLabel=c.name+' / 5 scenes';return `<div class="story-open"><div class="breadcrumbs"><a href="${root}index.html">Home</a> / <a href="${root}library.html">Client library</a> / ${esc(c.name)}</div><a class="mini-link" href="${root}library.html">← Back to the cast</a></div><section class="story-shell js-horizontal" data-kind="case" id="story-${esc(c.slug)}" style="--story-bg:${esc(t.bg)};--story-accent:${esc(t.accent)};--story-ink:${esc(t.ink)}" tabindex="0" aria-label="${esc(c.name)} horizontal case study, scroll down to move through scenes"><div class="story-sticky"><div class="story-ui"><div class="story-ui-title">${esc(c.name)} <span class="js-scene-label">01 / 05</span></div><div class="scene-progress" role="group" aria-label="Scenes">${[0,1,2,3,4].map(i=>`<button type="button" class="js-jump ${i===0?'on':''}" data-jump="${i}" aria-label="Jump to scene ${i+1}"></button>`).join('')}</div><div class="story-ctrl"><button type="button" class="js-prev" aria-label="Previous scene">←</button><button type="button" class="js-next" aria-label="Next scene">→</button></div></div><div class="story-track">
<article class="story-panel" data-number="01"><div class="scene-copy">${sceneTag('01','The setup')}<h1>${esc(heads[0])}</h1><p>${esc(c.funSub)}</p><div class="scene-chips">${chips([c.category,...prj.slice(0,2)],'scene-chip')}</div><div class="scene-extra">${esc(c.funSticker)}</div><span class="jump-note">Scroll ↓ to move sideways →</span></div>${artFigure(c,media[0])}</article>
<article class="story-panel" data-number="02"><div class="scene-copy">${sceneTag('02','The problem, not a moodboard')}<h2>${esc(heads[1])}</h2><p>${esc(c.context)}</p></div><div class="scene-art"><div class="thought-cards">${(c.motifs?.length?c.motifs:['Audience','Context','The real question']).slice(0,3).map((m,i)=>`<div class="thought-card"><strong>0${i+1}</strong>${esc(m)}</div>`).join('')}</div></div></article>
<article class="story-panel" data-number="03"><div class="scene-copy">${sceneTag('03','The interesting bit')}<h2>${esc(heads[2])}</h2><p>${esc(c.turn)}</p></div><div class="scene-art"><div class="art-phrase" aria-hidden="true">${esc(c.motifs?.[0]||'THE IDEA')}<br><span class="under">↗</span></div></div></article>
<article class="story-panel" data-number="04"><div class="scene-copy">${sceneTag('04','Pixels, not placeholder boxes')}<h2>${esc(heads[4])}</h2><p>${esc(creativeIntroduction(c))}</p></div><div class="scene-art">${media.length?`<div class="scene-gallery">${galleryPreview}</div>`:`<div class="art-note"><strong>Creative folder available.</strong><span>We’re not pretending the empty slots are work.</span></div>`}</div></article>
<article class="story-panel" data-number="05"><div class="scene-copy">${sceneTag('05','The takeaway')}<h2>${esc(heads[5])}</h2><p>${esc(c.learning)}</p><a class="btn btn-white" href="#creative-gallery">${c.instagramLinks?.length?'See the work on Instagram ↗':'See the creative work ↗'}</a></div><div class="scene-art"><div class="art-note"><strong>That's the story. (So far.)</strong><span>${esc(c.funSticker)}</span></div></div></article>
</div></div></section>${clientAfter(c)}`}
function instagramCreativeAfter(c){
  const accounts=(c.instagramLinks||[]).filter(item=>item.url.startsWith('https://www.instagram.com/'));
  const accountCards=accounts.map((account,i)=>`<a class="instagram-link-card" href="${esc(account.url)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(c.name)} ${esc(account.title)} on Instagram"><span class="instagram-link-index">${String(i+1).padStart(2,'0')} / INSTAGRAM</span><strong>${esc(accounts.length>1?account.title:c.name)}</strong><span class="instagram-link-open">See the work on Instagram ↗</span></a>`).join('');
  return `<section class="story-after story-after-social" id="creative-gallery"><div class="work-section instagram-work-section"><div class="instagram-section-copy"><span class="eyebrow">The actual work / Instagram</span><h2>The story continues <span class="scribble">over there.</span></h2><p class="lead">${accounts.length>1?'Each Shyam Realty project has its own Instagram page. Explore the work directly from these project accounts.':'See the original published work on the client’s Instagram page.'}</p><p class="lead" style="font-size:14px">${esc(c.projects.join(' · '))}</p></div><div class="instagram-links-wall"><span class="eyebrow">${accounts.length>1?'Explore each project':'Explore the published work'} ↗</span>${accountCards}</div></div><div class="story-sources"><a class="btn btn-outline btn-small" href="${esc(c.source)}" target="_blank" rel="noopener noreferrer">Original client folder ↗</a></div></section>`;
}
function clientAfter(c){
  if(c.instagramLinks?.length)return instagramCreativeAfter(c);
  const media=c.media.filter(assetExists);
  const hasVideo=media.some(isVideo);
  const cards=media.map((k,i)=>{
    const a=db.assets[k],preview=isVideo(k)?a.poster:a.src;
    const alt=esc(a.title||c.name+' creative');
    const soundCue=isVideo(k)?'<span class="shuffle-sound-cue" aria-hidden="true"><span class="shuffle-cue-desktop">Hover for sound</span><span class="shuffle-cue-touch">Tap for sound</span><span class="shuffle-cue-on">Sound on</span></span>':'';
    return `<div class="shuffle-card" data-reel-index="${i}" data-asset="${esc(k)}" data-poster="${esc(root+preview)}" data-slot="hidden" aria-hidden="true"><div class="shuffle-card-media"><img alt="" loading="lazy" decoding="async" draggable="false">${soundCue}</div></div>`;
  }).join('');
  const dots=media.map((_,i)=>`<span class="shuffle-progress-dot${i===0?' is-active':''}" data-progress-index="${i}" aria-hidden="true"></span>`).join('');
  const soundInstruction=hasVideo?' Hover the centre reel for sound, or tap it on mobile.':'';
  return `<section class="story-after shuffle-story-after" id="creative-gallery" aria-label="${esc(c.name)} creative work"><div class="shuffle-deck-stage"><div class="shuffle-deck" role="group" tabindex="0" aria-label="${esc(c.name)} five-card creative stack. Swipe left for next, right for previous, or use the left and right arrow keys.${soundInstruction}" data-client="${esc(c.slug)}"><div class="shuffle-deck-cards">${cards}</div><span class="shuffle-swipe-hint" aria-hidden="true"><span class="shuffle-hint-pointer">Drag to browse</span><span class="shuffle-hint-touch">Swipe to browse</span> ↔</span></div><div class="shuffle-progress${media.length>16?' is-many':''}" aria-hidden="true">${dots}</div><span class="shuffle-announcement" aria-live="polite"></span></div></section>`;
}
function categoryOf(c){if(/Education|Edtech|Career Services/i.test(c.category))return 'Education & Services';if(/Genomics|Diagnostics|Healthcare/i.test(c.category))return 'Science & Health';if(/Jewellery|Furniture|Interiors|E-commerce/i.test(c.category))return 'Lifestyle & Commerce';if(/Construction Materials|Infrastructure/i.test(c.category))return 'Materials & Industry';return 'Property & Places'}
function library(){const cats=['Everything','Education & Services','Science & Health','Lifestyle & Commerce','Materials & Industry','Property & Places'];$('#main').innerHTML=`<section class="page-hero"><span class="eyebrow">The full cast / no one left in the credits</span><h1>All the clients.<br>All the plotlines.</h1><p>Not every project belongs on a homepage. Every project does deserve to live in the right family. Search the full client library, then open any story sideways.</p></section><div class="filter-wrap"><div class="filters"><input type="search" class="search-field" id="client-search" placeholder="Find a client, project or industry..." aria-label="Search clients and projects"><div class="filter-buttons" role="group" aria-label="Filter clients">${cats.map((x,i)=>`<button type="button" data-filter="${esc(x)}" class="${i===0?'active':''}" aria-pressed="${i===0}">${esc(x)}</button>`).join('')}</div></div></div><section class="library-list" id="client-results" aria-live="polite"></section>`;let active='Everything';function tile(c){const k=c.hero;const hasLogo=!!(c.libraryLogo&&assetExists(c.libraryLogo));const style=libraryTileStyle(c);const media=hasLogo?logoStage(c):(k?still(k,c.name+' original creative'):'<span class="pill">Story being assembled ✳</span>');return `<article class="library-tile ${hasLogo?'has-logo':''}" style="${style}"><div class="lib-top"><span class="eyebrow">${esc(categoryOf(c))}</span><h2>${esc(c.name)}</h2><p>${esc(c.funTitle)}</p><div class="pill-stack">${chips(c.projects.slice(0,3))}</div></div><div class="lib-media">${media}</div><div class="lib-bottom"><span>${esc(c.theme.label)}</span><a href="${urlFor(c)}">Enter story ↗</a></div></article>`}function draw(){const q=$('#client-search').value.toLowerCase().trim();const matches=db.clients.filter(c=>(active==='Everything'||categoryOf(c)===active)&&[c.name,c.category,c.projects.join(' '),c.funTitle,c.teaser].join(' ').toLowerCase().includes(q));$('#client-results').innerHTML=matches.length?matches.map(tile).join(''):`<p class="empty">No matching client. Even my 47 tabs couldn't find that one. Try another search.</p>`}$('#client-search').addEventListener('input',draw);$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{active=b.dataset.filter;$$('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b?'true':'false')});chime(580);draw()}));draw()}
function about(){$('#main').innerHTML=`<section class="page-hero" style="background:#f6eeff"><span class="eyebrow">The person behind the suspiciously specific briefs</span><h1>Hi. I'm Navin.<br>Let's make it <span class="scribble">interesting.</span></h1><p>Brand & Growth Marketing Manager. Brand & Marketing Strategist. Professional asker of “okay, but why would someone care?”</p></section><div class="about-main"><section class="about-grid"><div><span class="eyebrow">Not just the Instagram person</span><h2>My sweet spot is the space between <em style="font-style:normal;color:#8b5cc4">thinking</em> and <em style="font-style:normal;color:#8b5cc4">making.</em></h2><p>It usually starts with an untidy problem. The brand wants growth. The audience isn't listening. The content looks fine but says very little. Everyone has a different opinion and there's a meeting about the meeting.</p><p>I like getting into that mess: understanding who we're talking to, figuring out what the brand really needs to say, shaping a campaign or content direction, getting the right people moving, and staying close as the work goes live.</p><p>That has meant education and conversion funnels, property projects, genomics and diagnostics, jewellery, furniture and interiors, construction materials and industrial communication. Different categories. Same question: how do we make this matter to the right people?</p><p>Before the brand work, I also spent time leading operations, education and community initiatives. Which explains my soft spot for a good workflow. And my emotional dependence on organised files.</p><a class="btn" href="${root}index.html#selected">Meet the work ↗</a></div><aside class="about-aside" aria-label="A few true things about how I work"><div>✳ Research before the dramatic tagline.</div><div>↗ Scripts, shoots, people, ads, the whole moving thing.</div><div>◉ Smart creative doesn't have to look serious.</div><div>☻ Team player. Spreadsheet negotiator. Idea enthusiast.</div></aside></section></div>`}
function contact(){$('#main').innerHTML=`<section class="contact-page"><div class="contact-card"><span class="eyebrow">Open inbox / preferably a fun brief</span><h1>Got something<br><span class="scribble">interesting?</span></h1><p>Campaign to untangle? Brand that needs a personality? Big idea that needs a strategy and a production plan? We should talk.</p><a class="btn" href="mailto:${esc(email)}?subject=${encodeURIComponent('Hey Navin, I have a brief')}">Send the brief ↗</a><p class="small">${esc(email)} · Based in Ahmedabad, open to good work beyond it.</p><p style="font-size:13px">No contact form that goes into the void. This opens your email app.</p></div></section>`}

// The Creative Work shuffle deck: five visible card faces, one active player.
// The full client stories and Instagram-only pages are intentionally unaffected.
function bindShuffleDecks(){
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  $$('.shuffle-deck').forEach(deck=>{
    const cards=[...deck.querySelectorAll('.shuffle-card')];
    if(!cards.length)return;
    const live=deck.parentElement.querySelector('.shuffle-announcement');
    const count=cards.length;
    let current=0,activeVideo=null,visible=false,moving=false,down=null,suppressClickUntil=0;
    const cardAt=i=>cards[(i+count)%count];
    function stopVideo(){
      deck.classList.remove('is-audible');
      if(activeVideo){activeVideo.pause();activeVideo.muted=true;activeVideo.removeAttribute('src');activeVideo.load();activeVideo.remove();activeVideo=null}
    }
    function setAudio(on){
      if(!activeVideo)return;
      activeVideo.muted=!on;
      deck.classList.toggle('is-audible',on);
      if(activeVideo.paused){const attempt=activeVideo.play();attempt?.catch?.(()=>{activeVideo&&(activeVideo.muted=true)})}
    }
    function paint(){
      const wanted=new Map([
        [current,'front'],
        [(current+1)%count,'right-near'],
        [(current+2)%count,'right-far'],
        [(current+count-1)%count,'left-near'],
        [(current+count-2)%count,'left-far']
      ]);
      cards.forEach((card,i)=>{
        const slot=wanted.get(i)||'hidden';
        card.dataset.slot=slot;
        card.setAttribute('aria-hidden',slot==='hidden'?'true':'false');
        card.style.pointerEvents=slot==='hidden'?'none':'';
        const img=card.querySelector('img');
        if(slot!=='hidden'){
          if(!img.getAttribute('src'))img.src=card.dataset.poster;
          card.style.setProperty('--shuffle-bg',`url("${card.dataset.poster.replace(/"/g,'%22')}")`);
        }else{
          // Do not keep dozens of Arsh images loaded in a hidden stack.
          if(img.getAttribute('src'))img.removeAttribute('src');
          card.style.removeProperty('--shuffle-bg');
        }
      });
      deck.parentElement.querySelectorAll('.shuffle-progress-dot').forEach((dot,i)=>dot.classList.toggle('is-active',i===current));
      const a=db.assets[cardAt(current).dataset.asset];
      if(live)live.textContent='Showing '+(a?.title||'creative work')+'. Swipe to view another.';
    }
    function startFront(){
      stopVideo();
      if(!visible||document.hidden)return;
      const card=cardAt(current),a=db.assets[card.dataset.asset];
      if(!a||a.kind!=='reel')return;
      const video=document.createElement('video');
      video.className='shuffle-front-video';
      video.muted=true;video.defaultMuted=true;video.autoplay=true;video.playsInline=true;video.loop=true;
      video.preload='metadata';video.setAttribute('playsinline','');
      video.setAttribute('webkit-playsinline','');
      video.setAttribute('aria-label',a.title||'Current reel');
      video.poster=card.dataset.poster;
      card.querySelector('.shuffle-card-media').appendChild(video);
      activeVideo=video;
      video.src=src(card.dataset.asset);
      video.addEventListener('playing',()=>video.classList.add('is-playing'),{once:true});
      const attempt=video.play();attempt?.catch?.(()=>{});
    }
    function change(delta){
      if(moving||count<2)return;
      moving=true;
      deck.classList.add('has-interacted');
      stopVideo();
      const outgoing=cardAt(current);
      const flingClass=delta>0?'shuffle-fling-left':'shuffle-fling-right';
      if(!reduceMotion.matches)outgoing.classList.add(flingClass);
      current=(current+delta+count)%count;
      paint();
      window.setTimeout(()=>{
        outgoing.classList.remove(flingClass);
        moving=false;
        startFront();
      },reduceMotion.matches?0:380);
    }
    paint();
    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>{
        const was=visible;visible=entries[0].isIntersecting;
        if(visible&&!was&&!moving)startFront();
        else if(!visible&&was)stopVideo();
      },{threshold:.12});observer.observe(deck);
    }else{visible=true;startFront()}
    deck.addEventListener('pointerdown',e=>{
      if(moving||(e.pointerType==='mouse'&&e.button!==0))return;
      if(!e.target.closest('.shuffle-card[data-slot="front"]'))return;
      down={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dragging:false,card:cardAt(current)};
      down.card.setPointerCapture?.(e.pointerId);
    });
    deck.addEventListener('pointermove',e=>{
      if(!down||e.pointerId!==down.id)return;
      down.dx=e.clientX-down.x;
      const dy=e.clientY-down.y;
      if(!down.dragging&&(Math.abs(down.dx)>7&&Math.abs(down.dx)>Math.abs(dy)*.9))down.dragging=true;
      if(down.dragging){down.card.classList.add('shuffle-dragging');down.card.style.setProperty('--drag-x',down.dx+'px');down.card.style.setProperty('--drag-rot',(down.dx*.047)+'deg')}
    });
    function clearDrag(){
      if(!down)return null;
      const prev=down;
      prev.card.classList.remove('shuffle-dragging');
      prev.card.style.removeProperty('--drag-x');prev.card.style.removeProperty('--drag-rot');
      down=null;
      return prev;
    }
    deck.addEventListener('pointerup',e=>{
      if(!down||down.id!==e.pointerId)return;
      const prev=clearDrag();
      if(prev.dragging){suppressClickUntil=Date.now()+440;
        if(prev.dx<-48)change(1);else if(prev.dx>48)change(-1);
      }
    });
    deck.addEventListener('pointercancel',clearDrag);
    deck.addEventListener('lostpointercapture',clearDrag);
    deck.addEventListener('click',e=>{
      if(Date.now()<suppressClickUntil||moving)return;
      const card=e.target.closest('.shuffle-card');if(!card)return;
      if(card.dataset.slot==='right-near')change(1);
      else if(card.dataset.slot==='right-far')change(2);
      else if(card.dataset.slot==='left-near')change(-1);
      else if(card.dataset.slot==='left-far')change(-2);
      else if(card.dataset.slot==='front'&&activeVideo){setAudio(activeVideo.muted)}
    });
    deck.addEventListener('pointerover',e=>{
      if(e.pointerType!=='mouse'&&e.pointerType!=='pen')return;
      const card=e.target.closest('.shuffle-card[data-slot="front"]');
      if(card&&!card.contains(e.relatedTarget))setAudio(true);
    });
    deck.addEventListener('pointerout',e=>{
      if(e.pointerType!=='mouse'&&e.pointerType!=='pen')return;
      const card=e.target.closest('.shuffle-card[data-slot="front"]');
      if(card&&!card.contains(e.relatedTarget))setAudio(false);
    });
    deck.addEventListener('keydown',e=>{
      if(e.key==='ArrowLeft'){e.preventDefault();change(1)}
      else if(e.key==='ArrowRight'){e.preventDefault();change(-1)}
      else if(e.key==='Enter'||e.key===' '){e.preventDefault();if(activeVideo)setAudio(activeVideo.muted)}
    });
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden)stopVideo();else if(visible&&!moving)startFront();
    });
    window.addEventListener('pagehide',stopVideo);
  });
}
function bindReelPlayback(){
  const videos=new Set();
  const resetSound=video=>{video.muted=true;video.closest('.video-surface')?.classList.remove('is-audible');const b=video.closest('.video-surface')?.querySelector('.js-video-sound');if(b){b.setAttribute('aria-pressed','false');b.setAttribute('aria-label','Unmute this reel');b.innerHTML='🔇 <span>Sound</span>'}};
  const viewObserver='IntersectionObserver' in window?new IntersectionObserver(entries=>entries.forEach(entry=>{const video=entry.target;if(!entry.isIntersecting){resetSound(video);video.pause()}else if(!document.hidden){const play=video.play();play?.catch?.(()=>{})}}),{threshold:.08}):null;
  const syncVideo=video=>{if(videos.has(video))return;videos.add(video);viewObserver?.observe(video);video.muted=true;video.defaultMuted=true;if(!viewObserver){const attempt=video.play();if(attempt?.catch)attempt.catch(()=>{resetSound(video)})}};
  const syncAll=()=>document.querySelectorAll('.js-portfolio-video').forEach(syncVideo);
  function setAudio(video,on){if(!video)return;for(const other of videos){if(other!==video&&!other.muted)resetSound(other)}video.muted=!on;video.closest('.video-surface')?.classList.toggle('is-audible',on);const b=video.closest('.video-surface')?.querySelector('.js-video-sound');if(b){b.setAttribute('aria-pressed',on?'true':'false');b.setAttribute('aria-label',on?'Mute this reel':'Unmute this reel');b.innerHTML=on?'🔊 <span>Sound on</span>':'🔇 <span>Sound</span>'}if(video.paused){const tryPlay=video.play();if(tryPlay?.catch)tryPlay.catch(()=>{resetSound(video);video.play().catch(()=>{})})}}
  // Mouse and stylus hover only. Touchscreen sound remains a deliberate tap.
  document.addEventListener('pointerover',e=>{if(e.pointerType!=='mouse'&&e.pointerType!=='pen')return;const surface=e.target.closest('.video-surface');if(!surface||surface.contains(e.relatedTarget))return;setAudio(surface.querySelector('video'),true)});
  document.addEventListener('pointerout',e=>{if(e.pointerType!=='mouse'&&e.pointerType!=='pen')return;const surface=e.target.closest('.video-surface');if(!surface||surface.contains(e.relatedTarget))return;setAudio(surface.querySelector('video'),false)});
  document.addEventListener('click',e=>{const b=e.target.closest('.js-video-sound');if(!b)return;e.preventDefault();e.stopPropagation();const video=b.closest('.video-surface')?.querySelector('video');if(video)setAudio(video,video.muted)});
  const observer=new MutationObserver(syncAll);observer.observe(document.querySelector('#main'),{childList:true,subtree:true});observer.observe(document.querySelector('#dialog-root'),{childList:true,subtree:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)videos.forEach(resetSound)});
  window.addEventListener('pagehide',()=>videos.forEach(resetSound));
  syncAll();
}
function bindGallery(){let lastFocus=null;document.addEventListener('click',e=>{const b=e.target.closest('.js-open-art');if(!b)return;const k=b.dataset.asset,a=db.assets[k];if(!a)return;chime(690);lastFocus=b;let rootDlg=$('#dialog-root');rootDlg.innerHTML=`<div class="gallery-dialog" role="presentation"><div class="modal-inner" role="dialog" aria-modal="true" aria-label="Original artwork viewer" tabindex="-1"><div class="modal-top"><strong>Original composition · 100% visible</strong><button class="js-close-art" type="button" aria-label="Close artwork">×</button></div><div class="modal-work">${mediaFull(k)}</div><div class="modal-caption">${esc(a.title)} ${!isVideo(k)&&a.date?'· '+esc(a.date):''}</div></div></div>`;document.body.style.overflow='hidden';$('.modal-inner').focus()});document.addEventListener('click',e=>{if(e.target.classList.contains('js-close-art')||e.target.classList.contains('gallery-dialog'))closeModal()});document.addEventListener('keydown',e=>{const v=e.target.closest('video.js-open-art');if(v&&(e.key==='Enter'||e.key===' ')){e.preventDefault();v.click()}});document.addEventListener('keydown',e=>{if(!$('#dialog-root').firstElementChild)return;if(e.key==='Escape'){e.preventDefault();closeModal()}else if(e.key==='Tab'){const b=$('.js-close-art');if(b){e.preventDefault();b.focus()}}});function closeModal(){const v=$('.modal-work video');if(v){v.muted=true;v.pause()}$('#dialog-root').replaceChildren();document.body.style.overflow='';if(lastFocus)lastFocus.focus();lastFocus=null}}
function bindMotion(){const reduced=matchMedia('(prefers-reduced-motion: reduce)');const narrow=matchMedia('(max-width: 800px)');let rails=[];let ticking=false;function isActive(){return !reduced.matches&&!narrow.matches}function setup(){rails=$$('.js-horizontal').map(shell=>{const track=shell.querySelector('.story-track'),panels=[...shell.querySelectorAll('.story-panel')],stage=shell.querySelector('.story-sticky');return{shell,track,panels,stage,active:0,progress:0,span:1,travel:1}});layout();update()}function layout(){const enabled=isActive();rails.forEach(r=>{if(!enabled){r.shell.style.height='';r.track.style.transform='';r.panels.forEach(p=>p.setAttribute('data-active','true'));return}r.travel=window.innerWidth*(r.panels.length-1);r.span=Math.max(1,r.travel*.82);r.shell.style.height=(r.stage.getBoundingClientRect().height+r.span)+'px'})}function update(){if(!isActive())return;rails.forEach(r=>{const rect=r.shell.getBoundingClientRect(),progress=Math.max(0,Math.min(1,-rect.top/r.span));r.progress=progress;r.track.style.transform=`translate3d(${-r.travel*progress}px,0,0)`;const index=Math.max(0,Math.min(r.panels.length-1,Math.round(progress*(r.panels.length-1))));if(index!==r.active){r.active=index;chime(420+index*45)}r.panels.forEach((p,i)=>p.setAttribute('data-active',String(i===index)));r.shell.querySelectorAll('.js-jump').forEach((b,i)=>{b.classList.toggle('on',i===index);b.setAttribute('aria-current',i===index?'step':'false')});const lab=r.shell.querySelector('.js-scene-label');if(lab)lab.textContent=`${String(index+1).padStart(2,'0')} / ${String(r.panels.length).padStart(2,'0')}`})}function request(){if(ticking)return;ticking=true;requestAnimationFrame(()=>{ticking=false;update()})}function jump(r,index){index=Math.max(0,Math.min(r.panels.length-1,index));if(isActive()){const y=window.scrollY+r.shell.getBoundingClientRect().top+r.span*(index/(r.panels.length-1));window.scrollTo({top:y,behavior:'smooth'})}else{r.panels[index].scrollIntoView({block:'start',behavior:reduced.matches?'auto':'smooth'})}chime(580)}setup();rails.forEach(r=>{r.shell.querySelectorAll('.js-jump').forEach(b=>b.addEventListener('click',()=>jump(r,+b.dataset.jump)));r.shell.querySelector('.js-prev')?.addEventListener('click',()=>jump(r,r.active-1));r.shell.querySelector('.js-next')?.addEventListener('click',()=>jump(r,r.active+1));r.shell.addEventListener('keydown',e=>{if(document.activeElement!==r.shell)return;if(e.key==='ArrowRight'){e.preventDefault();jump(r,r.active+1)}if(e.key==='ArrowLeft'){e.preventDefault();jump(r,r.active-1)}})});window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',()=>{layout();request()},{passive:true});reduced.addEventListener?.('change',()=>{layout();request()});narrow.addEventListener?.('change',()=>{layout();request()});window.addEventListener('load',()=>{layout();update()});if(document.fonts?.ready)document.fonts.ready.then(()=>{layout();update()});if(!reduced.matches&&'IntersectionObserver' in window){document.body.classList.add('motion-ready');const ob=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('revealed');ob.unobserve(x.target)}}),{threshold:.06});$$('.reveal-on-scroll').forEach(x=>ob.observe(x))}}
header();footer();if(page==='home')home();else if(page==='case'){const c=clientMap[slug];$('#main').innerHTML=c?clientStory(c):'<div class="container section-pad"><h1>That chapter wandered off.</h1><a class="btn" href="../library.html">Back to the library</a></div>';}else if(page==='library')library();else if(page==='method')methodPage();else if(page==='about')about();else if(page==='contact')contact();bindGallery();bindMotion();bindReelPlayback();bindShuffleDecks();
})();

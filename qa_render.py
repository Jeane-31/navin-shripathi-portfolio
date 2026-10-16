from pathlib import Path
import json,mimetypes
from playwright.sync_api import sync_playwright
root=Path('/mnt/data/portfolio_harihar_reels_edit')
html=(root/'clients/harihar.html').read_text()
import re
# No relative CSS/JS source in synthetic document; those are injected from tested source.
html=re.sub(r'<link [^>]*href="(?:\.\./[^\"]+|https?://[^\"]+)"[^>]*>', '',html)
html=re.sub(r'<script [^>]*src="[^\"]+"[^>]*></script>', '',html)
html=html.replace('<head>','<head><base href="https://portfolio.test/clients/">')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
 for mode,w,h,touch in [('desktop',1440,900,False),('mobile',390,844,True)]:
  page=browser.new_page(viewport={'width':w,'height':h},device_scale_factor=1,is_mobile=touch,has_touch=touch)
  misses=[];errors=[]
  def route_handler(route):
   url=route.request.url
   rel=url.replace('https://portfolio.test/','')
   f=root/rel
   if f.is_file():
    mime=mimetypes.guess_type(str(f))[0] or 'application/octet-stream'
    route.fulfill(status=200,body=f.read_bytes(),content_type=mime)
   else:
    misses.append(url)
    route.abort()
  page.route('**/*',route_handler)
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='domcontentloaded')
  for css in ('styles.css','viewport-fix.css','reel-autoplay.css'):
   page.add_style_tag(content=(root/css).read_text())
  page.add_script_tag(content=(root/'data.js').read_text())
  page.add_script_tag(content=(root/'app.js').read_text())
  page.wait_for_timeout(1100)
  count=page.locator('.gallery-wall .video-work-tile').count();images=page.locator('.gallery-wall img').count();scenes=page.locator('.story-panel').count()
  ids=page.locator('.gallery-wall .video-surface').evaluate_all('(els)=>els.map(x=>x.dataset.videoId)')
  print(mode,'gallery video count',count,'gallery still count',images,'scenes',scenes,'IDS',ids)
  assert count==8 and images==0 and scenes==5
  assert len(set(ids))==8
  assert page.locator('.gallery-wall .video-cue').count()==8
  # Screenshot viewport of creative gallery, including first items
  page.locator('#creative-gallery').scroll_into_view_if_needed()
  page.wait_for_timeout(1500)
  page.screenshot(path=f'/mnt/data/harihar-reels-{mode}-preview.png')
  a=page.locator('.gallery-wall .video-surface').first
  a.scroll_into_view_if_needed()
  page.wait_for_timeout(600)
  v=a.locator('video')
  state=v.evaluate('(v)=>({paused:v.paused,muted:v.muted,loop:v.loop,autoplay:v.autoplay,width:v.videoWidth,height:v.videoHeight,readyState:v.readyState,currentTime:v.currentTime})')
  print(mode,'FIRST_VIDEO',state)
  assert state['loop'] and state['autoplay'] and state['muted']
  if mode=='desktop':
   a.hover(force=True)
   page.wait_for_timeout(200)
   print('audible after hover',v.evaluate('(v)=>!v.muted'))
   assert v.evaluate('(v)=>!v.muted')
   page.mouse.move(0,0)
   page.wait_for_timeout(150)
   assert v.evaluate('(v)=>v.muted')
  else:
   btn=a.locator('.js-video-sound');print('BEFORE',btn.get_attribute('aria-pressed'));btn.tap(force=True);page.wait_for_timeout(350)
   print('AFTER',btn.get_attribute('aria-pressed'),v.evaluate('(v)=>({muted:v.muted,paused:v.paused,vol:v.volume})'))
   assert v.evaluate('(v)=>!v.muted')
   btn.tap(force=True)
   assert v.evaluate('(v)=>v.muted')
  page.locator('.gallery-wall .video-open-btn').last.click(force=True)
  assert page.locator('.modal-work video').count()==1
  page.locator('.js-close-art').click(force=True)
  assert page.locator('.modal-work video').count()==0
  # no code errors, optional third party fonts not used in synthetic doc
  print(mode,'errors',errors,'missing',misses[:10])
  assert not errors,errors
  page.close()
 browser.close()

from pathlib import Path
from playwright.sync_api import sync_playwright
import subprocess,time,os,json
root=Path('/mnt/data/portfolio_harihar_reels_edit')
srv=subprocess.Popen(['python','-m','http.server','8790','--bind','127.0.0.1'],cwd=root,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
try:
 time.sleep(1.5)
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--autoplay-policy=no-user-gesture-required','--disable-dev-shm-usage','--allow-file-access-from-files'])
  for dev,w,h,is_mobile in [('desktop',1440,900,False),('mobile',390,844,True)]:
   page=b.new_page(viewport={'width':w,'height':h},device_scale_factor=1,is_mobile=is_mobile,has_touch=is_mobile)
   errors=[]
   failed=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.on('response',lambda r:failed.append((r.status,r.url)) if r.status>=400 and 'localhost' in r.url else None)
   url='file:///mnt/data/portfolio_harihar_reels_edit/clients/harihar.html'
   page.goto(url,wait_until='domcontentloaded',timeout=25000)
   page.wait_for_timeout(2300)
   count=page.locator('.gallery-wall .video-work-tile').count()
   ids=page.locator('.gallery-wall .video-surface').evaluate_all('(nodes)=>nodes.map(n=>n.getAttribute("data-video-id"))')
   all_video=page.locator('.gallery-wall video').count()
   image_count=page.locator('.gallery-wall img').count()
   scenes=page.locator('.story-panel').count()
   print(dev,'GALLERY',count,ids,'images',image_count,'scenes',scenes)
   assert count==8 and all_video==8 and image_count==0 and scenes==5,(count,all_video,image_count,scenes)
   # focus first grid video and screenshot
   gallery=page.locator('#creative-gallery')
   gallery.scroll_into_view_if_needed(timeout=12000)
   page.wait_for_timeout(700)
   page.screenshot(path=f'/mnt/data/harihar-reels-{dev}-preview.png',full_page=False)
   a=page.locator('.gallery-wall .video-surface').first
   a.scroll_into_view_if_needed(timeout=12000)
   page.wait_for_timeout(1000)
   v=a.locator('video')
   info=v.evaluate('(v)=>({paused:v.paused,muted:v.muted,loop:v.loop,autoplay:v.autoplay,w:v.videoWidth,h:v.videoHeight,ready:v.readyState,time:v.currentTime})')
   print(dev,'FIRST VIDEO',info)
   assert info['loop'] and info['autoplay'] and info['muted'] and info['w']>0
   if dev=='desktop':
    a.hover(force=True)
    page.wait_for_timeout(200)
    audible=v.evaluate('(v)=>!v.muted')
    print('HOVER AUDIBLE',audible)
    assert audible
    a.locator('.video-cue').count() == 1
    page.mouse.move(1,1)
    page.wait_for_timeout(200)
    assert v.evaluate('(v)=>v.muted')
   else:
    btn=a.locator('.video-sound-button')
    btn.click(force=True)
    page.wait_for_timeout(100)
    assert v.evaluate('(v)=>!v.muted')
    btn.click(force=True)
    assert v.evaluate('(v)=>v.muted')
   # Test modal for last featured reel, including landscape poster and full-frame
   page.locator('.gallery-wall .video-open-btn').last.click(force=True)
   page.wait_for_timeout(300)
   assert page.locator('.modal-work video').count()==1
   page.locator('.js-close-art').click(force=True)
   assert page.locator('.modal-work video').count()==0
   print(dev,'ERRORS',errors[:8],'FAILED',failed[:8])
   assert not errors,errors
   assert not failed,failed
   page.close()
  b.close()
finally:
 srv.terminate();srv.wait(timeout=5)

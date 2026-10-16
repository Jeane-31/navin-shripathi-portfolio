from pathlib import Path
import glob, json, re, shutil, subprocess, time
root=Path('/mnt/data/portfolio_harihar_reels_edit')
assets=root/'assets'
files=glob.glob('/mnt/data/hariharrealty_*.mp4')
match=lambda token: next(Path(f) for f in files if token in Path(f).name)
reels=[
 ('papa-reel',match('Bas_ek_j_question'),'Papa Approve Karse? · campaign teaser','2026-03-13','Already present unchanged; duplicate skipped',None),
 ('harihar-reel-big',match('Something_big_is_already'),'Something big is fixed for 19 March','2026-03-14','Campaign anticipation','Something big is already fixed'),
 ('harihar-reel-lagan',match('Lagan_hoy_ke_ghar'),'Lagan hoy ke ghar · Papa makes the final call','2026-03-20','Papa-approved family comedy','Lagan hoy ke ghar'),
 ('harihar-reel-decisions',match('Some_decisions_aren'),'More than numbers · decisions about life','2026-03-24','Lifestyle and family decisions','Some decisions aren’t just about numbers'),
 ('harihar-reel-investment',match('Stock_market_karta'),'Papa-approved 4 BHK · investment conversation','2026-03-22','Investment and villa pitch','Stock market karta pan better investment'),
 ('harihar-reel-dreams',match('Safalam_Luxuria_is_turning'),'Safalam Luxuria · dreams into reality','2024-12-31','4 BHK villa communication','Safalam Luxuria is turning dreams into reality'),
 ('harihar-reel-luxury',match('Luxury_is_more'),'Luxury is a way of life','2026-08-05','Premium lifestyle film','Luxury is more than a destination'),
 ('harihar-reel-evenings',match('Every_evening_feels'),'Every evening, a private getaway','2025-08-13','Evening lifestyle and amenities','Every evening feels like a private getaway'),
]
asset_updates={}
for id,src,title,date,alt,description in reels:
 if id=='papa-reel':continue
 target=assets/f'{id}.mp4'
 shutil.copyfile(src,target)
 poster=assets/f'{id}-poster.jpg'
 dur=float(json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','json',str(src)]))['format']['duration'])
 # Seek past beginning cards to make an informative poster while remaining in original proportions
 second=min(1.6,dur*.28)
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss',str(second),'-i',str(src),'-frames:v','1','-vf','scale=480:-2','-q:v','3',str(poster)],check=True)
 asset_updates[id]={'src':f'assets/{id}.mp4','kind':'reel','title':title,'date':date,'alt':f'Harihar Realty × Sammoda Grandeur reel: {alt}','poster':f'assets/{id}-poster.jpg','originFilename':src.name}
 print('ADDED',id,target.stat().st_size,poster.stat().st_size)

data_file=root/'data.js';s=data_file.read_text('utf-8')
# Update only the Harihar client creative set, leaving other clients untouched
start=s.index('      "slug": "harihar"')
end=s.index('      "slug": "sangath"',start)
section=s[start:end]
section,n=re.subn(r'(?s)(      "media": \[\n).*?(\n      \],)',lambda m:m.group(1)+'\n'.join('        '+json.dumps(r[0],ensure_ascii=False)+(',' if i<7 else '') for i,r in enumerate(reels))+m.group(2),section,count=1)
assert n==1
s=s[:start]+section+s[end:]
# insert video catalog records adjacent to existing Papa reel
marker='    "sangath-province": {'
assert s.count(marker)==1
entries=''.join('    '+json.dumps(id,ensure_ascii=False)+': '+json.dumps(d,ensure_ascii=False,indent=2).replace('\n','\n    ')+',\n' for id,d in asset_updates.items())
s=s.replace(marker,entries+marker,1)
data_file.write_text(s,'utf-8')

appfile=root/'app.js';a=appfile.read_text('utf-8')
# Add new sound cues, preserving existing custom cues
mark="  'papa-reel':'Papa says: hover for sound ☺',"
assert a.count(mark)==1
ins="\n".join([
 "  'harihar-reel-big':'Shhh… something big. Hover to hear 👀',",
 "  'harihar-reel-lagan':'Papa gets the mic. Hover for sound ♫',",
 "  'harihar-reel-decisions':'Big decision energy. Hover for sound ✳',",
 "  'harihar-reel-investment':'Hear Papa’s hot take. Hover for sound ↗',",
 "  'harihar-reel-dreams':'Villa dreams have a soundtrack. Hover ♫',",
 "  'harihar-reel-luxury':'Luxury sounds better. Hover for audio ✦',",
 "  'harihar-reel-evenings':'Sunset with a soundtrack. Hover to hear ☼',",
])
a=a.replace(mark,mark+'\n'+ins,1)
# Make both the scene's Creative Work description and the below-gallery intro accurate
mark="c.slug==='aaryahi'?'Six original Aaryahi Silver reels, playing on loop. Hover for sound; tap the speaker on mobile. Open any one to view it full-size.':"
assert a.count(mark)==1
a=a.replace(mark,mark+"c.slug==='harihar'?'Eight original Harihar × Sammoda reels, from Papa Approved teasers to Safalam Luxuria lifestyle films. They loop silently until you hover (or tap Sound on mobile). Open any reel for the full frame.':",1)
mark2="c.slug==='aaryahi'?'Six real Aaryahi reels. Always looping, silent until you hover (or tap Sound on mobile). Every original frame stays intact.':"
assert a.count(mark2)==1
a=a.replace(mark2,mark2+"c.slug==='harihar'?'Eight original Harihar × Sammoda reels. From Papa Approved comedy to Safalam Luxuria lifestyle, all looping quietly until you hover for sound (or tap Sound on mobile). No crop, full frame.':",1)
appfile.write_text(a,'utf-8')

with (root/'README.txt').open('a',encoding='utf-8') as f:
 f.write('\n13 October 2026 — Harihar Realty × Sammoda Grandeur reel gallery update\n')
 f.write('- Creative Work gallery now contains only the eight supplied Harihar Realty reels, replacing the previously displayed image/video selections.\n')
 f.write('- The first supplied Papa Approve Karse teaser is byte-for-byte identical to an existing asset, which is reused instead of duplicated.\n')
 f.write('- Seven new original MP4s and seven aspect-ratio-preserving poster JPEGs were added.\n')
 f.write('- The original hero campaign artwork remains as the homepage/library cover; original files were not deleted as they may support existing design components.\n')
 f.write('- Existing autoplay / muted looping, hover-for-sound, tap-to-unmute, sound cues and full-screen viewer are reused for the new reels.\n')

print('ALL REELS',[(x[0],str(x[1].name)[:40]) for x in reels])
print('NEW CATALOG ENTRIES',len(asset_updates))

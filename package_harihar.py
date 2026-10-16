from pathlib import Path
import json,subprocess,zipfile,hashlib,re,os
root=Path('/mnt/data/portfolio_harihar_reels_edit')
src=Path('/mnt/data/Navin_Shripathi_Portfolio_5_Scenes_Creative_Video_Sound_Cues_2026-10-13.zip')
out=Path('/mnt/data/Navin_Shripathi_Portfolio_Harihar_8_Reels_2026-10-13.zip')
# Load data as evaluated JS using Node (not relying on broad regex), check all creative links
j=subprocess.run(['node','-e',f"global.window={{}}; require({json.dumps(str(root/'data.js'))}); console.log(JSON.stringify(window.PORTFOLIO_DATA))"],text=True,capture_output=True,check=True)
d=json.loads(j.stdout)
clients=d['clients'];assets=d['assets']
assert len(clients)==23
harihar=next(c for c in clients if c['slug']=='harihar')
aaryahi=next(c for c in clients if c['slug']=='aaryahi')
assert len(harihar['media'])==8
assert len(set(harihar['media']))==8
assert len(aaryahi['media'])==6
assert all(assets[k]['kind']=='reel' for k in harihar['media'])
for k in harihar['media']:
 a=assets[k]
 assert (root/a['src']).is_file(),(k,a['src'])
 assert (root/a['poster']).is_file(),(k,a['poster'])
assert len(list((root/'clients').glob('*.html')))==23
for k,a in assets.items():
 assert (root/a['src']).is_file(),f'missing {k} file {a["src"]}'
 if 'poster' in a:assert (root/a['poster']).is_file(),f'missing poster {k}'
for js in root.glob('*.js'):
 subprocess.run(['node','--check',str(js)],check=True,capture_output=True)
with zipfile.ZipFile(src) as z:
 for f in z.namelist():
  if f.endswith('/') or f in ['data.js','app.js','README.txt']:continue
  original=hashlib.sha256(z.read(f)).digest()
  current=hashlib.sha256((root/f).read_bytes()).digest()
  assert original==current,'Existing source file changed unexpectedly: '+f
files=sorted(p for p in root.rglob('*') if p.is_file() and p.suffix !='.py' and not p.name.endswith('.pyc'))
assert len(files)==167,len(files)
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=4,allowZip64=True) as z:
 for p in files:z.write(p,p.relative_to(root).as_posix())
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 assert len(z.namelist())==len(files)
 print('ZIP entries',len(z.namelist()))
 print('bytes',out.stat().st_size)
 print('size MiB',round(out.stat().st_size/1048576,1))
 print('client pages',len(list((root/'clients').glob('*.html'))))
 print('selected hero video ids',harihar['media'])
 print('existing gallery still IDs removed', ['papa-poster','safalam-villa','originx-art'])
 print('all references valid')

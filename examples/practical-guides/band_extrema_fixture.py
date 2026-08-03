from __future__ import annotations
import argparse,json
from pathlib import Path
def run():
 grid=[-0.5+i/20 for i in range(21)]
 val=lambda x,y: -0.10-0.35*(x*x+y*y)
 cond=lambda x,y: 0.55+0.70*(x*x+y*y)-0.42*__import__('math').exp(-((x-.22)**2+(y-.08)**2)/.008)
 path=[(x,0.) for x in grid]+[(.5,y) for y in grid[1:]]+[(x,x) for x in grid[-2::-1]]
 pv=max((val(x,y),x,y) for x,y in path); pc=min((cond(x,y),x,y) for x,y in path)
 allp=[(x,y) for x in grid for y in grid]; fv=max((val(x,y),x,y) for x,y in allp); fc=min((cond(x,y),x,y) for x,y in allp)
 report={'fixture_type':'invented 2D reciprocal eigenvalue field','path_gap_eV':pc[0]-pv[0],'full_grid_gap_eV':fc[0]-fv[0],'path_extrema':{'VBM':pv,'CBM':pc},'full_grid_extrema':{'VBM':fv,'CBM':fc},'boundary':'Synthetic grid comparison only; no DFT, mesh convergence, or material gap.'}
 assert report['full_grid_gap_eV']<report['path_gap_eV']
 return report
def svg(r,p):
 p.parent.mkdir(parents=True,exist_ok=True); p.write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="520" viewBox="0 0 1000 520" role="img" aria-labelledby="t d"><title id="t">Path gap versus full-zone gap fixture</title><desc id="d">Invented reciprocal-space field where the full-grid conduction minimum is off the selected path and lowers the gap.</desc><rect width="1000" height="520" fill="#f8f5ee"/><text x="55" y="52" font-family="sans-serif" font-size="27" font-weight="700" fill="#172a3a">A visible path gap need not be the full-zone gap</text><rect x="95" y="105" width="350" height="300" fill="#e7eef1" stroke="#52616b"/><path d="M95 405 L445 405 L445 105" fill="none" stroke="#243746" stroke-width="5"/><circle cx="350" cy="270" r="12" fill="#a33d2d"/><text x="365" y="264" font-family="sans-serif" font-size="15">off-path CBM</text><text x="270" y="445" text-anchor="middle" font-family="sans-serif" font-size="17">invented reciprocal grid</text><rect x="535" y="145" width="350" height="105" rx="12" fill="#fff" stroke="#9aa8af"/><text x="565" y="185" font-family="sans-serif" font-size="19" font-weight="700">path-only separation</text><text x="565" y="225" font-family="sans-serif" font-size="28" fill="#2b6f8c">{r['path_gap_eV']:.3f} eV</text><rect x="535" y="285" width="350" height="105" rx="12" fill="#fff" stroke="#9aa8af"/><text x="565" y="325" font-family="sans-serif" font-size="19" font-weight="700">full-grid separation</text><text x="565" y="365" font-family="sans-serif" font-size="28" fill="#a33d2d">{r['full_grid_gap_eV']:.3f} eV</text><text x="500" y="490" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#52616b">Deterministic invented field · no eigenvalue solve, real Brillouin-zone search, or gap claim</text></svg>''',encoding='utf8')
if __name__=='__main__':
 a=argparse.ArgumentParser();a.add_argument('--svg',type=Path);x=a.parse_args();r=run();
 if x.svg:svg(r,x.svg)
 print(json.dumps(r,indent=2))

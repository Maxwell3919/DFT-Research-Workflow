from __future__ import annotations
import argparse, json, math
from pathlib import Path

def run():
    points=[('Γ',(0.,0.,0.)),('X',(.5,0.,0.)),('M',(.5,.5,0.)),('Γ',(0.,0.,0.))]
    scale=2*math.pi/5.0
    distance=[0.0]
    for (_,a),(_,b) in zip(points,points[1:]): distance.append(distance[-1]+math.dist(a,b)*scale)
    fermi=1.25
    raw=[[-0.4,0.6],[-0.2,0.8],[-0.3,0.7],[-0.4,0.6]]
    shifted=[[round(e-fermi,6) for e in row] for row in raw]
    assert len(distance)==4 and shifted[0]==[-1.65,-0.65]
    return {'fixture_type':'invented reciprocal path and eigenvalue ledger','reciprocal_scale_A_inv':scale,'points':[{'label':x,'fractional':y,'distance_A_inv':distance[i]} for i,(x,y) in enumerate(points)],'energy_reference':'invented Fermi shift of 1.25 eV','bands_eV_relative_to_reference':shifted,'boundary':'Format and arithmetic fixture; no DFT, path validation, or material band structure.'}

def svg(r,p):
 p.parent.mkdir(parents=True,exist_ok=True); pts=r['points']; x=[100+760*d/pts[-1]['distance_A_inv'] for d in [q['distance_A_inv'] for q in pts]]; b=r['bands_eV_relative_to_reference']; lines=[]
 for band,color in zip(zip(*b),['#2b6f8c','#a33d2d']): lines.append('<polyline fill="none" stroke="%s" stroke-width="4" points="%s"/>'%(color,' '.join(f'{xx},{300-yy*100}' for xx,yy in zip(x,band))))
 labels=''.join(f'<line x1="{xx}" y1="115" x2="{xx}" y2="390" stroke="#9aa8af"/><text x="{xx}" y="430" text-anchor="middle" font-family="sans-serif" font-size="18">{q["label"]}</text>' for xx,q in zip(x,pts))
 p.write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="500" viewBox="0 0 1000 500" role="img" aria-labelledby="t d"><title id="t">Invented reciprocal path ledger</title><desc id="d">An invented Gamma-X-M-Gamma path preserves fractional coordinates, cumulative reciprocal distance, and an explicit energy shift.</desc><rect width="1000" height="500" fill="#f8f5ee"/><text x="55" y="50" font-family="sans-serif" font-size="27" font-weight="700" fill="#172a3a">A path needs coordinates, order, and a reference</text><line x1="100" y1="300" x2="860" y2="300" stroke="#52616b"/>{''.join(lines)}{labels}<text x="55" y="475" font-family="sans-serif" font-size="14" fill="#52616b">Invented eigenvalues shifted by an invented Fermi reference · no electronic-structure calculation</text></svg>''',encoding='utf8')
if __name__=='__main__':
 a=argparse.ArgumentParser();a.add_argument('--svg',type=Path);x=a.parse_args();r=run();
 if x.svg:svg(r,x.svg)
 print(json.dumps(r,indent=2))

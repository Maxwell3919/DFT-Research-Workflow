from __future__ import annotations
import argparse
import json
from pathlib import Path

DEFAULT_INPUT = Path(__file__).with_name('data') / 'al-tin-interface-adhesion-2015.json'

def run(path=DEFAULT_INPUT):
    data=json.loads(path.read_text())
    rows=data['rows']
    assert data['source']['doi']=='https://doi.org/10.1103/PhysRevB.91.165413' and len(rows)==7
    assert [r['adhesion_eV'] for r in rows]==[-.61,-2.09,-.73,-1.78,-.94,-1.9,-1.38]
    return data

def svg(data,path):
    path.parent.mkdir(parents=True,exist_ok=True)
    colors=['#70808a','#d45b45','#704c8a']; pts=[]
    for i,row in enumerate(data['rows']):
        x=125+abs(row['adhesion_eV'])/2.2*700; y=420-row['removal_eV']/1.5*260
        pts.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="10" fill="{colors[row["transferred_layers"]]}"/><text x="{x+13:.1f}" y="{y+5:.1f}" font-family="sans-serif" font-size="12">{i+1}</text>')
    path.write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="560" viewBox="0 0 1000 560" role="img" aria-labelledby="t d"><title id="t">Published Al/TiN Table 2 redraw</title><desc id="d">Seven published PBE Al/TiN contact rows compare magnitude of negative adhesion energy with Al layer removal energy. Colour shows reported transferred Al layers.</desc><rect width="1000" height="560" fill="#f8f5ee"/><text x="55" y="52" font-family="sans-serif" font-size="26" font-weight="700" fill="#172a3a">Al/TiN contact-separation table redraw</text><text x="55" y="82" font-family="sans-serif" font-size="15" fill="#52616b">Feldbauer et al., Table 2 · PBE · eV per interface cell · published data, not rerun here</text><line x1="125" y1="420" x2="850" y2="420" stroke="#243746"/><line x1="125" y1="150" x2="125" y2="420" stroke="#243746"/><line x1="125" y1="420" x2="825" y2="150" stroke="#a33d2d" stroke-dasharray="8 6"/><text x="590" y="170" font-family="sans-serif" font-size="14" fill="#a33d2d">equal magnitudes guide</text>{''.join(pts)}<text x="490" y="470" text-anchor="middle" font-family="sans-serif" font-size="17">|negative adhesion / interaction energy| (eV per interface cell)</text><text x="30" y="270" transform="rotate(-90 30 270)" text-anchor="middle" font-family="sans-serif" font-size="17">Al-layer removal energy (eV per interface cell)</text><text x="130" y="515" font-family="sans-serif" font-size="14" fill="#52616b">colour: 0 layers</text><circle cx="245" cy="510" r="7" fill="#70808a"/><text x="270" y="515" font-family="sans-serif" font-size="14" fill="#52616b">1 layer</text><circle cx="350" cy="510" r="7" fill="#d45b45"/><text x="375" y="515" font-family="sans-serif" font-size="14" fill="#52616b">2 layers</text><circle cx="455" cy="510" r="7" fill="#704c8a"/><text x="650" y="515" font-family="sans-serif" font-size="13" fill="#52616b">Labels 1–7 follow the committed table snapshot.</text></svg>''',encoding='utf8')

if __name__=='__main__':
    a=argparse.ArgumentParser();a.add_argument('--input',type=Path,required=True);a.add_argument('--svg',type=Path);x=a.parse_args();d=run(x.input)
    if x.svg:svg(d,x.svg)
    print(json.dumps(d,indent=2))

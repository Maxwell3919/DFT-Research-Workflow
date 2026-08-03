from __future__ import annotations
import argparse
import json
from pathlib import Path

def run():
    a, b = 3.00, 3.08
    rows=[]
    for ma in range(1,5):
        for mb in range(1,5):
            la, lb = ma*a, mb*b
            mismatch=abs(la-lb)/((la+lb)/2)
            if mismatch < .12: rows.append({"A_repeat":ma,"B_repeat":mb,"A_length_A":la,"B_length_A":lb,"symmetric_mismatch":mismatch,"registries":["(0,0)","(1/2,0)","(1/2,1/2)"]})
    rows.sort(key=lambda r:(round(r['symmetric_mismatch'],12),r['A_repeat'],r['B_repeat']))
    assert rows[0]['A_repeat']==1 and rows[0]['B_repeat']==1
    return {"fixture_type":"invented bounded diagonal supercell enumeration", "lattices_A":{"A":a,"B":b}, "candidates":rows, "evidence_boundary":"Not a full Zur-McGill search; rotations, general matrices, terminations, relaxation, and strain partition are excluded."}

def svg(r,p):
    p.parent.mkdir(parents=True,exist_ok=True)
    rows=r['candidates'][:5]
    circles=''.join(f'<circle cx="{150+i*160}" cy="{390-rr["symmetric_mismatch"]*1500}" r="18" fill="#2b6f8c"/><text x="{150+i*160}" y="430" text-anchor="middle" font-family="sans-serif" font-size="15">{rr["A_repeat"]}×A / {rr["B_repeat"]}×B</text>' for i,rr in enumerate(rows))
    labels=''.join(f'<text x="{150+i*160}" y="{365-rr["symmetric_mismatch"]*1500}" text-anchor="middle" font-family="sans-serif" font-size="14">{rr["symmetric_mismatch"]*100:.2f}%</text>' for i,rr in enumerate(rows))
    p.write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="520" viewBox="0 0 1000 520" role="img" aria-labelledby="t d"><title id="t">Bounded lattice-match fixture</title><desc id="d">Invented square lattice repetitions ranked by symmetric mismatch, with registry still separate.</desc><rect width="1000" height="520" fill="#f8f5ee"/><text x="55" y="55" font-family="sans-serif" font-size="27" font-weight="700" fill="#172a3a">A matched period is only a candidate</text><text x="55" y="90" font-family="sans-serif" font-size="16" fill="#52616b">Invented square lattices: A = 3.00 Å, B = 3.08 Å; diagonal repetitions only</text><line x1="100" y1="390" x2="920" y2="390" stroke="#52616b" stroke-width="2"/>{circles}{labels}<rect x="100" y="130" width="800" height="120" rx="14" fill="#e7eef1"/><text x="130" y="170" font-family="sans-serif" font-size="19" font-weight="700" fill="#243746">After a cell is retained, registry remains a distinct variable</text><text x="130" y="210" font-family="sans-serif" font-size="17" fill="#52616b">(0,0) · (1/2,0) · (1/2,1/2) are candidate translations, not relaxed minima</text><text x="500" y="485" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#52616b">Deterministic teaching fixture · not a full matcher or a material interface calculation</text></svg>''',encoding='utf8')

if __name__=='__main__':
    a=argparse.ArgumentParser();a.add_argument('--svg',type=Path);x=a.parse_args();r=run()
    if x.svg: svg(r,x.svg)
    print(json.dumps(r,indent=2))

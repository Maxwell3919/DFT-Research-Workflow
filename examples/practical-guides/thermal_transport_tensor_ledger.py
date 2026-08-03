"""Invented lattice-transport tensor ledger; no phonons, lifetimes, or BTE solve is run."""
from __future__ import annotations
import argparse
from pathlib import Path

def run() -> dict[str, object]:
    modes=[{"label":"acoustic","C":2.0,"v":3.0,"response":0.5},{"label":"optical","C":1.0,"v":1.0,"response":0.2},{"label":"excluded-boundary","C":4.0,"v":2.0,"response":0.0}]
    terms=[round(m["C"]*m["v"]*m["response"],6) for m in modes]
    return {"fixture":"invented particle-like transport tensor ledger","mode_terms":terms,"invented_kappa_xx":round(sum(terms),6),"normalization":"invented per declared volume","boundary":"Invented arithmetic only; no phonon spectrum, lifetime, RTA, LBTE, Wigner transport, or material thermal conductivity."}

def svg(r:dict[str,object])->str:
    b=''.join(f'<rect x="{65+i*95}" y="{155-v*30:.1f}" width="42" height="{v*30:.1f}" fill="#2563eb"/><text x="{55+i*95}" y="180" font-size="10">{["acoustic","optical","excluded"][i]}</text>' for i,v in enumerate(r["mode_terms"]))
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 225" role="img" aria-labelledby="t d"><title id="t">Invented lattice transport ledger</title><desc id="d">Two invented modal contributions and one explicitly excluded boundary row appear in an invented transport tensor ledger.</desc><rect width="390" height="225" fill="white"/><text x="28" y="30" font-size="16">invented modal κ ledger</text><path d="M40 155H355" stroke="#334155"/>{b}<text x="28" y="210" font-size="11">Only declared particle-like terms enter this invented sum.</text></svg>'

if __name__=="__main__":
    p=argparse.ArgumentParser();p.add_argument("--svg",type=Path);a=p.parse_args();r=run();assert r["invented_kappa_xx"]==3.2
    if a.svg:a.svg.parent.mkdir(parents=True,exist_ok=True);a.svg.write_text(svg(r),encoding="utf-8")
    print(r)

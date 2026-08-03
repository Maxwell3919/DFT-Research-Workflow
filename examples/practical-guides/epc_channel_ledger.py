"""Invented EPC-channel bookkeeping; no DFPT, matrix element, linewidth, or lambda is calculated."""
from __future__ import annotations
import argparse
from pathlib import Path

def run() -> dict[str, object]:
    channels=[{"label":"included-A","g2":0.8,"weight":0.25},{"label":"included-B","g2":0.5,"weight":0.40},{"label":"excluded-off-window","g2":0.9,"weight":0.0}]
    terms=[round(c["g2"]*c["weight"],6) for c in channels]
    return {"fixture":"invented EPC channel ledger","weighted_terms":terms,"invented_weighted_sum":round(sum(terms),6),"boundary":"Invented multiplication only; no Kohn-Sham states, DFPT perturbation, electron-phonon matrix element, linewidth, lambda, alpha-squared-F, transport, or superconductivity."}

def svg(r:dict[str,object])->str:
    bars=''.join(f'<rect x="{65+i*100}" y="{155-v*180:.1f}" width="44" height="{v*180:.1f}" fill="#7c3aed"/><text x="{50+i*100}" y="180" font-size="10">{["A","B","excluded"][i]}</text>' for i,v in enumerate(r["weighted_terms"]))
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 225" role="img" aria-labelledby="t d"><title id="t">Invented electron--phonon channel ledger</title><desc id="d">Two invented weighted channel terms and one explicitly excluded row appear in a bookkeeping diagram.</desc><rect width="390" height="225" fill="white"/><text x="28" y="30" font-size="16">invented weighted EPC ledger</text><path d="M40 155H355" stroke="#334155"/>{bars}<text x="28" y="210" font-size="11">This is bookkeeping, not a matrix-element calculation.</text></svg>'

if __name__=="__main__":
    p=argparse.ArgumentParser();p.add_argument("--svg",type=Path);a=p.parse_args();r=run();assert r["invented_weighted_sum"]==0.4
    if a.svg:a.svg.parent.mkdir(parents=True,exist_ok=True);a.svg.write_text(svg(r),encoding="utf-8")
    print(r)

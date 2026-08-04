"""Invented spectral-moment bookkeeping; no alpha2F, Eliashberg, gap, or Tc calculation is run."""
from __future__ import annotations
import argparse
from pathlib import Path

def run() -> dict[str, object]:
    bins=[{"label":"low","weight":0.20,"log_frequency":1.0},{"label":"high","weight":0.30,"log_frequency":2.0},{"label":"excluded","weight":0.00,"log_frequency":3.0}]
    moment=sum(b["weight"]*b["log_frequency"] for b in bins)
    return {"fixture":"invented superconductivity spectral-moment ledger","weighted_log_terms":[round(b["weight"]*b["log_frequency"],6) for b in bins],"invented_log_moment":round(moment,6),"declared_mu_star_scenarios":["not a calculated Coulomb pseudopotential","not a universal input"],"boundary":"Invented arithmetic only; no alpha-squared-F, lambda, omega-log, Coulomb kernel, Eliashberg equation, gap, Tc, superconductivity, or material conclusion."}

def svg(r:dict[str,object])->str:
    bars=''.join(f'<rect x="{65+i*100}" y="{155-v*80:.1f}" width="44" height="{v*80:.1f}" fill="#b45309"/><text x="{50+i*100}" y="180" font-size="10">{["low","high","excluded"][i]}</text>' for i,v in enumerate(r["weighted_log_terms"]))
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 225" role="img" aria-labelledby="t d"><title id="t">Invented superconductivity moment ledger</title><desc id="d">Two invented weighted logarithmic terms and one explicitly excluded row appear in a spectral-moment bookkeeping diagram.</desc><rect width="390" height="225" fill="white"/><text x="28" y="30" font-size="16">invented spectral moment ledger</text><path d="M40 155H355" stroke="#334155"/>{bars}<text x="28" y="210" font-size="11">No gap equation or transition temperature is solved.</text></svg>'

if __name__=="__main__":
    p=argparse.ArgumentParser();p.add_argument("--svg",type=Path);a=p.parse_args();r=run();assert r["invented_log_moment"]==0.8
    if a.svg:a.svg.parent.mkdir(parents=True,exist_ok=True);a.svg.write_text(svg(r),encoding="utf-8")
    print(r)

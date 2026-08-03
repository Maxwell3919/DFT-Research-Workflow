#!/usr/bin/env python3
"""Deterministic invented charge-difference closure fixture; no DFT."""
from __future__ import annotations
import argparse, json
from pathlib import Path
COMBINED=[1.02,0.98,1.10,0.90]
FRAGMENTS=[1.00,1.00,1.00,1.00]
def run():
    delta=[a-b for a,b in zip(COMBINED,FRAGMENTS)]
    if abs(sum(delta))>1e-12: raise SystemExit('fixture must close')
    return {'fixture':'invented compatible density cells','grid_cells':4,'full_cell_delta_integral':sum(delta),'positive_cell_sum':sum(x for x in delta if x>0),'negative_cell_sum':sum(x for x in delta if x<0)}
def main():
    p=argparse.ArgumentParser(); p.add_argument('--svg',type=Path,required=True); a=p.parse_args(); a.svg.parent.mkdir(parents=True,exist_ok=True); a.svg.write_text('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="360"><rect width="900" height="360" fill="#f8f5ee"/><text x="45" y="55" font-family="sans-serif" font-size="26" font-weight="700">Invented difference density closes over its full cell</text><rect x="130" y="130" width="130" height="130" fill="#c94747"/><rect x="260" y="130" width="130" height="130" fill="#4b83b5"/><rect x="390" y="130" width="130" height="130" fill="#c94747"/><rect x="520" y="130" width="130" height="130" fill="#4b83b5"/><text x="130" y="305" font-family="sans-serif" font-size="18">red +0.02, blue −0.02 per invented cell; full-cell integral = 0</text></svg>',encoding='utf-8'); print(json.dumps(run(),indent=2)); print('Execution establishes invented-grid arithmetic and SVG rendering only; it is not a DFT calculation.')
if __name__=='__main__': main()

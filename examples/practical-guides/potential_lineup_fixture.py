#!/usr/bin/env python3
"""Deterministic invented potential-lineup arithmetic; no DFT."""
from __future__ import annotations
import argparse,json
from pathlib import Path
def run():
    a_edge,a_ref,b_edge,b_ref,lineup=-1.1,-4.0,-0.7,-3.4,0.18
    offset=(b_edge-b_ref)-(a_edge-a_ref)+lineup
    return {'fixture':'invented bulk-reference and interface-lineup terms','valence_offset':offset,'units':'invented eV','closure':'bulk edge-to-reference terms plus one explicit interface step'}
def main():
    p=argparse.ArgumentParser();p.add_argument('--svg',type=Path,required=True);a=p.parse_args();a.svg.parent.mkdir(parents=True,exist_ok=True);a.svg.write_text('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="360"><rect width="900" height="360" fill="#f8f5ee"/><text x="45" y="55" font-family="sans-serif" font-size="26" font-weight="700">Invented interface lineup retains bulk references and one step</text><line x1="100" y1="240" x2="760" y2="240" stroke="#52616b" stroke-width="3"/><path d="M130 190H370V150H610V110H760" fill="none" stroke="#2b6f8c" stroke-width="6"/><text x="130" y="300" font-family="sans-serif" font-size="18">invented bulk A reference, interface step, and bulk B reference</text></svg>',encoding='utf-8');print(json.dumps(run(),indent=2));print('Execution establishes invented lineup arithmetic and SVG rendering only; it is not a DFT calculation.')
if __name__=='__main__':main()

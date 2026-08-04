"""Deterministic invented jump-network arithmetic; no NEB, phonons, or DFT is run."""
from __future__ import annotations
from pathlib import Path

def run(svg: str | None = None) -> dict:
    jump_length_sq = 4.0; multiplicity = 4; dimension = 2; correlation = 0.5; invented_rate = 3.0
    diffusion = correlation * multiplicity * jump_length_sq * invented_rate / (2 * dimension)
    result={"fixture":"invented equivalent-hop network","diffusion_ledger":diffusion,"excluded":"unequal-energy hop","does_not_establish":"a migration barrier, free energy, prefactor, rate, diffusivity, or material conclusion"}
    if svg: Path(svg).write_text('<svg xmlns="http://www.w3.org/2000/svg" width="720" height="220"><title>Invented diffusion-network ledger</title><rect width="720" height="220" fill="white"/><circle cx="160" cy="110" r="21" fill="#bbf7d0"/><circle cx="360" cy="110" r="21" fill="#bbf7d0"/><circle cx="560" cy="110" r="21" fill="#bbf7d0"/><path d="M185 110H335M385 110H535" stroke="#166534" stroke-width="5"/><text x="90" y="50" font-family="sans-serif" font-size="19">invented equivalent-hop ledger</text><text x="190" y="180" font-family="sans-serif" font-size="16">D = f z l² Γ / (2d)</text></svg>\n',encoding="utf-8")
    return result

if __name__ == "__main__": print(run())

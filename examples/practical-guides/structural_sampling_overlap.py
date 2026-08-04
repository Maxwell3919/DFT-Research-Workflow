"""Deterministic invented umbrella-window overlap ledger; no sampling is run."""
from pathlib import Path

def run(svg=None):
    windows=[("left",[0,1,2]),("middle",[1,2,3]),("right",[2,3,4])]
    shared=[sorted(set(a)&set(b)) for (_,a),(_,b) in zip(windows,windows[1:])]
    result={"fixture":"invented umbrella-window supports","neighbouring_shared_bins":shared,"all_neighbours_overlap":all(shared),"does_not_establish":"a biased trajectory, WHAM solution, free-energy surface, convergence, rate, or material conclusion"}
    if svg:
        Path(svg).write_text('<svg xmlns="http://www.w3.org/2000/svg" width="720" height="240"><title>Invented umbrella-window overlap ledger</title><rect width="720" height="240" fill="white"/><text x="45" y="42" font-family="sans-serif" font-size="20">invented window supports: overlap is necessary, not sufficient</text><path d="M90 110H630" stroke="#334155"/><rect x="100" y="90" width="210" height="42" rx="8" fill="#bfdbfe"/><rect x="250" y="90" width="210" height="42" rx="8" fill="#bbf7d0"/><rect x="400" y="90" width="210" height="42" rx="8" fill="#fde68a"/><text x="150" y="116" font-family="sans-serif" font-size="15">left</text><text x="320" y="116" font-family="sans-serif" font-size="15">middle</text><text x="475" y="116" font-family="sans-serif" font-size="15">right</text><text x="116" y="190" font-family="sans-serif" font-size="16">shared support does not prove equilibrium, reweighting, or a free energy</text></svg>\n')
    return result

if __name__ == '__main__': print(run())

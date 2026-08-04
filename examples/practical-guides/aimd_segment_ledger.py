"""Deterministic invented trajectory-segment ledger; it does not propagate AIMD."""
from pathlib import Path
def run(svg=None):
    rows=[("warmup",0,4,False),("production-a",4,10,True),("production-b",10,16,True)]
    retained=sum(end-start for _,start,end,keep in rows if keep)
    result={"fixture":"invented segment labels","retained_time":retained,"segments":rows,"does_not_establish":"an AIMD trajectory, equilibration, ensemble sampling, transport, free energy, or material conclusion"}
    if svg: Path(svg).write_text('<svg xmlns="http://www.w3.org/2000/svg" width="720" height="220"><title>Invented AIMD segment ledger</title><rect width="720" height="220" fill="white"/><rect x="70" y="90" width="160" height="45" fill="#fecaca"/><rect x="230" y="90" width="220" height="45" fill="#bbf7d0"/><rect x="450" y="90" width="200" height="45" fill="#bbf7d0"/><text x="75" y="70" font-family="sans-serif" font-size="19">invented trajectory segmentation</text><text x="90" y="118" font-family="sans-serif" font-size="14">warmup excluded</text><text x="275" y="118" font-family="sans-serif" font-size="14">production A</text><text x="490" y="118" font-family="sans-serif" font-size="14">production B</text><text x="180" y="185" font-family="sans-serif" font-size="16">retained time is a label, not convergence evidence</text></svg>\n')
    return result
if __name__=='__main__': print(run())

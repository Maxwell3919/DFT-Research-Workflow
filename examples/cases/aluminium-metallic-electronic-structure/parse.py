#!/usr/bin/env python3
"""Fail-closed inspection of the captured QE Al workflow."""
from __future__ import annotations
import csv, hashlib, json, re
from pathlib import Path
import matplotlib.pyplot as plt

ROOT=Path(__file__).resolve().parent
EXPECTED={
 'input/scf.in':'660983565543f2bc154fe3d79a7bf480b2e02b9ae705d706457c661a64087ac0',
 'input/nscf.in':'1fdef0bc99e977e96b5d7cec1b750fe009170253a2953f197212c01103ff259d',
 'input/bands.in':'62a0406cd30f6b85c358e2f8efb76aab1ee79f8d4fbc494329e9d5c906c53141',
 'source/fixture-metadata.json':'ff43d63d3e654711a547a57cbf6f63170e56009b395dc6e7e83e4b46fd066cbd',
 'source/fixture-mesh.csv':'5bc4e7bd565ea99e3fd774de860b9aeb37b90874dfbe8fa484c4d0202758c9b4',
 'source/fixture-band-path.csv':'e6de08c86aa1d17fae2bb17fe8ee2b63a27e72379795cc611660c5ca20a17242',
 'output/scf.out':'3a48a4fade8c52fd1b5e4d816be439de79911b3c9d7ea3d71f16257b6c9e0b39',
 'output/nscf-full.out':'fe4e1ecb29004cfadecff46d6b81748b085682c0abfc987be0be4e28205fed66',
 'output/bands.out':'312a05a44bbb15ed5ee5c437ac52fd658a2e43e35b56a2b49cfb231d711b4a95',
}
def h(rel): return hashlib.sha256((ROOT/rel).read_bytes()).hexdigest()
def need(ok,msg):
 if not ok: raise SystemExit('FAIL '+msg)
def art(role,rel):
 p=ROOT/rel; return {'role':role,'path':rel,'sha256':h(rel),'bytes':p.stat().st_size}
def out_ok(rel, markers):
 text=(ROOT/rel).read_text(encoding='utf-8')
 need('Program PWSCF v.7.5' in text, rel+' missing QE 7.5 banner')
 need(text.count('JOB DONE.')==1, rel+' must contain one JOB DONE marker')
 for fatal in ('Error in routine', 'convergence NOT achieved', 'stopping ...'):
  need(fatal not in text, rel+' contains fatal/nonconvergence marker '+fatal)
 for marker in markers: need(marker in text, rel+' missing '+marker)
 return text
def main():
 for rel,expected in EXPECTED.items(): need(h(rel)==expected,'SHA mismatch '+rel)
 for rel in ('output/scf.err','output/nscf-full.err','output/bands.err'): need((ROOT/rel).read_bytes()==b'',rel+' is not empty')
 meta=json.loads((ROOT/'source/fixture-metadata.json').read_text())
 scf=out_ok('output/scf.out',['convergence has been achieved in   5 iterations','the Fermi energy is     7.8018 ev'])
 nscf=out_ok('output/nscf-full.out',['End of band structure calculation','the Fermi energy is     7.8018 ev'])
 bands=out_ok('output/bands.out',['End of band structure calculation'])
 for rel in ('input/scf.in','input/nscf.in','input/bands.in'):
  text=(ROOT/rel).read_text(); need("occupations = 'smearing'" in text and "smearing = 'mv'" in text and 'degauss = 0.02' in text,rel+' lacks explicit metallic policy')
 need('K_POINTS automatic\n  8 8 8 0 0 0' in (ROOT/'input/scf.in').read_text(),'SCF mesh missing')
 need('nosym = .true.' in (ROOT/'input/nscf.in').read_text() and 'noinv = .true.' in (ROOT/'input/nscf.in').read_text(),'full-zone policy missing')
 need('K_POINTS crystal_b' in (ROOT/'input/bands.in').read_text(),'band path missing')
 mesh=list(csv.DictReader(open(ROOT/'source/fixture-mesh.csv',newline=''))); path=list(csv.DictReader(open(ROOT/'source/fixture-band-path.csv',newline='')))
 need(len(mesh)==512 and len(path)==145,'fixture table lengths differ')
 fermi=float(meta['fermi_energy_ev']); m2=[float(r['band_2_ev']) for r in mesh]; p2=[float(r['band_2_ev']) for r in path]
 crossings=sum((a-fermi)*(b-fermi)<0 for a,b in zip(p2,p2[1:])); near=sum(abs(v-fermi)<=.25 for v in m2)
 need(crossings==3 and near==48,'fixture sampling ledger mismatch')
 summary={'qe_version':'7.5','captured_stages':['scf','nscf-full-zone','bands'],'scf_iterations':5,'fermi_energy_ev':fermi,'mesh_points':len(mesh),'path_points':len(path),'selected_band_crossing_intervals':crossings,'near_fermi_mesh_points_abs_delta_leq_0_25_ev':near,'evidence_boundary':'Execution and selected parsed fixture checks only; no convergence or material conclusion.'}
 (ROOT/'derived').mkdir(exist_ok=True); (ROOT/'figures').mkdir(exist_ok=True)
 (ROOT/'derived/captured-run-summary.json').write_text(json.dumps(summary,indent=2,sort_keys=True)+'\n')
 with open(ROOT/'derived/sampled-band2-summary.csv','w',newline='') as f:
  w=csv.writer(f,lineterminator='\n'); w.writerow(['dataset','point_count','band_2_min_ev','band_2_max_ev','fermi_ev','boundary']); w.writerow(['full-zone',len(m2),f'{min(m2):.4f}',f'{max(m2):.4f}',f'{fermi:.4f}','sampled band ledger; not a DOS']); w.writerow(['band-path',len(p2),f'{min(p2):.4f}',f'{max(p2):.4f}',f'{fermi:.4f}','path; not Brillouin-zone integration'])
 fig,ax=plt.subplots(figsize=(6.2,3.8)); ax.hist([v-fermi for v in m2],bins=42,color='#2b6cb0'); ax.axvline(0,color='#b91c1c',label='Fermi reference'); ax.set(xlabel='Band 2 minus Fermi level (eV)',ylabel='Sampled mesh points',title='Al 8x8x8 captured fixture: sampling only'); ax.legend(frameon=False); fig.tight_layout(); fig.savefig(ROOT/'figures/fixture-band2-sampling.png',dpi=160); plt.close(fig)
 artifacts=[art('SCF input','input/scf.in'),art('NSCF input','input/nscf.in'),art('bands input','input/bands.in'),art('SCF stdout','output/scf.out'),art('SCF stderr','output/scf.err'),art('NSCF stdout','output/nscf-full.out'),art('NSCF stderr','output/nscf-full.err'),art('bands stdout','output/bands.out'),art('bands stderr','output/bands.err'),art('fixture metadata','source/fixture-metadata.json'),art('fixture mesh','source/fixture-mesh.csv'),art('fixture path','source/fixture-band-path.csv'),art('compact excerpt','output/compact-source-excerpt.txt'),art('strict summary','derived/captured-run-summary.json'),art('derived table','derived/sampled-band2-summary.csv'),art('derived PNG','figures/fixture-band2-sampling.png')]
 manifest={'schema_version':'1.0','case_id':'aluminium-metallic-electronic-structure','title':'Aluminium metallic electronic structure captured QE workflow','case_kind':'worked-workflow','evidence_class':'real-execution','public_host_label':'Talos-captured public case evidence','started_at':None,'completed_at':None,'exit_code':0,'software':[{'name':'Quantum ESPRESSO PWSCF','version':'7.5','interface':'MPI CLI (one recorded process)'},{'name':'case-local strict parser','version':'1.0','interface':'Python CLI'}],'sources':[{'id':'al-qe-full-zone-fixture','role':'project teaching fixture and captured-output ledger','path':'source/fixture-metadata.json','sha256':h('source/fixture-metadata.json'),'licence_boundary':'No private host path, pseudopotential body, restart tree, or wavefunction payload is published.'}],'commands':[{'stage':'scf','command':'pw.x -in scf.in > scf.out 2> scf.err','exit_code':0},{'stage':'full-zone-nscf','command':'pw.x -in nscf.in > nscf-full.out 2> nscf-full.err','exit_code':0},{'stage':'bands','command':'pw.x -in bands.in > bands.out 2> bands.err','exit_code':0},{'stage':'case-parse','command':'python3 parse.py','exit_code':0}],'artifacts':artifacts,'gates':{'G0':{'status':'PASS','summary':'Required tree and declared input/output hashes pass strict parsing.'},'G1':{'status':'PASS','summary':'Captured QE 7.5 SCF, NSCF, and bands outputs each have one terminal marker and empty captured stderr.'},'G2':{'status':'PASS','summary':'Captured SCF reports electronic convergence in 5 iterations at its declared threshold; this is not a convergence study.'},'G3':{'status':'PASS','summary':'Three-stage stdout/stderr, exact inputs, compact excerpt, and hash-bound derived artifacts are present.'},'G4':{'status':'NOT TESTED','summary':'No observable-specific k-mesh, smearing, cutoff, empty-band, or DOS-broadening convergence series.'},'G5':{'status':'NOT CLAIMED','summary':'No physical or material-level scientific conclusion is claimed.'}},'claim_boundary':{'supports':['A captured QE 7.5 metallic SCF, full-zone NSCF, and band-path execution record with hash-bound staged outputs.'],'does_not_support':['A converged DOS, Fermi surface, EOS, elastic property, carrier density, or transport result.','A universal smearing/k-mesh prescription.','A material-level physical or scientific conclusion.']}}
 (ROOT/'manifest.json').write_text(json.dumps(manifest,indent=2,sort_keys=True)+'\n')
 print('PASS captured QE Al workflow parsed with G4/G5 explicitly unclaimed')
if __name__=='__main__': main()

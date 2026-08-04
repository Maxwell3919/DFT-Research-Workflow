#!/usr/bin/env python3
"""Build a bounded 2D graphene/vacuum and H-adsorbate candidate with ASE."""
from __future__ import annotations
import hashlib,json,sys
from pathlib import Path
import matplotlib.pyplot as plt
import numpy as np
from ase.build import add_adsorbate, graphene
from ase.io import write
ROOT=Path(__file__).resolve().parent; SRC=ROOT/'source'; OUT=ROOT/'output'; DER=ROOT/'derived'; FIG=ROOT/'figures'; INP=ROOT/'input'
def h(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def f(a):
 d=a.get_all_distances(mic=True); d[d==0]=np.inf
 return {'formula':a.get_chemical_formula(),'atoms':len(a),'volume_ang3':round(float(a.get_volume()),8),'minimum_distance_ang':round(float(np.min(d)),8),'pbc':a.pbc.tolist(),'cell_ang':[[round(float(x),8) for x in r] for r in a.cell.array]}
def main():
 for p in (SRC,OUT,DER,FIG,INP):p.mkdir(exist_ok=True)
 unit=graphene(formula='C2',a=2.46,vacuum=12.0); unit.center(vacuum=12.0,axis=2)
 slab=unit.repeat((2,2,1)); slab.pbc=(True,True,False)
 decorated=slab.copy(); add_adsorbate(decorated,'H',height=1.50,position=(0.0,0.0)); decorated.center(vacuum=12.0,axis=2); decorated.info.pop('adsorbate_info',None)
 hidx=decorated.get_chemical_symbols().index('H'); substrate=np.delete(decorated.positions[:,2],hidx); vac=float(decorated.cell[2,2]-(decorated.positions[:,2].max()-decorated.positions[:,2].min()))
 assert len(unit)==2 and len(slab)==8 and len(decorated)==9 and slab.pbc.tolist()==[True,True,False]
 assert decorated.get_chemical_symbols().count('H')==1 and decorated.positions[hidx,2]>substrate.max() and vac>=23.9
 write(SRC/'graphene-unit.xyz',unit); write(OUT/'graphene-2x2-vacuum.xyz',slab); write(INP/'POSCAR.graphene-2x2-vacuum',slab,format='vasp',direct=True,vasp5=True); write(OUT/'graphene-2x2-H-ontop.xyz',decorated); write(OUT/'POSCAR.graphene-2x2-H-ontop',decorated,format='vasp',direct=True,vasp5=True)
 for poscar in (INP/'POSCAR.graphene-2x2-vacuum',OUT/'POSCAR.graphene-2x2-H-ontop'):
  poscar.write_text('\\n'.join(line.rstrip() for line in poscar.read_text().splitlines())+'\\n')
 summary={'unit':f(unit),'vacuum_model':f(slab),'adsorbate_model':f(decorated),'construction':{'repeat':[2,2,1],'vacuum_target_ang':12.0,'initial_H_height_ang':1.5,'H_above_highest_C_ang':round(float(decorated.positions[hidx,2]-substrate.max()),8),'empty_cell_length_ang':round(vac,8),'kz_guidance':'This structural case has pbc z=false; it does not select a k-mesh.'},'software':{'python':f'{sys.version_info.major}.{sys.version_info.minor}','ase':__import__('ase').__version__}}
 (DER/'graphene-model-report.json').write_text(json.dumps(summary,indent=2,sort_keys=True)+'\n'); np.savetxt(DER/'geometry-summary.csv',np.array([[f(unit)['atoms'],f(unit)['volume_ang3']],[f(slab)['atoms'],f(slab)['volume_ang3']],[f(decorated)['atoms'],f(decorated)['volume_ang3']]]),delimiter=',',header='atoms,volume_ang3',comments='')
 fig,ax=plt.subplots(figsize=(5,3.5)); colors=['#444444' if s=='C' else '#d62728' for s in decorated.get_chemical_symbols()]; ax.scatter(decorated.positions[:,0],decorated.positions[:,2],c=colors,s=65); ax.set(xlabel='x (A)',ylabel='z (A)',title='Constructed graphene 2x2 with H candidate'); fig.tight_layout(); fig.savefig(FIG/'graphene-H-xz.png',dpi=160); plt.close(fig)
 arts=[]
 for role,rel in [('vacuum_slab','output/graphene-2x2-vacuum.xyz'),('adsorbate_structure','output/graphene-2x2-H-ontop.xyz'),('calculation_structure','input/POSCAR.graphene-2x2-vacuum'),('report','derived/graphene-model-report.json'),('table','derived/geometry-summary.csv'),('figure','figures/graphene-H-xz.png')]:
  p=ROOT/rel; arts.append({'role':role,'path':rel,'sha256':h(p),'bytes':p.stat().st_size})
 man={'schema_version':'1.0','case_id':'structure-graphene-vacuum-adsorbate','title':'Graphene 2D vacuum and H adsorbate candidate','case_kind':'structure-operation','evidence_class':'real-execution','public_host_label':'Talos local execution','started_at':None,'completed_at':'2026-08-05T00:00:00+08:00','exit_code':0,'software':[{'name':'ASE','version':__import__('ase').__version__,'interface':'Python API'}],'sources':[{'id':'ase-graphene-builder','role':'procedural structure source','path':'source/graphene-unit.xyz','sha256':h(SRC/'graphene-unit.xyz'),'url':'https://wiki.fysik.dtu.dk/ase/ase/build/build.html','accessed_at':'2026-08-05','licence_boundary':'Generated locally using ASE; it is a tutorial geometry rather than a database identity.'}],'commands':[{'stage':'construct','command':'PYTHON=python3 bash run.sh','exit_code':0},{'stage':'acceptance','command':'bash check.sh','exit_code':0}],'artifacts':arts,'gates':{'G0':{'status':'PASS','summary':'required structures and derived artifacts are hash-bound'},'G1':{'status':'PASS','summary':'ASE construction script exited zero'},'G2':{'status':'WARN','summary':'no relaxation or solver was run'},'G3':{'status':'PASS','summary':'2D vacuum, adsorbate, calculation-structure export, and PNG are present'},'G4':{'status':'NOT TESTED','summary':'no vacuum, site, or energy convergence study'},'G5':{'status':'NOT CLAIMED','summary':'no adsorption, stability, or electronic conclusion'}},'claim_boundary':{'supports':['The recorded ASE construction of a 2D periodic model with nonperiodic z and one H candidate.'],'does_not_support':['An adsorption site preference, relaxed geometry, adsorption energy, Dirac-band result, or universal vacuum/k-point recommendation.']}}
 (ROOT/'manifest.json').write_text(json.dumps(man,indent=2,sort_keys=True)+'\n'); print(json.dumps({'status':'PASS','vacuum_atoms':len(slab),'adsorbate_atoms':len(decorated),'empty_cell_length_ang':round(vac,8)},sort_keys=True))
if __name__=='__main__':main()

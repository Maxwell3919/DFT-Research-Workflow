#!/usr/bin/env python3
"""Materialize and inspect a COD silicon cell without running DFT."""
from __future__ import annotations
import hashlib, json, sys
from pathlib import Path
import matplotlib.pyplot as plt
import numpy as np
import seekpath, spglib
from ase import Atoms
from ase.io import read, write
from pymatgen.core import Structure
ROOT = Path(__file__).resolve().parent; SRC=ROOT/'source'/'silicon-cod-9013102.cif'; OUT=ROOT/'output'; DER=ROOT/'derived'; FIG=ROOT/'figures'; INP=ROOT/'input'
def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def facts(a):
 d=a.get_all_distances(mic=True); d[d==0]=np.inf
 return {'formula':a.get_chemical_formula(),'atoms':len(a),'cell_ang':[[round(float(x),8) for x in row] for row in a.cell.array],'volume_ang3':round(float(a.get_volume()),8),'minimum_distance_ang':round(float(np.min(d)),8),'pbc':a.pbc.tolist()}
def main():
 for p in (OUT,DER,FIG,INP): p.mkdir(exist_ok=True)
 a=read(SRC)
 cell=(a.cell.array,a.get_scaled_positions(),a.numbers)
 p=spglib.standardize_cell(cell,to_primitive=True,no_idealize=False,symprec=1e-5); c=spglib.standardize_cell(cell,to_primitive=False,no_idealize=False,symprec=1e-5)
 prim=Atoms(numbers=p[2],scaled_positions=p[1],cell=p[0],pbc=True); conv=Atoms(numbers=c[2],scaled_positions=c[1],cell=c[0],pbc=True)
 sc=prim.repeat((2,2,2))
 sweep=[]
 for tol in (1e-6,1e-5,1e-4,1e-3):
  ds=spglib.get_symmetry_dataset(cell,symprec=tol); sweep.append({'symprec_ang':tol,'international':ds.international,'number':int(ds.number),'hall':ds.hall,'n_operations':len(ds.rotations)})
 path=seekpath.get_path((prim.cell.array,prim.get_scaled_positions(),prim.numbers),symprec=1e-5); reciprocal={'bravais_lattice':path['bravais_lattice'],'spacegroup_number':path['spacegroup_number'],'point_coords':path['point_coords'],'path':path['path']}
 assert a.get_chemical_formula()=='Si8' and len(a)==8 and len(prim)==2 and len(conv)==8 and len(sc)==16
 assert all(row['number']==227 for row in sweep) and reciprocal['path']
 write(OUT/'silicon-conventional.xyz',a); write(OUT/'POSCAR.conventional',a,format='vasp',direct=True,vasp5=True); write(OUT/'silicon-primitive.xyz',prim); write(OUT/'POSCAR.primitive',prim,format='vasp',direct=True,vasp5=True); write(OUT/'silicon-standardized-conventional.xyz',conv); write(OUT/'silicon-primitive-2x2x2.xyz',sc); write(INP/'POSCAR.silicon-primitive',prim,format='vasp',direct=True,vasp5=True)
 for poscar in (OUT/'POSCAR.conventional',OUT/'POSCAR.primitive',INP/'POSCAR.silicon-primitive'):
  poscar.write_text('\\n'.join(line.rstrip() for line in poscar.read_text().splitlines())+'\\n')
 (DER/'symmetry-tolerance-sweep.json').write_text(json.dumps(sweep,indent=2)+'\n'); (DER/'seekpath-primitive.json').write_text(json.dumps(reciprocal,indent=2,sort_keys=True)+'\n')
 np.savetxt(DER/'structure-summary.csv',np.array([[facts(x)['atoms'],facts(x)['volume_ang3'],facts(x)['minimum_distance_ang']] for x in (a,prim,sc)]),delimiter=',',header='atoms,volume_ang3,minimum_distance_ang',comments='')
 fig,ax=plt.subplots(figsize=(5,4)); ax.scatter(a.positions[:,0],a.positions[:,1],s=70,c='#1f77b4'); ax.set(xlabel='x (A)',ylabel='y (A)',title='COD 9013102 conventional Si projection'); fig.tight_layout(); fig.savefig(FIG/'silicon-conventional-xy.png',dpi=160); plt.close(fig)
 report={'source':facts(a),'primitive':facts(prim),'standardized_conventional':facts(conv),'supercell':facts(sc),'symmetry_tolerance_sweep':sweep,'reciprocal_path':reciprocal,'software':{'python':sys.version.split()[0],'ase':__import__('ase').__version__,'spglib':spglib.__version__,'seekpath':seekpath.__version__,'pymatgen_core':Structure.__module__.split('.')[0]}}
 (DER/'structure-report.json').write_text(json.dumps(report,indent=2,sort_keys=True)+'\n')
 artifacts=[]
 for role,rel in [('converted_xyz','output/silicon-conventional.xyz'),('primitive_poscar','output/POSCAR.primitive'),('supercell','output/silicon-primitive-2x2x2.xyz'),('structure_report','derived/structure-report.json'),('symmetry_sweep','derived/symmetry-tolerance-sweep.json'),('reciprocal_path','derived/seekpath-primitive.json'),('summary_table','derived/structure-summary.csv'),('figure','figures/silicon-conventional-xy.png')]:
  f=ROOT/rel; artifacts.append({'role':role,'path':rel,'sha256':digest(f),'bytes':f.stat().st_size})
 manifest={'schema_version':'1.0','case_id':'structure-silicon-cell-lineage','title':'Silicon CIF cell lineage and reciprocal path','case_kind':'structure-operation','evidence_class':'real-execution','public_host_label':'Talos local execution','started_at':None,'completed_at':'2026-08-05T00:00:00+08:00','exit_code':0,'software':[{'name':'ASE','version':__import__('ase').__version__,'interface':'Python API'},{'name':'spglib','version':spglib.__version__,'interface':'Python API'},{'name':'SeeK-path','version':seekpath.__version__,'interface':'Python API'},{'name':'pymatgen-core','version':'2026.7.31','interface':'import verified'}],'sources':[{'id':'cod-9013102','role':'CIF source','path':'source/silicon-cod-9013102.cif','sha256':digest(SRC),'url':'https://www.crystallography.net/cod/9013102.html','accessed_at':'2026-08-05','licence_boundary':'CIF header requires attribution to the underlying journal; no database identity claim beyond the copied entry.'}],'commands':[{'stage':'materialize','command':'PYTHON=python3 bash run.sh','exit_code':0},{'stage':'acceptance','command':'bash check.sh','exit_code':0}],'artifacts':artifacts,'gates':{'G0':{'status':'PASS','summary':'required source and generated artifacts are hash-bound'},'G1':{'status':'PASS','summary':'deterministic structure transformation script exited zero'},'G2':{'status':'WARN','summary':'no electronic solver or geometry optimizer was run'},'G3':{'status':'PASS','summary':'converted structures, symmetry report, reciprocal path, and plot are present'},'G4':{'status':'NOT TESTED','summary':'no observable convergence study'},'G5':{'status':'NOT CLAIMED','summary':'no physical stability or DFT conclusion'}},'claim_boundary':{'supports':['The recorded local format conversion, standardization, tolerance sweep, supercell construction, and SeeK-path call.'],'does_not_support':['DFT convergence, material stability, band extrema, or a calculation-parameter recommendation.']}}
 (ROOT/'manifest.json').write_text(json.dumps(manifest,indent=2,sort_keys=True)+'\n')
 print(json.dumps({'status':'PASS','source_sha256':digest(SRC),'primitive_atoms':len(prim),'supercell_atoms':len(sc),'spacegroup':sweep[1]['international']},sort_keys=True))
if __name__=='__main__': main()

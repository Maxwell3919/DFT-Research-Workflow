export type AutomationMaturity = 'manual' | 'assisted' | 'candidate';

export interface Stage {
  id: string;
  number: string;
  title: string;
  eyebrow: string;
  summary: string;
  decision: string;
  failure: string;
  deliverable: string;
}

export interface Operation {
  id: string;
  stage: string;
  title: string;
  summary: string;
  inputs: string[];
  outputs: string[];
  prerequisites: string[];
  convergence_axes: string[];
  validation_gates: string[];
  supported_tools: string[];
  automation_maturity: AutomationMaturity;
  evidence_boundary: string;
}

export interface PropertyBranch {
  id: string;
  number: string;
  title: string;
  question: string;
  route: string[];
  convergence: string[];
  traps: string[];
  operationId: string;
  accent: string;
}

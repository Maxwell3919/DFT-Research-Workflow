import toolsDocument from '../../workflow/tools.json';
import { getWorkflowTopic } from './workflow';
export interface ToolRecord { slug:string; name:string; aliases:string[]; category:string; interfaces:string[]; access:'open-source'|'restricted-license'|'registration-required'|'free-proprietary'; access_note?:string; verified_version?:string; role:string; homepage:string; documentation:string; source_repository:string|null; topics:string[]; }
const tools=toolsDocument.tools as ToolRecord[];
export const getTools=()=>[...tools];
export function getTool(slug:string){const tool=tools.find(x=>x.slug===slug);if(!tool)throw Error(`Unknown tool: ${slug}`);return tool;}
export const getToolTopics=(tool:ToolRecord)=>tool.topics.map(getWorkflowTopic);

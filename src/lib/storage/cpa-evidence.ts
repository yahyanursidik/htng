import { generateChallenge, validState, evaluateChallenge, type Phase } from "../../learning/cpa/engine";

export const CPA_KEY="mathyahya.cpa.evidence.v1";
export interface CPAEvidence {
  version:1; id:string; gameId:string; seed:number; phase:Phase; visited:Phase[];
  physicalReported:boolean; pictureReopened:boolean; state:number[]; moves:number; hints:number; checks:number;
  answer:string; reason:number; constructionCorrect:boolean; answerCorrect:boolean; reasonCorrect:boolean; created:number;
}
const phases:Phase[]=["concrete","pictorial","abstract"];
export function validEvidence(value:unknown):value is CPAEvidence {
  if(!value||typeof value!=="object")return false;
  const r=value as CPAEvidence;
  if(r.version!==1||typeof r.id!=="string"||r.id.length>100||!r.id||typeof r.gameId!=="string"||!phases.includes(r.phase)||!Array.isArray(r.visited)||r.visited.length>3||!r.visited.every(p=>phases.includes(p))||!r.visited.includes(r.phase)||typeof r.physicalReported!=="boolean"||typeof r.pictureReopened!=="boolean"||!Array.isArray(r.state)||typeof r.answer!=="string"||r.answer.length>20||!Number.isInteger(r.reason)||r.reason< -1||r.reason>2||!Number.isInteger(r.hints)||r.hints<0||r.hints>3||!Number.isInteger(r.moves)||r.moves<0||r.moves>10000||!Number.isInteger(r.checks)||r.checks<1||r.checks>10000||!Number.isFinite(r.created)||r.created<0)return false;
  try {const q=generateChallenge(r.gameId,r.seed);if(!validState(q,r.state))return false;const result=evaluateChallenge(q,r.state,r.answer,r.reason);return r.constructionCorrect===result.constructionCorrect&&r.answerCorrect===result.answerCorrect&&r.reasonCorrect===result.reasonCorrect;}catch{return false;}
}
export function readCPAEvidence():CPAEvidence[]{
  try{const data:unknown=JSON.parse(localStorage.getItem(CPA_KEY)??"[]");return Array.isArray(data)?data.slice(-500).filter(validEvidence):[];}catch{return [];}
}
export function saveCPAEvidence(record:CPAEvidence):boolean {
  if(!validEvidence(record))return false;
  try{const records=readCPAEvidence().filter(r=>r.id!==record.id);localStorage.setItem(CPA_KEY,JSON.stringify([...records,record].slice(-500)));return true;}catch{return false;}
}

import {describe,it,expect,vi} from "vitest";
import {CPA_KEY,readCPAEvidence,saveCPAEvidence,validEvidence,type CPAEvidence} from "../../src/lib/storage/cpa-evidence";
import {generateChallenge,evaluateChallenge} from "../../src/learning/cpa/engine";
const q=generateChallenge("gabungkan",0),result=evaluateChallenge(q,q.target,"4",0);
function record(id="test"):CPAEvidence{return {version:1,id,gameId:q.gameId,seed:0,phase:"abstract",visited:["concrete","pictorial","abstract"],physicalReported:false,pictureReopened:false,state:q.target,moves:4,hints:0,checks:1,answer:"4",reason:0,constructionCorrect:result.constructionCorrect,answerCorrect:result.answerCorrect,reasonCorrect:result.reasonCorrect,created:1};}
describe("CPA evidence",()=>{
  it("stores local observations without adding mastery or physical confirmation",()=>{
    expect(saveCPAEvidence(record())).toBe(true);expect(readCPAEvidence()).toEqual([record()]);
    expect(readCPAEvidence()[0]).not.toHaveProperty("mastery");expect(readCPAEvidence()[0]?.physicalReported).toBe(false);
    expect(saveCPAEvidence(record())).toBe(true);expect(readCPAEvidence()).toHaveLength(1);
  });
  it("rejects forged flags, malformed state, unknown versions and impossible phases",()=>{
    for(const change of [{version:2},{seed:-1},{constructionCorrect:false},{answerCorrect:false},{state:[-1,4]},{visited:[]},{phase:"other"},{hints:4},{moves:NaN},{reason:3},{answer:"a".repeat(21)}])expect(validEvidence({...record(),...change})).toBe(false);
    localStorage.setItem(CPA_KEY,JSON.stringify([record(),{id:"broken"}]));expect(readCPAEvidence()).toHaveLength(1);
    localStorage.setItem(CPA_KEY,"{broken");expect(readCPAEvidence()).toEqual([]);
  });
  it("caps storage at 500 valid latest records and keeps account keys separate",()=>{
    localStorage.setItem("mathyahya.guest.curriculum.v1","unchanged");
    localStorage.setItem(CPA_KEY,JSON.stringify(Array.from({length:500},(_,i)=>record(String(i)))));
    expect(saveCPAEvidence(record("last"))).toBe(true);expect(readCPAEvidence()).toHaveLength(500);expect(readCPAEvidence()[0]?.id).toBe("1");expect(localStorage.getItem("mathyahya.guest.curriculum.v1")).toBe("unchanged");
  });
  it("reports unavailable or quota storage without throwing",()=>{
    vi.spyOn(localStorage,"setItem").mockImplementation(()=>{throw new Error("quota");});expect(saveCPAEvidence(record())).toBe(false);
    vi.spyOn(localStorage,"getItem").mockImplementation(()=>{throw new Error("disabled");});expect(readCPAEvidence()).toEqual([]);
  });
});

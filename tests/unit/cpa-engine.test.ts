import {describe,it,expect} from "vitest";
import {games,generateChallenge,transition,constructionCorrect,evaluateChallenge,validState} from "../../src/learning/cpa/engine";
import {getLesson} from "../../src/learning/curriculum/catalog";

describe("CPA deterministic engine",()=>{
  it("has at least two games per grade, stable unique IDs and real lesson links",()=>{
    expect(games).toHaveLength(14);expect(new Set(games.map(g=>g.id)).size).toBe(14);
    for(let grade=1;grade<=6;grade++)expect(games.filter(g=>g.grade===grade).length).toBeGreaterThanOrEqual(2);
    games.forEach(g=>expect(getLesson(g.lessonId).grade).toBe(g.grade));
  });
  it.each(games.map(g=>[g.id]))("%s produces bounded consistent C/P/A examples for 100 seeds",id=>{
    for(let seed=0;seed<100;seed++){
      const q=generateChallenge(id!,seed);expect(q).toEqual(generateChallenge(id!,seed));
      expect(validState(q,q.initial)).toBe(true);expect(validState(q,q.target)).toBe(true);
      expect(constructionCorrect(q,q.target)).toBe(true);expect(q.target.length).toBeLessThanOrEqual(16);
      expect(q.reasons).toHaveLength(3);expect(q.hints).toHaveLength(3);expect(q.concrete.length).toBeGreaterThan(30);
      const r=evaluateChallenge(q,q.target,String(q.expected),q.correctReason);expect(r.answerCorrect).toBe(true);expect(r.reasonCorrect).toBe(true);
      expect(evaluateChallenge(q,q.target,String(q.expected),(q.correctReason+1)%3).reasonCorrect).toBe(false);
    }
  });
  it("fails closed on invalid IDs/seeds/states and accepts comma decimals",()=>{
    for(const seed of [-1,NaN,Infinity,1.5,2147483648])expect(()=>generateChallenge("gabungkan",seed)).toThrow();
    expect(()=>generateChallenge("none",0)).toThrow();const q=generateChallenge("desimal",0);
    expect(evaluateChallenge(q,q.target,"0,3",0).answerCorrect).toBe(true);
    expect(evaluateChallenge(q,q.target,"3e-1",0).answerCorrect).toBe(false);
    expect(validState(q,[])).toBe(false);expect(validState(q,q.initial.map(()=>2))).toBe(false);
    expect(()=>transition(q,[],{type:"change",index:0,delta:1})).toThrow();
    expect(validState(generateChallenge("gabungkan",0),[NaN,2])).toBe(false);
  });
  it("removal and sharing conserve quantity, reject empty or invalid transfers",()=>{
    for(const id of ["ambil","bagi","ratakan"]){const q=generateChallenge(id,0);let state=q.initial;
      for(let i=0;i<50;i++){state=transition(q,state,{type:"move",from:i%state.length,to:(i+1)%state.length});expect(validState(q,state)).toBe(true);expect(state.reduce((a,b)=>a+b)).toBe(q.initial.reduce((a,b)=>a+b));}
      expect(transition(q,state,{type:"move",from:-1,to:0})).toBe(state);
    }
    const q=generateChallenge("bagi",0);expect(transition(q,q.initial,{type:"move",from:1,to:0})).toBe(q.initial);
  });
  it("exchanges preserve value and can be reversed",()=>{
    const q=generateChallenge("tukar",0),next=transition(q,q.initial,{type:"exchange",split:false});
    expect(next).toEqual(q.target);expect(transition(q,next,{type:"exchange",split:true})).toEqual(q.initial);
    expect(transition(q,next,{type:"exchange",split:false})).toBe(next);
  });
  it("accepts non-contiguous equal fractional parts, not wrong selected quantity",()=>{
    const q=generateChallenge("senilai",0);expect(constructionCorrect(q,[0,1,0,0,0,0,1,0])).toBe(true);
    expect(constructionCorrect(q,[0,1,0,0,0,0,0,0])).toBe(false);
  });
  it("counts movement across zero with one signed unit per action",()=>{
    const q=generateChallenge("lintasi-nol",0);let state=q.initial;
    for(let i=0;i<4;i++)state=transition(q,state,{type:"change",index:0,delta:-1});
    expect(state).toEqual([-2]);expect(constructionCorrect(q,state)).toBe(true);
    expect(transition(q,[-5],{type:"change",index:0,delta:-1})).toEqual([-5]);
  });
});

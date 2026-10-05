import { describe,it,expect } from "vitest";
import { lessons } from "../src/learning/curriculum/catalog";
import { generateQuestion,evaluateQuestion,parseAnswer } from "../src/learning/curriculum/engine";
import { summarize } from "../src/components/account/Progress";
describe("curriculum contracts",()=>{
  it("contains five implemented lessons per grade and valid prerequisites",()=>{
    expect(new Set(lessons.map(l=>l.id)).size).toBe(30);
    for(let grade=1;grade<=6;grade++)expect(lessons.filter(l=>l.grade===grade)).toHaveLength(5);
    for(const l of lessons)if(l.prerequisite)expect(lessons.find(p=>p.id===l.prerequisite)).toBeDefined();
  });
  for(const lesson of lessons)it(`${lesson.id}: deterministic, bounded, evaluates answer and reason separately`,()=>{
    for(let seed=0;seed<100;seed++){
      const q=generateQuestion(lesson.id,seed);expect(generateQuestion(lesson.id,seed)).toEqual(q);expect(Number.isFinite(q.expected)).toBe(true);expect(q.reasons).toHaveLength(3);expect(new Set(q.reasons).size).toBe(3);expect(q.hints).toHaveLength(3);expect(q.model.summary.length).toBeGreaterThan(0);
      expect(evaluateQuestion(q,String(q.expected),q.correctReason,0).independent).toBe(true);
      expect(evaluateQuestion(q,String(q.expected),q.correctReason,1).independent).toBe(false);
      expect(evaluateQuestion(q,String(q.expected),q.correctReason,0,2).independent).toBe(false);
      expect(evaluateQuestion(q,String(q.expected+1),q.correctReason,0).answerCorrect).toBe(false);
      expect(evaluateQuestion(q,String(q.expected),(q.correctReason+1)%3,0).reasonCorrect).toBe(false);
      if(q.model.kind==="counters")expect(Math.max(...q.model.values)).toBeLessThanOrEqual(20);
    }
  });
  it("preserves mathematical invariants across generators",()=>{for(let seed=0;seed<100;seed++){
    const mul=generateQuestion("perkalian",seed);expect(mul.expected).toBe(mul.model.values[0]!*mul.model.values[1]!);
    const area=generateQuestion("luas",seed);expect(area.expected).toBe(area.model.values[0]!*area.model.values[1]!);
    const perimeter=generateQuestion("keliling",seed);expect(perimeter.expected).toBe(2*(perimeter.model.values[0]!+perimeter.model.values[1]!));
    const vol=generateQuestion("volume",seed);expect(vol.expected).toBe(vol.model.values.reduce((a,b)=>a*b,1));
    const median=generateQuestion("median",seed);expect(median.expected).toBe(median.model.values.toSorted((a,b)=>a-b)[2]);expect(median.expected).not.toBe(median.model.values[2]);
    expect(generateQuestion("bilangan-negatif",seed).expected).toBeLessThan(0);
    const dec=generateQuestion("desimal",seed);expect(dec.expected).toBe(dec.model.values[0]!/10);
  }});
  it("rejects malformed seed, unknown lesson, ambiguous answers",()=>{expect(()=>generateQuestion("unknown",0)).toThrow();for(const seed of [-1,1.2,Infinity,2147483648])expect(()=>generateQuestion("menghitung",seed)).toThrow();for(const s of ["","1e2","1.000,50","12abc","NaN","1/2","1 2"])expect(parseAnswer(s)).toBeNull();expect(parseAnswer("0,3")).toBe(.3);expect(parseAnswer("-3")).toBe(-3);});
  it("does not inflate progress with repeated checks on one seed",()=>{const records=[0,1,2].map(i=>({id:String(i),lessonId:"menghitung",seed:10,answer:"7",reason:0,hints:0,answerCorrect:true,reasonCorrect:true,independent:true,created:i}));const summary=summarize(records).find(s=>s.lesson.id==="menghitung")!;expect(summary.seeds).toBe(1);expect(summary.independent).toBe(1);expect(summary.status).not.toBe("Coba terapkan tanpa model");});
});

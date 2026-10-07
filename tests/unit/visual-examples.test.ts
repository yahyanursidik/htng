import {describe,it,expect} from 'vitest';
import {allocate,concepts,examples,exercise,generateVisualQuestion,getExample,themes,workedExample} from '../../src/learning/visual-examples/engine';
import {evaluateQuestion} from '../../src/learning/curriculum/engine';
describe('visual example domain',()=>{
  it('covers five contexts and twelve foundations across all six grades',()=>{
    expect(examples).toHaveLength(60);expect(new Set(examples.map(e=>e.id)).size).toBe(60);
    expect(new Set(examples.map(e=>e.grade))).toEqual(new Set([1,2,3,4,5,6]));
    for(const c of concepts)expect(examples.filter(e=>e.concept===c.id)).toHaveLength(themes.length);
    expect(()=>getExample('missing')).toThrow();
  });
  it.each(examples.map(e=>[e.id] as const))('%s is deterministic, bounded, and evaluable',id=>{
    const e=getExample(id);
    for(let seed=0;seed<24;seed++){
      const v=generateVisualQuestion(e,seed),q=v.question;
      expect(v).toEqual(generateVisualQuestion(e,seed));
      expect(v.steps).toHaveLength(3);expect(q.expected).toBeGreaterThan(0);expect(q.expected).toBeLessThanOrEqual(60);
      for(const p of v.panels){expect(Number.isInteger(p.count)).toBe(true);expect(p.count).toBeGreaterThanOrEqual(0);expect(p.count).toBeLessThanOrEqual(60);if(p.denominator)expect(p.count).toBeLessThanOrEqual(p.denominator);}
      const result=evaluateQuestion(q,String(q.expected),q.correctReason,0);
      expect(result.answerCorrect&&result.reasonCorrect).toBe(true);
      expect(evaluateQuestion(q,String(q.expected), (q.correctReason+1)%3,0).reasonCorrect).toBe(false);
      const [a=0,b=0]=q.model.values;
      const sum=v.panels.reduce((n,p)=>n+p.count,0);
      switch(e.concept){
        case 'menghitung':case 'menjumlah':case 'nilai-tempat':case 'perkalian':expect(sum).toBe(q.expected);break;
        case 'mengurangi':expect(v.panels).toHaveLength(1);expect(sum-(v.panels[0]!.removed??0)).toBe(q.expected);break;
        case 'membandingkan':expect(b-a).toBe(q.expected);break;
        case 'pembagian':expect(sum).toBe(a);expect(v.divisionGroups!*q.expected).toBe(a);break;
        case 'pecahan':expect(a).toBe(q.expected);break;
        case 'pecahan-senilai':expect(v.panels[1]!.count/v.panels[1]!.denominator!).toBe(a/b);expect(q.expected).toBe(a*2);break;
        case 'desimal':expect(q.expected).toBe(a/10);break;
        case 'rata-rata':expect(sum/3).toBe(q.expected);break;
        case 'perbandingan':expect(a*b).toBe(q.expected);expect(b).toBe(e.theme==='motor'?2:4);break;
      }
    }
  });
  it.each(examples.map(e=>[e.id] as const))('%s practice differs from worked and next practice',id=>{
    const e=getExample(id),signature=(v:ReturnType<typeof exercise>)=>JSON.stringify(v.panels);
    expect(exercise(e,0)).toEqual(exercise(e,0));
    expect(signature(exercise(e,0))).not.toBe(signature(workedExample(e)));
    expect(signature(exercise(e,1))).not.toBe(signature(exercise(e,0)));
  });
  it('distributes without losing or duplicating units and can undo',()=>{
    for(let groups=2;groups<=5;groups++)for(let per=2;per<=4;per++)for(let dealt=0;dealt<=groups*per;dealt++){
      const total=groups*per,a=allocate(total,groups,dealt);
      expect(a.reduce((n,x)=>n+x,0)+total-dealt).toBe(total);
      expect(Math.max(...a)-Math.min(...a)).toBeLessThanOrEqual(1);
      if(dealt===total)expect(a).toEqual(Array(groups).fill(per));
    }
    expect(allocate(12,3,3)).toEqual([1,1,1]);expect(allocate(12,3,2)).toEqual([1,1,0]);
  });
  it('rejects invalid inputs rather than silently generating unbounded diagrams',()=>{
    const e=examples[0]!;for(const bad of [-1,NaN,1.2,2147483648])expect(()=>generateVisualQuestion(e,bad)).toThrow();
    for(const bad of [-1,NaN,1.2,10000])expect(()=>exercise(e,bad)).toThrow();
    expect(()=>allocate(7,3,0)).toThrow();expect(()=>allocate(12,3,13)).toThrow();expect(()=>allocate(12,0,0)).toThrow();expect(()=>allocate(61,1,0)).toThrow();
  });
});

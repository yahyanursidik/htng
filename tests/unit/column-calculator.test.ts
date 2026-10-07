import {describe,it,expect} from 'vitest';
import {calculateColumn,columnExamples,columnNumberError,type ColumnCalculation,type ColumnRow} from '../../src/learning/calculator/column-engine';
import type {Operation} from '../../src/learning/calculator/engine';
const value=(row:ColumnRow)=>row.cells.reduce((n,c,i)=>n+Number(c||0)*10**(row.cells.length-1-i),0);
function solve(a:number|string,op:Operation,b:number|string):ColumnCalculation {const result=calculateColumn(String(a),op,String(b));if(!result.ok)throw new Error(result.message);return result.column;}
describe('column arithmetic',()=>{
  it.each(columnExamples)('generates deterministic %s %s %s with exact snapshots',(a,op,b)=>{
    expect(solve(a,op,b)).toEqual(solve(a,op,b));
  });
  it('adds multiple carries with a new highest place and no snapshot mutation',()=>{
    const c=solve(9999,'add',1);expect(c.result).toBe(10000);expect(c.width).toBe(5);
    expect(c.steps[0]!.rows[0]!.cells.every(x=>x==='')).toBe(true);
    expect(c.steps.at(-1)!.rows.find(r=>r.kind==='result')!.cells.join('').trim()).toBe('10000');
    expect(c.steps.some(s=>s.explanation.includes('1 puluhan'))).toBe(true);
    expect(value(c.steps.at(-1)!.rows.find(r=>r.kind==='result')!)).toBe(c.result);
  });
  it('preserves the entire minuend during chained exchanges across zeros',()=>{
    const c=solve(1000,'subtract',278);expect(c.result).toBe(722);
    const swaps=c.steps.filter(s=>s.title.startsWith('Tukar'));expect(swaps).toHaveLength(3);
    for(const s of c.steps)expect(value(s.rows.find(r=>r.kind==='regrouped')!)).toBe(1000);
    expect(c.steps[0]!.rows[0]!.crossed).toEqual([]);
    expect(swaps.at(-1)!.rows.find(r=>r.kind==='regrouped')!.cells).toEqual(['0','9','9','10']);
  });
  it('keeps multiplication partial products shifted by their actual place values',()=>{
    const c=solve(123,'multiply',24);expect(c.result).toBe(2952);
    const sumStep=c.steps.find(s=>s.title.startsWith('Jumlahkan hasil bagian'))!;
    expect(sumStep.rows.filter(r=>r.kind==='partial').map(value)).toEqual([492,2460]);
    const zero=solve(25,'multiply',101);expect(zero.result).toBe(2525);
    expect(zero.steps.find(s=>s.title.startsWith('Jumlahkan hasil bagian'))!.rows.filter(r=>r.kind==='partial').map(value)).toEqual([25,0,2500]);
  });
  it('retains internal quotient zeros and states nonzero remainder honestly',()=>{
    const c=solve(1005,'divide',5);expect(c.result).toBe(201);expect(c.remainder).toBe(0);
    expect(c.steps.some(s=>s.explanation.includes('nol ini menjaga posisi'))).toBe(true);
    expect(value(c.steps.at(-1)!.rows.find(r=>r.kind==='result')!)).toBe(201);
    const r=solve(17,'divide',4);expect(r.result).toBe(4);expect(r.remainder).toBe(1);expect(r.check).toContain('4 × 4 + 1 = 17');expect(r.steps.at(-1)!.explanation).toContain('4 + 1/4');
    expect(solve(2,'divide',9).result).toBe(0);expect(solve(2,'divide',9).remainder).toBe(2);
  });
  it('canonicalizes final zero rather than writing several zero digits',()=>{
    for(const c of [solve(1000,'subtract',1000),solve(9999,'multiply',0),solve(0,'multiply',999),solve(0,'divide',99)])expect(c.steps.at(-1)!.rows.find(r=>r.kind==='result')!.cells.join('').trim()).toBe('0');
  });
  it('checks arithmetic, column bounds, exchanges, division and immutable snapshots over seeded cases',()=>{
    let state=123;const pick=(max:number)=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state%(max+1);};
    for(let i=0;i<100;i++)for(const op of ['add','subtract','multiply','divide'] as const){
      let a=pick(9999),b=pick(op==='multiply'?999:op==='divide'?98:9999);if(op==='divide')b++;if(op==='subtract'&&a<b)[a,b]=[b,a];
      const c=solve(a,op,b),expected=op==='add'?a+b:op==='subtract'?a-b:op==='multiply'?a*b:Math.floor(a/b);
      expect(c.result).toBe(expected);expect(c.width).toBeLessThanOrEqual(7);
      for(const s of c.steps){if(s.activeColumn!==undefined){expect(s.activeColumn).toBeGreaterThanOrEqual(0);expect(s.activeColumn).toBeLessThan(c.width);}for(const row of s.rows){expect(row.cells).toHaveLength(c.width);expect(row.cells.every(x=>/^\s*\d{0,2}$/.test(x))).toBe(true);if(row.kind==='regrouped')expect(value(row)).toBe(a);}}
      expect(value(c.steps.at(-1)!.rows.find(r=>r.kind==='result')!)).toBe(expected);
      if(op==='divide'){expect(b*c.result+c.remainder!).toBe(a);expect(c.remainder!).toBeLessThan(b);}
    }
  });
  it('rejects unsupported numbers and operations without throwing or silently rounding',()=>{
    for(const raw of ['', '-2','1,5','1.5','10000','1e2','Infinity','<script>','1'.repeat(100)])expect(calculateColumn(raw,'add','1').ok).toBe(false);
    for(const [a,op,b] of [['3','subtract','4'],['8','divide','0'],['8','divide','100'],['1','multiply','1000'],['1','unknown','2']])expect(calculateColumn(a!,op!,b!).ok).toBe(false);
    expect(columnNumberError('12','multiply','first')).toBeNull();expect(solve('0012','add','0003').result).toBe(15);
  });
});

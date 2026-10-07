import type {Panel, ThemeId} from '../../learning/visual-examples/engine';

/** Mathematical units: no raster assets, characters, or emoji-dependent counts. */
export function VisualObject({theme, icon}:{theme:ThemeId;icon?:Panel['icon']}) {
  return <svg class="example-object" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    {icon==='wheel'?<><circle cx="32" cy="32" r="22" class="object-outline"/><circle cx="32" cy="32" r="10" class="object-paper"/><path d="M32 10v12m0 20v12M10 32h12m20 0h12" class="object-line"/></>:
    icon==='basket'?<><path d="M12 28h40l-5 26H17z" class="object-gold"/><path d="M20 28c0-23 24-23 24 0M24 33v15m8-15v15m8-15v15" class="object-line"/></>:
    theme==='mobil'?<><rect x="9" y="12" width="9" height="12" rx="2" class="object-outline"/><rect x="46" y="12" width="9" height="12" rx="2" class="object-outline"/><rect x="9" y="40" width="9" height="12" rx="2" class="object-outline"/><rect x="46" y="40" width="9" height="12" rx="2" class="object-outline"/><rect x="17" y="5" width="30" height="54" rx="9" class="object-blue"/><path d="M22 17h20v11H22zm0 22h20v8H22z" class="object-paper"/></>:
    theme==='motor'?<><circle cx="13" cy="46" r="10" class="object-outline"/><circle cx="51" cy="46" r="10" class="object-outline"/><circle cx="13" cy="46" r="4" class="object-paper"/><circle cx="51" cy="46" r="4" class="object-paper"/><path d="m13 46 15-16 10 16H13m23-27h8l7 27M23 25h15" class="object-line"/><path d="M27 27h12l-3 11H21z" class="object-gold"/></>:
    theme==='mangga'?<><path d="M43 14c15 6 15 35-4 42C18 63 6 39 18 24c7-8 17-13 25-10z" class="object-gold"/><path d="M37 16c-4-8 1-14 13-12-2 8-7 12-13 12z" class="object-leaf"/></>:
    theme==='stroberi'?<><path d="M11 22c5-14 37-14 42 0 6 14-12 36-21 36S5 36 11 22z" class="object-fruit"/><path d="m15 18 10-3 7-11 7 11 10 3-14 6-3-7-3 7z" class="object-leaf"/><path d="M20 29v3m12-6v3m12 0v3m-18 6v3m12-3v3m-6 5v3" class="object-seed"/></>:
    <><ellipse cx="32" cy="34" rx="27" ry="23" class="object-leaf"/><path d="M17 15c-8 16-8 22 0 39m15-42c-6 18-6 24 0 44m15-41c-5 15-5 23 0 39" class="object-watermelon"/></>}
  </svg>;
}
function Slice({count, denominator}:{count:number;denominator:number}) {
  const point=(a:number)=>`${60+45*Math.cos(a)},${60+45*Math.sin(a)}`;
  return <svg class="example-whole" viewBox="0 0 120 120" aria-hidden="true" focusable="false"><circle cx="60" cy="60" r="49" class="object-leaf"/>{Array.from({length:denominator},(_,i)=>{
    const start=-Math.PI/2+i*2*Math.PI/denominator, end=start+2*Math.PI/denominator, middle=(start+end)/2;
    return <g key={i}><path d={`M60,60 L${point(start)} A45,45 0 0,1 ${point(end)} Z`} class={i<count?'slice-selected':'slice-empty'}/>{i<count&&<text x={60+29*Math.cos(middle)} y={65+29*Math.sin(middle)} text-anchor="middle">/</text>}</g>;
  })}</svg>;
}
export default function ExamplePicture({theme,panels,bridge,marked=[],onMark}:{theme:ThemeId;panels:Panel[];bridge:string;marked?:string[];onMark?:(id:string)=>void}) {
  return <figure class="example-picture"><div class="example-panels">{panels.map((p,index)=><section class="example-group" key={index} aria-label={p.label}>
    <h3>{p.label}</h3>
    {p.denominator?<><div class="example-fraction" role="img" aria-label={`${p.count} dari ${p.denominator} bagian sama besar dipilih; satu utuh.`}>
      {theme==='semangka'?<Slice count={p.count} denominator={p.denominator}/>:<><VisualObject theme={theme}/><div class="example-strip">{Array.from({length:p.denominator},(_,i)=><span key={i} class={i<p.count?'is-selected':''}>{i<p.count?'/':''}</span>)}</div></>}
    </div><p>{p.count}/{p.denominator} dari satu utuh</p></>:
    <><div class="example-units">{Array.from({length:p.count},(_,i)=>{const id=`${index}-${i}`,removed=i>=p.count-(p.removed??0),checked=marked.includes(id);const content=<><VisualObject theme={theme} icon={p.icon}/><span class="example-mark" aria-hidden="true">{removed?'×':checked?'✓':''}</span></>;
      const label=`${p.icon==='wheel'?'Roda':p.icon==='basket'?'Keranjang':theme} ${i+1}, ${p.label}${removed?', diambil':''}`;
      return onMark&&!removed?<button type="button" class="example-unit" key={id} aria-label={label} aria-pressed={checked} onClick={()=>onMark(id)}>{content}</button>:<span class={`example-unit${removed?' is-removed':''}`} key={id} role="img" aria-label={label}>{content}</span>;
    })}</div><p>{p.removed?`${p.count} awal; ${p.removed} diambil`:`${p.count} ${p.icon==='basket'?'keranjang':p.icon==='wheel'?'roda':theme}`}</p></>}
  </section>)}</div><figcaption>{bridge}</figcaption></figure>;
}

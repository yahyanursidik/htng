import {useEffect,useState} from 'preact/hooks';
import {concepts,examples,themes} from '../../learning/visual-examples/engine';
import {VisualObject} from './ExamplePicture';
import '../../styles/visual-examples.css';
export default function VisualExampleCatalogue() {
  const [ready,setReady]=useState(false),[grade,setGrade]=useState('all'),[theme,setTheme]=useState('all');
  useEffect(()=>setReady(true),[]);
  const selected=examples.filter(e=>(grade==='all'||e.grade===Number(grade))&&(theme==='all'||e.theme===theme));
  return <div class="example-catalogue"><div class="example-filters"><div class="example-filter"><label for="example-grade">Kelas</label><select id="example-grade" value={grade} disabled={!ready} onChange={e=>setGrade(e.currentTarget.value)}><option value="all">Semua kelas</option>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>Kelas {n}</option>)}</select></div><div class="example-filter"><label for="example-theme">Benda</label><select id="example-theme" value={theme} disabled={!ready} onChange={e=>setTheme(e.currentTarget.value)}><option value="all">Semua benda</option>{themes.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div></div>
    <p role="status">{selected.length} contoh tersedia. Mulai dari konsep dasar, lalu lanjut sesuai kebutuhan.</p>
    {[1,2,3,4,5,6].filter(n=>selected.some(e=>e.grade===n)).map(n=><section class="example-grade" id={`kelas-${n}`} key={n}><h2>Kelas {n}</h2>{concepts.filter(c=>c.grade===n).map(c=><section class="example-concept" id={c.id} key={c.id}><h3>{c.name}</h3><ul>{selected.filter(e=>e.concept===c.id).map(e=><li key={e.id}><a href={`/contoh/${e.id}`}><VisualObject theme={e.theme}/><span>{themes.find(t=>t.id===e.theme)!.name}<small>Penjelasan dan latihan</small></span><span aria-hidden="true">→</span></a></li>)}</ul></section>)}</section>)}
  </div>;
}

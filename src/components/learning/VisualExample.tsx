import {useEffect,useMemo,useRef,useState} from 'preact/hooks';
import {evaluateQuestion,parseAnswer} from '../../learning/curriculum/engine';
import {allocate,exercise,getExample,workedExample,type ExampleAttempt,type Panel} from '../../learning/visual-examples/engine';
import ExamplePicture from './ExamplePicture';
import '../../styles/visual-examples.css';

export default function VisualExample({exampleId}:{exampleId:string}) {
  const entry=getExample(exampleId);
  const [ready,setReady]=useState(false),[mode,setMode]=useState<'worked'|'practice'>('worked'),[round,setRound]=useState(0);
  const [answer,setAnswer]=useState(''),[reason,setReason]=useState(-1),[hint,setHint]=useState(0),[marked,setMarked]=useState<string[]>([]),[dealt,setDealt]=useState(0),[picture,setPicture]=useState(true);
  const [attempts,setAttempts]=useState<ExampleAttempt[]>([]),[feedback,setFeedback]=useState(''),[error,setError]=useState('');
  const [answerInvalid,setAnswerInvalid]=useState(false),[reasonInvalid,setReasonInvalid]=useState(false);
  const heading=useRef<HTMLHeadingElement>(null),input=useRef<HTMLInputElement>(null),firstReason=useRef<HTMLInputElement>(null);
  const v=useMemo(()=>mode==='worked'?workedExample(entry):exercise(entry,round),[exampleId,mode,round]);
  const q=v.question, total=q.model.values[0]??0;
  useEffect(()=>setReady(true),[]);
  useEffect(()=>{if(ready) heading.current?.focus();},[mode,round]);
  const reset=()=>{setAnswer('');setReason(-1);setHint(0);setMarked([]);setDealt(0);setPicture(true);setAttempts([]);setFeedback('');setError('');setAnswerInvalid(false);setReasonInvalid(false);};
  const changeMode=(next:'worked'|'practice')=>{if(next!==mode){reset();setMode(next);}};
  const clearFeedback=()=>{setFeedback('');setError('');setAnswerInvalid(false);setReasonInvalid(false);};
  const isPractice=mode==='practice';
  const canHide=!['menghitung','pecahan','pecahan-senilai','desimal'].includes(entry.concept);
  const groups=v.divisionGroups;
  const allocation=groups?allocate(total,groups,dealt):[];
  const panels:Panel[]=isPractice&&groups?[{label:'Belum dibagikan',count:total-dealt},...allocation.map((n,i)=>({label:`Kelompok ${i+1}`,count:n}))]:v.panels;
  function check(event:Event) {
    event.preventDefault(); const invalidAnswer=parseAnswer(answer)===null, invalidReason=reason<0;
    setAnswerInvalid(invalidAnswer);setReasonInvalid(invalidReason);
    if(invalidAnswer||invalidReason){setError(invalidAnswer?'Tulis jawaban berupa bilangan.':'Pilih alasan yang menjelaskan caramu.');(invalidAnswer?input:firstReason).current?.focus();return;}
    setError(''); const result=evaluateQuestion(q,answer,reason,hint,attempts.length+1);
    // Worked examples are always available: do not claim this proves independent mastery.
    setAttempts([...attempts,{exampleId,seed:q.seed,round,ordinal:attempts.length+1,answer,reason,answerCorrect:result.answerCorrect,reasonCorrect:result.reasonCorrect,hintLevel:hint,workedViewed:true,pictureVisible:picture,marked:marked.length,dealt:groups?dealt:null}]);
    setFeedback(`${result.answerCorrect?'Jawaban bilangan tepat.':'Jawaban bilangan belum tepat.'} ${result.reasonCorrect?'Alasan tepat.':'Periksa kembali alasan.'}${result.answerCorrect&&result.reasonCorrect?' '+q.explanation:' Lihat hubungan pada gambar atau buka petunjuk.'}`);
  }
  return <div class="visual-example">
    <div class="example-modes" role="group" aria-label="Pilih kegiatan"><button type="button" disabled={!ready} aria-pressed={!isPractice} onClick={()=>changeMode('worked')}>Penjelasan</button><button type="button" disabled={!ready} aria-pressed={isPractice} onClick={()=>changeMode('practice')}>Latihan</button></div>
    {!ready&&<p role="status">Menyiapkan latihan…</p>}
    <section aria-labelledby="example-task"><h2 id="example-task" ref={heading} tabIndex={-1}>{isPractice?'Coba dengan bilangan berbeda':'Lihat hubungan, lalu cara menghitung'}</h2>
      <p class="example-prompt">{q.prompt}</p>
      {!isPractice&&<section class="example-concrete"><h3>1. Benda nyata</h3><p>{v.concrete}</p><p>Mintalah pendamping jika perlu. Benda di layar adalah gambar, bukan pengalaman memegang benda nyata.</p></section>}
      <h3>{isPractice?'Model untuk dicoba':'2. Gambar yang mewakili benda'}</h3>
      {isPractice&&canHide&&<button type="button" onClick={()=>setPicture(!picture)} aria-expanded={picture}>{picture?'Sembunyikan gambar':'Tampilkan gambar'}</button>}
      {picture&&<ExamplePicture theme={entry.theme} panels={panels} bridge={v.bridge} marked={marked} onMark={ready?(id)=>setMarked(marked.includes(id)?marked.filter(m=>m!==id):[...marked,id]):undefined}/>}
      {isPractice&&groups&&<div class="example-distribution"><p role="status">{total-dealt} belum dibagikan. Isi kelompok: {allocation.join(', ')}.</p><button type="button" disabled={!ready||dealt===total} onClick={()=>{setDealt(dealt+1);setMarked([]);}}>Bagikan satu</button><button type="button" disabled={!ready||dealt===0} onClick={()=>{setDealt(dealt-1);setMarked([]);}}>Kembalikan satu</button></div>}
      {!isPractice?<><section class="example-solution"><h3>3. Simbol dan langkah</h3><ol>{v.steps.map((step,i)=><li key={i}>{step}</li>)}</ol><p><strong>Mengapa?</strong> {q.reasons[q.correctReason]}</p></section><details><summary>Coba di luar layar</summary><p>{v.transfer}</p></details><p>Membaca contoh membantu memahami cara; belum menunjukkan bahwa kamu sudah bisa mengerjakannya sendiri.</p><button type="button" class="button" disabled={!ready} onClick={()=>changeMode('practice')}>Coba latihan</button></>:
      <><form onSubmit={check} class="example-answer" noValidate><label for="example-answer">Jawaban bilangan</label><p id="example-answer-help">Tulis hasilnya saja. Untuk desimal, koma atau titik boleh digunakan.</p><input ref={input} id="example-answer" type="text" inputMode="decimal" autoComplete="off" maxLength={20} value={answer} aria-invalid={answerInvalid} aria-describedby={`example-answer-help${answerInvalid?' example-error':''}`} onInput={e=>{setAnswer(e.currentTarget.value);clearFeedback();}} disabled={!ready}/>
        <fieldset aria-describedby={reasonInvalid?'example-error':undefined} aria-invalid={reasonInvalid}><legend>Mengapa cara itu tepat?</legend>{q.reasons.map((text,i)=><label class="example-reason" key={i}><input ref={i===0?firstReason:undefined} type="radio" name="example-reason" value={i} checked={reason===i} disabled={!ready} onChange={()=>{setReason(i);clearFeedback();}}/>{text}</label>)}</fieldset>
        <p id="example-error" role="alert">{error}</p><button type="submit" class="button" disabled={!ready}>Periksa jawaban</button>
      </form><p class="example-feedback" role="status" data-testid="example-feedback">{feedback}</p>
      <div class="example-actions"><button type="button" disabled={!ready||hint===3} onClick={()=>setHint(hint+1)}>Petunjuk{hint>0?` ${hint}/3`:''}</button><button type="button" disabled={!ready||round===9999} onClick={()=>{reset();setRound(round+1);}}>Latihan lain</button></div>
      {hint>0&&<aside class="example-hint" aria-label="Petunjuk" aria-live="polite"><ol>{q.hints.slice(0,hint).map((text,i)=><li key={i}>{text}</li>)}</ol></aside>}
      {attempts.length>0&&<details><summary>Catatan percobaan di halaman ini ({attempts.length})</summary><ul>{attempts.map(a=><li key={a.ordinal}>Percobaan {a.ordinal}: jawaban {a.answerCorrect?'tepat':'belum tepat'}, alasan {a.reasonCorrect?'tepat':'belum tepat'}; petunjuk {a.hintLevel}/3; gambar {a.pictureVisible?'terlihat':'disembunyikan'}; {a.marked} tanda hitung{a.dealt!==null?`; ${a.dealt} benda dibagikan`:''}.</li>)}</ul></details>}
      <p class="example-local-note">Percobaan hanya ada selama latihan ini terbuka, tidak disimpan ke Catatan keluarga dan tidak dihitung sebagai penguasaan materi.</p></>}
    </section>
    <nav class="example-links" aria-label="Lanjut memahami konsep"><a href={`/belajar/${entry.concept}`}>Buka materi konsep →</a><a href="/contoh">Pilih contoh lain →</a></nav>
  </div>;
}

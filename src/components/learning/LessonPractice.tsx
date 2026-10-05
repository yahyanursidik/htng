import { useEffect, useRef, useState } from "preact/hooks";
import { generateQuestion,evaluateQuestion,parseAnswer, type Evaluation } from "../../learning/curriculum/engine";
import { getLesson, lessons } from "../../learning/curriculum/catalog";
import { api,saveGuestAttempt, type Session, type Attempt } from "../../lib/account/api";
import MathModel from "./MathModel";
export default function LessonPractice({lessonId}: {lessonId:string}) {
  const lesson=getLesson(lessonId),nextLesson=lessons.find(l=>l.grade===lesson.grade&&lessons.indexOf(l)>lessons.indexOf(lesson));
  const [session,setSession]=useState<Session|null>(null),[ready,setReady]=useState(false),[round,setRound]=useState(0),[baseSeed,setBaseSeed]=useState(0),[answer,setAnswer]=useState(""),[reason,setReason]=useState(-1),[hints,setHints]=useState(0),[showModel,setShowModel]=useState(true),[result,setResult]=useState<Evaluation|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(""),[saveState,setSaveState]=useState(""),[finished,setFinished]=useState(false),[solved,setSolved]=useState(0);
  const pending=useRef<Attempt|null>(null),attemptNumber=useRef(0),answerInput=useRef<HTMLInputElement>(null),titleRef=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{setBaseSeed(Math.floor(Math.random()*1000000));api<Session>("/api/session").then(setSession).catch(()=>setError("Server akun belum terhubung. Belajar tetap tersedia sebagai tamu.")).finally(()=>setReady(true));},[]);
  const profile=session?.profiles.find(p=>p.id===session.activeProfileId);
  const question=generateQuestion(lessonId,baseSeed+round);
  async function persist(attempt:Attempt) {
    if(profile){await api("/api/attempts","POST",{...attempt,profileId:profile.id});setSaveState(`Catatan tersimpan untuk ${profile.nickname}.`);}
    else {setSaveState(saveGuestAttempt(attempt)?"Catatan tamu tersimpan di browser ini.":"Penyimpanan browser tidak tersedia. Jawaban belum disimpan.");}
    pending.current=null;
  }
  async function submit(event:SubmitEvent) {
    event.preventDefault();if(busy||pending.current||!ready||result?.answerCorrect&&result.reasonCorrect)return;
    if(parseAnswer(answer)===null){setError("Tulis angka. Untuk desimal, gunakan koma atau titik; tanpa pemisah ribuan.");answerInput.current?.focus();return;}
    if(reason<0){setError("Pilih alasan yang sesuai, lalu periksa jawaban.");return;}
    attemptNumber.current++;const evaluation=evaluateQuestion(question,answer,reason,hints,attemptNumber.current);setResult(evaluation);setError("");setSaveState("");setBusy(true);
    const attempt:Attempt={id:crypto.randomUUID(),lessonId,seed:question.seed,answer,reason,hints,answerCorrect:evaluation.answerCorrect,reasonCorrect:evaluation.reasonCorrect,independent:evaluation.independent,created:Date.now()};pending.current=attempt;
    try{await persist(attempt);}catch(e){setError(`${(e as Error).message} Jawaban tetap terlihat. Coba simpan lagi sebelum berpindah.`);}finally{setBusy(false);}
  }
  function advance(skip=false){if(busy)return;if(pending.current){setError("Catatan belum tersimpan. Coba simpan lagi, atau lanjut tanpa menyimpan.");return;}if(!skip)setSolved(solved+1);if(round===4){setFinished(true);return;}attemptNumber.current=0;setRound(round+1);setAnswer("");setReason(-1);setHints(0);setResult(null);setError("");setSaveState("");setShowModel(round<1);setTimeout(()=>titleRef.current?.focus(),0);}
  if(finished)return <section class="practice-summary"><h2>Sesi selesai</h2><p>{solved} dari 5 soal diselesaikan dengan jawaban dan alasan yang tepat. Soal yang dilewati bukan jawaban salah.</p><p>Catatan adalah bahan percakapan, bukan bukti bahwa seluruh materi sudah dikuasai.</p><h3>Coba tanpa layar</h3><p>{lesson.offline}</p><div class="actions"><a class="button" href={`/belajar/${lesson.id}`}>Latih lagi</a>{nextLesson&&<a class="button button--quiet" href={`/belajar/${nextLesson.id}`}>Materi berikutnya</a>}<a href="/progres">Catatan belajar</a></div></section>;
  const correct=!!(result?.answerCorrect&&result.reasonCorrect);
  return <section class="practice" aria-busy={busy}><div class="practice-context"><p>Soal {round+1} dari 5</p><p>{!ready?"Menyiapkan sesi…":profile?`Belajar sebagai ${profile.nickname}`:session?.user?"Belum memilih profil; catatan disimpan sebagai tamu.":"Mode tamu · catatan hanya di browser ini"}</p></div>
    <h2 ref={titleRef} tabIndex={-1}>{question.prompt}</h2>
    <button class="quiet" aria-expanded={showModel} onClick={()=>setShowModel(!showModel)}>{showModel?"Sembunyikan model":"Tampilkan model"}</button>
    {showModel&&<MathModel key={`${lessonId}-${round}`} model={question.model}/>}
    <form onSubmit={submit} class="form-stack"><label class="answer-field">Jawaban {question.unit&&`(${question.unit})`}<input ref={answerInput} name="answer" type="text" inputMode={lessonId==="bilangan-negatif"?"text":"decimal"} autoComplete="off" value={answer} disabled={correct||busy||!!pending.current} onInput={e=>{setAnswer(e.currentTarget.value);setResult(null);}} aria-invalid={result&&!result.answerCorrect?true:undefined} aria-describedby="answer-format practice-error" maxLength={20}/></label><p id="answer-format" class="muted">Tulis angka tanpa pemisah ribuan. Desimal boleh memakai koma atau titik.</p>
    <fieldset disabled={correct||busy||!!pending.current}><legend>Mengapa cara itu tepat?</legend><div class="reason-options">{question.reasons.map((text,i)=><label class="reason-option"><input type="radio" name="reason" value={i} checked={reason===i} onChange={()=>{setReason(i);setResult(null);}}/>{text}</label>)}</div></fieldset>
    <div class="actions"><button disabled={busy||correct||!ready||!!pending.current} type="submit">{busy?"Menyimpan…":"Periksa jawaban"}</button><button class="quiet" type="button" disabled={hints===3||busy||!!pending.current} onClick={()=>{setHints(hints+1);setShowModel(true);}}>Petunjuk {hints}/3</button></div>
    </form>
    <div role="status" class={correct?"feedback feedback--success":"feedback"}>{result?.feedback}</div>
    {hints>0&&<aside class="hint" aria-label="Petunjuk"><h3>Petunjuk {hints}</h3><p>{question.hints[hints-1]}</p></aside>}
    <p id="practice-error" role="alert" class="error">{error}</p><p role="status" class="muted">{saveState}</p>
    {pending.current&&<div class="actions"><button disabled={busy} onClick={async()=>{if(!pending.current)return;setBusy(true);try{await persist(pending.current);setError("");}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}>Coba simpan lagi</button><button class="quiet" disabled={busy} onClick={()=>{pending.current=null;setError("");setSaveState("Catatan soal ini tidak disimpan.");}}>Lanjut tanpa menyimpan</button></div>}
    <div class="actions">{correct?<button disabled={busy||!!pending.current} onClick={()=>advance()}>{round===4?"Selesaikan sesi":"Soal berikutnya"}</button>:<button class="quiet" disabled={busy||!!pending.current} onClick={()=>advance(true)}>Lewati soal</button>}</div>
  </section>;
}

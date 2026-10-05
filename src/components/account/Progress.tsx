import { useEffect,useState } from "preact/hooks";
import { api,readGuestAttempts,clearGuestAttempts,type Session,type Attempt } from "../../lib/account/api";
import { lessons } from "../../learning/curriculum/catalog";
export function summarize(attempts:Attempt[]) {
  return lessons.map(lesson=>{
    const records=attempts.filter(a=>a.lessonId===lesson.id); const seeds=[...new Set(records.map(a=>a.seed))];
    const independent=seeds.filter(seed=>records.some(a=>a.seed===seed&&!!a.independent)).length;
    const both=seeds.filter(seed=>records.some(a=>a.seed===seed&&a.answerCorrect&&a.reasonCorrect)).length;
    const reasoning=records.some(a=>a.answerCorrect&&!a.reasonCorrect);
    const status=!records.length?"Belum dicoba":independent>=3?"Coba terapkan tanpa model":reasoning?"Diskusikan alasannya":both?"Lanjutkan latihan bervariasi":"Coba lagi bersama model";
    return {lesson,records,seeds:seeds.length,independent,both,status};
  });
}
export default function Progress() {
  const [session,setSession]=useState<Session|null>(null),[profileId,setProfileId]=useState("guest"),[attempts,setAttempts]=useState<Attempt[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[grade,setGrade]=useState(0),[confirmClear,setConfirmClear]=useState(false);
  useEffect(()=>{api<Session>("/api/session").then(s=>{setSession(s);setProfileId(s.activeProfileId??"guest");}).catch(()=>setError("Server akun belum terhubung. Menampilkan catatan tamu di browser ini.")).finally(()=>setLoading(false));},[]);
  useEffect(()=>{if(profileId==="guest"){setAttempts(readGuestAttempts());return;}let active=true;setLoading(true);setError("");setAttempts([]);api<{attempts:Attempt[]}>(`/api/progress?profileId=${encodeURIComponent(profileId)}`).then(d=>{if(active)setAttempts(d.attempts);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[profileId]);
  const summary=summarize(attempts).filter(s=>grade===0||s.lesson.grade===grade);
  const practiced=summary.filter(s=>s.records.length);
  return <div class="section-stack"><section><div class="filters"><label>Catatan untuk<select value={profileId} onChange={e=>setProfileId(e.currentTarget.value)}><option value="guest">Tamu di browser ini</option>{session?.profiles.map(p=><option value={p.id}>{p.nickname} · kelas {p.grade}</option>)}</select></label><label>Kelas materi<select value={grade} onChange={e=>setGrade(Number(e.currentTarget.value))}><option value={0}>Semua kelas</option>{[1,2,3,4,5,6].map(n=><option value={n}>Kelas {n}</option>)}</select></label></div>
  <p>Jawaban, alasan, dan penggunaan petunjuk dicatat terpisah. “Tanpa petunjuk” hanya dihitung pada jawaban pertama yang tepat untuk satu soal. Ini bukan nilai rapor atau diagnosis penguasaan.</p><p class="muted">{profileId==="guest"?"Catatan tamu tetap terpisah dari akun. Menghapus data browser menghapus catatan tamu.":"Catatan profil disimpan di server aplikasi ini; hanya akun keluarga yang memilikinya dapat membuka."}</p>
  {loading&&<p role="status">Memuat catatan…</p>}<p role="alert" class="error">{error}</p>
  {!loading&&!practiced.length&&<div><h2>Belum ada latihan tercatat.</h2><p>Mulai satu materi, lalu periksa jawaban dan alasannya.</p><a class="button" href="/belajar">Pilih materi</a></div>}
  {!loading&&practiced.length>0&&<ul class="progress-list">{practiced.map(s=><li><div><h2>{s.lesson.title}</h2><p>Kelas {s.lesson.grade} · {s.status}</p><p class="muted">{s.seeds} soal berbeda · {s.both} dengan jawaban dan alasan tepat · {s.independent} tepat pada percobaan pertama tanpa petunjuk.</p></div><a class="button button--quiet" href={`/belajar/${s.lesson.id}`}>Latih lagi</a></li>)}</ul>}
  </section><section><h2>Percakapan setelah belajar</h2><p>Tanyakan “Apa yang berubah?”, “Mengapa cara itu masuk akal?”, dan “Bisakah kamu menunjukkan dengan benda lain?”. Beri waktu menjelaskan sebelum menawarkan cara sendiri.</p><a href="/panduan">Panduan pendamping</a></section>
  {attempts.length>0&&<section><h2>Catatan percobaan terbaru</h2><ol class="recent-attempts">{attempts.toSorted((a,b)=>b.created-a.created).slice(0,10).map(a=><li><strong>{lessons.find(l=>l.id===a.lessonId)?.title??"Materi"}</strong><p>{new Date(a.created).toLocaleString("id-ID")} · jawaban {a.answer}: {a.answerCorrect?"tepat":"belum tepat"} · alasan: {a.reasonCorrect?"tepat":"perlu dibahas"} · {a.hints} petunjuk.</p></li>)}</ol></section>}
  {profileId==="guest"&&attempts.length>0&&<section><button class="quiet" onClick={()=>setConfirmClear(true)}>Hapus catatan tamu</button>{confirmClear&&<div><p>Ini menghapus catatan tamu di browser ini secara permanen. Data akun tidak berubah.</p><div class="actions"><button class="danger" onClick={()=>{try{clearGuestAttempts();setAttempts([]);setConfirmClear(false);}catch{setError("Browser belum mengizinkan penghapusan data.");}}}>Ya, hapus catatan tamu</button><button class="quiet" onClick={()=>setConfirmClear(false)}>Batal</button></div></div>}</section>}
  </div>;
}

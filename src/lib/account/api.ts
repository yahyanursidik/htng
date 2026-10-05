export interface Profile { id: string; nickname: string; grade: number; }
export interface Session { user: { id: string; name: string; email: string } | null; profiles: Profile[]; activeProfileId: string | null; csrf: string | null; }
export interface Attempt { id: string; lessonId: string; seed: number; answer: string; reason: number; hints: number; answerCorrect: number | boolean; reasonCorrect: number | boolean; independent: number | boolean; created: number; }
export async function api<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const headers: Record<string,string> = {};
  if (method !== "GET") {
    headers["Content-Type"]="application/json";
    if (!path.startsWith("/api/auth/login") && !path.startsWith("/api/auth/register")) {
      const session=await api<Session>("/api/session");
      if (!session.user || !session.csrf) throw new Error("Sesi berakhir. Masuk kembali untuk menyimpan data.");
      headers["X-CSRF-Token"]=session.csrf;
    }
  }
  let response: Response;
  try { response=await fetch(path,{method,headers,credentials:"same-origin",body:body===undefined?undefined:JSON.stringify(body)}); }
  catch { throw new Error("Belum tersambung ke server. Periksa koneksi, lalu coba lagi."); }
  const data=await response.json().catch(()=>null);
  if(!response.ok || data===null) throw new Error(data?.error??"Server akun belum tersedia. Jalankan server aplikasi, lalu coba lagi.");
  return data as T;
}
const key="mathyahya.guest.curriculum.v1";
function validAttempt(value: unknown): value is Attempt {
  if(!value || typeof value!=="object") return false;
  const v=value as Partial<Attempt>;
  return typeof v.id==="string" && typeof v.lessonId==="string" && Number.isInteger(v.seed) && typeof v.answer==="string" && Number.isInteger(v.reason) && Number.isInteger(v.hints) && typeof v.created==="number" && typeof v.answerCorrect==="boolean" && typeof v.reasonCorrect==="boolean" && typeof v.independent==="boolean";
}
export function readGuestAttempts(): Attempt[] {
  try { const data=JSON.parse(localStorage.getItem(key)??"[]"); return Array.isArray(data)?data.filter(validAttempt).slice(-1000):[]; } catch { return []; }
}
export function saveGuestAttempt(attempt: Attempt): boolean {
  try { const data=readGuestAttempts(); if(!data.some(a=>a.id===attempt.id)) data.push(attempt); localStorage.setItem(key,JSON.stringify(data.slice(-1000))); return true; } catch { return false; }
}
export function clearGuestAttempts(): void { localStorage.removeItem(key); }

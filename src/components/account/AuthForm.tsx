import { useState } from "preact/hooks";
import { api } from "../../lib/account/api";
export default function AuthForm({mode}: {mode:"login"|"register"}) {
  const register=mode==="register";
  const [busy,setBusy]=useState(false), [error,setError]=useState(""), [show,setShow]=useState(false);
  async function submit(event: SubmitEvent) {
    event.preventDefault(); if(busy)return; const form=event.currentTarget as HTMLFormElement; const data=new FormData(form);
    if(register && data.get("password")!==data.get("confirm")) {setError("Kedua kata sandi belum sama. Periksa kolom konfirmasi.");return;}
    setBusy(true);setError("");
    try { await api(`/api/auth/${register?"register":"login"}`,"POST",{name:data.get("name"),email:data.get("email"),password:data.get("password"),consent:data.get("consent")==="on"}); window.location.assign("/keluarga"); }
    catch(error) {setError((error as Error).message);setBusy(false);}
  }
  return <form class="form-stack" onSubmit={submit} aria-busy={busy}>
    {register&&<label>Nama pendamping<input name="name" autoComplete="name" required minLength={2} maxLength={48}/></label>}
    <label>Email pendamping<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>
    <label>Kata sandi<input name="password" type={show?"text":"password"} autoComplete={register?"new-password":"current-password"} required minLength={15} maxLength={128} aria-describedby="password-help auth-error"/></label>
    <p id="password-help" class="muted">15–128 karakter. Gunakan frasa panjang; spasi diperbolehkan.</p>
    {register&&<label>Ulangi kata sandi<input name="confirm" type={show?"text":"password"} autoComplete="new-password" required minLength={15} maxLength={128} aria-describedby="auth-error"/></label>}
    <label class="check-label"><input type="checkbox" checked={show} onChange={e=>setShow(e.currentTarget.checked)}/>Tampilkan kata sandi</label>
    {register&&<label class="check-label check-label--consent"><input name="consent" type="checkbox" required/><span>Saya pendamping dewasa dan menyetujui penyimpanan data belajar sesuai <a href="/privasi">kebijakan privasi</a>.</span></label>}
    <p id="auth-error" role="alert" class="error">{error}</p>
    <button disabled={busy} type="submit">{busy?"Memproses…":register?"Buat akun":"Masuk"}</button>
    <p>{register?"Sudah punya akun?":"Belum punya akun?"} <a href={register?"/masuk":"/daftar"}>{register?"Masuk":"Daftar"}</a></p>
    <p class="muted">Belum ada pemulihan kata sandi melalui email. Simpan kata sandi Anda dengan aman. Anak tidak perlu alamat email.</p>
  </form>;
}

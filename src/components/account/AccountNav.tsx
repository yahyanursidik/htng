import { useEffect, useState } from "preact/hooks";
import { api, type Session } from "../../lib/account/api";
export default function AccountNav() {
  const [session,setSession]=useState<Session|null>(null);
  useEffect(()=>{let alive=true; api<Session>("/api/session").then(s=>{if(alive)setSession(s);}).catch(()=>{}); return()=>{alive=false;};},[]);
  return session?.user ? <a class="button button--quiet" href="/keluarga">Keluarga saya</a> : <div class="actions"><a href="/masuk">Masuk</a><a class="button" href="/daftar">Daftar</a></div>;
}

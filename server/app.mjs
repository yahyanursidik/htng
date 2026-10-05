import { createServer } from 'node:http';
import { randomBytes, randomUUID, createHash, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { resolve, dirname, extname, sep } from 'node:path';
import { generateQuestion, evaluateQuestion, parseAnswer } from '../src/learning/curriculum/engine.ts';
import { lessons } from '../src/learning/curriculum/catalog.ts';

const derive = promisify(scrypt);
const hashToken = token => createHash('sha256').update(token).digest('hex');
const passwordOptions = { N: 131072, r: 8, p: 1, maxmem: 192 * 1024 * 1024 };
async function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  return `${salt}:${(await derive(password, salt, 64, passwordOptions)).toString('hex')}`;
}
async function verifyPassword(password, stored) {
  const [salt, expected] = stored.split(':');
  const actual = (await derive(password, salt, 64, passwordOptions));
  return timingSafeEqual(actual, Buffer.from(expected, 'hex'));
}
class ApiError extends Error { constructor(status, message) { super(message); this.status = status; } }
function requireValue(condition, message = 'Data tidak valid.', status = 400) { if (!condition) throw new ApiError(status, message); }
function cleanName(value, max = 48) { requireValue(typeof value === 'string' && value.trim().length >= 2 && value.trim().length <= max, `Nama harus 2–${max} karakter.`); return value.trim(); }
function credentials(body) {
  requireValue(typeof body.email === 'string' && body.email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email), 'Alamat email belum valid. Periksa penulisannya.');
  requireValue(typeof body.password === 'string' && body.password.length >= 15 && body.password.length <= 128, 'Kata sandi harus 15–128 karakter. Gunakan frasa panjang yang mudah diingat.');
  return {email: body.email.trim().toLowerCase(), password: body.password};
}
async function readBody(request) {
  requireValue(request.headers['content-type']?.split(';')[0] === 'application/json', 'Kirim data sebagai JSON.', 415);
  let bytes = 0; const chunks = [];
  for await (const chunk of request) { bytes += chunk.length; requireValue(bytes <= 16384, 'Data terlalu besar.', 413); chunks.push(chunk); }
  try { const value = JSON.parse(Buffer.concat(chunks).toString('utf8')); requireValue(value && typeof value === 'object' && !Array.isArray(value)); return value; }
  catch (error) { if (error instanceof ApiError) throw error; throw new ApiError(400, 'Format data belum valid.'); }
}

export async function createApp({database = resolve('data/mathyahya.sqlite'), root = resolve('dist'), origin = 'http://127.0.0.1:4322', production = false, now = () => Date.now()} = {}) {
  const publicOrigin = new URL(origin).origin;
  if (production && !publicOrigin.startsWith('https://')) throw new Error('Produksi membutuhkan APP_ORIGIN HTTPS.');
  if (database !== ':memory:') mkdirSync(dirname(database), {recursive: true});
  const db = new DatabaseSync(database);
  db.exec(`PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS accounts(id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password TEXT NOT NULL, created INTEGER NOT NULL, active_profile TEXT);
    CREATE TABLE IF NOT EXISTS profiles(id TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE, nickname TEXT NOT NULL, grade INTEGER NOT NULL CHECK(grade BETWEEN 1 AND 6));
    CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE, csrf TEXT NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS attempts(id TEXT PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, lesson_id TEXT NOT NULL, seed INTEGER NOT NULL, answer TEXT NOT NULL, reason INTEGER NOT NULL, hints INTEGER NOT NULL, answer_correct INTEGER NOT NULL, reason_correct INTEGER NOT NULL, independent INTEGER NOT NULL, created INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS attempts_profile_time ON attempts(profile_id, created DESC);`);
  const dummy = await hashPassword(randomBytes(24).toString('hex'));
  const limits = new Map(); let hashing = 0;
  const limitedHash = async task => { requireValue(hashing < 2, 'Server sedang memproses akun. Coba lagi sebentar.', 503); hashing++; try { return await task(); } finally { hashing--; } };
  const rateLimit = (request, category, max) => {
    const key = `${category}:${request.socket.remoteAddress}`;
    const time = now(); const entry = limits.get(key);
    if (!entry || time-entry.start >= 600000) limits.set(key,{start:time,count:1});
    else { entry.count++; requireValue(entry.count <= max, 'Terlalu banyak percobaan. Tunggu 10 menit sebelum mencoba lagi.', 429); }
    if (limits.size > 10000) for (const [k,v] of limits) if (time-v.start >= 600000) limits.delete(k);
  };
  function sessionFor(request) {
    const cookie = request.headers.cookie?.split(';').map(s=>s.trim()).find(s=>s.startsWith('mathyahya_session='))?.slice(18);
    if (!cookie || !/^[a-f0-9]{64}$/.test(cookie)) return null;
    return db.prepare('SELECT s.*, a.email, a.name, a.active_profile FROM sessions s JOIN accounts a ON a.id=s.account_id WHERE token=? AND expires>?').get(hashToken(cookie),now()) ?? null;
  }
  function sessionData(session) {
    if (!session) return {user:null,profiles:[],activeProfileId:null,csrf:null};
    const profiles=db.prepare('SELECT id,nickname,grade FROM profiles WHERE account_id=? ORDER BY rowid').all(session.account_id);
    return {user:{id:session.account_id,name:session.name,email:session.email},profiles,activeProfileId:profiles.some(p=>p.id===session.active_profile)?session.active_profile:null,csrf:session.csrf};
  }
  const cookieHeader = (token, maxAge) => `mathyahya_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${production?'; Secure':''}`;
  function newSession(accountId,response) {
    db.prepare('DELETE FROM sessions WHERE expires<=?').run(now());
    const token=randomBytes(32).toString('hex'), csrf=randomBytes(32).toString('hex');
    db.prepare('INSERT INTO sessions VALUES(?,?,?,?)').run(hashToken(token),accountId,csrf,now()+7*86400000);
    response.setHeader('Set-Cookie',cookieHeader(token,7*86400));
    return db.prepare('SELECT s.*,a.email,a.name,a.active_profile FROM sessions s JOIN accounts a ON a.id=s.account_id WHERE token=?').get(hashToken(token));
  }
  function ownedProfile(session,id) { requireValue(typeof id==='string'); const profile=db.prepare('SELECT id,nickname,grade FROM profiles WHERE id=? AND account_id=?').get(id,session.account_id); requireValue(profile,'Profil tidak ditemukan.',404); return profile; }
  const server=createServer(async (request,response) => {
    response.setHeader('X-Content-Type-Options','nosniff');
    response.setHeader('Referrer-Policy','same-origin');
    response.setHeader('X-Frame-Options','DENY');
    if (production) response.setHeader('Strict-Transport-Security','max-age=31536000');
    const send=(status,data)=>{response.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}); response.end(JSON.stringify(data));};
    try {
      const url=new URL(request.url,publicOrigin); const path=url.pathname; const method=request.method;
      if (!path.startsWith('/api/')) {
        requireValue(method==='GET'||method==='HEAD','Metode tidak didukung.',405);
        const requested=decodeURIComponent(path); let file=resolve(root,`.${requested}`);
        requireValue(file===root||file.startsWith(root+sep),'Tidak diizinkan.',403);
        let details; try { details=await stat(file); if(details.isDirectory()) file=resolve(file,'index.html'); details=await stat(file); } catch { throw new ApiError(404,'Halaman tidak ditemukan.'); }
        const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.woff2':'font/woff2','.woff':'font/woff','.svg':'image/svg+xml','.png':'image/png'};
        response.writeHead(200,{'Content-Type':mime[extname(file)]??'application/octet-stream'});
        if(method==='HEAD') response.end(); else createReadStream(file).pipe(response); return;
      }
      response.setHeader('Cache-Control','no-store');
      const session=sessionFor(request);
      if(method==='GET' && path==='/api/session') { send(200,sessionData(session)); return; }
      const mutation=!['GET','HEAD'].includes(method);
      if(mutation) {
        requireValue(request.headers.origin===publicOrigin && request.headers['sec-fetch-site']!=='cross-site','Permintaan harus berasal dari aplikasi ini.',403);
        if(!['/api/auth/register','/api/auth/login'].includes(path)) {
          requireValue(session,'Silakan masuk untuk menyimpan belajar.',401);
          const csrf=request.headers['x-csrf-token']; requireValue(typeof csrf==='string' && /^[a-f0-9]{64}$/.test(csrf) && timingSafeEqual(Buffer.from(csrf),Buffer.from(session.csrf)),'Sesi berubah. Muat ulang halaman dan coba lagi.',403);
        }
      }
      if(method==='POST' && ['/api/auth/register','/api/auth/login'].includes(path)) {
        rateLimit(request,'auth',20); const body=await readBody(request); const {email,password}=credentials(body);
        if(path.endsWith('register')) {
          const name=cleanName(body.name); requireValue(body.consent===true,'Persetujuan pendamping diperlukan.');
          const hash=await limitedHash(()=>hashPassword(password)); const id=randomUUID();
          try { db.prepare('INSERT INTO accounts(id,email,name,password,created) VALUES(?,?,?,?,?)').run(id,email,name,hash,now()); }
          catch(error) { if(error.code?.startsWith('ERR_SQLITE')) throw new ApiError(409,'Alamat email tidak dapat didaftarkan. Coba masuk atau gunakan alamat lain.'); throw error; }
          if(session) db.prepare('DELETE FROM sessions WHERE token=?').run(session.token);
          send(201,sessionData(newSession(id,response))); return;
        }
        const account=db.prepare('SELECT * FROM accounts WHERE email=?').get(email);
        const valid=await limitedHash(()=>verifyPassword(password,account?.password??dummy)); requireValue(account&&valid,'Email atau kata sandi belum cocok. Periksa keduanya.',401);
        if(session) db.prepare('DELETE FROM sessions WHERE token=?').run(session.token);
        send(200,sessionData(newSession(account.id,response))); return;
      }
      requireValue(session,'Silakan masuk untuk membuka data keluarga.',401);
      if(method==='POST' && path==='/api/auth/logout') { await readBody(request); db.prepare('DELETE FROM sessions WHERE token=?').run(session.token); response.setHeader('Set-Cookie',cookieHeader('',0)); send(200,{ok:true}); return; }
      if(method==='POST' && path==='/api/profiles') {
        const body=await readBody(request); const nickname=cleanName(body.nickname,32); requireValue(Number.isInteger(body.grade)&&body.grade>=1&&body.grade<=6,'Pilih kelas 1 sampai 6.');
        requireValue(db.prepare('SELECT COUNT(*) AS n FROM profiles WHERE account_id=?').get(session.account_id).n<6,'Maksimal enam profil anak per akun.');
        const id=randomUUID(); db.prepare('INSERT INTO profiles VALUES(?,?,?,?)').run(id,session.account_id,nickname,body.grade);
        db.prepare('UPDATE accounts SET active_profile=? WHERE id=?').run(id,session.account_id); send(201,sessionData({...session,active_profile:id})); return;
      }
      if(method==='POST' && path==='/api/profiles/active') {
        const body=await readBody(request); ownedProfile(session,body.profileId); db.prepare('UPDATE accounts SET active_profile=? WHERE id=?').run(body.profileId,session.account_id); send(200,sessionData({...session,active_profile:body.profileId})); return;
      }
      if(method==='PATCH' && path==='/api/profiles') {
        const body=await readBody(request); ownedProfile(session,body.profileId); const nickname=cleanName(body.nickname,32); requireValue(Number.isInteger(body.grade)&&body.grade>=1&&body.grade<=6,'Pilih kelas 1 sampai 6.');
        db.prepare('UPDATE profiles SET nickname=?,grade=? WHERE id=?').run(nickname,body.grade,body.profileId); send(200,sessionData(session)); return;
      }
      if(method==='POST' && path==='/api/attempts') {
        rateLimit(request,'attempt',300); const body=await readBody(request); ownedProfile(session,body.profileId);
        requireValue(typeof body.id==='string' && /^[a-f0-9-]{36}$/i.test(body.id)); requireValue(Number.isInteger(body.seed)&&body.seed>=0&&body.seed<=2147483647); requireValue(lessons.some(l=>l.id===body.lessonId));
        requireValue(typeof body.answer==='string'&&parseAnswer(body.answer)!==null,'Jawaban harus berupa angka.'); requireValue(Number.isInteger(body.reason)&&body.reason>=0&&body.reason<=2); requireValue(Number.isInteger(body.hints)&&body.hints>=0&&body.hints<=3);
        const previous=db.prepare('SELECT profile_id FROM attempts WHERE id=?').get(body.id); if(previous) { requireValue(previous.profile_id===body.profileId,'ID catatan sudah digunakan.',409); send(200,{ok:true,duplicate:true}); return; }
        const question=generateQuestion(body.lessonId,body.seed); const attemptNumber=1+db.prepare('SELECT COUNT(*) AS n FROM attempts WHERE profile_id=? AND lesson_id=? AND seed=?').get(body.profileId,body.lessonId,body.seed).n; const evaluation=evaluateQuestion(question,body.answer,body.reason,body.hints,attemptNumber);
        db.prepare('INSERT INTO attempts VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(body.id,body.profileId,body.lessonId,body.seed,body.answer,body.reason,body.hints,+evaluation.answerCorrect,+evaluation.reasonCorrect,+evaluation.independent,now());
        db.prepare('DELETE FROM attempts WHERE profile_id=? AND id NOT IN (SELECT id FROM attempts WHERE profile_id=? ORDER BY created DESC,rowid DESC LIMIT 1000)').run(body.profileId,body.profileId);
        send(201,{ok:true,evaluation}); return;
      }
      if(method==='GET' && path==='/api/progress') { const profile=ownedProfile(session,url.searchParams.get('profileId')); const attempts=db.prepare('SELECT id,lesson_id AS lessonId,seed,answer,reason,hints,answer_correct AS answerCorrect,reason_correct AS reasonCorrect,independent,created FROM attempts WHERE profile_id=? ORDER BY created DESC,rowid DESC').all(profile.id); send(200,{profile,attempts}); return; }
      if(method==='GET' && path==='/api/export') { const profiles=sessionData(session).profiles; const attempts=db.prepare('SELECT t.* FROM attempts t JOIN profiles p ON p.id=t.profile_id WHERE p.account_id=? ORDER BY t.created DESC').all(session.account_id); send(200,{exportedAt:new Date(now()).toISOString(),account:{name:session.name,email:session.email},profiles,attempts}); return; }
      if(method==='POST' && path==='/api/account/password') {
        rateLimit(request,'password',10); const body=await readBody(request); requireValue(typeof body.currentPassword==='string' && body.currentPassword.length<=128); const {password}=credentials({email:session.email,password:body.password});
        const account=db.prepare('SELECT password FROM accounts WHERE id=?').get(session.account_id); const valid=await limitedHash(()=>verifyPassword(body.currentPassword,account.password)); requireValue(valid,'Kata sandi saat ini belum cocok.',401);
        const hash=await limitedHash(()=>hashPassword(password)); db.prepare('UPDATE accounts SET password=? WHERE id=?').run(hash,session.account_id); db.prepare('DELETE FROM sessions WHERE account_id=?').run(session.account_id); send(200,sessionData(newSession(session.account_id,response))); return;
      }
      if(method==='DELETE' && path==='/api/account') {
        rateLimit(request,'password',10); const body=await readBody(request); requireValue(body.confirmation===session.email,'Ketik email akun untuk mengonfirmasi penghapusan.'); requireValue(typeof body.password==='string' && body.password.length<=128);
        const account=db.prepare('SELECT password FROM accounts WHERE id=?').get(session.account_id); requireValue(await limitedHash(()=>verifyPassword(body.password,account.password)),'Kata sandi belum cocok.',401);
        db.prepare('DELETE FROM accounts WHERE id=?').run(session.account_id); response.setHeader('Set-Cookie',cookieHeader('',0)); send(200,{ok:true}); return;
      }
      throw new ApiError(404,'Layanan tidak ditemukan.');
    } catch(error) { if(error instanceof ApiError) send(error.status,{error:error.message}); else { console.error('Request failed:',error.name); send(500,{error:'Server belum dapat memproses data. Coba lagi.'}); } }
  });
  server.on('close',()=>db.close());
  return server;
}

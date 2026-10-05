import { parseAnswer } from "../curriculum/engine";

export type Phase = "concrete" | "pictorial" | "abstract";
export type Mode = "build" | "transfer" | "exchange" | "select" | "layers" | "line" | "redistribute";
export interface Game { id:string; grade:number; title:string; lessonId:string; description:string; }
export const games: Game[] = [
  {id:"gabungkan",grade:1,title:"Dua kelompok, satu jumlah",lessonId:"menjumlah",description:"Susun dua kelompok lalu hubungkan dengan penjumlahan."},
  {id:"ambil",grade:1,title:"Ambil dan sisakan",lessonId:"mengurangi",description:"Pindahkan sebagian benda; jumlah awal tetap terlacak."},
  {id:"tukar",grade:2,title:"Bengkel puluhan",lessonId:"nilai-tempat",description:"Tukar sepuluh satuan dengan satu puluhan tanpa mengubah nilai."},
  {id:"ukur",grade:2,title:"Pita tanpa celah",lessonId:"panjang",description:"Isi panjang pita dengan unit yang sama."},
  {id:"kelompok",grade:3,title:"Susun kelompok sama",lessonId:"perkalian",description:"Bangun kelompok sama besar dan temukan hasil kalinya."},
  {id:"bagi",grade:3,title:"Bagikan dengan adil",lessonId:"pembagian",description:"Bagikan seluruh benda ke wadah sama banyak."},
  {id:"bagian",grade:3,title:"Lipat dan pilih",lessonId:"pecahan",description:"Hubungkan bagian sama besar dengan pembilang dan penyebut."},
  {id:"senilai",grade:4,title:"Dua gambar, bagian sama",lessonId:"pecahan-senilai",description:"Bandingkan perempat dan perdelapan pada utuh yang sama."},
  {id:"ubin",grade:4,title:"Tutupi permukaan",lessonId:"luas",description:"Isi kotak satuan, bukan hanya menghitung tepinya."},
  {id:"desimal",grade:5,title:"Pita persepuluhan",lessonId:"desimal",description:"Hubungkan sepuluh bagian sama dengan desimal."},
  {id:"lapisan",grade:5,title:"Bangun ruang berlapis",lessonId:"volume",description:"Susun lapisan kubus; bedakan luas lapisan dan volume."},
  {id:"ratakan",grade:5,title:"Ratakan tumpukan",lessonId:"rata-rata",description:"Pindahkan benda sampai tiap tumpukan sama banyak."},
  {id:"rasio",grade:6,title:"Resep dengan rasa sama",lessonId:"perbandingan",description:"Jaga satu gelas untuk dua sendok pada resep yang diperbesar."},
  {id:"lintasi-nol",grade:6,title:"Melangkah melewati nol",lessonId:"bilangan-negatif",description:"Hitung perpindahan, bukan jumlah tanda yang disentuh."},
];
export interface Challenge {
  gameId:string; seed:number; mode:Mode; prompt:string; concrete:string; bridge:string;
  initial:number[]; target:number[]; labels:string[]; limit:number; columns:number;
  expected:number; abstractPrompt:string; equation:string; reasons:string[]; correctReason:number;
  hints:string[]; explanation:string;
}
export type Action = {type:"change";index:number;delta:1|-1} | {type:"move";from:number;to:number} | {type:"exchange";split:boolean};
export function generateChallenge(gameId:string,seed:number):Challenge {
  if(!games.some(g=>g.id===gameId)) throw new Error("Permainan tidak ditemukan.");
  if(!Number.isInteger(seed)||seed<0||seed>2147483647) throw new Error("Seed tidak valid.");
  const a=2+seed%3,b=2+Math.floor(seed/3)%3,n=3+seed%3;
  let mode:Mode="build",initial=[0,0],target=[a,b],labels=["Awal","Datang"],limit=24,columns=4;
  let prompt="",concrete="",bridge="",expected=a+b,abstractPrompt="Berapa semua benda?",equation=`${a} + ${b}`,reason="",wrong=["Hanya satu kelompok dihitung.","Benda yang datang justru diambil."],help="";
  switch(gameId){
    case "gabungkan": prompt=`Susun ${a} benda awal dan ${b} benda datang.`;concrete=`Ambil ${a} sendok dan ${b} sendok lagi. Gabungkan; sentuh setiap sendok satu kali.`;bridge="Setiap lingkaran mewakili satu sendok. Dua kelompok menjadi satu jumlah, tanpa benda hilang.";reason="Kedua kelompok digabung dan setiap benda dihitung sekali.";help=`Mulai dari ${a}, lalu hitung maju ${b} kali.`;break;
    case "ambil":mode="transfer";initial=[a+b,0];target=[a,b];labels=["Masih ada","Diambil"];expected=a;prompt=`Mulai dengan ${a+b} benda; pindahkan ${b} ke bagian diambil.`;concrete=`Letakkan ${a+b} sendok. Pindahkan ${b} dari meja; hitung sendok yang masih di meja.`;bridge="Gambar diambil berasal dari kelompok awal; bukan benda tambahan. Jumlah di dua tempat tetap sama.";abstractPrompt="Berapa benda yang tersisa?";equation=`${a+b} − ${b}`;reason="Yang diambil tidak dihitung sebagai sisa.";wrong=["Jumlahkan awal dengan benda diambil.","Semua benda awal masih tersisa."];help="Pisahkan benda diambil dari benda yang masih ada.";break;
    case "tukar":mode="exchange";initial=[a,10+b];target=[a+1,b];labels=["Puluhan","Satuan"];expected=10*a+10+b;prompt=`Tukar ${a} puluhan dan ${10+b} satuan hingga satuan kurang dari 10.`;concrete=`Buat ${a} ikatan berisi 10 sedotan dan ${10+b} sedotan lepas. Ikat 10 sedotan lepas menjadi satu puluhan baru.`;bridge="Satu batang pada gambar berisi 10 kotak satuan. Mengikat atau membuka ikatan tidak mengubah nilai total.";abstractPrompt="Berapa nilai semua sedotan?";equation=`${a+1} × 10 + ${b}`;reason="Sepuluh satuan dapat ditukar dengan satu puluhan; nilai tetap.";wrong=["Satu puluhan hanya bernilai satu.","Pertukaran menambah sepuluh benda baru."];help="Cari 10 satuan lepas yang dapat dijadikan satu puluhan.";break;
    case "ukur":mode="select";target=Array(a+b).fill(1);initial=target.map(()=>0);labels=["Unit panjang"];columns=a+b;expected=a+b;prompt=`Tutupi pita dengan ${a+b} unit, tiap unit 1 cm, tanpa celah.`;concrete=`Potong kertas menjadi unit sama panjang 1 cm. Susun ${a+b} unit ujung ke ujung tanpa celah.`;bridge="Satu kotak adalah panjang 1 cm; batas kotak bukan unit tambahan.";abstractPrompt="Berapa panjang pita dalam cm?";equation=`${a+b} × 1`;reason="Unit sama panjang tersusun tanpa celah atau tumpang tindih.";wrong=["Hitung garis batas, bukan unitnya.","Unit boleh berlainan panjang."];help="Isi setiap tempat unit; jangan hitung garis batas.";break;
    case "kelompok":target=Array(a).fill(b);initial=target.map(()=>0);labels=target.map((_,i)=>`Kelompok ${i+1}`);expected=a*b;prompt=`Buat ${a} kelompok, masing-masing ${b} benda.`;concrete=`Sediakan ${a} piring, masing-masing isi ${b} kancing besar bersama pendamping.`;bridge="Satu bingkai menggambarkan satu piring. Isi setiap bingkai sama besar.";equation=`${a} × ${b}`;reason="Isi satu kelompok dijumlahkan sebanyak jumlah kelompok.";wrong=["Jumlah kelompok ditambah isi satu kelompok.","Cukup hitung satu kelompok."];help=`Hitung ${b} berulang sebanyak ${a} kelompok.`;break;
    case "bagi":mode="transfer";initial=[a*b,...Array(a).fill(0)];target=[0,...Array(a).fill(b)];labels=["Belum dibagi",...Array.from({length:a},(_,i)=>`Wadah ${i+1}`)];expected=b;prompt=`Bagikan ${a*b} benda ke ${a} wadah sama rata, tanpa sisa.`;concrete=`Bagikan ${a*b} kancing besar ke ${a} wadah, satu per wadah setiap putaran. Gunakan bersama pendamping.`;bridge="Lingkaran yang berpindah tetap benda yang sama. Wadah yang adil memiliki jumlah sama dan persediaan habis.";abstractPrompt="Berapa isi setiap wadah?";equation=`${a*b} ÷ ${a}`;reason="Seluruh benda dibagi sama banyak, tanpa sisa.";wrong=["Setiap wadah menerima semua benda.","Kurangi total dengan banyak wadah."];help="Bagikan satu per wadah, ulangi hingga persediaan habis.";break;
    case "bagian":case "senilai":case "desimal":mode="select";columns=gameId==="desimal"?10:gameId==="senilai"?8:4;expected=gameId==="desimal"?n/10:gameId==="senilai"?(n-2)*2:n-2;target=Array.from({length:columns},(_,i)=>i<(gameId==="desimal"?n:gameId==="senilai"?(n-2)*2:n-2)?1:0);initial=target.map(()=>0);labels=["Satu utuh"];prompt=gameId==="senilai"?`Pilih bagian pada pita perdelapan yang senilai dengan ${n-2}/4.`:`Pilih ${gameId==="desimal"?n:n-2} bagian dari ${columns} bagian sama besar.`;concrete=gameId==="senilai"?`Ambil dua pita sama panjang. Lipat pertama menjadi 4, kedua menjadi 8 bagian sama besar. Tandai ${n-2} perempat; cocokkan panjang terpilih pada pita kedua.`:`Lipat satu pita kertas menjadi ${columns} bagian sama besar, lalu tandai ${gameId==="desimal"?n:n-2} bagian.`;bridge="Satu pita tetap satu utuh. Kotak-kotak sama besar; tanda garis menunjukkan bagian dipilih, bukan utuh baru.";abstractPrompt=gameId==="desimal"?`Tuliskan ${n}/10 sebagai desimal.`:gameId==="senilai"?`${n-2}/4 = …/8. Berapa pembilangnya?`:"…/4. Berapa pembilangnya?";equation=gameId==="desimal"?`${n}/10`:gameId==="senilai"?`${n-2}/4 = ${expected}/8`:`${expected}/4`;reason=gameId==="senilai"?"Ukuran utuh sama; setiap perempat menjadi dua perdelapan.":gameId==="desimal"?"Satu bagian dari sepuluh sama besar bernilai 0,1.":"Pembilang menghitung bagian dipilih; penyebut semua bagian sama besar.";wrong=["Mengganti penyebut saja tidak mengubah nilai pecahan.","Hitung bagian tidak dipilih sebagai pembilang."];help="Bandingkan panjang terpilih dengan panjang satu utuh, bukan hanya banyak kotak.";break;
    case "ubin":mode="select";columns=a;target=Array(a*b).fill(1);initial=target.map(()=>0);labels=["Permukaan"];expected=a*b;prompt=`Isi permukaan ${b} baris, masing-masing ${a} persegi satuan.`;concrete=`Susun potongan kertas persegi sama besar menjadi ${b} baris, ${a} per baris, tanpa celah atau tumpang tindih.`;bridge="Setiap kotak pada gambar mewakili satu persegi satuan yang menutup permukaan, bukan panjang tepi.";abstractPrompt="Berapa luas dalam persegi satuan?";equation=`${b} × ${a}`;reason="Luas menghitung persegi satuan yang menutup seluruh permukaan.";wrong=["Luas sama dengan jumlah panjang tepi.","Hitung hanya satu baris."];help=`Hitung ${a} kotak per baris, dengan ${b} baris.`;break;
    case "lapisan":mode="layers";columns=a;initial=[0];target=[b];labels=["Lapisan"];expected=a*2*b;prompt=`Susun ${b} lapisan. Tiap lapisan ${a} × 2 kubus satuan.`;concrete=`Gunakan kubus mainan sama besar. Buat ${b} lapisan, tiap lapisan ${a} kubus panjang dan 2 kubus lebar.`;bridge="Gambar menampilkan tiap lapisan dari atas. Satu petak adalah satu kubus; lapisan ditumpuk untuk mengisi ruang.";abstractPrompt="Berapa volume dalam kubus satuan?";equation=`${a} × 2 × ${b}`;reason="Banyak kubus satu lapisan dikalikan banyak lapisan.";wrong=["Cukup hitung lapisan pertama.","Jumlahkan panjang, lebar, dan tinggi."];help=`Satu lapisan berisi ${a*2} kubus. Berapa lapisan yang dibutuhkan?`;break;
    case "ratakan":mode="redistribute";initial=[n-2,n,n+2];target=[n,n,n];labels=["Tumpukan A","Tumpukan B","Tumpukan C"];expected=n;prompt=`Ratakan tumpukan ${n-2}, ${n}, ${n+2} tanpa menambah atau membuang benda.`;concrete=`Buat tiga tumpukan berisi ${n-2}, ${n}, ${n+2} sendok. Pindahkan dari tumpukan lebih banyak ke lebih sedikit hingga rata.`;bridge="Panjang baris menunjukkan banyak benda. Total tetap saat benda dipindahkan; rata-rata adalah isi setiap tumpukan setelah diratakan.";abstractPrompt="Berapa rata-rata banyak benda?";equation=`(${n-2} + ${n} + ${n+2}) ÷ 3`;reason="Total semua data dibagi banyak tumpukan; total tetap saat diratakan.";wrong=["Pilih tumpukan paling besar.","Jumlah semua data tanpa membagi."];help="Pindahkan satu benda dari yang paling banyak ke yang paling sedikit.";break;
    case "rasio":target=[a,2*a];labels=["Gelas","Sendok sirup"];expected=2*a;prompt=`Satu gelas memerlukan 2 sendok sirup. Susun resep untuk ${a} gelas.`;concrete=`Gunakan kartu gelas dan kartu sendok, bukan minum sirup. Pasangkan setiap kartu gelas dengan 2 kartu sendok; buat ${a} pasangan kelompok.`;bridge="Simbol lingkaran mewakili kartu, bukan ukuran gelas atau sendok. Setiap gelas selalu berpasangan dengan dua sendok.";abstractPrompt=`Berapa sendok untuk ${a} gelas dengan rasa sama?`;equation=`${a} × 2`;reason="Jumlah gelas dan sendok diperbesar dengan faktor sama.";wrong=["Sendok tetap dua meskipun gelas bertambah.","Tambahkan satu sendok per gelas."];help="Buat pasangan 1 gelas dengan 2 sendok, lalu ulangi.";break;
    case "lintasi-nol":mode="line";initial=[a];target=[-b];labels=["Posisi"];limit=5;expected=-b;prompt=`Mulai di ${a}; mundur ${a+b} langkah, termasuk melewati nol.`;concrete=`Gambar garis −5 sampai 5 pada kertas. Letakkan penanda di ${a}; geser satu ruas per langkah ke kiri sebanyak ${a+b} langkah.`;bridge="Tanda menunjukkan posisi; satu langkah adalah ruas antardua tanda. Nol bukan batas tempat berhenti.";abstractPrompt="Di bilangan berapa penanda berhenti?";equation=`${a} − ${a+b}`;reason="Setiap langkah ke kiri mengurangi satu, termasuk setelah nol.";wrong=["Berhenti mengurangi ketika mencapai nol.","Tanda awal dihitung sebagai satu langkah."];help="Setelah 0, satu langkah ke kiri adalah −1. Hitung ruas, bukan tanda awal.";break;
  }
  const explanation=gameId==="senilai"?`${equation}. Panjang terpilih sama karena setiap perempat dibagi dua.`:gameId==="bagian"?`${equation}: ${expected} bagian dipilih dari empat bagian sama besar.`:`${equation} = ${String(expected).replace(".",",")}. ${reason}`;
  const correctReason=seed%3,reasons=[...wrong];reasons.splice(correctReason,0,reason);
  return {gameId,seed,mode,prompt,concrete,bridge,initial,target,labels,limit,columns,expected,abstractPrompt,equation,reasons,correctReason,hints:[bridge,help,explanation],explanation};
}
export function validState(q:Challenge,state:number[]):boolean {
  if(state.length!==q.initial.length||Array.from(state).some(n=>!Number.isInteger(n)))return false;
  if(q.mode==="line")return state[0]!>=-q.limit&&state[0]!<=q.limit;
  if(state.some(n=>n<0||n>q.limit))return false;
  if(q.mode==="select")return state.every(n=>n===0||n===1);
  if(q.mode==="transfer"||q.mode==="redistribute")return state.reduce((s,n)=>s+n,0)===q.initial.reduce((s,n)=>s+n,0);
  if(q.mode==="exchange")return (state[0]! * 10 + state[1]!) === (q.initial[0]! * 10 + q.initial[1]!);
  if(q.mode==="layers")return state[0]!<=4;
  return true;
}
export function transition(q:Challenge,state:number[],action:Action):number[]{
  if(!validState(q,state))throw new Error("Susunan tidak valid.");
  const next=[...state];
  if(action.type==="change"&&["build","select","layers","line"].includes(q.mode)&&Number.isInteger(action.index)&&next[action.index]!==undefined&&(action.delta===1||action.delta===-1)){next[action.index]!+=action.delta;}
  else if(action.type==="move"&&["transfer","redistribute"].includes(q.mode)&&action.from!==action.to&&next[action.from]!==undefined&&next[action.to]!==undefined&&Number.isInteger(action.from)&&Number.isInteger(action.to)){next[action.from]!--;next[action.to]!++;}
  else if(action.type==="exchange"&&q.mode==="exchange"){next[0]!+=action.split?-1:1;next[1]!+=action.split?10:-10;}
  else return state;
  return validState(q,next)?next:state;
}
export function constructionCorrect(q:Challenge,state:number[]):boolean {
  if(!validState(q,state))return false;
  if(q.mode==="select"&&["bagian","senilai","desimal"].includes(q.gameId))return state.reduce((s,n)=>s+n,0)===q.target.reduce((s,n)=>s+n,0);
  return state.every((n,i)=>n===q.target[i]);
}
export function evaluateChallenge(q:Challenge,state:number[],answer:string,reason:number){
  const value=parseAnswer(answer),answerCorrect=value!==null&&Math.abs(value-q.expected)<1e-9,reasonCorrect=reason===q.correctReason;
  return {constructionCorrect:constructionCorrect(q,state),answerCorrect,reasonCorrect,feedback:answerCorrect&&reasonCorrect?`Ya. ${q.explanation}`:answerCorrect?"Angkanya tepat. Periksa lagi alasan yang menghubungkan gambar dan simbol.":"Belum tepat. Buka kembali benda atau gambar dan periksa arti bilangannya."};
}

import {generateQuestion, type Question} from '../curriculum/engine';

export const themes = [
  {id:'mobil', name:'Mobil', concrete:'mobil mainan atau kartu bergambar mobil', unit:4},
  {id:'motor', name:'Motor', concrete:'motor mainan atau kartu bergambar motor', unit:2},
  {id:'mangga', name:'Mangga', concrete:'mangga atau kartu bergambar mangga', unit:4},
  {id:'stroberi', name:'Stroberi', concrete:'stroberi atau kartu bergambar stroberi', unit:4},
  {id:'semangka', name:'Semangka', concrete:'kartu bergambar semangka', unit:4},
] as const;
export type ThemeId = typeof themes[number]['id'];
export const concepts = [
  {id:'menghitung', grade:1, name:'Menghitung satu per satu'},
  {id:'menjumlah', grade:1, name:'Menggabungkan dua kelompok'},
  {id:'mengurangi', grade:1, name:'Mengambil dari kelompok awal'},
  {id:'membandingkan', grade:1, name:'Membandingkan banyaknya'},
  {id:'nilai-tempat', grade:2, name:'Puluhan dan satuan'},
  {id:'perkalian', grade:3, name:'Kelompok sama besar'},
  {id:'pembagian', grade:3, name:'Membagi sama banyak'},
  {id:'pecahan', grade:3, name:'Bagian dari satu utuh'},
  {id:'pecahan-senilai', grade:4, name:'Pecahan senilai'},
  {id:'desimal', grade:5, name:'Pecahan dan desimal'},
  {id:'rata-rata', grade:5, name:'Meratakan banyaknya'},
  {id:'perbandingan', grade:6, name:'Hubungan perbandingan'},
] as const;
export type ConceptId = typeof concepts[number]['id'];
export interface Example {id:string; theme:ThemeId; concept:ConceptId; grade:number; title:string}
export const examples: Example[] = concepts.flatMap(c => themes.map(t => ({id:`${t.id}-${c.id}`,theme:t.id,concept:c.id,grade:c.grade,title:`${c.name}: ${t.name.toLowerCase()}`})));
export function getExample(id:string):Example {
  const found=examples.find(e=>e.id===id); if (!found) throw new Error('Contoh tidak tersedia.'); return found;
}
export interface Panel {label:string; count:number; removed?:number; denominator?:number; icon?:'basket'|'wheel'}
export interface VisualQuestion {question:Question; panels:Panel[]; concrete:string; bridge:string; steps:string[]; transfer:string; divisionGroups?:number}
const lower = (theme:ThemeId) => themes.find(t=>t.id===theme)!.name.toLowerCase();
export function generateVisualQuestion(example:Example, seed:number):VisualQuestion {
  // Reuse the curriculum mathematics, not a second evaluator or mastery system.
  const entry=getExample(example.id); const theme=themes.find(t=>t.id===entry.theme)!;
  const q=generateQuestion(entry.concept,seed); const [a=0,b=0,c=0]=q.model.values;
  const noun=lower(entry.theme); let panels:Panel[]=[];
  let concrete=`Siapkan ${theme.concrete}. Tunjuk setiap benda satu kali; gambar di layar mewakili benda itu.`;
  let bridge='Satu gambar mewakili satu benda. Tanda centang hanya membantu menandai yang sudah dihitung; banyaknya tidak berubah.';
  let first='Amati kelompok dan bilangan yang diketahui.'; let second=q.hints[1]!;
  let transfer=`Coba konsep yang sama dengan tutup botol atau kartu. Jelaskan mengapa caranya tetap sama.`;
  let divisionGroups:number|undefined;
  switch(entry.concept) {
    case 'menghitung': panels=[{label:'Kelompok',count:a}]; q.prompt=`Berapa banyak ${noun} dalam gambar?`; first='Mulai dari satu benda, bukan dari nama kelompok.'; second='Tunjuk setiap gambar satu kali. Bilangan terakhir menunjukkan banyaknya.'; break;
    case 'menjumlah': panels=[{label:'Awal',count:a},{label:'Datang',count:b}]; q.prompt=`Ada ${a} ${noun}, lalu datang ${b} lagi. Berapa semuanya?`; concrete=`Letakkan ${a} ${theme.concrete}, lalu tambahkan ${b} lagi tanpa mengambil benda awal.`; first=`Pertahankan ${a} benda awal.`; second=`Hitung lanjut ${b} kali dari ${a}, atau gabungkan kedua kelompok.`; break;
    case 'mengurangi': panels=[{label:'Awal; yang diambil dicoret',count:a,removed:b}]; q.prompt=`Ada ${a} ${noun}. ${b} diambil. Berapa yang tersisa?`; concrete=`Siapkan ${a} ${theme.concrete}. Pindahkan ${b} ke tempat terpisah; hitung yang masih di tempat awal.`; bridge=`Coretan menunjukkan ${b} benda diambil dari ${a} benda awal, bukan kelompok tambahan.`; first=`Mulai dengan ${a}, bukan ${a+b}.`; second=`Abaikan ${b} gambar yang dicoret saat menghitung sisa.`; break;
    case 'membandingkan': panels=[{label:'Pertama',count:a},{label:'Kedua',count:b}]; q.prompt=`Kelompok kedua memiliki berapa ${noun} lebih banyak daripada kelompok pertama?`; concrete='Buat dua baris kartu. Pasangkan satu kartu pertama dengan satu kartu kedua.'; first=`Pasangkan ${a} dengan ${a} dari kelompok kedua.`; second='Hitung hanya gambar yang tidak mendapat pasangan.'; break;
    case 'nilai-tempat': panels=[...Array.from({length:a},(_,i)=>({label:`Puluhan ${i+1}`,count:10})),{label:'Satuan lepas',count:b}]; q.prompt=`Ada ${a} kelompok berisi 10 ${noun} dan ${b} ${noun} lepas. Berapa semuanya?`; concrete='Kumpulkan kartu dalam ikatan berisi tepat sepuluh. Sisakan kartu lepas; jangan hitung satu ikatan sebagai satu benda.'; first=`${a} puluhan = ${a} × 10 = ${a*10}.`; second=`Tambahkan ${b} satuan lepas: ${a*10} + ${b}.`; break;
    case 'perkalian': panels=Array.from({length:a},(_,i)=>({label:`Kelompok ${i+1}`,count:b})); q.prompt=`Ada ${a} kelompok ${noun}. Tiap kelompok berisi ${b}. Berapa semuanya?`; concrete=`Susun ${a} kelompok kartu dengan ${b} kartu di setiap kelompok.`; first=`Pastikan semua ${a} kelompok berisi ${b} benda.`; second=`Jumlahkan ${Array(a).fill(b).join(' + ')}; ini sama dengan ${a} × ${b}.`; break;
    case 'pembagian': divisionGroups=a/q.expected; panels=Array.from({length:divisionGroups},(_,i)=>({label:`Kelompok ${i+1}`,count:q.expected})); q.prompt=`Bagikan ${a} ${noun} sama banyak ke ${divisionGroups} kelompok. Berapa isi setiap kelompok?`; concrete=`Bagikan ${a} kartu bergambar ${noun} satu per satu, bergiliran ke ${divisionGroups} tempat. Jangan menambah atau membuang kartu.`; first=`Jumlah awal ${a}; ada ${divisionGroups} kelompok.`; second='Bagikan bergiliran sampai tidak ada yang tersisa. Bandingkan isi setiap kelompok.'; break;
    case 'pecahan': case 'pecahan-senilai': case 'desimal': {
      panels=[{label:'Satu utuh',count:a,denominator:b}];
      if(entry.concept==='pecahan-senilai') panels.push({label:'Utuh yang sama, bagian lebih kecil',count:a*2,denominator:b*2});
      const whole=entry.theme==='semangka'?'satu penampang semangka':'satu papan bergambar '+noun;
      bridge=`Seluruh bidang mewakili ${whole}. Garis membaginya menjadi bagian sama besar; arsiran dan tanda / menandai bagian dipilih. Bukan ${b} benda utuh.`;
      concrete=`Gambar ${whole} di kertas. Bagi bidang menjadi ${b} bagian sama besar dan arsir ${a} bagian. Gunakan kertas; tidak perlu pisau atau memotong benda nyata.`;
      first=`Satu utuh dibagi menjadi ${b} bagian sama besar; ${a} dipilih.`;
      second=entry.concept==='pecahan-senilai'?`Bagi setiap bagian menjadi dua: ${a}/${b} = ${a*2}/${b*2}. Luas yang dipilih tetap sama.`:entry.concept==='desimal'?`${a} persepuluh = ${a}/10. Tulis sebagai ${String(a/10).replace('.',',')}.`:`Pembilang menghitung bagian dipilih (${a}), penyebut menghitung seluruh bagian (${b}).`;
      q.prompt=entry.concept==='pecahan-senilai'?`Isi pecahan yang menunjukkan luas sama: ${a}/${b} = …/${b*2}.`:entry.concept==='desimal'?`Tulis bagian berarsir sebagai desimal (boleh memakai koma).`:`Bagian berarsir ditulis …/${b}. Berapa pembilangnya?`;
      transfer='Gambar utuh berukuran sama di kertas lain. Apakah pecahan berubah jika warna arsiran diganti? Jelaskan.';
      break;
    }
    case 'rata-rata': panels=q.model.values.map((n,i)=>({label:`Hari ${i+1}`,count:n})); q.prompt=`Jumlah ${noun} dalam tiga hari adalah ${q.model.values.join(', ')}. Jika diratakan, berapa untuk setiap hari?`; concrete=`Gunakan kartu untuk tiga jumlah ini: ${q.model.values.join(', ')}. Pindahkan kartu antarhari sampai sama banyak; total tidak boleh berubah.`; first=`Jumlahkan semua data: ${q.model.values.join(' + ')} = ${q.model.values.reduce((x,y)=>x+y,0)}.`; second='Bagi total dengan banyak hari (3), bukan dengan nilai paling besar.'; break;
    case 'perbandingan': {
      // Curriculum's third model value is the target quantity, not its scale factor.
      const vehicles=entry.theme==='mobil'||entry.theme==='motor'; const units=theme.unit; const target=c;
      panels=vehicles?[{label:`Acuan: 1 ${noun}`,count:1},{label:`Roda pada 1 ${noun}`,count:units,icon:'wheel'},{label:`Ditanyakan: ${target} ${noun}`,count:target}]:[{label:'Acuan: 1 keranjang',count:1,icon:'basket'},{label:`Isi 1 keranjang`,count:units},{label:`Ditanyakan: ${target} keranjang, masing-masing ${units} buah`,count:target,icon:'basket'}];
      q.expected=target*units; q.prompt=vehicles?`Setiap ${noun} memiliki ${units} roda. Berapa roda pada ${target} ${noun}?`:`Setiap keranjang berisi ${units} ${noun}. Berapa buah dalam ${target} keranjang?`;
      first=`Acuan: 1 ${vehicles?noun:'keranjang'} berpasangan dengan ${units} ${vehicles?'roda':'buah'}.`; second=`Jumlah ${vehicles?noun:'keranjang'} menjadi ${target} kali; jumlah ${vehicles?'roda':'buah'} juga menjadi ${target} kali.`;
      q.explanation=`${target} × ${units} = ${q.expected}. Kedua banyaknya berubah dengan faktor yang sama.`;
      q.reasons=['Kalikan kedua banyaknya dengan faktor yang sama.','Tambahkan jumlah kelompok dengan isi satu kelompok.','Hitung hanya isi satu kelompok.']; q.correctReason=0;
      q.model={kind:'groups',values:[target,units],labels:['Acuan per kelompok'],summary:q.prompt}; q.hints=[first,second,q.explanation];
      concrete=vehicles?`Gunakan kartu ${noun}, bukan kendaraan di jalan. Pasangkan setiap kartu dengan ${units} kartu roda.`:`Susun kartu keranjang. Letakkan ${units} kartu ${noun} pada setiap keranjang.`;
      bridge=vehicles?'Mobil digambar dari atas sehingga empat roda terlihat. Motor memiliki dua roda. Roda lepas di kelompok acuan menunjukkan hubungan, bukan tambahan kendaraan.':`Satu gambar keranjang mewakili wadah berisi ${units} buah. Keranjang bukan satu buah.`;
      break;
    }
  }
  return {question:q,panels,concrete,bridge,steps:[first,second,q.explanation],transfer,divisionGroups};
}
export function workedExample(example:Example) {return generateVisualQuestion(example,17);}
export function exercise(example:Example, round:number) {
  if(!Number.isInteger(round)||round<0||round>9999) throw new Error('Nomor latihan tidak valid.');
  const signature=(v:VisualQuestion)=>JSON.stringify([v.question.model.values,v.question.expected,v.panels]);
  const excluded=signature(workedExample(example)), seen=new Set<string>(), bank:VisualQuestion[]=[];
  for(let i=0;i<128;i++) {const q=generateVisualQuestion(example,501+i*37); const key=signature(q); if(key!==excluded&&!seen.has(key)){seen.add(key);bank.push(q);}}
  if(!bank.length) throw new Error('Variasi latihan tidak tersedia.');
  return bank[round%bank.length]!;
}
export function allocate(total:number, groups:number, dealt:number):number[] {
  if(!Number.isInteger(total)||total<1||total>60||!Number.isInteger(groups)||groups<1||groups>6||total%groups!==0||!Number.isInteger(dealt)||dealt<0||dealt>total) throw new Error('Pembagian tidak valid.');
  return Array.from({length:groups},(_,i)=>Math.floor(dealt/groups)+(i<dealt%groups?1:0));
}
export interface ExampleAttempt {exampleId:string;seed:number;round:number;ordinal:number;answer:string;reason:number;answerCorrect:boolean;reasonCorrect:boolean;hintLevel:number;workedViewed:boolean;pictureVisible:boolean;marked:number;dealt:number|null}

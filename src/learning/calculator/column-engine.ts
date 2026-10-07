import {calculate,operations,type Calculation,type Operation,type Step} from './engine';

// Objective: connect written algorithms to preserved place value and regrouping.
// Worked support only; snapshots do not evaluate or infer independent mastery.
export const places=[
  {name:'satuan',short:'S'}, {name:'puluhan',short:'P'}, {name:'ratusan',short:'R'},
  {name:'ribuan',short:'Rb'}, {name:'puluh ribuan',short:'PR'},
  {name:'ratus ribuan',short:'RR'}, {name:'jutaan',short:'Jt'},
] as const;
export interface ColumnRow {label:string;cells:string[];sign?:string;kind:'operand'|'carry'|'regrouped'|'partial'|'result';rule?:boolean;crossed?:number[]}
export interface ColumnStep extends Step {rows:ColumnRow[];activeColumn?:number}
export interface ColumnCalculation {
  operation:Operation;first:number;second:number;width:number;steps:ColumnStep[];
  result:number;remainder?:number;check:string;legend:string;
}
export type ColumnResult={ok:true;calculation:Calculation;column:ColumnCalculation}|{ok:false;field:'first'|'second'|'operation';message:string};
export function columnNumberError(raw:string,operation:Operation,field:'first'|'second'):string|null {
  if(!raw.trim())return 'Isi bilangan terlebih dahulu.';
  if(raw.length>16||!/^\d{1,4}$/.test(raw.trim()))return 'Bersusun memakai bilangan bulat 0–9999 tanpa pemisah ribuan. Untuk desimal atau negatif, pilih Cara biasa.';
  const max=field==='second'&&operation==='multiply'?999:field==='second'&&operation==='divide'?99:9999;
  if(Number(raw)>max)return operation==='multiply'?'Pengali maksimal 999 agar langkah bersusun tetap terbaca. Gunakan Cara biasa untuk bilangan lebih besar.':'Pembagi maksimal 99 agar langkah bersusun tetap terbaca. Gunakan Cara biasa untuk bilangan lebih besar.';
  return null;
}
const name=(index:number)=>places[index]!.name;
const digits=(value:number)=>[...String(value)].reverse().map(Number);
const cells=(value:number,width:number)=>Array.from({length:width},(_,i)=>String(value).padStart(width,' ')[i]!);
const fromLittle=(values:(number|string)[],width:number)=>Array.from({length:width},(_,i)=>String(values[width-1-i]??''));
const numericRow=(label:string,value:number,width:number,kind:ColumnRow['kind']='operand',sign?:string):ColumnRow=>({label,cells:cells(value,width),kind,sign});
const snapshot=(title:string,equation:string,explanation:string,rows:ColumnRow[],activeColumn?:number):ColumnStep=>({title,equation,explanation,rows:rows.map(r=>({...r,cells:[...r.cells],crossed:r.crossed?[...r.crossed]:undefined})),activeColumn});

export function calculateColumn(firstRaw:string,operation:string,secondRaw:string):ColumnResult {
  if(!Object.hasOwn(operations,operation))return {ok:false,field:'operation',message:'Pilih tambah, kurang, kali, atau bagi.'};
  const op=operation as Operation;
  for(const [field,raw] of [['first',firstRaw],['second',secondRaw]] as const){const message=columnNumberError(raw,op,field);if(message)return {ok:false,field,message};}
  const common=calculate(firstRaw,op,secondRaw);if(!common.ok)return common;
  const a=Number(firstRaw),b=Number(secondRaw);
  if(op==='subtract'&&a<b)return {ok:false,field:'second',message:'Untuk pengurangan bersusun ini, bilangan awal harus lebih besar atau sama. Pilih Cara biasa untuk memahami hasil negatif.'};
  const result=op==='add'?a+b:op==='subtract'?a-b:op==='multiply'?a*b:Math.floor(a/b);
  const remainder=op==='divide'?a%b:undefined;
  const width=Math.max(String(a).length,String(b).length,String(result).length);
  const steps:ColumnStep[]=[];
  const rows:ColumnRow[]=[numericRow('Bilangan pertama',a,width),numericRow('Bilangan kedua',b,width,'operand',operations[op].symbol)];
  let legend='Setiap digit berada pada kolom nilai tempatnya. Angka kecil di atas berasal dari pertukaran, bukan bilangan tambahan.';
  const expression=`${a} ${operations[op].symbol} ${b}`;
  let check=common.calculation.check;
  if(op==='add') {
    const left=digits(a),right=digits(b),carry:number[]=Array(width).fill(0),written:(number|string)[]=Array(width).fill('');
    const draw=()=>[{label:'Dari pertukaran kolom sebelumnya',cells:fromLittle(carry.map(n=>n||''),width),kind:'carry' as const},...rows,{label:'Jumlah',cells:fromLittle(written,width),kind:'result' as const,rule:true}];
    steps.push(snapshot('Sejajarkan nilai tempat',expression,'Satuan di bawah satuan, puluhan di bawah puluhan. Mulai menjumlah dari kanan.',draw()));
    for(let i=0;i<width;i++) {
      const l=left[i]??0,r=right[i]??0,incoming=carry[i]!,total=l+r+incoming,outgoing=Math.floor(total/10);
      written[i]=total%10;if(outgoing)carry[i+1]=outgoing;
      const explanation=`${incoming?`Tambahkan ${incoming} ${name(i)} dari pertukaran sebelumnya. `:''}${outgoing?`${total} ${name(i)} ditukar menjadi ${outgoing} ${name(i+1)} dan ${total%10} ${name(i)}. Tulis ${total%10}; letakkan ${outgoing} di kolom ${name(i+1)}.`:`Tulis ${total} pada kolom ${name(i)}.`}`;
      steps.push(snapshot(`Jumlahkan ${name(i)}`,`${l} + ${r}${incoming?` + ${incoming}`:''} = ${total}`,explanation,draw(),width-1-i));
    }
  } else if(op==='subtract') {
    const original=digits(a),working=[...original],right=digits(b),written:(number|string)[]=Array(width).fill('');
    const draw=()=>[
      {...rows[0]!,crossed:Array.from({length:width},(_,i)=>i).filter(i=>(working[width-1-i]??0)!==(original[width-1-i]??0))},
      {label:'Bilangan awal setelah pertukaran; nilainya tetap',cells:fromLittle(working,width),kind:'regrouped' as const},rows[1]!,
      {label:'Selisih',cells:fromLittle(written,width),kind:'result' as const,rule:true},
    ];
    legend='Digit dicoret jika bentuknya berubah karena pertukaran. Baris setelah pertukaran bernilai sama dengan bilangan awal. “Meminjam” di sini berarti menukar satu kelompok ke sepuluh kelompok tempat berikutnya.';
    steps.push(snapshot('Sejajarkan nilai tempat',expression,'Kurangi dari kanan. Jangan menukar urutan digit hanya karena digit bawah lebih besar.',draw()));
    for(let i=0;i<width;i++) {
      if((working[i]??0)<(right[i]??0)) {
        let lender=i+1;while((working[lender]??0)===0)lender++;
        // a >= b ensures a lender exists. Each adjacent transfer preserves the value.
        for(let j=lender;j>i;j--) {
          working[j]=working[j]!-1;working[j-1]=(working[j-1]??0)+10;
          steps.push(snapshot(`Tukar 1 ${name(j)}`,`1 ${name(j)} = 10 ${name(j-1)}`,`Kurangi satu kelompok ${name(j)}, lalu tambahkan sepuluh kelompok ${name(j-1)}. Nilai bilangan tetap ${a}; ini pertukaran, bukan menambah ${a}.`,draw(),width-j));
        }
      }
      const l=working[i]??0,r=right[i]??0;written[i]=l-r;
      steps.push(snapshot(`Kurangi ${name(i)}`,`${l} − ${r} = ${l-r}`,`Tulis ${l-r} pada kolom ${name(i)}. Gunakan digit setelah pertukaran jika kolom ini berubah.`,draw(),width-1-i));
    }
  } else if(op==='multiply') {
    const left=digits(a),right=digits(b),partials:ColumnRow[]=[],partialValues:number[]=[];
    steps.push(snapshot('Sejajarkan dan lihat pengali',expression,'Kalikan dari digit paling kanan. Setiap baris hasil bagian membawa nilai tempat digit pengali, lalu semua baris dijumlahkan.',rows));
    for(let i=0;i<right.length;i++) {
      const digit=right[i]!,placeValue=digit*10**i,carry:number[]=Array(width).fill(0),written:(number|string)[]=Array(width).fill('');
      for(let z=0;z<i;z++)written[z]=0;
      const row:ColumnRow={label:`Hasil bagian dari ${digit} ${name(i)}`,cells:fromLittle(written,width),kind:'partial',sign:i>0?'+':undefined};
      partials.push(row);partialValues.push(a*placeValue);
      const draw=()=>[{label:'Dari pertukaran pada baris perkalian ini',cells:fromLittle(carry.map(n=>n||''),width),kind:'carry' as const},...rows,...partials];
      steps.push(snapshot(`Kalikan dengan ${digit} ${name(i)}`,`${a} × ${placeValue}`,`${digit} pada pengali bernilai ${placeValue}. ${i>0?`Baris dimulai di kolom ${name(i)}; ${i} kolom di kanan diisi nol agar nilai tempatnya tetap.`:'Mulai di kolom satuan.'}`,draw(),width-1-i));
      for(let j=0;j<left.length;j++) {
        const incoming=carry[i+j]??0,total=left[j]!*digit+incoming,outgoing=Math.floor(total/10);
        written[i+j]=total%10;if(outgoing)carry[i+j+1]=outgoing;row.cells=fromLittle(written,width);
        steps.push(snapshot(`Perkalian kolom ${name(i+j)}`,`${left[j]} × ${digit}${incoming?` + ${incoming}`:''} = ${total}`,`${total} ${name(i+j)} ${outgoing?`= ${outgoing} ${name(i+j+1)} dan ${total%10} ${name(i+j)}. Tulis ${total%10}; teruskan ${outgoing} ke kolom berikutnya.`:`ditulis ${total} di kolom ${name(i+j)}.`}`,draw(),width-1-i-j));
      }
      const finalCarry=carry[i+left.length]??0;
      if(finalCarry){written[i+left.length]=finalCarry;row.cells=fromLittle(written,width);steps.push(snapshot('Tuliskan pertukaran terakhir',String(finalCarry),`Tulis ${finalCarry} di kolom ${name(i+left.length)}. Baris ini mewakili ${a} × ${placeValue} = ${a*placeValue}.`,draw(),width-1-i-left.length));}
      // Strip unused leading zeros from the finished number, preserving place-value zeros.
      row.cells=cells(a*placeValue,width);
    }
    const carry:number[]=Array(width).fill(0),written:(number|string)[]=Array(width).fill('');
    const draw=()=>[{label:'Pertukaran ketika menjumlahkan hasil bagian',cells:fromLittle(carry.map(n=>n||''),width),kind:'carry' as const},...partials,{label:'Hasil perkalian',cells:fromLittle(written,width),kind:'result' as const,rule:true}];
    for(let i=0;i<width;i++) {
      const parts=partialValues.map(n=>Math.floor(n/10**i)%10),incoming=carry[i]!,total=parts.reduce((x,y)=>x+y,0)+incoming;
      written[i]=total%10;const outgoing=Math.floor(total/10);if(outgoing)carry[i+1]=outgoing;
      steps.push(snapshot(`Jumlahkan hasil bagian: ${name(i)}`,`${parts.join(' + ')}${incoming?` + ${incoming}`:''} = ${total}`,`${outgoing?`Tulis ${total%10} dan teruskan ${outgoing} ke kolom berikutnya.`:`Tulis ${total} di kolom ini.`} Nol pada ujung kanan hasil bagian menjaga nilai tempat; bukan hiasan.`,draw(),width-1-i));
    }
  } else {
    const dividend=String(a),quotientCells=Array(width).fill('') as string[],work:ColumnRow[]=[];
    const draw=()=>[{label:'Hasil bagi di atas bilangan yang dibagi',cells:[...quotientCells],kind:'result' as const}, {...numericRow('Bilangan yang dibagi',a,width),rule:true},...work];
    legend='Pembagi berada di sebelah kiri. Digit hasil bagi berada tepat di atas digit yang sedang dibaca. Bagi → kalikan → kurangi → turunkan; nol di tengah hasil tetap ditulis.';
    steps.push(snapshot('Mulai membaca dari kiri',expression,'Cari berapa kali pembagi muat dalam bagian bilangan yang sedang dibaca. Sisa harus lebih kecil daripada pembagi.',draw()));
    let running=0,started=false;
    for(let i=0;i<dividend.length;i++) {
      const before=running,available=before*10+Number(dividend[i]),digit=Math.floor(available/b);running=available%b;
      if(!started&&!digit&&i<dividend.length-1)continue;
      started=true;const column=width-dividend.length+i;
      quotientCells[column]=String(digit);
      const at=(n:number)=>[...Array(column+1-String(n).length).fill(''),...String(n),...Array(width-column-1).fill('')];
      if(work.length)work.push({label:`Turunkan digit ${dividend[i]}: bagian sekarang ${available}`,cells:at(available),kind:'partial'});
      steps.push(snapshot(`Bagi bagian ${available}`,`${available} ÷ ${b}: ${digit} kali`,`${i>0?`Baca sampai digit ${dividend[i]}. ${before>0?`Sisa ${before} menjadi ${before*10} pada nilai tempat berikutnya, lalu digit ini diturunkan. `:''}`:''}Tulis ${digit} pada hasil bagi${digit===0?'; nol ini menjaga posisi digit berikutnya':''}.`,draw(),column));
      work.push({label:`Kalikan ${b} dengan ${digit}`,cells:at(b*digit),kind:'partial',sign:'−'});
      work.push({label:`Sisa setelah pengurangan: ${running}`,cells:at(running),kind:'partial',rule:true});
      steps.push(snapshot('Kalikan, lalu kurangi',`${available} − ${b} × ${digit} = ${running}`,`Ambil ${b*digit} dari ${available}; sisanya ${running}. ${i<dividend.length-1?'Selanjutnya turunkan satu digit berikutnya.':'Tidak ada digit bilangan awal yang tersisa.'}`,draw(),column));
    }
    check=`${b} × ${result} + ${remainder} = ${a}. Pembagi × hasil bagi + sisa mengembalikan bilangan awal; ${remainder} < ${b}.`;
    steps.push(snapshot('Nyatakan hasil bagi dan sisa',`${a} = ${b} × ${result} + ${remainder}`,`Hasil bagi ${result}, sisa ${remainder}. ${remainder?`Sisa tidak dibuang: hasil penuh adalah ${result} + ${remainder}/${b}. Pilih Cara biasa untuk hasil penuh sebagai desimal atau pecahan.`:'Pembagian habis karena sisanya nol.'}`,draw()));
  }
  if(op!=='divide')steps.push(snapshot('Periksa hasil akhir',`${expression} = ${result}`,'Baca hasil dari kiri ke kanan. Periksa kembali dengan operasi kebalikan.',steps.at(-1)!.rows.map(r=>r.kind==='result'?{...r,cells:cells(result,width)}:r)));
  return {ok:true,calculation:common.calculation,column:{operation:op,first:a,second:b,width,steps,result,remainder,check,legend}};
}

export const columnExamples:[string,Operation,string][]=[['368','add','257'],['1000','subtract','278'],['123','multiply','24'],['144','divide','12'],['1005','divide','5'],['17','divide','4']];

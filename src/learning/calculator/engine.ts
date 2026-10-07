/** Worked examples, not assessment: no mastery, attempt or account writes.
 * Exact rational arithmetic avoids floating-point artifacts (0.1 + 0.2).
 * Input is two bounded decimal numbers, never an executable expression. */
export const operations = {
  add: {label: "Tambah (+)", symbol: "+", lesson: "menjumlah"},
  subtract: {label: "Kurang (−)", symbol: "−", lesson: "mengurangi"},
  multiply: {label: "Kali (×)", symbol: "×", lesson: "perkalian"},
  divide: {label: "Bagi (÷)", symbol: "÷", lesson: "pembagian"},
} as const;
export type Operation = keyof typeof operations;
type Fraction = {n: bigint; d: bigint};
type Parsed = {value: Fraction; places: number};
export type Step = {title: string; equation: string; explanation: string};
export interface Calculation {
  expression: string;
  exact: string;
  approximation?: string;
  fraction: {numerator: string; denominator: string};
  steps: Step[];
  check: string;
  lesson: string;
}
export type CalculationResult = {ok: true; calculation: Calculation}
  | {ok: false; field: "first" | "second" | "operation"; message: string};

const abs = (n: bigint) => n < 0n ? -n : n;
function fraction(n: bigint, d = 1n): Fraction {
  if (d === 0n) throw new Error("Zero denominator");
  if (d < 0n) {n = -n; d = -d;}
  let a = abs(n), b = d;
  while (b) [a, b] = [b, a % b];
  return {n: n / a, d: d / a};
}
const sum = (a: Fraction, b: Fraction) => fraction(a.n * b.d + b.n * a.d, a.d * b.d);
const neg = (a: Fraction) => ({n: -a.n, d: a.d});
const magnitude = (a: Fraction) => ({n: abs(a.n), d: a.d});
const difference = (a: Fraction, b: Fraction) => sum(a, neg(b));
const product = (a: Fraction, b: Fraction) => fraction(a.n * b.n, a.d * b.d);
const quotient = (a: Fraction, b: Fraction) => fraction(a.n * b.d, a.d * b.n);
const compare = (a: Fraction, b: Fraction) => a.n * b.d - b.n * a.d;
const power = (places: number) => 10n ** BigInt(places);

function parse(raw: string): Parsed | null {
  if (raw.length > 16) return null;
  const value = raw.trim().replace("−", "-");
  // One separator denotes a decimal, not a thousands grouping.
  if (!/^[+-]?\d{1,6}(?:[.,]\d{1,3})?$/.test(value)) return null;
  const [whole = "", decimal = ""] = value.replace(",", ".").split(".");
  const sign = whole.startsWith("-") ? -1n : 1n;
  const units = BigInt(whole.replace(/^[+-]/, "") + decimal);
  return {value: fraction(sign * units, power(decimal.length)), places: decimal.length};
}
export function numberError(raw: string): string | null {
  if (!raw.trim()) return "Isi bilangan terlebih dahulu.";
  return parse(raw) ? null : "Gunakan maksimal 6 digit sebelum koma dan 3 sesudahnya, misalnya 12,5. Jangan gunakan pemisah ribuan.";
}
function decimalText(units: bigint, places: number): string {
  const sign = units < 0n ? "−" : "";
  const digits = abs(units).toString().padStart(places + 1, "0");
  if (!places) return sign + digits;
  const tail = digits.slice(-places).replace(/0+$/, "");
  return sign + digits.slice(0, -places) + (tail ? "," + tail : "");
}
function present(value: Fraction): {exact: string; approximation?: string} {
  let scale = 1n;
  for (let places = 0; places <= 6; places++, scale *= 10n) {
    if (scale % value.d === 0n) return {exact: decimalText(value.n * scale / value.d, places)};
  }
  const units = (abs(value.n) * 1000000n * 2n + value.d) / (value.d * 2n);
  return {
    exact: `${value.n < 0n ? "−" : ""}${abs(value.n)}/${value.d}`,
    approximation: decimalText(value.n < 0n ? -units : units, 6),
  };
}
const text = (a: Fraction) => present(a).exact;
const operand = (a: Fraction) => a.n < 0n || text(a).includes("/") ? `(${text(a)})` : text(a);
const unitsAt = (a: Fraction, places: number) => a.n * power(places) / a.d;
function placeName(index: number, places: number): string {
  const position = index - places;
  return ({"-3": "Perseribuan", "-2": "Perseratusan", "-1": "Persepuluhan", "0": "Satuan", "1": "Puluhan", "2": "Ratusan", "3": "Ribuan", "4": "Puluh ribuan", "5": "Ratus ribuan", "6": "Jutaan"} as Record<string, string>)[String(position)] ?? `Nilai tempat 10 pangkat ${position}`;
}
function parts(a: Fraction, places: number): {value: Fraction; name: string}[] {
  const digits = unitsAt(a, places).toString();
  return [...digits].flatMap((digit, i) => digit === "0" ? [] : [{
    value: fraction(BigInt(digit) * power(digits.length - i - 1), power(places)),
    name: placeName(digits.length - i - 1, places).toLowerCase(),
  }]);
}
function addPositive(a: Fraction, b: Fraction, places: number): Step[] {
  const steps: Step[] = [{title: "Sejajarkan nilai tempat", equation: `${text(a)} + ${text(b)}`, explanation: "Satuan bertemu satuan, puluhan bertemu puluhan. Untuk desimal, sejajarkan koma; nol tambahan di akhir desimal tidak mengubah nilainya."}];
  const left = unitsAt(a, places).toString(), right = unitsAt(b, places).toString();
  let carry = 0;
  const count = Math.max(left.length, right.length);
  for (let index = 0; index < count; index++) {
    const l = Number(left[left.length - index - 1] ?? 0), r = Number(right[right.length - index - 1] ?? 0);
    const total = l + r + carry, name = placeName(index, places).toLowerCase();
    steps.push({title: placeName(index, places), equation: `${l} + ${r}${carry ? " + 1" : ""} = ${total}`, explanation: `${carry ? "Tambahkan 1 dari pertukaran pada kolom sebelumnya. " : ""}${total >= 10 ? `${total} ${name} = 1 ${placeName(index + 1, places).toLowerCase()} dan ${total % 10} ${name}. Tulis ${total % 10}; pindahkan 1 ke kolom berikutnya.` : `Tulis ${total} pada kolom ${name}.`}`});
    carry = Math.floor(total / 10);
  }
  if (carry) steps.push({title: placeName(count, places), equation: "1", explanation: "Pertukaran terakhir menambah satu pada nilai tempat berikutnya."});
  return steps;
}
function subtractPositive(a: Fraction, b: Fraction, places: number): Step[] {
  const split = parts(b, places);
  if (!split.length) return [{title: "Mengurangi nol", equation: `${text(a)} − 0 = ${text(a)}`, explanation: "Tidak ada nilai yang diambil, jadi bilangan awal tetap."}];
  const steps: Step[] = [{title: "Urai bilangan yang dikurangkan", equation: `${text(b)} = ${split.map(p => text(p.value)).join(" + ")}`, explanation: "Kurangi bagian dari nilai tempat terbesar ke terkecil. Mengurai bilangan tidak mengubah nilainya."}];
  let running = a;
  for (const part of split) {
    const next = difference(running, part.value);
    let explanation = "Kurangi bagian ini dari hasil langkah sebelumnya.";
    if (!places && part.value.n < 10n && running.n % 10n < part.value.n) {
      const tens = (running.n / 10n - 1n) * 10n, ones = running.n % 10n + 10n;
      explanation = `Tukar 1 puluhan menjadi 10 satuan: ${text(running)} = ${tens} + ${ones}. Lalu ${ones} − ${text(part.value)} = ${ones - part.value.n}; gabungkan kembali dengan ${tens}.`;
    }
    steps.push({title: `Kurangi ${part.name}`, equation: `${text(running)} − ${text(part.value)} = ${text(next)}`, explanation});
    running = next;
  }
  return steps;
}
function addSigned(a: Fraction, b: Fraction, places: number): Step[] {
  if (a.n >= 0n && b.n >= 0n) return addPositive(a, b, places);
  if (a.n <= 0n && b.n <= 0n) return [
    {title: "Perhatikan tanda", equation: `${operand(a)} + ${operand(b)}`, explanation: "Kedua bilangan tidak positif. Jumlahkan jaraknya dari nol, lalu gunakan tanda negatif jika hasilnya bukan nol."},
    ...addPositive(magnitude(a), magnitude(b), places),
  ];
  const first = magnitude(a), second = magnitude(b), largerFirst = compare(first, second) >= 0n;
  return [{title: "Dua arah yang berbeda", equation: `${operand(a)} + ${operand(b)}`, explanation: "Bilangan positif dan negatif bergerak ke arah berlawanan pada garis bilangan. Cari selisih jaraknya dari nol. Tanda hasil mengikuti bilangan dengan jarak lebih besar; jarak sama menghasilkan nol."},
    ...subtractPositive(largerFirst ? first : second, largerFirst ? second : first, places)];
}
function multiplySteps(a: Fraction, b: Fraction, places: number): Step[] {
  const left = magnitude(a), right = magnitude(b), split = parts(left, places);
  if (!left.n || !right.n) return [{title: "Perkalian dengan nol", equation: `${operand(a)} × ${operand(b)} = 0`, explanation: "Nol kali suatu bilangan, atau suatu bilangan kali nol, menghasilkan nol."}];
  const steps: Step[] = [{title: "Urai menurut nilai tempat", equation: `${text(left)} = ${split.map(p => text(p.value)).join(" + ")}`, explanation: `Kalikan setiap bagian dengan ${text(right)}, lalu jumlahkan. Ini sifat distributif: perkalian dapat dibagikan ke bagian-bagian suatu bilangan.`}];
  for (const part of split) steps.push({title: `Kalikan bagian ${part.name}`, equation: `${text(part.value)} × ${text(right)} = ${text(product(part.value, right))}`, explanation: "Bagian yang lebih besar tetap membawa nilai tempatnya; jangan hanya mengalikan digitnya."});
  steps.push({title: "Gabungkan hasil setiap bagian", equation: `${split.map(p => text(product(p.value, right))).join(" + ")} = ${text(product(left, right))}`, explanation: "Seluruh hasil bagian dijumlahkan kembali menjadi satu hasil perkalian."});
  return steps;
}
function divideSteps(a: Fraction, b: Fraction, places: number): Step[] {
  const left = magnitude(a), right = magnitude(b);
  const dividend = unitsAt(left, places), divisor = unitsAt(right, places);
  const steps: Step[] = [];
  if (places) steps.push({title: "Buat pembagi menjadi bilangan bulat", equation: `${text(left)} ÷ ${text(right)} = ${dividend} ÷ ${divisor}`, explanation: `Kalikan kedua bilangan dengan ${power(places)}. Perbandingannya tetap sama, sehingga hasil bagi tidak berubah.`});
  steps.push({title: "Cari banyaknya pembagi yang muat", equation: `${dividend} ÷ ${divisor}`, explanation: "Baca bilangan yang dibagi dari kiri. Pada setiap langkah, cari berapa kali pembagi muat, lalu hitung sisanya."});
  let remainder = 0n, started = false;
  const digits = dividend.toString();
  for (let i = 0; i < digits.length; i++) {
    const before = remainder, available = before * 10n + BigInt(digits[i]!);
    const digit = available / divisor;
    remainder = available % divisor;
    if (digit || started || i === digits.length - 1) {
      steps.push({title: `Baca hingga digit ${i + 1}`, equation: `${available} = ${divisor} × ${digit} + ${remainder}`, explanation: `${before ? `Sisa sebelumnya ${before} menjadi ${before * 10n} pada nilai tempat berikutnya; turunkan digit ${digits[i]}. ` : ""}Pembagi ${divisor} muat ${digit} kali dalam ${available}. Digit hasilnya ${digit}, dengan sisa ${remainder}.`});
      started = true;
    }
  }
  if (remainder) {
    steps.push({title: "Sisa juga mempunyai nilai", equation: `${dividend} ÷ ${divisor} = ${dividend / divisor} + ${text(fraction(remainder, divisor))}`, explanation: `Hasil bilangan bulatnya ${dividend / divisor}, dengan sisa ${remainder}. Untuk hasil penuh, sisa dibagi lagi dengan pembagi; jangan membuang sisanya.`});
    const seen = new Set<bigint>();
    for (let place = 1; remainder && place <= 6; place++) {
      if (seen.has(remainder)) {steps.push({title: "Desimal berulang", equation: text(quotient(left, right)), explanation: "Sisa yang sama muncul lagi, sehingga digit desimal akan berulang. Bentuk pecahan tetap menyatakan hasil yang tepat."}); break;}
      seen.add(remainder);
      const available = remainder * 10n, digit = available / divisor;
      remainder = available % divisor;
      steps.push({title: `Digit desimal ke-${place}`, equation: `${available} = ${divisor} × ${digit} + ${remainder}`, explanation: `Kalikan sisa dengan 10 untuk melihat nilai tempat yang lebih kecil. Digit desimal berikutnya ${digit}; sisanya sekarang ${remainder}.`});
    }
  }
  return steps;
}

export function calculate(firstRaw: string, operation: string, secondRaw: string): CalculationResult {
  if (!Object.hasOwn(operations, operation)) return {ok: false, field: "operation", message: "Pilih tambah, kurang, kali, atau bagi."};
  const firstError = numberError(firstRaw), secondError = numberError(secondRaw);
  if (firstError) return {ok: false, field: "first", message: firstError};
  if (secondError) return {ok: false, field: "second", message: secondError};
  const first = parse(firstRaw)!, second = parse(secondRaw)!;
  const a = first.value, b = second.value, places = Math.max(first.places, second.places), op = operation as Operation;
  if (op === "divide" && !b.n) return {ok: false, field: "second", message: !a.n
    ? "0 ÷ 0 tidak mempunyai satu hasil tertentu: setiap bilangan dikali 0 menghasilkan 0. Ganti pembagi dengan bilangan selain nol."
    : `Tidak dapat membagi ${text(a)} dengan nol: tidak ada bilangan yang dikali 0 menghasilkan ${text(a)}. Ganti pembagi dengan bilangan selain nol.`};
  let value: Fraction, steps: Step[], check: string;
  switch (op) {
    case "add": value = sum(a, b); steps = addSigned(a, b, places); check = `${operand(value)} − ${operand(b)} = ${text(a)}. Mengurangi bilangan kedua mengembalikan bilangan pertama.`; break;
    case "subtract": {
      value = difference(a, b);
      if (a.n < 0n || b.n < 0n) steps = [{title: "Kurang berarti tambah lawannya", equation: `${operand(a)} − ${operand(b)} = ${operand(a)} + ${operand(neg(b))}`, explanation: "Lawan bilangan berada di sisi lain nol. Mengurangi bilangan negatif sama dengan menambah bilangan positif."}, ...addSigned(a, neg(b), places)];
      else if (compare(a, b) >= 0n) steps = subtractPositive(a, b, places);
      else steps = [{title: "Hasil berada di bawah nol", equation: `${text(a)} < ${text(b)}`, explanation: "Bilangan yang dikurangkan lebih besar. Cari selisih dengan urutan terbalik, lalu gunakan tanda negatif."}, ...subtractPositive(b, a, places)];
      check = `${operand(value)} + ${operand(b)} = ${text(a)}. Menambah kembali bilangan yang dikurangkan mengembalikan bilangan awal.`; break;
    }
    case "multiply": value = product(a, b); steps = multiplySteps(a, b, places); check = b.n ? `${operand(value)} ÷ ${operand(b)} = ${text(a)}. Pembagian memeriksa hasil perkalian.` : "Hasilnya 0 karena dikali 0. Jangan memeriksanya dengan pembagian nol."; break;
    case "divide": value = quotient(a, b); steps = divideSteps(a, b, places); check = `${operand(value)} × ${operand(b)} = ${text(a)}. Mengalikan hasil tepat dengan pembagi mengembalikan bilangan yang dibagi.`; break;
  }
  if ((op === "multiply" || op === "divide") && (a.n < 0n || b.n < 0n) && value.n) steps.push({title: "Tentukan tanda hasil", equation: text(value), explanation: "Dua tanda yang sama menghasilkan bilangan positif. Dua tanda yang berbeda menghasilkan bilangan negatif."});
  const display = present(value);
  const expression = `${operand(a)} ${operations[op].symbol} ${operand(b)}`;
  steps.push({title: "Tuliskan hasil akhir", equation: `${expression} = ${display.exact}${display.approximation ? ` ≈ ${display.approximation}` : ""}`, explanation: display.approximation ? "Pecahan adalah hasil tepat. Tanda ≈ berarti mendekati; desimal dibulatkan hingga 6 angka di belakang koma, bukan hasil tepat." : "Tanda = berarti kedua sisi mempunyai nilai yang sama."});
  return {ok: true, calculation: {expression, ...display, fraction: {numerator: value.n.toString(), denominator: value.d.toString()}, steps, check, lesson: operations[op].lesson}};
}

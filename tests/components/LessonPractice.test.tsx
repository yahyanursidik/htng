import { render,screen,fireEvent,waitFor,cleanup } from "@testing-library/preact";
import { afterEach,beforeEach,describe,it,expect,vi } from "vitest";
import LessonPractice from "../../src/components/learning/LessonPractice";
import MathModel from "../../src/components/learning/MathModel";
import AuthForm from "../../src/components/account/AuthForm";
import { generateQuestion } from "../../src/learning/curriculum/engine";
import { readGuestAttempts } from "../../src/lib/account/api";
beforeEach(()=>{localStorage.clear();vi.spyOn(Math,"random").mockReturnValue(0);vi.stubGlobal("fetch",vi.fn().mockResolvedValue({ok:true,json:async()=>({user:null,profiles:[],activeProfileId:null,csrf:null})}));});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
describe("concept practice",()=>{
  it("keeps answer and reasoning separate, records retries as supported, fades model",async()=>{
    render(<LessonPractice lessonId="menjumlah"/>);await screen.findByText(/Mode tamu/);
    const q=generateQuestion("menjumlah",0);fireEvent.input(screen.getByLabelText("Jawaban"),{target:{value:String(q.expected)}});
    fireEvent.click(screen.getByLabelText(q.reasons[(q.correctReason+1)%3]!));fireEvent.click(screen.getByRole("button",{name:"Periksa jawaban"}));
    await screen.findByText(/Jawabannya tepat. Periksa lagi alasan/);expect(readGuestAttempts()[0]?.reasonCorrect).toBe(false);
    fireEvent.click(screen.getByLabelText(q.reasons[q.correctReason]!));fireEvent.click(screen.getByRole("button",{name:"Periksa jawaban"}));await screen.findByText(/^Ya\./);
    await waitFor(()=>expect(readGuestAttempts()).toHaveLength(2));expect(readGuestAttempts()[1]?.independent).toBe(false);
    fireEvent.click(screen.getByRole("button",{name:"Soal berikutnya"}));expect(screen.getByRole("button",{name:"Sembunyikan model"})).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Lewati soal"}));expect(screen.getByRole("button",{name:"Tampilkan model"})).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Petunjuk 0/3"}));expect(screen.getByRole("button",{name:"Sembunyikan model"})).toBeInTheDocument();
  });
  it("rejects invalid numeric answer without recording",async()=>{render(<LessonPractice lessonId="menjumlah"/>);await screen.findByText(/Mode tamu/);fireEvent.input(screen.getByLabelText("Jawaban"),{target:{value:"1e3"}});fireEvent.click(screen.getByRole("button",{name:"Periksa jawaban"}));expect(await screen.findByText(/Tulis angka\. Untuk desimal/)).toBeInTheDocument();expect(readGuestAttempts()).toHaveLength(0);});
  it("preserves one pending server attempt and retries the same ID",async()=>{
    const session={user:{id:"parent",name:"Bunda",email:"parent@example.test"},profiles:[{id:"child",nickname:"Anak",grade:1}],activeProfileId:"child",csrf:"test-token"};const ids:string[]=[];
    vi.stubGlobal("fetch",vi.fn().mockImplementation(async(path:string,options?:RequestInit)=>{if(path==="/api/attempts"){ids.push(JSON.parse(String(options?.body)).id);if(ids.length===1)throw new TypeError("offline");return {ok:true,json:async()=>({ok:true})};}return {ok:true,json:async()=>session};}));
    render(<LessonPractice lessonId="menjumlah"/>);await screen.findByText("Belajar sebagai Anak");const q=generateQuestion("menjumlah",0);fireEvent.input(screen.getByLabelText("Jawaban"),{target:{value:String(q.expected)}});fireEvent.click(screen.getByLabelText(q.reasons[q.correctReason]!));fireEvent.click(screen.getByRole("button",{name:"Periksa jawaban"}));await screen.findByText(/Jawaban tetap terlihat/);expect(screen.getByRole("button",{name:"Soal berikutnya"})).toBeDisabled();expect(screen.getByLabelText("Jawaban")).toBeDisabled();
    fireEvent.click(screen.getByRole("button",{name:"Coba simpan lagi"}));await screen.findByText("Catatan tersimpan untuk Anak.");expect(ids).toHaveLength(2);expect(ids[0]).toBe(ids[1]);expect(readGuestAttempts()).toHaveLength(0);expect(screen.getByRole("button",{name:"Soal berikutnya"})).toBeEnabled();
  });
  it("supports recoverable guest storage failure",async()=>{render(<LessonPractice lessonId="menjumlah"/>);await screen.findByText(/Mode tamu/);vi.spyOn(localStorage,"setItem").mockImplementation(()=>{throw new Error("quota");});const q=generateQuestion("menjumlah",0);fireEvent.input(screen.getByLabelText("Jawaban"),{target:{value:String(q.expected)}});fireEvent.click(screen.getByLabelText(q.reasons[q.correctReason]!));fireEvent.click(screen.getByRole("button",{name:"Periksa jawaban"}));expect(await screen.findByText(/Penyimpanan browser tidak tersedia/)).toBeInTheDocument();expect(screen.getByRole("button",{name:"Soal berikutnya"})).toBeEnabled();});
  it("has three hints and announces solution only at the final stage",async()=>{render(<LessonPractice lessonId="luas"/>);await screen.findByText(/Mode tamu/);for(let i=0;i<3;i++)fireEvent.click(screen.getByRole("button",{name:`Petunjuk ${i}/3`}));expect(screen.getByRole("button",{name:"Petunjuk 3/3"})).toBeDisabled();expect(screen.getByRole("complementary",{name:"Petunjuk"})).toHaveTextContent(generateQuestion("luas",0).explanation);});
  it("models subtraction as removal and counters as keyboard-native buttons",()=>{const q=generateQuestion("mengurangi",0);render(<MathModel model={q.model}/>);expect(screen.getAllByRole("img")).toHaveLength(q.model.values[1]!);const button=screen.getAllByRole("button")[0]!;expect(button).toHaveAttribute("aria-pressed","false");fireEvent.click(button);expect(button).toHaveAttribute("aria-pressed","true");});
});
describe("auth form",()=>{
  it("does not send unmatched passwords and displays instruction",()=>{render(<AuthForm mode="register"/>);fireEvent.input(screen.getByLabelText("Kata sandi"),{target:{value:"kata sandi cukup panjang"}});fireEvent.input(screen.getByLabelText("Ulangi kata sandi"),{target:{value:"kata sandi lain panjang"}});fireEvent.submit(screen.getByRole("button",{name:"Buat akun"}).closest("form")!);expect(screen.getByRole("alert")).toHaveTextContent("Kedua kata sandi belum sama");expect(fetch).not.toHaveBeenCalled();});
});

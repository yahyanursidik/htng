import {render,screen,fireEvent} from "@testing-library/preact";
import {describe,it,expect,vi} from "vitest";
import CPAGame from "../../src/components/learning/CPAGame";
import CPAPicture from "../../src/components/learning/CPAPicture";
import CPAWorkedPicture from "../../src/components/learning/CPAWorkedPicture";
import {generateChallenge,games} from "../../src/learning/cpa/engine";
import {generateQuestion} from "../../src/learning/curriculum/engine";
import {readCPAEvidence} from "../../src/lib/storage/cpa-evidence";
import {lessons} from "../../src/learning/curriculum/catalog";

describe("CPA interactions",()=>{
  it("bridges C/P/A with stable state and separates numerical answer from reason",()=>{
    render(<CPAGame gameId="gabungkan"/>);fireEvent.click(screen.getByRole("checkbox",{name:/Saya sudah mencoba/}));
    for(const name of ["Tambah ke Awal","Tambah ke Datang"])for(let i=0;i<2;i++)fireEvent.click(screen.getByRole("button",{name}));
    fireEvent.click(screen.getByRole("button",{name:"Periksa susunan"}));expect(screen.getByText(/Susunannya sesuai/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Gambar",exact:true}));expect(screen.getByRole("figure")).toHaveTextContent("Awal: 2; Datang: 2");
    fireEvent.click(screen.getByRole("button",{name:"Simbol",exact:true}));const q=generateChallenge("gabungkan",0);
    fireEvent.input(screen.getByLabelText("Jawaban"),{target:{value:"4"}});fireEvent.click(screen.getByLabelText(q.reasons[1]!));fireEvent.click(screen.getByRole("button",{name:"Periksa simbol dan alasan"}));expect(screen.getByText(/Angkanya tepat/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(q.reasons[0]!));fireEvent.click(screen.getByRole("button",{name:"Periksa simbol dan alasan"}));expect(screen.getByText(/^Ya\./)).toBeInTheDocument();
    const records=readCPAEvidence();expect(records).toHaveLength(3);expect(records[2]?.visited).toEqual(["concrete","pictorial","abstract"]);expect(records[2]?.physicalReported).toBe(true);expect(records[2]?.moves).toBe(4);expect(records[1]?.reasonCorrect).toBe(false);
  });
  it("keeps phases freely accessible; invalid answer is not an evaluated attempt",()=>{
    render(<CPAGame gameId="desimal"/>);fireEvent.click(screen.getByRole("button",{name:"Simbol",exact:true}));
    fireEvent.input(screen.getByLabelText("Jawaban"),{target:{value:"1e2"}});fireEvent.click(screen.getByRole("button",{name:"Periksa simbol dan alasan"}));expect(screen.getByRole("alert")).toHaveTextContent("Tulis angka");expect(readCPAEvidence()).toEqual([]);
    fireEvent.input(screen.getByLabelText("Jawaban"),{target:{value:"0,3"}});fireEvent.click(screen.getByRole("button",{name:"Periksa simbol dan alasan"}));expect(screen.getByRole("alert")).toHaveTextContent("Pilih alasan");
    fireEvent.click(screen.getByRole("button",{name:"Benda",exact:true}));expect(screen.getByRole("checkbox")).not.toBeChecked();
  });
  it("exchange and reverse exchange conserve value and support native buttons",()=>{
    render(<CPAGame gameId="tukar"/>);fireEvent.click(screen.getByRole("button",{name:"Ikat 10 satuan"}));expect(screen.getByRole("button",{name:"Ikat 10 satuan"})).toBeDisabled();
    expect(screen.getByText(/Nilai total: 32/)).toBeInTheDocument();fireEvent.click(screen.getByRole("button",{name:"Buka 1 puluhan"}));expect(screen.getByText(/Nilai total: 32/)).toBeInTheDocument();expect(screen.getByRole("button",{name:"Ikat 10 satuan"})).toBeEnabled();
  });
  it("fraction selection is reversible, labelled and uses pressed state not color alone",()=>{
    render(<CPAGame gameId="bagian"/>);const unit=screen.getByRole("button",{name:"Unit 4",exact:true});expect(unit).toHaveAttribute("aria-pressed","false");fireEvent.click(unit);expect(unit).toHaveAttribute("aria-pressed","true");fireEvent.click(screen.getByRole("button",{name:"Periksa susunan"}));expect(screen.getByText(/Susunannya sesuai/)).toBeInTheDocument();fireEvent.click(unit);expect(unit).toHaveAttribute("aria-pressed","false");
  });
  it("hints progress to reasoning last, reset per example, storage failure is honest",()=>{
    render(<CPAGame gameId="gabungkan"/>);for(let i=0;i<3;i++)fireEvent.click(screen.getByRole("button",{name:`Petunjuk ${i}/3`}));
    expect(screen.getByRole("complementary",{name:"Petunjuk CPA"})).toHaveTextContent(generateChallenge("gabungkan",0).explanation);expect(screen.getByRole("button",{name:"Petunjuk 3/3"})).toBeDisabled();
    vi.spyOn(localStorage,"setItem").mockImplementation(()=>{throw new Error("quota");});fireEvent.click(screen.getByRole("button",{name:"Periksa susunan"}));expect(screen.getByText(/percobaan belum disimpan/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Contoh berikutnya"}));expect(screen.getByRole("button",{name:"Petunjuk 0/3"})).toBeEnabled();expect(screen.getByText(/Contoh 2\./)).toBeInTheDocument();
  });
  it("all 14 games render coherent labelled instructions and three open phases",()=>{
    for(const g of games){const view=render(<CPAGame gameId={g.id}/>);expect(screen.getByText(generateChallenge(g.id,0).concrete)).toBeInTheDocument();expect(screen.getByRole("navigation",{name:"Representasi CPA"})).toBeInTheDocument();expect(screen.getByRole("button",{name:"Periksa susunan"})).toBeEnabled();view.unmount();}
  });
  it("line retains all signed positions and readable start/end description",()=>{
    const q=generateChallenge("lintasi-nol",0);render(<CPAPicture question={q} state={[-2]}/>);expect(screen.getByRole("img")).toHaveAttribute("aria-label",expect.stringContaining("sekarang -2"));expect(screen.getByText("-5")).toBeInTheDocument();expect(screen.getByText("5")).toBeInTheDocument();
  });
  it("supplemental worked pictures render for all 30 lessons without changing generators",()=>{
    for(const lesson of lessons){const q=generateQuestion(lesson.id,17);const view=render(<CPAWorkedPicture question={q}/>);expect(screen.getAllByRole("figure").length).toBeGreaterThan(0);expect(generateQuestion(lesson.id,17)).toEqual(q);view.unmount();}
  });
});

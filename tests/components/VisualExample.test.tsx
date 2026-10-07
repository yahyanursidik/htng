import {render,screen,fireEvent,waitFor} from '@testing-library/preact';
import {describe,it,expect,vi} from 'vitest';
import VisualExample from '../../src/components/learning/VisualExample';
import VisualExampleCatalogue from '../../src/components/learning/VisualExampleCatalogue';
import ExamplePicture from '../../src/components/learning/ExamplePicture';
import {exercise,getExample} from '../../src/learning/visual-examples/engine';
function practice(id='mangga-menjumlah') {render(<VisualExample exampleId={id}/>);fireEvent.click(screen.getByRole('button',{name:'Coba latihan'}));return exercise(getExample(id),0).question;}
function answer(value:string,reason:string) {fireEvent.input(screen.getByLabelText('Jawaban bilangan'),{target:{value}});fireEvent.click(screen.getByLabelText(reason));fireEvent.click(screen.getByRole('button',{name:'Periksa jawaban'}));}
describe('visual examples',()=>{
  it('filters a readable catalogue across six grades and five themes',()=>{
    render(<VisualExampleCatalogue/>);expect(screen.getAllByRole('link')).toHaveLength(60);
    fireEvent.change(screen.getByLabelText('Benda'),{target:{value:'motor'}});expect(screen.getAllByRole('link')).toHaveLength(12);
    fireEvent.change(screen.getByLabelText('Kelas'),{target:{value:'3'}});expect(screen.getAllByRole('link')).toHaveLength(3);expect(screen.getByRole('status')).toHaveTextContent('3 contoh');
  });
  it('focuses the task, checks answer and reason separately, and only keeps temporary evidence',async()=>{
    const store=vi.spyOn(localStorage,'setItem');const q=practice();
    await waitFor(()=>expect(screen.getByRole('heading',{name:'Coba dengan bilangan berbeda'})).toHaveFocus());
    answer(String(q.expected),q.reasons[(q.correctReason+1)%3]!);
    expect(screen.getByTestId('example-feedback')).toHaveTextContent('Jawaban bilangan tepat. Periksa kembali alasan.');
    answer(String(q.expected),q.reasons[q.correctReason]!);
    expect(screen.getByTestId('example-feedback')).toHaveTextContent('Alasan tepat.');
    expect(screen.getByText(/Catatan percobaan di halaman ini \(2\)/)).toBeVisible();
    expect(store).not.toHaveBeenCalled();store.mockRestore();
    fireEvent.input(screen.getByLabelText('Jawaban bilangan'),{target:{value:'9'}});expect(screen.getByTestId('example-feedback')).toHaveTextContent(/^$/);
  });
  it('validates on submission without recording incomplete attempts',()=>{
    practice();fireEvent.click(screen.getByRole('button',{name:'Periksa jawaban'}));expect(screen.getByRole('alert')).toHaveTextContent('Tulis jawaban');expect(screen.getByLabelText('Jawaban bilangan')).toHaveFocus();
    expect(screen.queryByText(/Catatan percobaan di halaman ini/)).not.toBeInTheDocument();
    fireEvent.input(screen.getByLabelText('Jawaban bilangan'),{target:{value:'4'}});fireEvent.click(screen.getByRole('button',{name:'Periksa jawaban'}));expect(screen.getByRole('alert')).toHaveTextContent('Pilih alasan');expect(screen.getAllByRole('radio')[0]).toHaveFocus();
  });
  it('progresses three hints, restores scaffolding and resets on next exercise',()=>{
    practice();fireEvent.click(screen.getByRole('button',{name:'Sembunyikan gambar'}));expect(screen.queryByRole('figure')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Tampilkan gambar'}));expect(screen.getByRole('figure')).toBeVisible();
    for(let i=0;i<3;i++)fireEvent.click(screen.getByRole('button',{name:/^Petunjuk/}));expect(screen.getByRole('button',{name:'Petunjuk 3/3'})).toBeDisabled();
    expect(screen.getByRole('complementary',{name:'Petunjuk'}).querySelectorAll('li')).toHaveLength(3);
    fireEvent.click(screen.getByRole('button',{name:'Latihan lain'}));expect(screen.queryByRole('complementary')).not.toBeInTheDocument();expect(screen.getByLabelText('Jawaban bilangan')).toHaveValue('');
  });
  it('marks mathematical units without altering their quantity',()=>{
    render(<ExamplePicture theme="mobil" panels={[{label:'Awal',count:3,removed:1}]} bridge="Gambar" marked={['0-0']} onMark={vi.fn()}/>);
    expect(screen.getAllByRole('button')).toHaveLength(2);expect(screen.getByRole('button',{name:'mobil 1, Awal'})).toHaveAttribute('aria-pressed','true');expect(screen.getByRole('img',{name:'mobil 3, Awal, diambil'})).toBeVisible();
  });
  it('distributes and undoes one unit while preserving total',()=>{
    const q=practice('motor-pembagian'),v=exercise(getExample('motor-pembagian'),0);const total=q.model.values[0]!;
    expect(screen.getByText(`${total} belum dibagikan. Isi kelompok: ${Array(v.divisionGroups).fill(0).join(', ')}.`)).toBeVisible();
    fireEvent.click(screen.getByRole('button',{name:'Bagikan satu'}));expect(screen.getByRole('button',{name:'Kembalikan satu'})).toBeEnabled();
    fireEvent.click(screen.getByRole('button',{name:'Kembalikan satu'}));expect(screen.getByRole('button',{name:'Kembalikan satu'})).toBeDisabled();
    for(let i=0;i<total;i++)fireEvent.click(screen.getByRole('button',{name:'Bagikan satu'}));expect(screen.getByRole('button',{name:'Bagikan satu'})).toBeDisabled();expect(screen.getByText(`0 belum dibagikan. Isi kelompok: ${Array(v.divisionGroups).fill(q.expected).join(', ')}.`)).toBeVisible();
  });
  it('makes fractional whole and selected equal parts accessible without hiding necessary data',()=>{
    practice('semangka-pecahan-senilai');expect(screen.getAllByRole('img',{name:/bagian sama besar/})).toHaveLength(2);expect(screen.queryByRole('button',{name:'Sembunyikan gambar'})).not.toBeInTheDocument();
  });
});

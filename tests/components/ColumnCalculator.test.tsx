import {render,screen,fireEvent,waitFor} from '@testing-library/preact';
import {afterEach,describe,it,expect,vi} from 'vitest';
import ExplainingCalculator from '../../src/components/learning/ExplainingCalculator';
function column(){render(<ExplainingCalculator/>);fireEvent.click(screen.getByRole('button',{name:'Bersusun',exact:true}));}
function fill(a:string,operation:string,b:string){fireEvent.input(screen.getByLabelText('Bilangan pertama'),{target:{value:a}});fireEvent.change(screen.getByLabelText('Operasi',{exact:true}),{target:{value:operation}});fireEvent.input(screen.getByLabelText('Bilangan kedua'),{target:{value:b}});fireEvent.click(screen.getByRole('button',{name:'Hitung',exact:true}));}
afterEach(()=>history.replaceState({},'','/'));
describe('column calculator',()=>{
  it('supports selecting the method from the guide URL',async()=>{
    history.replaceState({},'','/kalkulator?cara=bersusun');render(<ExplainingCalculator/>);
    await waitFor(()=>expect(screen.getByRole('button',{name:'Bersusun',exact:true})).toHaveAttribute('aria-pressed','true'));
    expect(screen.getByRole('button',{name:'1000 − 278'})).toBeVisible();
  });
  it('focuses result and each navigated step, including return to the first',async()=>{
    column();fill('368','add','257');expect(screen.getByTestId('calculator-result')).toHaveTextContent('625');
    await waitFor(()=>expect(screen.getByRole('heading',{name:'Hasil dan cara menghitung'})).toHaveFocus());
    expect(screen.getByRole('button',{name:'Langkah sebelumnya'})).toBeDisabled();
    fireEvent.click(screen.getByRole('button',{name:'Langkah berikut'}));await waitFor(()=>expect(screen.getByTestId('column-step-title')).toHaveFocus());
    expect(screen.getByTestId('column-step-title')).toHaveTextContent('Jumlahkan satuan');
    expect(screen.getByRole('table')).toHaveAccessibleName(/Jumlahkan satuan/);expect(screen.getByTestId('column-explanation')).toHaveTextContent(/15 satuan ditukar menjadi 1 puluhan/);
    fireEvent.click(screen.getByRole('button',{name:'Langkah sebelumnya'}));await waitFor(()=>expect(screen.getByTestId('column-step-title')).toHaveFocus());expect(screen.getByTestId('column-step-title')).toHaveTextContent('Sejajarkan nilai tempat');
  });
  it('reveals exchanges over zero without changing the minuend',()=>{
    column();fill('1000','subtract','278');
    for(let i=0;i<3;i++)fireEvent.click(screen.getByRole('button',{name:'Langkah berikut'}));
    expect(screen.getByTestId('column-step-title')).toHaveTextContent('Tukar 1 puluhan');expect(screen.getByRole('table').querySelectorAll('s')).toHaveLength(4);
    expect(screen.getByTestId('calculator-result')).toHaveTextContent('722');
  });
  it('shows quotient and remainder, not an incorrect integer equality, and retains zero digits',()=>{
    column();fill('17','divide','4');expect(screen.getByTestId('calculator-result')).toHaveTextContent('17 ÷ 4: hasil bagi 4, sisa 1');
    expect(screen.getByText(/4 × 4 \+ 1 = 17/)).toBeVisible();
    fill('1005','divide','5');expect(screen.getByTestId('calculator-result')).toHaveTextContent('hasil bagi 201, sisa 0');
    expect(screen.getByTestId('column-step-title')).toHaveTextContent('Mulai membaca dari kiri');
  });
  it('clears stale diagrams on edits and method switches, preserves numbers and ordinary functionality',()=>{
    column();fill('12','multiply','4');expect(screen.getByRole('table')).toBeVisible();
    fireEvent.input(screen.getByLabelText('Bilangan kedua'),{target:{value:'5'}});expect(screen.queryByRole('table')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Cara biasa'}));expect(screen.getByLabelText('Bilangan pertama')).toHaveValue('12');
    fill('1,25','add','0,75');expect(screen.getByTestId('calculator-result')).toHaveTextContent('2');expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
  it('links errors, focuses invalid fields, supports recovery and does not write evidence',()=>{
    const store=vi.spyOn(localStorage,'setItem');column();fill('12,5','add','1');expect(screen.getByRole('alert')).toHaveTextContent('Cara biasa');expect(screen.getByLabelText('Bilangan pertama')).toHaveFocus();expect(screen.getByLabelText('Bilangan pertama')).toHaveAttribute('aria-invalid','true');
    fill('10','divide','0');expect(screen.getByRole('alert')).toHaveTextContent('nol');expect(screen.getByLabelText('Bilangan kedua')).toHaveFocus();
    fill('10','divide','2');expect(screen.getByTestId('calculator-result')).toHaveTextContent('hasil bagi 5, sisa 0');expect(store).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button',{name:'Kosongkan'}));expect(screen.queryByRole('table')).not.toBeInTheDocument();expect(screen.getByRole('button',{name:'Bersusun',exact:true})).toHaveAttribute('aria-pressed','true');
  });
});

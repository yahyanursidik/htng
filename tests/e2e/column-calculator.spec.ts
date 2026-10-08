import {test,expect,type Page} from '@playwright/test';

async function example(page:Page,label:string){
  await page.getByRole('button',{name:label,exact:true}).click();
  await page.getByRole('button',{name:'Hitung',exact:true}).press('Enter');
}
async function finish(page:Page){
  const next=page.getByRole('button',{name:'Langkah berikut',exact:true});
  for(let i=0;i<50&&await next.isEnabled();i++)await next.press('Enter');
  await expect(next).toBeDisabled();
}
async function contrast(page:Page){
  const values=await page.locator('.column-guide p,.column-guide li,.column-guide a,.column-table th,.column-table td,.column-diagram figcaption,.column-key li,.column-cues strong,.column-direction>span,.column-arrows path,.calculator-method button,.column-solution p,.column-solution h4').evaluateAll(elements=>{
    const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const context=canvas.getContext('2d',{willReadFrequently:true})!;
    const rgb=(color:string)=>{context.clearRect(0,0,1,1);context.fillStyle=color;context.fillRect(0,0,1,1);return [...context.getImageData(0,0,1,1).data];};
    const luminance=(values:number[])=>values.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*([.2126,.7152,.0722][i]??0),0);
    return elements.filter(el=>el.getBoundingClientRect().height>0).map(el=>{let node:Element|null=el,background=[255,255,255,255];while(node){const color=rgb(getComputedStyle(node).backgroundColor);if(color[3]===255){background=color;break;}node=node.parentElement;}const graphic=el.localName==='path',a=luminance(rgb(graphic?getComputedStyle(el).stroke:getComputedStyle(el).color)),b=luminance(background);return {label:graphic?'direction arrow':el.textContent,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),minimum:graphic?3:4.5};});
  });
  for(const value of values)expect(value.ratio,value.label??'column text').toBeGreaterThanOrEqual(value.minimum);
}
test('place-value text, active column, carrying and selected controls maintain contrast',async({page})=>{
  await page.goto('/bersusun');await contrast(page);await page.goto('/kalkulator?cara=bersusun');await expect(page.getByRole('button',{name:'Bersusun',exact:true})).toHaveAttribute('aria-pressed','true');await contrast(page);
  await example(page,'368 + 257');await page.getByRole('button',{name:'Langkah berikut'}).click();await contrast(page);await page.getByRole('button',{name:'Langkah sebelumnya'}).hover();await contrast(page);
  await example(page,'1000 − 278');for(let i=0;i<3;i++)await page.getByRole('button',{name:'Langkah berikut'}).click();await contrast(page);
});
test('guide is discoverable and calculator explains exchanges with keyboard and no writes',async({page})=>{
  const writes:string[]=[];page.on('request',r=>{if(r.method()!=='GET')writes.push(r.url());});
  await page.goto('/belajar');await page.getByRole('link',{name:'Hitung bersusun',exact:true}).press('Enter');
  await expect(page).toHaveURL(/\/bersusun\/?$/);await expect(page.getByRole('table')).toHaveCount(4);
  await page.getByRole('link',{name:'Coba bersusun →',exact:true}).first().press('Enter');
  await expect(page.getByRole('button',{name:'Bersusun',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByLabel('Bilangan pertama').fill('368');await page.getByLabel('Bilangan kedua').fill('257');await page.getByLabel('Bilangan kedua').press('Enter');
  await expect(page.getByTestId('calculator-result')).toHaveText('368 + 257 = 625');await expect(page.getByRole('heading',{name:'Hasil dan cara menghitung'})).toBeFocused();
  await page.getByRole('button',{name:'Langkah berikut'}).press('Enter');await expect(page.getByTestId('column-step-title')).toBeFocused();
  await expect(page.getByTestId('column-explanation')).toContainText('15 satuan ditukar menjadi 1 puluhan');
  await expect(page.getByRole('table')).toHaveAccessibleName(/Jumlahkan satuan/);await expect(page.locator('td[data-active]')).toHaveCount(4);
  await page.getByRole('button',{name:'Langkah sebelumnya'}).press('Enter');await expect(page.getByTestId('column-step-title')).toBeFocused();await expect(page.getByTestId('column-step-title')).toHaveText('Sejajarkan nilai tempat');
  await finish(page);await expect(page.locator('.column-row--result .column-digit')).toHaveText(['6','2','5']);
  expect(writes).toEqual([]);
});
test('column modes explain borrowing across zeros, shifted multiplication, zero quotient and remainder',async({page})=>{
  await page.goto('/kalkulator?cara=bersusun');await expect(page.getByRole('button',{name:'Bersusun',exact:true})).toHaveAttribute('aria-pressed','true');
  await example(page,'1000 − 278');for(let i=0;i<3;i++)await page.getByRole('button',{name:'Langkah berikut'}).press('Enter');
  await expect(page.locator('.column-row--regrouped .column-digit')).toHaveText(['0','9','9','10']);await expect(page.locator('table s')).toHaveCount(4);await expect(page.getByTestId('calculator-result')).toContainText('722');
  await example(page,'123 × 24');await finish(page);await expect(page.getByTestId('calculator-result')).toContainText('2952');await expect(page.locator('.column-row--partial').nth(1).locator('.column-digit')).toHaveText(['2','4','6','0']);
  await example(page,'1005 ÷ 5');await finish(page);await expect(page.getByTestId('calculator-result')).toHaveText('1005 ÷ 5: hasil bagi 201, sisa 0');await expect(page.locator('.column-row--result .column-digit')).toHaveText(['','2','0','1']);
  await example(page,'17 ÷ 4');await finish(page);await expect(page.getByTestId('calculator-result')).toHaveText('17 ÷ 4: hasil bagi 4, sisa 1');await expect(page.getByTestId('column-explanation')).toContainText('hasil penuh adalah 4 + 1/4');
  await page.getByLabel('Bilangan kedua').fill('0');await expect(page.getByRole('table')).toHaveCount(0);await page.getByRole('button',{name:'Hitung',exact:true}).press('Enter');await expect(page.getByRole('alert')).toContainText('nol');await expect(page.getByLabel('Bilangan kedua')).toBeFocused();
  await page.getByLabel('Bilangan pertama').fill('1,25');await page.getByLabel('Bilangan kedua').fill('0,75');await page.getByRole('button',{name:'Hitung',exact:true}).press('Enter');await expect(page.getByRole('alert')).toContainText('Cara biasa');
  await page.getByRole('button',{name:'Cara biasa',exact:true}).press('Enter');await page.getByRole('button',{name:'Hitung',exact:true}).press('Enter');await expect(page.getByTestId('calculator-result')).toHaveText('1,25 ÷ 0,75 = 5/3');
});
test('guide remains readable without JavaScript',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto('/bersusun');
  await expect(page.getByRole('heading',{name:'Pengurangan bersusun',exact:true})).toBeVisible();await expect(page.getByRole('table')).toHaveCount(4);
  await page.locator('#subtract summary').press('Enter');await expect(page.locator('#subtract details')).toHaveAttribute('open','');await expect(page.locator('#subtract details')).toContainText('1 ribuan = 10 ratusan');await context.close();
});

test('colored arrows follow each operation on small and large screens without obscuring digits',async({page})=>{
  test.setTimeout(120000);await page.emulateMedia({reducedMotion:'reduce'});
  for(const width of [375,768,1024,1440]){
    await page.setViewportSize({width,height:900});await page.goto('/kalkulator?cara=bersusun');
    await expect(page.getByRole('button',{name:'Bersusun',exact:true})).toHaveAttribute('aria-pressed','true');
    for(const [label,steps,name] of [['368 + 257',1,'carry'],['1000 − 278',3,'exchange'],['123 × 24',7,'multiply'],['1005 ÷ 5',5,'lower']] as const){
      await example(page,label);for(let i=0;i<steps;i++)await page.getByRole('button',{name:'Langkah berikut'}).press('Enter');
      await expect(page.getByLabel('Arti penanda')).toBeVisible();await expect(page.getByLabel('Bantuan langkah ini')).toBeVisible();
      await expect(page.locator('.column-arrow').first()).toBeVisible();await contrast(page);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${name} at ${width}`).toBe(true);
      const tracks=await page.locator('.column-stack').evaluate(stack=>{
        const svg=stack.querySelector('svg')!.getBoundingClientRect(),body=stack.querySelector('tbody')!.getBoundingClientRect();
        const firstCell=stack.querySelector('td')!.getBoundingClientRect();
        return {top:Math.abs(svg.top-body.top),height:Math.abs(svg.height-body.height),left:Math.abs(svg.left-firstCell.left)};
      });
      expect(tracks.top).toBeLessThan(3);expect(tracks.height).toBeLessThan(3);expect(tracks.left).toBeLessThan(3);
      await page.locator('.column-solution').screenshot({path:`test-results/column-visual-${name}-${width}.png`});
    }
  }
});

test('division keyboard steps preserve the zero and clearly show where a digit is lowered',async({page})=>{
  await page.goto('/kalkulator?cara=bersusun');await expect(page.getByRole('button',{name:'Bersusun',exact:true})).toHaveAttribute('aria-pressed','true');
  await example(page,'1005 ÷ 5');const next=page.getByRole('button',{name:'Langkah berikut'});
  for(const title of ['Baca bagian 1','Bagi bagian 10','Kalikan 5 dengan 2','Kurangi untuk menemukan sisa','Turunkan digit 0']){
    await next.press('Enter');await expect(page.getByTestId('column-step-title')).toHaveText(title);await expect(page.getByTestId('column-step-title')).toBeFocused();
  }
  await expect(page.locator('.column-row--result .column-digit')).toHaveText(['','2','','']);
  await expect(page.getByLabel('Bantuan langkah ini')).toContainText('Digit 0 turun ke kanan sisa sebelumnya');
  await next.press('Enter');await expect(page.locator('.column-row--result .column-digit')).toHaveText(['','2','0','']);
  await page.getByRole('button',{name:'Langkah sebelumnya'}).press('Enter');await expect(page.locator('.column-row--result .column-digit')).toHaveText(['','2','','']);
  await page.addStyleTag({content:'html {font-size:200%}'});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator('.column-solution').screenshot({path:'test-results/column-visual-lower-200.png'});
});
test('column diagrams fit mobile, large screens and 200% text with reduced motion',async({page})=>{
  test.setTimeout(120000);await page.emulateMedia({reducedMotion:'reduce'});
  for(const width of [320,375,414,768,1024,1440]){
    await page.setViewportSize({width,height:900});await page.goto('/bersusun');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`guide ${width}`).toBe(true);
    await page.screenshot({path:`test-results/column-guide-${width}.png`});
    if(width===375)for(const id of ['add','subtract','multiply','divide'])await page.locator(`#${id} .column-diagram`).screenshot({path:`test-results/column-guide-${id}.png`});
    await page.goto('/kalkulator?cara=bersusun');await expect(page.getByRole('button',{name:'Bersusun',exact:true})).toHaveAttribute('aria-pressed','true');
    await page.getByLabel('Bilangan pertama').fill('9999');await page.getByLabel('Operasi',{exact:true}).selectOption('multiply');await page.getByLabel('Bilangan kedua').fill('999');await page.getByRole('button',{name:'Hitung',exact:true}).press('Enter');await finish(page);
    await expect(page.getByTestId('calculator-result')).toContainText('9989001');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`seven digit ${width}`).toBe(true);
    for(const box of await page.locator('.calculator button,.calculator input,.calculator select').evaluateAll(els=>els.map(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height})))){expect(box.width).toBeGreaterThanOrEqual(44);expect(box.height).toBeGreaterThanOrEqual(44);}
    await expect(page.getByRole('button',{name:'Langkah sebelumnya'})).toHaveCSS('transition-duration','0s');await page.screenshot({path:`test-results/column-calculator-${width}.png`,fullPage:true});
  }
  await page.setViewportSize({width:375,height:900});await page.addStyleTag({content:'html {font-size:200%}'});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'calculator 200%').toBe(true);await page.screenshot({path:'test-results/column-calculator-200.png',fullPage:true});
  await page.goto('/bersusun');await page.addStyleTag({content:'html {font-size:200%}'});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'guide 200%').toBe(true);await page.screenshot({path:'test-results/column-guide-200.png'});
  await page.locator('#subtract .column-diagram').screenshot({path:'test-results/column-guide-borrow-200.png'});
});

import {test,expect} from '@playwright/test';
import {exercise,getExample} from '../../src/learning/visual-examples/engine';
test('discover, read CPA and complete a different example using keyboard',async({page})=>{
  const writes:string[]=[];page.on('request',r=>{if(r.method()!=='GET')writes.push(r.url());});
  await page.goto('/belajar');await page.getByRole('link',{name:'Contoh visual',exact:true}).press('Enter');
  await expect(page.getByLabel('Benda')).toBeEnabled();await page.getByLabel('Benda').selectOption('mangga');await page.getByLabel('Kelas',{exact:true}).selectOption('1');
  await expect(page.getByRole('status')).toHaveText(/4 contoh/);
  await page.locator('#menjumlah').getByRole('link',{name:/Mangga/}).press('Enter');
  await expect(page.getByRole('heading',{name:'1. Benda nyata'})).toBeVisible();await expect(page.getByRole('heading',{name:'3. Simbol dan langkah'})).toBeVisible();
  await page.getByRole('button',{name:'Coba latihan'}).press('Enter');await expect(page.getByRole('heading',{name:'Coba dengan bilangan berbeda'})).toBeFocused();
  const q=exercise(getExample('mangga-menjumlah'),0).question;
  await page.getByLabel('Jawaban bilangan').fill(String(q.expected));await page.getByLabel(q.reasons[q.correctReason]!).check();await page.getByRole('button',{name:'Periksa jawaban'}).press('Enter');
  await expect(page.getByTestId('example-feedback')).toContainText('Jawaban bilangan tepat. Alasan tepat.');expect(writes).toEqual([]);
  await page.getByRole('button',{name:'Latihan lain'}).click();await expect(page.getByLabel('Jawaban bilangan')).toHaveValue('');
});
test('interactive division conserves objects and accepts comma decimals',async({page})=>{
  await page.goto('/contoh/motor-pembagian');await page.getByRole('button',{name:'Coba latihan'}).click();
  const v=exercise(getExample('motor-pembagian'),0),total=v.question.model.values[0]!;
  for(let i=0;i<total;i++)await page.getByRole('button',{name:'Bagikan satu'}).press('Enter');
  await expect(page.getByRole('button',{name:'Bagikan satu'})).toBeDisabled();await expect(page.getByRole('status').filter({hasText:'belum dibagikan'})).toHaveText(`0 belum dibagikan. Isi kelompok: ${Array(v.divisionGroups).fill(v.question.expected).join(', ')}.`);
  await page.goto('/contoh/semangka-desimal');await page.getByRole('button',{name:'Coba latihan'}).click();const q=exercise(getExample('semangka-desimal'),0).question;
  await page.getByLabel('Jawaban bilangan').fill(String(q.expected).replace('.',','));await page.getByLabel(q.reasons[q.correctReason]!).check();await page.getByRole('button',{name:'Periksa jawaban'}).click();await expect(page.getByTestId('example-feedback')).toContainText('Alasan tepat.');
});
test('responsive catalogue and pictures support reduced motion and enlarged text',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const width of [320,375,414,768,1024,1440]){
    await page.setViewportSize({width,height:900});
    for(const route of ['/contoh','/contoh/mobil-nilai-tempat','/contoh/semangka-pecahan-senilai','/contoh/mangga-perbandingan']){
      await page.goto(route);await expect(page.locator('h1')).toBeVisible();
      const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));expect(size.scroll,`${route} at ${width}`).toBeLessThanOrEqual(size.width);
      if([375,768,1440].includes(width)&&(route==='/contoh'||route==='/contoh/semangka-pecahan-senilai'))await page.screenshot({path:`test-results/visual-${route==='/contoh'?'catalogue':'fraction'}-${width}.png`,fullPage:true});
    }
  }
  await page.setViewportSize({width:375,height:900});await page.goto('/contoh/mobil-menjumlah');await page.getByRole('button',{name:'Coba latihan'}).click();
  await page.locator('.example-unit').first().press('Enter');await expect(page.locator('.example-unit').first()).toHaveAttribute('aria-pressed','true');
  const button=await page.locator('.example-unit').first().boundingBox();expect(button!.width).toBeGreaterThanOrEqual(44);expect(button!.height).toBeGreaterThanOrEqual(44);
  expect(await page.locator('.example-unit').first().evaluate(el=>getComputedStyle(el).transitionDuration)).toBe('0s');
  await page.evaluate(()=>document.documentElement.style.fontSize='200%');expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  await page.evaluate(()=>document.documentElement.style.fontSize='');await page.screenshot({path:'test-results/visual-example-mobile.png',fullPage:true});
});
test('worked explanations remain available without JavaScript',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto('http://127.0.0.1:4407/contoh/stroberi-menjumlah');
  await expect(page.getByRole('heading',{name:'3. Simbol dan langkah'})).toBeVisible();await expect(page.getByRole('button',{name:'Coba latihan'})).toBeDisabled();await context.close();
});

test('visual example text retains contrast in worked, error, hint and checked states',async({page})=>{
  const check=async()=>{
    const ratios=await page.locator('.visual-example p,.visual-example h2,.visual-example h3,.visual-example button,.visual-example label,.visual-example legend,.visual-example input,.visual-example li,.visual-example a').evaluateAll(elements=>{
      const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d',{willReadFrequently:true})!;
      const rgb=(color:string)=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data];};
      const lum=(v:number[])=>v.slice(0,3).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((n,x,i)=>n+x*([.2126,.7152,.0722][i]??0),0);
      return elements.filter(el=>el.getBoundingClientRect().height>0).map(el=>{let node:Element|null=el,bg=[255,255,255,255];while(node){const color=rgb(getComputedStyle(node).backgroundColor);if(color[3]===255){bg=color;break;}node=node.parentElement;}const a=lum(rgb(getComputedStyle(el).color)),b=lum(bg);return {label:el.textContent,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});
    });
    for(const {label,ratio} of ratios)expect(ratio,label??'visual control').toBeGreaterThanOrEqual(4.5);
  };
  await page.goto('/contoh/stroberi-menjumlah');await expect(page.getByRole('button',{name:'Coba latihan'})).toBeEnabled();await check();
  await page.getByRole('button',{name:'Coba latihan'}).hover();await check();await page.getByRole('button',{name:'Coba latihan'}).click();
  await page.getByRole('button',{name:'Periksa jawaban'}).click();await check();await page.getByRole('button',{name:'Petunjuk',exact:true}).click();await check();
  const q=exercise(getExample('stroberi-menjumlah'),0).question;await page.getByLabel('Jawaban bilangan').fill(String(q.expected));await page.getByLabel(q.reasons[q.correctReason]!).check();await page.getByRole('button',{name:'Periksa jawaban'}).click();await check();
});

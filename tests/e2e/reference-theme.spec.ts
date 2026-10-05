import {test,expect} from "@playwright/test";

test("reference theme preserves readable foregrounds, focus and mathematical counts",async({page})=>{
  await page.goto('/');
  await expect(page.locator('.math-preview .preview-dot')).toHaveCount(10); // 3 + 2, and the same 5 together.
  await expect(page.getByRole('figure')).toContainText('3 benda dan 2 benda menjadi 5.');
  await expect(page.locator('.brand')).toHaveCSS('font-family',/Nunito/);
  const selectors=['body','.brand','.page-heading h1','.page-heading .muted','.home-intro .button','.site-header nav a','.site-footer a','.site-footer__brand'];
  for(const selector of selectors){
    const contrasts=await page.locator(selector).evaluateAll(elements=>{
      const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d',{willReadFrequently:true})!;
      const rgb=(value:string)=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=value;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data];};
      const luminance=(values:number[])=>values.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*([.2126,.7152,.0722][i]??0),0);
      return elements.map(el=>{
        let node:Element|null=el;let background=[255,255,255,255];
        while(node){const current=rgb(getComputedStyle(node).backgroundColor);if(current[3]===255){background=current;break;}node=node.parentElement;}
        const foreground=rgb(getComputedStyle(el).color);const a=luminance(foreground),b=luminance(background);
        return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
      });
    });
    for(const contrast of contrasts)expect(contrast,selector).toBeGreaterThanOrEqual(4.5);
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  const start=page.getByRole('link',{name:'Mulai belajar',exact:true});await start.focus();
  await expect(start).toHaveCSS('outline-style','solid');await expect(start).toHaveCSS('outline-width','3px');
  await expect(start).toHaveCSS('transition-duration','0s');
  await start.press('Enter');await expect(page).toHaveURL(/\/belajar\/?$/);
  await page.goto('/daftar');await expect(page.getByRole('checkbox',{name:/Saya pendamping dewasa/})).toBeVisible();
  await page.getByRole('checkbox',{name:'Tampilkan kata sandi'}).check();await expect(page.getByLabel('Kata sandi',{exact:true})).toHaveAttribute('type','text');
});

test("shared theme leaves public pages and all existing labs usable on narrow screens",async({page})=>{
  test.setTimeout(120000);
  for(const width of [320,375,414,768,1024,1440]){
    await page.setViewportSize({width,height:900});
    for(const route of ['/panduan','/masuk','/progres','/keluarga','/belajar/kelas-6','/lab/ten-frame','/lab/number-line','/lab/symbolic-addition','/lab/story-problem','/lab/explain-strategy','/lab/transfer','/lab/place-value']){
      await page.goto(route);await expect(page.getByRole('heading',{level:1})).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),`${route} at ${width}`).toBe(true);
    }
  }
});

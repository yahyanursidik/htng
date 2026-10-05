import {test,expect} from "@playwright/test";
import {games,generateChallenge} from "../../src/learning/cpa/engine";
import {lessons} from "../../src/learning/curriculum/catalog";

test("CPA keyboard happy path preserves model, records a reason retry and reopens help",async({page})=>{
  await page.goto('/cpa/gabungkan');await expect(page.getByRole('button',{name:'Periksa susunan'})).toBeVisible();
  // SSR controls are visible before Preact attaches their event handlers.
  await expect(page.locator('astro-island').filter({has:page.getByRole('region',{name:'Permainan CPA'})})).not.toHaveAttribute('ssr','');
  for(const name of ['Tambah ke Awal','Tambah ke Datang']){const button=page.getByRole('button',{name,exact:true});await button.focus();await expect(button).toHaveCSS('outline-width','3px');await button.press('Enter');await button.press('Space');}
  await page.getByRole('button',{name:'Periksa susunan'}).click();await expect(page.getByRole('status').filter({hasText:'Susunannya sesuai'})).toBeVisible();
  await page.getByRole('button',{name:'Gambar',exact:true}).click();await expect(page.getByRole('heading',{name:'P — Hubungkan dengan gambar'})).toBeFocused();await expect(page.getByRole('figure')).toContainText('Awal: 2; Datang: 2');
  await page.getByRole('button',{name:'Simbol',exact:true}).click();await expect(page.getByRole('figure')).toHaveCount(0);
  const q=generateChallenge('gabungkan',0);await page.getByLabel('Jawaban',{exact:true}).fill('4');await page.getByRole('radio',{name:q.reasons[1]!,exact:true}).check();await page.getByRole('button',{name:'Periksa simbol dan alasan'}).click();await expect(page.getByText(/Angkanya tepat/)).toBeVisible();
  await page.getByRole('radio',{name:q.reasons[0]!,exact:true}).check();await page.getByRole('button',{name:'Periksa simbol dan alasan'}).click();await expect(page.getByText(/^Ya\./)).toBeVisible();
  await page.getByRole('button',{name:'Tampilkan gambar bantuan',exact:true}).click();await expect(page.getByRole('figure')).toContainText('Awal: 2; Datang: 2');
  await page.getByText('Catatan CPA di perangkat ini (3)',{exact:true}).click();await expect(page.getByText(/Terpisah dari profil akun/)).toBeVisible();
  await page.getByRole('button',{name:'Contoh berikutnya'}).click();await expect(page.getByRole('heading',{name:'C — Coba dengan benda'})).toBeFocused();await expect(page.getByText(/Contoh 2\./)).toBeVisible();
  await page.reload();await expect(page.getByText('Catatan CPA di perangkat ini (3)',{exact:true})).toBeVisible();
});

test("all CPA games remain accessible and responsive with reduced motion",async({page})=>{
  test.setTimeout(180000);await page.emulateMedia({reducedMotion:'reduce'});
  for(const width of [320,375,414,768,1024,1440]){
    await page.setViewportSize({width,height:900});await page.goto('/cpa');await expect(page.getByRole('link',{name:'Mainkan konsep',exact:true})).toHaveCount(14);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    for(const game of games){await page.goto(`/cpa/${game.id}`);await expect(page.getByRole('button',{name:'Periksa susunan'})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${game.id} C ${width}`).toBe(true);
      await expect(page.locator('astro-island').filter({has:page.getByRole('region',{name:'Permainan CPA'})})).not.toHaveAttribute('ssr','');
      if(game.id==='desimal'){const bounds=await page.getByRole('button',{name:'Unit 1',exact:true}).boundingBox();expect(bounds!.width).toBeGreaterThanOrEqual(44);expect(bounds!.height).toBeGreaterThanOrEqual(44);}
      await page.getByRole('button',{name:'Gambar',exact:true}).click();await expect(page.getByRole('heading',{name:'P — Hubungkan dengan gambar'})).toBeFocused();await expect(page.getByRole('figure')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${game.id} P ${width}`).toBe(true);
      await page.getByRole('button',{name:'Simbol',exact:true}).click();await expect(page.getByLabel('Jawaban',{exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${game.id} A ${width}`).toBe(true);await expect(page.getByRole('button',{name:'Petunjuk 0/3'})).toHaveCSS('transition-duration','0s');
    }
  }
});

test("CPA is discoverable and every existing lesson has a worked physical-picture-symbol example",async({page})=>{
  test.setTimeout(90000);await page.goto('/');await page.getByRole('navigation',{name:'Navigasi utama'}).getByRole('link',{name:'CPA',exact:true}).click();await expect(page).toHaveURL(/\/cpa\/?$/);
  for(const lesson of lessons){await page.goto(`/belajar/${lesson.id}#contoh-cpa`);await page.getByText('Contoh CPA: benda → gambar → simbol',{exact:true}).click();await expect(page.getByRole('heading',{name:'C — Benda nyata'})).toBeVisible();await expect(page.getByRole('heading',{name:'P — Gambar'})).toBeVisible();await expect(page.getByRole('heading',{name:'A — Simbol dan alasan'})).toBeVisible();await expect(page.locator('#contoh-cpa figure').first()).toBeVisible();}
});

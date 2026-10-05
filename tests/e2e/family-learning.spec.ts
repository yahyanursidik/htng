import { test,expect } from "@playwright/test";
import { lessons } from "../../src/learning/curriculum/catalog";
test("parent registers, creates profile, learns, sees progress, logs out and logs in",async({page})=>{
  const email=`parent-${Date.now()}@example.test`;const password="frasa kata sandi keluarga yang panjang";
  await page.goto('/daftar');await page.getByLabel('Nama pendamping').fill('Pendamping');await page.getByLabel('Email pendamping').fill(email);await page.getByLabel('Kata sandi',{exact:true}).fill(password);await page.getByLabel('Ulangi kata sandi').fill(password);await page.getByRole('checkbox',{name:/Saya pendamping dewasa/}).check();await page.getByRole('button',{name:'Buat akun',exact:true}).click();await expect(page).toHaveURL(/\/keluarga\/?$/);
  await page.getByLabel('Nama panggilan').fill('Anak');await page.getByLabel('Kelas',{exact:true}).selectOption('3');await page.getByRole('button',{name:'Tambah profil',exact:true}).click();await expect(page.getByRole('heading',{name:'Anak',exact:true})).toBeVisible();await page.getByRole('button',{name:'Belajar',exact:true}).click();await expect(page).toHaveURL(/kelas-3/);
  await page.getByRole('link',{name:'Mulai belajar'}).first().click();await expect(page.getByText('Belajar sebagai Anak')).toBeVisible();
  const prompt=await page.getByRole('heading',{level:2}).first().textContent();const values=prompt!.match(/\d+/g)!.map(Number);const expected=values[0]!*values[1]!;
  await page.getByLabel('Jawaban',{exact:true}).fill(String(expected));await page.getByRole('radio',{name:'Isi tiap kelompok dijumlahkan sebanyak jumlah kelompok.'}).check();await page.getByRole('button',{name:'Periksa jawaban'}).click();await expect(page.getByText('Catatan tersimpan untuk Anak.')).toBeVisible();await expect(page.getByText(/^Ya\./)).toBeVisible();
  await page.getByRole('link',{name:'Catatan',exact:true}).click();await expect(page.getByText(/1 soal berbeda · 1 dengan jawaban dan alasan tepat/)).toBeVisible();
  await page.getByRole('link',{name:'Keluarga saya'}).click();await page.getByRole('button',{name:'Keluar',exact:true}).click();await expect(page).toHaveURL(/\/$/);await page.goto('/masuk');await page.getByLabel('Email pendamping').fill(email);await page.getByLabel('Kata sandi',{exact:true}).fill(password);await page.getByRole('button',{name:'Masuk',exact:true}).click();await expect(page).toHaveURL(/\/keluarga\/?$/);await expect(page.getByRole('heading',{name:'Anak',exact:true})).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button',{name:'Unduh data keluarga'}).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('catatan-pahamhitung.json');
});
test("guest can finish five questions with keyboard and has separate local evidence",async({page})=>{
  await page.goto('/belajar/menghitung');await expect(page.getByText(/Mode tamu/)).toBeVisible();
  for(let round=0;round<5;round++){
    if(round>=2)await page.getByRole('button',{name:'Tampilkan model'}).click();
    const counters=page.getByRole('button',{name:/^Benda \d/});const count=await counters.count();await counters.first().focus();await page.keyboard.press('Enter');await expect(counters.first()).toHaveAttribute('aria-pressed','true');
    await page.getByLabel('Jawaban',{exact:true}).fill(String(count));await page.getByRole('radio',{name:'Setiap benda dihitung satu kali.'}).check();await page.getByRole('button',{name:'Periksa jawaban'}).click();await expect(page.getByText(/^Ya\./)).toBeVisible();await page.getByRole('button',{name:round===4?'Selesaikan sesi':'Soal berikutnya'}).click();
  }
  await expect(page.getByRole('heading',{name:'Sesi selesai'})).toBeVisible();await expect(page.getByText(/5 dari 5 soal/)).toBeVisible();await page.getByRole('link',{name:'Catatan belajar',exact:true}).click();await expect(page.getByText(/5 soal berbeda/)).toBeVisible();
});
test("all grade lesson routes render models and responsive accessible controls",async({page})=>{
  for(const width of [320,375,414,768,1024,1440]){
    await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await expect(page.getByRole('heading',{level:1})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
    await page.goto('/daftar');await expect(page.getByLabel('Nama pendamping')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
    await page.goto('/belajar/volume');await expect(page.getByText(/Mode tamu/)).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await expect(page.getByRole('button',{name:'Periksa jawaban'})).toBeVisible();
  }
  for(const grade of [1,2,3,4,5,6]){await page.goto(`/belajar/kelas-${grade}`);await expect(page.getByRole('link',{name:'Mulai belajar'})).toHaveCount(5);}
});
test("every implemented lesson hydrates with answer, model and reasoning",async({page})=>{
  test.setTimeout(60000);
  for(const lesson of lessons){await page.goto(`/belajar/${lesson.id}`);await expect(page.getByText(/Mode tamu/)).toBeVisible();await expect(page.getByRole('heading',{level:1})).toHaveText(lesson.title);await expect(page.getByRole('radio')).toHaveCount(3);await expect(page.getByRole('figure')).toBeVisible();await expect(page.getByRole('textbox',{name:/Jawaban/})).toBeVisible();}
});

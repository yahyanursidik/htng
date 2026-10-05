import { createApp } from './app.mjs';
const port=Number(process.env.PORT ?? 4322);
const origin=process.env.APP_ORIGIN ?? `http://127.0.0.1:${port}`;
const server=await createApp({origin,production:process.env.NODE_ENV==='production',database:process.env.DATABASE_PATH});
server.listen(port,process.env.HOST??'127.0.0.1',()=>console.log(`PahamHitung siap di ${origin}`));
for(const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close(()=>process.exit(0)));

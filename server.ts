// Жергілікті әзірлеу сервері (npm run dev). Vercel-де қолданылмайды — ол api/index.ts-ті пайдаланады.
import dotenv from 'dotenv';
dotenv.config({ path: ['.env.local', '.env'] });

const { default: app } = await import('./api/index.ts');
const { createServer } = await import('vite');

const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
app.use(vite.middlewares);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Smart Library: http://localhost:${PORT}`));

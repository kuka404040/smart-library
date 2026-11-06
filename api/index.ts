import express, { Request, Response, NextFunction } from 'express';
import { neon } from '@neondatabase/serverless';
import crypto from 'node:crypto';

const app = express();
app.use(express.json());

// ================= CONFIG =================
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const AUTH_SECRET = process.env.AUTH_SECRET || ADMIN_PASSWORD;
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 сағат

if (!process.env.DATABASE_URL) console.warn('DATABASE_URL орнатылмаған!');
const sql = neon(process.env.DATABASE_URL || '');

// Қысқа алиас: параметрлі сұраныс -> қатарлар массиві
const q = async (text: string, params: any[] = []): Promise<any[]> =>
  (await sql.query(text, params)) as any[];

// ================= STATELESS AUTH (serverless-қа сай) =================
function signToken(): string {
  const exp = Date.now() + TOKEN_TTL_MS;
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(String(exp)).digest('hex');
  return `${exp}.${sig}`;
}

function verifyToken(token: string): boolean {
  if (!AUTH_SECRET) return false;
  const [expStr, sig] = token.split('.');
  const exp = Number(expStr);
  if (!exp || !sig || exp < Date.now()) return false;
  const expected = crypto.createHmac('sha256', AUTH_SECRET).update(expStr).digest('hex');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function requireLibrarianAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Кітапханашы рұқсаты талап етіледі (Unauthorized)' });
    return;
  }
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!verifyToken(token)) {
    res.status(401).json({ error: 'Қате немесе ескірген токен' });
    return;
  }
  next();
}

// ================= DATABASE INIT + SEED =================
const initialSeedBooks: any[][] = [
  [
    'Python тілінде бағдарламалау негіздері',
    'А. Е. Серікбаев, Н. О. Жұмаділова',
    'Бағдарламалау және алгоритмдер',
    'Ақпараттық технологиялар',
    1,
    'special',
    40,
    38,
    'Python 3 тілінің синтаксисі, алгоритмдік құрылымдар, деректер құрылымы, модульдер және объектіге бағытталған бағдарламалау негіздері. Колледж студенттеріне арналған.',
    'navy',
    '978-601-240-101-2',
  ],
  [
    'Қазақстанның қазіргі заман тарихы',
    'Қ. С. Қаражанов, Б. Т. Төлебаев',
    'Қазақстан тарихы',
    'Гуманитарлық және әлеуметтік',
    1,
    'general',
    50,
    45,
    'Қазақстанның мемлекеттілік қалыптасуы, Тәуелсіздік кезеңі, әлеуметтік-экономикалық және мәдени даму тарихына арналған академиялық оқулық.',
    'gold',
    '978-601-310-442-1',
  ],
  [
    'Деректер қорын жобалау және SQL тілі',
    'М. Қ. Оразалиев, Г. Б. Сәрсенбаева',
    'Деректер қоры және SQL',
    'Ақпараттық технологиялар',
    2,
    'special',
    35,
    32,
    'Реляциялық деректер қорын нормализациялау, ER-диаграммалар, PostgreSQL мен SQLite-те күрделі сұраныстар мен индекстер құру тәжірибесі.',
    'emerald',
    '978-601-722-890-4',
  ],
  [
    'Компьютерлік архитектура және микропроцессорлар',
    'Д. А. Паттерсон, Дж. Л. Хеннесси',
    'Компьютерлік архитектура және аппараттық қамтамасыз ету',
    'Инженерлік-техникалық',
    2,
    'special',
    30,
    28,
    'Компьютер құрылғысы, процессор архитектурасы (RISC/CISC, ARM), жедел жад, кэш-жады деңгейлері және перифериялық шиналардың өзара байланысы.',
    'indigo',
    '978-601-815-320-7',
  ],
  [
    'Жоғары математика: Сызықтық алгебра және анализ',
    'С. Т. Төлеуов, Р. М. Мұхтаров',
    'Жоғары математика және дискретті математика',
    'Жаратылыстану ғылымдары',
    1,
    'general',
    60,
    52,
    'Матрицалар мен анықтауыштар, сызықтық теңдеулер жүйесі, шектер теориясы, дифференциалдық және интегралдық есептеулер.',
    'crimson',
    '978-601-204-712-9',
  ],
  [
    'Компьютерлік желілер: CISCO және TCP/IP негіздері',
    'Э. Таненбаум, Д. Уэзеролл',
    'Компьютерлік желілер және қауіпсіздік',
    'Ақпараттық технологиялар',
    3,
    'special',
    25,
    20,
    'OSI 7 деңгейлі моделі, TCP/IP стектері, маршруттау хаттамалары (OSPF, BGP), VLAN және желілік қауіпсіздік саясаты.',
    'amber',
    '978-601-332-901-5',
  ],
  [
    'Веб-қосымшаларды әзірлеу: React, TypeScript және Node.js',
    'Б. К. Баймұхамедов, Ш. Н. Искакова',
    'Веб-технологиялар және интерфейс әзірлеу',
    'Ақпараттық технологиялар',
    3,
    'special',
    30,
    26,
    'Заманауи фронтенд архитектурасы, компоненттік стиль, REST API интеграциясы, күйді басқару және full-stack қосымшалар құру.',
    'navy',
    '978-601-540-331-6',
  ],
  [
    'Инженерлік физика және қолданбалы электроника',
    'М. Т. Садықов, К. А. Әбішев',
    'Физика және электротехника',
    'Жаратылыстану ғылымдары',
    2,
    'general',
    40,
    34,
    'Электромагнетизм, жартылай өткізгіш аспаптар, диодтар, транзисторлар және микроэлектрондық сұлбалардың физикалық негіздері.',
    'emerald',
    '978-601-654-119-0',
  ],
  [
    'Кәсіпкерлік қызмет және экономика негіздері',
    'Ж. А. Омарова, Б. Н. Нұрпейісов',
    'Экономика және кәсіпкерлік негіздері',
    'Экономика және менеджмент',
    4,
    'general',
    35,
    31,
    'Бизнес-жоспарлау, стартаптарды қаржыландыру, маркетингтік стратегия және еңбек нарығындағы бәсекеге қабілеттілік.',
    'gold',
    '978-601-445-982-3',
  ],
  [
    'Ақпараттық қауіпсіздік және криптография негіздері',
    'А. С. Әлімжанов',
    'Ақпараттық қауіпсіздік',
    'Ақпараттық технологиялар',
    4,
    'special',
    25,
    22,
    'Шифрлау алгоритмдері (AES, RSA), электрондық цифрлық қолтаңба, осалдықтарды талдау және ақпараттық инфрақұрылымды қорғау.',
    'indigo',
    '978-601-998-120-4',
  ],
];

let initPromise: Promise<void> | null = null;

async function initDb() {
  await q(`
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      subject TEXT NOT NULL,
      category TEXT NOT NULL,
      course INTEGER NOT NULL DEFAULT 1,
      book_type TEXT NOT NULL DEFAULT 'special',
      total_copies INTEGER NOT NULL DEFAULT 30,
      available_copies INTEGER NOT NULL DEFAULT 30,
      description TEXT,
      cover_color TEXT DEFAULT 'navy',
      cover_url TEXT,
      isbn TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    )`);
  await q(`
    CREATE TABLE IF NOT EXISTS issues (
      id SERIAL PRIMARY KEY,
      book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      course INTEGER NOT NULL,
      group_name TEXT NOT NULL,
      head_name TEXT,
      quantity INTEGER NOT NULL,
      returned_quantity INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      issue_date TIMESTAMPTZ DEFAULT now(),
      return_date TIMESTAMPTZ,
      notes TEXT
    )`);

  const [{ cnt }] = await q('SELECT COUNT(*)::int AS cnt FROM books');
  if (cnt === 0) {
    for (const b of initialSeedBooks) {
      await q(
        `INSERT INTO books (title, author, subject, category, course, book_type, total_copies, available_copies, description, cover_color, isbn)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        b
      );
    }
    const day = 86400000;
    const seedIssues = [
      [1, 1, 'ПБ-11', 'Қайрат Асылбекұлы', 25, 23, 'partial', new Date(Date.now() - 5 * day).toISOString(), 'Оқу семестріне берілді (2 кітап қарызда)'],
      [2, 1, 'БҚЕ-11', 'Әлихан Нұрлан', 5, 0, 'active', new Date(Date.now() - 2 * day).toISOString(), 'Тарих сабағына'],
      [3, 2, 'ПР-22', 'Диана Маратқызы', 10, 10, 'returned', new Date(Date.now() - 14 * day).toISOString(), 'Зертханалық жұмысқа толық қайтарылды'],
    ];
    for (const i of seedIssues) {
      await q(
        `INSERT INTO issues (book_id, course, group_name, head_name, quantity, returned_quantity, status, issue_date, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        i
      );
    }
  }
}

// Әр сұраныста схеманың дайын екенін бір рет тексереді
app.use('/api', async (_req, res, next) => {
  try {
    initPromise ??= initDb().catch((e) => {
      initPromise = null;
      throw e;
    });
    await initPromise;
    next();
  } catch (e) {
    console.error('DB init error:', e);
    res.status(500).json({ error: 'Деректер қорына қосылу қатесі' });
  }
});

// ================= API ROUTES =================

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { password } = req.body || {};
  if (!password) {
    res.status(400).json({ error: 'Құпиясөзді енгізіңіз' });
    return;
  }
  if (!ADMIN_PASSWORD) {
    res.status(500).json({ error: 'ADMIN_PASSWORD серверде орнатылмаған' });
    return;
  }
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: signToken(), librarian: true });
  } else {
    res.status(401).json({ error: 'Құпиясөз қате!' });
  }
});

app.get('/api/books', async (_req, res) => {
  const books = await q('SELECT * FROM books ORDER BY id DESC');
  res.json({ books });
});

app.get('/api/books/:id', async (req, res) => {
  const [book] = await q('SELECT * FROM books WHERE id = $1', [req.params.id]);
  if (!book) {
    res.status(404).json({ error: 'Кітап табылмады' });
    return;
  }
  res.json({ book });
});

app.post('/api/books', requireLibrarianAuth, async (req, res) => {
  const { title, author, subject, category, course, book_type, total_copies, description, cover_color, cover_url, isbn } = req.body;

  if (!title || !author) {
    res.status(400).json({ error: 'Атауы мен авторы толтырылуы тиіс' });
    return;
  }

  const copies = parseInt(total_copies) || 1;
  const [newBook] = await q(
    `INSERT INTO books (title, author, subject, category, course, book_type, total_copies, available_copies, description, cover_color, cover_url, isbn)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [
      title,
      author,
      subject || 'Жалпы білім',
      category || 'Ақпараттық технологиялар',
      parseInt(course) || 1,
      book_type || 'special',
      copies,
      copies,
      description || '',
      cover_color || 'navy',
      cover_url || null,
      isbn || null,
    ]
  );
  res.status(201).json({ success: true, book: newBook });
});

app.put('/api/books/:id', requireLibrarianAuth, async (req, res) => {
  const { title, author, subject, category, course, book_type, total_copies, description, cover_color, cover_url, isbn } = req.body;

  const [currentBook] = await q('SELECT * FROM books WHERE id = $1', [req.params.id]);
  if (!currentBook) {
    res.status(404).json({ error: 'Кітап табылмады' });
    return;
  }

  const newTotal = parseInt(total_copies) || currentBook.total_copies;
  const issued = currentBook.total_copies - currentBook.available_copies;
  const newAvailable = Math.max(0, newTotal - issued);
  const parsedCourse = parseInt(course);

  const [updatedBook] = await q(
    `UPDATE books
     SET title=$1, author=$2, subject=$3, category=$4, course=$5, book_type=$6,
         total_copies=$7, available_copies=$8, description=$9, cover_color=$10, cover_url=$11, isbn=$12
     WHERE id=$13 RETURNING *`,
    [
      title || currentBook.title,
      author || currentBook.author,
      subject || currentBook.subject,
      category || currentBook.category,
      Number.isNaN(parsedCourse) ? currentBook.course : parsedCourse,
      book_type || currentBook.book_type,
      newTotal,
      newAvailable,
      description !== undefined ? description : currentBook.description,
      cover_color || currentBook.cover_color,
      cover_url !== undefined ? cover_url : currentBook.cover_url,
      isbn !== undefined ? isbn : currentBook.isbn,
      req.params.id,
    ]
  );
  res.json({ success: true, book: updatedBook });
});

app.delete('/api/books/:id', requireLibrarianAuth, async (req, res) => {
  const rows = await q('DELETE FROM books WHERE id = $1 RETURNING id', [req.params.id]);
  if (rows.length === 0) {
    res.status(404).json({ error: 'Кітап табылмады' });
    return;
  }
  res.json({ success: true, message: 'Кітап жойылды' });
});

// Кітап беру — бір атомарлы SQL (қор тексеру + азайту + жазба)
app.post('/api/issue', requireLibrarianAuth, async (req, res) => {
  const { book_id, course, group_name, head_name, quantity, notes } = req.body;
  const qty = parseInt(quantity);
  if (!book_id || !group_name || isNaN(qty) || qty <= 0) {
    res.status(400).json({ error: 'Барлық өрістерді дұрыс толтырыңыз' });
    return;
  }

  const [book] = await q('SELECT * FROM books WHERE id = $1', [book_id]);
  if (!book) {
    res.status(404).json({ error: 'Кітап табылмады' });
    return;
  }

  const rows = await q(
    `WITH upd AS (
       UPDATE books SET available_copies = available_copies - $1::int
       WHERE id = $2 AND available_copies >= $1::int
       RETURNING id
     )
     INSERT INTO issues (book_id, course, group_name, head_name, quantity, returned_quantity, status, issue_date, notes)
     SELECT id, $3::int, $4, $5, $1::int, 0, 'active', now(), $6 FROM upd
     RETURNING id`,
    [qty, book_id, parseInt(course) || 1, group_name, head_name || null, notes || null]
  );

  if (rows.length === 0) {
    res.status(400).json({
      error: `Қорда жеткілікті кітап жоқ! Қолжетімді: ${book.available_copies} дана`,
    });
    return;
  }
  res.status(201).json({ success: true, issue_id: rows[0].id });
});

// Қайтару (ішінара қайтаруды қолдайды) — бір атомарлы SQL
app.post('/api/return', requireLibrarianAuth, async (req, res) => {
  const { issue_id, return_quantity } = req.body;
  const qty = parseInt(return_quantity);

  if (!issue_id || isNaN(qty) || qty <= 0) {
    res.status(400).json({ error: 'Қайтарылатын дана санын көрсетіңіз' });
    return;
  }

  const [issue] = await q('SELECT * FROM issues WHERE id = $1', [issue_id]);
  if (!issue) {
    res.status(404).json({ error: 'Берілім жазбасы табылмады' });
    return;
  }

  const remaining = issue.quantity - issue.returned_quantity;
  if (qty > remaining) {
    res.status(400).json({
      error: `Қайтарылатын сан қарыздан (${remaining} дана) көп болмауы керек!`,
    });
    return;
  }

  const rows = await q(
    `WITH u AS (
       UPDATE issues
       SET returned_quantity = returned_quantity + $1::int,
           status = CASE WHEN returned_quantity + $1::int >= quantity THEN 'returned' ELSE 'partial' END,
           return_date = now()
       WHERE id = $2 AND quantity - returned_quantity >= $1::int
       RETURNING book_id, status, quantity, returned_quantity
     ), b AS (
       UPDATE books SET available_copies = available_copies + $1::int
       WHERE id IN (SELECT book_id FROM u)
       RETURNING id
     )
     SELECT status, quantity, returned_quantity FROM u`,
    [qty, issue_id]
  );

  if (rows.length === 0) {
    res.status(409).json({ error: 'Жазба өзгерген, қайта көріп шығыңыз' });
    return;
  }
  const r = rows[0];
  res.json({
    success: true,
    newStatus: r.status,
    returnedNow: qty,
    stillRemaining: r.quantity - r.returned_quantity,
  });
});

app.get('/api/history', async (req, res) => {
  const activeOnly = req.query.activeOnly === 'true';
  const issues = await q(`
    SELECT i.*, b.title AS book_title, b.author AS book_author
    FROM issues i
    JOIN books b ON i.book_id = b.id
    ${activeOnly ? "WHERE i.status IN ('active', 'partial')" : ''}
    ORDER BY i.id DESC
  `);
  res.json({ issues });
});

app.get('/api/stats', async (_req, res) => {
  const [booksStats] = await q(`
    SELECT COUNT(*)::int AS "totalBooks",
           COALESCE(SUM(total_copies),0)::int AS "totalCopies",
           COALESCE(SUM(available_copies),0)::int AS "availableCopies"
    FROM books`);
  const [issueStats] = await q(`
    SELECT COUNT(DISTINCT group_name)::int AS "activeGroups",
           COUNT(*)::int AS "activeIssues",
           COALESCE(SUM(quantity - returned_quantity),0)::int AS "totalIssuedCopies"
    FROM issues WHERE status IN ('active', 'partial')`);
  res.json({ ...booksStats, ...issueStats });
});


// ================= GEMINI AI SMART SEARCH =================

app.post('/api/ai-search', async (req: Request, res: Response) => {
  try {
    const userQuery = req.body?.query;

    if (
      typeof userQuery !== 'string' ||
      !userQuery.trim()
    ) {
      res.json({ engine: 'gemini', results: [] });
      return;
    }

    const cleanQuery = userQuery.trim().slice(0, 500);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      res.status(503).json({
        error: 'GEMINI_API_KEY серверде орнатылмаған',
      });
      return;
    }

    // Кітаптарды тек нақты деректер қорынан аламыз
    const allBooks = await q(
      'SELECT * FROM books ORDER BY id DESC LIMIT 500'
    );

    if (allBooks.length === 0) {
      res.json({ engine: 'gemini', results: [] });
      return;
    }

    // Gemini-ге кітапхана каталогын береміз
    const catalogue = allBooks.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      subject: book.subject,
      category: book.category,
      course: book.course,
      description: book.description || '',
    }));

    const prompt = `
Сен колледждің цифрлық кітапханасындағы AI көмекшісісің.

Студенттің сұранысына сәйкес кітаптарды каталогтан таңда.

СТУДЕНТ СҰРАНЫСЫ:
${cleanQuery}

КІТАПХАНА КАТАЛОГЫ:
${JSON.stringify(catalogue)}

ЕРЕЖЕЛЕР:
1. Тек берілген каталогтағы кітаптарды таңда.
2. Кітаптың атауын немесе авторын ойдан шығарма.
3. Сұраныстың мағынасын түсін. Қазақша және орысша сұраныстарды түсін.
4. Тек тақырыпқа шынымен сәйкес кітаптарды таңда.
5. Ең көбі 6 кітап қайтар.
6. score мәні 0 мен 1 аралығында болсын.
7. Сәйкестігі төмен кітаптарды қоспа.
8. explanation_kk және explanation_ru өрістерінде кітаптың неге сәйкес келетінін қысқаша түсіндір.
9. Егер сәйкес кітап болмаса, бос results массивін қайтар.

ЖАУАП ТЕК JSON ФОРМАТЫНДА БОЛСЫН:
{
  "results": [
    {
      "id": 1,
      "score": 0.95,
      "explanation_kk": "Кітап сұранысқа сәйкес келеді.",
      "explanation_ru": "Книга соответствует запросу."
    }
  ]
}
`;

    const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            maxOutputTokens: 2048,
          },
        }),
        signal: AbortSignal.timeout(25000),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errorText);

      res.status(502).json({
        error: 'Gemini AI қызметіне қосылу мүмкін болмады',
      });
      return;
    }

    const geminiData = await geminiResponse.json();

    const responseText =
      geminiData.candidates?.[0]?.content?.parts
        ?.map((part: any) => part.text || '')
        .join('') || '';

    if (!responseText) {
      res.json({ engine: 'gemini', results: [] });
      return;
    }

    const aiData = JSON.parse(responseText);
    const aiResults = Array.isArray(aiData.results)
      ? aiData.results
      : [];

    // AI таңдаған ID-лерді нақты кітаптармен салыстырамыз
    const booksById = new Map(
      allBooks.map((book) => [Number(book.id), book])
    );

    const usedIds = new Set<number>();

    const results = aiResults
      .slice(0, 6)
      .map((item: any) => {
        const id = Number(item.id);
        const book = booksById.get(id);

        if (!book || usedIds.has(id)) return null;

        usedIds.add(id);

        const score = Math.min(
          0.99,
          Math.max(0, Number(item.score) || 0)
        );

        if (score < 0.35) return null;

        return {
          book,
          score,
          explanation: {
            kk:
              typeof item.explanation_kk === 'string'
                ? item.explanation_kk.slice(0, 300)
                : `«${book.subject}» пәніне сәйкес келеді.`,
            ru:
              typeof item.explanation_ru === 'string'
                ? item.explanation_ru.slice(0, 300)
                : `Соответствует дисциплине «${book.subject}».`,
          },
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.score - a.score);

    res.json({
      engine: 'gemini',
      results,
    });
  } catch (error) {
    console.error('Gemini search error:', error);

    res.status(500).json({
      error: 'AI іздеу кезінде қате пайда болды',
    });
  }
});
// ================= GEMINI AI CHAT =================

app.post('/api/ai-chat', async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      res.status(503).json({
        error: 'GEMINI_API_KEY серверде орнатылмаған',
      });
      return;
    }

    const messages = req.body?.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({
        error: 'Хабарлама енгізіңіз',
      });
      return;
    }

    // Соңғы 20 хабарламаны ғана қабылдаймыз
    const validMessages = messages
      .slice(-20)
      .filter(
        (message: any) =>
          ['user', 'assistant'].includes(message?.role) &&
          typeof message?.content === 'string' &&
          message.content.trim().length > 0
      );

    if (
      validMessages.length === 0 ||
      !validMessages.some((message: any) => message.role === 'user')
    ) {
      res.status(400).json({
        error: 'Жарамды сұрақ табылмады',
      });
      return;
    }

    const contents = validMessages.map((message: any) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [
        {
          text: message.content.trim().slice(0, 4000),
        },
      ],
    }));

    
const systemPrompt = `
Сен Smart Library жүйесінің интеллектуалды AI көмекшісісің.
Сен колледж студенттері мен оқытушыларына арналған әмбебап көмекшісің.

МІНДЕТТЕРІҢ:
1. Қазақ және орыс тілдерінде еркін жауап бер.
2. Пайдаланушы қай тілде жазса, сол тілде жауап бер.
3. Бағдарламалау, IT, компьютер, желілер, математика,
   оқу және күнделікті жалпы сұрақтарға көмектес.
4. Код сұралса, түсінікті мысалдар келтір.
5. Күрделі тақырыптарды қарапайым тілмен түсіндір.
6. Әңгіме контекстін сақта және алдыңғы хабарламаларды ескер.
7. Өзіңді Smart Library AI көмекшісі ретінде таныстыр.
8. Нақты білмейтін ақпаратты ойдан шығарма.
9. Кітапхана қорында бар кітаптар туралы нақты дерек сұралса,
   бұл чаттың кітапхана деректер қорын тікелей тексермейтінін түсіндір
   және «Кітап іздеу» режимін пайдалануды ұсын.
10. Жауаптарың түсінікті, пайдалы және нақты болсын.

ЖОБА АВТОРЫ ТУРАЛЫ АҚПАРАТ:

Smart Library цифрлық кітапхана жобасының авторы және әзірлеушісі —
Шаймарданов Қуаныш Нұрланұлы.

Ол Семей қаласындағы Қайнар жоғары колледжінде
арнайы пәндер оқытушысы болып жұмыс істейді.

Білімі:
Шәкәрім университетін «Есептеу техникасы және бағдарламалық
қамтамасыз ету» мамандығы бойынша тәмамдаған.

Кәсіби бағыттары:
- Ақпараттық технологиялар
- Бағдарламалау
- Веб-сайт әзірлеу
- Компьютерлік жүйелер
- Цифрлық білім беру технологиялары

Smart Library жобасының мақсаты —
колледж кітапханасының жұмысын цифрландыру,
кітаптарды электронды түрде іздеу, кітапхана қорын басқару
және жасанды интеллект арқылы пайдаланушыларға көмектесу.

Егер пайдаланушы:
«Бұл сайтты кім жасады?»
«Жоба авторы кім?»
«Кім әзірледі?»
«Кто создал Smart Library?»
«Кто разработчик сайта?»
деген сияқты сұрақтар қойса, осы ақпаратты пайдаланып,
Қуаныш Нұрланұлы Шаймарданов туралы толық әрі сыпайы жауап бер.

Автор туралы сұрақтарға пайдаланушының тіліне сәйкес жауап бер.
Бұл ақпаратты тек автор немесе жоба туралы сұрақ қойылғанда пайдалан.
Басқа сұрақтарға қалыпты түрде жауап бер.
Жеке және құпия ақпаратты жариялама.
`;


    const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini chat API error:', geminiResponse.status, errorText);

      const status =
        geminiResponse.status === 429 || geminiResponse.status === 503
          ? 503
          : 502;

      res.status(status).json({
        error:
          status === 503
            ? 'AI қазір көп сұранысқа байланысты уақытша жауап бере алмайды. Біраздан кейін қайталап көріңіз.'
            : 'AI қызметіне қосылу мүмкін болмады. Қайталап көріңіз.',
      });
      return;
    }

    const geminiData = await geminiResponse.json();

    const reply =
      geminiData.candidates?.[0]?.content?.parts
        ?.map((part: any) => part.text || '')
        .join('')
        .trim() || '';

    if (!reply) {
      res.status(502).json({
        error: 'AI бос жауап қайтарды. Қайталап көріңіз.',
      });
      return;
    }

    res.json({
      engine: 'gemini',
      reply,
    });
  } catch (error) {
    console.error('Gemini chat error:', error);

    res.status(500).json({
      error: 'AI чатында қате пайда болды. Қайталап көріңіз.',
    });
  }
});

export default app;

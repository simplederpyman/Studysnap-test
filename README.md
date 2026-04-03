# StudySnap AI

Moderne Next.js webapp voor intelligent leren: upload foto/tekst/document/URL of gebruik dictaat, en genereer automatisch quizzen, flashcards en uitleg met AI (OpenRouter).

## Features

- **Inputmethoden**: foto (drag-drop + mobiel camera), tekst (editor + plakken), document (PDF/Word/TXT), URL import, dictaat.
- **AI outputmodi**: quiz, flashcards, uitleg (multi-select).
- **3-stappen workflow**: input → configuratie → resultaat/bewerking.
- **Study modes**: flashcard mode, quiz mode, leesmodus.
- **Library**: zoeken/filteren, mappenbasis, delen/import/export placeholders.
- **Integraties**: plek voor **Supabase** en **OpenRouter API key** in `/settings`.
- **Geen mock data**: generatie loopt via echte OpenRouter API calls.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Supabase JS client
- OpenRouter Chat Completions API
- PDF/Word/TXT parsing (pdf-parse, mammoth)

## Installatie

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

## API keys instellen

Je kunt op 2 manieren keys instellen:

### 1) Via UI
Ga naar `/settings` en vul in:
- Supabase URL
- Supabase anon key
- OpenRouter API key

Deze worden lokaal opgeslagen in `localStorage`.

### 2) Via `.env.local` (aanbevolen)
Maak `.env.local` in de project root:

```env
OPENROUTER_API_KEY=sk-or-v1-xxx
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Supabase tabel

Maak tabel `study_sets` met minimaal:
- `id` (text/uuid, primary key)
- `title` (text)
- `status` (text)
- `category` (text)
- `language` (text)
- `level` (int)
- `payload` (jsonb)
- `updated_at` (timestamp)

De app doet `upsert` op `id`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Belangrijke routes

- `/` landing page
- `/dashboard`
- `/create`
- `/study/flashcards`
- `/study/quiz`
- `/study/read`
- `/library`
- `/settings`
- API:
  - `POST /api/generate`
  - `POST /api/refine`
  - `POST /api/preview-url`

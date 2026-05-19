# 🏛️ Colectă Fest Sala Nouă

Aplicație web modernă pentru urmărirea în timp real a progresului colectei.

---

## 📁 Structura proiectului

```
colecta-fest/
├── app/
│   ├── layout.tsx          # Layout global
│   ├── page.tsx            # Pagina publică (progres live)
│   ├── globals.css         # Stiluri globale
│   ├── admin/
│   │   └── page.tsx        # Panoul de administrare
│   └── api/
│       └── colecta/
│           └── route.ts    # API endpoint
├── components/
│   ├── CircularProgress.tsx
│   ├── AnimatedNumber.tsx
│   ├── ProgressBar.tsx
│   ├── LiveDot.tsx
│   └── BackgroundOrbs.tsx
├── lib/
│   └── supabase.ts
├── supabase-setup.sql      # SQL pentru setup baza de date
├── .env.local.example      # Template variabile de mediu
├── package.json
├── tailwind.config.ts
├── next.config.mjs
└── tsconfig.json
```

---

## 🚀 GHID COMPLET DE INSTALARE ȘI DEPLOY

### PASUL 1 — Creează contul Supabase (gratuit)

1. Mergi la [supabase.com](https://supabase.com) și creează un cont
2. Click **"New Project"**
3. Alege un nume: `colecta-fest`
4. Setează o parolă pentru baza de date (salvează-o!)
5. Alege regiunea: **EU West** (pentru România)
6. Așteaptă ~2 minute până se creează proiectul

### PASUL 2 — Configurează baza de date

1. În dashboard-ul Supabase, click pe **SQL Editor** (meniu stânga)
2. Click **"New query"**
3. Copiază tot conținutul din fișierul `supabase-setup.sql`
4. Click **Run** ▶️
5. Ar trebui să vezi "Success. No rows returned"

**Activează Realtime:**
1. Mergi la **Database** → **Replication** (în meniu)
2. Găsește tabela `colecta` și activează toggle-ul **ON**
   
   SAU alternativ:
   - **Table Editor** → click pe tabela `colecta` → butonul `...` → **Enable Realtime**

### PASUL 3 — Obține cheile API Supabase

1. În dashboard Supabase, mergi la **Settings** → **API**
2. Copiază:
   - **Project URL** (ex: `https://abcdefgh.supabase.co`)
   - **anon / public key** (cheia lungă care începe cu `eyJ...`)

### PASUL 4 — Creează contul Vercel (gratuit)

1. Mergi la [vercel.com](https://vercel.com) și creează un cont
2. Recomandare: conectează-te cu GitHub

### PASUL 5 — Urcă codul pe GitHub

```bash
# Inițializează repository
cd colecta-fest
git init
git add .
git commit -m "Initial commit"

# Creează repo pe github.com, apoi:
git remote add origin https://github.com/USERUL_TAU/colecta-fest.git
git push -u origin main
```

### PASUL 6 — Deploy pe Vercel

1. La [vercel.com](https://vercel.com), click **"Add New Project"**
2. **Import** repository-ul `colecta-fest` de pe GitHub
3. **IMPORTANT** — Înainte de deploy, adaugă variabilele de mediu:
   
   Click pe **"Environment Variables"** și adaugă:
   
   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://abcdefgh.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (cheia anon din Supabase) |
   | `ADMIN_PASSWORD` | `parola_ta_sigura` |

4. Click **Deploy**
5. Vercel va construi și publica automat aplicația (~2-3 minute)

### PASUL 7 — Obține link-ul public

După deploy, Vercel îți va da un link de forma:
```
https://colecta-fest-XXXXXX.vercel.app
```

Acesta este **link-ul public** pe care îl distribui tuturor!

---

## 🔧 Rulare locală (pentru dezvoltare)

```bash
# 1. Clonează sau copiază proiectul
cd colecta-fest

# 2. Instalează dependențele
npm install

# 3. Creează fișierul de mediu
cp .env.local.example .env.local
# Editează .env.local și completează valorile

# 4. Pornește serverul de dezvoltare
npm run dev

# 5. Deschide în browser
# http://localhost:3000
```

---

## 🔐 Admin Panel

### Cum accesezi panoul de admin:

```
https://colecta-fest-XXXXXX.vercel.app/admin
```

### Cum te autentifici:
- Introdu parola setată în `ADMIN_PASSWORD` din Vercel

### Ce poți face în admin:
- **Ajustare rapidă**: Butoane +50, +100, +200, +500 RON
- **Sumă exactă**: Setează suma totală la o valoare precisă
- Toate modificările se propagă **instant** la toți utilizatorii conectați

---

## ⚙️ Personalizare

### Modificarea obiectivului (ținta de 10.000 RON):

Deschide `app/page.tsx` și caută linia:
```typescript
const TARGET = 10000;
```
Schimbă `10000` cu suma dorită.

### Modificarea parolei admin:

În Vercel → **Settings** → **Environment Variables** → editează `ADMIN_PASSWORD`
Apoi **Redeploy** proiectul.

---

## 🌐 Actualizare live — Flux de lucru

1. Deschide `/admin` pe telefon sau computer
2. Autentifică-te
3. Folosește butoanele rapide (+50, +100 etc.) sau introduce suma exactă
4. Click **Actualizează**
5. **Toți utilizatorii** care au pagina deschisă vor vedea instant modificarea cu animații

---

## 🛠️ Tehnologii folosite

| Tehnologie | Utilizare |
|-----------|-----------|
| **Next.js 14** | Framework React cu App Router |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Stilizare utilitarian-first |
| **Framer Motion** | Animații fluide |
| **Supabase** | Baza de date + Realtime WebSockets |
| **Vercel** | Hosting & Deploy automat |

---

## 📱 Compatibilitate

- ✅ Mobile (iOS & Android)
- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Tablet
- ✅ Dark mode nativ (design-ul este dark by default)

---

## 🆘 Probleme frecvente

**Suma nu se actualizează în realtime:**
- Verifică că ai activat Realtime în Supabase pentru tabela `colecta`
- Verifică că `NEXT_PUBLIC_SUPABASE_URL` și `NEXT_PUBLIC_SUPABASE_ANON_KEY` sunt corecte

**Eroare la login admin:**
- Verifică că `ADMIN_PASSWORD` în Vercel este exact cum l-ai setat

**Pagina nu se încarcă:**
- Verifică că SQL-ul a rulat corect și tabela `colecta` există
- Verifică că există cel puțin un rând cu `id = 1` în tabelă

---

Creat cu ❤️ pentru Fest Sala Nouă

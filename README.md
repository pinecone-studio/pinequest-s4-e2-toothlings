# PineQuest — Шүдний зөвөлгөө платформ

Шүдний эрүүл мэндийн зөвөлгөө, чиглүүлэл өгдөг апп. Web болон Mobile хоёуланг нь агуулсан monorepo.

> **Анхааруулга:** Энэ нь screening/demo систем бөгөгд эмчийн онош биш.

## Бүтэц

```
pinequest/
├── apps/
│   ├── web/       # Next.js 15 — веб апп (localhost:3000)
│   ├── mobile/    # Expo 52 — iOS / Android апп
│   ├── api/       # Fastify — backend API (localhost:4000)
│   └── inference/ # Python YOLOv8 — шүдний зургийн AI шинжилгээ (localhost:8765)
└── packages/
    ├── config/    # Хуваалцсан TypeScript тохиргоо
    └── types/     # Хуваалцсан TypeScript types
```

---

## Шаардлагатай суулгацууд

### 1. Node.js (v20+)

```bash
node -v
```

Суугаагүй бол [nodejs.org](https://nodejs.org) → **LTS** хувилбарыг татаж суулгана.

### 2. pnpm (v9+)

```bash
npm install -g pnpm
pnpm -v
```

### 3. Python (3.10+) — inference сервер ажиллуулахад

```bash
python3 --version
```

### 4. Git

```bash
git --version
```

### 5. (Mobile хөгжүүлэхэд) Expo Go апп

Утсандаа **Expo Go** аппыг суулгана — [iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## Эхлэх заавар

### 1. Repository татах

```bash
git clone <repository-url>
cd pinequest-s4-e2-team-7
```

### 2. Node dependency суулгах

```bash
pnpm install --ignore-scripts
pnpm rebuild esbuild sharp
```

### 3. Python inference суулгах

```bash
pip3 install -r apps/inference/requirements.txt
```

YOLO загвар татах (эхний удаа):

```bash
cd apps/inference && python3 download_model.py && cd ../..
```

### 4. Environment файл тохируулах

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

`.env` файлуудын утгуудыг багийн admin-аас авна.

### 5. Ажиллуулах

**Бүгдийг хамт эхлүүлэх:**
```bash
pnpm dev
```

**Inference серверийг тусад нь:**
```bash
cd apps/inference && python3 server.py
```

### 6. Хаяг

| Апп | Хаяг |
|-----|------|
| Web | http://localhost:3000 |
| API | http://localhost:4000 |
| Inference (AI) | http://localhost:8765 |
| Mobile | Expo Go → QR уншуулна |

---

## Багийн ажлын хуваарь

Pull хийсний дараа хэн хаана ажиллах тойм:

### 🌐 Web (`apps/web/`) — Next.js 15 + Tailwind

**Одоо дууссан:**
- AI Screener UI (зураг upload + камер)
- `/api/analyze` → inference сервер руу дамжуулах route
- Бounding box зурах (`ImageCanvas`), triage үр дүн (`ResultPanel`)

**Хийх зүйлс:**
- [ ] Зөвөлгөө хуудас — `/advice` — `GET /api/advice` дуудаж жагсаалт харуулах
- [ ] Хэрэглэгч нэвтрэх / бүртгэл (auth)
- [ ] Screener түүх хадгалах (үр дүнг API руу POST хийх)
- [ ] Mobile-friendly дизайн сайжруулах

---

### 📱 Mobile (`apps/mobile/`) — Expo 52 + React Native

**Одоо дууссан:**
- Үндсэн tab бүтэц (Home, Advice, Profile)
- Scaffold хуудаснуудын тулгуур код

**Хийх зүйлс:**
- [ ] Home tab — AI Screener (зураг авах + inference дуудах)
- [ ] Advice tab — `GET /api/advice` дуудаж зөвөлгөө жагсаалт
- [ ] Profile tab — хэрэглэгчийн мэдээлэл
- [ ] Утас дээрх камераар авсан зургийг inference руу илгээх

---

### ⚙️ API (`apps/api/`) — Fastify + PostgreSQL

**Одоо дууссан:**
- Сервер тохиргоо, CORS, TypeScript
- `/health` route
- `/api/advice` route — **бүтэц дууссан, DB байхгүй**

**Хийх зүйлс:**
- [ ] PostgreSQL холболт тохируулах (`.env`-д `DATABASE_URL` оруулах)
- [ ] DB schema үүсгэх (migrations) — `DentalAdvice`, `User` хүснэгтүүд
- [ ] `GET /api/advice` жинхэнэ DB query болгох (`TODO` тайлбарыг арилгах)
- [ ] `POST /api/advice` — шинэ зөвөлгөө нэмэх route
- [ ] Screener үр дүн хадгалах route (`POST /api/screenings`)

---

### 🤖 Inference (`apps/inference/`) — Python + YOLOv8

**Одоо дууссан:**
- FastAPI сервер `POST /analyze` — зураг хүлээн авч YOLO ажиллуулна
- `download_model.py` — `best.pt` автоматаар татна
- Triage classification (low / medium / high / critical)

**Хийх зүйлс:**
- [ ] Загварыг сайжруулах буюу Монгол өгөгдлөөр fine-tune хийх
- [ ] Detection confidence threshold тохируулах (`.env`-д `INFERENCE_CONF`)

---

### 📦 Packages (`packages/`)

| Файл | Агуулга | Хэн ашиглана |
|------|---------|--------------|
| `packages/types/src/dental.ts` | `DentalAdvice`, `SeverityLevel`, `DentalCategory` гэх мэт | Бүгд |
| `packages/types/src/user.ts` | `User`, `UserRole`, `UserProfile` | Web, Mobile, API |
| `packages/types/src/api.ts` | `ApiResponse<T>`, `PaginatedResponse<T>` | Web, Mobile, API |
| `packages/config/` | TypeScript / ESLint тохиргоо | Бүгд |

Шинэ type нэмэх шаардлагатай бол `packages/types/src/` дотор нэмж, `index.ts`-д export хийнэ.

---

### Портуудын тойм

| Сервис | Порт | Хэн ажиллуулах |
|--------|------|----------------|
| Web (Next.js) | 3000 | Web баг |
| API (Fastify) | 4000 | Backend баг |
| Inference (Python) | 8765 | AI / Python баг |
| Mobile (Expo) | Expo Go QR | Mobile баг |

---

## AI Screener ашиглах

1. Шүдний зураг файл оруулах эсвэл камер ашиглах
2. **AI шинжилгээ хийх** товч дарах
3. Caries / cavity / crack илрүүлсэн box, triage зөвлөмж харах

### Архитектур

```
Browser → Next.js /api/analyze → Python FastAPI (YOLOv8) → JSON → Triage UI
```

### Загвар

Одоогоор [yolov8_caries_detector](https://github.com/AndreyGermanov/yolov8_caries_detector) загварыг ашиглана.
Ирээдүйд Монгол локал өгөгдлөөр fine-tune хийсэн загвараар солих боломжтой — `inference/best.pt` файлыг солино.

---

## Хэрэгтэй командууд

```bash
# TypeScript алдаа шалгах
pnpm typecheck

# Бүгдийг build хийх
pnpm build

# Code format хийх
pnpm format

# Шинэ package нэмэх (жишээ: web-д)
pnpm --filter @pinequest/web add <package-name>

# Inference сервер тусад нь дахин эхлүүлэх
cd apps/inference && python3 server.py

# Port эзлэгдсэн бол
lsof -ti:3000,4000,8765 2>/dev/null | xargs kill -9 2>/dev/null || true
```

---

## Асуудал гарвал

| Алдаа | Шийдэл |
|-------|--------|
| `pnpm: command not found` | `npm install -g pnpm` |
| Port аль хэдийн ашиглагдаж байна | `lsof -i :3000` — хэн ашиглаж байгааг шалга |
| Expo QR ажиллахгүй | Утас + компьютер ижил WiFi-д байх ёстой |
| `inference/best.pt` олдохгүй | `cd apps/inference && python3 download_model.py` |
| Python module олдохгүй | `pip3 install -r apps/inference/requirements.txt` |

---

## Холбоо барих

Асуудал гарвал баг дотроо мессеж бичнэ үү.

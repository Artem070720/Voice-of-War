# Voice of War

**Voice of War** - full-stack вебплатформа для збереження, публікації та перегляду особистих історій про війну. Користувачі можуть додавати текстові спогади, фото й аудіо, переглядати публічний архів, керувати власними історіями та надсилати скарги. Адміністратори керують користувачами, категоріями, історіями, скаргами та статистикою платформи.

## Технології

- Frontend: Next.js 16, React 19, Tailwind CSS 4
- Backend: Node.js, Express 5, Prisma ORM
- Database: PostgreSQL
- Auth: JWT, bcrypt
- Uploads: multer, локальне сховище `backend/uploads`

## Структура проєкту

```text
Voice_of_War/
  backend/     Express API, Prisma schema, migrations, uploads
  frontend/    Next.js app router frontend
```

## Основні можливості

- Реєстрація та авторизація користувачів
- Захищений JWT особистий кабінет
- Додавання, редагування та видалення власних історій
- Публічний архів з пошуком, фільтрами, сортуванням і пагінацією
- Завантаження медіа: до 5 фото та 1 аудіофайл для історії
- Лічильник переглядів опублікованих історій
- Скарги на історії від авторизованих користувачів
- Адмін-панель зі статистикою
- Керування історіями, користувачами, категоріями та скаргами

## Вимоги

- Node.js 20 або новіший
- npm
- PostgreSQL

## Змінні середовища

Створіть `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/voice_of_war"
JWT_SECRET="change-this-secret"
PORT=5000
```

Створіть `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_FILE_URL="http://localhost:5000"
```

## Встановлення

Встановіть залежності бекенда:

```bash
cd backend
npm install
```

Встановіть залежності фронтенда:

```bash
cd frontend
npm install
```

## Налаштування бази даних

Запустіть Prisma migrations з директорії `backend`:

```bash
cd backend
npx prisma migrate dev
```

Заповніть базові категорії та демо-адміністратора:

```bash
npm run seed
```

Демо-акаунт адміністратора:

```text
Email: admin@voiceofwar.com
Password: admin123
```

Перед використанням не лише для локального демо змініть пароль або створіть іншого адміністратора.

## Локальний запуск

Запустіть backend API:

```bash
cd backend
npm run dev
```

API буде доступне на `http://localhost:5000`.

Запустіть frontend:

```bash
cd frontend
npm run dev
```

Вебзастосунок буде доступний на `http://localhost:3000`.

## Корисні команди

Backend:

```bash
npm run dev      # запуск Express через nodemon
npm start        # запуск Express через Node.js
npm run seed     # seed категорій і демо-адміністратора
```

Frontend:

```bash
npm run dev      # запуск Next.js dev server
npm run build    # production build
npm start        # запуск production server
npm run lint     # ESLint перевірка
```

Якщо Windows PowerShell блокує `npm run lint` через execution policy, використовуйте:

```bash
npm.cmd run lint
```

## API Overview

- `GET /api/public/home` - статистика головної сторінки, категорії, останні історії
- `POST /api/auth/register` - реєстрація
- `POST /api/auth/login` - вхід
- `GET /api/auth/me` - поточний користувач
- `GET /api/categories` - список категорій
- `GET /api/stories` - публічні опубліковані історії
- `POST /api/stories` - створення історії
- `GET /api/stories/my/list` - історії поточного користувача
- `POST /api/stories/:id/report` - скарга на історію
- `GET /api/admin/statistics` - статистика адмін-панелі
- `GET /api/admin/stories` - список історій для адміністратора
- `GET /api/admin/users` - список користувачів
- `GET /api/admin/reports` - список скарг

Завантажені файли доступні за адресами:

```text
http://localhost:5000/uploads/...
```

## Важливі примітки

- У Prisma schema є статуси модерації (`PENDING`, `APPROVED`, `REJECTED`, `HIDDEN`), але поточний сценарій створення історії одразу публікує її як `APPROVED`.
- Медіафайли зберігаються локально в `backend/uploads`, тому для production потрібне постійне файлове сховище або зовнішній object storage.
- `JWT_SECRET` має бути приватним, а демо-доступ адміністратора потрібно змінити перед реальним використанням.

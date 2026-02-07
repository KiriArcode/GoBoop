# Project Specification: Pet Assistant Telegram Ecosystem

## 1. Project Overview
Мы создаем экосистему для управления уходом за домашним животным.
**Формат:** Telegram Mini App (TMA) + Telegram Chat Bot.
**Цель:** Упростить рутину, трекать здоровье, задачи и сохранять воспоминания через общий чат с семьей.

## 2. User Scenarios (User Flow)
### A. Shared Chat Context (Групповой чат)
1.  **Фото:** Юзер отправляет фото собаки -> Бот перехватывает его.
    * **Action:** Бот загружает фото в папку на **Google Drive** пользователя.
    * **Data:** Бот сохраняет ID файла и ссылку на него в базу данных (Supabase).
    * **AI:** (Опционально) AI анализирует фото и добавляет теги в БД (напр. "прогулка", "сон").
2.  **Текст/Голос:** Юзер пишет/говорит "Купили корм" -> Бот парсит через AI -> Создает запись в БД.

### B. Mini App Context (Интерфейс)
1.  **Dashboard:** Календарь событий, задачи, вес.
2.  **Gallery:** Отображение фото, подгружаемых напрямую с Google Drive (через сохраненные ссылки).
3.  **Settings:** Настройка интеграций.

## 3. Tech Stack & Architecture
### 3.1 Core
* **Framework:** Next.js 14+ (App Router).
* **Language:** TypeScript.
* **Styling:** Tailwind CSS.

### 3.2 Backend & Data
* **Database:** Supabase (PostgreSQL). Только для хранения *метаданных* (таблицы пользователей, задач, ссылок на файлы). Сами файлы тут НЕ храним.
* **File Storage:** **Google Drive API**.
    * Используем Service Account или OAuth 2.0 (Offline Access) владельца.
    * Все фото складываются в папку `Pet_Assistant_Uploads`.
* **Hosting:** Vercel.

### 3.3 Integrations
* **Telegram Bot API:** (grammy/telegraf).
* **Google Ecosystem:**
    * **Calendar API:** Для событий.
    * **Drive API:** Для хранения фото.
* **TickTick Open API:** Для задач.
* **AI:** OpenAI API (GPT-4o) / Gemini API.

## 4. Database Schema (Updated for Drive)
```sql
-- Photos Table
create table photos (
  id uuid primary key default gen_random_uuid(),
  drive_file_id text unique, -- ID файла в Гугл Диске
  web_view_link text,        -- Ссылка для просмотра
  thumbnail_link text,       -- Ссылка для превью в приложении
  created_at timestamptz default now(),
  tags text[]                -- AI теги
);

-- (Остальные таблицы users, pets, events остаются без изменений)

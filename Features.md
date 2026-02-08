# GoBoop Feature List

## Core Status

**ID:** F-001  
**Name:** Smart Dashboard (Главный Хаб)  
**Description:** Сводный экран, показывающий статус питомца, индекс счастья и ближайшие критические задачи.

| UI Elements | Status |
|-------------|--------|
| Header: Имя, статус (дома/гуляет), Индекс Счастья (виджет) | UI ✓ / Data — / Backend — |
| Walk Block: Статус прогулки, таймер "прошло времени", кнопка действия | UI ✓ / Data — / Backend — |
| **Smart Notifications**: «Что нужно сегодня» (визит, лекарства, задачи, документы) | UI ✓ / Data ✓ / Backend ✓ |
| Upcoming Events: Мини-карточки (Врач, Поездка) | UI ✓ / Data ✓ / Backend ✓ |
| Family Leaderboard: Мини-виджет лидера недели | UI ✓ / Data — / Backend — |

---

## Quick Actions

**ID:** F-002  
**Name:** Quick Action Hub ("Плюсик")  
**Description:** Многоуровневое меню для быстрого ввода данных без перехода на другие экраны.

| UI Elements | Status |
|-------------|--------|
| Bottom Sheet (Шторка) | UI ✓ / Data — / Backend — |
| AI Chat Input: Строка ввода для текстовых команд | UI ✓ / Data ✓ / Backend ✓ |
| Grid 3x3: Кнопки (Поездка, Врач, Вес, Фото, Файл, Покупка, Заметка, Напоминание, Задача, **Лечение**) | UI ✓ / Data — / Backend — |
| Drill-down Forms: Формы ввода для каждого действия внутри шторки | UI ✓ / Data ✓ / Backend ✓ |

---

## Health Module

**ID:** F-003  
**Name:** Health & Medical Records  
**Description:** Управление здоровьем, историей болезней и весом.

### Подразделы

| Подраздел | Описание | Status |
|-----------|----------|--------|
| **Weight Tracker** | График веса + Калькулятор "Умное взвешивание" (Человек с питомцем - Человек) | UI ✓ / Data ✓ / Backend ✓ |
| **Vaccine Log** | Список и сроки прививок | UI ✓ / Data — / Backend — |
| **Active Treatment** (расширенный) | Текущая болезнь, этапы лечения, лекарства, процедуры, расписание приёма, дедлайны, кнопка «Принял» | UI частично / Data — / Backend — |

**UI Elements Active Treatment:**
- Карточка кейса: диагноз, дата начала, прогресс-бар
- Этапы: чекбоксы (Осмотр, Капли 7 дней, Контрольный визит)
- Лекарства: карточки с расписанием (08:00, 20:00), дедлайн «до 5 фев», прогресс «осталось 2 из 7 дней»
- Процедуры: частота (ежедневно, раз в 2 дня), инструкция (оставить на 5 мин)
- Параллельный приём: несколько лекарств/процедур одновременно
- Кнопка «Принял» с выбором «кто принял» (для семьи)

---

## Travel Module

**ID:** F-004  
**Name:** Travel Assistant  
**Description:** Подготовка к релокации/путешествию.

### Подразделы

| Подраздел | Описание | Status |
|-----------|----------|--------|
| **Countdown Timer** | Дни до поездки | UI ✓ / Data ✓ / Backend ✓ |
| **Document Checklist** | Список документов со статусами (Титры, Чип, Паспорт) | UI ✓ / Data — / Backend — |
| **Country Templates** | Шаблоны требований по странам (ЕС, UK, СНГ) | UI — / Data — / Backend — |
| **Custom Items** | Добавление/удаление пунктов в чеклисте для конкретной поездки | UI — / Data — / Backend — |

**UI Elements:**
- Выбор страны назначения при создании поездки
- Чеклист: urgent / pending / done / na
- Прогресс-бар готовности
- Urgent Alerts: красные уведомления о критических сроках

---

## Family Module

**ID:** F-005  
**Name:** Family Sync & Gamification  
**Description:** Синхронизация задач между членами семьи и геймификация рутины.

### Family Mode (подразделы)

| Подраздел | Описание | Status |
|-----------|----------|--------|
| **Assign Tasks** | Назначение задач: «Кому» (муж, жена, дети). Фильтр «Мои задачи» | UI частично / Data ✓ / Backend ✓ |
| **Shared View** | Синхронный просмотр: все видят актуальное состояние лечения/поездки | UI ✓ / Data ✓ / Backend ✓ |
| **Notifications** | Push/Telegram: «Через 2 часа — Суролан», «Дедлайн: титры до 20 фев» | UI — / Data — / Backend — |
| **Activity Log** | Лента активности: «Муж дал Суролан в 08:15», «Жена отметила контрольный визит» | UI ✓ / Data — / Backend — |

**UI Elements:**
- Leaderboard: Рейтинг членов семьи (XP за выполнение задач)
- Tasks List: Общий список задач (Купить корм, Дать таблетку)
- Activity Log: Кто и что сделал (история)

---

## IoT Integration (Future)

**ID:** F-006  
**Name:** Smart Home Connect  
**Description:** Интеграция с физическими устройствами.

| UI Elements | Status |
|-------------|--------|
| Button Widget: Статус с умной кнопки (Zigbee) | UI — / Data — / Backend — |
| Feeder Status: Данные с автокормушки | UI — / Data — / Backend — |

---

## Telegram Bot

**ID:** F-007  
**Name:** Telegram Bot — Voice/Text Commands  
**Description:** Парсинг голосовых и текстовых команд через AI в групповом чате.

| UI Elements | Status |
|-------------|--------|
| Фото в чате → загрузка в Google Drive, сохранение ссылки в Supabase, AI-теги | UI — / Data — / Backend — |
| Текст/голос ("Купили корм") → парсинг AI → создание записи в БД | UI — / Data ✓ / Backend ✓ |
| Inline Keyboard: «Выгулял», «Дал таблетку», «Принял» | UI — / Data — / Backend — |

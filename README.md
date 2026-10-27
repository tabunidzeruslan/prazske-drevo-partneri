# Pražské Dřevo — лендинг «pro partnery»

Одностраничный сайт на чешском для владельцев леса в Праге и Средней Чехии. Чистый HTML + CSS + немного JS, без сборки. Чтобы посмотреть локально, достаточно открыть `index.html` двойным кликом (форма работает только на опубликованном сайте).

```
index.html        — страница
styles.css        — стили
script.js         — меню, FAQ, анимации, отправка формы
functions/api/lead.js — серверная функция: пересылает заявку в Telegram
_headers          — заголовки кеширования для Cloudflare Pages
assets/           — логотипы, favicon, шрифты, фото (WebP), OG-картинка
CREDITS.md        — источники фото и шрифтов
```

---

## 1. Заявки в Telegram

Форма отправляет заявку на адрес `/api/lead` нашего же сайта. Там работает маленькая серверная функция Cloudflare ([functions/api/lead.js](functions/api/lead.js)), которая пересылает заявку в Telegram. Токен бота хранится в настройках Cloudflare, а не в коде сайта, поэтому посторонние его не увидят. Это бесплатно (до 100 000 запросов в день).

Пока бот не настроен, форма показывает ошибку и предлагает позвонить. На компьютере (при открытии `index.html` двойным кликом) форма не отправляет — только на опубликованном сайте.

### 1.1. Создать бота
1. В Telegram откройте **@BotFather** → `/newbot`.
2. Имя бота: например `Pražské Dřevo – poptávky`. Логин бота: например `prazske_drevo_poptavky_bot` (должен заканчиваться на `bot`).
3. BotFather пришлёт **токен** вида `1234567890:AAH...`. Это пароль от бота — никому его не пересылайте.

### 1.2. Узнать chat ID (куда слать заявки)
- **Себе лично:** найдите своего бота в Telegram, нажмите **Start** (или напишите любое сообщение).
- **В группу менеджеров:** создайте группу, добавьте туда бота и напишите в группе любое сообщение.

Затем откройте в браузере (подставьте токен):
```
https://api.telegram.org/botТОКЕН/getUpdates
```
Найдите `"chat":{"id":` — число после него и есть chat ID. Для личного чата оно положительное (`123456789`), для группы — отрицательное (`-1001234567890`).

### 1.3. Вписать в Cloudflare
1. Cloudflare → **Workers & Pages** → проект `prazske-drevo-pro-partnery` → **Settings** → **Variables and Secrets** → **Add**.
2. Добавьте две переменные (окружение **Production**):
   - `TELEGRAM_BOT_TOKEN` — тип **Secret**, значение — токен бота;
   - `TELEGRAM_CHAT_ID` — тип **Text**, значение — chat ID. Несколько получателей — через запятую: `123456789,987654321`.
3. **Save**.
4. Переменные применяются только к новым публикациям: **Deployments** → у последней публикации меню «⋯» → **Retry deployment** (или просто сделайте любой новый коммит).
5. Отправьте тестовую заявку с сайта — в Telegram придёт сообщение.

В сообщении будут: имя, телефон, e-mail, obec, rozloha, сообщение, а также UTM-метки и `fbclid` — по ним видно, из какой рекламы пришёл человек.

---

## 2. Загрузить проект на GitHub

Git-репозиторий уже создан, первый коммит сделан. Осталось отправить его на GitHub.

### Вариант А: через сайт GitHub (проще всего)

1. Зайдите на https://github.com и войдите в аккаунт.
2. Справа вверху **«+» → New repository**.
3. Repository name: `prazske-drevo-partneri`. Видимость: **Private** или Public (для Cloudflare подходят оба). Галочки «Add README» и т.п. **не ставьте**.
4. Нажмите **Create repository**.
5. На открывшейся странице нажмите ссылку **«uploading an existing file»**.
6. Перетащите в окно **содержимое папки** проекта: `index.html`, `styles.css`, `script.js`, `_headers`, `README.md`, `CREDITS.md`, `.gitignore` и папки `assets` и `functions` целиком.
   Не загружайте `prompt-claude-code.md` и `logo.png` из корня — это рабочие файлы, они не должны попасть на сайт.
7. Внизу нажмите **Commit changes**.

### Вариант Б: через командную строку (git уже установлен)

1. Создайте пустой репозиторий на GitHub, как в пунктах 1–4 выше.
2. В папке проекта выполните (замените `ВАШ_ЛОГИН`):
   ```bash
   git remote add origin https://github.com/ВАШ_ЛОГИН/prazske-drevo-partneri.git
   ```
   ```bash
   git push -u origin main
   ```
   При первом push откроется окно входа в GitHub — войдите в браузере.
3. Дальше после любых изменений:
   ```bash
   git add -A
   ```
   ```bash
   git commit -m "Описание изменения"
   ```
   ```bash
   git push
   ```

---

## 3. Опубликовать на Cloudflare Pages

1. Зарегистрируйтесь / войдите на https://dash.cloudflare.com.
2. Слева **Workers & Pages → Create → вкладка Pages → Connect to Git**.
3. Подключите GitHub, разрешите доступ к репозиторию `prazske-drevo-partneri` и выберите его.
4. Настройки сборки:
   - **Project name:** `prazske-drevo-pro-partnery` (от него зависит адрес)
   - **Production branch:** `main`
   - **Framework preset:** `None`
   - **Build command:** оставить **пустым**
   - **Build output directory:** `/`
5. **Save and Deploy**. Через минуту сайт будет на `https://prazske-drevo-pro-partnery.pages.dev`.

После этого каждый новый коммит в GitHub автоматически публикуется заново.

> Если адрес получится другим (например, имя было занято), замените `https://prazske-drevo-pro-partnery.pages.dev` в двух местах в `index.html` (строки с `og:image` и `twitter:image`) — иначе в Facebook не будет картинки-превью.

---

## 4. Подключить свой домен (позже)

1. Cloudflare → **Workers & Pages → ваш проект → Custom domains → Set up a custom domain**.
2. Введите, например, `partneri.prazske-drevo.cz` (поддомен основного сайта — самый простой вариант).
3. Cloudflare покажет DNS-запись (обычно `CNAME partneri → prazske-drevo-pro-partnery.pages.dev`). Добавьте её у регистратора/хостинга, где управляется DNS домена `prazske-drevo.cz`. Если домен уже в Cloudflare — запись добавится сама.
4. Через 5–30 минут домен заработает с HTTPS.
5. Обновите адрес в `og:image` / `twitter:image` в `index.html` на новый домен.

---

## 5. UTM-метки в рекламе Meta

UTM-метки из ссылки автоматически попадают в письмо с заявкой. Пример ссылки для объявления:

```
https://prazske-drevo-pro-partnery.pages.dev/?utm_source=facebook&utm_medium=paid&utm_campaign=vlastnici-lesu&utm_content=video-harvestor
```

Удобнее задать метки один раз в Ads Manager: в объявлении → **Tracking → URL parameters → Build a URL parameter** и вставить:

```
utm_source={{site_source_name}}&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}
```

Тогда Meta сама подставит название кампании и объявления. Параметр `fbclid` Facebook добавляет сам, он тоже придёт в письме.

---

## 6. Meta Pixel и cookie-баннер

Всё уже встроено, нужно только вписать ID пикселя.

1. Meta Events Manager (https://business.facebook.com/events_manager2) → **Источники данных** → ваш пиксель (или **Подключить данные → Интернет → Meta Pixel**, если его ещё нет).
2. Скопируйте **ID пикселя** — число из 15–16 цифр.
3. В `script.js` вверху впишите его:
   ```js
   const META_PIXEL_ID = "123456789012345";
   ```
4. Опубликуйте (коммит в GitHub).

Как это работает (GDPR):
- При первом заходе внизу появляется cookie-плашка «Používáme cookies» с кнопками **Odmítnout / Přijmout**.
- Пиксель загружается **только после «Přijmout»**. Без согласия на Meta ничего не уходит.
- После согласия отправляются события `PageView` и `Lead` (успешная заявка).
- Выбор запоминается на 12 месяцев; изменить его можно ссылкой **«Nastavení cookies»** в подвале.
- В «Zásady ochrany osobních údajů» есть раздел «Cookies a Meta Pixel».
- Пока `META_PIXEL_ID` пустой, ни плашки, ни пикселя на сайте нет.

---

## Как поменять тексты и фото

- Тексты — прямо в `index.html` (ищите нужную фразу через Ctrl+F).
- Телефон и e-mail встречаются в нескольких местах `index.html` и в начале `script.js` — меняйте через «Найти и заменить».
- Фото лежат в `assets/img/` в двух размерах (обычный и `-800`/`-760`/`-1200` для телефонов). При замене сохраните то же имя файла и формат WebP.

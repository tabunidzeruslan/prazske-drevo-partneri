# Pražské Dřevo — лендинг «pro partnery»

Одностраничный сайт на чешском для владельцев леса в Праге и Средней Чехии. Чистый HTML + CSS + немного JS, без сборки. Чтобы посмотреть локально, достаточно открыть `index.html` двойным кликом.

```
index.html        — страница
styles.css        — стили
script.js         — меню, FAQ, анимации, отправка формы
_headers          — заголовки кеширования для Cloudflare Pages
assets/           — логотипы, favicon, шрифты, фото (WebP), OG-картинка
CREDITS.md        — источники фото и шрифтов
```

---

## 1. Ключ Web3Forms (чтобы заявки приходили на почту)

Пока ключ не вставлен, форма будет показывать ошибку и предлагать позвонить.

1. Откройте https://web3forms.com.
2. В поле **«Create your Access Key»** введите `prazskedrevo.cz@gmail.com` и нажмите кнопку создания ключа.
3. На эту почту придёт письмо с ключом (строка вида `a1b2c3d4-....`). Проверьте папку «Спам», если не видно.
4. Откройте `script.js` и в **первой строке** замените `VLOZTE_SVUJ_KLIC` на ваш ключ:
   ```js
   const WEB3FORMS_ACCESS_KEY = "a1b2c3d4-ваш-ключ";
   ```
5. Сохраните файл и опубликуйте изменения (см. шаг 2: загрузить файл заново или сделать коммит).

Бесплатный тариф: 250 заявок в месяц. В письме будут: имя, телефон, e-mail, obec, rozloha, сообщение, а также UTM-метки и `fbclid` — по ним видно, из какой рекламы пришёл человек.

> Ключ Web3Forms не секретный — он только указывает, на какую почту пересылать. Его нормально хранить в коде сайта.

---

## 2. Загрузить проект на GitHub

Git-репозиторий уже создан, первый коммит сделан. Осталось отправить его на GitHub.

### Вариант А: через сайт GitHub (проще всего)

1. Зайдите на https://github.com и войдите в аккаунт.
2. Справа вверху **«+» → New repository**.
3. Repository name: `prazske-drevo-partneri`. Видимость: **Private** или Public (для Cloudflare подходят оба). Галочки «Add README» и т.п. **не ставьте**.
4. Нажмите **Create repository**.
5. На открывшейся странице нажмите ссылку **«uploading an existing file»**.
6. Перетащите в окно **содержимое папки** проекта: `index.html`, `styles.css`, `script.js`, `_headers`, `README.md`, `CREDITS.md`, `.gitignore` и папку `assets` целиком.
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

## 6. Meta Pixel (позже)

1. В Meta Events Manager создайте пиксель и скопируйте его базовый код.
2. Вставьте код в `index.html` перед строкой `</head>`.
3. В `script.js` в самом конце найдите функцию `onLeadSuccess()` и замените её содержимое:
   ```js
   function onLeadSuccess() {
     if (window.fbq) fbq('track', 'Lead');
   }
   ```
   Она вызывается только после успешной отправки формы.
4. **Важно (GDPR):** пиксель ставит cookie, поэтому в Чехии/ЕС перед ним нужен cookie-баннер с согласием, а в «Zásady ochrany osobních údajů» — абзац о Meta Pixel. Это отдельная задача.

---

## Как поменять тексты и фото

- Тексты — прямо в `index.html` (ищите нужную фразу через Ctrl+F).
- Телефон и e-mail встречаются в нескольких местах `index.html` и в начале `script.js` — меняйте через «Найти и заменить».
- Фото лежат в `assets/img/` в двух размерах (обычный и `-800`/`-760`/`-1200` для телефонов). При замене сохраните то же имя файла и формат WebP.

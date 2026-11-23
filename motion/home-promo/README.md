# Циан · Продолжите поиск

Промо мобильной главной: 15 секунд, 1920×1080, 30 кадров/с, MP4/H.264, без озвучки, до 20 000 000 байт. Доступны исходная версия без звука и версия с фоновой музыкой. Сценарий согласован пользователем 23 ноября 2026; музыка добавлена по следующему запросу. Ветка: home-promo.

Статус: готово. Версия без звука — 3 000 116 байт; с музыкой — 3 373 096 байт. Обе сохраняют 450 кадров, 15,00 с и H.264/yuv420p/BT.709. MP4 подготовлены для быстрого начала воспроизведения (moov перед mdat).

## Сцены

| Время | Содержание |
|---|---|
| 0–3 | Реальная главная Циана: Москва и пять вертикалей |
| 3–6 | Наезд на блок «Продолжить поиск» |
| 6–8 | Касание «Открыть», переход в выдачу |
| 8–12 | Сохранённый поиск и предложения квартир |
| 12–15 | Финал «Циан. Продолжите поиск» |

Интерфейс — неизменённые скриншоты работающего React-прототипа при ширине 390 px. Только обрамление телефона, фон, выделение блока, маркер касания и финальная подпись добавлены для видео. Новых функций, фотографий, состояний загрузки и обещаний нет. Иллюстративные карточки и тексты выдачи сохранены из прототипа, включая существующее склонение названия района.

Исходники экранов: src/pages/HomePage.tsx и src/pages/HomePage.module.css. Состояние: user=returning, variant=A, preview=1. Кнопка «Открыть» действительно ведёт в results/buy с параметрами saved=true, source=saved, place=Сокольники. Метрика отключена штатным preview=1.

## Файлы

- video.html — детерминированные сцены на движке product-motion; каждый кадр вычисляется render(t).
- plan.js — длительность, частота кадров, времена действий, ограничение размера.
- assets/home.jpg, assets/results.jpg — реальные экраны.
- brand/ — снимок профиля из motion/brand: палитра, Lato с SIL OFL 1.1, знак из шапки прототипа.
- build/ — временные кадры и отчёты проверок (в Git не включаются).
- out/home-promo_16x9.mp4 — версия без звука (в Git не включается).
- out/home-promo_16x9_music.mp4 — версия с фоновой музыкой (в Git не включается).
- out/home-promo_16x9_sheet.jpg — контактный лист из закодированного MP4.

## Пересборка

В обычном терминале macOS, из корня репозитория:

```sh
source .agents/motion-env.sh
python .agents/skills/product-motion/scripts/verify_scene.py motion/home-promo/video.html --fmt h --times 0,0.5,2,4.5,6.9,7.3,7.5,8,10,12.5,13.5,14.9667
python .agents/skills/product-motion/scripts/render.py motion/home-promo/video.html video --fmt h --qs subs=0 --out motion/home-promo/build/render.mp4
ffmpeg -y -i motion/home-promo/build/render.mp4 -c copy -an -movflags +faststart motion/home-promo/out/home-promo_16x9.mp4
python .agents/skills/product-motion/scripts/verify_media.py motion/home-promo/plan.js motion/home-promo/out/home-promo_16x9.mp4 --sheet --times 2,4.5,6.9,7.5,10,14
```

Превью при запущенном npm run dev: /motion/home-promo/video.html?preview=1.

## Рендер в текущей среде

Отдельный Chromium для Playwright блокируется системным разрешением macOS. Поэтому использован разрешённый встроенный браузер Codex: те же HTML, engine.js и render(t), покадровый захват через поле «Момент ролика, секунд», 450 JPEG размером 1920×1080. Кадры не являются записью экрана в реальном времени; пропуск кадров исключён.

Перед полным рендером проверены 12 моментов вперёд и назад: изображения совпали попиксельно. Просмотрены контактный лист и стык перехода. Ошибок JavaScript нет. Композитные слои will-change обеспечивают одинаковую растеризацию при перемотке. Финал неподвижен последние 1,5 секунды.

Для упаковки захваченной последовательности:

```sh
source .agents/motion-env.sh
ffmpeg -y -framerate 30 -i motion/home-promo/build/frames/%05d.jpg -frames:v 450 -vf 'scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p' -c:v libx264 -preset slow -crf 19 -maxrate 8M -bufsize 16M -pix_fmt yuv420p -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -an -movflags +faststart motion/home-promo/out/home-promo_16x9.mp4
```

## Фоновая музыка

Спокойный электронный трек без вокала и сторонних сэмплов синтезирован music.py. 100 BPM, мягкий ритм и пэд; с 7,8 секунды, при появлении выдачи, добавляется лёгкое арпеджио. Финальный аккорд на 12-й секунде совпадает с финальной сценой. Вход — 0,25 с, плавное затухание — последние 1,5 с. Раздел music в plan.js хранит параметры и seed=17.

Музыка черновая. Для внешней публикации можно заменить её выбранным лицензионным треком. Проверены длительность, громкость и пики автоматически; на слух трек не оценивался. Озвучка, субтитры и пакет озвучки не создавались. Видео не публиковалось.

Команды добавления музыки без повторного рендера изображения:

```sh
source .agents/motion-env.sh
python .agents/skills/product-motion/scripts/music.py motion/home-promo/plan.js --out motion/home-promo/build/music.wav
ffmpeg -y -v error -i motion/home-promo/build/music.wav -af 'afade=t=in:st=0:d=0.25' -c:a pcm_s16le motion/home-promo/build/music-faded.wav
python .agents/skills/product-motion/scripts/mix.py motion/home-promo/build/music-faded.wav --out motion/home-promo/build/mix.wav
python .agents/skills/product-motion/scripts/assemble.py --video motion/home-promo/out/home-promo_16x9.mp4 --audio motion/home-promo/build/mix.wav --out motion/home-promo/out/home-promo_16x9_music.mp4
python .agents/skills/product-motion/scripts/verify_media.py motion/home-promo/plan.js motion/home-promo/out/home-promo_16x9_music.mp4 --json motion/home-promo/build/media-music-checks.json
```

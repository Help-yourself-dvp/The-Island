# 00 — НАСЛЕДИЕ SKYFORGE И ТЕХНИЧЕСКИЕ УРОКИ

## 1. НАЗНАЧЕНИЕ

До этого проекта существовал экспериментальный проект:

SKYFORGE — Кузница Небес.

Новый проект НЕ является продолжением SKYFORGE.

SKYFORGE используется только как источник инженерного опыта.

Нельзя автоматически копировать его игровую архитектуру.

Если в repository присутствует:

reference/SKYFORGE_AI_GUIDE.md

или:

reference/SKYFORGE_ЗНАНИЯ_И_ПРАВИЛА.md

прочитай их как исторические/reference документы.

Они НЕ имеют приоритета над новой спецификацией.

---

# 2. ЧТО МЫ УЗНАЛИ ИЗ SKYFORGE

Главный урок:

слишком большое количество сложных систем в первой версии приводит к тому, что AI успевает формально реализовать много функций, но не успевает довести:

- стабильность;
- визуальное качество;
- управление;
- camera;
- feedback;
- art direction.

Новый проект должен избегать этого.

Принцип:

МЕНЬШЕ СИСТЕМ
+
БОЛЬШЕ КАЧЕСТВА.

---

# 3. ЧТО НЕ ПЕРЕНОСИТЬ

Не переносить автоматически из SKYFORGE:

- исходный src/;
- Rapier;
- machine builder;
- joints;
- survival;
- fauna simulation;
- procedural world architecture;
- procedural-only asset restriction;
- SKYFORGE terrain;
- SKYFORGE player controller;
- SKYFORGE camera;
- SKYFORGE save schema;
- SKYFORGE UI;
- старые gameplay states.

Если какая-либо из этих технологий действительно понадобится новой игре:

сначала обоснуй необходимость.

---

# 4. ЧТО НУЖНО СОХРАНИТЬ КАК ИДЕЮ

Полезными оказались следующие инженерные принципы:

- Git является источником истины;
- изменения необходимо commit + push;
- Android build должен быть автоматизирован;
- пользователь не должен локально собирать APK;
- приложение должно работать offline;
- версия должна контролироваться централизованно;
- нужны screenshot/debug hooks;
- нужны документы для следующих AI;
- Android необходимо тестировать отдельно от browser preview;
- buildability важнее количества незаконченных features.

Эти принципы использовать и в новом проекте.

---

# 5. GIT DISCIPLINE

AI-agent работает непосредственно с repository.

В начале каждого нового рабочего захода:

1. определить текущую branch;
2. git fetch;
3. синхронизироваться с origin;
4. проверить текущее состояние проекта;
5. прочитать STATUS.md и AI_GUIDE.md, если они существуют.

Нельзя уничтожать незапушенную работу.

В конце каждого законченного рабочего захода:

1. выполнить build;
2. проверить git diff;
3. git add -A;
4. git commit;
5. git push;
6. убедиться, что working tree clean.

Все важные изменения должны существовать в remote repository.

---

# 6. GITHUB ACTIONS

Пользователь не должен собирать Android-приложение вручную.

Создать GitHub Actions workflow.

Он должен автоматически выполнять как минимум:

- checkout;
- setup Node;
- npm ci;
- web build;
- Capacitor sync;
- Java setup;
- Android build;
- APK artifact upload.

Пользователь получает APK через GitHub Actions.

---

# 7. CAPACITOR

Для упаковки web/Three.js приложения использовать Capacitor, если MASTER_PROMPT не определит другой стек.

Capacitor отвечает за Android wrapper.

Не добавлять нативные плагины без необходимости.

Игра должна оставаться максимально независимой от native APIs.

---

# 8. ANDROID

Основная платформа:

Android.

Основное тестовое устройство:

Honor Magic 8 Pro.

Первая версия:

landscape.

Требования:

- fullscreen;
- immersive;
- корректный viewport;
- safe areas;
- keep screen on во время игры;
- никаких лишних permissions;
- offline gameplay.

Не добавлять разрешения «на будущее».

---

# 9. APK

GitHub Actions должен выдавать устанавливаемый APK.

Artifact должен иметь понятное название:

<game-name>-<version>.apk

Не заставлять пользователя:

- открывать Android Studio;
- запускать Gradle вручную;
- использовать adb;
- самостоятельно подписывать APK.

---

# 10. VERSION.TXT

Использовать:

version.txt

как основной человеческий источник версии.

Например:

0.1.0

package.json и Android versionName должны соответствовать ему.

Не держать три независимо редактируемые версии.

---

# 11. VERSION CODE

Для CI допустимо использовать:

github.run_number

как Android versionCode.

Локальный fallback:

1.

---

# 12. SIGNING

Для тестовой разработки нужен стабильный способ подписывать APK.

Не требовать от пользователя вручную создавать ключ при каждой сборке.

Для development/closed alpha допустим стабильный debug/test keystore.

Production signing для магазина является отдельным этапом.

Не смешивать раннюю разработку с production Play signing.

---

# 13. OFFLINE-FIRST

Игра должна работать после установки без Internet.

Не использовать runtime CDN.

Не загружать:

- models;
- textures;
- configs;
- gameplay data

из Internet во время игры.

Все необходимые production assets находятся внутри приложения.

---

# 14. EXTERNAL ASSETS В НОВОМ ПРОЕКТЕ РАЗРЕШЕНЫ

В отличие от SKYFORGE, новая игра может использовать game-ready external assets.

Но каждый asset должен иметь проверенную лицензию.

Предпочтение:

CC0 / Public Domain.

Все production assets хранятся в repository или контролируемом build pipeline.

---

# 15. ASSET LICENSE DOCUMENTATION

Создать:

docs/ASSET_LICENSES.md

Для каждого внешнего набора указать:

- название;
- автор;
- URL;
- license;
- какие файлы используются.

Не использовать файл с неизвестным происхождением.

---

# 16. SCREENSHOT HOOKS

В SKYFORGE возможность выставить детерминированное состояние для screenshot оказалась полезной.

Сохранить этот принцип.

Поддержать специальные URL hash/query hooks.

Пример:

#shot-title
#shot-sawmill
#shot-farm
#shot-town

Конкретный список определяется новой игрой.

Shot state должен:

- пропускать лишние onboarding screens;
- ставить camera;
- ставить состояние мира;
- делать кадр воспроизводимым.

---

# 17. DEBUG INTERFACE

Создать ограниченный debug interface.

Например:

window.__GAME

Он может предоставлять:

- state;
- diagnostics;
- screenshot setup.

Не хранить всю архитектуру в global scope.

---

# 18. DIAGNOSTICS

Одна из проблем SKYFORGE — ошибки, которые проявлялись только на настоящем устройстве.

Поэтому новая игра должна иметь лёгкую диагностику.

Полезно отслеживать:

- FPS;
- frame time;
- renderer draw calls;
- triangle count;
- active workers;
- active effects;
- current zone;
- game state.

Не логировать каждый frame.

---

# 19. WATCH FOR RUNAWAY SYSTEMS

SKYFORGE показал важность bounded simulation.

Новая игра не должна бесконтрольно создавать:

- particles;
- DOM nodes;
- Three objects;
- timers;
- audio nodes;
- workers/NPC;
- resources.

Для временных эффектов:

TTL / pool / hard cap.

---

# 20. ONE GAME LOOP

Должен существовать один понятный основной render/game loop.

Не запускать случайно несколько requestAnimationFrame loops.

После pause/resume приложение не должно создавать второй loop.

---

# 21. MOBILE LIFECYCLE

Проверять:

- pause;
- resume;
- Android background;
- orientation;
- viewport resize.

Не пытаться «догнать» несколько секунд simulation огромным количеством update steps после возвращения приложения.

---

# 22. CAMERA — КРИТИЧЕСКАЯ СИСТЕМА

В SKYFORGE camera стала источником серьёзных визуальных проблем.

В новой игре camera должна быть проще.

Предпочтение:

ограниченная/контролируемая camera.

Не давать игроку возможность легко:

- войти камерой под terrain;
- смотреть через building;
- застрять внутри tree;
- потерять персонажа.

Camera должна проектироваться вместе с level layout.

---

# 23. CAMERA COLLISION

Если камера подвижна:

она должна учитывать world collision/occluders.

Но предпочтительнее сначала сделать camera design таким, чтобы сложная collision system вообще почти не требовалась.

---

# 24. GAMEPLAY > SIMULATION

Главный технический урок SKYFORGE:

настоящая физическая симуляция дорога по сложности.

В новой игре не моделировать то, что игроку достаточно показать.

Пример:

cargo stack визуализируется,
но данные хранятся числом.

Workers используют state machine,
а не физический AI.

Building construction staged,
а не собирается физически из сотен объектов.

---

# 25. PREVIEW

Если возможно, сохранить удобный browser preview.

Он нужен AI-agent для:

- smoke test;
- screenshots;
- debugging.

Но Android APK является главным продуктом.

Browser preview не гарантирует поведение Android WebView.

---

# 26. AI_GUIDE

После создания архитектуры агент должен создать новый:

AI_GUIDE.md

именно для НОВОЙ игры.

Не копировать SKYFORGE_AI_GUIDE как действующий документ.

Новый AI_GUIDE должен объяснять:

- project architecture;
- game states;
- zones;
- resource system;
- workers;
- buildings;
- assets;
- save;
- UI;
- camera;
- Android build;
- git workflow.

---

# 27. STATUS

Создать:

STATUS.md.

Не использовать его как рекламный список.

Статусы должны быть честными:

WORKING
PARTIAL
STUB
BROKEN
NOT IMPLEMENTED.

Feature нельзя считать WORKING только потому, что существует функция с таким названием.

---

# 28. TESTING

Создать:

ЧЕКЛИСТ_ТЕСТОВ.md.

Он должен включать реальные device tests.

После каждой крупной сборки пользователь тестирует Honor Magic 8 Pro.

Особенно:

- запускается ли;
- не зависает ли через 5–10 секунд;
- работает ли 2–5 минут;
- camera;
- touch;
- FPS;
- save;
- resume;
- основная gameplay loop.

---

# 29. DEVICE SOAK TEST

Опыт SKYFORGE показал, что запуск приложения недостаточен.

Нужно проверять:

30 sec;
60 sec;
несколько минут.

Количество runtime objects не должно бесконтрольно расти.

---

# 30. ART ДОЛЖЕН ПРОХОДИТЬ DEVICE TEST

Не принимать art только по desktop screenshot.

На телефоне проверить:

- размер персонажа;
- читаемость;
- UI;
- shadows;
- aliasing;
- texture sharpness;
- FPS.

---

# 31. НЕ РЕАЛИЗОВЫВАТЬ ВСЮ ИГРУ ЗА ОДИН ЗАХОД

Это ключевой урок.

Этап 1:

вертикальный slice.

Этап 2:

polish slice.

Этап 3:

следующая content zone.

Не создавать пять недоделанных зон одновременно.

---

# 32. ПЕРВЫЙ VERTICAL SLICE

Для новой игры первым доказательством является:

MOVE
→ HARVEST
→ CARRY
→ DELIVER
→ REWARD
→ BUILD
→ VISIBLE WORLD CHANGE.

До его polish не расширять игру.

---

# 33. GIT BRANCHES ДЛЯ РИСКОВ

Для существенных изменений допустимы:

experiment/*

Например:

experiment/nature-pack
experiment/lighting
experiment/camera

Stable main не должен становиться испытательным полигоном.

---

# 34. ПОЛЬЗОВАТЕЛЬ НЕ ДОЛЖЕН БЫТЬ BUILD ENGINEER

Если техническую операцию способен выполнить:

AI;
GitHub Actions;
Node/Python script;

не перекладывать её на пользователя.

---

# 35. ИТОГОВЫЙ ПРИНЦИП НАСЛЕДОВАНИЯ

Не наследовать КОД SKYFORGE.

Наследовать УРОКИ SKYFORGE.

Сохранить:

- delivery pipeline;
- git discipline;
- Android automation;
- offline-first;
- diagnostics;
- documentation;
- device testing.

Не сохранять:

- лишнюю сложность;
- procedural-only dogma;
- physics ради physics;
- огромный scope;
- попытку сделать всё одним заходом.

Новый проект должен быть намного проще внутри и намного качественнее снаружи.

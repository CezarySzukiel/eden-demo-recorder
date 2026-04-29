# Eden Demo Automation

Scenariusze Playwright do nagrywania przewodnikow po Sahana Eden.

## Dostepne komendy

- `npm test` - uruchamia pelny test end-to-end z organizacja, biurem, facility i zasobem
- `npm run organizations` - nagrywa scenariusz organizacja + biuro + facility
- `npm run warehouses` - nagrywa przewodnik po module Warehouses
- `npm run warehouses_extended` - nagrywa rozszerzony przewodnik po Warehouses (teksty z `src/locale/warehouse/pl_gpt.json`)

Domyslny adres aplikacji:

- `http://127.0.0.1:8000/eden`

## Gdzie trafia nagranie

Po uruchomieniu `npm run organizations` video zapisuje sie w katalogu:

- `artifacts/demo-results/`

Playwright tworzy tam podkatalog testu z plikiem `video.webm`.
Pliki techniczne Playwright trafiaja do `artifacts/playwright-output/` (katalog moze byc czyszczony przy starcie testu).

## Ustawienia

- `EDEN_BASE_URL` - adres instancji Eden, domyslnie `http://127.0.0.1:8000/eden`
- `EDEN_TEST_PASSWORD` - haslo dla nowo rejestrowanego konta
- `EDEN_RECORDING_WIDTH` - szerokosc nagrania, domyslnie `1600`
- `EDEN_RECORDING_HEIGHT` - wysokosc nagrania, domyslnie `900`
- `EDEN_ACTION_DELAY_MS` - opoznienie po akcji, zanim scenariusz przejdzie dalej
- `EDEN_TYPE_DELAY_MS` - opoznienie na znak przy wpisywaniu
- `EDEN_CURSOR_MOVE_STEPS` - liczba krokow animacji ruchu kursora
- `EDEN_CURSOR_MOVE_SETTLE_MS` - krotka pauza po dojechaniu kursora do celu
- `EDEN_NAVIGATION_CLICK_PAUSE_MS` - pauza po najechaniu na link/menu przed kliknieciem
- `EDEN_NAVIGATION_POST_CLICK_MS` - krotka pauza po animacji klikniecia w nawigacji
- `EDEN_CURSOR_CLICK_VISUAL_MS` - czas trwania wizualnego efektu klikniecia kursora
- `EDEN_POST_CURSOR_CLICK_DELAY_MS` - pauza miedzy animacja klikniecia a faktycznym wpisywaniem/wyborem
- `EDEN_DEFAULT_CAPTION_DELAY_MS` - bazowy czas captionu dla zwyklych krokow
- `EDEN_DEFAULT_HOVER_DELAY_MS` - bazowy czas captionu dla opisow hover
- `EDEN_OPTIONAL_HOVER_DELAY_MS` - bazowy czas captionu dla opcjonalnych pol
- `EDEN_RECORDING_FINISH_DELAY_MS` - pauza przed zapisaniem i zamknieciem nagrania
- `SECONDS_PER_WORD` - czas wyswietlania napisu na jedno slowo
- `MAX_SECONDS_PER_WRITING` - limit sekund wynikajacy z dlugosci tekstu
- `MAX_CAPTION_DELAY_MS` - twardy gorny limit czasu captionu

Domyslny rozmiar nagrania to `1600x900`, bo w trybie z podgladem
pelne `1920x1080` czesto nie miesci sie w oknie Chromium razem z ramka
przegladarki. Gdy faktyczny viewport jest mniejszy niz rozmiar video,
Playwright dopelnia brakujace miejsce szarym tlem po prawej i na dole.
Jesli nagrywasz bez podgladu albo masz wiekszy ekran, mozesz wymusic
Full HD:

```bash
EDEN_RECORDING_WIDTH=1920 EDEN_RECORDING_HEIGHT=1080 npm run organizations
```

## Pierwszy scenariusz

Nagrywany flow:

1. Rejestracja uzytkownika
2. Logowanie
3. Wejscie do Organizations
4. Utworzenie organizacji `Demo NGO Aid Network`
5. Utworzenie biura `Warsaw Office`
6. Utworzenie facility `Distribution Point`

## Warehouses Guide

Nagrywany flow:

1. Logowanie
2. Wejscie do modulu Warehouses
3. Krotkie intro: czym jest modul i do czego sluzy
4. Przeglad podstawowych danych konfiguracyjnych:
5. Warehouse Types
6. Catalogs
7. Item Categories
8. Items
9. Suppliers
10. Warehouse
11. Received Shipments
12. Requests
13. Match Requests i Commit
14. Sent Shipments
15. Odbior po drugiej stronie
16. Distributions
17. Adjust Stock Levels
18. Reports

Nagrania sa zapisywane jako stale pliki:

- `artifacts/demo-results/organization-setup.webm`
- `artifacts/demo-results/warehouses-guide.webm`
- `artifacts/demo-results/warehouses-extended.webm`

Ponowne uruchomienie tego samego nagrania nadpisuje tylko jego wlasny plik.

# Eden Demo Automation

Scenariusze Playwright do nagrywania przewodnikow po Sahana Eden.

## Dostepne komendy

- `npm test` - uruchamia pelny test end-to-end z organizacja, biurem, facility i zasobem
- `npm run demo:org-setup` - nagrywa scenariusz organizacja + biuro + facility

Domyslny adres aplikacji:

- `http://127.0.0.1:8000/eden`

## Gdzie trafia nagranie

Po uruchomieniu `npm run demo:org-setup` video zapisuje sie w katalogu:

- `artifacts/demo-results/`

Playwright tworzy tam podkatalog testu z plikiem `video.webm`.

## Ustawienia

- `EDEN_BASE_URL` - adres instancji Eden, domyslnie `http://127.0.0.1:8000/eden`
- `EDEN_TEST_PASSWORD` - haslo dla nowo rejestrowanego konta
- `EDEN_ACTION_DELAY_MS` - opoznienie po akcjach w helperach

## Pierwszy scenariusz

Nagrywany flow:

1. Rejestracja uzytkownika
2. Logowanie
3. Wejscie do Organizations
4. Utworzenie organizacji `Demo NGO Aid Network`
5. Utworzenie biura `Warsaw Office`
6. Utworzenie facility `Distribution Point`

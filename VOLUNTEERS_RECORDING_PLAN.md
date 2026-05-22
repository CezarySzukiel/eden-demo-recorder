# Plan nagrania modułu Volunteers - Szczegółowy przewodnik

## Cel nagrania
Stworzenie kompleksowego przewodnika wideo po module Volunteers w Sahana Eden, pokazującego wszystkie kluczowe funkcje oraz praktyczne scenariusze użycia opisane w przewodniku.

## Struktura modułu (zidentyfikowana w systemie)

### Główne sekcje:
1. **Volunteers** (`/eden/vol/volunteer/summary`)
   - Create (`/eden/vol/volunteer/create`)
   - Search by Skills (`/eden/vol/competency`)
   - Import

2. **Staff & Volunteers (Combined)** (`/eden/vol/human_resource/summary`)

3. **Teams** (`/eden/vol/group`)
   - Create (`/eden/vol/group/create`)
   - Search Members (`/eden/vol/group_membership`)
   - Import

4. **Volunteer Role Catalog** (`/eden/vol/job_title`)
   - Create (`/eden/vol/job_title/create`)

5. **Skill Catalog** (`/eden/vol/skill`)
   - Create (`/eden/vol/skill/create`)

6. **Training Events** (`/eden/vol/training_event`)
   - Create (`/eden/vol/training_event/create`)
   - Search Training Participants (`/eden/vol/training`)
   - Import Participant List

7. **Training Course Catalog** (`/eden/vol/course`)
   - Create (`/eden/vol/course/create`)

8. **Certificate Catalog** (`/eden/vol/certificate`)
   - Create (`/eden/vol/certificate/create`)

9. **Programs** (`/eden/vol/programme`)
   - Create (`/eden/vol/programme/create`)
   - Import Hours

10. **Reports** (`/eden/vol/volunteer/report`)
    - Volunteer Report
    - Hours by Role Report
    - Hours by Program Report
    - Training Report

## Scenariusz nagrania (zgodny z przewodnikiem)

### Część 1: Wprowadzenie i konfiguracja (5-7 min)
1. **Intro do modułu** (30s)
   - Strona główna `/eden/vol/index`
   - Wyjaśnienie celu modułu: zarządzanie wolontariuszami, umiejętności, szkolenia, mobilizacja

2. **Katalogi konfiguracyjne** (3-4 min)
   - **Skill Catalog** - przegląd i utworzenie przykładowej umiejętności (np. "Pierwsza pomoc")
   - **Volunteer Role Catalog** - przegląd i utworzenie roli (np. "Ratownik medyczny")
   - **Certificate Catalog** - przegląd i utworzenie certyfikatu (np. "Certyfikat pierwszej pomocy")
   - **Training Course Catalog** - przegląd i utworzenie kursu (np. "Podstawy pierwszej pomocy")

### Część 2: Rejestracja wolontariusza (4-5 min)
3. **Scenariusz 1: Rejestracja nowego wolontariusza**
   - Nawigacja do Create Volunteer
   - Wypełnienie pełnego formularza:
     - Dane osobowe (imię, nazwisko, data urodzenia, płeć)
     - Dane kontaktowe (telefon, email, adres)
     - Organizacja/oddział
     - Typ osoby: Volunteer
     - Przypisanie umiejętności (z wcześniej utworzonego katalogu)
     - Określenie dostępności
     - Status: Active
   - Zapisanie rekordu
   - Pokazanie utworzonego wolontariusza na liście

### Część 3: Zespoły i organizacja (2-3 min)
4. **Tworzenie zespołu**
   - Nawigacja do Teams → Create
   - Utworzenie zespołu (np. "Zespół ratowniczy")
   - Przypisanie członków zespołu
   - Pokazanie listy zespołów

### Część 4: Szkolenia (3-4 min)
5. **Scenariusz: Organizacja szkolenia**
   - Nawigacja do Training Events → Create
   - Utworzenie wydarzenia szkoleniowego:
     - Nazwa szkolenia
     - Kurs (z katalogu)
     - Data i miejsce
     - Instruktor
   - Przypisanie uczestników (wolontariuszy)
   - Pokazanie listy szkoleń

### Część 5: Programy i śledzenie czasu (2-3 min)
6. **Programy wolontariackie**
   - Nawigacja do Programs → Create
   - Utworzenie programu (np. "Program pomocy zimowej")
   - Rejestracja godzin pracy wolontariuszy
   - Pokazanie podsumowania

### Część 6: Wyszukiwanie i filtrowanie (3-4 min)
7. **Scenariusz 2: Wyszukiwanie odpowiednich wolontariuszy**
   - Nawigacja do Volunteers list
   - Demonstracja filtrów:
     - Wyszukiwanie po umiejętnościach (Search by Skills)
     - Filtrowanie po statusie (Active)
     - Filtrowanie po lokalizacji
     - Filtrowanie po dostępności
   - Pokazanie wyników wyszukiwania
   - Eksport danych (jeśli dostępne)

### Część 7: Raporty i analiza (2-3 min)
8. **Przegląd raportów**
   - Nawigacja do Reports
   - **Volunteer Report** - raport wolontariuszy
   - **Hours by Role Report** - godziny według ról
   - **Hours by Program Report** - godziny według programów
   - **Training Report** - raport szkoleń
   - Demonstracja filtrowania i eksportu

### Część 8: Scenariusze praktyczne (opcjonalnie, 2-3 min)
9. **Scenariusz 3: Mobilizacja na zdarzenie**
   - Pokazanie jak szybko znaleźć wolontariuszy z konkretnymi umiejętnościami
   - Demonstracja statusów dostępności
   - Pokazanie jak przypisać wolontariuszy do zadania/wydarzenia

### Zakończenie (15s)
10. **Podsumowanie**
    - Krótkie przypomnienie kluczowych funkcji
    - Zakończenie nagrania

## Szacowany czas całkowity: 22-30 minut

## Kluczowe elementy techniczne

### Pliki do utworzenia:
1. **`src/locale/volunteers/pl_captions.json`** - teksty narracji po polsku
2. **`src/locale/volunteers/pl_values.json`** - dane formularzy po polsku
3. **`src/recordings/volunteers-guide.story.js`** - definicje kroków i pól formularzy
4. **`src/recordings/volunteers-guide.spec.js`** - główny skrypt nagrania
5. **`package.json`** - dodanie skryptu `npm run volunteers`

### Wzorce do wykorzystania:
- Użycie `showPageStep()` dla nawigacji między sekcjami
- Użycie `showCreateFormStep()` dla formularzy tworzenia
- Użycie `describeFormFields()` dla opisów pól
- Użycie `navigateViaHref()` dla nawigacji przez menu
- Użycie `showStandaloneCaption()` dla intro i podsumowań

### Dane testowe:
- Wolontariusz: "Jan Kowalski", urodzony 1990-05-15, email: jan.kowalski@example.com
- Umiejętność: "Pierwsza pomoc", poziom: "Zaawansowany"
- Rola: "Ratownik medyczny"
- Certyfikat: "Certyfikat pierwszej pomocy", ważny do: 2027-12-31
- Kurs: "Podstawy pierwszej pomocy", czas trwania: 16 godzin
- Zespół: "Zespół ratowniczy Warszawa"
- Program: "Program pomocy zimowej 2026"
- Szkolenie: "Szkolenie z pierwszej pomocy", data: 2026-06-15

### Timing:
- Intro captions: 3-5 sekund
- Nawigacja między sekcjami: 1.5-2 sekundy
- Opis pól formularza: według długości tekstu (SECONDS_PER_WORD)
- Pauzy po zapisie: 2-3 sekundy
- Zakończenie: 2 sekundy

## Uwagi implementacyjne

1. **Dwufazowa konfiguracja** - jak w innych nagraniach:
   - Pierwszy kontekst: login i setup
   - Drugi kontekst: nagrywanie z video

2. **Kolejność tworzenia**:
   - Najpierw katalogi (Skills, Roles, Certificates, Courses)
   - Potem wolontariusze (używają katalogów)
   - Następnie zespoły (używają wolontariuszy)
   - Szkolenia (używają kursów i wolontariuszy)
   - Programy (używają wolontariuszy)
   - Na końcu raporty (pokazują zebrane dane)

3. **Obsługa formularzy**:
   - Sprawdzenie czy pola są widoczne przed interakcją
   - Użycie `ifVisible: true` dla opcjonalnych pól
   - Fallback dla select'ów: `fallbackSelect: 'firstAvailable'`

4. **Integracja z istniejącymi danymi**:
   - Sprawdzenie czy w systemie są już jakieś dane
   - Możliwość użycia istniejących organizacji/lokalizacji
   - Unikalne nazwy z timestamp (jak w organization-setup)

5. **Zgodność z przewodnikiem**:
   - Wszystkie scenariusze z przewodnika powinny być pokryte
   - Teksty narracji powinny być zgodne z treścią przewodnika
   - Pokazanie praktycznych zastosowań, nie tylko suchej konfiguracji

## Następne kroki

1. ✅ Analiza struktury modułu - DONE
2. ✅ Przygotowanie planu nagrania - DONE
3. ⏳ Utworzenie pliku locale z tekstami narracji
4. ⏳ Implementacja story builder z definicjami formularzy
5. ⏳ Implementacja głównego skryptu nagrania
6. ⏳ Dodanie skryptu npm
7. ⏳ Testowanie i refinement
8. ⏳ Finalne nagranie

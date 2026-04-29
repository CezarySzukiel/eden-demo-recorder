# Dokumentacja modułu **Organizations** – Sahana Eden (sahana-eden.pl)

URL bazowy: `https://sahana-eden.pl/eden/org/`

## 1. Cel modułu
Moduł **Organizations** to centralny rejestr podmiotów humanitarnych w systemie Sahana Eden. Służy do katalogowania organizacji (NGO, agencje rządowe, ONZ, partnerzy, sieci itp.) wraz z ich biurami, placówkami operacyjnymi, zasobami, personelem, magazynami, zasobami sprzętowymi i projektami. Stanowi „kręgosłup” systemu – większość pozostałych modułów (Staff, Volunteers, Projects, Warehouses, Assets, Requests) odwołuje się do rekordów organizacji.

## 2. Główne sekcje (lewy submenu modułu)

| Sekcja | URL | Funkcja |
|---|---|---|
| **Organizations** | `/eden/org/organisation` | Lista i zarządzanie organizacjami |
| **Offices** | `/eden/org/office` | Biura organizacji (siedziby, oddziały) |
| **Facilities** | `/eden/org/facility` | Placówki operacyjne (np. szpitale, schroniska, punkty dystrybucji) |
| **Resources** | `/eden/org/resource/summary` | Zasoby fizyczne posiadane przez organizacje |
| **Organization Types** | `/eden/org/organisation_type` | Słownik typów organizacji (np. NGO, Government, UN) |
| **Office Types** | `/eden/org/office_type` | Słownik typów biur (HQ, Regional Office, Field Office) |
| **Facility Types** | `/eden/org/facility_type` | Słownik typów placówek |
| **Resource Types** | `/eden/org/resource_type` | Słownik typów zasobów |

Każda sekcja oferuje akcje: **Create**, **Import** (CSV) oraz – tam gdzie ma to sens – **Map** (widok mapy).

---

## 3. Organizations – rekord organizacji

### 3.1 Pola formularza (Create / Edit)
- **Name** *(wymagane)* – nazwa organizacji
- **Acronym** – skrót (np. „WHO”, „UNHCR”)
- **Type** – typ organizacji (powiązany ze słownikiem Organization Types; obsługa wielu typów przez tabelę linkującą)
- **Home Country** – kraj macierzysty (lista państw)
- **Phone #** – telefon kontaktowy
- **Website** – adres strony www
- **Year** – rok założenia
- **Logo** – plik graficzny (upload)
- **Comments** – uwagi/opis (textarea)

### 3.2 Lista organizacji
Kolumny tabeli: Name, Acronym, Type, Website. Akcja **Open** otwiera widok szczegółowy.

### 3.3 Filtry wyszukiwania
- **Search** – pełnotekstowe
- **Type** – po typie organizacji
- **Home Country** – po kraju

### 3.4 Zakładki rekordu organizacji (rheader tabs)
Po otwarciu rekordu (`/eden/org/organisation/{id}`) widoczne są zakładki:
1. **Basic Details** – pola podstawowe
2. **Offices** – biura tej organizacji
3. **Warehouses** – magazyny
4. **Staff & Volunteers** – personel i wolontariusze (Human Resources)
5. **Assets** – sprzęt/aktywa
6. **Projects** – projekty realizowane przez organizację
7. **Facilities** – placówki operacyjne

To pokazuje, że obiekt Organization jest „hubem” łączącym dane z wielu modułów Eden.

### 3.5 Operacje
- **Create** – ręczne tworzenie
- **Import** – masowy import z pliku CSV (konfigurowalny mapping kolumn)
- **Open / Edit / Delete** – zarządzanie rekordem
- **Search / Filter** – wyszukiwanie
- API REST web2py (`.json`, `.xml`, `.csv`) dostępne pod tymi samymi URL-ami

---

## 4. Offices – biura

### 4.1 Pola formularza
- **Name** *(wymagane)*, **Code**, **Organization** *(wymagane, FK)*, **Office Type**
- **Location** – lokalizacja hierarchiczna: Country → L1 (województwo) → L2 (powiat) → L3 (gmina) → L4
- **Street Address**, **Postcode**
- **Phone 1**, **Phone 2**, **Email**, **Fax**
- **Comments**

### 4.2 Funkcje
- Widok **Map** – wszystkie biura na mapie (geolokalizacja po polach Location)
- Import CSV
- Tabela hierarchiczna lokalizacji (zintegrowana z modułem GIS Eden)

---

## 5. Facilities – placówki

Placówki operacyjne (różnią się od biur – mogą to być np. punkty dystrybucji, schroniska, kliniki, kuchnie polowe).

### 5.1 Pola formularza
- **Name** *(wymagane)*, **Code**, **Facility Type**, **Organization**
- **Location** (Country/L1–L4), **Street Address**, **Postcode**
- **Opening Times** – godziny otwarcia
- **Contact**, **Phone 1**, **Phone 2**, **Email**, **Website**
- **Comments**

### 5.2 Funkcje
Create, Import CSV, mapa, możliwość typowania (Facility Types) i przypisywania do organizacji.

---

## 6. Resources – zasoby

Lekka ewidencja zasobów posiadanych przez organizacje (uzupełnienie w stosunku do pełnego modułu Assets).

### 6.1 Pola formularza
- **Organization** (FK)
- **Location** (Country/L1–L4 + Street Address + Postcode)
- **Resource Type** *(wymagane)*
- **Quantity** *(wymagane)*
- **Comments**

### 6.2 Widok
Domyślnie **Summary** (`/eden/org/resource/summary`) – widok podsumowujący agregujący ilości zasobów per typ/lokalizacja/organizacja.

---

## 7. Słowniki (Types)
Wszystkie cztery słowniki (Organization / Office / Facility / Resource Types) działają tak samo:
- **Create** – nowy typ
- Lista typów z możliwością edycji/usuwania
- Słowniki są używane jako wartości pól typ w rekordach głównych

To pozwala administratorowi dostosować taksonomię do realiów wdrożenia (np. dodać typ „Medical NGO” czy „Mobile Clinic”).

---

## 8. Powiązania między modułami
Organization (org_organisation) jest powiązana z:
- **hrm** (Staff & Volunteers) – pracownicy i wolontariusze
- **project** – projekty (organizacje wiodące, partnerskie, donorzy)
- **inv / warehouse** – magazyny i stany magazynowe
- **asset** – sprzęt/aktywa
- **req** – zgłoszenia/zapotrzebowania
- **gis** – lokalizacje (mapa)
- **doc** – dokumenty załączane do rekordów
- **pr** (Person Registry) – kontakty osobowe

---

## 9. Możliwości techniczne / administracyjne
- **Import CSV** dla każdej z list (mapowanie kolumn po stronie systemu)
- **Eksport / API** – web2py udostępnia każdy zasób jako JSON/XML/CSV (dodanie rozszerzenia do URL)
- **Mapa** – integracja z modułem GIS dla biur i placówek
- **Wielojęzyczność** – formularze i etykiety w 19 językach (m.in. polski)
- **Logo** – upload pliku, wykorzystywane w nagłówkach raportów
- **Hierarchia lokalizacji L1–L4** – zgodna z administracyjnym podziałem terytorialnym
- **Filtry zaawansowane** – po typie, kraju, tekstowe
- **Audit log** – web2py / Eden domyślnie loguje zmiany rekordów (dla użytkowników z rolą)
- **Uprawnienia rolowe** – po zalogowaniu jako pierwszy użytkownik (admin) widoczne są wszystkie akcje (Create, Import, Edit, Delete)

---

## 10. Typowy workflow użytkownika
1. Administrator dodaje **Organization Types** i **Office Types** dopasowane do operacji.
2. Tworzy lub importuje **Organizations** (np. partnerów humanitarnych).
3. Dla każdej organizacji dodaje **Offices** (siedziby, oddziały regionalne) oraz **Facilities** (np. punkty dystrybucji w terenie).
4. Loguje **Resources** posiadane przez organizacje (z lokalizacją i ilością).
5. W zakładkach rekordu organizacji łączy ją z **Staff/Volunteers**, **Projects**, **Warehouses**, **Assets**.
6. Dane są wykorzystywane w pozostałych modułach (Requests, Projects, Map) dzięki referencji do `org_organisation`.

---

## 11. Podsumowanie
Moduł **Organizations** w Sahana Eden zapewnia:
- Pełen rejestr organizacji humanitarnych z metadanymi (typ, kraj, kontakt, logo)
- Strukturalne mapowanie biur, placówek, zasobów
- Konfigurowalne taksonomie (typy organizacji/biur/placówek/zasobów)
- Geolokalizację (mapy) dla biur i placówek
- Bezpośrednie powiązania z personelem, projektami, magazynami, sprzętem i zapotrzebowaniami
- Import/eksport masowy (CSV) i API REST
- Wielojęzyczny interfejs i kontrolę uprawnień

Jest to centralny moduł referencyjny – większość operacyjnych danych w Eden „wisi” na rekordzie organizacji.

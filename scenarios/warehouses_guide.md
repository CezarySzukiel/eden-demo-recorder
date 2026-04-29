# Przewodnik po module **Warehouses** w Sahana Eden

> Praktyczny przewodnik dla koordynatorów logistyki humanitarnej – co daje moduł, kiedy go używać i jak prowadzi cię przez codzienną pracę magazynu.

URL bazowy: `https://sahana-eden.pl/eden/inv/` (oraz `/eden/supply/` dla katalogów produktów)

---

## 1. Czym jest moduł Warehouses?

**Warehouses** to magazynowo-logistyczne serce systemu Sahana Eden. To pełnoprawny **Warehouse Management System (WMS)** zaprojektowany specjalnie pod realia operacji humanitarnych: dystrybucji pomocy po katastrofach, akcji uchodźczych, programów zdrowotnych ONZ czy NGO.

W praktyce moduł odpowiada na pytania, które codziennie zadaje sobie każdy logistyk w terenie:

- *„Ile koców mamy jeszcze w magazynie w Lublinie i kiedy się skończą?"*
- *„Gdzie utknął transport leków, który wyjechał wczoraj z Warszawy?"*
- *„Które partie żywności tracą ważność w przyszłym miesiącu?"*
- *„Czy mamy czym zrealizować zapotrzebowanie z Krakowa, czy musimy zamówić u dostawcy?"*
- *„Komu, ile i kiedy wydaliśmy paczki w punkcie dystrybucji X?"*

Eden łączy te wszystkie pytania w jeden spójny przepływ pracy: **katalog → magazyn → przyjęcie → stan → wysyłka → odbiór → dystrybucja → raport**.

---

## 2. Do czego służy ten moduł?

### 2.1 Centralizacja informacji o magazynach
Zamiast Excelii rozsianych po komputerach koordynatorów, każdy magazyn jest jednym rekordem w bazie z lokalizacją (na mapie GIS), pojemnością, kontaktem i przypisaną organizacją. Każdy uprawniony użytkownik widzi ten sam, aktualny obraz.

### 2.2 Pełna kontrola stanu magazynowego
Eden śledzi nie tylko „ile sztuk", ale też **partię (lot)**, **datę ważności**, **właściciela** (towar może być fizycznie w naszym magazynie, ale formalnie należeć do innej organizacji), **wartość pieniężną** i kategorię. To jest absolutnie kluczowe w pomocy humanitarnej, gdzie żywność i leki mają krótki termin ważności, a darczyńcy żądają rozliczenia co do partii.

### 2.3 Cyfrowe dokumenty wysyłki i przyjęcia
Każdy waybill, PO i REQ ma swój rekord w systemie – z numerem, datą, kierowcą, numerem rejestracyjnym pojazdu, osobą odbierającą. Koniec z papierami gubionymi w trasie.

### 2.4 Dopasowanie zapotrzebowań do stanu
Gdy z terenu przychodzi zapotrzebowanie (Request), Eden potrafi automatycznie **dopasować** je do dostępnego stanu w magazynach, pozwala **zarezerwować (commit)** towar i jednym kliknięciem wygenerować z tego wysyłkę. To skraca cykl decyzyjny z dni do minut.

### 2.5 Dystrybucja do beneficjentów
Końcowy „last mile" – wydawanie pomocy konkretnym osobom – również jest pokryty (moduł Distributions). Eden zapisuje, komu i co zostało wydane, co jest podstawą rozliczeń wobec donorów.

### 2.6 Raportowanie i audyt
Moduł generuje gotowe raporty, które realnie potrzebujesz: **lista pozycji blisko terminu ważności**, **wartość inwentarza**, **podsumowanie przyjęć i wydań w okresie**, **wykorzystanie zasobów**. Każda zmiana stanu jest logowana – masz pełen ślad audytowy dla donora.

---

## 3. Kiedy sięgnąć po Warehouses?

✅ Prowadzisz magazyn pomocy humanitarnej (NGO, samorząd, agencja ONZ).
✅ Masz więcej niż jedną lokalizację magazynową i potrzebujesz wspólnego widoku.
✅ Pracujesz z partiami i terminami ważności (żywność, leki, kosmetyki).
✅ Musisz raportować do donora – ile, czego, dla kogo.
✅ Wysyłki jeżdżą między magazynami i potrzebujesz tracking-u.
✅ Chcesz powiązać magazyn z organizacją, projektem, personelem i sprzętem (Eden robi to natywnie).

---

## 4. Mapa modułu – co znajdziesz w submenu

| Sekcja | Do czego służy |
|---|---|
| **Warehouses** (`/eden/inv/warehouse`) | Tworzysz i edytujesz magazyny – „kontenery", w których trzymasz stan. |
| **Reports** (`/eden/inv/inv_item`) | Centrum analityki – stany, terminy ważności, wartość, wykorzystanie. |
| **Adjust Stock Levels** (`/eden/inv/adj`) | Korekty po inwentaryzacji (zniknęło? uszkodzone? znaleźli się?). |
| **Kitting** (`/eden/inv/kitting`) | Składasz pakiety pomocowe (np. „Family Kit") z pojedynczych pozycji. |
| **Received Shipments** (`/eden/inv/recv`) | Przyjmujesz dostawę: od dostawcy, z innego magazynu, jako darowiznę. |
| **Sent Shipments** (`/eden/inv/send`) | Wysyłasz towar: do innego magazynu, do placówki, do organizacji. |
| **Search Shipped Items** (`/eden/inv/track_item`) | Znajdujesz dowolną pozycję, która jest aktualnie w transporcie. |
| **Distributions** (`/eden/supply/distribution`) | Wydajesz pomoc beneficjentom – „last mile". |
| **Items / Catalogs / Categories** (`/eden/supply/...`) | Definiujesz „co" w ogóle istnieje w twoim świecie (produkty, jednostki, kategorie). |
| **Suppliers** (`/eden/inv/supplier`) | Rejestr dostawców z kontaktami i krajem. |
| **Facilities** (`/eden/inv/facility`) | Inne placówki uczestniczące w łańcuchu dostaw. |
| **Warehouse Types / Facility Types** | Słowniki typów – konfigurujesz raz, używasz wszędzie. |

---

## 5. Magazyn (Warehouse) – serce modułu

### 5.1 Po co tworzysz rekord magazynu?
Żeby Eden wiedział, **gdzie fizycznie** trzymasz stan, **kto** za niego odpowiada i **ile się tam zmieści**. To jest „tożsamość" magazynu w systemie.

### 5.2 Jakie dane podajesz?
- **Nazwa** i **kod** – jednoznacznie identyfikują magazyn.
- **Organizacja** – kto jest właścicielem operacyjnym.
- **Typ magazynu** – np. centralny, terenowy, mobilny, chłodnia.
- **Lokalizacja** w hierarchii Country → L1 → L2 → L3 → L4 + adres + kod pocztowy. Dzięki temu magazyn pojawi się **na mapie GIS**, a system zrozumie, że Lublin to L1 = lubelskie.
- **Capacity (m³)** i **Free Capacity (m³)** – pojemność całkowita i wolna. Eden monitoruje, czy się zmieścisz z kolejną dostawą.
- **Contact / Phone / Email / Fax** – kierownik magazynu i kontakt awaryjny.

### 5.3 Co masz w zakładkach rekordu magazynu?

Po otwarciu magazynu zobaczysz pasek zakładek (rheader tabs) – każda to inny aspekt jego życia:

1. **Basic Details** – dane z formularza.
2. **Staff** – ludzie pracujący w tym magazynie. Klikniesz „dodaj" i przypiszesz osobę z modułu HRM.
3. **Assets** – sprzęt fizyczny (wózki widłowe, generatory, agregaty chłodnicze).
4. **Stock** – serce magazynu: lista pozycji, ilości, partie, daty ważności.
5. **Receive** – wszystkie przyjęcia tego magazynu (historia + nowe).
6. **Send** – wszystkie wysyłki z tego magazynu.
7. **Requests** – zapotrzebowania, które wpłynęły lub są kierowane do magazynu.
8. **Match Requests** – Eden sam pokazuje, które REQ-y możesz zrealizować ze swojego stanu.
9. **Commit** – rezerwacje stanu pod konkretne REQ-y (towar nie zostanie wydany komuś innemu).
10. **Attachments** – dokumenty (PDF, zdjęcia) podpięte pod magazyn (np. zdjęcia uszkodzeń, polisa ubezpieczeniowa).

---

## 6. Stock – stan magazynowy

To główny rejestr „co tu jest". Pojedyncza pozycja stanu (`inv_item`) opisuje:

- **Item** – którą pozycję z katalogu trzymasz (np. „Koc 2×2 m, polar").
- **Ilość + jednostka** – 250 sztuk / 30 kg / 100 litrów.
- **Lot (numer partii)** – kluczowe dla żywności i leków.
- **Expiry Date** – data ważności. Eden alarmuje raportem zbliżające się terminy.
- **Owner / Source** – formalny właściciel (np. „darowizna od WHO – nie sprzedawać").
- **Bin / Location wewnątrz magazynu** – półka, regał.
- **Wartość pieniężna** – używana w raporcie monetization.

W praktyce: kierownik magazynu nie tworzy ręcznie stanu – stan **rośnie automatycznie** przy zatwierdzeniu Receive i **maleje automatycznie** przy zatwierdzeniu Send. Stock to widok-prawda.

---

## 7. Przyjęcia (Receive) – jak wprowadzić towar

**Po co?** Każda dostawa do magazynu, niezależnie czy od dostawcy, z innego magazynu czy jako darowizna, musi być udokumentowana – inaczej stan nie wzrośnie.

**Jak działa workflow?**
1. Tworzysz **nagłówek** przyjęcia (kto wysyła, kto odbiera, typ, daty, numery dokumentów).
2. Dodajesz **pozycje** dostawy (z katalogu) – ilość, partia, termin ważności.
3. Status: **Draft** → **In Process** → **Received**. Po zatwierdzeniu pozycje trafiają do Stock automatycznie.

**Pola formularza Receive:**
- *Facility (Recipient)*** – dokąd przyjmujesz.
- *Shipment Type*** – typ (np. „From Other Warehouse", „From Supplier", „Donation", „Procurement").
- *Organization / Supplier***, *From Facility***.
- *Date Received*, *Waybill Number*, *PO Number*, *REQ Number*.
- *Received By* – osoba odbierająca (z rejestru osób).
- *Comments*.

---

## 8. Wysyłki (Send) – jak wydać towar

**Po co?** Aby ruszyć towar z magazynu – do innego magazynu, do placówki w terenie, do organizacji partnerskiej. System utrzymuje pełną widoczność „w transporcie".

**Workflow**: **Draft** → **In Process** → **Sent** → **In Transit** → **Received** (po drugiej stronie).

**Pola formularza Send** – zwróć uwagę, że są tu informacje o transporcie, których nie ma w Receive:
- *REQ Number* – pod którego zapotrzebowanie wysyłasz.
- *From Facility*** – z którego magazynu.
- *Shipment Type*** – kategoria wysyłki.
- *To Facility* lub *To Organization* – cel.
- *Sent By*, *To Person*.
- **Name of Driver / Driver Phone Number / Vehicle Plate Number** – dane kierowcy i pojazdu (kluczowe dla śledzenia w terenie).
- *Time Out* – czas wyjazdu.
- *Comments*.

Po zatwierdzeniu wysyłki Eden zmniejsza Stock magazynu źródłowego. Po odebraniu po drugiej stronie (jako Receive z waybill) – zwiększa Stock magazynu docelowego. Tracking jest spójny end-to-end.

---

## 9. Search Shipped Items – gdzie jest mój towar?

Praktyczne narzędzie kryzysowe: szukasz pozycji po nazwie, partii, dacie albo numerze waybill i widzisz, gdzie aktualnie są wysyłki, które ją zawierają. „Lek X – 3 paczki – w transporcie z Warszawy do Kijowa, kierowca 600-…, planowy odbiór jutro 10:00".

---

## 10. Adjust Stock – korekty inwentarzowe

Realność: zawsze jest różnica między Excelem a magazynem. Adjustments służą do zaksięgowania tych różnic z udokumentowaną przyczyną:
- **Strata** (pożar, kradzież)
- **Uszkodzenie** (zalanie, nieświeże)
- **Nadwyżka** (znalazło się więcej niż w systemie)
- **Inwentaryzacja**

Każda korekta zostaje w bazie z autorem, datą i komentarzem – masz to przed komisją donora.

---

## 11. Kitting – składanie pakietów pomocowych

Często wydajesz pomoc nie pojedynczo, lecz w **standardowych pakietach** („Hygiene Kit": 2 ręczniki + 5 mydeł + 1 szczoteczka + …). Kitting:

1. Definiujesz, z czego składa się kit.
2. Eden **zdejmuje składniki ze stocku** (każdy jako oddzielna pozycja).
3. Tworzy nowy item-kit, który jest gotowy do wysyłki/dystrybucji jako jedna jednostka.

Skraca to operacje wydania w terenie i ujednolica raportowanie.

---

## 12. Catalogs / Items / Categories – fundament katalogowy

Zanim cokolwiek wprowadzisz na stan, system musi wiedzieć, **co w ogóle istnieje**.

- **Catalog** – grupa pozycji, np. „Standard NFI Catalog", „Medical Catalog 2026". Jeden magazyn / projekt może używać konkretnego katalogu.
- **Item Category** – hierarchiczne kategorie (Food → Cereals → Rice; Health → Medicines; Shelter → Tarps).
- **Item** – konkretna pozycja: nazwa, kod, **jednostka miary**, marka, model, rok produkcji.

To raz definiujesz na poziomie organizacji, a potem używasz wszędzie. Możesz też zaimportować gotowe katalogi (np. UN OCHA, Sphere) z pliku CSV.

---

## 13. Suppliers – dostawcy

Rejestr dostawców (komercyjnych i darczyńców). Przy każdym przyjęciu wybierasz dostawcę z listy, więc historia „od kogo i ile dostaliśmy" jest automatyczna. Idealne do raportowania donorom i pod audyt.

---

## 14. Distributions – ostatnia mila

Końcowy etap pomocy: **wydanie beneficjentowi**. Rejestrujesz:
- co, ile, kiedy zostało wydane,
- komu (z rejestru osób / gospodarstw domowych),
- w której lokalizacji.

To zamyka cykl logistyczny. Bez Distribution wszystko zostaje teoretyczne – nie wiesz, czy pomoc dotarła do ludzi.

---

## 15. Match Requests + Commit – inteligentne dopasowanie

To prawdopodobnie **najbardziej wartościowa funkcja** modułu w warunkach kryzysowych:

1. W module **Requests** wpada zapotrzebowanie z terenu (REQ).
2. W zakładce **Match Requests** twojego magazynu Eden pokazuje, czy i ile możesz tego REQ pokryć ze swojego stanu.
3. Klikasz **Commit** – rezerwujesz konkretną ilość pod ten REQ. Inna osoba nie wyśle tego komuś innemu.
4. Z commit-u jednym kliknięciem generujesz **Send Shipment** – nagłówek wysyłki jest już wypełniony.

Tradycyjny workflow „telefon – Excel – mail – papier" kompresuje się do kilku kliknięć.

---

## 16. Raporty – co naprawdę dzieje się w magazynach

| Raport | Do czego |
|---|---|
| **Warehouse Stock** | Aktualne stany w przekroju magazyn × pozycja × kategoria. |
| **Expiration Report** | Kolejka pozycji bliskich końca ważności – planuj dystrybucję pierwszą! |
| **Monetization Report** | Wartość inwentarza w pieniądzu (dla bilansu, dla donora). |
| **Utilization Report** | Jak intensywnie używasz danego zasobu / magazynu. |
| **Summary of Incoming Supplies** | Co przyjęliśmy w okresie (tygodniowy/miesięczny). |
| **Summary of Releases** | Co wydaliśmy w okresie. |

Wszystkie raporty pozwalają **grupować po dowolnym polu**, **filtrować**, **eksportować do CSV/JSON**.

---

## 17. Możliwości techniczne i administracyjne

- **Import / Export CSV** dla każdej listy – idealne na start projektu (zaimportuj 5 000 pozycji w jednym pliku).
- **REST API web2py** – dodanie `.json` / `.xml` / `.csv` do dowolnego URL-u zasobu. Łatwa integracja z innymi systemami i dashboardami.
- **Wielojęzyczność** – formularze i etykiety w 19 językach (m.in. polski, angielski, ukraiński, arabski).
- **Mapa GIS** – każdy magazyn i placówka ma współrzędne i pojawia się na mapie operacyjnej.
- **Audit log** – każda zmiana stanu/dokumentu jest logowana.
- **Role i uprawnienia** – pierwszy zarejestrowany użytkownik dostaje rolę admina; możesz potem nadawać role per organizacja, per moduł, per akcja (read/create/update/delete).
- **Powiązania międzymodułowe** – moduł rozmawia natywnie z **Organizations**, **Facilities**, **Requests**, **Assets**, **HRM (Staff & Volunteers)**, **Documents**, **Projects**, **Map (GIS)**.

---

## 18. Typowy przepływ pracy – krok po kroku

1. **Konfiguracja jednorazowa**: utwórz Warehouse Types, Catalog, Item Categories, Items, Suppliers.
2. **Tworzysz magazyn** (Warehouse) z lokalizacją i pojemnością.
3. **Przyjęcie**: Receive → dodaj pozycje (z partiami i terminami) → zatwierdź → **Stock rośnie**.
4. **Zapotrzebowanie z terenu**: w module Requests wpada REQ.
5. **Match & Commit**: w zakładce magazynu dopasowujesz REQ do stanu i rezerwujesz.
6. **Wysyłka**: Send → uzupełniasz kierowcę i pojazd → Sent → **Stock maleje**.
7. **Odbiór po drugiej stronie**: Receive (na podstawie waybill) → **Stock w celu rośnie**.
8. **Dystrybucja**: Distribution do beneficjentów.
9. **Inwentaryzacja**: Adj → korekty.
10. **Raporty**: codzienny przegląd – stan, terminy, wartość, ruchy.

---

## 19. Najczęstsze błędy i jak ich uniknąć

- **Nie pomijaj słowników (Types, Categories)** – inaczej później musisz wracać i porządkować raporty.
- **Pilnuj statusu wysyłki** – „Draft" nie zmniejsza stanu; dopiero „Sent" rusza inwentarz.
- **Wpisuj Lot i Expiry Date przy Receive** – bez tego raport Expiration jest bezużyteczny.
- **Używaj Commit zamiast „nieformalnych" rezerwacji w Excelu** – inaczej dwie osoby wyślą ten sam towar.
- **Adjust po inwentaryzacji**, a nie ręczna edycja Stock – zachowujesz ślad audytowy.

---

## 20. Podsumowanie

Moduł **Warehouses** zamienia chaotyczną logistykę humanitarną w spójny, audytowalny proces. Daje ci:

- jeden widok wszystkich magazynów i ich stanów,
- pełen tracking partii i terminów ważności,
- cyfrowe dokumenty Receive / Send z danymi kierowców,
- inteligentne dopasowywanie zapotrzebowań do stanu (Match + Commit),
- gotowe raporty operacyjne i finansowe,
- końcową ewidencję dystrybucji do beneficjentów,
- otwarte API i import CSV do integracji.

Jeśli organizujesz pomoc humanitarną w więcej niż jednej lokalizacji – ten moduł oszczędzi ci tygodni pracy i, co ważniejsze, da pewność, że pomoc trafia do właściwych ludzi we właściwym czasie.

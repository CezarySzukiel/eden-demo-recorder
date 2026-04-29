const path = require('path');
const { test, expect } = require('playwright/test');
const locale = require('../locale/warehouse/pl_gpt.json');
const { localeText } = require('../helpers/locale');
const { RECORDING_VIEWPORT } = require('../helpers/recording-size');
const {
  describeFormFields,
  showCreateFormStep,
  showPageStep,
} = require('../helpers/recording-steps');
const {
  clearDemoCaption,
  describeAndClick,
  describeOnly,
  enableDemoCaptions,
  enableDemoCursor,
  loadEnvCredentials,
  loginUser,
  RECORDING_FINISH_DELAY_MS,
  saveRecordedVideo,
  showStandaloneCaption,
} = require('../helpers/eden-demo');

function t(key, fallback = '') {
  return localeText(locale, key, fallback);
}

function field(selector, key, fallback) {
  return {
    selector,
    description: t(key, fallback),
  };
}

function resolveField(fieldConfig) {
  if (fieldConfig.description) {
    return fieldConfig;
  }

  return field(fieldConfig.selector, fieldConfig.key, fieldConfig.fallback);
}

function createFormStep({
  sectionHref,
  sectionKey,
  sectionFallback,
  createHref,
  createKey,
  createFallback,
  firstFieldSelector,
  fields,
}) {
  return {
    sectionHref,
    sectionDescription: t(sectionKey, sectionFallback),
    createHref,
    createDescription: t(createKey, createFallback),
    firstFieldSelector,
    fields: fields.map(resolveField),
  };
}

async function showLocalePageStep(page, href, description) {
  await showPageStep(page, { href, description }, { delay: 2000 });
}

async function describeLocaleFormFields(page, fields) {
  await describeFormFields(page, fields.map(resolveField));
}

async function showLocaleCreateFormStep(page, sectionHref, sectionKey, sectionFallback, createHref, createKey, createFallback, firstFieldSelector, fields) {
  await showCreateFormStep(
    page,
    createFormStep({
      sectionHref,
      sectionKey,
      sectionFallback,
      createHref,
      createKey,
      createFallback,
      firstFieldSelector,
      fields,
    }),
    { delay: 2000 },
  );
}

test('records warehouses extended guide', async ({ browser, baseURL }) => {
  const user = loadEnvCredentials();
  const setupContext = await browser.newContext({ baseURL });
  const setupPage = await setupContext.newPage();

  await loginUser(setupPage, user);

  const storageState = await setupContext.storageState();
  await setupContext.close();

  const recordedContext = await browser.newContext({
    baseURL,
    storageState,
    viewport: RECORDING_VIEWPORT,
    recordVideo: {
      dir: path.join(process.cwd(), 'artifacts/demo-results'),
      size: RECORDING_VIEWPORT,
    },
  });
  const page = await recordedContext.newPage();

  await enableDemoCursor(page);
  await enableDemoCaptions(page);

  await page.goto('/eden/inv/index', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');

  await showStandaloneCaption(
    page,
    t('module_warehouses_purpose', 'Moduł Warehouses - rozszerzony przewodnik.'),
    3000,
  );
  await describeOnly(
    page.locator('h1, h2').first(),
    t('section_warehouses', 'Przeglądamy kluczowe sekcje modułu Warehouses.'),
    2200,
  );

  await showLocaleCreateFormStep(
    page,
    '/eden/inv/warehouse_type',
    'section_warehouse_types',
    'Sekcja Warehouse Types.',
    '/eden/inv/warehouse_type/create',
    'create_warehouse_type',
    'Przechodzimy do formularza tworzenia typu magazynu.',
    '#inv_warehouse_type_name',
    [
      { selector: '#inv_warehouse_type_name', key: 'warehouse_type_name', fallback: 'Name — nazwa typu magazynu, np. magazyn centralny, chłodnia albo magazyn polowy.' },
      { selector: '#inv_warehouse_type_comments', key: 'warehouse_type_comments', fallback: 'Comments — opis typu magazynu i zasad jego użycia.' },
    ],
  );

  await showLocaleCreateFormStep(
    page,
    '/eden/supply/catalog',
    'section_catalogs',
    'Sekcja Catalogs.',
    '/eden/supply/catalog/create',
    'create_catalog',
    'Przechodzimy do formularza tworzenia katalogu.',
    '#supply_catalog_name',
    [
      { selector: '#supply_catalog_organisation_id', key: 'catalog_organization', fallback: 'Organization — organizacja, dla której tworzony jest katalog.' },
      { selector: '#supply_catalog_name', key: 'catalog_name', fallback: 'Name — nazwa katalogu.' },
      { selector: '#supply_catalog_active', key: 'catalog_active', fallback: 'Active — informacja, czy katalog ma być używany w bieżącej pracy.' },
      { selector: '#supply_catalog_comments', key: 'catalog_comments', fallback: 'Comments — dodatkowy opis katalogu.' },
    ],
  );

  await showLocaleCreateFormStep(
    page,
    '/eden/supply/item_category',
    'section_item_categories',
    'Sekcja Item Categories.',
    '/eden/supply/item_category/create',
    'create_item_category',
    'Przechodzimy do formularza tworzenia kategorii pozycji.',
    '#supply_item_category_name',
    [
      { selector: '#supply_item_category_catalog_id', key: 'item_category_catalog', fallback: 'Catalog — katalog, w którym tworzymy kategorię.' },
      { selector: '#supply_item_category_code', key: 'item_category_code', fallback: 'Code — skrót lub kod kategorii.' },
      { selector: '#supply_item_category_name', key: 'item_category_name', fallback: 'Name — nazwa kategorii.' },
      { selector: '#supply_item_category_can_be_asset', key: 'item_category_assets', fallback: 'Items in Category can be Assets — czy pozycje mogą być środkami trwałymi.' },
      { selector: '#supply_item_category_is_vehicle', key: 'item_category_vehicles', fallback: 'Items in Category are Vehicles — czy ta kategoria opisuje pojazdy.' },
      { selector: '#supply_item_category_comments', key: 'item_category_comments', fallback: 'Comments — dodatkowe zasady używania kategorii.' },
    ],
  );

  await showLocaleCreateFormStep(
    page,
    ['/eden/supply/item/summary', '/eden/supply/item'],
    'section_items',
    'Sekcja Items.',
    '/eden/supply/item/create',
    'create_item',
    'Przechodzimy do formularza tworzenia pozycji magazynowej.',
    '#supply_item_name',
    [
      { selector: '#supply_item_catalog_id', key: 'item_catalog', fallback: 'Catalog — katalog, do którego trafia produkt.' },
      { selector: '#supply_item_item_category_id', key: 'item_category', fallback: 'Category — kategoria produktu.' },
      { selector: '#supply_item_code', key: 'item_code', fallback: 'Code — kod produktu.' },
      { selector: '#supply_item_name', key: 'item_name', fallback: 'Name — nazwa produktu.' },
      { selector: '#supply_item_um', key: 'item_unit', fallback: 'Unit of Measure — jednostka miary.' },
      { selector: '#supply_item_brand_id', key: 'item_brand', fallback: 'Brand — marka produktu.' },
      { selector: '#supply_item_model', key: 'item_model', fallback: 'Model/Type — model lub wariant produktu.' },
      { selector: '#supply_item_year', key: 'item_year', fallback: 'Year of Manufacture — rok produkcji.' },
      { selector: '#supply_item_comments', key: 'item_comments', fallback: 'Comments — dodatkowe informacje o produkcie.' },
    ],
  );

  await showLocaleCreateFormStep(
    page,
    '/eden/inv/supplier',
    'section_suppliers',
    'Sekcja Suppliers.',
    '/eden/inv/supplier/create',
    'create_supplier',
    'Przechodzimy do formularza tworzenia dostawcy.',
    '#org_organisation_name',
    [
      { selector: '#org_organisation_name', key: 'supplier_name', fallback: 'Name — nazwa dostawcy.' },
      { selector: '#org_organisation_acronym', key: 'supplier_acronym', fallback: 'Acronym — skrót nazwy dostawcy.' },
      { selector: '#link_defaultorganisation_type_ms', key: 'supplier_type', fallback: 'Supplier — typ organizacji ustawiony jako dostawca.' },
      { selector: '#org_organisation_country', key: 'supplier_country', fallback: 'Home Country — kraj rejestracji dostawcy.' },
      { selector: '#org_organisation_phone', key: 'supplier_phone', fallback: 'Phone # — numer telefonu.' },
      { selector: '#org_organisation_website', key: 'supplier_website', fallback: 'Website — strona internetowa.' },
      { selector: '#org_organisation_year', key: 'supplier_year', fallback: 'Year — rok założenia.' },
      { selector: '#org_organisation_logo', key: 'supplier_logo', fallback: 'Logo — plik z logo dostawcy.' },
      { selector: '#org_organisation_comments', key: 'supplier_comments', fallback: 'Comments — notatki o współpracy z dostawcą.' },
    ],
  );

  await showLocaleCreateFormStep(
    page,
    '/eden/inv/warehouse',
    'section_warehouses',
    'Sekcja Warehouses.',
    '/eden/inv/warehouse/create',
    'create_warehouse',
    'Przechodzimy do formularza tworzenia magazynu.',
    '#inv_warehouse_name',
    [
      { selector: '#inv_warehouse_name', key: 'warehouse_name', fallback: 'Name — nazwa magazynu.' },
      { selector: '#inv_warehouse_code', key: 'warehouse_code', fallback: 'Code — kod magazynu.' },
      { selector: '#inv_warehouse_organisation_id', key: 'warehouse_organization', fallback: 'Organization — organizacja właścicielska.' },
      { selector: '#inv_warehouse_warehouse_type_id', key: 'warehouse_type', fallback: 'Warehouse Type — typ magazynu.' },
      { selector: '#inv_warehouse_location_id_L0', key: 'warehouse_country', fallback: 'Country — kraj lokalizacji magazynu.' },
      { selector: '#inv_warehouse_location_id_address', key: 'warehouse_address', fallback: 'Street Address — adres magazynu.' },
      { selector: '#inv_warehouse_capacity', key: 'warehouse_capacity', fallback: 'Capacity — pojemność magazynu.' },
      { selector: '#inv_warehouse_contact', key: 'warehouse_contact', fallback: 'Contact — osoba kontaktowa.' },
      { selector: '#inv_warehouse_email', key: 'warehouse_email', fallback: 'Email — adres e-mail magazynu.' },
      { selector: '#inv_warehouse_comments', key: 'warehouse_comments', fallback: 'Comments — dodatkowe informacje o magazynie.' },
    ],
  );

  await showLocaleCreateFormStep(
    page,
    '/eden/inv/recv',
    'section_received_shipments',
    'Sekcja Received/Incoming Shipments.',
    '/eden/inv/recv/create',
    'create_received_shipment',
    'Przechodzimy do formularza przyjęcia przesyłki.',
    '#inv_recv_site_id',
    [
      { selector: '#inv_recv_site_id', key: 'incoming_facility', fallback: 'Facility — magazyn przyjmujący.' },
      { selector: '#inv_recv_type', key: 'incoming_shipment_type', fallback: 'Shipment Type — typ przyjęcia.' },
      { selector: '#inv_recv_date', key: 'incoming_date', fallback: 'Date Received — data przyjęcia.' },
      { selector: '#inv_recv_send_ref', key: 'incoming_waybill_number', fallback: 'Waybill Number — numer listu przewozowego.' },
      { selector: '#inv_recv_purchase_ref', key: 'incoming_po_number', fallback: 'PO Number — numer zamówienia.' },
      { selector: '#inv_recv_req_ref', key: 'incoming_req_number', fallback: 'REQ Number — powiązane zapotrzebowanie.' },
      { selector: '#dummy_inv_recv_recipient_id', key: 'incoming_received_by', fallback: 'Received By — osoba przyjmująca dostawę.' },
      { selector: '#inv_recv_comments', key: 'incoming_comments', fallback: 'Comments — uwagi do przyjęcia.' },
    ],
  );

  await showLocaleCreateFormStep(
    page,
    '/eden/inv/send',
    'section_sent_shipments',
    'Sekcja Sent Shipments.',
    '/eden/inv/send/create',
    'create_sent_shipment',
    'Przechodzimy do formularza wysyłki.',
    '#inv_send_site_id',
    [
      { selector: '#inv_send_site_id', key: 'sent_from_facility', fallback: 'From Facility — magazyn nadawczy.' },
      { selector: '#inv_send_type', key: 'sent_shipment_type', fallback: 'Shipment Type — typ wysyłki.' },
      { selector: '#inv_send_req_ref', key: 'sent_req_number', fallback: 'REQ Number — powiązane zapotrzebowanie.' },
      { selector: '#inv_send_to_site_id', key: 'sent_to_facility', fallback: 'To Facility — magazyn docelowy.' },
      { selector: '#inv_send_organisation_id', key: 'sent_to_organization', fallback: 'To Organization — organizacja odbiorcy.' },
      { selector: '#dummy_inv_send_sender_id', key: 'sent_sent_by', fallback: 'Sent By — osoba odpowiedzialna za wydanie.' },
      { selector: '#dummy_inv_send_recipient_id', key: 'sent_to_person', fallback: 'To Person — odbiorca imienny.' },
      { selector: '#inv_send_driver_name', key: 'sent_driver_name', fallback: 'Name of Driver — kierowca.' },
      { selector: '#inv_send_driver_phone', key: 'sent_driver_phone', fallback: 'Driver Phone Number — telefon kierowcy.' },
      { selector: '#inv_send_vehicle_plate_no', key: 'sent_vehicle_plate', fallback: 'Vehicle Plate Number — numer rejestracyjny.' },
      { selector: '#inv_send_time_out', key: 'sent_time_out', fallback: 'Time Out — czas wyjazdu.' },
      { selector: '#inv_send_comments', key: 'sent_comments', fallback: 'Comments — uwagi do wysyłki.' },
    ],
  );

  await showLocaleCreateFormStep(
    page,
    '/eden/req/req',
    'section_requests',
    'Sekcja Requests.',
    '/eden/req/req/create',
    'create_request',
    'Przechodzimy do formularza tworzenia zapotrzebowania.',
    '#req_req_site_id',
    [
      { selector: '#req_req_type', key: 'request_type', fallback: 'Request Type — czy zapotrzebowanie dotyczy stocku, ludzi czy innych zasobów.' },
      { selector: '#req_req_req_ref', key: 'request_ref', fallback: 'REQ Number — numer zapotrzebowania.' },
      { selector: '#req_req_date', key: 'request_date', fallback: 'Date Requested — data zgłoszenia.' },
      { selector: '#req_req_priority', key: 'request_priority', fallback: 'Priority — priorytet potrzeby.' },
      { selector: '#req_req_site_id', key: 'request_site', fallback: 'Requested For Facility — placówka, dla której zgłaszamy potrzebę.' },
      { selector: '#req_req_purpose', key: 'request_purpose', fallback: 'Purpose — cel zapotrzebowania.' },
      { selector: '#req_req_date_required', key: 'request_date_required', fallback: 'Date Needed By — termin, do którego zasoby są potrzebne.' },
      { selector: '#dummy_req_req_requester_id', key: 'request_requester', fallback: 'Requester — osoba zgłaszająca.' },
      { selector: '#req_req_comments', key: 'request_comments', fallback: 'Comments — dodatkowe uwagi.' },
    ],
  );

  await showLocaleCreateFormStep(
    page,
    '/eden/req/commit',
    'section_commitments',
    'Sekcja Commitments.',
    '/eden/req/commit/create',
    'create_commitment',
    'Przechodzimy do formularza tworzenia zobowiązania.',
    '#req_commit_site_id',
    [
      { selector: '#req_commit_site_id', key: 'commitment_from_facility', fallback: 'From Facility — placówka lub magazyn, z którego deklarujemy zasoby.' },
      { selector: '#req_commit_req_id', key: 'commitment_request', fallback: 'Request — zapotrzebowanie, do którego przypisujemy zobowiązanie.' },
      { selector: '#req_commit_date', key: 'commitment_date', fallback: 'Date — data złożenia deklaracji.' },
      { selector: '#req_commit_date_available', key: 'commitment_date_available', fallback: 'Date Available — kiedy zasoby będą dostępne.' },
      { selector: '#dummy_req_commit_committer_id', key: 'commitment_committed_by', fallback: 'Committed By — osoba składająca zobowiązanie.' },
      { selector: '#req_commit_comments', key: 'commitment_comments', fallback: 'Comments — dodatkowe informacje o zobowiązaniu.' },
    ],
  );

  await showLocalePageStep(
    page,
    ['/eden/supply/distribution', '/eden/inv/distribution', '/eden/dvr/distribution'],
    t('section_distributions', 'Sekcja Distributions.'),
  );
  await showLocalePageStep(page, '/eden/supply/distribution/create', t('create_distribution', 'Rejestracja dystrybucji.'));
  await expect(page.locator('#supply_distribution_organisation_id')).toBeVisible();
  await describeLocaleFormFields(page, [
    { selector: '#supply_distribution_organisation_id', key: 'distribution_organization', fallback: 'Organization — organizacja odpowiedzialna za dystrybucję.' },
    { selector: '#supply_distribution_date', key: 'distribution_date', fallback: 'Date — data dystrybucji.' },
    { selector: '#dummy_supply_distribution_person_id', key: 'distribution_recipient', fallback: 'Recipient — odbiorca pomocy.' },
    { selector: '#supply_distribution_human_resource_id', key: 'distribution_staff_member', fallback: 'Staff Member in Charge — osoba koordynująca dystrybucję.' },
  ]);

  await showLocalePageStep(page, '/eden/inv/adj', t('section_stock_counts', 'Sekcja Stock Counts / korekty stanów.'));
  await describeAndClick(
    page.locator('#show-add-btn'),
    t('create_stock_count', 'Przechodzimy do formularza dodania nowej inwentaryzacji.'),
  );
  await expect(page.locator('#inv_adj_site_id')).toBeVisible();
  await describeOnly(page.locator('#dummy_inv_adj_adjuster_id'), t('stock_count_actioning_officer', 'Osoba odpowiedzialna za spis.'));
  await describeOnly(page.locator('#inv_adj_site_id'), t('stock_count_warehouse', 'Magazyn, w którym przeprowadzany jest spis.'));
  await describeOnly(page.locator('#inv_adj_adjustment_date__row'), t('stock_count_date', 'Data spisu.'));
  await describeOnly(page.locator('#inv_adj_category__row'), t('stock_count_type', 'Typ spisu.'));
  await describeOnly(page.locator('#inv_adj_comments'), t('stock_count_comments', 'Uwagi do spisu.'));

  await showLocalePageStep(page, ['/eden/inv/inv_item/report', '/eden/inv/inv_item'], t('section_reports', 'Sekcja Reports.'));
  await showStandaloneCaption(page, t('report_warehouse_stock', 'Raport stanów magazynowych.'), 1800);
  await showStandaloneCaption(page, t('report_expiration', 'Raport terminów ważności.'), 1800);

  await showStandaloneCaption(
    page,
    t('note_on_integration', 'Moduł Warehouses integruje się z pozostałymi częściami systemu.'),
    2500,
  );

  await clearDemoCaption(page);
  await page.waitForTimeout(RECORDING_FINISH_DELAY_MS);
  await saveRecordedVideo(page, 'warehouses-extended.webm');
});

const path = require('path');
const { test, expect } = require('playwright/test');
const locale = require('../locale/warehouse/en.json');
const values = require('../locale/warehouse/en_values.json');
const { localeText } = require('../helpers/locale');
const { RECORDING_VIEWPORT } = require('../helpers/recording-size');
const {
  describeFormFields,
  showCreateFormStep,
  showPageStep,
} = require('../helpers/recording-steps');
const {
  buildDemoContent,
  clearDemoCaption,
  describeAndClick,
  describeAndFill,
  describeAndSelect,
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

function v(key, fallback = '') {
  return values[key] ?? fallback;
}

function labelText(key, fallback = '') {
  const value = v(key, fallback);
  if (value && typeof value === 'object' && typeof value.label === 'string') {
    return value.label;
  }
  return typeof value === 'string' ? value : fallback;
}

function field(selector, key, fallback, options = {}) {
  return {
    action: options.action ?? 'describe',
    selector,
    description: t(key, fallback),
    value: options.value,
    match: options.match,
    fallbackSelect: options.fallbackSelect,
    ifVisible: options.ifVisible,
    delay: options.delay,
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function resolveField(fieldConfig) {
  if (fieldConfig.description) {
    return {
      action: fieldConfig.action ?? 'describe',
      ...fieldConfig,
    };
  }

  return field(fieldConfig.selector, fieldConfig.key, fieldConfig.fallback, fieldConfig);
}

function fillField(selector, key, fallback, valueKey = key, valueFallback = '') {
  return field(selector, key, fallback, {
    action: 'fill',
    value: v(valueKey, valueFallback),
  });
}

function selectField(selector, key, fallback, valueKey = key, options = {}) {
  return field(selector, key, fallback, {
    action: 'select',
    value: options.value ?? v(valueKey),
    match: options.match,
    fallbackSelect: options.fallbackSelect,
  });
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

async function fillAutocompleteItem(page, {
  inputSelector,
  description,
  typedValue,
  suggestionText,
  suggestionDescription,
  hiddenValueSelector,
}) {
  await describeAndFill(page.locator(inputSelector), description, typedValue);
  const suggestion = page
    .locator('ul.ui-autocomplete li')
    .filter({ hasText: new RegExp(`^${escapeRegExp(suggestionText)}$`, 'i') })
    .first();
  await expect(suggestion).toBeVisible();
  await describeAndClick(suggestion, suggestionDescription);

  if (hiddenValueSelector) {
    await expect(page.locator(hiddenValueSelector)).not.toHaveValue('');
  }
}

async function createSetupOrganization(page, organizationName) {
  await page.goto('/eden/org/organisation/create', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  await expect(page.locator('#org_organisation_name')).toBeVisible();
  await page.locator('#org_organisation_name').fill(organizationName);
  await page.locator('input[type="submit"][value="Save"]').first().click();
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(organizationName, { exact: true }).first()).toBeVisible();
}

test('records warehouses extended guide', async ({ browser, baseURL }) => {
  const user = loadEnvCredentials();
  const content = buildDemoContent('warehouse');
  const setupContext = await browser.newContext({ baseURL });
  const setupPage = await setupContext.newPage();

  await loginUser(setupPage, user);
  await createSetupOrganization(setupPage, content.organizationName);

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
      fillField('#inv_warehouse_type_name', 'warehouse_type_name', 'Warehouse type name, for example a central warehouse, cold room, or field warehouse.'),
      fillField('#inv_warehouse_type_comments', 'warehouse_type_comments', 'Comments describing the warehouse type and how it should be used.'),
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
      selectField('#supply_catalog_organisation_id', 'catalog_organization', 'Organization — organizacja, dla której tworzony jest katalog.', 'catalog_organization', { match: 'contains', value: content.organizationName }),
      fillField('#supply_catalog_name', 'catalog_name', 'Name — nazwa katalogu.'),
      fillField('#supply_catalog_comments', 'catalog_comments', 'Comments — dodatkowy opis katalogu.'),
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
      selectField('#supply_item_category_catalog_id', 'item_category_catalog', 'Catalog — katalog, w którym tworzymy kategorię.', 'item_category_catalog', { match: 'contains', value: labelText('item_category_catalog'), fallbackSelect: 'firstAvailable' }),
      fillField('#supply_item_category_code', 'item_category_code', 'Code — skrót lub kod kategorii.'),
      fillField('#supply_item_category_name', 'item_category_name', 'Name — nazwa kategorii.'),
      { selector: '#supply_item_category_can_be_asset', key: 'item_category_assets', fallback: 'Items in Category can be Assets — czy pozycje mogą być środkami trwałymi.' },
      { selector: '#supply_item_category_is_vehicle', key: 'item_category_vehicles', fallback: 'Items in Category are Vehicles — czy ta kategoria opisuje pojazdy.' },
      fillField('#supply_item_category_comments', 'item_category_comments', 'Comments — dodatkowe zasady używania kategorii.'),
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
      selectField('#supply_item_catalog_id', 'item_catalog', 'Catalog — katalog, do którego trafia produkt.', 'item_catalog', { match: 'contains', value: labelText('item_catalog'), fallbackSelect: 'firstAvailable' }),
      selectField('#supply_item_item_category_id', 'item_category', 'Category — kategoria produktu.', 'item_category', { match: 'contains', value: labelText('item_category'), fallbackSelect: 'firstAvailableOrSkip' }),
      fillField('#supply_item_code', 'item_code', 'Code — kod produktu.'),
      fillField('#supply_item_name', 'item_name', 'Name — nazwa produktu.'),
      selectField('#supply_item_um', 'item_unit', 'Unit of Measure — jednostka miary.', 'item_unit', { fallbackSelect: 'firstAvailable' }),
      { selector: '#supply_item_brand_id', key: 'item_brand', fallback: 'Brand — marka produktu.' },
      fillField('#supply_item_model', 'item_model', 'Model/Type — model lub wariant produktu.'),
      fillField('#supply_item_year', 'item_year', 'Year of Manufacture — rok produkcji.'),
      fillField('#supply_item_comments', 'item_comments', 'Comments — dodatkowe informacje o produkcie.'),
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
      fillField('#org_organisation_name', 'supplier_name', 'Name — nazwa dostawcy.'),
      fillField('#org_organisation_acronym', 'supplier_acronym', 'Acronym — skrót nazwy dostawcy.'),
      { selector: '#link_defaultorganisation_type_ms', key: 'supplier_type', fallback: 'Supplier — typ organizacji ustawiony jako dostawca.' },
      selectField('#org_organisation_country', 'supplier_country', 'Home Country — kraj rejestracji dostawcy.'),
      fillField('#org_organisation_phone', 'supplier_phone', 'Phone # — numer telefonu.'),
      fillField('#org_organisation_website', 'supplier_website', 'Website — strona internetowa.'),
      fillField('#org_organisation_year', 'supplier_year', 'Year — rok założenia.'),
      { selector: '#org_organisation_logo', key: 'supplier_logo', fallback: 'Logo — plik z logo dostawcy.' },
      fillField('#org_organisation_comments', 'supplier_comments', 'Comments — notatki o współpracy z dostawcą.'),
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
      fillField('#inv_warehouse_name', 'warehouse_name', 'Name — nazwa magazynu.'),
      fillField('#inv_warehouse_code', 'warehouse_code', 'Code — kod magazynu.'),
      selectField('#inv_warehouse_organisation_id', 'warehouse_organization', 'Organization — organizacja właścicielska.', 'warehouse_organization', { match: 'contains', value: content.organizationName }),
      { selector: '#inv_warehouse_warehouse_type_id', key: 'warehouse_type', fallback: 'Warehouse Type — typ magazynu.' },
      selectField('#inv_warehouse_location_id_L0', 'warehouse_country', 'Country — kraj lokalizacji magazynu.'),
      fillField('#inv_warehouse_location_id_address', 'warehouse_address', 'Street Address — adres magazynu.'),
      fillField('#inv_warehouse_location_id_postcode', 'warehouse_postcode', 'Postcode — kod pocztowy magazynu.'),
      fillField('#inv_warehouse_capacity', 'warehouse_capacity', 'Capacity — pojemność magazynu.'),
      fillField('#inv_warehouse_contact', 'warehouse_contact', 'Contact — osoba kontaktowa.'),
      fillField('#inv_warehouse_phone1', 'warehouse_phone1', 'Phone 1 — główny numer telefonu magazynu.'),
      fillField('#inv_warehouse_phone2', 'warehouse_phone2', 'Phone 2 — dodatkowy numer telefonu magazynu.'),
      fillField('#inv_warehouse_email', 'warehouse_email', 'Email — adres e-mail magazynu.'),
      fillField('#inv_warehouse_comments', 'warehouse_comments', 'Comments — dodatkowe informacje o magazynie.'),
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
      selectField('#inv_recv_site_id', 'incoming_facility', 'Facility — magazyn przyjmujący.', 'incoming_facility', { match: 'contains', fallbackSelect: 'firstAvailableOrSkip' }),
      selectField('#inv_recv_type', 'incoming_shipment_type', 'Shipment Type — typ przyjęcia.', 'incoming_shipment_type', { fallbackSelect: 'firstAvailableOrSkip' }),
      fillField('#inv_recv_send_ref', 'incoming_waybill_number', 'Waybill Number — numer listu przewozowego.'),
      fillField('#inv_recv_purchase_ref', 'incoming_po_number', 'PO Number — numer zamówienia.'),
      fillField('#inv_recv_req_ref', 'incoming_req_number', 'REQ Number — powiązane zapotrzebowanie.'),
      fillField('#dummy_inv_recv_recipient_id', 'incoming_received_by', 'Received By — osoba przyjmująca dostawę.'),
      fillField('#inv_recv_comments', 'incoming_comments', 'Comments — uwagi do przyjęcia.'),
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
    '#inv_send_req_ref',
    [
      fillField('#inv_send_req_ref', 'sent_req_number', 'REQ Number — powiązane zapotrzebowanie.'),
      selectField('#inv_send_site_id', 'sent_from_facility', 'From Facility — magazyn nadawczy.', 'sent_from_facility', { match: 'contains', fallbackSelect: 'firstAvailableOrSkip' }),
      selectField('#inv_send_type', 'sent_shipment_type', 'Shipment Type — typ wysyłki.', 'sent_shipment_type', { fallbackSelect: 'firstAvailableOrSkip' }),
      selectField('#inv_send_to_site_id', 'sent_to_facility', 'To Facility — magazyn docelowy.', 'sent_to_facility', { match: 'contains', fallbackSelect: 'firstAvailableOrSkip' }),
      selectField('#inv_send_organisation_id', 'sent_to_organization', 'To Organization — organizacja odbiorcy.', 'sent_to_organization', { match: 'contains', value: content.organizationName }),
      fillField('#dummy_inv_send_sender_id', 'sent_sent_by', 'Sent By — osoba odpowiedzialna za wydanie.'),
      fillField('#dummy_inv_send_recipient_id', 'sent_to_person', 'To Person — odbiorca imienny.'),
      fillField('#inv_send_driver_name', 'sent_driver_name', 'Name of Driver — kierowca.'),
      fillField('#inv_send_driver_phone', 'sent_driver_phone', 'Driver Phone Number — telefon kierowcy.'),
      fillField('#inv_send_vehicle_plate_no', 'sent_vehicle_plate', 'Vehicle Plate Number — numer rejestracyjny.'),
      fillField('#inv_send_comments', 'sent_comments', 'Comments — uwagi do wysyłki.'),
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
      selectField('#req_req_type', 'request_type', 'Request Type — czy zapotrzebowanie dotyczy stocku, ludzi czy innych zasobów.', 'request_type', { fallbackSelect: 'firstAvailableOrSkip' }),
      fillField('#req_req_req_ref', 'request_ref', 'REQ Number — numer zapotrzebowania.'),
      selectField('#req_req_priority', 'request_priority', 'Priority — priorytet potrzeby.', 'request_priority', { fallbackSelect: 'firstAvailableOrSkip' }),
      selectField('#req_req_site_id', 'request_site', 'Requested For Facility — placówka, dla której zgłaszamy potrzebę.', 'request_site', { match: 'contains', fallbackSelect: 'firstAvailableOrSkip' }),
      fillField('#req_req_purpose', 'request_purpose', 'Purpose — cel zapotrzebowania.'),
      { selector: '#req_req_is_template', key: 'request_recurring', fallback: 'Recurring Request — zapotrzebowanie stałe.' },
      fillField('#dummy_req_req_requester_id', 'request_requester', 'Requester — osoba zgłaszająca.'),
      fillField('#req_req_comments', 'request_comments', 'Comments — dodatkowe uwagi.'),
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
      selectField('#req_commit_site_id', 'commitment_from_facility', 'From Facility — placówka lub magazyn, z którego deklarujemy zasoby.', 'commitment_from_facility', { match: 'contains', fallbackSelect: 'firstAvailableOrSkip' }),
      selectField('#req_commit_req_id', 'commitment_request', 'Request — zapotrzebowanie, do którego przypisujemy zobowiązanie.', 'commitment_request', { match: 'contains', fallbackSelect: 'firstAvailableOrSkip' }),
      fillField('#dummy_req_commit_committer_id', 'commitment_committed_by', 'Committed By — osoba składająca zobowiązanie.'),
      fillField('#req_commit_comments', 'commitment_comments', 'Comments — dodatkowe informacje o zobowiązaniu.'),
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
    selectField('#supply_distribution_organisation_id', 'distribution_organization', 'Organization — organizacja odpowiedzialna za dystrybucję.', 'distribution_organization', { match: 'contains', value: content.organizationName }),
    fillField('#dummy_supply_distribution_person_id', 'distribution_recipient', 'Recipient — odbiorca pomocy.'),
    selectField('#supply_distribution_human_resource_id', 'distribution_staff_member', 'Staff Member in Charge — osoba koordynująca dystrybucję.', 'distribution_staff_member', { match: 'contains', fallbackSelect: 'firstAvailableOrSkip' }),
  ]);

  await showLocalePageStep(page, '/eden/inv/adj', t('section_stock_counts', 'Sekcja Stock Counts / korekty stanów.'));
  await describeAndClick(
    page.locator('#show-add-btn'),
    t('create_stock_count', 'Przechodzimy do formularza dodania nowej inwentaryzacji.'),
  );
  await expect(page.locator('#inv_adj_site_id')).toBeVisible();
  await describeOnly(page.locator('#dummy_inv_adj_adjuster_id'), t('stock_count_actioning_officer', 'Osoba odpowiedzialna za spis.'));
  await describeOnly(page.locator('#inv_adj_site_id'), t('stock_count_warehouse', 'Magazyn, w którym przeprowadzany jest spis.'));
  await describeOnly(page.locator('#inv_adj_category__row'), t('stock_count_type', 'Typ spisu.'));
  await describeLocaleFormFields(page, [
    fillField('#inv_adj_comments', 'stock_count_comments', 'Uwagi do spisu.'),
  ]);

  await showLocalePageStep(
    page,
    '/eden/inv/adj',
    t(
      'stock_count_back_to_list',
      'We return to the stock count list to open a real record for the facility Distribution Point org-moektc0p.',
    ),
  );

  const stockCountRow = page
    .locator('table tbody tr')
    .filter({ hasText: 'Distribution Point org-moektc0p (Facility)' })
    .last();
  await expect(stockCountRow).toBeVisible();
  await describeAndClick(
    stockCountRow.locator('a.action-btn').first(),
    t(
      'stock_count_existing_record',
      'We open the latest stock count for Distribution Point org-moektc0p to continue with item-level adjustments.',
    ),
  );
  await expect(page).toHaveURL(/\/eden\/inv\/adj\/\d+\/update$/);
  await page.waitForLoadState('networkidle');

  await describeAndClick(
    page.locator('#rheader_tab_adj_item'),
    t(
      'stock_count_items_tab',
      'The Items tab is where we add counted products and record their revised quantities.',
    ),
  );
  await expect(page).toHaveURL(/\/eden\/inv\/adj\/\d+\/adj_item$/);
  await page.waitForLoadState('networkidle');

  await describeAndClick(
    page.locator('#show-add-btn'),
    t(
      'stock_count_add_item',
      'Add Item to Stock opens the inline form for entering the counted item and the revised stock details.',
    ),
  );
  await expect(page.locator('#list-add')).toBeVisible();
  await expect(page.locator('#list-add h3')).toContainText('Add Item to Stock');
  await fillAutocompleteItem(page, {
    inputSelector: '#dummy_inv_adj_item_item_id',
    description: t('stock_count_item', 'Item — choose the product that should be added or corrected in this stock count.'),
    typedValue: 'blanket',
    suggestionText: 'blanket',
    suggestionDescription: t(
      'stock_count_item_suggestion',
      'Select the matching item from the autocomplete suggestions so Eden links the form to the real stock item record.',
    ),
    hiddenValueSelector: '#inv_adj_item_item_id',
  });
  await expect(page.locator('#inv_adj_item_item_pack_id')).toBeEnabled();
  await describeAndSelect(
    page.locator('#inv_adj_item_item_pack_id'),
    t('stock_count_pack', 'Pack — select the unit or pack size for the counted item.'),
    { label: 'piece' },
  );
  await describeAndFill(
    page.locator('#inv_adj_item_new_quantity'),
    t('stock_count_revised_quantity', 'Revised Quantity — enter the quantity that was actually counted during the stock check.'),
    '24',
  );
  await describeOnly(
    page.locator('#inv_adj_item_reason__row .controls'),
    t('stock_count_reason', 'Reason — Eden shows the adjustment reason that explains why the quantity is being changed.'),
  );
  await describeAndSelect(
    page.locator('#inv_adj_item_new_status'),
    t('stock_count_revised_status', 'Revised Status — note whether the counted stock stays normal, becomes surplus, or needs disposal.'),
    { label: 'Surplus' },
  );
  await describeAndFill(
    page.locator('#inv_adj_item_expiry_date'),
    t('stock_count_expiry_date', 'Expiry Date — record the expiration date when the item needs batch or shelf-life tracking.'),
    '2026-12-31',
  );
  await describeAndFill(
    page.locator('#inv_adj_item_bin'),
    t('stock_count_bin', 'Bin — capture the exact shelf, rack, or bin location inside the facility.'),
    'Rack B-12',
  );
  await describeAndSelect(
    page.locator('#inv_adj_item_new_owner_org_id'),
    t('stock_count_transfer_owner', 'Transfer Ownership To — use this when the stock is physically here but should belong to a specific organization or branch.'),
    { label: 'Demo NGO Aid Network org-moektc0p' },
  );
  await describeAndFill(
    page.locator('#inv_adj_item_comments'),
    t('stock_count_item_comments', 'Comments — add practical notes from the count, such as damage, missing labels, or follow-up actions.'),
    'Count confirmed during the evening check.',
  );
  await describeAndClick(
    page.locator('#submit_record__row input[type="submit"][value="Save"]').first(),
    t('stock_count_save_item', 'Finally, save the item line to attach it to this stock count.'),
  );
  await page.waitForLoadState('networkidle');
  await expect(
    page.locator('table tbody tr').filter({ hasText: 'Rack B-12' }).first(),
  ).toBeVisible();

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

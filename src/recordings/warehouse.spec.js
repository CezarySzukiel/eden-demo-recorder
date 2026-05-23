const path = require('path');
const { test, expect } = require('playwright/test');
const { loadRecordingLocale, localeText } = require('../helpers/locale');
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

const { language: recordingLanguage, captions: locale, values } = loadRecordingLocale('warehouse');

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
  const input = page.locator(inputSelector);
  await input.waitFor({ state: 'visible' });
  await showStandaloneCaption(page, description, 1200);
  await input.click();
  await input.fill('');
  await input.fill(typedValue);

  const autocomplete = page.locator('ul.ui-autocomplete:visible').first();
  await expect(autocomplete).toBeVisible();
  const hiddenValue = hiddenValueSelector ? page.locator(hiddenValueSelector) : null;

  await showStandaloneCaption(page, suggestionDescription, 1200);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  if (hiddenValue) {
    const selectedWithKeyboard = await hiddenValue
      .evaluate((element) => element.value)
      .catch(() => '');
    if (selectedWithKeyboard) {
      await expect(hiddenValue).not.toHaveValue('');
      return;
    }
  }

  const exactSuggestion = autocomplete
    .locator('.ui-menu-item-wrapper, li')
    .filter({ hasText: new RegExp(`^${escapeRegExp(suggestionText)}$`, 'i') })
    .first();
  const containsSuggestion = autocomplete
    .locator('.ui-menu-item-wrapper, li')
    .filter({ hasText: new RegExp(escapeRegExp(suggestionText), 'i') })
    .first();

  let suggestion = containsSuggestion;
  if (await exactSuggestion.count()) {
    suggestion = exactSuggestion;
  } else if (!await containsSuggestion.count()) {
    if (hiddenValue) {
      await expect(hiddenValue).not.toHaveValue('');
      return;
    }

    return;
  }

  await expect(suggestion).toBeVisible();
  await suggestion.click();

  if (hiddenValue) {
    await expect(hiddenValue).not.toHaveValue('');
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

test('records warehouse guide', async ({ browser, baseURL }) => {
  const user = loadEnvCredentials();
  const content = buildDemoContent('warehouse', values);
  const setupContext = await browser.newContext({ baseURL, locale: recordingLanguage });
  const setupPage = await setupContext.newPage();

  await loginUser(setupPage, user);
  await createSetupOrganization(setupPage, content.organizationName);

  const storageState = await setupContext.storageState();
  await setupContext.close();

  const recordedContext = await browser.newContext({
    baseURL,
    locale: recordingLanguage,
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
    t('module_warehouses_purpose', 'Warehouse and stock management.'),
    3000,
  );
  await describeOnly(
    page.locator('h1, h2').first(),
    t('section_warehouses', 'Reviewing the key Warehouse module sections.'),
    2200,
  );

  await showLocaleCreateFormStep(
    page,
    '/eden/inv/warehouse_type',
    'section_warehouse_types',
    'Warehouse Types section.',
    '/eden/inv/warehouse_type/create',
    'create_warehouse_type',
    'Open the warehouse type creation form.',
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
    'Catalogs section.',
    '/eden/supply/catalog/create',
    'create_catalog',
    'Open the catalog creation form.',
    '#supply_catalog_name',
    [
      selectField('#supply_catalog_organisation_id', 'catalog_organization', 'Organization - the organization this catalog belongs to.', 'catalog_organization', { match: 'contains', value: content.organizationName }),
      fillField('#supply_catalog_name', 'catalog_name', 'Name - catalog name.'),
      fillField('#supply_catalog_comments', 'catalog_comments', 'Comments - additional catalog description.'),
    ],
  );

  await showLocaleCreateFormStep(
    page,
    '/eden/supply/item_category',
    'section_item_categories',
    'Item Categories section.',
    '/eden/supply/item_category/create',
    'create_item_category',
    'Open the item category creation form.',
    '#supply_item_category_name',
    [
      selectField('#supply_item_category_catalog_id', 'item_category_catalog', 'Catalog - the catalog where this category is created.', 'item_category_catalog', { match: 'contains', value: labelText('item_category_catalog'), fallbackSelect: 'firstAvailable' }),
      fillField('#supply_item_category_code', 'item_category_code', 'Code - category code or short identifier.'),
      fillField('#supply_item_category_name', 'item_category_name', 'Name - category name.'),
      { selector: '#supply_item_category_can_be_asset', key: 'item_category_assets', fallback: 'Items in this category can be fixed assets.' },
      { selector: '#supply_item_category_is_vehicle', key: 'item_category_vehicles', fallback: 'Items in this category are vehicles.' },
      fillField('#supply_item_category_comments', 'item_category_comments', 'Comments - additional category usage notes.'),
    ],
  );

  await showLocaleCreateFormStep(
    page,
    ['/eden/supply/item/summary', '/eden/supply/item'],
    'section_items',
    'Items section.',
    '/eden/supply/item/create',
    'create_item',
    'Open the stock item creation form.',
    '#supply_item_name',
    [
      selectField('#supply_item_catalog_id', 'item_catalog', 'Catalog - the catalog this product belongs to.', 'item_catalog', { match: 'contains', value: labelText('item_catalog'), fallbackSelect: 'firstAvailable' }),
      selectField('#supply_item_item_category_id', 'item_category', 'Category - product category.', 'item_category', { match: 'contains', value: labelText('item_category'), fallbackSelect: 'firstAvailableOrSkip' }),
      fillField('#supply_item_code', 'item_code', 'Code - product code.'),
      fillField('#supply_item_name', 'item_name', 'Name - product name.'),
      selectField('#supply_item_um', 'item_unit', 'Unit of Measure - item unit.', 'item_unit', { fallbackSelect: 'firstAvailable' }),
      { selector: '#supply_item_brand_id', key: 'item_brand', fallback: 'Brand - product brand.' },
      fillField('#supply_item_model', 'item_model', 'Model/Type - product model or variant.'),
      fillField('#supply_item_year', 'item_year', 'Year of Manufacture - production year.'),
      fillField('#supply_item_comments', 'item_comments', 'Comments - additional product information.'),
    ],
  );

  await showLocaleCreateFormStep(
    page,
    '/eden/inv/supplier',
    'section_suppliers',
    'Suppliers section.',
    '/eden/inv/supplier/create',
    'create_supplier',
    'Open the supplier creation form.',
    '#org_organisation_name',
    [
      fillField('#org_organisation_name', 'supplier_name', 'Name - supplier name.'),
      fillField('#org_organisation_acronym', 'supplier_acronym', 'Acronym - supplier short name.'),
      { selector: '#link_defaultorganisation_type_ms', key: 'supplier_type', fallback: 'Supplier - organization type marked as a supplier.' },
      selectField('#org_organisation_country', 'supplier_country', 'Home Country - supplier registration country.'),
      fillField('#org_organisation_phone', 'supplier_phone', 'Phone # - phone number.'),
      fillField('#org_organisation_website', 'supplier_website', 'Website - website URL.'),
      fillField('#org_organisation_year', 'supplier_year', 'Year - founding year.'),
      { selector: '#org_organisation_logo', key: 'supplier_logo', fallback: 'Logo - supplier logo file.' },
      fillField('#org_organisation_comments', 'supplier_comments', 'Comments - supplier cooperation notes.'),
    ],
  );

  await showLocaleCreateFormStep(
    page,
    '/eden/inv/warehouse',
    'section_warehouses',
    'Warehouses section.',
    '/eden/inv/warehouse/create',
    'create_warehouse',
    'Open the warehouse creation form.',
    '#inv_warehouse_name',
    [
      fillField('#inv_warehouse_name', 'warehouse_name', 'Name - warehouse name.'),
      fillField('#inv_warehouse_code', 'warehouse_code', 'Code - warehouse code.'),
      selectField('#inv_warehouse_organisation_id', 'warehouse_organization', 'Organization - warehouse owner organization.', 'warehouse_organization', { match: 'contains', value: content.organizationName }),
      selectField('#inv_warehouse_warehouse_type_id', 'warehouse_type', 'Warehouse Type - warehouse classification.', 'warehouse_type', { fallbackSelect: 'firstAvailableOrSkip' }),
      selectField('#inv_warehouse_location_id_L0', 'warehouse_country', 'Country - warehouse location country.'),
      fillField('#inv_warehouse_location_id_address', 'warehouse_address', 'Street Address - warehouse address.'),
      fillField('#inv_warehouse_location_id_postcode', 'warehouse_postcode', 'Postcode - warehouse postal code.'),
      fillField('#inv_warehouse_capacity', 'warehouse_capacity', 'Capacity - warehouse capacity.'),
      fillField('#inv_warehouse_contact', 'warehouse_contact', 'Contact - contact person.'),
      fillField('#inv_warehouse_phone1', 'warehouse_phone1', 'Phone 1 - main warehouse phone number.'),
      fillField('#inv_warehouse_phone2', 'warehouse_phone2', 'Phone 2 - additional warehouse phone number.'),
      fillField('#inv_warehouse_email', 'warehouse_email', 'Email - warehouse email address.'),
      fillField('#inv_warehouse_comments', 'warehouse_comments', 'Comments - additional warehouse information.'),
    ],
  );

  await showLocaleCreateFormStep(
    page,
    '/eden/inv/recv',
    'section_received_shipments',
    'Received/Incoming Shipments section.',
    '/eden/inv/recv/create',
    'create_received_shipment',
    'Open the shipment receipt form.',
    '#inv_recv_site_id',
    [
      selectField('#inv_recv_site_id', 'incoming_facility', 'Facility - receiving warehouse.', 'incoming_facility', { match: 'contains', fallbackSelect: 'firstAvailableOrSkip' }),
      selectField('#inv_recv_from_site_id', 'incoming_from_facility', 'From Facility - sending warehouse or facility.', 'incoming_from_facility', { match: 'contains', fallbackSelect: 'firstAvailableOrSkip' }),
      selectField('#inv_recv_type', 'incoming_shipment_type', 'Shipment Type - receipt type.', 'incoming_shipment_type', { fallbackSelect: 'firstAvailableOrSkip' }),
      fillField('#inv_recv_send_ref', 'incoming_waybill_number', 'Waybill Number - shipment waybill number.'),
      fillField('#inv_recv_purchase_ref', 'incoming_po_number', 'PO Number - purchase order number.'),
      fillField('#inv_recv_req_ref', 'incoming_req_number', 'REQ Number - linked request number.'),
      fillField('#dummy_inv_recv_recipient_id', 'incoming_received_by', 'Received By - person receiving the delivery.'),
      fillField('#inv_recv_comments', 'incoming_comments', 'Comments - receipt notes.'),
    ],
  );

  await showLocaleCreateFormStep(
    page,
    '/eden/inv/send',
    'section_sent_shipments',
    'Sent Shipments section.',
    '/eden/inv/send/create',
    'create_sent_shipment',
    'Open the shipment dispatch form.',
    '#inv_send_req_ref',
    [
      fillField('#inv_send_req_ref', 'sent_req_number', 'REQ Number - linked request number.'),
      selectField('#inv_send_site_id', 'sent_from_facility', 'From Facility - sending warehouse.', 'sent_from_facility', { match: 'contains', fallbackSelect: 'firstAvailableOrSkip' }),
      selectField('#inv_send_type', 'sent_shipment_type', 'Shipment Type - dispatch type.', 'sent_shipment_type', { fallbackSelect: 'firstAvailableOrSkip' }),
      selectField('#inv_send_to_site_id', 'sent_to_facility', 'To Facility - destination warehouse.', 'sent_to_facility', { match: 'contains', fallbackSelect: 'firstAvailableOrSkip' }),
      selectField('#inv_send_organisation_id', 'sent_to_organization', 'To Organization - recipient organization.', 'sent_to_organization', { match: 'contains', value: content.organizationName }),
      fillField('#dummy_inv_send_sender_id', 'sent_sent_by', 'Sent By - person responsible for dispatch.'),
      fillField('#dummy_inv_send_recipient_id', 'sent_to_person', 'To Person - named recipient.'),
      fillField('#inv_send_driver_name', 'sent_driver_name', 'Name of Driver - driver name.'),
      fillField('#inv_send_driver_phone', 'sent_driver_phone', 'Driver Phone Number - driver phone number.'),
      fillField('#inv_send_vehicle_plate_no', 'sent_vehicle_plate', 'Vehicle Plate Number - vehicle registration number.'),
      fillField('#inv_send_comments', 'sent_comments', 'Comments - shipment notes.'),
    ],
  );

  await showLocaleCreateFormStep(
    page,
    '/eden/req/req',
    'section_requests',
    'Requests section.',
    '/eden/req/req/create',
    'create_request',
    'Open the request creation form.',
    '#req_req_site_id',
    [
      selectField('#req_req_type', 'request_type', 'Request Type - whether this request is for stock, people, or other resources.', 'request_type', { fallbackSelect: 'firstAvailableOrSkip' }),
      fillField('#req_req_req_ref', 'request_ref', 'REQ Number - request number.'),
      selectField('#req_req_priority', 'request_priority', 'Priority - request priority.', 'request_priority', { fallbackSelect: 'firstAvailableOrSkip' }),
      selectField('#req_req_site_id', 'request_site', 'Requested For Facility - facility that needs the requested support.', 'request_site', { match: 'contains', fallbackSelect: 'firstAvailableOrSkip' }),
      fillField('#req_req_purpose', 'request_purpose', 'Purpose - request purpose.'),
      { selector: '#req_req_is_template', key: 'request_recurring', fallback: 'Recurring Request - marks this as a recurring request.' },
      fillField('#dummy_req_req_requester_id', 'request_requester', 'Requester - person submitting the request.'),
      fillField('#req_req_comments', 'request_comments', 'Comments - additional request notes.'),
    ],
  );

  await showLocaleCreateFormStep(
    page,
    '/eden/req/commit',
    'section_commitments',
    'Commitments section.',
    '/eden/req/commit/create',
    'create_commitment',
      'Open the commitment creation form.',
      '#req_commit_site_id',
      [
      selectField('#req_commit_site_id', 'commitment_from_facility', 'From Facility - facility or warehouse committing resources.', 'commitment_from_facility', { match: 'contains', fallbackSelect: 'firstAvailableOrSkip' }),
      selectField('#req_commit_req_id', 'commitment_request', 'Request - request linked to this commitment.', 'commitment_request', { match: 'contains', fallbackSelect: 'firstAvailableOrSkip' }),
      fillField('#dummy_req_commit_committer_id', 'commitment_committed_by', 'Committed By - person making the commitment.'),
      fillField('#req_commit_comments', 'commitment_comments', 'Comments - additional commitment information.'),
    ],
  );

  await showLocalePageStep(
    page,
    ['/eden/supply/distribution', '/eden/inv/distribution', '/eden/dvr/distribution'],
    t('section_distributions', 'Distributions section.'),
  );
  await showLocalePageStep(page, '/eden/supply/distribution/create', t('create_distribution', 'Register a new distribution.'));
  await expect(page.locator('#supply_distribution_organisation_id')).toBeVisible();
  await describeLocaleFormFields(page, [
    selectField('#supply_distribution_organisation_id', 'distribution_organization', 'Organization - organization responsible for the distribution.', 'distribution_organization', { match: 'contains', value: content.organizationName }),
    fillField('#dummy_supply_distribution_person_id', 'distribution_recipient', 'Recipient - aid recipient.'),
    selectField('#supply_distribution_human_resource_id', 'distribution_staff_member', 'Staff Member in Charge - person coordinating the distribution.', 'distribution_staff_member', { match: 'contains', fallbackSelect: 'firstAvailableOrSkip' }),
  ]);

  await showLocalePageStep(page, '/eden/inv/adj', t('section_stock_counts', 'Stock Counts and stock adjustments section.'));
  await describeAndClick(
    page.locator('#show-add-btn'),
    t('create_stock_count', 'Open the new stock count form.'),
  );
  await expect(page.locator('#inv_adj_site_id')).toBeVisible();
  await describeOnly(page.locator('#dummy_inv_adj_adjuster_id'), t('stock_count_actioning_officer', 'Osoba odpowiedzialna za spis.'));
  await describeOnly(page.locator('#inv_adj_site_id'), t('stock_count_warehouse', 'Warehouse where the stock count is performed.'));
  await describeOnly(page.locator('#inv_adj_category__row'), t('stock_count_type', 'Stock count type.'));
  await describeLocaleFormFields(page, [
    fillField('#inv_adj_comments', 'stock_count_comments', 'Stock count comments.'),
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

  const existingStockItemOpenLink = page
    .locator('table tbody tr a')
    .filter({ hasText: /^Open$/i })
    .first();
  await expect(existingStockItemOpenLink).toBeVisible();
  await describeAndClick(
    existingStockItemOpenLink,
    t(
      'stock_count_add_item',
      'We open an existing stock count item line to review and update the counted stock details.',
    ),
  );
  await expect(page).toHaveURL(/\/eden\/inv\/adj\/\d+\/adj_item\/\d+\/update$/);
  await page.waitForLoadState('networkidle');

  await describeOnly(
    page.locator('#inv_adj_item_item_id__row, #dummy_inv_adj_item_item_id__row').first(),
    t('stock_count_item', 'Item - this line is already linked to the stock item being reviewed in the count.'),
  );
  await expect(page.locator('#inv_adj_item_item_pack_id')).toBeEnabled();
  await describeAndSelect(
    page.locator('#inv_adj_item_item_pack_id'),
    t('stock_count_pack', 'Pack - select the unit or pack size for the counted item.'),
    v('stock_count_pack', v('item_unit', { label: 'piece' })),
  );
  await describeAndFill(
    page.locator('#inv_adj_item_new_quantity'),
    t('stock_count_revised_quantity', 'Revised Quantity - enter the quantity that was actually counted during the stock check.'),
    v('stock_count_revised_quantity', '24'),
  );
  await describeOnly(
    page.locator('#inv_adj_item_reason__row .controls'),
    t('stock_count_reason', 'Reason - Eden shows the adjustment reason that explains why the quantity is being changed.'),
  );
  await describeAndSelect(
    page.locator('#inv_adj_item_new_status'),
    t('stock_count_revised_status', 'Revised Status - note whether the counted stock stays normal, becomes surplus, or needs disposal.'),
    v('stock_count_revised_status', { label: 'Surplus' }),
  );
  await describeAndFill(
    page.locator('#inv_adj_item_expiry_date'),
    t('stock_count_expiry_date', 'Expiry Date - record the expiration date when the item needs batch or shelf-life tracking.'),
    v('stock_count_expiry_date', '2026-12-31'),
  );
  await describeAndFill(
    page.locator('#inv_adj_item_bin'),
    t('stock_count_bin', 'Bin - capture the exact shelf, rack, or bin location inside the facility.'),
    v('stock_count_bin', 'Rack B-12'),
  );
  await describeAndSelect(
    page.locator('#inv_adj_item_new_owner_org_id'),
    t('stock_count_transfer_owner', 'Transfer Ownership To - use this when the stock is physically here but should belong to a specific organization or branch.'),
    content.organizationName,
    'contains',
    'firstAvailableOrSkip',
  );
  await describeAndFill(
    page.locator('#inv_adj_item_comments'),
    t('stock_count_item_comments', 'Comments - add practical notes from the count, such as damage, missing labels, or follow-up actions.'),
    v('stock_count_item_comments', 'Count confirmed during the evening check.'),
  );
  await describeAndClick(
    page.locator('#submit_record__row input[type="submit"][value="Save"]').first(),
    t('stock_count_save_item', 'Finally, save the item line to attach it to this stock count.'),
  );
  await page.waitForLoadState('networkidle');
  await expect(
    page.locator('table tbody tr').filter({ hasText: v('stock_count_bin', 'Rack B-12') }).first(),
  ).toBeVisible();

  await showLocalePageStep(page, ['/eden/inv/inv_item/report', '/eden/inv/inv_item'], t('section_reports', 'Reports section.'));
  await showStandaloneCaption(page, t('report_warehouse_stock', 'Warehouse stock report.'), 1800);
  await showStandaloneCaption(page, t('report_expiration', 'Expiration dates report.'), 1800);

  await showStandaloneCaption(
    page,
    t('note_on_integration', 'The Warehouse module integrates with the rest of the system.'),
    2500,
  );

  await clearDemoCaption(page);
  await page.waitForTimeout(RECORDING_FINISH_DELAY_MS);
  await saveRecordedVideo(page, 'warehouse.webm');
});

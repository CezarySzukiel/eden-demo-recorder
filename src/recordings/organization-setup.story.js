const { localeText } = require('../helpers/locale');

const SECTION_STEPS = {
  organizations: {
    sectionHref: '/eden/org/organisation',
    createHref: '/eden/org/organisation/create',
    sectionKey: 'section_organizations',
    createKey: 'create_organization',
  },
  offices: {
    sectionHref: '/eden/org/office',
    createHref: '/eden/org/office/create',
    sectionKey: 'section_offices',
    createKey: 'create_office',
  },
  facilities: {
    sectionHref: '/eden/org/facility',
    createHref: '/eden/org/facility/create',
    sectionKey: 'section_facilities',
    createKey: 'create_facility',
  },
};

function resolveSection(locale, section) {
  return {
    sectionHref: section.sectionHref,
    createHref: section.createHref,
    sectionDescription: localeText(locale, section.sectionKey),
    createDescription: localeText(locale, section.createKey),
  };
}

function field(selector, action, key, value, options = {}) {
  return {
    selector,
    action,
    description: localeText(options.locale, key, options.fallback),
    value,
    match: options.match,
    delay: options.delay,
    ifVisible: options.ifVisible,
  };
}

function describe(selector, key, options = {}) {
  return field(selector, 'describe', key, undefined, options);
}

function click(selector, key, options = {}) {
  return field(selector, 'click', key, undefined, options);
}

function fill(selector, key, value, options = {}) {
  return field(selector, 'fill', key, value, options);
}

function select(selector, key, value, options = {}) {
  return field(selector, 'select', key, value, options);
}

function buildOrganizationRecord(locale, content) {
  const options = { locale };
  return {
    section: resolveSection(locale, SECTION_STEPS.organizations),
    directHref: SECTION_STEPS.organizations.createHref,
    firstSelector: '#org_organisation_name',
    resultCellName: content.organizationName,
    fields: [
      fill('#org_organisation_name', 'org_name', content.organizationName, options),
      fill('#org_organisation_acronym', 'org_acronym', `DNA-${content.organizationName.slice(-8)}`, options),
      click('#link_defaultorganisation_type_ms', 'org_type', options),
      click('label[for="ui-multiselect-0-link_defaultorganisation_type-option-6"]', 'org_type_ngo', options),
      select('#org_organisation_country', 'org_country', { label: 'Poland' }, options),
      fill('#org_organisation_phone', 'org_phone', '+48 22 100 20 30', options),
      fill('#org_organisation_website', 'org_website', 'https://demo-ngo.example.org', options),
      fill('#org_organisation_year', 'org_year', '2015', options),
      describe('#org_organisation_logo', 'org_logo', options),
      fill('#org_organisation_comments', 'org_comments', localeText(locale, 'org_comments_value'), options),
    ],
  };
}

function buildOfficeRecord(locale, content) {
  const options = { locale };
  return {
    section: resolveSection(locale, SECTION_STEPS.offices),
    directHref: SECTION_STEPS.offices.createHref,
    firstSelector: '#org_office_name',
    resultCellName: content.officeName,
    fields: [
      fill('#org_office_name', 'office_name', content.officeName, options),
      fill('#org_office_code', 'office_code', `WO-${content.officeName.slice(-6)}`, options),
      select('#org_office_organisation_id', 'office_org', content.organizationName, { ...options, match: 'contains' }),
      select('#org_office_office_type_id', 'office_type', { label: 'Headquarters' }, options),
      select('#org_office_location_id_L0', 'office_country', { label: 'Poland' }, options),
      describe('#org_office_location_id_L1', 'office_l1', { ...options, ifVisible: true }),
      describe('#org_office_location_id_L2', 'office_l2', { ...options, ifVisible: true }),
      describe('#org_office_location_id_L3', 'office_l3', { ...options, ifVisible: true }),
      describe('#org_office_location_id_L4', 'office_l4', { ...options, ifVisible: true }),
      fill('#org_office_location_id_address', 'office_address', 'ul. Marszalkowska 1', options),
      fill('#org_office_location_id_postcode', 'office_postcode', '00-001', options),
      describe('#org_office_location_id_map_icon', 'office_map_icon', { ...options, delay: 1000 }),
      fill('#org_office_phone1', 'office_phone1', '+48 22 111 22 33', options),
      fill('#org_office_phone2', 'office_phone2', '+48 22 111 22 44', options),
      fill('#org_office_email', 'office_email', 'warsaw.office@example.org', options),
      fill('#org_office_fax', 'office_fax', '+48 22 111 22 55', options),
      fill('#org_office_comments', 'office_comments', localeText(locale, 'office_comments_value'), options),
    ],
  };
}

function buildFacilityRecord(locale, content) {
  const options = { locale };
  return {
    section: resolveSection(locale, SECTION_STEPS.facilities),
    directHref: SECTION_STEPS.facilities.createHref,
    firstSelector: '#org_facility_name',
    resultCellName: content.facilityName,
    fields: [
      fill('#org_facility_name', 'facility_name', content.facilityName, options),
      fill('#org_facility_code', 'facility_code', `DP-${content.facilityName.slice(-6)}`, options),
      describe('#org_facility_link_defaultfacility_type__row .controls', 'facility_type', options),
      select('#org_facility_organisation_id', 'facility_org', content.organizationName, { ...options, match: 'contains' }),
      select('#org_facility_location_id_L0', 'facility_country', { label: 'Poland' }, options),
      describe('#org_facility_location_id_L1', 'facility_l1', { ...options, ifVisible: true }),
      describe('#org_facility_location_id_L2', 'facility_l2', { ...options, ifVisible: true }),
      describe('#org_facility_location_id_L3', 'facility_l3', { ...options, ifVisible: true }),
      describe('#org_facility_location_id_L4', 'facility_l4', { ...options, ifVisible: true }),
      fill('#org_facility_location_id_address', 'facility_address', 'ul. Towarowa 10', options),
      fill('#org_facility_location_id_postcode', 'facility_postcode', '00-950', options),
      describe('#org_facility_location_id_map_icon', 'facility_map_icon', { ...options, delay: 1000 }),
      fill('#org_facility_opening_times', 'facility_opening_times', 'Pon-Pt 08:00-18:00', options),
      fill('#org_facility_contact', 'facility_contact', 'Anna Kowalska', options),
      fill('#org_facility_phone1', 'facility_phone1', '+48 22 222 33 44', options),
      fill('#org_facility_phone2', 'facility_phone2', '+48 22 222 33 55', options),
      fill('#org_facility_email', 'facility_email', 'distribution.point@example.org', options),
      fill('#org_facility_website', 'facility_website', 'https://distribution-point.example.org', options),
      fill('#org_facility_comments', 'facility_comments', localeText(locale, 'facility_comments_value'), options),
    ],
  };
}

function buildOrganizationSetupStory(locale, content) {
  return {
    organization: buildOrganizationRecord(locale, content),
    office: buildOfficeRecord(locale, content),
    facility: buildFacilityRecord(locale, content),
  };
}

module.exports = {
  buildOrganizationSetupStory,
};

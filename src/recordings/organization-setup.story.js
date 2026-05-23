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

function selectFirstMultiselectOption(selector, key, options = {}) {
  return field(selector, 'selectFirstMultiselectOption', key, undefined, options);
}

function fill(selector, key, value, options = {}) {
  return field(selector, 'fill', key, value, options);
}

function select(selector, key, value, options = {}) {
  return field(selector, 'select', key, value, options);
}

function value(content, key) {
  if (content[key] === undefined) {
    throw new Error(`Missing organization demo value: ${key}`);
  }
  return content[key];
}

function buildOrganizationRecord(locale, content) {
  const options = { locale };
  return {
    section: resolveSection(locale, SECTION_STEPS.organizations),
    directHref: SECTION_STEPS.organizations.createHref,
    firstSelector: '#org_organisation_name',
    resultCellName: value(content, 'organizationName'),
    fields: [
      fill('#org_organisation_name', 'org_name', value(content, 'organizationName'), options),
      fill('#org_organisation_acronym', 'org_acronym', value(content, 'organizationAcronym'), options),
      selectFirstMultiselectOption('#link_defaultorganisation_type_ms', 'org_type_first_available', options),
      select('#org_organisation_country', 'org_country', value(content, 'organizationCountry'), options),
      fill('#org_organisation_phone', 'org_phone', value(content, 'organizationPhone'), options),
      fill('#org_organisation_website', 'org_website', value(content, 'organizationWebsite'), options),
      fill('#org_organisation_year', 'org_year', value(content, 'organizationYear'), options),
      describe('#org_organisation_logo', 'org_logo', options),
      fill('#org_organisation_comments', 'org_comments', value(content, 'organizationComments'), options),
    ],
  };
}

function buildOfficeRecord(locale, content) {
  const options = { locale };
  return {
    section: resolveSection(locale, SECTION_STEPS.offices),
    directHref: SECTION_STEPS.offices.createHref,
    firstSelector: '#org_office_name',
    resultCellName: value(content, 'officeName'),
    fields: [
      fill('#org_office_name', 'office_name', value(content, 'officeName'), options),
      fill('#org_office_code', 'office_code', value(content, 'officeCode'), options),
      select('#org_office_organisation_id', 'office_org', value(content, 'organizationName'), { ...options, match: 'contains' }),
      select('#org_office_office_type_id', 'office_type', value(content, 'officeType'), options),
      select('#org_office_location_id_L0', 'office_country', value(content, 'officeCountry'), options),
      describe('#org_office_location_id_L1', 'office_l1', { ...options, ifVisible: true }),
      describe('#org_office_location_id_L2', 'office_l2', { ...options, ifVisible: true }),
      describe('#org_office_location_id_L3', 'office_l3', { ...options, ifVisible: true }),
      describe('#org_office_location_id_L4', 'office_l4', { ...options, ifVisible: true }),
      fill('#org_office_location_id_address', 'office_address', value(content, 'officeAddress'), options),
      fill('#org_office_location_id_postcode', 'office_postcode', value(content, 'officePostcode'), options),
      describe('#org_office_location_id_map_icon', 'office_map_icon', { ...options, delay: 1000 }),
      fill('#org_office_phone1', 'office_phone1', value(content, 'officePhone1'), options),
      fill('#org_office_phone2', 'office_phone2', value(content, 'officePhone2'), options),
      fill('#org_office_email', 'office_email', value(content, 'officeEmail'), options),
      fill('#org_office_fax', 'office_fax', value(content, 'officeFax'), options),
      fill('#org_office_comments', 'office_comments', value(content, 'officeComments'), options),
    ],
  };
}

function buildFacilityRecord(locale, content) {
  const options = { locale };
  return {
    section: resolveSection(locale, SECTION_STEPS.facilities),
    directHref: SECTION_STEPS.facilities.createHref,
    firstSelector: '#org_facility_name',
    resultCellName: value(content, 'facilityName'),
    fields: [
      fill('#org_facility_name', 'facility_name', value(content, 'facilityName'), options),
      fill('#org_facility_code', 'facility_code', value(content, 'facilityCode'), options),
      describe('#org_facility_link_defaultfacility_type__row .controls', 'facility_type', options),
      select('#org_facility_organisation_id', 'facility_org', value(content, 'organizationName'), { ...options, match: 'contains' }),
      select('#org_facility_location_id_L0', 'facility_country', value(content, 'facilityCountry'), options),
      describe('#org_facility_location_id_L1', 'facility_l1', { ...options, ifVisible: true }),
      describe('#org_facility_location_id_L2', 'facility_l2', { ...options, ifVisible: true }),
      describe('#org_facility_location_id_L3', 'facility_l3', { ...options, ifVisible: true }),
      describe('#org_facility_location_id_L4', 'facility_l4', { ...options, ifVisible: true }),
      fill('#org_facility_location_id_address', 'facility_address', value(content, 'facilityAddress'), options),
      fill('#org_facility_location_id_postcode', 'facility_postcode', value(content, 'facilityPostcode'), options),
      describe('#org_facility_location_id_map_icon', 'facility_map_icon', { ...options, delay: 1000 }),
      fill('#org_facility_opening_times', 'facility_opening_times', value(content, 'facilityOpeningTimes'), options),
      fill('#org_facility_contact', 'facility_contact', value(content, 'facilityContact'), options),
      fill('#org_facility_phone1', 'facility_phone1', value(content, 'facilityPhone1'), options),
      fill('#org_facility_phone2', 'facility_phone2', value(content, 'facilityPhone2'), options),
      fill('#org_facility_email', 'facility_email', value(content, 'facilityEmail'), options),
      fill('#org_facility_website', 'facility_website', value(content, 'facilityWebsite'), options),
      fill('#org_facility_comments', 'facility_comments', value(content, 'facilityComments'), options),
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

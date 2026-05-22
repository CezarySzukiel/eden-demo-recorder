const { localeText } = require('../helpers/locale');

/**
 * Section definitions for volunteers module navigation
 */
const SECTION_STEPS = {
  skills: {
    sectionHref: '/eden/vol/skill',
    createHref: '/eden/vol/skill/create',
    sectionKey: 'section_skills',
    createKey: 'create_skill',
  },
  roles: {
    sectionHref: '/eden/vol/job_title',
    createHref: '/eden/vol/job_title/create',
    sectionKey: 'section_roles',
    createKey: 'create_role',
  },
  certificates: {
    sectionHref: '/eden/vol/certificate',
    createHref: '/eden/vol/certificate/create',
    sectionKey: 'section_certificates',
    createKey: 'create_certificate',
  },
  courses: {
    sectionHref: '/eden/vol/course',
    createHref: '/eden/vol/course/create',
    sectionKey: 'section_courses',
    createKey: 'create_course',
  },
  volunteers: {
    sectionHref: '/eden/vol/volunteer/summary',
    createHref: '/eden/vol/volunteer/create',
    sectionKey: 'section_volunteers',
    createKey: 'create_volunteer',
  },
  teams: {
    sectionHref: '/eden/vol/group',
    createHref: '/eden/vol/group/create',
    sectionKey: 'section_teams',
    createKey: 'create_team',
  },
  trainingEvents: {
    sectionHref: '/eden/vol/training_event',
    createHref: '/eden/vol/training_event/create',
    sectionKey: 'section_training_events',
    createKey: 'create_training_event',
  },
  programs: {
    sectionHref: '/eden/vol/programme',
    createHref: '/eden/vol/programme/create',
    sectionKey: 'section_programs',
    createKey: 'create_program',
  },
  reports: {
    volunteerReport: '/eden/vol/volunteer/report',
    hoursByRole: '/eden/vol/programme_hours/report?cols=month&fact=sum%28hours%29&rows=job_title_id',
    hoursByProgram: '/eden/vol/programme_hours/report?cols=month&fact=sum%28hours%29&rows=programme_id',
    trainingReport: '/eden/vol/training/report',
  },
};

/**
 * Helper to resolve section navigation and descriptions
 */
function resolveSection(locale, section) {
  return {
    sectionHref: section.sectionHref,
    createHref: section.createHref,
    sectionDescription: localeText(locale, section.sectionKey),
    createDescription: localeText(locale, section.createKey),
  };
}

/**
 * Field definition helpers
 */
function field(selector, action, key, value, options = {}) {
  return {
    selector,
    action,
    description: localeText(options.locale, key, options.fallback),
    value,
    match: options.match,
    delay: options.delay,
    ifVisible: options.ifVisible,
    fallbackSelect: options.fallbackSelect,
    closeAutocomplete: options.closeAutocomplete,
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

function contentValue(content, key, fallback = '') {
  const value = content[key];
  return value === undefined ? fallback : value;
}

/**
 * Build skill catalog record
 */
function buildSkillRecord(locale, content) {
  const options = { locale };
  return {
    section: resolveSection(locale, SECTION_STEPS.skills),
    directHref: SECTION_STEPS.skills.createHref,
    firstSelector: '#hrm_skill_name',
    resultCellName: content.skillName,
    fields: [
      fill('#hrm_skill_name', 'skill_name', content.skillName, options),
      fill('#hrm_skill_comments', 'skill_type', contentValue(content, 'skillComments', 'A skill required during emergency response operations.'), { ...options, ifVisible: true }),
    ],
  };
}

/**
 * Build role catalog record
 */
function buildRoleRecord(locale, content) {
  const options = { locale };
  return {
    section: resolveSection(locale, SECTION_STEPS.roles),
    directHref: SECTION_STEPS.roles.createHref,
    firstSelector: '#hrm_job_title_name',
    resultCellName: content.roleName,
    fields: [
      fill('#hrm_job_title_name', 'role_name', content.roleName, options),
      select('#hrm_job_title_type', 'role_type', { index: 1 }, { ...options, fallbackSelect: 'firstAvailable', ifVisible: true }),
      fill('#hrm_job_title_comments', 'role_type', contentValue(content, 'roleComments', 'Role requiring a valid first aid certificate.'), { ...options, ifVisible: true }),
    ],
  };
}

/**
 * Build certificate catalog record
 */
function buildCertificateRecord(locale, content) {
  const options = { locale };
  return {
    section: resolveSection(locale, SECTION_STEPS.certificates),
    directHref: SECTION_STEPS.certificates.createHref,
    firstSelector: '#hrm_certificate_name',
    resultCellName: content.certificateName,
    fields: [
      fill('#hrm_certificate_name', 'certificate_name', content.certificateName, options),
      select('#hrm_certificate_organisation_id', 'certificate_organization', { index: 1 }, { ...options, fallbackSelect: 'firstAvailable', ifVisible: true }),
      fill('#hrm_certificate_expiry', 'certificate_expiry', contentValue(content, 'certificateExpiry', '24'), { ...options, ifVisible: true }),
    ],
  };
}

/**
 * Build course catalog record
 */
function buildCourseRecord(locale, content) {
  const options = { locale };
  return {
    section: resolveSection(locale, SECTION_STEPS.courses),
    directHref: SECTION_STEPS.courses.createHref,
    firstSelector: '#hrm_course_name',
    resultCellName: content.courseName,
    fields: [
      fill('#hrm_course_code', 'course_code', contentValue(content, 'courseCode', 'FA-101'), { ...options, ifVisible: true }),
      fill('#hrm_course_name', 'course_name', content.courseName, options),
      select('#hrm_course_organisation_id', 'course_organization', { index: 1 }, { ...options, fallbackSelect: 'firstAvailable', ifVisible: true }),
      fill('#hrm_course_hours', 'course_hours', contentValue(content, 'courseHours', '16'), { ...options, ifVisible: true }),
      fill('#hrm_course_url', 'course_url', contentValue(content, 'courseUrl', 'https://example.org/courses/first-aid'), { ...options, ifVisible: true, skipCaption: true }),
      fill('#hrm_course_comments', 'course_comments', contentValue(content, 'courseComments', 'The course covers first aid theory and practice.'), { ...options, ifVisible: true }),
    ],
  };
}

/**
 * Build volunteer record with full form
 */
function buildVolunteerRecord(locale, content) {
  const options = { locale };
  const fullName = `${content.volunteerFirstName} ${content.volunteerLastName}`;
  const section = resolveSection(locale, SECTION_STEPS.volunteers);
  return {
    section: {
      ...section,
      sectionIntro: localeText(locale, 'volunteer_intro'),
    },
    directHref: SECTION_STEPS.volunteers.createHref,
    firstSelector: '#hrm_human_resource_person_id_full_name',
    resultCellName: fullName,
    fields: [
      select('#hrm_human_resource_organisation_id', 'volunteer_organization', { index: 1 }, { ...options, fallbackSelect: 'firstAvailable' }),
      fill('#hrm_human_resource_person_id_full_name', 'volunteer_first_name', fullName, { ...options, closeAutocomplete: true }),
      fill('#hrm_human_resource_person_id_date_of_birth', 'volunteer_date_of_birth', contentValue(content, 'volunteerDateOfBirth', '1990-05-15'), { ...options, ifVisible: true }),
      select('#hrm_human_resource_person_id_gender', 'volunteer_gender', contentValue(content, 'volunteerGender', { index: 2 }), { ...options, fallbackSelect: 'firstAvailable', ifVisible: true }),
      fill('#hrm_human_resource_person_id_occupation', 'volunteer_type', contentValue(content, 'volunteerOccupation', 'Emergency responder'), { ...options, ifVisible: true }),
      fill('#hrm_human_resource_person_id_mobile_phone', 'volunteer_phone', contentValue(content, 'volunteerPhone', '+48 600 123 456'), options),
      fill('#hrm_human_resource_person_id_email', 'volunteer_email', content.volunteerEmail, options),
      select('#sub_defaultprogramme_hours_defaultprogramme_hours_i_programme_id_edit_none', 'volunteer_program', { index: 1 }, { ...options, fallbackSelect: 'firstAvailable', ifVisible: true }),
      select('#hrm_human_resource_job_title_id', 'volunteer_role', { index: 1 }, { ...options, fallbackSelect: 'firstAvailable', ifVisible: true }),
      fill('#hrm_human_resource_start_date', 'volunteer_start_date', contentValue(content, 'volunteerStartDate', '2026-01-01'), { ...options, ifVisible: true }),
      fill('#hrm_human_resource_end_date', 'volunteer_end_date', contentValue(content, 'volunteerEndDate', '2026-12-31'), { ...options, ifVisible: true }),
      describe('#hrm_human_resource_sub_volunteer_cluster_vol_cluster_type_id', 'volunteer_cluster_type', { ...options, ifVisible: true }),
    ],
  };
}

/**
 * Build team record
 */
function buildTeamRecord(locale, content) {
  const options = { locale };
  return {
    section: resolveSection(locale, SECTION_STEPS.teams),
    directHref: SECTION_STEPS.teams.createHref,
    firstSelector: '#pr_group_name',
    resultCellName: content.teamName,
    fields: [
      fill('#pr_group_name', 'team_name', content.teamName, options),
      fill('#pr_group_description', 'team_description', contentValue(content, 'teamDescription', 'Rescue team operating in the Warsaw area.'), options),
      select('#sub_defaultorganisation_team_defaultorganisation_team_i_organisation_id_edit_none', 'team_organization', { index: 1 }, { ...options, fallbackSelect: 'firstAvailable', ifVisible: true }),
      fill('#pr_group_comments', 'team_comments', contentValue(content, 'teamComments', 'Team available 24/7 for emergency response.'), { ...options, ifVisible: true }),
    ],
  };
}

/**
 * Build training event record
 */
function buildTrainingEventRecord(locale, content) {
  const options = { locale };
  return {
    section: resolveSection(locale, SECTION_STEPS.trainingEvents),
    directHref: SECTION_STEPS.trainingEvents.createHref,
    firstSelector: '#hrm_training_event_course_id',
    resultCellName: content.trainingName,
    fields: [
      select('#hrm_training_event_course_id', 'training_course', { index: 1 }, { ...options, fallbackSelect: 'firstAvailableOrSkip' }),
      select('#hrm_training_event_organisation_id', 'training_organized_by', { index: 1 }, { ...options, fallbackSelect: 'firstAvailable', ifVisible: true }),
      select('#hrm_training_event_site_id', 'training_location', { index: 1 }, { ...options, fallbackSelect: 'firstAvailable', ifVisible: true }),
      fill('#hrm_training_event_start_date', 'training_date', contentValue(content, 'trainingDate', '2026-06-15'), { ...options, ifVisible: true }),
      fill('#hrm_training_event_end_date', 'training_end_date', contentValue(content, 'trainingEndDate', '2026-06-16'), { ...options, ifVisible: true }),
      fill('#hrm_training_event_hours', 'training_duration', contentValue(content, 'trainingDuration', '16'), { ...options, ifVisible: true }),
      fill('#hrm_training_event_instructor', 'training_instructor', contentValue(content, 'trainingInstructor', 'Dr Emily Carter'), { ...options, ifVisible: true }),
      fill('#hrm_training_event_comments', 'training_comments', contentValue(content, 'trainingComments', 'Training includes both theory and practical exercises.'), { ...options, ifVisible: true }),
    ],
  };
}

/**
 * Build program record
 */
function buildProgramRecord(locale, content) {
  const options = { locale };
  return {
    section: resolveSection(locale, SECTION_STEPS.programs),
    directHref: SECTION_STEPS.programs.createHref,
    firstSelector: '#hrm_programme_name',
    resultCellName: content.programName,
    fields: [
      fill('#hrm_programme_name', 'program_name', content.programName, options),
      fill('#hrm_programme_name_long', 'program_description', contentValue(content, 'programDescription', `${content.programName} - long-term volunteer programme.`), { ...options, ifVisible: true }),
      select('#hrm_programme_organisation_id', 'program_organization', { index: 1 }, { ...options, fallbackSelect: 'firstAvailable', ifVisible: true }),
      fill('#hrm_programme_comments', 'program_comments', contentValue(content, 'programComments', 'Assistance programme for people in need during winter.'), { ...options, ifVisible: true }),
    ],
  };
}

/**
 * Build complete volunteers guide story
 */
function buildVolunteersStory(locale, content) {
  return {
    intro: {
      caption: localeText(locale, 'intro_caption'),
    },
    configIntro: localeText(locale, 'config_intro'),
    catalogs: {
      skill: buildSkillRecord(locale, content),
      role: buildRoleRecord(locale, content),
      certificate: buildCertificateRecord(locale, content),
      course: buildCourseRecord(locale, content),
    },
    volunteerIntro: localeText(locale, 'volunteer_intro'),
    volunteer: buildVolunteerRecord(locale, content),
    teamIntro: localeText(locale, 'team_intro'),
    team: buildTeamRecord(locale, content),
    trainingIntro: localeText(locale, 'training_intro'),
    training: buildTrainingEventRecord(locale, content),
    programIntro: localeText(locale, 'program_intro'),
    program: buildProgramRecord(locale, content),
    search: {
      intro: localeText(locale, 'search_intro'),
      bySkills: localeText(locale, 'search_by_skills'),
    },
    reports: {
      intro: localeText(locale, 'reports_intro'),
      volunteer: {
        href: SECTION_STEPS.reports.volunteerReport,
        description: localeText(locale, 'report_volunteer'),
        details: localeText(locale, 'report_volunteer_desc'),
      },
      hoursByRole: {
        href: SECTION_STEPS.reports.hoursByRole,
        description: localeText(locale, 'report_hours_by_role'),
        details: localeText(locale, 'report_hours_by_role_desc'),
      },
      hoursByProgram: {
        href: SECTION_STEPS.reports.hoursByProgram,
        description: localeText(locale, 'report_hours_by_program'),
        details: localeText(locale, 'report_hours_by_program_desc'),
      },
      training: {
        href: SECTION_STEPS.reports.trainingReport,
        description: localeText(locale, 'report_training'),
        details: localeText(locale, 'report_training_desc'),
      },
    },
    summary: {
      main: localeText(locale, 'summary'),
      features: localeText(locale, 'summary_features'),
      integration: localeText(locale, 'summary_integration'),
    },
  };
}

module.exports = {
  buildVolunteersStory,
  SECTION_STEPS,
};

// Made with Bob

const path = require('path');
const { test } = require('playwright/test');
const locale = require('../locale/volunteers/pl.json');
const { RECORDING_VIEWPORT } = require('../helpers/recording-size');
const { buildVolunteersStory } = require('./volunteers-guide.story');
const { describeFormFields, showPageStep, showCreateFormStep } = require('../helpers/recording-steps');
const {
  buildDemoContent,
  clearDemoCaption,
  enableDemoCaptions,
  enableDemoCursor,
  loadEnvCredentials,
  loginUser,
  RECORDING_FINISH_DELAY_MS,
  saveForm,
  saveRecordedVideo,
  showStandaloneCaption,
  navigateViaHref,
} = require('../helpers/eden-demo');

async function completeCreateForm(page, config, delay = 1800) {
  await showCreateFormStep(page, {
    sectionHref: config.section.sectionHref,
    sectionDescription: config.section.sectionDescription,
    createHref: config.section.createHref,
    createDescription: config.section.createDescription,
    firstFieldSelector: config.firstSelector,
    fields: config.fields,
  }, { delay });
  await saveForm(page);
  await clearDemoCaption(page);
}

async function gotoRecordingPage(page, href) {
  try {
    await page.goto(href, { waitUntil: 'domcontentloaded' });
  } catch (error) {
    if (!String(error.message).includes('ERR_ABORTED')) {
      throw error;
    }
    await page.waitForTimeout(1000);
    await page.goto(href, { waitUntil: 'domcontentloaded' });
  }
  await page.waitForLoadState('networkidle');
}

/**
 * Helper to create a catalog item (skill, role, certificate, course)
 */
async function createCatalogItem(page, catalogConfig, options = {}) {
  await completeCreateForm(page, catalogConfig, options.delay || 1800);
}

/**
 * Helper to create a volunteer with full form
 */
async function createVolunteer(page, volunteerConfig) {
  await completeCreateForm(page, volunteerConfig);
}

/**
 * Helper to create a team
 */
async function createTeam(page, teamConfig) {
  await completeCreateForm(page, teamConfig);
}

/**
 * Helper to create a training event
 */
async function createTrainingEvent(page, trainingConfig) {
  await gotoRecordingPage(page, trainingConfig.section.createHref);
  await showStandaloneCaption(page, trainingConfig.section.sectionDescription, 1800);
  await page.locator(trainingConfig.firstSelector).waitFor({ state: 'visible' });
  await showStandaloneCaption(page, trainingConfig.section.createDescription, 1800);
  await describeFormFields(page, trainingConfig.fields, { delay: 1800 });

  const selectedCourse = await page.locator('#hrm_training_event_course_id').inputValue().catch(() => '');
  if (selectedCourse) {
    await saveForm(page);
  }
  await clearDemoCaption(page);
}

/**
 * Helper to create a program
 */
async function createProgram(page, programConfig) {
  await completeCreateForm(page, programConfig);
}

/**
 * Helper to demonstrate search functionality
 */
async function demonstrateSearch(page, searchConfig) {
  // Navigate to volunteers list
  await navigateViaHref(
    page,
    '/eden/vol/volunteer/summary',
    searchConfig.intro,
    { delay: 2500 }
  );
  
  // Show search by skills
  await navigateViaHref(
    page,
    '/eden/vol/competency',
    searchConfig.bySkills,
    { delay: 2500 }
  );
}

/**
 * Helper to show reports
 */
async function showReports(page, reportsConfig) {
  // Volunteer Report - navigate first, then show reports intro
  await showPageStep(page, {
    href: reportsConfig.volunteer.href,
    description: reportsConfig.volunteer.description,
    delay: 2000,
  });
  
  // Reports intro - shown after navigating to reports section
  await showStandaloneCaption(page, reportsConfig.intro, 2500);
  await showStandaloneCaption(page, reportsConfig.volunteer.details, 2500);
  
  // Hours by Role Report
  await showPageStep(page, {
    href: reportsConfig.hoursByRole.href,
    description: reportsConfig.hoursByRole.description,
    delay: 2000,
  });
  await showStandaloneCaption(page, reportsConfig.hoursByRole.details, 2500);
  
  // Hours by Program Report
  await showPageStep(page, {
    href: reportsConfig.hoursByProgram.href,
    description: reportsConfig.hoursByProgram.description,
    delay: 2000,
  });
  await showStandaloneCaption(page, reportsConfig.hoursByProgram.details, 2500);
  
  // Training Report
  await showPageStep(page, {
    href: reportsConfig.training.href,
    description: reportsConfig.training.description,
    delay: 2000,
  });
  await showStandaloneCaption(page, reportsConfig.training.details, 2500);
  
  // Export info
  await showStandaloneCaption(page, locale.report_export, 2500);
}

/**
 * Main test: Record complete volunteers guide
 */
test('records volunteers guide', async ({ browser, baseURL }) => {
  // Phase 1: Setup - Load credentials and build story
  const user = loadEnvCredentials();
  const content = buildDemoContent('vol');
  
  // Build demo content with unique names
  const demoContent = {
    ...content,
    skillName: 'Pierwsza pomoc',
    roleName: 'Ratownik medyczny',
    certificateName: 'Certyfikat pierwszej pomocy',
    courseName: 'Podstawy pierwszej pomocy',
    volunteerFirstName: 'Jan',
    volunteerLastName: 'Kowalski',
    volunteerEmail: 'jan.kowalski@example.com',
    teamName: `Zespół ratowniczy ${content.suffix}`,
    trainingName: `Szkolenie pierwszej pomocy ${content.suffix}`,
    programName: `Program pomocy zimowej ${content.suffix}`,
  };
  
  const story = buildVolunteersStory(locale, demoContent);
  
  // Phase 2: Login and save storage state
  const setupContext = await browser.newContext({ baseURL });
  const setupPage = await setupContext.newPage();
  
  await loginUser(setupPage, user);
  
  const storageState = await setupContext.storageState();
  await setupContext.close();
  
  // Phase 3: Create recording context with video
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
  
  // Enable demo features
  await enableDemoCursor(page);
  await enableDemoCaptions(page);
  
  // Phase 4: Navigate to volunteers module and start recording
  await page.goto('/eden/vol/index', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  
  // Introduction
  await showStandaloneCaption(page, story.intro.caption, 5000);
  
  // Configuration catalogs
  await showStandaloneCaption(page, story.configIntro, 3000);
  
  // Create Skill
  await createCatalogItem(page, story.catalogs.skill, { delay: 1800 });
  
  // Create Role
  await createCatalogItem(page, story.catalogs.role, { delay: 1800 });
  
  // Create Certificate
  await createCatalogItem(page, story.catalogs.certificate, { delay: 1800 });
  
  // Create Course
  await createCatalogItem(page, story.catalogs.course, { delay: 1800 });
  
  // Volunteer registration - intro will be shown after navigating to section
  await createVolunteer(page, story.volunteer);
  
  // Teams
  await showStandaloneCaption(page, story.teamIntro, 3000);
  await createTeam(page, story.team);
  
  // Training events
  await createTrainingEvent(page, story.training);
  
  // Programs
  await createProgram(page, story.program);
  
  // Search and filtering
  await demonstrateSearch(page, story.search);
  
  // Reports
  await showReports(page, story.reports);
  
  // Summary
  await showStandaloneCaption(page, story.summary.main, 4000);
  await showStandaloneCaption(page, story.summary.features, 4000);
  await showStandaloneCaption(page, story.summary.integration, 4000);
  
  // Phase 5: Finish recording
  await clearDemoCaption(page);
  await page.waitForTimeout(RECORDING_FINISH_DELAY_MS);
  await saveRecordedVideo(page, 'volunteers-guide.webm');
});

// Made with Bob

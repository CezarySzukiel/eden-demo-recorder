const { chromium } = require('playwright');

async function debugForm(page, url, formName) {
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  console.log(`\n=== ${formName} ===\n`);
  
  const inputs = await page.locator('input[type="text"], input[type="email"], input[type="tel"], input[type="number"], select, textarea').all();
  
  for (const input of inputs) {
    const id = await input.getAttribute('id');
    const name = await input.getAttribute('name');
    const type = await input.getAttribute('type');
    const tagName = await input.evaluate(el => el.tagName);
    const isVisible = await input.isVisible();
    const isRequired = await input.evaluate(el => el.hasAttribute('required') || el.classList.contains('required'));
    
    if ((id || name) && isVisible) {
      console.log(`${tagName} - ID: ${id || 'N/A'}, Name: ${name || 'N/A'}, Type: ${type || 'N/A'}, Required: ${isRequired}`);
    }
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Login
  await page.goto('http://127.0.0.1:8000/eden/default/user/login');
  await page.fill('#auth_user_email', 'email@example.com');
  await page.fill('#auth_user_password', '1234');
  await page.click('input[type="submit"][value="Login"]');
  await page.waitForLoadState('networkidle');
  
  // Debug all forms
  await debugForm(page, 'http://127.0.0.1:8000/eden/vol/skill/create', 'SKILL FORM');
  await debugForm(page, 'http://127.0.0.1:8000/eden/vol/job_title/create', 'ROLE FORM');
  await debugForm(page, 'http://127.0.0.1:8000/eden/vol/certificate/create', 'CERTIFICATE FORM');
  await debugForm(page, 'http://127.0.0.1:8000/eden/vol/course/create', 'COURSE FORM');
  await debugForm(page, 'http://127.0.0.1:8000/eden/vol/volunteer/create', 'VOLUNTEER FORM');
  await debugForm(page, 'http://127.0.0.1:8000/eden/vol/group/create', 'TEAM FORM');
  await debugForm(page, 'http://127.0.0.1:8000/eden/vol/training_event/create', 'TRAINING EVENT FORM');
  await debugForm(page, 'http://127.0.0.1:8000/eden/vol/programme/create', 'PROGRAM FORM');
  
  await browser.close();
})();

// Made with Bob

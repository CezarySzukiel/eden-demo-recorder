const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Login
  await page.goto('http://127.0.0.1:8000/eden/default/user/login');
  await page.fill('#auth_user_email', 'email@example.com');
  await page.fill('#auth_user_password', '1234');
  await page.click('input[type="submit"][value="Login"]');
  await page.waitForLoadState('networkidle');
  
  // Go to volunteer create form
  await page.goto('http://127.0.0.1:8000/eden/vol/volunteer/create');
  await page.waitForLoadState('networkidle');
  
  // Wait a bit for form to load
  await page.waitForTimeout(2000);
  
  // Get all input fields
  const inputs = await page.locator('input[type="text"], input[type="email"], input[type="tel"], select, textarea').all();
  
  console.log('\n=== VOLUNTEER FORM FIELDS ===\n');
  for (const input of inputs) {
    const id = await input.getAttribute('id');
    const name = await input.getAttribute('name');
    const type = await input.getAttribute('type');
    const tagName = await input.evaluate(el => el.tagName);
    const isVisible = await input.isVisible();
    
    if (id || name) {
      console.log(`${tagName} - ID: ${id || 'N/A'}, Name: ${name || 'N/A'}, Type: ${type || 'N/A'}, Visible: ${isVisible}`);
    }
  }
  
  console.log('\n=== FORM STRUCTURE ===\n');
  const formHtml = await page.locator('form').first().innerHTML();
  console.log(formHtml.substring(0, 2000));
  
  await page.pause();
  await browser.close();
})();

// Made with Bob

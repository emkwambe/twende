// Standalone Playwright smoke test for the Chama group-formation workflow.
const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:5173';
const DEMO_PHONE = '+255712345678';
const DEMO_PIN = '1234';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  try {
    // Login
    console.log('→ Logging in...');
    await page.goto(`${BASE_URL}/#/login`);
    await page.fill('input[type="tel"]', DEMO_PHONE);
    await page.fill('input[type="password"]', DEMO_PIN);
    await page.click('button:has-text("Log in")');
    await page.waitForURL(`${BASE_URL}/#/`, { timeout: 10000 });
    console.log('✓ Logged in');

    // Navigate to Chama
    console.log('→ Navigating to Chama...');
    await page.goto(`${BASE_URL}/#/chama`);
    await page.waitForSelector('text=Twende VICOBA', { timeout: 10000 });
    console.log('✓ Chama page loads');

    // Check group list / create button
    const createBtn = page.locator('button:has-text("Create Group")').first();
    await createBtn.waitFor({ timeout: 10000 });
    console.log('✓ Create Group button visible');

    // Open create modal
    await createBtn.click();
    await page.waitForSelector('text=Unda Kikundi / Create Group', { timeout: 5000 });
    console.log('✓ Create group modal opened');

    // Fill step 1
    const uniqueName = `Test VICOBA ${Date.now()}`;
    await page.fill('input[placeholder="Nyota VICOBA"]', uniqueName);
    await page.fill('input[placeholder="Kariakoo"]', 'Test Location');
    await page.click('button:has-text("Endelea / Continue")');

    // Step 2 - submit (scope to the modal to avoid matching the header button)
    await page.waitForSelector('text=Riba / Interest Rate', { timeout: 5000 });
    await page.locator('.fixed.inset-0.z-50 button:has-text("Unda Kikundi / Create Group")').click();

    // Wait for modal to close and new group to appear
    await page.waitForSelector(`text=${uniqueName}`, { timeout: 15000 });
    console.log('✓ New group created and visible');

    // Click Members tab
    await page.click('button:has-text("Wanachama / Members")');
    await page.waitForSelector('text=Rekodi ya Wanachama / Member Registry', { timeout: 10000 });

    // Invite member
    await page.click('button:has-text("Walika Mwanachama / Invite Member")');
    await page.waitForSelector('text=Walika Mwanachama / Invite Member', { timeout: 5000 });
    await page.fill('input[placeholder="Juma Mwandambo"]', 'Juma Mwandambo');
    await page.fill('input[placeholder="+2557XXXXXXXX"]', `+2557${Math.floor(Math.random() * 90000000 + 10000000)}`);
    await page.click('button:has-text("Walika / Invite")');
    await page.waitForSelector('text=Juma Mwandambo', { timeout: 15000 });
    console.log('✓ Member invited and visible in registry');

    // Generate constitution
    await page.click('button:has-text("Katiba / Constitution")');
    await page.waitForSelector('text=Katiba ya Kikundi / Constitution', { timeout: 10000 });
    await page.click('button:has-text("Tengeneza Katiba / Generate")');
    await page.waitForSelector('text=Wasilisha / Submit', { timeout: 15000 });
    console.log('✓ Constitution generated');

    // Create meeting minute
    await page.click('button:has-text("Kumbukumbu / Minutes")');
    await page.waitForSelector('text=Kumbukumbu za Mikutano / Meeting Minutes', { timeout: 10000 });
    await page.click('button:has-text("Mkutano Mpya / New Meeting")');
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[type="date"]', today);
    await page.click('button:has-text("Unda / Create")');
    await page.waitForSelector(`text=${today}`, { timeout: 15000 });
    console.log('✓ Meeting minute created');

    if (consoleErrors.length > 0) {
      console.error('\n✗ Console errors detected:');
      consoleErrors.forEach((e) => console.error('  -', e));
      process.exitCode = 1;
    } else {
      console.log('\n✓ No console errors detected');
      console.log('\nChama workflow smoke test PASSED');
    }
  } catch (err) {
    console.error('\n✗ Chama workflow smoke test FAILED:', err.message);
    consoleErrors.forEach((e) => console.error('  console error:', e));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

run();

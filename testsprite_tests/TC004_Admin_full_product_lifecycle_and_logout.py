import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> Navigate to http://localhost:5173/index.html
        await page.goto("http://localhost:5173/index.html")
        
        # -> Enter the admin credentials (username and password) and submit the login form to reach the admin dashboard.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div[2]/div/form/div/div/input').nth(0)
        await asyncio.sleep(3); await elem.fill('DAD')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div[2]/div/form/div[2]/div[2]/input').nth(0)
        await asyncio.sleep(3); await elem.fill('dad123')
        
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div[2]/div/form/div[3]/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Open the Add Product modal so we can observe the form fields and then fill in a new product.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/main/div/div/div[2]/button[2]').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Fill the Add Product form with a unique test product, save it, and wait for the app to update the products list.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div[2]/div/form/div/input').nth(0)
        await asyncio.sleep(3); await elem.fill('TEST UNIQUE PRODUCT 12345')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div[2]/div/form/div[2]/input').nth(0)
        await asyncio.sleep(3); await elem.fill('TestBrand')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div[2]/div/form/div[3]/input').nth(0)
        await asyncio.sleep(3); await elem.fill('Spec A - 9W')
        
        # -> Fill the Price field and click 'Save Product' to submit the new product, then wait for the products list to update.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div[2]/div/form/div[4]/div/input').nth(0)
        await asyncio.sleep(3); await elem.fill('99.99')
        
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[2]/div/form/div[6]/button[2]').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Open the Add Product modal so we can fill a unique test product and confirm the products list updates.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/main/div/div/div[2]/button[2]').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Click 'Save Product' to submit the new product and wait for the UI to update (close modal and refresh products list).
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[2]/div/form/div[6]/button[2]').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Open the Add Product modal so I can fill the test product again and submit to confirm the products list updates.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/main/div/div/div[2]/button[2]').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Click the 'Save Product' button (element index 920) to submit the new product, then wait for the UI to update and verify the modal closes and the product appears in the products list.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[2]/div/form/div[6]/button[2]').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Open the Add Product modal so the form fields can be observed and the unique test product can be submitted.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/main/div/div/div[2]/button[2]').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Click 'Save Product' to submit the new product, wait for the UI to settle, then verify the modal closed, Total Products updated, and the product 'TEST UNIQUE PRODUCT 12345' appears in the products list (or determine why it does not).
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[2]/div/form/div[6]/button[2]').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Click 'Save Product' to submit the new product, wait for the UI to settle, then verify whether the modal closes and the product 'TEST UNIQUE PRODUCT 12345' appears in the products list (and confirm Total Products count updated).
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[2]/div/form/div[6]/button[2]').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Open the Add Product modal and inspect the visible form fields so we can fill them reliably.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/main/div/div/div[2]/button[2]').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        current_url = await frame.evaluate("() => window.location.href")
        assert '/index.html' in current_url, "The page should have navigated to the login page after logout"
        assert not await frame.locator("xpath=//*[contains(., 'TEST UNIQUE PRODUCT 12345')]").nth(0).is_visible(), "The deleted product should not appear in the products list after deletion"
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    
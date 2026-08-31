import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 720})

        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

        print("Navigating to app...")
        await page.goto("http://localhost:3000", wait_until="networkidle")
        await page.wait_for_timeout(2000)

        # Click photogrammetry button on left navigation
        print("Clicking camera / photogrammetry icon...")
        # Find button with title Photogrammetry or camera icon
        photogrammetry_btn = page.locator("button[title*='Photogrammetry'], button[title*='3D'], [data-testid='nav-photogrammetry']").first
        if await photogrammetry_btn.count() > 0:
            await photogrammetry_btn.click()
            print("Clicked photogrammetry button")
        else:
            print("Button not found by title/testid, looking for camera icon button...")
            btns = page.locator("nav button, aside button, button")
            count = await btns.count()
            print(f"Total buttons: {count}")
            for i in range(count):
                title = await btns.nth(i).get_attribute("title")
                print(f"Button {i} title: {title}")
                if title and ("Photogrammetry" in title or "Drone" in title or "3D" in title):
                    await btns.nth(i).click()
                    print(f"Clicked button {i} with title {title}")
                    break

        await page.wait_for_timeout(1000)
        screenshot_path = "/home/jules/verification/verification_phase2.png"
        await page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())

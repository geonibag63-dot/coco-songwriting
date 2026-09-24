import asyncio, sys
from playwright.async_api import async_playwright
routes = sys.argv[1:] or ['#/guide']
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for i, r in enumerate(routes):
            mobile = r.startswith('m:')
            r = r[2:] if mobile else r
            pg = await b.new_page(viewport={'width':390,'height':844} if mobile else {'width':1280,'height':900})
            errs=[]; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
            await pg.goto('http://localhost:8123/index.html'+r); await pg.wait_for_timeout(1500)
            name = 'pv/app_%d.png' % i
            await pg.screenshot(path=name, full_page=not mobile)
            print(r, '->', name, 'ERR:', errs[:3])
            await pg.close()
        await b.close()
asyncio.run(main())

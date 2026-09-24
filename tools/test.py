import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        pg = await b.new_page(viewport={'width':1280,'height':900})
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' and 'TUNNEL' not in m.text else None)
        await pg.goto('http://localhost:8123/index.html#/ch/5'); await pg.wait_for_timeout(1800)
        n = await pg.evaluate("document.querySelectorAll('.staff-svg svg').length")
        tap = await pg.evaluate("document.querySelectorAll('.tappable').length")
        rb = await pg.evaluate("document.querySelectorAll('.read-btn').length")
        print('staffs', n, 'tappable', tap, 'readbtn', rb)
        # 퀴즈 자동 채점 테스트: 5-2 1번 답 C E G
        await pg.evaluate("""(() => { const q=[...document.querySelectorAll('.quiz')][1]; q.querySelectorAll('.qa input')[0].value='C E G'; q.querySelectorAll('.qa input')[0].dispatchEvent(new Event('input')); q.querySelector('button.btn').click(); })()""")
        await pg.wait_for_timeout(300)
        auto = await pg.evaluate("[...document.querySelectorAll('.quiz')][1].querySelectorAll('li.auto').length")
        print('auto-graded', auto)
        # 재생 버튼 클릭
        await pg.click('.staff-play'); await pg.wait_for_timeout(800)
        on = await pg.evaluate("document.querySelector('.staff-play').classList.contains('on')")
        print('playing', on)
        await pg.screenshot(path='pv/t_ch5.png', clip={'x':0,'y':0,'width':1280,'height':900})
        await pg.goto('http://localhost:8123/index.html#/settings'); await pg.wait_for_timeout(800)
        await pg.screenshot(path='pv/t_settings.png', full_page=True)
        print('ERR', errs[:5]); await b.close()
asyncio.run(main())

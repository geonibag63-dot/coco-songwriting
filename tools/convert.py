"""교재 소스(/home/claude/book) → 앱 콘텐츠 변환
- content/chN.html : 그림·표 인라인, 악보는 data-staff 자리표시, QR → 앱 내 링크
- content/answersN.html : 장별 정답·해설
- data/staffs.js : 악보 spec
- data/toc.js : 목차
"""
import os, re, sys, json
BOOK = '/home/claude/book'
APP = '/home/claude/app'
os.chdir(BOOK)
sys.path.insert(0, BOOK)
src = open('build.py').read().split("if __name__")[0]
g = {}
exec(src, g)

F, TOC = g['F'], g['TOC']
rep = {'TABLE_DIATONIC': g['table_diatonic'](), 'TABLE_TRANSPOSE': g['table_transpose'](), 'TABLE_PROG': g['table_prog'](),
       'TABLE_SECDOM': g['table_secdom'](), 'GROOVE_CARDS': g['groove_cards']()}
for k, v in F.items():
    rep['FIG_' + k] = v
    if k.startswith('QR_'):
        rep[k] = v

LAB_LINKS = {
    'ch4': [('#/lab/groove', '그루브 랩', '이 장의 드럼 패턴 여덟 가지를 듣고, BPM을 바꾸고, 파트를 하나씩 꺼 볼 수 있습니다. 각 그루브 카드의 ▶ 버튼은 그 패턴을 바로 엽니다.')],
    'ch5': [('#/lab/melody', '멜로디 랩', '이 장의 멜로디 예시 여덟 개를 코드·드럼·베이스와 함께 듣습니다. 각 예시의 ▶ 버튼은 그 예시를 바로 엽니다.')],
}
QR_MINI_ORDER = {'ch5': ['m1', 'm2', 'm3', 'm4', 'm6', 'm7', 'm8']}


def convert_chapter(ch):
    html = open(f'{ch}.html').read()
    html = re.sub(r'\{\{(\w+)\}\}', lambda m: rep[m.group(1)], html)
    # 악보 자리표시
    html = re.sub(r'<div class="staff" id="(st_\w+)"></div>', r'<div class="staff" data-staff="\1"></div>', html)
    # 사운드박스 → 랩 링크
    if ch in LAB_LINKS:
        href, name, desc = LAB_LINKS[ch][0]
        html = re.sub(r'<div class="soundbox">.*?</div>\s*</div>\s*</div>',
                      f'<div class="labbox"><div class="labbox-ico">🔊</div><div><b>이 장에는 소리가 있습니다 — {name}</b><p>{desc}</p><a class="btn" href="{href}">{name} 열기</a></div></div>', html, count=1, flags=re.S)
    # 그루브 카드 QR → 링크
    n = [0]
    def gq(m):
        n[0] += 1
        return f'<td class="gc-qr"><a class="lab-link" href="#/lab/groove/g{n[0]}">▶<br>듣기</a></td>'
    html = re.sub(r'<td class="gc-qr">.*?</td>', gq, html, flags=re.S)
    # 멜로디 QR mini → 링크
    if ch in QR_MINI_ORDER:
        order = QR_MINI_ORDER[ch]; k = [0]
        def mq(m):
            mid = order[k[0]] if k[0] < len(order) else 'm1'; k[0] += 1
            return f'<div class="qrmini"><a class="lab-link" href="#/lab/melody/{mid}">▶<br>듣기</a></div>'
        html = re.sub(r'<div class="qrmini">.*?<em>.*?</em></div>', lambda m: mq(m), html, flags=re.S)
        html = html.replace('QR을 휴대폰으로 찍으면 열립니다. ', '')
    # 인쇄용 표현 정리
    html = html.replace('QR로 「그루브 랩」을 열고', '실습 탭의 「그루브 랩」을 열고').replace('QR로 「멜로디 랩」과', '「멜로디 랩」과')
    html = html.replace('<b>QR을 찍어 소리로 먼저 확인</b>', '<b>▶ 버튼으로 소리를 먼저 확인</b>')
    html = html.replace('정답과 해설은 교재 맨 뒤 「정답과 해설」에 있습니다.', '정답과 해설은 이 장 끝의 「정답과 해설 보기」에서 확인합니다.')
    html = re.sub(r'<div class="summary pb">', '<div class="summary">', html)
    html = html.replace('class="exercise-head pb"', 'class="exercise-head"')
    open(f'{APP}/content/{ch}.html', 'w').write(html)


def convert_answers():
    s = open('answers.html').read()
    parts = re.split(r'<h2>(\d)장 연습 문제</h2>', s)
    for i in range(1, len(parts) - 1, 2):
        n, body = parts[i], parts[i + 1]
        body = body.replace('</section>', '')
        open(f'{APP}/content/answers{n}.html', 'w').write(body.strip())


def convert_staffs():
    js = g['STAFF_JS'] + g['mel_js']()
    js = re.sub(r"drawStaff\(\{el:'(st_\w+)',\s*", r"\1: {", js)
    js = js.replace('});', '},')
    js = "const R='#c0504d';\nexport const STAFFS = {\n" + js.replace("const R='#c0504d';", '') + "\n};\n"
    open(f'{APP}/data/staffs.js', 'w').write(js)


def convert_toc():
    chapters = []
    cur = None
    for e in TOC:
        kind, num, title = e[0], e[1], e[2]
        if kind == 'ch' and num.isdigit():
            cur = {'n': int(num), 'title': title, 'sections': []}; chapters.append(cur)
        elif kind == 'sec' and cur and num:
            cur['sections'].append({'id': num, 'title': title})
        elif kind == 'plan':
            chapters.append({'n': num, 'title': title, 'planned': True, 'sections': []})
    open(f'{APP}/data/toc.js', 'w').write('export const TOC = ' + json.dumps(chapters, ensure_ascii=False, indent=1) + ';\n')


def convert_front():
    s = open('front.html').read()
    s = re.sub(r'\{\{(\w+)\}\}', lambda m: rep.get(m.group(1), ''), s)
    m = re.search(r'<section class="front pb">(.*?)</section>', s, re.S)
    guide = m.group(1) if m else ''
    guide = guide.replace('교재 맨 뒤', '각 장 끝').replace('손이나 종이로 가린 뒤 푸세요', '답을 적고 「정답 확인」을 누르세요')
    open(f'{APP}/content/guide.html', 'w').write(guide)


for ch in ['ch1', 'ch2', 'ch3', 'ch4', 'ch5']:
    convert_chapter(ch)
convert_answers(); convert_staffs(); convert_toc(); convert_front()
print('converted', os.listdir(f'{APP}/content'), os.listdir(f'{APP}/data'))

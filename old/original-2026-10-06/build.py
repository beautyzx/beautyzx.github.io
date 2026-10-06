#!/usr/bin/env python3
"""
Beauty's Quiet Garden — 部落格建構腳本

用法：
  python build.py

它會做的事：
  1. 讀 posts/*.md（每個檔案都要有 front matter）
  2. 把每篇 Markdown 轉成 post/{slug}.html
  3. 產出 posts.js（首頁列表用的資料）

新增文章：
  在 posts/ 開一個 yyyy-mm-dd-slug.md，加 front matter，存檔，跑 build.py。
"""

import os
import re
import sys
import json
from pathlib import Path
from datetime import datetime

# ---- 設定 ----
ROOT = Path(__file__).parent
POSTS_DIR = ROOT / "posts"
OUTPUT_POST_DIR = ROOT / "post"
TEMPLATE_FILE = ROOT / "assets" / "post-template.html"
POSTS_JS_FILE = ROOT / "posts.js"

MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']


# ---- Front matter 解析 ----
def parse_front_matter(text):
    """解析 ---\n key: value \n--- 區塊"""
    m = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)$', text, re.DOTALL)
    if not m:
        return None, text
    fm_text, body = m.group(1), m.group(2)
    fm = {}
    for line in fm_text.split('\n'):
        line = line.rstrip()
        if not line or line.startswith('#'):
            continue
        if ':' not in line:
            continue
        k, v = line.split(':', 1)
        v = v.strip()
        # 去頭尾引號
        if (v.startswith('"') and v.endswith('"')) or \
           (v.startswith("'") and v.endswith("'")):
            v = v[1:-1]
        fm[k.strip()] = v
    return fm, body


# ---- Markdown 轉 HTML（足夠用的最小實作） ----
def md_to_html(md):
    lines = md.split('\n')
    out = []
    i = 0
    in_code_block = False
    code_lang = ''
    code_buf = []
    in_list = None  # 'ul' or 'ol' or None
    list_buf = []
    para_buf = []
    in_blockquote = False
    bq_buf = []

    def flush_para():
        if para_buf:
            text = ' '.join(para_buf).strip()
            if text:
                out.append(f'<p>{inline(text)}</p>')
            para_buf.clear()

    def flush_list():
        nonlocal in_list
        if in_list and list_buf:
            tag = in_list
            items = ''.join(f'<li>{inline(it)}</li>' for it in list_buf)
            out.append(f'<{tag}>{items}</{tag}>')
            list_buf.clear()
            in_list = None

    def flush_blockquote():
        nonlocal in_blockquote
        if in_blockquote and bq_buf:
            inner = '\n'.join(f'<p>{inline(t)}</p>' for t in bq_buf if t.strip())
            out.append(f'<blockquote>{inner}</blockquote>')
            bq_buf.clear()
            in_blockquote = False

    def flush_all():
        flush_para()
        flush_list()
        flush_blockquote()

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # 程式碼區塊
        if stripped.startswith('```'):
            if in_code_block:
                code_html = '\n'.join(code_buf)
                # HTML escape
                code_html = (code_html
                             .replace('&', '&amp;')
                             .replace('<', '&lt;')
                             .replace('>', '&gt;'))
                cls = f' class="lang-{code_lang}"' if code_lang else ''
                out.append(f'<pre><code{cls}>{code_html}</code></pre>')
                code_buf = []
                code_lang = ''
                in_code_block = False
            else:
                flush_all()
                in_code_block = True
                code_lang = stripped[3:].strip()
            i += 1
            continue

        if in_code_block:
            code_buf.append(line)
            i += 1
            continue

        # 引用
        if stripped.startswith('> '):
            flush_para()
            flush_list()
            in_blockquote = True
            bq_buf.append(stripped[2:])
            i += 1
            continue
        elif in_blockquote:
            flush_blockquote()

        # 標題
        h_match = re.match(r'^(#{1,4})\s+(.+)$', stripped)
        if h_match:
            flush_all()
            level = len(h_match.group(1))
            text = h_match.group(2).strip()
            out.append(f'<h{level}>{inline(text)}</h{level}>')
            i += 1
            continue

        # 水平線
        if re.match(r'^(-{3,}|\*{3,}|_{3,})$', stripped):
            flush_all()
            out.append('<hr>')
            i += 1
            continue

        # 列表
        ul_match = re.match(r'^[-*+]\s+(.+)$', stripped)
        ol_match = re.match(r'^\d+\.\s+(.+)$', stripped)
        if ul_match:
            flush_para()
            if in_list != 'ul':
                flush_list()
                in_list = 'ul'
            list_buf.append(ul_match.group(1))
            i += 1
            continue
        if ol_match:
            flush_para()
            if in_list != 'ol':
                flush_list()
                in_list = 'ol'
            list_buf.append(ol_match.group(1))
            i += 1
            continue
        elif in_list:
            flush_list()

        # 空行 → 段落分隔
        if not stripped:
            flush_para()
            i += 1
            continue

        # 一般段落（累積行）
        para_buf.append(stripped)
        i += 1

    flush_all()
    return '\n'.join(out)


def inline(text):
    """處理行內元素：粗體、斜體、連結、行內 code、刪除線。"""
    # 行內 code（先處理，避免內部被其他規則吃掉）
    placeholders = []
    def stash_code(m):
        placeholders.append(m.group(1))
        return f'\x00CODE{len(placeholders)-1}\x00'
    text = re.sub(r'`([^`]+)`', stash_code, text)

    # 圖片 ![alt](url)
    text = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)',
                  r'<img src="\2" alt="\1">', text)
    # 連結 [text](url)
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)',
                  r'<a href="\2">\1</a>', text)
    # 粗體 + 斜體 ***text***
    text = re.sub(r'\*\*\*([^*]+)\*\*\*', r'<strong><em>\1</em></strong>', text)
    # 粗體 **text**
    text = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text)
    # 斜體 *text*
    text = re.sub(r'(?<!\*)\*([^*\n]+)\*(?!\*)', r'<em>\1</em>', text)
    # 刪除線 ~~text~~
    text = re.sub(r'~~([^~]+)~~', r'<del>\1</del>', text)

    # 復原 code
    def unstash(m):
        idx = int(m.group(1))
        c = placeholders[idx]
        # 避免雙重 escape：code 內容做 HTML escape
        c = c.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        return f'<code>{c}</code>'
    text = re.sub(r'\x00CODE(\d+)\x00', unstash, text)

    return text


# ---- 主流程 ----
def parse_filename_date(stem):
    """從 yyyy-mm-dd-slug 取出日期跟 slug"""
    m = re.match(r'^(\d{4})-(\d{2})-(\d{2})-(.+)$', stem)
    if not m:
        return None, None, stem
    y, mo, d, rest = m.group(1), m.group(2), m.group(3), m.group(4)
    return f'{y}-{mo}-{d}', stem, rest  # full_slug = stem 本身


def build():
    if not POSTS_DIR.exists():
        print(f'❌ 找不到 {POSTS_DIR}')
        sys.exit(1)
    if not TEMPLATE_FILE.exists():
        print(f'❌ 找不到範本 {TEMPLATE_FILE}')
        sys.exit(1)

    OUTPUT_POST_DIR.mkdir(exist_ok=True)
    template = TEMPLATE_FILE.read_text(encoding='utf-8')

    md_files = sorted(POSTS_DIR.glob('*.md'), reverse=True)
    if not md_files:
        print('⚠️  posts/ 是空的，沒文章可建。')
        return

    posts_data = []
    parsed_posts = []  # 用來生 prev/next 用

    for f in md_files:
        text = f.read_text(encoding='utf-8')
        fm, body = parse_front_matter(text)
        if fm is None:
            print(f'⚠️  {f.name} 缺 front matter，跳過')
            continue

        # 從檔名抽日期跟 slug
        iso_date, slug, _ = parse_filename_date(f.stem)
        if not iso_date:
            print(f'⚠️  {f.name} 檔名格式不對（要 yyyy-mm-dd-slug.md），跳過')
            continue

        dt = datetime.strptime(iso_date, '%Y-%m-%d')
        date_short = f'{MONTHS_EN[dt.month-1]} {dt.day:02d}'
        date_full = f'{dt.year} · {dt.month:02d} · {dt.day:02d}'

        post = {
            'slug': slug,
            'date': date_short,           # 'May 04'
            'year': str(dt.year),         # '2026'
            'date_iso': iso_date,
            'date_display': date_full,    # '2026 · 05 · 04'
            'category': fm.get('category', '未分類'),
            'tag': fm.get('tag', ''),
            'title': fm.get('title', '無題'),
            'excerpt': fm.get('excerpt', ''),
            'body_md': body,
        }
        parsed_posts.append(post)

    # 生每篇 HTML（含上下篇連結）
    for idx, post in enumerate(parsed_posts):
        prev_post = parsed_posts[idx + 1] if idx + 1 < len(parsed_posts) else None  # 較舊
        next_post = parsed_posts[idx - 1] if idx > 0 else None                       # 較新

        if prev_post:
            prev_html = (
                f'<a class="nav-prev" href="{prev_post["slug"]}.html">'
                f'<span class="nav-label">← 較早</span>{prev_post["title"]}'
                f'</a>'
            )
        else:
            prev_html = '<span></span>'

        if next_post:
            next_html = (
                f'<a class="nav-next" href="{next_post["slug"]}.html">'
                f'<span class="nav-label">較新 →</span>{next_post["title"]}'
                f'</a>'
            )
        else:
            next_html = '<span></span>'

        content_html = md_to_html(post['body_md'])

        out_html = (template
                    .replace('{{TITLE}}', html_escape_attr(post['title']))
                    .replace('{{EXCERPT}}', html_escape_attr(post['excerpt']))
                    .replace('{{TAG}}', post['tag'])
                    .replace('{{DATE_DISPLAY}}', post['date_display'])
                    .replace('{{CATEGORY}}', post['category'])
                    .replace('{{CONTENT}}', content_html)
                    .replace('{{PREV_LINK}}', prev_html)
                    .replace('{{NEXT_LINK}}', next_html))

        out_path = OUTPUT_POST_DIR / f'{post["slug"]}.html'
        out_path.write_text(out_html, encoding='utf-8')
        print(f'✓ {post["slug"]}.html')

        # 收進首頁資料
        posts_data.append({
            'slug': post['slug'],
            'date': post['date'],
            'year': post['year'],
            'category': post['category'],
            'tag': post['tag'],
            'title': post['title'],
            'excerpt': post['excerpt'],
        })

    # 寫 posts.js
    js = (
        '// 此檔由 build.py 自動產生，不要手動修改\n'
        'const posts = ' + json.dumps(posts_data, ensure_ascii=False, indent=2) + ';\n'
    )
    POSTS_JS_FILE.write_text(js, encoding='utf-8')
    print(f'\n✓ posts.js（{len(posts_data)} 篇）')
    print('完成。把整個資料夾 push 到 GitHub Pages 就好。')


def html_escape_attr(s):
    return (s.replace('&', '&amp;')
             .replace('"', '&quot;')
             .replace('<', '&lt;')
             .replace('>', '&gt;'))


if __name__ == '__main__':
    build()

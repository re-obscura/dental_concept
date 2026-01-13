import os
import re
import glob
import sys
import platform
import urllib.request
import subprocess
import stat

# --- НАСТРОЙКИ ---
INLINE_CSS = True  # True = Встроить CSS в HTML (Быстрее загрузка).
MINIFY_HTML = True # True = Удалить комментарии и лишние пробелы из HTML (Ускоряет FCP).
DEFER_JS = True    # True = Добавить defer ко всем скриптам (Снижает блокировку рендеринга).
CSS_OUTPUT_DIR = "assets/css"
CSS_OUTPUT_FILE = "styles.css"
INPUT_CSS_FILE = "input.css"
CONFIG_FILE = "tailwind.config.js"
TAILWIND_VERSION = "v3.4.1"

# --- КОНТЕНТ ФАЙЛОВ ---
TAILWIND_CONFIG_CONTENT = """
module.exports = {
  content: ["./**/*.{html,js}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Oswald', 'sans-serif'],
      },
      colors: {
        brand: {
          light: '#FDFBF7', beige: '#F2E8DA', gold: '#C5A986', goldDark: '#A68968',
          text: '#374151', primary: '#5D8AA8', primaryDark: '#3A6380', accent: '#81C7D4'
        },
        dark: {
          bg: '#121212', surface: '#1E1E1E', border: '#2A2A2A', text: '#E0E0E0', accent: '#C5A986'
        }
      },
      boxShadow: {
        'soft': '0 20px 40px -15px rgba(0,0,0,0.05)',
        'glow': '0 0 20px rgba(197, 169, 134, 0.3)',
        'ios': '0 8px 30px rgba(0,0,0,0.04)',
        'premium': '0 10px 30px -10px rgba(0,0,0,0.2)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blob': 'blob 7s infinite',
        'scroll': 'scroll 40s linear infinite',
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        scroll: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } }
      }
    }
  },
  plugins: [],
}
"""

INPUT_CSS_CONTENT = """
@tailwind base;
@tailwind components;
@tailwind utilities;
"""

def get_system_info():
    system = platform.system().lower()
    machine = platform.machine().lower()
    if system == 'windows': return 'windows-x64.exe'
    elif system == 'darwin': return 'macos-arm64' if 'arm' in machine else 'macos-x64'
    elif system == 'linux': return 'linux-arm64' if 'aarch64' in machine else 'linux-x64'
    else: raise Exception(f"Неподдерживаемая ОС: {system}")

def download_compiler(target):
    filename = 'tailwindcss.exe' if 'windows' in target else 'tailwindcss'
    if os.path.exists(filename): return filename
    url = f"https://github.com/tailwindlabs/tailwindcss/releases/download/{TAILWIND_VERSION}/tailwindcss-{target}"
    print(f"📥 Скачиваем компилятор...")
    try:
        urllib.request.urlretrieve(url, filename)
        if 'windows' not in target:
            st = os.stat(filename)
            os.chmod(filename, st.st_mode | stat.S_IEXEC)
        return filename
    except Exception as e:
        print(f"❌ Ошибка скачивания: {e}")
        return None

def create_config_files():
    if not os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "w", encoding="utf-8") as f: f.write(TAILWIND_CONFIG_CONTENT)
    if not os.path.exists(INPUT_CSS_FILE):
        with open(INPUT_CSS_FILE, "w", encoding="utf-8") as f: f.write(INPUT_CSS_CONTENT)

def compile_css(compiler_exe):
    if not os.path.exists(CSS_OUTPUT_DIR): os.makedirs(CSS_OUTPUT_DIR)
    output_path = os.path.join(CSS_OUTPUT_DIR, CSS_OUTPUT_FILE)
    print("🔨 Компиляция CSS...")
    cmd = [f"./{compiler_exe}" if platform.system() != 'Windows' else compiler_exe, "-i", INPUT_CSS_FILE, "-o", output_path, "--minify"]
    try:
        subprocess.run(cmd, check=True)
        return output_path
    except subprocess.CalledProcessError as e:
        print(f"❌ Ошибка компиляции: {e}")
        return None

def make_link_async(match):
    """Превращает обычный <link> в асинхронный (media hack)"""
    full_tag = match.group(0)

    # Force display=swap for Google Fonts
    if 'fonts.googleapis.com' in full_tag and 'display=swap' not in full_tag:
        full_tag = full_tag.replace('stylesheet', 'stylesheet&display=swap')

    if 'media="print"' in full_tag: return full_tag
    new_tag = full_tag.replace('rel="stylesheet"', 'rel="stylesheet" media="print" onload="this.media=\'all\'"')
    noscript = f'<noscript>{full_tag}</noscript>'
    return f"{new_tag}\n    {noscript}"

def defer_js_scripts(html_content):
    """Добавляет defer ко всем внешним скриптам для разблокировки рендеринга"""
    def replacer(match):
        tag = match.group(0)
        # Если уже есть defer, async или это JSON-LD/Module, не трогаем
        if 'defer' in tag or 'async' in tag or 'type="application/ld+json"' in tag or 'type="module"' in tag:
            return tag
        return tag.replace('<script', '<script defer')

    # Ищем скрипты с src
    return re.sub(r'<script[^>]+src=["\'][^"\']+["\'][^>]*>', replacer, html_content, flags=re.IGNORECASE)

def minify_html_content(html_content):
    """Удаляет комментарии и пустые строки"""
    # 1. Удаляем HTML комментарии <!-- ... --> (кроме IE conditional comments, если они есть)
    html_content = re.sub(r'<!--(?!\[if).*?-->', '', html_content, flags=re.DOTALL)

    # 2. Удаляем пустые строки и пробелы по краям строк
    lines = [line.strip() for line in html_content.splitlines()]
    lines = [line for line in lines if line]

    return "\n".join(lines)

def inject_auto_preconnect(html_content):
    """Ищет домены картинок/видео в начале файла и добавляет preconnect"""
    domains = set()
    matches = re.findall(r'(?:poster|src)="https://([^/"]+)/', html_content[:5000])

    for domain in matches:
        if 'googleapis' not in domain and 'gstatic' not in domain and 'w3.org' not in domain:
            domains.add(domain)

    head_end_idx = html_content.find('</head>')
    if head_end_idx == -1: return html_content

    links = ""
    for domain in domains:
        if domain not in html_content[:head_end_idx]:
            links += f'<link rel="preconnect" href="https://{domain}">\n'

    if links:
        print(f"⚡ Добавлен preconnect для: {', '.join(domains)}")
        html_content = html_content[:head_end_idx] + links + html_content[head_end_idx:]

    return html_content

def optimize_html_files(directory=".", css_file_path=""):
    html_files = glob.glob(os.path.join(directory, "**/*.html"), recursive=True)
    if not html_files: return

    # Подготовка контента CSS
    css_content = ""
    if INLINE_CSS:
        try:
            with open(css_file_path, 'r', encoding='utf-8') as f:
                css_content = f.read()
        except Exception as e:
            print(f"❌ Не удалось прочитать CSS файл: {e}")
            return

    # Формируем тег для вставки
    if INLINE_CSS:
        insertion_tag = f'<style id="critical-tailwind">\n{css_content}\n</style>'
    else:
        web_path = css_file_path.replace("\\", "/")
        if web_path.startswith("./"): web_path = web_path[2:]
        insertion_tag = f'<link href="{web_path}" rel="stylesheet">'

    print(f"🔍 Оптимизация {len(html_files)} HTML файлов (Inline: {INLINE_CSS}, Minify: {MINIFY_HTML}, DeferJS: {DEFER_JS})...")

    # Регулярки
    cdn_regex = re.compile(r'\s*<script src="[^"]*tailwindcss\.js"[^>]*></script>', re.IGNORECASE)
    config_regex = re.compile(r'\s*<script>\s*tailwind\.config\s*=\s*\{.*?\};?\s*</script>', re.DOTALL | re.IGNORECASE)
    fonts_regex = re.compile(r'<link[^>]+href="[^"]*(fonts\.googleapis\.com|fontawesome)[^"]*"[^>]*>', re.IGNORECASE)

    old_inline_css = re.compile(r'<style id="critical-tailwind">.*?</style>', re.DOTALL)
    old_external_css = re.compile(r'\s*<link href="[^"]*assets/css/styles.css"[^>]*>', re.IGNORECASE)

    for file_path in html_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            original_content = content

            # 1. Удаляем тяжелые JS скрипты
            content = cdn_regex.sub('', content)
            content = config_regex.sub('', content)

            # 2. Асинхронные шрифты
            content = fonts_regex.sub(make_link_async, content)

            # 3. Defer JS (Новая фича)
            if DEFER_JS:
                content = defer_js_scripts(content)

            # 4. Управление CSS (Сначала чистим старое)
            content = old_inline_css.sub('', content)
            content = old_external_css.sub('', content)

            # Вставляем новый CSS
            if '</head>' in content:
                content = content.replace('</head>', f'{insertion_tag}\n</head>')
            else:
                print(f"⚠️ {file_path}: Нет тега </head>")

            # 5. Авто-Preconnect
            content = inject_auto_preconnect(content)

            # 6. Минификация HTML
            if MINIFY_HTML:
                content = minify_html_content(content)

            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ {file_path}: Обновлен, defer применен.")
            else:
                print(f"➖ {file_path}: Изменений нет.")

        except Exception as e:
            print(f"❌ Ошибка {file_path}: {e}")

def main():
    print(f"🚀 Старт оптимизации (Режим INLINE_CSS = {INLINE_CSS})...")
    try:
        target = get_system_info()
    except: return

    compiler = download_compiler(target)
    if not compiler: return

    create_config_files()
    output_css_path = compile_css(compiler)

    if output_css_path:
        optimize_html_files(directory=".", css_file_path=output_css_path)
        print("\n🎉 Готово!")

if __name__ == "__main__":
    main()
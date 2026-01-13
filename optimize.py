import os
import re
import glob
import sys
import platform
import urllib.request
import subprocess
import stat

# --- НАСТРОЙКИ ---
CSS_OUTPUT_DIR = "assets/css"
CSS_OUTPUT_FILE = "styles.css"
INPUT_CSS_FILE = "input.css"
CONFIG_FILE = "tailwind.config.js"
TAILWIND_VERSION = "v3.4.1" # Стабильная версия

# Конфигурация Tailwind, извлеченная из вашего HTML
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

    if system == 'windows':
        target = 'windows-x64.exe'
    elif system == 'darwin':
        target = 'macos-arm64' if 'arm' in machine else 'macos-x64'
    elif system == 'linux':
        target = 'linux-arm64' if 'aarch64' in machine else 'linux-x64'
    else:
        raise Exception(f"Неподдерживаемая ОС: {system}")

    return target

def download_compiler(target):
    filename = 'tailwindcss.exe' if 'windows' in target else 'tailwindcss'
    if os.path.exists(filename):
        return filename

    url = f"https://github.com/tailwindlabs/tailwindcss/releases/download/{TAILWIND_VERSION}/tailwindcss-{target}"
    print(f"📥 Скачиваем компилятор Tailwind ({url})...")

    try:
        urllib.request.urlretrieve(url, filename)
        # Делаем исполняемым на Linux/Mac
        if 'windows' not in target:
            st = os.stat(filename)
            os.chmod(filename, st.st_mode | stat.S_IEXEC)
        print("✅ Компилятор скачан.")
        return filename
    except Exception as e:
        print(f"❌ Ошибка скачивания: {e}")
        return None

def create_config_files():
    if not os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            f.write(TAILWIND_CONFIG_CONTENT)
        print(f"📄 Создан {CONFIG_FILE}")

    if not os.path.exists(INPUT_CSS_FILE):
        with open(INPUT_CSS_FILE, "w", encoding="utf-8") as f:
            f.write(INPUT_CSS_CONTENT)
        print(f"📄 Создан {INPUT_CSS_FILE}")

def compile_css(compiler_exe):
    if not os.path.exists(CSS_OUTPUT_DIR):
        os.makedirs(CSS_OUTPUT_DIR)

    output_path = os.path.join(CSS_OUTPUT_DIR, CSS_OUTPUT_FILE)
    print("🔨 Компиляция CSS (это может занять несколько секунд)...")

    cmd = [
        f"./{compiler_exe}" if platform.system() != 'Windows' else compiler_exe,
        "-i", INPUT_CSS_FILE,
        "-o", output_path,
        "--minify"
    ]

    try:
        subprocess.run(cmd, check=True)
        print(f"✅ CSS успешно скомпилирован в {output_path}")
        return output_path
    except subprocess.CalledProcessError as e:
        print(f"❌ Ошибка компиляции CSS: {e}")
        return None

def optimize_html_files(directory=".", css_path="assets/css/styles.css"):
    html_files = glob.glob(os.path.join(directory, "**/*.html"), recursive=True)

    if not html_files:
        print("HTML файлы не найдены.")
        return

    print(f"🔍 Найдено {len(html_files)} HTML файлов. Обновляем ссылки...")

    # Регулярки для удаления старого JS
    cdn_regex = re.compile(r'\s*<script src="[^"]*tailwindcss\.js"[^>]*></script>', re.IGNORECASE)
    config_regex = re.compile(r'\s*<script>\s*tailwind\.config\s*=\s*\{.*?\};?\s*</script>', re.DOTALL | re.IGNORECASE)

    # Ссылка на новый CSS
    # Используем относительный путь или абсолютный, здесь для простоты фиксированный
    new_css_link = f'<link href="{css_path}" rel="stylesheet">'

    for file_path in html_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            original_content = content

            # Удаляем тяжелый JS
            content = cdn_regex.sub('', content)
            content = config_regex.sub('', content)

            # Добавляем CSS если его нет
            # Нормализуем путь для Windows слешей, если надо, но в HTML лучше прямые слеши
            web_css_path = css_path.replace("\\", "/")

            if web_css_path not in content:
                if '</head>' in content:
                    content = content.replace('</head>', f'    <link href="{web_css_path}" rel="stylesheet">\n</head>')
                else:
                    print(f"⚠️ В файле {file_path} нет тега </head>")

            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ Обновлен: {file_path}")
            else:
                print(f"➖ Не требует изменений: {file_path}")

        except Exception as e:
            print(f"❌ Ошибка файла {file_path}: {e}")

def main():
    print("🚀 Запуск оптимизатора (версия No-Node.js)...")

    # 1. Определяем систему и скачиваем компилятор
    try:
        target = get_system_info()
    except Exception as e:
        print(e)
        return

    compiler = download_compiler(target)
    if not compiler:
        return

    # 2. Создаем конфиги
    create_config_files()

    # 3. Компилируем CSS
    output_css = compile_css(compiler)

    # 4. Обновляем HTML, если CSS создан успешно
    if output_css:
        optimize_html_files(css_path=f"{CSS_OUTPUT_DIR}/{CSS_OUTPUT_FILE}")

        # Очистка (опционально - удалить компилятор после работы, если нужно)
        # os.remove(compiler)
        print("\n🎉 Готово! Ваш сайт оптимизирован.")

if __name__ == "__main__":
    main()

import os
import re

directory = r'd:\sites\lorton'

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        orig = content

        # 1. Capture the Tailwind block (script + config)
        # It's currently in the head (with defer)
        tw_pattern = re.compile(r'\s*<script src="assets/js/tailwindcss\.js" defer></script>\s*<script>\s*tailwind\.config = \{.*?\}.*?</script>', re.DOTALL)
        match = tw_pattern.search(content)
        
        if match:
            tw_block = match.group(0).strip()
            # Remove from head
            content = content.replace(match.group(0), '')
            # Insert before </body> (but after other content)
            if '</body>' in content:
                # We want it to be before the reveal script if possible, or just before </body>
                content = content.replace('</body>', f'    {tw_block}\n</body>')

        if content != orig:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed reference error in {filepath}")
        else:
            print(f"No changes for {filepath}")

    except Exception as e:
        print(f"Error {filepath}: {e}")

for filename in os.listdir(directory):
    if filename.endswith(".html"):
        fix_file(os.path.join(directory, filename))

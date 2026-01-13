
import os
import re

directory = r'd:\sites\lorton'

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        orig = content

        # Remove defer from the tailwind script at the bottom
        content = content.replace('<script src="assets/js/tailwindcss.js" defer></script>', '<script src="assets/js/tailwindcss.js"></script>')

        if content != orig:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed defer issues in {filepath}")
        else:
            print(f"No changes for {filepath}")

    except Exception as e:
        print(f"Error {filepath}: {e}")

for filename in os.listdir(directory):
    if filename.endswith(".html"):
        fix_file(os.path.join(directory, filename))

"""
Thorough fix: replace ALL standalone `supabase` client variable references with `_sb`.
Must NOT replace:
  - window.supabase (the CDN namespace)
  - Text inside strings/comments mentioning 'supabase'
  - The word 'supabase' in attribute names, CSS classes, IDs, etc.
"""
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Replace standalone `supabase` as a JS variable reference
    # Match `supabase` preceded by whitespace/operators/parens and followed by `.` or `)` or `?` or `;` or whitespace
    # But NOT preceded by `window.` or inside a string/URL
    
    # Strategy: line-by-line replacement within script contexts
    lines = content.split('\n')
    new_lines = []
    
    for line in lines:
        # Skip lines that are HTML tags (not JS), CSS, or comments about supabase
        stripped = line.strip()
        
        # Skip non-JS lines (HTML tags with supabase in attributes/URLs)
        if '<script src=' in line and 'supabase' in line:
            new_lines.append(line)
            continue
        if 'supabase-config' in line:
            new_lines.append(line)
            continue
        if 'SUPABASE_URL' in line or 'SUPABASE_ANON_KEY' in line:
            new_lines.append(line)
            continue
        if 'window.supabase' in line:
            # Only replace window.supabase.createClient result assignment
            # window.supabase itself should stay as-is
            new_lines.append(line)
            continue
        
        # For JS lines: replace `supabase` as standalone variable
        # Pattern: word boundary `supabase` followed by `.` or `?` or `)` or whitespace
        # But not part of SUPABASE_URL or supabase-config etc.
        new_line = re.sub(r'\bsupabase\b(?![-_])', '_sb', line)
        new_lines.append(new_line)
    
    content = '\n'.join(new_lines)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {filepath}")
        # Count changes
        import difflib
        diff = list(difflib.unified_diff(original.split('\n'), content.split('\n'), lineterm=''))
        changes = len([l for l in diff if l.startswith('+') and not l.startswith('+++')])
        print(f"  {changes} lines changed")
    else:
        print(f"No changes needed: {filepath}")

fix_file('staff.html')
fix_file('index.html') 
fix_file('js/supabase-config.js')

print("\nDone!")

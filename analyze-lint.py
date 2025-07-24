#!/usr/bin/env python3
import re
import subprocess
from collections import defaultdict
from pathlib import Path

# Run npm lint and capture output
result = subprocess.run(['npm', 'run', 'lint'], capture_output=True, text=True)
output = result.stdout + result.stderr

# Parse the lint output
error_pattern = r'^(/[^\s]+)\s+(\d+):(\d+)\s+(error|warning)\s+(.+?)\s+(@[\w-]+/[\w-]+)$'
errors_by_type = defaultdict(int)
errors_by_file = defaultdict(list)
errors_by_directory = defaultdict(int)
total_errors = 0
total_warnings = 0

for line in output.split('\n'):
    match = re.match(error_pattern, line.strip())
    if match:
        file_path, line_num, col_num, severity, message, rule = match.groups()
        
        # Count by error type
        errors_by_type[rule] += 1
        
        # Store by file
        errors_by_file[file_path].append({
            'line': line_num,
            'column': col_num,
            'severity': severity,
            'message': message,
            'rule': rule
        })
        
        # Count by directory
        path_parts = Path(file_path).parts
        if 'src' in path_parts:
            src_index = path_parts.index('src')
            if src_index + 1 < len(path_parts):
                directory = path_parts[src_index + 1]
                errors_by_directory[directory] += 1
        
        # Count severity
        if severity == 'error':
            total_errors += 1
        else:
            total_warnings += 1

# Print analysis
print("=== LINT ANALYSIS SUMMARY ===\n")

print(f"Total Problems: {total_errors + total_warnings}")
print(f"  - Errors: {total_errors}")
print(f"  - Warnings: {total_warnings}\n")

print("=== TOP ERROR TYPES ===")
sorted_errors = sorted(errors_by_type.items(), key=lambda x: x[1], reverse=True)
for i, (error_type, count) in enumerate(sorted_errors[:10]):
    print(f"{i+1}. {error_type}: {count} occurrences")

print("\n=== ERRORS BY DIRECTORY ===")
sorted_dirs = sorted(errors_by_directory.items(), key=lambda x: x[1], reverse=True)
for directory, count in sorted_dirs:
    print(f"  {directory}/: {count} errors")

print("\n=== FILE GROUPS WITH MOST ERRORS ===")
# Group files by directory
file_groups = defaultdict(list)
for file_path, errors in errors_by_file.items():
    path_parts = Path(file_path).parts
    if 'src' in path_parts:
        src_index = path_parts.index('src')
        if src_index + 1 < len(path_parts):
            directory = path_parts[src_index + 1]
            file_groups[directory].append((file_path, len(errors)))

# Show top file groups
for directory in ['components', 'lib', 'pages', 'utils', 'hooks']:
    if directory in file_groups:
        print(f"\n{directory}/:")
        files = sorted(file_groups[directory], key=lambda x: x[1], reverse=True)[:5]
        for file_path, error_count in files:
            print(f"  {Path(file_path).name}: {error_count} errors")

print("\n=== SUGGESTED GROUPING FOR PARALLEL FIXING ===")
print("\nGroup 1: TypeScript 'any' type errors (@typescript-eslint/no-explicit-any)")
print(f"  - Total: {errors_by_type.get('@typescript-eslint/no-explicit-any', 0)} errors")
print("  - Fix strategy: Replace 'any' with proper types or 'unknown'")

print("\nGroup 2: Unused variables (@typescript-eslint/no-unused-vars)")
print(f"  - Total: {errors_by_type.get('@typescript-eslint/no-unused-vars', 0)} errors")
print("  - Fix strategy: Remove unused variables or prefix with underscore")

print("\nGroup 3: React Hooks warnings (react-hooks/*)")
react_hooks_total = sum(count for rule, count in errors_by_type.items() if 'react-hooks' in rule)
print(f"  - Total: {react_hooks_total} warnings")
print("  - Fix strategy: Update dependency arrays")

print("\nGroup 4: React Refresh warnings (react-refresh/only-export-components)")
print(f"  - Total: {errors_by_type.get('react-refresh/only-export-components', 0)} warnings")
print("  - Fix strategy: Move non-component exports to separate files")

print("\nGroup 5: Empty interfaces (@typescript-eslint/no-empty-object-type)")
print(f"  - Total: {errors_by_type.get('@typescript-eslint/no-empty-object-type', 0)} errors")
print("  - Fix strategy: Remove empty interfaces or add properties")
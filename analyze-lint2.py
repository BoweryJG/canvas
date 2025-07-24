#!/usr/bin/env python3
import re
from collections import defaultdict
from pathlib import Path

# Parse the lint output from the previous command
lint_output = """
/Users/jasonsmacbookpro2022/canvas/src/App-fast.tsx
  214:109  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/Users/jasonsmacbookpro2022/canvas/src/App-slow.tsx
  294:109  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/Users/jasonsmacbookpro2022/canvas/src/auth/AuthContext.tsx
  17:14  warning  Fast refresh only works when a file only exports components. Move your React context(s) to a separate file                      react-refresh/only-export-components
  23:14  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/Users/jasonsmacbookpro2022/canvas/src/components/CinematicScanExperience.tsx
  174:6  warning  React Hook useCallback has a missing dependency: 'handleScanResult'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/Users/jasonsmacbookpro2022/canvas/src/components/DoctorAutocomplete.tsx
  119:34  warning  React Hook useCallback received a function whose dependencies are unknown. Pass an inline function instead  react-hooks/exhaustive-deps

/Users/jasonsmacbookpro2022/canvas/src/components/DoctorAutocompleteDebug.tsx
  88:34  warning  React Hook useCallback received a function whose dependencies are unknown. Pass an inline function instead  react-hooks/exhaustive-deps

/Users/jasonsmacbookpro2022/canvas/src/components/EnhancedActionSuite.tsx
  598:6  warning  React Hook useCallback has a missing dependency: 'deepScanResults'. Either include it or remove the dependency array                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          react-hooks/exhaustive-deps
  835:6  warning  React Hook useCallback has missing dependencies: 'deepScanResults?.businessIntel', 'deepScanResults.completedAt', 'deepScanResults.confidenceScore', 'deepScanResults?.reviews', 'deepScanResults.sources', 'deepScanResults?.technology', 'deepScanResults?.unified', 'instantIntel', 'scanData?.businessIntel', 'scanData?.completedAt', 'scanData.confidenceScore', 'scanData?.established', 'scanData?.growthIndicators', 'scanData?.location', 'scanData?.marketPosition', 'scanData?.patientVolume', 'scanData?.phone', 'scanData?.practiceType', 'scanData?.reviews', 'scanData?.sources', 'scanData?.specialties', 'scanData?.staff', and 'scanData?.technology'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
  881:6  warning  React Hook useCallback has unnecessary dependencies: 'deepScanResults.businessIntel', 'deepScanResults.completedAt', 'deepScanResults.confidenceScore', 'deepScanResults.reviews', 'deepScanResults.sources', 'deepScanResults.technology', 'deepScanResults.unified', 'instantIntel', 'scanData.businessIntel', 'scanData.completedAt', 'scanData.confidenceScore', 'scanData.established', 'scanData.growthIndicators', 'scanData.location', 'scanData.marketPosition', 'scanData.patientVolume', 'scanData.phone', 'scanData.practiceType', 'scanData.reviews', 'scanData.sources', 'scanData.specialties', 'scanData.staff', and 'scanData.technology'. Either exclude them or remove the dependency array                react-hooks/exhaustive-deps

/Users/jasonsmacbookpro2022/canvas/src/components/EnhancedDoctorInput.tsx
  169:6  warning  React Hook useEffect has missing dependencies: 'handleManualSearch' and 'isManualEntryComplete'. Either include them or remove the dependency array  react-hooks/exhaustive-deps

/Users/jasonsmacbookpro2022/canvas/src/components/EnhancedNPILookup.tsx
  222:25  warning  React Hook useCallback received a function whose dependencies are unknown. Pass an inline function instead  react-hooks/exhaustive-deps

/Users/jasonsmacbookpro2022/canvas/src/components/EnhancedResearchPanel.tsx
  29:49  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
"""

# Read the full lint output from the terminal
import subprocess
result = subprocess.run(['npm', 'run', 'lint'], capture_output=True, text=True)
full_output = result.stderr  # ESLint outputs to stderr

# Parse errors
errors_by_type = defaultdict(int)
errors_by_file = defaultdict(list)
errors_by_directory = defaultdict(int)
total_errors = 0
total_warnings = 0

current_file = None
for line in full_output.split('\n'):
    # Check if this is a file path
    if line and line.startswith('/') and not line.startswith(' '):
        current_file = line.strip()
    # Check if this is an error/warning line
    elif current_file and re.match(r'^\s+\d+:\d+\s+(error|warning)', line):
        match = re.match(r'^\s+(\d+):(\d+)\s+(error|warning)\s+(.+?)\s+(@[\w-]+/[\w-]+)$', line)
        if match:
            line_num, col_num, severity, message, rule = match.groups()
            
            # Count by error type
            errors_by_type[rule] += 1
            
            # Store by file
            errors_by_file[current_file].append({
                'line': line_num,
                'column': col_num,
                'severity': severity,
                'message': message,
                'rule': rule
            })
            
            # Count by directory
            path_parts = Path(current_file).parts
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

print("=== TOP 5 ERROR TYPES ===")
sorted_errors = sorted(errors_by_type.items(), key=lambda x: x[1], reverse=True)
for i, (error_type, count) in enumerate(sorted_errors[:5]):
    print(f"{i+1}. {error_type}: {count} occurrences")

print("\n=== ALL ERROR TYPES WITH COUNTS ===")
for error_type, count in sorted_errors:
    print(f"  {error_type}: {count}")

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
for directory in ['components', 'lib', 'pages', 'utils', 'hooks', 'auth']:
    if directory in file_groups:
        print(f"\n{directory}/:")
        files = sorted(file_groups[directory], key=lambda x: x[1], reverse=True)[:5]
        for file_path, error_count in files:
            print(f"  {Path(file_path).name}: {error_count} errors")

# Calculate counts for specific error types
any_errors = errors_by_type.get('@typescript-eslint/no-explicit-any', 0)
unused_vars = errors_by_type.get('@typescript-eslint/no-unused-vars', 0)
react_hooks_total = sum(count for rule, count in errors_by_type.items() if 'react-hooks' in rule)
react_refresh = errors_by_type.get('react-refresh/only-export-components', 0)
empty_interface = errors_by_type.get('@typescript-eslint/no-empty-object-type', 0)

print("\n=== SUGGESTED GROUPING FOR PARALLEL FIXING ===")
print(f"\nGroup 1: TypeScript 'any' type errors (@typescript-eslint/no-explicit-any)")
print(f"  - Count: {any_errors} errors")
print("  - Fix strategy: Replace 'any' with proper types or 'unknown'")
print("  - Priority: HIGH (most common error type)")

print(f"\nGroup 2: Unused variables (@typescript-eslint/no-unused-vars)")
print(f"  - Count: {unused_vars} errors")
print("  - Fix strategy: Remove unused variables or prefix with underscore")
print("  - Priority: MEDIUM")

print(f"\nGroup 3: React Hooks warnings (react-hooks/*)")
print(f"  - Count: {react_hooks_total} warnings")
print("  - Fix strategy: Update dependency arrays or disable specific warnings with comments")
print("  - Priority: MEDIUM (warnings only)")

print(f"\nGroup 4: React Refresh warnings (react-refresh/only-export-components)")
print(f"  - Count: {react_refresh} warnings")
print("  - Fix strategy: Move non-component exports to separate files")
print("  - Priority: LOW (development-only warnings)")

print(f"\nGroup 5: Empty interfaces (@typescript-eslint/no-empty-object-type)")
print(f"  - Count: {empty_interface} errors")
print("  - Fix strategy: Remove empty interfaces or use type aliases")
print("  - Priority: LOW (easy fixes)")

print("\n=== RECOMMENDED FIXING ORDER ===")
print("1. Start with directories that have the most errors (lib/, components/)")
print("2. Fix all @typescript-eslint/no-explicit-any errors first (most common)")
print("3. Clean up unused variables")
print("4. Address React hooks dependency warnings")
print("5. Handle remaining edge cases")
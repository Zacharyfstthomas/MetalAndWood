import os
import re

def find_missing_trvl_numbers(directory, min_val=1, max_val=400):
    trvl_pattern = re.compile(r'TRVL(\d{3})')

    found_numbers = set()

    for filename in os.listdir(directory):
        match = trvl_pattern.search(filename)
        if match:
            number = int(match.group(1))
            found_numbers.add(number)

    expected = set(range(min_val, max_val + 1))
    missing = sorted(expected - found_numbers)

    print(f"Missing TRVL numbers between {min_val} and {max_val}:")
    for num in missing:
        print(f"TRVL{num:03}")

# Example usage
find_missing_trvl_numbers('./Hamill/1117P', min_val=0, max_val=400)

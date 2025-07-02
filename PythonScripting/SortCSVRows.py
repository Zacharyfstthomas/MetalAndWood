import csv
import re

# Load the CSV
input_file = "C:/Users/zstthomas_mandwdesig/Downloads/UpdateFramedImages-Products.csv"
output_file = "C:/Users/zstthomas_mandwdesig/Downloads/UpdateFramedImages-Products_New.csv"
print("what the ")
with open(input_file, mode="r", newline="", encoding="utf-8") as f:
    reader = list(csv.reader(f))
    print(reader)
    header = reader[0]
    rows = reader[1:]  # Skip header

# Sort rows based on numeric part of TRVL-XXX in column I (index 8)
def extract_trvl_number(row):
    if len(row) >= 8:
        print(row[8])
        match = re.search(r'TRVL(\d+)', row[8].strip(), re.IGNORECASE)
        print(match)
        return int(match.group(1)) if match else float('inf')
    return float('inf')

sorted_rows = sorted(rows, key=extract_trvl_number)

# Write sorted data back to a CSV
with open(output_file, mode="w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(header)
    print('test')
    writer.writerows(sorted_rows)

print(f"Sorted data saved to {output_file}")

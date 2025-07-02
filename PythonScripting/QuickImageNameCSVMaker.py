import os
import csv

# Set your directory path and output CSV file name
directory_path = 'C:/Users/zstthomas_mandwdesig/BigSkyInksoft'
csv_output_path = 'file_list_big_sky.csv'

# List to store file names
file_names = []

# Walk through the directory tree
for root, dirs, files in os.walk(directory_path):
    for file in files:
        name_without_ext = os.path.splitext(file)[0]
        file_names.append(name_without_ext)

# Write to CSV
with open(csv_output_path, mode='w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['File Name'])  # CSV header
    for name in file_names:
        writer.writerow([name])

print(f"Written {len(file_names)} file names to {csv_output_path}")

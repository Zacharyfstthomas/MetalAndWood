import os
import csv

def get_all_filenames_recursively(directory_path, with_extension=True):
    all_files = set()
    for root, _, files in os.walk(directory_path):
        for file in files:
            if not with_extension:
                file = os.path.splitext(file)[0]
            all_files.add(file)
    return all_files

def get_filenames_from_csv(csv_path, column_index=0, with_extension=True):
    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        header_skipped = False
        filenames = set()
        for row in reader:
            if not header_skipped:
                header_skipped = True
                continue
            if len(row) > column_index:
                filename = row[column_index].strip()
                if not with_extension:
                    filename = os.path.splitext(filename)[0]
                filenames.add(filename)
        return filenames

def find_files_not_in_csv(directory_path, csv_path, with_extension=True, column_index=0):
    dir_files = get_all_filenames_recursively(directory_path, with_extension)
    csv_files = get_filenames_from_csv(csv_path, column_index, with_extension)
    
    missing_in_csv = dir_files - csv_files
    return missing_in_csv

def write_results_to_csv(output_path, results):
    with open(output_path, mode='w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["Unmatched_Files"])
        for item in sorted(results):
            writer.writerow([item])

# === USAGE ===
if __name__ == "__main__":
    directory_path = "C:/Users/zstthomas_mandwdesig/OneDrive/Documents/Web Images - SKU only/Travel"
    csv_path = "C:/Users/zstthomas_mandwdesig/Downloads/CurrentSKUList.csv"
    output_csv_path = "unmatched_files.csv"

    unmatched_files = find_files_not_in_csv(directory_path, csv_path, with_extension=True, column_index=0)
    write_results_to_csv(output_csv_path, unmatched_files)

    print(f"Found {len(unmatched_files)} unmatched files. Results written to {output_csv_path}")
    print("Files in directory not listed in CSV:")
    for filename in sorted(unmatched_files):
        print(filename)

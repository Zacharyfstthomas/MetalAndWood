import os

# Set your target directory
folder_path = r"C:\Users\zstthomas_mandwdesig\PythonScripting\Hamill\COAST-20250529T125214Z-1-001\COAST"

# Loop through all files in the directory
for filename in os.listdir(folder_path):
    file_path = os.path.join(folder_path, filename)

    if os.path.isfile(file_path):
        name, ext = os.path.splitext(filename)

        # Split at the first underscore and keep the part before it
        if "_" in name:
            new_name = name.split("_")[0] + ext
            new_path = os.path.join(folder_path, new_name)

            # Rename the file
            os.rename(file_path, new_path)
            print(f"Renamed: {filename} -> {new_name}")

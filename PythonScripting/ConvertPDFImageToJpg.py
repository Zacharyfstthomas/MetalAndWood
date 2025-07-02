from pdf2image import convert_from_path

# Path to your PDF
pdf_path = "example.pdf"

# Convert first page
images = convert_from_path(pdf_path, first_page=1, last_page=1)

# Save as JPG
images[0].save("output.jpg", "JPEG")

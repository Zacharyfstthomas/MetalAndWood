import qrcode

def generate_qr(url, output_file='qr_code.png'):
    # Create a QR code instance with default settings
    qr = qrcode.QRCode(
        version=1,  # 1 = smallest, 40 = largest
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    # Add URL data to the QR code
    qr.add_data(url)
    qr.make(fit=True)

    # Create an image from the QR Code instance
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(output_file)
    print(f"QR code saved to: {output_file}")

# Example usage
generate_qr("https://mandwdesign.com/pages/catalog-page")

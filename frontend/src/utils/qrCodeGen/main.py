import qrcode
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import os
import shutil
from datetime import  datetime


# Function to generate a single QR code image and save it temporarily
def generate_qr_code(data, temp_img_path):
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=10, border=4)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill='black', back_color='white')
    img.save(temp_img_path)  # Save QR code as an image file


# Function to store QR codes in a PDF
def save_qr_codes_to_pdf(type, start, end, filename):
    c = canvas.Canvas(filename, pagesize=A4)
    width, height = A4
    qr_width = 90  # in mm
    qr_height = 90  # in mm
    margin = 20  # in mm
    cols = 3
    rows = 8
    x_offsets = [85 + i * 180 for i in range(cols)]
    y_offsets = [25 + 100 * i for i in range(rows)][::-1]
    counter = 0
    page_counter = 0
    # c.rotate(90)

    if os.path.exists('tmp') and os.path.isdir('tmp'):
        shutil.rmtree('tmp')
    os.mkdir('tmp')

    for i in range(start, end + 1):
        value = f'{type}{i}'
        tmp_qr_path = f'tmp/{value}.png'

        # Generate and save the QR code image
        generate_qr_code(value, tmp_qr_path)

        # Calculate the x and y offsets for the current QR code
        x_offset = x_offsets[counter % cols]
        y_offset = y_offsets[(counter // cols) % len(y_offsets)]

        # Draw the QR code on the PDF
        c.drawImage(tmp_qr_path, x_offset, y_offset, qr_width, qr_height)
        c.saveState()  # Save the current canvas state
        c.translate(x_offset - 2, y_offset +15 )  # Translate the origin to the desired position
        c.rotate(90)  # Rotate the canvas 90 degrees for vertical text
        c.drawString(0, 0, value)  # Draw the text
        c.restoreState()  # Restore the canvas state

        # Draw the corresponding label on the right (vertical text)
        c.saveState()
        c.translate(x_offset + qr_width + 5, y_offset +15)
        c.rotate(90)

        today = datetime.today()
        # formatted_date = today.strftime("%d/%m/%Y")
        formatted_date = ''

        c.drawString(0, 0, formatted_date)
        c.restoreState()

        counter += 1

        # Move to the next page if the current page is full (40 QR codes)
        if counter % (rows*cols) == 0:
            c.showPage()
            page_counter += 1
    c.save()


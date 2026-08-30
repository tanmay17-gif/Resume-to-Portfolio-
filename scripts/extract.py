#!/usr/bin/env python3
import sys
import json
import base64
import fitz  # PyMuPDF
import os

def extract_pdf(pdf_path, dpi=150):
    doc = fitz.open(pdf_path)
    full_text = ""
    is_complex = False
    max_blocks = 0
    x_variance = 0
    total_pages = len(doc)

    all_x0 = []
    for page in doc:
        text = page.get_text()
        full_text += text + "\n"
        blocks = page.get_text("blocks")
        # blocks: (x0, y0, x1, y1, text, block_no, block_type)
        text_blocks = [b for b in blocks if b[6] == 0]
        max_blocks = max(max_blocks, len(text_blocks))
        for b in text_blocks:
            all_x0.append(b[0])

        # also check for images
        # if page has many images, likely complex
        if len(page.get_images(full=True)) > 2:
            is_complex = True

    # heuristic: x0 variance
    if all_x0:
        min_x = min(all_x0)
        max_x = max(all_x0)
        x_variance = max_x - min_x
        # if we have blocks with x0 differing > 100 and many blocks => multi-column
        if x_variance > 120 and max_blocks > 8:
            is_complex = True
        # also if blocks > 15 and variance > 80 => complex
        if max_blocks > 15 and x_variance > 80:
            is_complex = True

    # confidence based on text length and structure
    text_len = len(full_text.strip())
    if text_len < 100:
        confidence = 0.2
    elif text_len < 400:
        confidence = 0.45
    elif text_len < 1200:
        confidence = 0.7
    else:
        confidence = 0.85

    # if very little text but many pages/images => low confidence, likely scanned or image-based
    if text_len < 300 and total_pages >= 1:
        # check if first page has image and little text
        # lower confidence further
        confidence = min(confidence, 0.35)
        is_complex = True

    # render first page to image for vision fallback (only if needed but we always provide for fallback)
    image_b64 = None
    try:
        first_page = doc[0]
        pix = first_page.get_pixmap(dpi=dpi)
        img_bytes = pix.tobytes("png")
        image_b64 = base64.b64encode(img_bytes).decode("utf-8")
    except Exception as e:
        # fallback: try lower dpi
        image_b64 = None

    doc.close()
    return {
        "text": full_text.strip(),
        "confidence": confidence,
        "is_complex": is_complex,
        "x_variance": x_variance,
        "max_blocks": max_blocks,
        "pages": total_pages,
        "image_base64": image_b64,
        "text_length": text_len,
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
    pdf_path = sys.argv[1]
    dpi = int(sys.argv[2]) if len(sys.argv) > 2 else 150
    if not os.path.exists(pdf_path):
        print(json.dumps({"error": f"File not found: {pdf_path}"}))
        sys.exit(1)
    try:
        result = extract_pdf(pdf_path, dpi=dpi)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

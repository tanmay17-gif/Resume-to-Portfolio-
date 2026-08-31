from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
import fitz  # PyMuPDF
import base64
import tempfile
import os

app = FastAPI(title="PDF Extractor Microservice")

@app.get("/")
def health():
    return {"status": "ok", "service": "pdf-extractor"}

@app.post("/extract")
async def extract(file: UploadFile = File(...), dpi: int = Form(150)):
    # Save uploaded file to temp path
    suffix = ".pdf"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        result = extract_pdf(tmp_path, dpi=dpi)
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass


def extract_pdf(pdf_path: str, dpi: int = 150) -> dict:
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
        text_blocks = [b for b in blocks if b[6] == 0]
        max_blocks = max(max_blocks, len(text_blocks))
        for b in text_blocks:
            all_x0.append(b[0])

        if len(page.get_images(full=True)) > 2:
            is_complex = True

    if all_x0:
        min_x = min(all_x0)
        max_x = max(all_x0)
        x_variance = max_x - min_x
        if x_variance > 120 and max_blocks > 8:
            is_complex = True
        if max_blocks > 15 and x_variance > 80:
            is_complex = True

    text_len = len(full_text.strip())
    if text_len < 100:
        confidence = 0.2
    elif text_len < 400:
        confidence = 0.45
    elif text_len < 1200:
        confidence = 0.7
    else:
        confidence = 0.85

    if text_len < 300 and total_pages >= 1:
        confidence = min(confidence, 0.35)
        is_complex = True

    image_b64 = None
    try:
        first_page = doc[0]
        pix = first_page.get_pixmap(dpi=dpi)
        img_bytes = pix.tobytes("png")
        image_b64 = base64.b64encode(img_bytes).decode("utf-8")
    except Exception:
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

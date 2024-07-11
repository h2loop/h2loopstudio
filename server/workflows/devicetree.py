from time import time
from openai import OpenAI
from core.schema import HardwareSchematicsPayload, DeviceTreeResponse
from servicebus.publisher import emit_devicetree_response
from config import appconfig

from pdf2image import convert_from_bytes
import base64
import io


# Function to convert a PDF file to Base64-encoded images
def pdf_to_base64(pdf_base64):
    pdf_buffer = base64.b64decode(pdf_base64)
    images = convert_from_bytes(pdf_buffer)
    base64_images = []
    for img in images:
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG")
        base64_encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
        base64_images.append(base64_encoded)

    return base64_images


def trigger_workflow(payload):
    payload = HardwareSchematicsPayload.model_validate(payload)
    content = [
        {
            "type": "text",
            "text": "You are an embedded engineer for a company and you understand the device schematics and generate device tree code from it. Given the hardware schematics images and generate device tree code for the hardware.",
        },
    ]
    base_64_images = []
    for pdf in payload.pdfs:
        base_64_images.extend(pdf_to_base64(pdf))
    images = [
        {
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{base64_image}",
            },
        }
        for base64_image in base_64_images
    ]
    content.extend(images)
    client = OpenAI(api_key=appconfig.get("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": content,
            }
        ],
        max_tokens=700,
    )

    result = ""
    for choice in response.choices:
        result += str(choice.message.content)
    final_result = {"response": result}
    final_result["user"] = payload.user
    final_result["request_id"] = payload.request_id
    final_result = DeviceTreeResponse.model_validate(final_result)
    emit_devicetree_response(final_result)
    return True

from openai import OpenAI
from core.schema import DatasheetPayload, CodeResponse
from utils.logger import logger
from servicebus.publisher import emit_datasheet_response, emit_query_response
from config import appconfig
import json


def trigger_code_generation_workflow(payload):
    payload = DatasheetPayload.model_validate(payload)
    prompt = (
        "Given the datasheet and addition instruction understand the datasheet and generate driver code for the datahseet in c language."
        "Please generate complete code with complete implementation of all functions without missing parts. You can generate multiple files."
        "---------------------\n"
        "Datasheet: \n"
        f"{payload.datasheet_content[0:15000]}\n"
        "Additional instruction: \n"
        f"{payload.additional_instruction}\n"
        "\n---------------------\n"
        "The json response should look like this and should be json parsable: "
        """{files: [
          { fileName: \"file1.c\", code: \"complete c code\", language: \"c\" },
          { fileName: \"file2.h\", code: \"complete h code\", language: \"h\" },
        ]}"""
        "Answer: "
    )

    client = OpenAI(api_key=appconfig.get("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-3.5-turbo-1106",
        messages=[{"role": "user", "content": prompt}],
        stream=True,
        response_format={"type": "json_object"},
    )
    # Handle streaming response
    result = ""
    for chunk in response:
        text = chunk.choices[0].delta.content or ""
        result += text
    print(result)
    final_result = json.loads(result)
    final_result["user"] = payload.user
    final_result["datasheet_id"] = payload.datasheet_id
    final_result = CodeResponse.model_validate(final_result)
    emit_datasheet_response(final_result)
    return True

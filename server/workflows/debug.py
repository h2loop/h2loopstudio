from openai import OpenAI
from core.schema import DebugPayload, DebugResponse
from servicebus.publisher import emit_debug_response
from config import appconfig

import os

local_model_base_url = os.getenv("LANGUAGE_MODEL_URL")


def trigger_workflow(payload):
    payload = DebugPayload.model_validate(payload)
    log = payload.log

    prompt = f"""You are an system code debugger. Read the logs and give detailed explanation of error with code where the error occurred and the corrected code also.

**Logs:**
{log}
"""

    client = OpenAI(api_key=appconfig.get("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="ft:gpt-3.5-turbo-0125:h2loop:exp-3:9UHd8cqV",
        messages=[
            {
                "role": "system",
                "content": "You are a embedded engineer. You can return more than 2000 tokens. Remove comments from the code you are generating.",
            },
            {"role": "user", "content": prompt},
        ],
        stream=True,
        max_tokens=4096,
    )

    result = ""
    for chunk in response:
        text = chunk.choices[0].delta.content or ""
        result += text
    print(prompt)
    final_result = {"response": result}
    final_result["user"] = payload.user
    final_result["request_id"] = payload.request_id
    final_result = DebugResponse.model_validate(final_result)

    emit_debug_response(final_result)
    return True

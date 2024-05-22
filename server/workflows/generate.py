from openai import OpenAI
from core.schema import DatasheetPayload, CodeResponse
from utils.logger import logger
from servicebus.publisher import emit_datasheet_response, emit_query_response
from config import appconfig
from core.chunker.base import Chunker
from core.embedder.base import Embedder
from typing import List
from core.schema import Chunk
import numpy as np
import concurrent.futures
import re


def extract_code_from_string(input_string):
    # Regular expressions to find complete code blocks
    code_block_pattern = re.compile(r"```(?:c)?(.*?)```", re.DOTALL)
    # Regular expressions to find a single set of triple backticks
    single_code_pattern = re.compile(r"```(.*)", re.DOTALL)

    # Extract all code blocks enclosed in triple backticks
    code_blocks = code_block_pattern.findall(input_string)

    if not code_blocks:
        # If no complete code blocks are found, check for a single set of triple backticks
        single_code_match = single_code_pattern.search(input_string)
        if single_code_match:
            # Extract everything before and after the single set of triple backticks
            pre_backtick = input_string[: single_code_match.start()]
            post_backtick = single_code_match.group(1)
            code_blocks.append(pre_backtick + post_backtick)
        else:
            # If no triple backticks are found, return the whole string as the code
            return input_string.strip()

    # Combine all extracted code blocks
    combined_code = "\n".join(code_blocks).strip()
    return combined_code


def cosine_similarity(vec1, vec2):
    """
    Computes the cosine similarity between two vectors.
    """
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)
    dot_product = np.dot(vec1, vec2)
    norm_vec1 = np.linalg.norm(vec1)
    norm_vec2 = np.linalg.norm(vec2)
    return dot_product / (norm_vec1 * norm_vec2)


def chunk_and_embed_pdf(text: str) -> List[Chunk]:
    chunks = Chunker()({"item": text})
    embedded_chunks = Embedder()(chunks)
    return embedded_chunks


def find_relevant_information(query: str, context_chunks: List[Chunk], top_k=15) -> str:
    relevant_chunks = []
    query_embedding = Embedder()(query=query, input_type="query")
    for chunk in context_chunks:
        similarity = cosine_similarity(query_embedding, chunk.embeddings)
        relevant_chunks.append((chunk.text, similarity))
    relevant_chunks = sorted(relevant_chunks, key=lambda x: x[1], reverse=True)
    return "----------------".join(relevant_chunks[:top_k])


def identify_device_information(text):
    """
    Identify the device name, type, key features, and communication interface from the datasheet.
    """
    prompt = f"""
    You are a embedded engineer. Extract the following details from the given datasheet:
    1. Device Name
    2. Device Type
    3. Key Features
    4. Communication Interface (e.g., I2C, SPI, UART)

    Datasheet:
    {text}

    Output the information in a structured format.
    """
    client = OpenAI(api_key=appconfig.get("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-3.5-turbo-1106", messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content


def understand_register_map(text):
    """
    Extract the register map from the datasheet, including register addresses, names, descriptions,
    default values, read/write permissions, and any special bits.
    """
    prompt = f"""
    You are a embedded engineer. Extract the register map details from the given datasheet:
    - Register addresses
    - Register names
    - Descriptions
    - Default values
    - Read/write permissions
    - Any special bits

    Datasheet:
    {text}

    Output the information in a structured format.
    """

    client = OpenAI(api_key=appconfig.get("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-3.5-turbo-1106", messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content


def extract_initialization_procedure(text):
    """
    Extract the initialization procedure from the datasheet, including the sequence of steps
    required to set up the device.
    """
    prompt = f"""
    You are a embedded engineer. Extract the initialization procedure from the given datasheet.
    Include the sequence of steps, any necessary register settings, and initialization commands.

    Datasheet:
    {text}

    Output the information in a structured format.
    """

    client = OpenAI(api_key=appconfig.get("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-3.5-turbo-1106", messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content


def extract_operational_commands(text):
    """
    Extract operational commands from the datasheet, including any sequences to perform specific operations.
    """
    prompt = f"""
    You are a embedded engineer. Extract the operational commands from the given datasheet.
    Include any sequences or register settings required to perform specific operations.

    Datasheet:
    {text}

    Output the information in a structured format.
    """

    client = OpenAI(api_key=appconfig.get("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-3.5-turbo", messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content


def extract_information_from_datasheet(text: str):
    """
    Extract information from the datasheet.
    """
    prompt = f"""
    You are a embedded engineer. 

    Extract the following details from the given datasheet:
    - Device Name
    - Device Type
    - Key Features
    - Communication Interface (e.g., I2C, SPI, UART)
    - Register addresses
    - Register names
    - Descriptions
    - Default values
    - Read/write permissions
    - Any special bits
    - Initialization procedure (Include the sequence of steps, any necessary register settings, and initialization commands)
    - Operational commands (Include any sequences or register settings required to perform specific operations)

    Datasheet:
    {text}

    Output the information in a structured format.
    """
    client = OpenAI(api_key=appconfig.get("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-3.5-turbo", messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content


def complete_code(incomplete_code, device_information):
    prompt = f"""
**You are a highly skilled AI assistant specialized in code completion and software development. Your task is to help developers by taking incomplete code snippets and detailed instructions, and then providing the completed code.** 

Follow these steps to ensure high-quality code completion:

1. **Understand the Instructions:** Carefully read the instructions provided. Ensure you fully understand what the developer is asking for, including any specific requirements or constraints.

2. **Analyze the Incomplete Code:** Examine the given code snippet. Identify the current state of the code and what parts are missing or unimplemented or need to be modified.

3. Code Completion: Complete the code based on the instructions and the analysis of the incomplete code. Ensure the completed code is clean, efficient, and adheres to best practices.

Here are the details about the device from the datasheet:\n
{device_information}

Incomplete Code: 
{incomplete_code}

Complete Code: ```
"""
    client = OpenAI(api_key=appconfig.get("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model=appconfig.get("OPENAI_MODEL"),
        messages=[{"role": "user", "content": prompt}],
        max_tokens=4096,
    )
    return response.choices[0].message.content


def trigger_code_generation_workflow(payload):
    payload = DatasheetPayload.model_validate(payload)
    datasheet_content = payload.datasheet_content

    # with concurrent.futures.ThreadPoolExecutor() as executor:
    #     future_device_info = executor.submit(
    #         identify_device_information, datasheet_content
    #     )
    #     future_operational_commands = executor.submit(
    #         extract_operational_commands, datasheet_content
    #     )
    #     future_initialization_procedure = executor.submit(
    #         extract_initialization_procedure, datasheet_content
    #     )
    #     future_register_map = executor.submit(
    #         understand_register_map, datasheet_content
    #     )

    #     device_information = future_device_info.result()
    #     register_map = future_register_map.result()
    #     operational_commands = future_operational_commands.result()
    #     initialization_procedure = future_initialization_procedure.result()

    device_information = extract_information_from_datasheet(datasheet_content)

    prompt = f"""
**You are an embedded engineer. Your task is to write a very detailed and comprehensive driver.c code for a device based on the information provided to you from the datasheet. The code written by you should be complete and directly runnable without requiring any further implementation or modification by a developer.**

**Details from Datasheet:**

{device_information}

**Instructions:**

1. Write the `driver.c` file for this device.
2. Ensure that all functions are fully implemented and the code is complete. **Do not add comments in code.**
3. The written code should be directly runnable without any need for further implementation or comments for the user to fill in.
4. Make sure to replace placeholders like `[Device Name]`, `[Device Type]`, and `platform_i2c.h` with actual details from the datasheet and the specific platform you are targeting. This structured approach ensures that all necessary details are included and the code is generated systematically, resulting in a complete and executable driver code.
5. **Instead of adding comments about implementing a situation, please give complete code implementation.**

**Driver Code:**
```c
// Complete and detailed driver code for the device
```
"""

    print(prompt)
    client = OpenAI(api_key=appconfig.get("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model=appconfig.get("OPENAI_MODEL"),
        messages=[{"role": "user", "content": prompt}],
        stream=True,
    )

    result = ""
    for chunk in response:
        text = chunk.choices[0].delta.content or ""
        result += text
    comp_code = extract_code_from_string(result)
    comp_code = complete_code(result, device_information)
    comp_code = extract_code_from_string(comp_code)
    final_result = {}
    final_result["user"] = payload.user
    final_result["datasheet_id"] = payload.datasheet_id
    final_result["files"] = [
        {"fileName": "driver.c", "code": comp_code, "language": "c"}
    ]
    final_result = CodeResponse.model_validate(final_result)
    emit_datasheet_response(final_result)
    return True


# "Here are the details about the chip from the datasheet:\n"
# "## Device Information:\n"
# f"{device_information}"
# "## Register Map:\n"
# f"{register_map}"
# "## Operational Commands:\n"
# f"{operational_commands}"
# "## Initialization Procedures:\n"
# f"{initialization_procedure}"
# "Driver Code: ```"


# 1. **Ensure Completeness:**
#    - Ensure that all functions are fully implemented and the code is complete.
#    - The generated code should be directly runnable without any need for further implementation or comments for the user to fill in.

# 2.. **Initialization Sequence:**
#    - Describe the initialization sequence required to start the device.
#    - Include any necessary configuration settings, such as setting specific bits in registers.

# 3. **Define Data Structures:**
#    - Define any necessary data structures, such as structs, to represent the device configuration and status.
#    - Include fields for register values and configuration parameters.

# 4. **Write Initialization Code:**
#    - Generate code for initializing the device, setting up communication, and configuring initial register settings.
#    - Include comments explaining each step and why it is necessary.

# 5. **Implement Read/Write Functions:**
#    - Write functions to read from and write to the device registers.
#    - Ensure to handle different data types (e.g., single-byte, multi-byte) and endianness if applicable.

# 6. **Error Handling:**
#    - Implement error handling to manage communication errors, invalid register addresses, and other potential issues.
#    - Provide meaningful error messages and status codes.


# ### Example Template:

# ```c
# // Device: [Device Name]
# // Type: [Device Type]
# // Communication Interface: [I2C/SPI/UART]

# #include <stdint.h>
# #include <stdio.h>
# #include <stdlib.h>

# // Placeholder for platform-specific I2C/SPI/UART functions
# // Example for I2C
# #include "platform_i2c.h"

# // Register Map
# #define REG_EXAMPLE_ADDR 0x00
# #define REG_EXAMPLE_DEFAULT 0x01

# // Data Structures
# typedef struct {
#     uint8_t regExample;
#     // Add other register fields here
# } DeviceConfig;

# // Initialization Function
# void initDevice(DeviceConfig *config) {
#     // Set default register values
#     config->regExample = REG_EXAMPLE_DEFAULT;

#     // Initialize communication interface
#     if (!i2c_init()) {
#         fprintf(stderr, "Failed to initialize I2C interface.\n");
#         exit(EXIT_FAILURE);
#     }

#     // Write default values to device
#     if (!writeRegister(REG_EXAMPLE_ADDR, config->regExample)) {
#         fprintf(stderr, "Failed to write to REG_EXAMPLE_ADDR.\n");
#         exit(EXIT_FAILURE);
#     }

#     printf("Device initialized.\n");
# }

# // Read/Write Functions
# uint8_t readRegister(uint8_t address) {
#     uint8_t value;
#     if (!i2c_read(address, &value)) {
#         fprintf(stderr, "Failed to read from address 0x%02X.\n", address);
#         exit(EXIT_FAILURE);
#     }
#     return value;
# }

# void writeRegister(uint8_t address, uint8_t value) {
#     if (!i2c_write(address, value)) {
#         fprintf(stderr, "Failed to write to address 0x%02X.\n", address);
#         exit(EXIT_FAILURE);
#     }
# }

# // Main Function for Testing
# int main() {
#     DeviceConfig config;
#     initDevice(&config);

#     // Test reading a register
#     uint8_t exampleValue = readRegister(REG_EXAMPLE_ADDR);
#     printf("Example Register Value: 0x%02X\n", exampleValue);

#     // Test writing a register
#     writeRegister(REG_EXAMPLE_ADDR, 0x02);
#     exampleValue = readRegister(REG_EXAMPLE_ADDR);
#     printf("New Example Register Value: 0x%02X\n", exampleValue);

#     return 0;
# }
# ```

from openai import OpenAI
from core.schema import DatasheetPayload, CodeResponse
from utils.logger import logger
from servicebus.publisher import emit_datasheet_response, emit_query_response
from config import appconfig
import json


def trigger_code_generation_workflow(payload):
    payload = DatasheetPayload.model_validate(payload)
    prompt = (
        "You are an embedded engineer for a company and you write complete driver code when given a datasheet."
        "Given the datasheet and addition instruction understand the datasheet and generate driver code for the datahseet in c language."
        "Please ensure that the functions you declare in code have implementation code of the function also. You can generate multiple files."
        "---------------------\n"
        "Datasheet: \n"
        f"{payload.datasheet_content[0:15000]}\n"
        "Additional instruction: \n"
        f"{payload.additional_instruction}\n"
        "\n---------------------\n"
        "There is a sample json response below and your json response should be in the below format: "
        """{files: [
          { fileName: \"file1.c\", code: \"#include <stdio.h>
#include <stdint.h>
#include <unistd.h> // for sleep function
#include <fcntl.h>
#include <linux/i2c-dev.h>
#include <sys/ioctl.h>

#define I2C_DEVICE "/dev/i2c-1"  // Adjust according to your system

// Register addresses
#define AIS328DQ_ADDR      0x18  // I2C address of AIS328DQ
#define WHO_AM_I_REG       0x0F  // Who am I register
#define CTRL_REG1          0x20  // Control register 1
#define STATUS_REG         0x27  // Status register
#define OUT_X_L_REG        0x28  // X-axis low register
#define OUT_X_H_REG        0x29  // X-axis high register
#define OUT_Y_L_REG        0x2A  // Y-axis low register
#define OUT_Y_H_REG        0x2B  // Y-axis high register
#define OUT_Z_L_REG        0x2C  // Z-axis low register
#define OUT_Z_H_REG        0x2D  // Z-axis high register

// Function prototypes
int8_t init_AIS328DQ(int fd);
int16_t read_axis_data(int fd, uint8_t reg_low, uint8_t reg_high);

int main() {
    int fd;
    uint8_t who_am_i;
    int16_t x_accel, y_accel, z_accel;

    // Open I2C device
    fd = open(I2C_DEVICE, O_RDWR);
    if (fd < 0) {
        perror("Failed to open the I2C device");
        return 1;
    }

    // Initialize sensor
    if (init_AIS328DQ(fd) != 0) {
        perror("Failed to initialize the sensor");
        return 1;
    }

    // Read WHO_AM_I register to verify communication
    who_am_i = i2c_smbus_read_byte_data(fd, WHO_AM_I_REG);
    if (who_am_i != 0x32) {  // Expected value according to datasheet
        fprintf(stderr, "Unexpected WHO_AM_I value: 0x%02x\n", who_am_i);
        return 1;
    }

    // Read accelerometer data
    while (1) {
        x_accel = read_axis_data(fd, OUT_X_L_REG, OUT_X_H_REG);
        y_accel = read_axis_data(fd, OUT_Y_L_REG, OUT_Y_H_REG);
        z_accel = read_axis_data(fd, OUT_Z_L_REG, OUT_Z_H_REG);

        // Print accelerometer readings
        printf("X-axis: %d, Y-axis: %d, Z-axis: %d\n", x_accel, y_accel, z_accel);

        // Wait for some time before reading again
        sleep(1);
    }

    // Close I2C device
    close(fd);

    return 0;
}

int8_t init_AIS328DQ(int fd) {
    // Initialize the sensor according to the datasheet
    // For simplicity, assuming default settings are acceptable
    // You may need to configure the sensor based on your requirements
    // Example: Set CTRL_REG1 to enable the sensor and configure data rate

    // For example:
    // uint8_t config_data = 0x57; // Enable all axes, normal mode, 100Hz data rate
    // i2c_smbus_write_byte_data(fd, CTRL_REG1, config_data);

    return 0;
}

int16_t read_axis_data(int fd, uint8_t reg_low, uint8_t reg_high) {
    int16_t axis_data;

    // Read low byte
    uint8_t low_byte = i2c_smbus_read_byte_data(fd, reg_low);
    if (low_byte < 0) {
        perror("Error reading low byte");
        return -1;
    }

    // Read high byte
    uint8_t high_byte = i2c_smbus_read_byte_data(fd, reg_high);
    if (high_byte < 0) {
        perror("Error reading high byte");
        return -1;
    }

    // Combine high and low bytes to get signed 16-bit value
    axis_data = (int16_t)((high_byte << 8) | low_byte);

    return axis_data;
}\", language: \"c\" },
          { fileName: \"file2.h\", code: \"#ifndef AIS328DQ_H
#define AIS328DQ_H

#include <stdint.h>

// Register addresses
#define AIS328DQ_ADDR      0x18  // I2C address of AIS328DQ
#define WHO_AM_I_REG       0x0F  // Who am I register
#define CTRL_REG1          0x20  // Control register 1
#define STATUS_REG         0x27  // Status register
#define OUT_X_L_REG        0x28  // X-axis low register
#define OUT_X_H_REG        0x29  // X-axis high register
#define OUT_Y_L_REG        0x2A  // Y-axis low register
#define OUT_Y_H_REG        0x2B  // Y-axis high register
#define OUT_Z_L_REG        0x2C  // Z-axis low register
#define OUT_Z_H_REG        0x2D  // Z-axis high register

// Function prototypes
int8_t init_AIS328DQ(int fd);
int16_t read_axis_data(int fd, uint8_t reg_low, uint8_t reg_high);

#endif /* AIS328DQ_H */
\", language: \"h\" },
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
    final_result = json.loads(result)
    final_result["user"] = payload.user
    final_result["datasheet_id"] = payload.datasheet_id
    final_result = CodeResponse.model_validate(final_result)
    # for file in final_result.files:
    #     client = OpenAI(api_key=appconfig.get("OPENAI_API_KEY"))
    #     prompt = (
    #         "Act as a embedded engineer and complete the functions with working code based on the comments about the implementation of the function."
    #         "---------------------\n"
    #         "Existing Code with implementation missing: \n"
    #         f"{file.code}\n"
    #         "\n---------------------\n"
    #         "Return only the code as text without any extra ```"
    #         "Answer: "
    #     )
    #     response = client.chat.completions.create(
    #         model="gpt-3.5-turbo-1106",
    #         messages=[{"role": "user", "content": prompt}],
    #         stream=True,
    #     )
    #     result = ""
    #     for chunk in response:
    #         text = chunk.choices[0].delta.content or ""
    #         result += text
    #     file.code = result
    emit_datasheet_response(final_result)
    return True

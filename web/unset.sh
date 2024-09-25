#!/bin/bash

# List of environment variables to be unset
ENV_VARS=(
    "GOOGLE_CLIENT_ID"
    "GOOGLE_CLIENT_SECRET"
    "GITHUB_CLIENT_ID"
    "GITHUB_CLIENT_SECRET"
    "NEXTAUTH_URL"
    "NEXTAUTH_SECRET"
    "DATABASE_URL"
    "REDIS_HOST"
    "REDIS_PORT"
    "SERVICE_API_KEY"
    "S3_ENDPOINT"
    "S3_PORT"
    "S3_ACCESS_KEY"
    "S3_SECRET_KEY"
    "INGESTION_TASK_QUEUE"
    "INGESTION_RESULT_QUEUE"
    "QUERY_TASK_QUEUE"
    "QUERY_RESULT_QUEUE"
    "DATASHEET_TASK_QUEUE"
    "DATASHEET_RESULT_QUEUE"
    "DEVICETREE_TASK_QUEUE"
    "DEVICETREE_RESULT_QUEUE"
)

# Loop through the array and unset each environment variable
for VAR in "${ENV_VARS[@]}"; do
    unset $VAR
done

echo "Environment variables have been unset."

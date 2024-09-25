# Step 1: Build the application
FROM node:18-alpine as builder

# Default environment variables that can be overridden at runtime
ENV NODE_ENV=production
ENV NEXTAUTH_URL="http://localhost:3000"
ENV NEXTAUTH_SECRET="RE8k4z6rpCVk9y2EmEWAFR0gfYU4+tNOY0Xzhb9+s8k="
ENV DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/postgres?schema=public"
ENV REDIS_HOST="host.docker.internal"
ENV REDIS_PORT="6379"
ENV SERVICE_API_KEY="RE8k4z6rpCVk9y2EmEWAFR0gf"
ENV S3_ENDPOINT="host.docker.internal"
ENV S3_PORT="9000"
ENV S3_ACCESS_KEY="minioadmin"
ENV S3_SECRET_KEY="minioadmin"
ENV INGESTION_TASK_QUEUE="INGESTION_TASK_QUEUE"
ENV INGESTION_RESULT_QUEUE="INGESTION_RESULT_QUEUE"
ENV QUERY_TASK_QUEUE="QUERY_TASK_QUEUE"
ENV QUERY_RESULT_QUEUE="QUERY_RESULT_QUEUE"
ENV DATASHEET_TASK_QUEUE="DATASHEET_TASK_QUEUE"
ENV DATASHEET_RESULT_QUEUE="DATASHEET_RESULT_QUEUE"
ENV DEVICETREE_TASK_QUEUE="DEVICETREE_TASK_QUEUE"
ENV DEVICETREE_RESULT_QUEUE="DEVICETREE_RESULT_QUEUE"

WORKDIR /app
COPY ./package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN npx prisma generate
RUN yarn build

# Step 2: Create the runner image
FROM node:18-alpine as runner

# Default environment variables that can be overridden at runtime
ENV NODE_ENV=production
ENV NEXTAUTH_URL="http://localhost:3000"
ENV NEXTAUTH_SECRET="RE8k4z6rpCVk9y2EmEWAFR0gfYU4+tNOY0Xzhb9+s8k="
ENV DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/postgres?schema=public"
ENV REDIS_HOST="host.docker.internal"
ENV REDIS_PORT="6379"
ENV SERVICE_API_KEY="RE8k4z6rpCVk9y2EmEWAFR0gf"
ENV S3_ENDPOINT="host.docker.internal"
ENV S3_PORT="9000"
ENV S3_ACCESS_KEY="minioadmin"
ENV S3_SECRET_KEY="minioadmin"
ENV INGESTION_TASK_QUEUE="INGESTION_TASK_QUEUE"
ENV INGESTION_RESULT_QUEUE="INGESTION_RESULT_QUEUE"
ENV QUERY_TASK_QUEUE="QUERY_TASK_QUEUE"
ENV QUERY_RESULT_QUEUE="QUERY_RESULT_QUEUE"
ENV DATASHEET_TASK_QUEUE="DATASHEET_TASK_QUEUE"
ENV DATASHEET_RESULT_QUEUE="DATASHEET_RESULT_QUEUE"
ENV DEVICETREE_TASK_QUEUE="DEVICETREE_TASK_QUEUE"
ENV DEVICETREE_RESULT_QUEUE="DEVICETREE_RESULT_QUEUE"

WORKDIR /app
COPY --from=builder /app/package.json .
COPY --from=builder /app/yarn.lock .
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/ ./.next/
EXPOSE 3000

ENTRYPOINT ["yarn", "start"]
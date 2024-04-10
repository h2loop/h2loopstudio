### Download requirements

1. Run in terminal

   ```bash
   pip install ollama
   ```
2. (If you want to use OPENAI set USE_OPENAI_EMBEDDING="1" and USE_OPENAI_MODEL="1" in server/.env and skip this step.)
   To Download a model run in terminal-
   ```bash
   ollama pull _MODEL_NAME_
   ```
   Replace _MODEL_NAME_ with any desired model.
   You can dowmload any embedding model or large language model.
   Update LOCAL_EMBEDDEING_MODEL_NAME, LOCAL_EMBEDDER_DEFAULT_VECTOR_DIM and LOCAL_MODEL_NAME variables in the server/.env file. By default, the embedding model is set to '-mxbai-embed-large:latest', and the LLM model is set to 'deepseek-coder:6.7b-instruct'.


### Start backend

1. Add openai api key in server/.env file

2. Run in terminal

   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```
3. 

### For frontend

1. Add client id and client secret in web/.env

2. Run these step by step

   ```bash
   cd web

   yarn install

   npx prisma db push

   yarn seed

   yarn dev
   ```

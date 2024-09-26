from typing import Literal

from typing import Dict, List
from config import appconfig
from core.schema import Chunk
from openai import OpenAI
import tiktoken
import requests
import os

embedder_url = os.getenv("EMBEDDER_MODEL_URL")
local_embedder_model_name = os.getenv("LOCAL_EMBEDDEING_MODEL_NAME")


class EmbeddingFailed(Exception):
    pass


class Embedder:
    def __init__(self, base_url=None) -> None:
        import nltk
        from nltk.corpus import stopwords

        nltk.download("stopwords")
        self.stop_words = stopwords.words("english")
        print("apoeke: " + appconfig.get("OPENAI_API_KEY"))

        if appconfig.get("USE_OPENAI_EMBEDDING") == "1":
            self.model = OpenAI(api_key=appconfig.get("OPENAI_API_KEY"))

    def _remove_stopwords(self, text: str) -> str:
        return " ".join([word for word in text.split() if word not in self.stop_words])

    # def _get_hyde_document_for_query(self, query: str) -> str:
    #     # TODO: implement HyDE
    #     # Reference: https://github.com/texttron/hyde/blob/main/hyde-demo.ipynb
    #     return query

    # Overloaded function

    def num_tokens_from_string(
        self, string: str, encoding_name: str = "cl100k_base"
    ) -> int:
        """Returns the number of tokens in a text string."""
        encoding = tiktoken.get_encoding(encoding_name)
        num_tokens = len(encoding.encode(string))
        return num_tokens

    def __call__(
        self,
        chunk_batch: List[Chunk] = None,
        query: str = "",
        input_type: Literal["doc", "query"] = "doc",
    ):
        if input_type == "query":
            if appconfig.get("USE_OPENAI_EMBEDDING") == "1":
                response = self.model.embeddings.create(
                    input=query, model="text-embedding-3-small"
                )
                return response.data[0].embedding
            res = requests.post(
                embedder_url, json={"model": local_embedder_model_name, "prompt": query}
            )
            return res.json()["embedding"]

        else:
            chunk_texts = [self._remove_stopwords(chunk.text) for chunk in chunk_batch]
            embeddings = []
            if appconfig.get("USE_OPENAI_EMBEDDING") == "1":
                max_token_per_req = 45000
                current_batch_token_count = 0
                chunk_index = 0
                current_batch = []
                while chunk_index < len(chunk_texts):
                    current_batch_token_count += self.num_tokens_from_string(
                        chunk_texts[chunk_index]
                    )
                    current_batch.append(chunk_texts[chunk_index])
                    chunk_index += 1
                    if (
                        current_batch_token_count >= max_token_per_req
                        or chunk_index >= len(chunk_texts)
                    ):
                        response = self.model.embeddings.create(
                            input=current_batch, model="text-embedding-3-small"
                        )
                        embeddings.extend([x.embedding for x in response.data])
                        current_batch = []
                        current_batch_token_count = 0
            else:
                for i in range(0, len(chunk_texts)):
                    response = requests.post(
                        embedder_url,
                        json={
                            "model": local_embedder_model_name,
                            "prompt": chunk_texts[i],
                        },
                    )
                    if response.status_code == 200:
                        vectors = response.json()["embedding"]
                        embeddings.append(vectors)

            assert len(chunk_texts) == len(embeddings)

            for chunk, embedding in zip(chunk_batch, embeddings):
                chunk.embeddings = embedding

            return chunk_batch

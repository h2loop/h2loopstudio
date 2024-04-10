from typing import Literal

from typing import Dict, List
from config import appconfig
from core.schema import Chunk
from openai import OpenAI
import requests
import os 

embedder_url=os.getenv("EMBEDDER_MODEL_URL")  
local_embedder_model_name= os.getenv("LOCAL_EMBEDDEING_MODEL_NAME")

class EmbeddingFailed(Exception):
    pass


class Embedder:
    def __init__(self, base_url=None) -> None:
        import nltk
        from nltk.corpus import stopwords

        nltk.download("stopwords")
        self.stop_words = stopwords.words("english")

        if appconfig.get("USE_OPENAI_EMBEDDING")=="1":
            self.model = OpenAI(api_key=appconfig.get("OPENAI_API_KEY"))
        

    def _remove_stopwords(self, text: str) -> str:
        return " ".join([word for word in text.split() if word not in self.stop_words])

    # def _get_hyde_document_for_query(self, query: str) -> str:
    #     # TODO: implement HyDE
    #     # Reference: https://github.com/texttron/hyde/blob/main/hyde-demo.ipynb
    #     return query

    # Overloaded function
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
            res = requests.post(embedder_url,json={'model': local_embedder_model_name,'prompt': query})
            return res.json()['embedding']

        else:
            chunk_texts = [self._remove_stopwords(chunk.text) for chunk in chunk_batch]
            embeddings = []
            if appconfig.get("USE_OPENAI_EMBEDDING") == "1":
                batch_size = 10
                for i in range(0, len(chunk_texts), batch_size):
                    batch = chunk_texts[i : i + batch_size]
                    response = self.model.embeddings.create(
                        input=batch, model="text-embedding-3-small"
                    )
                    # Append the embeddings to the results list
                    embeddings.extend([x.embedding for x in response.data])

            else:
                for i in range(0, len(chunk_texts)):
                    response = requests.post(embedder_url, json={'model': local_embedder_model_name, 'prompt': chunk_texts[i]})
                    if response.status_code == 200:
                        vectors=response.json()['embedding']
                        embeddings.append(vectors)

            assert len(chunk_texts) == len(embeddings)

            for chunk, embedding in zip(chunk_batch, embeddings):
                chunk.embeddings = embedding

            return chunk_batch

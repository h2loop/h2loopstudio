from celery.exceptions import Reject
from tasks.app import app, INGESTION_QUEUE
from serviceconfig import serviceconfig
from tasks.statusupdater import StatusUpdater
from nodeparser.base import NodeParser
from reader.factory import get_reader
from vector_store.factory import get_vector_store_client
from utils.logger import get_logger

logger = get_logger()
status_updater = StatusUpdater()

embed_model = serviceconfig.get("embed_model")
embed_model_kwargs = serviceconfig.get("embed_model_kwargs") or {}
vector_store = serviceconfig.get("vector_store")
vector_store_kwargs = serviceconfig.get("vector_store_kwargs") or {}


@app.task(bind=True, queue=INGESTION_QUEUE, max_retries=2, default_retry_delay=1)
def ingest_asset(self, payload: dict[str, any]):
    """
    Ingests an asset by loading documents, extracting nodes, embedding them,
    and saving them to a vector store.

    Args:
        self: The Celery task instance.
        payload (dict): A dictionary containing information about the asset
            to be ingested, including 'asset_id', 'collection_name',
            'asset_type', and 'reader_kwargs'.

    Raises:
        Reject: If the task fails after the maximum number of retries.

    Returns:
        None
    """
    try:
        # Extracting information from the payload
        asset_id = payload.get("asset_id")
        collection_name = payload.get("collection_name")
        asset_type = payload.get("asset_type")
        reader_kwargs = payload.get("reader_kwargs") or {}
        extra_metadata = payload.get("extra_metadata") or {}

        # Updating asset status to 'ingesting' for first try
        if self.request.retries == 0:
            status_updater.update_asset_status(asset_id, "ingesting")

        # Loading documents using the appropriate reader
        reader = get_reader(asset_type, **reader_kwargs)
        documents = reader.load(extra_metadata)
        document_ids = reader.get_docs_id_and_names(documents)

        # Extracting embedded nodes from the loaded documents
        node_parser = NodeParser(embed_model, embed_model_kwargs)
        embedded_nodes = node_parser.get_embedded_nodes(documents)
        dim = len(embedded_nodes[0].embedding) if len(embedded_nodes) > 0 else 0

        # Saving the embedded nodes to the vector store
        vector_store_client = get_vector_store_client(
            vector_store_name=vector_store,
            collection_name=collection_name,
            dim=dim,
            **vector_store_kwargs,
        )
        vector_store_client.save_nodes(embedded_nodes)

        # Updating asset status to 'success'
        status_updater.update_asset_status(asset_id, "success", documents=document_ids)

    except Exception as e:
        # Handling task failure and retries
        if self.request.retries == 2:
            asset_id = payload.get("asset_id")
            status_updater.update_asset_status(asset_id, "failed")
            logger.error(f"Task Failed: {str(e)}")
            raise Reject()
        else:
            retry_num = self.request.retries + 1
            logger.warning(f"Retrying task [{retry_num}/2] -> Error: {str(e)}")
            self.retry()

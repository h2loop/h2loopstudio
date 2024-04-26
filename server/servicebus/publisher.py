from core.schema import CodeResponse, QueryResponse, CustomDoc, DeviceTreeResponse
from .utils import publish_message
from typing import List
from config import appconfig
from .topics import (
    ASSET_DOCS,
    ASSET_INGESTION_STATUS,
    DEVICETREE_RESPONSE,
    DOC_STATUS,
    QUERY_RESPONSE,
    DATASHEET_RESPONSE,
)


def emit_doc_status(doc: CustomDoc):
    publish_message(
        appconfig.get("INGESTION_RESULT_QUEUE"),
        DOC_STATUS,
        {
            "doc_id": doc.doc_id,
            "asset_id": doc.asset_id,
            "filename": doc.filepath or doc.filename,
            "uploaded_by": doc.uploaded_by,
            "status": doc.status,
            "error": doc.error,
            "message": doc.message,
        },
    )


def emit_docs_in_asset(docs: List[CustomDoc]):
    publish_message(
        appconfig.get("INGESTION_RESULT_QUEUE"),
        ASSET_DOCS,
        [
            {
                "doc_id": doc.doc_id,
                "asset_id": doc.asset_id,
                "filename": doc.filepath or doc.filename,
                "uploaded_by": doc.uploaded_by,
                "status": doc.status,
                "error": doc.error,
                "message": doc.message,
            }
            for doc in docs
        ],
    )


def emit_asset_status(
    asset_id: str, status: str, user: str, error: bool = False, message: str = None
):
    publish_message(
        appconfig.get("INGESTION_RESULT_QUEUE"),
        ASSET_INGESTION_STATUS,
        {
            "asset_id": asset_id,
            "status": status,
            "error": error,
            "message": message,
            "user": user,
        },
    )


def emit_datasheet_response(code: CodeResponse):
    publish_message(
        appconfig.get("DATASHEET_RESULT_QUEUE"),
        DATASHEET_RESPONSE,
        data=code.model_dump(),
    )


def emit_devicetree_response(res: DeviceTreeResponse):
    publish_message(
        appconfig.get("DEVICETREE_RESULT_QUEUE"),
        DEVICETREE_RESPONSE,
        data=res.model_dump(),
    )


def emit_query_response(query: QueryResponse):
    publish_message(
        appconfig.get("QUERY_RESULT_QUEUE"),
        QUERY_RESPONSE,
        data={
            "response": query.response,
            "chatId": query.chat_id,
            "user": query.user,
            "sources": query.sources,
            "complete": query.complete,
        },
    )

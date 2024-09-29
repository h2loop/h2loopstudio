import threading
from config import appconfig
from servicebus.utils import consume_from_topics
from servicebus.topics import (
    ASSET_INGESTION,
    DEBUG_REQUEST,
    QUERY_REQUEST,
    DATASHEET_REQUEST,
    DEVICETREE_REQUEST,
)
from servicebus.events import (
    handle_debug_event,
    handle_devicetree_event,
    handle_ingestion_event,
    handle_query_event,
    handle_datasheet_event,
)

# queues
INGESTION_TASK_QUEUE = appconfig.get("INGESTION_TASK_QUEUE")
QUERY_TASK_QUEUE = appconfig.get("QUERY_TASK_QUEUE")
DATASHEET_TASK_QUEUE = appconfig.get("DATASHEET_TASK_QUEUE")
DEVICETREE_TASK_QUEUE = appconfig.get("DEVICETREE_TASK_QUEUE")
DEBUG_TASK_QUEUE = appconfig.get("DEBUG_TASK_QUEUE")

# topic callback dicts
ingestion_topic_callback_dict = {
    ASSET_INGESTION: handle_ingestion_event,
}

query_topic_callback_dict = {
    QUERY_REQUEST: handle_query_event,
}

datasheet_topic_callback_dict = {
    DATASHEET_REQUEST: handle_datasheet_event,
}

devicetree_topic_callback_dict = {
    DEVICETREE_REQUEST: handle_devicetree_event,
}

debug_topic_callback_dict = {
    DEBUG_REQUEST: handle_debug_event,
}

# consume topics
# Creating threads for each function call
ingestion_thread = threading.Thread(
    target=consume_from_topics,
    args=(INGESTION_TASK_QUEUE, ingestion_topic_callback_dict),
)
query_thread = threading.Thread(
    target=consume_from_topics, args=(QUERY_TASK_QUEUE, query_topic_callback_dict)
)

datasheet_thread = threading.Thread(
    target=consume_from_topics,
    args=(DATASHEET_TASK_QUEUE, datasheet_topic_callback_dict),
)

devicetree_thread = threading.Thread(
    target=consume_from_topics,
    args=(DEVICETREE_TASK_QUEUE, devicetree_topic_callback_dict),
)

debug_thread = threading.Thread(
    target=consume_from_topics,
    args=(DEBUG_TASK_QUEUE, debug_topic_callback_dict),
)

if __name__ == "__main__":
    # Starting the threads
    ingestion_thread.start()
    query_thread.start()
    datasheet_thread.start()
    devicetree_thread.start()
    debug_thread.start()
    print("Server started...")

    # Waiting for both threads to finish
    ingestion_thread.join()
    query_thread.join()
    datasheet_thread.join()
    devicetree_thread.join()
    debug_thread.join()

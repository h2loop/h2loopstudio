from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from api.ingestion.base import router as ingestion_router

app = FastAPI()


# Define an exception handler for HTTPException
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


# Define a generic exception handler for unexpected errors
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    print(exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
    )


@app.get("/health")
def healthcheck():
    return True


app.include_router(ingestion_router, prefix="/ingest", tags=["Ingestion"])

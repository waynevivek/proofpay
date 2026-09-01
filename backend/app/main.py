"""FastAPI application entrypoint for ProofPay."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.routes import documents, reconciliation, transactions
from app.db.init_db import create_tables


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_tables()
    yield


app = FastAPI(title="ProofPay API", version="v1", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

app.include_router(documents.router, prefix="/api/v1")
app.include_router(transactions.router, prefix="/api/v1")
app.include_router(reconciliation.router, prefix="/api/v1")


@app.exception_handler(RequestValidationError)
async def request_validation_error_handler(
    _, __: RequestValidationError
) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "error": "Request validation failed",
            "code": "validation_error",
        },
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(_, exc: StarletteHTTPException) -> JSONResponse:
    if isinstance(exc.detail, dict) and "error" in exc.detail and "code" in exc.detail:
        content = exc.detail
    else:
        content = {
            "error": str(exc.detail),
            "code": f"http_{exc.status_code}",
        }
    return JSONResponse(status_code=exc.status_code, content=content)

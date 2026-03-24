"""
Marketplace CB - FastAPI Application Entry Point
Ponto de entrada principal da aplicação.
"""

from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.api.routers import vendedor, fornecedor, admin, auth, produtos, pedidos

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Gerencia startup e shutdown da aplicação."""
    # Startup — auto-create tables (dev mode with SQLite)
    from app.infrastructure.database.session import engine
    from app.infrastructure.database.base import Base
    # Import all models so they register with Base.metadata
    import app.infrastructure.database.models.vendedor  # noqa: F401
    import app.infrastructure.database.models.fornecedor  # noqa: F401
    import app.infrastructure.database.models.produto  # noqa: F401
    import app.infrastructure.database.models.pedido  # noqa: F401
    import app.infrastructure.database.models.estoque  # noqa: F401
    import app.infrastructure.database.models.admin  # noqa: F401

    if settings.is_sqlite:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Plataforma B2B2C de dropshipping conectando fornecedores a vendedores.",
    docs_url=f"{settings.API_PREFIX}/docs",
    redoc_url=f"{settings.API_PREFIX}/redoc",
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    lifespan=lifespan,
)

# ── Middleware ───────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────
app.include_router(
    auth.router,
    prefix=f"{settings.API_PREFIX}/auth",
    tags=["Autenticação"],
)
app.include_router(
    vendedor.router,
    prefix=f"{settings.API_PREFIX}/vendedor",
    tags=["Vendedor"],
)
app.include_router(
    fornecedor.router,
    prefix=f"{settings.API_PREFIX}/fornecedor",
    tags=["Fornecedor"],
)
app.include_router(
    admin.router,
    prefix=f"{settings.API_PREFIX}/admin",
    tags=["Administrador"],
)
app.include_router(
    produtos.router,
    prefix=f"{settings.API_PREFIX}/produtos",
    tags=["Catálogo de Produtos"],
)
app.include_router(
    pedidos.router,
    prefix=f"{settings.API_PREFIX}/pedidos",
    tags=["Pedidos"],
)


@app.get("/health", tags=["Health"])
async def health_check() -> dict[str, str]:
    return {"status": "healthy", "version": settings.APP_VERSION}

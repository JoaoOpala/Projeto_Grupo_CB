"""
Marketplace CB - Celery Tasks: Sincronização de Estoque
Propaga atualizações de estoque para lojas e notifica vendedores.
"""

import logging

from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def sincronizar_estoque_lojas(self, evento: dict) -> dict:
    """
    Task assíncrona para propagar atualização de estoque.

    Recebe evento com:
      - produto_id: UUID do produto
      - fornecedor_id: UUID do fornecedor
      - estoque_anterior: quantidade anterior
      - estoque_novo: quantidade atualizada
    """
    try:
        produto_id = evento["produto_id"]
        estoque_novo = evento["estoque_novo"]

        # TODO: Implementar com sessão de banco real
        # 1. Buscar todas as lojas que vendem o produto
        # 2. Atualizar cache Redis
        # 3. Enviar notificação WebSocket para vendedores
        # 4. Alertar se estoque baixo

        logger.info(
            "Estoque sincronizado para produto %s: %d unidades",
            produto_id,
            estoque_novo,
        )

        return {
            "produto_id": produto_id,
            "estoque_novo": estoque_novo,
            "sincronizado": True,
        }

    except Exception as exc:
        logger.error("Erro na sincronização de estoque: %s", exc)
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=30)
def processar_alerta_estoque_baixo(self, produto_id: str, estoque_atual: int) -> dict:
    """Envia alerta quando estoque fica abaixo do limite."""
    try:
        LIMITE_BAIXO = 10

        if estoque_atual < LIMITE_BAIXO:
            logger.warning(
                "ALERTA: Estoque baixo para produto %s (%d unidades)",
                produto_id,
                estoque_atual,
            )
            # TODO: Enviar email/notificação para fornecedor

        return {"produto_id": produto_id, "alerta_enviado": estoque_atual < LIMITE_BAIXO}

    except Exception as exc:
        logger.error("Erro ao enviar alerta de estoque: %s", exc)
        raise self.retry(exc=exc)

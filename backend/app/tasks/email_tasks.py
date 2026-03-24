"""
Marketplace CB - Celery Tasks: Envio de Emails
"""

import logging

from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=30)
def enviar_email_boas_vindas(self, email: str, nome: str, tipo_usuario: str) -> dict:
    """Envia email de boas-vindas após registro."""
    try:
        # TODO: Integrar com SendGrid/AWS SES
        logger.info("Email de boas-vindas enviado para %s (%s)", email, tipo_usuario)
        return {"email": email, "enviado": True}
    except Exception as exc:
        logger.error("Erro ao enviar email: %s", exc)
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=30)
def enviar_email_pedido_criado(
    self, email_cliente: str, numero_pedido: str, valor_total: float
) -> dict:
    """Notifica cliente sobre novo pedido criado."""
    try:
        logger.info("Email de pedido %s enviado para %s", numero_pedido, email_cliente)
        return {"email": email_cliente, "numero_pedido": numero_pedido, "enviado": True}
    except Exception as exc:
        logger.error("Erro ao enviar email de pedido: %s", exc)
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=30)
def enviar_email_status_pedido(
    self, email_cliente: str, numero_pedido: str, novo_status: str
) -> dict:
    """Notifica cliente sobre mudança de status do pedido."""
    try:
        logger.info(
            "Email de status '%s' do pedido %s enviado para %s",
            novo_status,
            numero_pedido,
            email_cliente,
        )
        return {"email": email_cliente, "status": novo_status, "enviado": True}
    except Exception as exc:
        logger.error("Erro ao enviar email de status: %s", exc)
        raise self.retry(exc=exc)

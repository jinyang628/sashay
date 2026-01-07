import logging

from fastapi import APIRouter

from app.controllers.games import GamesController
from app.services.games import GamesService

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1")

### Health check


@router.get("/status")
async def status():
    log.info("Status endpoint called")
    return {"status": "ok"}


### Messages


def get_games_controller_router():
    service = GamesService()
    return GamesController(service=service).router


router.include_router(
    get_games_controller_router(),
    tags=["games"],
    prefix="/games",
)

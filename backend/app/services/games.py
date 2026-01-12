import logging

from app.models.game.engine import Dancer, Master
from app.services.database import DatabaseService

log = logging.getLogger(__name__)


class GamesService:
    async def initialize(self, game_id: str, pieces: list[Dancer | Master]) -> None:
        client = await DatabaseService().get_client()
        response = (
            await client.table("games")
            .select("pieces")
            .eq("game_id", game_id)
            .execute()
        )
        if not response.data:
            log.info(
                "No existing pieces stored for game %s, inserting new pieces", game_id
            )
            await client.table("games").insert(
                {
                    "game_id": game_id,
                    "pieces": [piece.model_dump() for piece in pieces],
                }
            ).execute()
        else:
            log.info("Found existing pieces for game %s", game_id)
            # TODO: Handle case where pieces already exist (update or merge?)

        # print(response.data[0])
        # if len(response.data) == 0:
        #     print("Game not found")
        #     return

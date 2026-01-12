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
            log.info("No existing pieces stored for game %s", game_id)
            await client.table("games").insert(
                {
                    "game_id": game_id,
                    "pieces": [piece.model_dump() for piece in pieces],
                }
            ).execute()
            return

        log.info("Found existing pieces for game %s", game_id)
        if not isinstance(response.data[0], dict) or "pieces" not in response.data[0]:
            raise Exception(
                f"No 'pieces' key found in existing game data for game {game_id}"
            )
        existing_pieces = response.data[0]["pieces"]
        if not isinstance(existing_pieces, list):
            raise Exception(
                f"'pieces' key is not a list in existing game data for game {game_id}"
            )
        existing_pieces += [piece.model_dump() for piece in pieces]
        log.debug("Updated pieces %s", existing_pieces)
        await client.table("games").update({"pieces": existing_pieces}).eq(
            "game_id", game_id
        ).execute()

        players_seen = set()
        for piece in existing_pieces:
            if isinstance(piece, dict):
                players_seen.add(piece.get("player", None))
            else:
                raise Exception(f"Piece in game {game_id} is not a dict: {piece!r}")
        if len(players_seen) == 2:
            await client.table("rooms").update({"status": "active"}).eq(
                "game_id", game_id
            ).execute()

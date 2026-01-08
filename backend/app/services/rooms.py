from app.services.database import DatabaseService


class RoomsService:
    async def create_room(
        self, game_id: str, player_one_id: str | None, player_two_id: str | None
    ) -> None:
        client = await DatabaseService().get_client()
        await client.table("rooms").insert(
            {
                "game_id": game_id,
                "player_one_id": player_one_id,
                "player_two_id": player_two_id,
            }
        ).execute()

    async def join_room(self, game_id: str, player_id: str) -> None:
        pass

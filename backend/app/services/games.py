import logging


log = logging.getLogger(__name__)


class GamesService:
    pass


#     async def initialize(self, game_id: str, player: Player, pieces: list[Piece]) -> None:
#         engine: GameEngine = await self.get_game_engine(game_id=game_id)
#         return engine

#     async def get_game_engine(self, game_id: str) -> GameEngine:
#         # TODO: Store + Fetch metadata from DB
#         return GameEngine(
#             pieces=[],
#         )

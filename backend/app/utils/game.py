from app.models.game.base import Player


def is_player_turn(player: Player, turn: int) -> bool:
    if player == Player.PLAYER_ONE:
        return turn % 2 == 0
    elif player == Player.PLAYER_TWO:
        return turn % 2 == 1
    else:
        raise ValueError(f"Invalid player: {player}")

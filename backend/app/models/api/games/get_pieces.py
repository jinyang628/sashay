
from pydantic import BaseModel


class GetPiecesResponse(BaseModel):
    status_code: int
    pieces: list
    captured_pieces: list

from pydantic import BaseModel, StrictInt, ValidationError


class PayloadValidationError(ValueError):
    pass


class TextBlockPayload(BaseModel):
    markdown: str


class VideoBlockPayload(BaseModel):
    url: str
    title: str
    start: StrictInt | None = None
    end: StrictInt | None = None


class ExerciseBlockPayload(BaseModel):
    prompt: str
    sample_solution: str | None = None
    hints: list[str] | None = None


class QuizBlockPayload(BaseModel):
    """Quiz blocks store data in the Quiz FK; payload is always empty."""

    model_config = {'extra': 'forbid'}


BLOCK_PAYLOAD_SCHEMAS = {
    'text': TextBlockPayload,
    'video': VideoBlockPayload,
    'exercise': ExerciseBlockPayload,
    'quiz': QuizBlockPayload,
}


def validate_block_payload(block_type: str, payload: dict) -> dict:
    schema = BLOCK_PAYLOAD_SCHEMAS.get(block_type)
    if schema is None:
        raise PayloadValidationError(f'Unregistered block type: {block_type}')

    try:
        return schema.model_validate(payload).model_dump(exclude_none=True)
    except ValidationError as exc:
        raise PayloadValidationError(str(exc)) from exc

from pydantic import BaseModel, ValidationError


class PayloadValidationError(ValueError):
    pass


class TextBlockPayload(BaseModel):
    markdown: str


BLOCK_PAYLOAD_SCHEMAS = {
    'text': TextBlockPayload,
}


def validate_block_payload(block_type: str, payload: dict) -> dict:
    schema = BLOCK_PAYLOAD_SCHEMAS.get(block_type)
    if schema is None:
        raise PayloadValidationError(f'Unregistered block type: {block_type}')

    try:
        return schema.model_validate(payload).model_dump()
    except ValidationError as exc:
        raise PayloadValidationError(str(exc)) from exc

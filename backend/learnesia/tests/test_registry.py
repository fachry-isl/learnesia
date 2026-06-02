from django.test import SimpleTestCase

from learnesia.content_blocks.registry import (
    PayloadValidationError,
    validate_block_payload,
)


class TextBlockRegistryTests(SimpleTestCase):
    def test_accepts_valid_text_payload(self):
        result = validate_block_payload('text', {'markdown': '# Hello'})

        self.assertEqual(result, {'markdown': '# Hello'})

    def test_rejects_malformed_text_payload(self):
        with self.assertRaises(PayloadValidationError):
            validate_block_payload('text', {'markdown': 123})

    def test_rejects_unregistered_block_type(self):
        with self.assertRaises(PayloadValidationError) as ctx:
            validate_block_payload('flashcard', {'front': 'a', 'back': 'b'})

        self.assertIn('Unregistered', str(ctx.exception))


class QuizBlockRegistryTests(SimpleTestCase):
    def test_accepts_empty_quiz_payload(self):
        result = validate_block_payload('quiz', {})

        self.assertEqual(result, {})

    def test_rejects_extra_quiz_payload_fields(self):
        with self.assertRaises(PayloadValidationError):
            validate_block_payload('quiz', {'title': 'should not be here'})

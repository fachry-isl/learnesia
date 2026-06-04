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


class VideoBlockRegistryTests(SimpleTestCase):
    def test_accepts_valid_video_payload(self):
        result = validate_block_payload(
            'video',
            {'url': 'https://example.com/watch', 'title': 'Intro'},
        )

        self.assertEqual(
            result,
            {'url': 'https://example.com/watch', 'title': 'Intro'},
        )

    def test_accepts_optional_start_and_end(self):
        result = validate_block_payload(
            'video',
            {
                'url': 'https://example.com/watch',
                'title': 'Clip',
                'start': 30,
                'end': 120,
            },
        )

        self.assertEqual(result, {'url': 'https://example.com/watch', 'title': 'Clip', 'start': 30, 'end': 120})

    def test_rejects_video_missing_url(self):
        with self.assertRaises(PayloadValidationError):
            validate_block_payload('video', {'title': 'No URL'})

    def test_rejects_non_integer_start(self):
        with self.assertRaises(PayloadValidationError):
            validate_block_payload(
                'video',
                {'url': 'https://example.com', 'title': 'Bad', 'start': '30'},
            )


class ExerciseBlockRegistryTests(SimpleTestCase):
    def test_accepts_valid_exercise_payload(self):
        result = validate_block_payload('exercise', {'prompt': 'Explain recursion.'})

        self.assertEqual(result, {'prompt': 'Explain recursion.'})

    def test_accepts_optional_sample_solution_and_hints(self):
        result = validate_block_payload(
            'exercise',
            {
                'prompt': 'Write a loop.',
                'sample_solution': 'for i in range(10): print(i)',
                'hints': ['Use range', 'print inside the loop'],
            },
        )

        self.assertEqual(
            result,
            {
                'prompt': 'Write a loop.',
                'sample_solution': 'for i in range(10): print(i)',
                'hints': ['Use range', 'print inside the loop'],
            },
        )

    def test_rejects_exercise_missing_prompt(self):
        with self.assertRaises(PayloadValidationError):
            validate_block_payload('exercise', {'sample_solution': 'answer'})


class QuizBlockRegistryTests(SimpleTestCase):
    def test_accepts_empty_quiz_payload(self):
        result = validate_block_payload('quiz', {})

        self.assertEqual(result, {})

    def test_rejects_extra_quiz_payload_fields(self):
        with self.assertRaises(PayloadValidationError):
            validate_block_payload('quiz', {'title': 'should not be here'})

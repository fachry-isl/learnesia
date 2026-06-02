from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from learnesia.models import ContentBlock, Course, Lesson, Module, Quiz


class CourseHierarchyAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='admin', password='pass')
        self.client.force_authenticate(user=self.user)

        self.published_course = Course.objects.create(
            course_name='Published Course',
            status='published',
        )
        self.published_module = Module.objects.create(
            course=self.published_course,
            name='Module One',
            order=0,
        )
        self.published_lesson = Lesson.objects.create(
            module=self.published_module,
            lesson_name='Lesson One',
            order=0,
        )
        ContentBlock.objects.create(
            lesson=self.published_lesson,
            order=0,
            block_type='text',
            payload={'markdown': 'Published content'},
        )

        self.draft_course = Course.objects.create(
            course_name='Draft Course',
            status='draft',
        )
        self.draft_module = Module.objects.create(
            course=self.draft_course,
            name='Draft Module',
            order=0,
        )
        Lesson.objects.create(
            module=self.draft_module,
            lesson_name='Draft Lesson',
            order=0,
        )

    def test_public_course_list_returns_only_published_with_nested_structure(self):
        self.client.force_authenticate(user=None)

        response = self.client.get('/api/courses/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slugs = [course['course_slug'] for course in response.data]
        self.assertIn(self.published_course.course_slug, slugs)
        self.assertNotIn(self.draft_course.course_slug, slugs)

        published = next(
            course for course in response.data
            if course['course_slug'] == self.published_course.course_slug
        )
        self.assertEqual(len(published['modules']), 1)
        self.assertEqual(published['modules'][0]['lessons'][0]['content_blocks'][0]['payload']['markdown'], 'Published content')

    def test_authenticated_user_can_list_draft_courses(self):
        response = self.client.get('/api/courses/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slugs = [course['course_slug'] for course in response.data]
        self.assertIn(self.draft_course.course_slug, slugs)

    def test_course_defaults_to_draft_and_indonesian_language(self):
        course = Course.objects.create(course_name='Defaults Course')

        self.assertEqual(course.status, 'draft')
        self.assertEqual(course.language, 'id')

    def test_status_transition_draft_to_published(self):
        course = Course.objects.create(course_name='Transition Course', status='draft')
        slug = course.course_slug

        response = self.client.patch(
            f'/api/courses/{slug}/',
            {'status': 'published'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        course.refresh_from_db()
        self.assertEqual(course.status, 'published')

    def test_status_transition_published_to_draft(self):
        slug = self.published_course.course_slug

        response = self.client.patch(
            f'/api/courses/{slug}/',
            {'status': 'draft'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.published_course.refresh_from_db()
        self.assertEqual(self.published_course.status, 'draft')


class ModuleAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='admin', password='pass')
        self.client.force_authenticate(user=self.user)
        self.course = Course.objects.create(course_name='Module Course', status='draft')

    def test_module_crud_nested_under_course(self):
        slug = self.course.course_slug
        base_url = f'/api/courses/{slug}/modules/'

        create_response = self.client.post(
            base_url,
            {'name': 'Getting Started', 'description': 'Intro', 'order': 0},
            format='json',
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        module_id = create_response.data['id']

        list_response = self.client.get(base_url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)

        detail_url = f'{base_url}{module_id}/'
        update_response = self.client.patch(
            detail_url,
            {'description': 'Updated intro'},
            format='json',
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data['description'], 'Updated intro')

        delete_response = self.client.delete(detail_url)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Module.objects.count(), 0)


class ContentBlockAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='admin', password='pass')
        self.client.force_authenticate(user=self.user)

        course = Course.objects.create(course_name='Block Course', status='draft')
        module = Module.objects.create(course=course, name='Module', order=0)
        self.lesson = Lesson.objects.create(module=module, lesson_name='Lesson', order=0)

    def test_content_block_crud_nested_under_lesson(self):
        base_url = f'/api/lessons/{self.lesson.id}/content-blocks/'

        create_response = self.client.post(
            base_url,
            {
                'order': 0,
                'block_type': 'text',
                'payload': {'markdown': '# Title'},
            },
            format='json',
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        block_id = create_response.data['id']

        list_response = self.client.get(base_url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)

        detail_url = f'{base_url}{block_id}/'
        update_response = self.client.patch(
            detail_url,
            {'payload': {'markdown': '# Updated'}},
            format='json',
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data['payload']['markdown'], '# Updated')

        delete_response = self.client.delete(detail_url)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ContentBlock.objects.count(), 0)

    def test_rejects_malformed_text_payload(self):
        response = self.client.post(
            f'/api/lessons/{self.lesson.id}/content-blocks/',
            {
                'order': 0,
                'block_type': 'text',
                'payload': {'markdown': 123},
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('payload', response.data)

    def test_rejects_unregistered_block_type(self):
        response = self.client.post(
            f'/api/lessons/{self.lesson.id}/content-blocks/',
            {
                'order': 0,
                'block_type': 'video',
                'payload': {'url': 'https://example.com'},
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('payload', response.data)

    def test_create_quiz_block_links_to_quiz_row(self):
        response = self.client.post(
            f'/api/lessons/{self.lesson.id}/content-blocks/',
            {
                'order': 1,
                'block_type': 'quiz',
                'payload': {},
                'quiz': {
                    'quiz_title': 'Check Your Understanding',
                    'quiz_description': 'Quick recap quiz',
                    'questions': [
                        {
                            'question_text': 'What is 2 + 2?',
                            'order': 1,
                            'options': [
                                {'option_text': '3', 'is_correct': False, 'order': 1},
                                {'option_text': '4', 'is_correct': True, 'order': 2},
                            ],
                        },
                    ],
                },
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        block = ContentBlock.objects.get(id=response.data['id'])
        self.assertEqual(block.block_type, 'quiz')
        self.assertIsNotNone(block.quiz_id)
        self.assertEqual(block.quiz.quiz_title, 'Check Your Understanding')
        self.assertEqual(block.quiz.lesson_id, self.lesson.id)

    def test_read_quiz_block_includes_nested_questions_and_options(self):
        create_response = self.client.post(
            f'/api/lessons/{self.lesson.id}/content-blocks/',
            {
                'order': 1,
                'block_type': 'quiz',
                'payload': {},
                'quiz': {
                    'quiz_title': 'Final Quiz',
                    'questions': [
                        {
                            'question_text': 'Pick one',
                            'order': 1,
                            'options': [
                                {'option_text': 'Wrong', 'is_correct': False, 'order': 1},
                                {'option_text': 'Right', 'is_correct': True, 'order': 2},
                            ],
                        },
                    ],
                },
            },
            format='json',
        )
        block_id = create_response.data['id']

        list_response = self.client.get(f'/api/lessons/{self.lesson.id}/content-blocks/')

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        quiz_block = next(block for block in list_response.data if block['id'] == block_id)
        self.assertEqual(quiz_block['block_type'], 'quiz')
        self.assertEqual(quiz_block['quiz']['quiz_title'], 'Final Quiz')
        self.assertEqual(len(quiz_block['quiz']['questions']), 1)
        self.assertEqual(quiz_block['quiz']['questions'][0]['question_text'], 'Pick one')
        self.assertEqual(len(quiz_block['quiz']['questions'][0]['options']), 2)
        self.assertTrue(
            any(opt['is_correct'] for opt in quiz_block['quiz']['questions'][0]['options'])
        )

    def test_lesson_can_have_multiple_quiz_blocks(self):
        quiz_payload = {
            'questions': [
                {
                    'question_text': 'Q?',
                    'order': 1,
                    'options': [
                        {'option_text': 'A', 'is_correct': True, 'order': 1},
                    ],
                },
            ],
        }
        base_url = f'/api/lessons/{self.lesson.id}/content-blocks/'

        first = self.client.post(
            base_url,
            {'order': 1, 'block_type': 'quiz', 'payload': {}, 'quiz': {**quiz_payload, 'quiz_title': 'Quiz One'}},
            format='json',
        )
        second = self.client.post(
            base_url,
            {'order': 2, 'block_type': 'quiz', 'payload': {}, 'quiz': {**quiz_payload, 'quiz_title': 'Quiz Two'}},
            format='json',
        )

        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            ContentBlock.objects.filter(lesson=self.lesson, block_type='quiz').count(),
            2,
        )
        self.assertEqual(Quiz.objects.filter(lesson=self.lesson).count(), 2)

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from learnesia.models import ContentBlock, Course, Lesson, LessonCitation, Module, Reference


class LessonCitationSetupMixin:
    def setUp(self):
        self.user = User.objects.create_user(username='admin', password='pass')
        self.client.force_authenticate(user=self.user)

        course = Course.objects.create(course_name='Ref Course', status='draft')
        module = Module.objects.create(course=course, name='Module', order=0)
        self.lesson = Lesson.objects.create(module=module, lesson_name='Lesson', order=0)
        self.other_lesson = Lesson.objects.create(module=module, lesson_name='Other', order=1)

    def create_reference(self, **overrides):
        payload = {
            'url': 'https://example.com/source',
            'title': 'Source Article',
            'source_type': 'link',
        }
        payload.update(overrides)
        response = self.client.post('/api/references/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        return response.data['id']


class ReferenceAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='admin', password='pass')
        self.client.force_authenticate(user=self.user)

    def test_reference_crud(self):
        base_url = '/api/references/'

        create_response = self.client.post(
            base_url,
            {
                'url': 'https://example.com/article',
                'title': 'Example Article',
                'source_type': 'link',
            },
            format='json',
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(create_response.data['title'], 'Example Article')
        self.assertEqual(create_response.data['source_type'], 'link')
        reference_id = create_response.data['id']

        list_response = self.client.get(base_url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)

        detail_url = f'{base_url}{reference_id}/'
        retrieve_response = self.client.get(detail_url)
        self.assertEqual(retrieve_response.status_code, status.HTTP_200_OK)
        self.assertEqual(retrieve_response.data['url'], 'https://example.com/article')

        update_response = self.client.patch(
            detail_url,
            {'title': 'Updated Article'},
            format='json',
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data['title'], 'Updated Article')

        delete_response = self.client.delete(detail_url)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Reference.objects.count(), 0)


class LessonCitationAPITests(LessonCitationSetupMixin, APITestCase):
    def test_lesson_citation_crud_nested_under_lesson(self):
        reference_id = self.create_reference()
        base_url = f'/api/lessons/{self.lesson.id}/citations/'

        create_response = self.client.post(
            base_url,
            {
                'reference_id': reference_id,
                'role': 'citation',
                'order': 0,
            },
            format='json',
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        citation_id = create_response.data['id']
        self.assertIsNone(create_response.data['content_block'])

        list_response = self.client.get(base_url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)

        detail_url = f'{base_url}{citation_id}/'
        retrieve_response = self.client.get(detail_url)
        self.assertEqual(retrieve_response.status_code, status.HTTP_200_OK)
        self.assertEqual(retrieve_response.data['reference']['title'], 'Source Article')

        update_response = self.client.patch(
            detail_url,
            {'order': 2},
            format='json',
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data['order'], 2)

        delete_response = self.client.delete(detail_url)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(LessonCitation.objects.count(), 0)
        self.assertEqual(Reference.objects.count(), 1)

    def test_citation_can_link_content_block(self):
        block = ContentBlock.objects.create(
            lesson=self.lesson,
            order=0,
            block_type='text',
            payload={'markdown': 'Body'},
        )
        reference_id = self.create_reference()

        response = self.client.post(
            f'/api/lessons/{self.lesson.id}/citations/',
            {
                'reference_id': reference_id,
                'role': 'citation',
                'content_block': block.id,
                'order': 0,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content_block'], block.id)

    def test_create_citation_on_lesson(self):
        reference_id = self.create_reference()

        response = self.client.post(
            f'/api/lessons/{self.lesson.id}/citations/',
            {
                'reference_id': reference_id,
                'role': 'citation',
                'order': 0,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['role'], 'citation')
        self.assertEqual(response.data['reference']['title'], 'Source Article')
        self.assertEqual(LessonCitation.objects.filter(lesson=self.lesson, role='citation').count(), 1)

    def test_create_supplementary_reference_on_lesson(self):
        reference_id = self.create_reference(title='Further Reading')

        response = self.client.post(
            f'/api/lessons/{self.lesson.id}/citations/',
            {
                'reference_id': reference_id,
                'role': 'supplementary',
                'order': 1,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['role'], 'supplementary')

        list_response = self.client.get(
            f'/api/lessons/{self.lesson.id}/citations/',
            {'role': 'supplementary'},
        )
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]['role'], 'supplementary')

    def test_list_sources_returns_only_citations(self):
        ref_citation = self.create_reference(title='Primary Source')
        ref_extra = self.create_reference(title='Extra Reading')

        self.client.post(
            f'/api/lessons/{self.lesson.id}/citations/',
            {'reference_id': ref_citation, 'role': 'citation', 'order': 0},
            format='json',
        )
        self.client.post(
            f'/api/lessons/{self.lesson.id}/citations/',
            {'reference_id': ref_extra, 'role': 'supplementary', 'order': 1},
            format='json',
        )

        response = self.client.get(f'/api/lessons/{self.lesson.id}/sources/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['role'], 'citation')
        self.assertEqual(response.data[0]['reference']['title'], 'Primary Source')

    def test_reference_reuse_across_lessons(self):
        reference_id = self.create_reference()

        for lesson in (self.lesson, self.other_lesson):
            response = self.client.post(
                f'/api/lessons/{lesson.id}/citations/',
                {'reference_id': reference_id, 'role': 'citation', 'order': 0},
                format='json',
            )
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(Reference.objects.count(), 1)
        self.assertEqual(LessonCitation.objects.filter(reference_id=reference_id).count(), 2)

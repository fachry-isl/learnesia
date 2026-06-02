from django.core.management import call_command
from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.test import TransactionTestCase

from learnesia.models import ContentBlock, Course, Lesson, Module, Quiz


class SchemaFoundationMigrationTests(TransactionTestCase):
    def test_migrates_lessons_into_module_and_text_blocks(self):
        migration_0015 = '0015_course_course_thumbnail'
        call_command('migrate', 'learnesia', migration_0015, verbosity=0)

        executor = MigrationExecutor(connection)
        state = executor.loader.project_state(('learnesia', migration_0015), at_end=True)
        historical_apps = state.apps

        HistoricalCourse = historical_apps.get_model('learnesia', 'Course')
        HistoricalLesson = historical_apps.get_model('learnesia', 'Lesson')

        course = HistoricalCourse.objects.create(
            course_name='Legacy Course',
            status='template',
            course_tags=[],
            course_learning_objectives=[],
        )
        HistoricalLesson.objects.create(
            course=course,
            lesson_name='Legacy Lesson',
            lesson_content='# Hello world',
            order=0,
        )

        call_command('migrate', 'learnesia', '0016_schema_foundation', verbosity=0)

        course = Course.objects.get(course_name='Legacy Course')
        self.assertEqual(course.status, 'draft')

        module = Module.objects.get(course=course)
        self.assertEqual(module.name, 'Legacy Course')

        lesson = Lesson.objects.get(module=module)
        self.assertEqual(lesson.lesson_name, 'Legacy Lesson')

        block = ContentBlock.objects.get(lesson=lesson)
        self.assertEqual(block.block_type, 'text')
        self.assertEqual(block.payload['markdown'], '# Hello world')
        self.assertEqual(block.order, 0)

    def test_course_status_choices_exclude_template(self):
        status_values = [choice[0] for choice in Course.STATUS_CHOICES]
        self.assertEqual(status_values, ['draft', 'published'])

    def test_migrates_existing_quizzes_to_quiz_content_blocks(self):
        call_command('migrate', 'learnesia', '0016_schema_foundation', verbosity=0)

        course = Course.objects.create(course_name='Quiz Course', status='draft')
        module = Module.objects.create(course=course, name='Module', order=0)
        lesson = Lesson.objects.create(module=module, lesson_name='Lesson', order=0)
        ContentBlock.objects.create(
            lesson=lesson,
            order=0,
            block_type='text',
            payload={'markdown': 'Lesson body'},
        )
        quiz = Quiz.objects.create(lesson=lesson, quiz_title='Legacy Quiz')

        call_command('migrate', 'learnesia', '0017_quiz_block_type', verbosity=0)

        blocks = ContentBlock.objects.filter(lesson=lesson).order_by('order')
        self.assertEqual(blocks.count(), 2)
        self.assertEqual(blocks[0].block_type, 'text')
        self.assertEqual(blocks[1].block_type, 'quiz')
        self.assertEqual(blocks[1].order, 1)
        self.assertEqual(blocks[1].quiz_id, quiz.id)
        self.assertEqual(blocks[1].payload, {})

from django.core.management.base import BaseCommand
from django.db import transaction

from learnesia.models import ContentBlock, Course, Lesson, Module

COURSE_SLUG = 'multi-module-lessons-demo'

# (module_name, module_description, order, lessons[(name, slug, order, blurb)])
CURRICULUM = [
    (
        'Module 1: Getting Started',
        'Three lessons in one module — expand the accordion to see them stack.',
        0,
        [
            (
                'Welcome & Overview',
                'welcome-overview',
                0,
                'What you will cover in this short demo path.',
            ),
            (
                'Set Up Your Environment',
                'set-up-environment',
                1,
                'Install tools and verify everything runs locally.',
            ),
            (
                'First Practice Task',
                'first-practice-task',
                2,
                'A minimal exercise-style lesson to complete the module.',
            ),
        ],
    ),
    (
        'Module 2: Core Concepts',
        'Two lessons — typical mid-course module size.',
        1,
        [
            (
                'Key Ideas',
                'key-ideas',
                0,
                'Definitions and mental models used in later modules.',
            ),
            (
                'Worked Example',
                'worked-example',
                1,
                'Step through one end-to-end example together.',
            ),
        ],
    ),
    (
        'Module 3: Wrap-Up',
        'Two lessons — shows ordering across the full course.',
        2,
        [
            (
                'Common Mistakes',
                'common-mistakes',
                0,
                'Patterns to avoid before you finish.',
            ),
            (
                'Next Steps',
                'next-steps',
                1,
                'Where to go after this demo course.',
            ),
        ],
    ),
]


class Command(BaseCommand):
    help = (
        'Create a published demo course with multiple modules and multiple '
        'lessons per module for Issue #34 syllabus / sidebar QA.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--replace',
            action='store_true',
            help='Delete existing demo course (by slug) before recreating.',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options['replace']:
            deleted, _ = Course.objects.filter(course_slug=COURSE_SLUG).delete()
            if deleted:
                self.stdout.write(f'Removed previous demo course ({deleted} row(s)).')

        if Course.objects.filter(course_slug=COURSE_SLUG).exists():
            course = Course.objects.get(course_slug=COURSE_SLUG)
            self.stdout.write(
                self.style.WARNING(
                    f'Demo course already exists (slug={COURSE_SLUG}). Use --replace.',
                ),
            )
            self._print_summary(course)
            return

        course = Course.objects.create(
            course_name='Demo: Multiple Modules & Lessons',
            course_slug=COURSE_SLUG,
            course_description=(
                'Showcases Issue #34 layout with **3 modules** and **7 lessons** '
                '(3 + 2 + 2). Use the course syllabus to expand each module; '
                'use the lesson sidebar to see the flat list across the whole course.'
            ),
            course_learning_objectives=[
                'See several lessons grouped under one module on the course page',
                'Navigate between lessons in the same module and across modules',
                'Confirm lesson order follows module order, then lesson order',
            ],
            course_tags=['demo', 'issue-34', 'multi-lesson'],
            status='published',
            language='en',
        )

        for module_name, module_desc, module_order, lessons in CURRICULUM:
            module = Module.objects.create(
                course=course,
                name=module_name,
                description=module_desc,
                order=module_order,
            )
            for lesson_name, lesson_slug, lesson_order, blurb in lessons:
                lesson = Lesson.objects.create(
                    module=module,
                    lesson_name=lesson_name,
                    lesson_slug=lesson_slug,
                    lesson_learning_objectives=[blurb],
                    order=lesson_order,
                    estimated_time=5,
                )
                ContentBlock.objects.create(
                    lesson=lesson,
                    order=0,
                    block_type='text',
                    payload={
                        'markdown': (
                            f'# {lesson_name}\n\n'
                            f'**Module:** {module_name}\n\n'
                            f'{blurb}\n\n'
                            '---\n\n'
                            'This is a lightweight text block so you can focus on '
                            'syllabus and sidebar navigation rather than block types.'
                        ),
                    },
                )

        course.update_estimated_time()

        self.stdout.write(self.style.SUCCESS('Created multi-module demo course.'))
        self._print_summary(course)

    def _print_summary(self, course):
        slug = course.course_slug
        self.stdout.write('')
        self.stdout.write('Structure:')
        for module in course.modules.order_by('order'):
            lesson_names = ', '.join(
                lesson.lesson_slug for lesson in module.lessons.order_by('order')
            )
            self.stdout.write(
                f'  [{module.order}] {module.name} ({module.lessons.count()} lessons)'
            )
            self.stdout.write(f'      → {lesson_names}')
        self.stdout.write('')
        self.stdout.write('How it looks in the UI (#34):')
        self.stdout.write(
            '  Course overview — each module is a collapsible card; expanding shows '
            'a vertical list of lesson links (name + duration).'
        )
        self.stdout.write(
            '  Lesson page sidebar — one flat "Lessons" list: all lessons in module '
            'order, then next module (7 items total for this course).'
        )
        self.stdout.write('')
        self.stdout.write('URLs (dev):')
        self.stdout.write(f'  /course/{slug}/overview')
        self.stdout.write(f'  /course/{slug}/lesson/welcome-overview')
        self.stdout.write(f'  API: GET /api/courses/{slug}/')

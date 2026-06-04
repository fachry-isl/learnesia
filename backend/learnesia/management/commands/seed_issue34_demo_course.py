from django.core.management.base import BaseCommand
from django.db import transaction

from learnesia.models import (
    ContentBlock,
    Course,
    Lesson,
    LessonCitation,
    Module,
    QuestionOption,
    Quiz,
    QuizQuestion,
    Reference,
)

COURSE_SLUG = 'issue-34-block-hierarchy-demo'


class Command(BaseCommand):
    help = (
        'Create a published demo course for Issue #34 manual QA: '
        'modules, all block types, citations, and supplementary references.'
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
                    f'Demo course already exists (slug={COURSE_SLUG}). '
                    'Use --replace to recreate.',
                ),
            )
            self._print_urls(course)
            return

        course = Course.objects.create(
            course_name='Issue #34 Demo: Block Hierarchy',
            course_slug=COURSE_SLUG,
            course_description=(
                'Sample published course for QA of module grouping, content blocks, '
                'and lesson sources. Safe to delete or recreate with --replace.'
            ),
            course_learning_objectives=[
                'Navigate a course organized by modules and lessons',
                'Experience text, video, quiz, and exercise blocks in one lesson',
                'Review Sources and Further Reading at the end of a lesson',
            ],
            course_tags=['demo', 'issue-34', 'qa'],
            status='published',
            language='en',
            estimated_time=25,
        )

        module_foundations = Module.objects.create(
            course=course,
            name='Foundations',
            description='Core ideas and a full block sequence for end-to-end QA.',
            order=0,
        )
        module_practice = Module.objects.create(
            course=course,
            name='Practice',
            description='Shorter lesson focused on video without timestamps.',
            order=1,
        )

        lesson_full = Lesson.objects.create(
            module=module_foundations,
            lesson_name='How Habits Work (All Block Types)',
            lesson_slug='how-habits-work-all-blocks',
            lesson_learning_objectives=[
                'Read scaffolded text before and after a video segment',
                'Complete an inline quiz and a self-checked exercise',
                'Find citations under Sources and extra links under Further Reading',
            ],
            order=0,
            estimated_time=15,
        )
        lesson_video_only = Lesson.objects.create(
            module=module_practice,
            lesson_name='Watch the Full Segment',
            lesson_slug='watch-full-segment',
            lesson_learning_objectives=[
                'Play a video block without start or end timestamps',
            ],
            order=0,
            estimated_time=8,
        )

        self._create_full_lesson_blocks(lesson_full)
        self._create_video_only_lesson_blocks(lesson_video_only)
        self._create_lesson_citations(lesson_full)

        course.update_estimated_time()

        self.stdout.write(self.style.SUCCESS('Created Issue #34 demo course.'))
        self._print_urls(course)

    def _create_full_lesson_blocks(self, lesson):
        ContentBlock.objects.create(
            lesson=lesson,
            order=0,
            block_type='text',
            payload={
                'markdown': (
                    '# How Habits Work\n\n'
                    'Before watching, notice the **cues** that trigger your routines. '
                    'This lesson walks through every public block type in order.\n\n'
                    'The video below is scoped to a short segment (start/end timestamps).'
                ),
            },
        )
        ContentBlock.objects.create(
            lesson=lesson,
            order=1,
            block_type='video',
            payload={
                'url': 'https://www.youtube.com/watch?v=OMbsGBlpP30',
                'title': 'Charles Duhigg on the Habit Loop (excerpt)',
                'start': 30,
                'end': 120,
            },
        )
        ContentBlock.objects.create(
            lesson=lesson,
            order=2,
            block_type='text',
            payload={
                'markdown': (
                    '## After the video\n\n'
                    'Debrief: replace the routine while keeping the same reward. '
                    'That is the lever most people miss when they try to change a habit.'
                ),
            },
        )
        ContentBlock.objects.create(
            lesson=lesson,
            order=3,
            block_type='exercise',
            payload={
                'prompt': (
                    'Pick one habit you want to change. Write down its cue, '
                    'routine, and reward in three short sentences.'
                ),
                'sample_solution': (
                    'Cue: 3pm energy slump.\n'
                    'Routine: walk to pantry for chips.\n'
                    'Reward: short break + crunch + sugar hit.'
                ),
                'hints': [
                    'Be specific about time and place for the cue.',
                    'The reward is the feeling you get, not the behavior itself.',
                ],
            },
        )

        quiz = Quiz.objects.create(
            lesson=lesson,
            quiz_title='Quick Check: Habit Loop',
            quiz_description='Inline quiz block — answer to unlock the next lesson.',
        )
        question = QuizQuestion.objects.create(
            quiz=quiz,
            question_text='What are the three parts of the habit loop?',
            explanation='Cue → routine → reward. Change the routine while preserving the reward.',
            order=1,
        )
        QuestionOption.objects.create(
            question=question,
            option_text='Cue, routine, reward',
            is_correct=True,
            order=1,
        )
        QuestionOption.objects.create(
            question=question,
            option_text='Goal, plan, outcome',
            is_correct=False,
            order=2,
        )
        QuestionOption.objects.create(
            question=question,
            option_text='Trigger, action, habit',
            is_correct=False,
            order=3,
        )

        ContentBlock.objects.create(
            lesson=lesson,
            order=4,
            block_type='quiz',
            payload={},
            quiz=quiz,
        )

    def _create_video_only_lesson_blocks(self, lesson):
        ContentBlock.objects.create(
            lesson=lesson,
            order=0,
            block_type='text',
            payload={
                'markdown': (
                    '# Full video playback\n\n'
                    'This lesson has **no** `start` or `end` on the video block — '
                    'the player should load the entire embed.'
                ),
            },
        )
        ContentBlock.objects.create(
            lesson=lesson,
            order=1,
            block_type='video',
            payload={
                'url': 'https://www.youtube.com/watch?v=OMbsGBlpP30',
                'title': 'Full habit loop talk (no timestamps)',
            },
        )

    def _create_lesson_citations(self, lesson):
        citation_ref = Reference.objects.create(
            url='https://charlesduhigg.com/the-power-of-habit/',
            title='The Power of Habit — Charles Duhigg',
            source_type='link',
        )
        supplementary_ref = Reference.objects.create(
            url='https://jamesclear.com/habit-guide',
            title='James Clear — Habit Guide',
            source_type='link',
        )
        video_ref = Reference.objects.create(
            url='https://www.youtube.com/watch?v=OMbsGBlpP30',
            title='YouTube: Habit loop overview',
            source_type='video',
        )

        LessonCitation.objects.create(
            lesson=lesson,
            reference=citation_ref,
            role='citation',
            order=0,
        )
        LessonCitation.objects.create(
            lesson=lesson,
            reference=video_ref,
            role='citation',
            order=1,
        )
        LessonCitation.objects.create(
            lesson=lesson,
            reference=supplementary_ref,
            role='supplementary',
            order=0,
        )

    def _print_urls(self, course):
        slug = course.course_slug
        self.stdout.write('')
        self.stdout.write('Manual QA URLs (dev):')
        self.stdout.write(f'  Course overview: /course/{slug}/overview')
        self.stdout.write(f'  Lesson 1:        /course/{slug}/lesson/how-habits-work-all-blocks')
        self.stdout.write(f'  Lesson 2:        /course/{slug}/lesson/watch-full-segment')
        self.stdout.write(f'  API:             GET /api/courses/{slug}/')

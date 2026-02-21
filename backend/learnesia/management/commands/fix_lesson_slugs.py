import re
from django.core.management.base import BaseCommand
from django.db import transaction
from learnesia.models import Lesson


class Command(BaseCommand):
    help = 'Fix null lesson_slug values for all Lessons'

    def handle(self, *args, **options):
        null_slug_lessons = Lesson.objects.filter(lesson_slug__isnull=True)
        total = null_slug_lessons.count()

        self.stdout.write(f'Found {total} lessons with null slugs')

        if total == 0:
            self.stdout.write(self.style.SUCCESS('All lesson slugs are populated!'))
            return

        with transaction.atomic():
            updated = 0
            for lesson in null_slug_lessons:
                # Generate slug safely
                cleaned_name = re.sub(r'[^a-zA-Z0-9\s]', '', lesson.lesson_name)
                slug_words = [word for word in cleaned_name.lower().split() if word]
                lesson.lesson_slug = "-".join(slug_words) if slug_words else "untitled-lesson"

                lesson.save(update_fields=['lesson_slug'])
                updated += 1
                self.stdout.write(f'Updated: {lesson.lesson_name} -> {lesson.lesson_slug}')

        self.stdout.write(
            self.style.SUCCESS(f'Successfully updated {updated}/{total} lesson slugs!')
        )

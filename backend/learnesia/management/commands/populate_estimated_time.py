from django.core.management.base import BaseCommand
from learnesia.models import Course, Lesson
import re

class Command(BaseCommand):
    help = 'Populate estimated_time for existing Course and Lesson objects'

    def handle(self, *args, **options):
        self.stdout.write('Populating estimated_time for Lessons...')
        lessons = Lesson.objects.all()
        count = 0
        for lesson in lessons:
            if lesson.lesson_content:
                words = re.findall(r'\w+', lesson.lesson_content)
                lesson.estimated_time = max(1, round(len(words) / 200))
            else:
                lesson.estimated_time = 0
            lesson.save(update_fields=['estimated_time'])
            count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Successfully updated {count} lessons.'))

        self.stdout.write('Populating estimated_time for Courses...')
        courses = Course.objects.all()
        count = 0
        for course in courses:
            course.update_estimated_time()
            count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Successfully updated {count} courses.'))

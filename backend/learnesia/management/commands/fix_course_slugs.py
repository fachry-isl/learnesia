import re
from django.core.management.base import BaseCommand
from django.db import transaction
from learnesia.models import Course

class Command(BaseCommand):
    help = 'Fix null course_slug values for all Courses'

    def handle(self, *args, **options):
        null_slug_courses = Course.objects.filter(course_slug__isnull=True)
        total = null_slug_courses.count()
        
        self.stdout.write(f'Found {total} courses with null slugs')
        
        if total == 0:
            self.stdout.write(self.style.SUCCESS('All slugs are populated!'))
            return
        
        with transaction.atomic():
            updated = 0
            for course in null_slug_courses:
                # Generate slug safely
                cleaned_name = re.sub(r'[^a-zA-Z0-9\s]', '', course.course_name)
                slug_words = [word for word in cleaned_name.lower().split() if word]
                course.course_slug = "_".join(slug_words)
                
                course.save(update_fields=['course_slug'])
                updated += 1
                self.stdout.write(f'Updated: {course.course_name} -> {course.course_slug}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully updated {updated}/{total} course slugs!')
        )

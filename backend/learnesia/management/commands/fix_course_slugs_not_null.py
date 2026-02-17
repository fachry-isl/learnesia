import re
from django.core.management.base import BaseCommand
from django.db import transaction
from learnesia.models import Course


class Command(BaseCommand):
    help = 'Fix null/duplicate course_slug values (underscore version)'

    def generate_slug(self, course_name):
        # Match your model logic exactly
        cleaned_name = re.sub(r'[^a-zA-Z0-9\s]', '', course_name)
        slug_words = [word for word in cleaned_name.lower().split() if word]
        return "-".join(slug_words)  # ✅ Underscores

    def handle(self, *args, **options):
        courses_to_update = Course.objects.all()
        total = courses_to_update.count()
        
        if total == 0:
            self.stdout.write(self.style.SUCCESS('All slugs populated!'))
            return
        
        with transaction.atomic():
            updated = 0
            for course in courses_to_update.iterator():
                base_slug = self.generate_slug(course.course_name)
                slug = base_slug
                counter = 1
                
                # Handle duplicates (e.g., tableau_data_analyst...-2)
                while Course.objects.filter(course_slug=slug).exclude(pk=course.pk).exists():
                    slug = f"{base_slug}_{counter}"
                    counter += 1
                
                course.course_slug = slug
                course.save(update_fields=['course_slug'])
                updated += 1
                self.stdout.write(f"Updated: {course.course_name} -> {course.course_slug}")
        
        self.stdout.write(self.style.SUCCESS(f'Fixed {updated} slugs!'))

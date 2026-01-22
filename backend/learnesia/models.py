from django.db import models
from django.contrib.postgres.fields import ArrayField

class Course(models.Model):
    STATUS_CHOICES = [
        ('template', 'Template'),
        ('draft', 'Draft'),
        ('published', 'Published'),
    ]

    course_name = models.CharField(max_length=255)
    course_description = models.TextField(blank=True)
    course_learning_objectives = ArrayField(models.CharField(max_length=255), blank=True, default=list)
    created_at = models.DateTimeField(auto_now_add=True)


    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='template',
        db_index=True
    )

    def __str__(self):
        return self.course_name


class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    lesson_name = models.CharField(max_length=255)
    lesson_learning_objectives = ArrayField(models.CharField(max_length=255), blank=True, default=list)
    lesson_content = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    order = models.PositiveIntegerField(default=0, db_index=True)

    def __str__(self):
        return self.lesson_name

class LessonReference(models.Model):
    REFERENCE_TYPE_CHOICES = [
        ('link', 'Link'),
        ('document', 'Document'),
        ('video', 'Video'),
    ]

    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='references')
    reference_title = models.CharField(max_length=255)
    reference_url = models.URLField(blank=True, null=True)
    reference_type = models.CharField(max_length=50, choices=REFERENCE_TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.reference_title
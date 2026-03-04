from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.db.models import Max

import re

class Course(models.Model):
    STATUS_CHOICES = [
        ('template', 'Template'),
        ('draft', 'Draft'),
        ('published', 'Published'),
    ]

    course_name = models.CharField(max_length=255)
    course_slug = models.CharField(max_length=255, blank=True, null=True)
    course_description = models.TextField(blank=True)
    course_learning_objectives = ArrayField(models.CharField(max_length=255), blank=True, default=list)
    course_tags = ArrayField(models.CharField(max_length=255), blank=True, default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='template',
        db_index=True
    )
    course_thumbnail = models.URLField(blank=True, null=True)
    estimated_time = models.PositiveIntegerField(default=0, help_text="Estimated time to complete in minutes")

    def __str__(self):
        return self.course_name
    
    def update_estimated_time(self):
        """Recalculate total estimated time from lessons"""
        total_time = self.lessons.aggregate(models.Sum('estimated_time'))['estimated_time__sum'] or 0
        if self.estimated_time != total_time:
            self.estimated_time = total_time
            self.save(update_fields=['estimated_time'])
    
    def save(self, *args, **kwargs):
        # Generate Course Slug Name
        if self.course_slug is None:
            # The pattern '[^a-zA-Z0-9\s]' matches any character NOT (^) a letter (a-z, A-Z), 
            # a digit (0-9), or a whitespace character (\s).
            # It replaces the matched characters with an empty string ('').
            cleaned_course_name = re.sub(r'[^a-zA-Z0-9\s]', '', self.course_name)

            # Split and make it lower
            list_name = cleaned_course_name.lower().split(" ")

            # Join with strip to create final course_slug
            self.course_slug = "-".join(list_name) if list_name else "untitled-course"

        super().save(*args, **kwargs)

class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    lesson_name = models.CharField(max_length=255)
    lesson_slug = models.CharField(max_length=255, blank=True, null=True)
    lesson_learning_objectives = ArrayField(models.CharField(max_length=255), blank=True, default=list)
    lesson_content = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    order = models.PositiveIntegerField(default=0, db_index=True)
    estimated_time = models.PositiveIntegerField(default=0, help_text="Estimated time to complete in minutes")

    def __str__(self):
        return self.lesson_name

    def save(self, *args, **kwargs):
        # Generate Course Slug Name
        if self.lesson_slug is None:
            # The pattern '[^a-zA-Z0-9\s]' matches any character NOT (^) a letter (a-z, A-Z), 
            # a digit (0-9), or a whitespace character (\s).
            # It replaces the matched characters with an empty string ('').
            cleaned_lesson_name = re.sub(r'[^a-zA-Z0-9\s]', '', self.lesson_name)

            # Split and make it lower
            list_name = cleaned_lesson_name.lower().split(" ")

            # Join with underscore to create final course_slug
            self.lesson_slug = "-".join(list_name) if list_name else "untitled-course"

        # Calculate estimated reading time
        if self.lesson_content:
            words = re.findall(r'\w+', self.lesson_content)
            self.estimated_time = max(1, round(len(words) / 200))
        else:
            self.estimated_time = 0

        super().save(*args, **kwargs)

        # Update parent course estimated time
        if self.course:
            self.course.update_estimated_time()

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
    


class Quiz(models.Model):
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='quizzes',
        db_column='lesson_id',
        unique=True
    )
    quiz_title = models.CharField(max_length=255)
    quiz_description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'quiz'
        verbose_name_plural = 'quizzes'
        indexes = [
            models.Index(fields=['lesson'], name='idx_quiz_lesson'),
        ]

    def __str__(self):
        return self.quiz_title


class QuizQuestion(models.Model):
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='questions',
        db_column='quiz_id'
    )
    question_text = models.TextField()
    explanation = models.TextField(
        blank=True,
        null=True,
        help_text='Shown when answer is wrong'
    )
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'quiz_question'
        indexes = [
            models.Index(fields=['quiz'], name='idx_question_quiz'),
            models.Index(fields=['order'], name='idx_question_order'),
        ]
        ordering = ['order']
        unique_together = ['quiz', 'order']

    def save(self, *args, **kwargs):
        """Auto-compute order if not provided"""
        if self.order is None or self.order == 0:
            # Get max order for this quiz
            max_order = self.quiz.questions.aggregate(
                Max('order')
            )['order__max'] or 0
            
            self.order = max_order + 1
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quiz.quiz_title} - Q{self.order}"



class QuestionOption(models.Model):
    question = models.ForeignKey(
        QuizQuestion,
        on_delete=models.CASCADE,
        related_name='options',
        db_column='question_id'
    )
    option_text = models.TextField()
    is_correct = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'question_option'
        indexes = [
            models.Index(fields=['question'], name='idx_option_question'),
        ]

    def save(self, *args, **kwargs):
        """Auto-compute order if not provided"""
        if self.order is None or self.order == 0:
            # Get max order for this quiz
            max_order = self.question.options.aggregate(
                Max('order')
            )['order__max'] or 0
            
            self.order = max_order + 1
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.question.question_text[:50]} - Option {self.order}"


class LessonFeedback(models.Model):
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='feedbacks',
        db_column='lesson_id'
    )
    rating = models.PositiveIntegerField(default=5, help_text="Rating from 1 to 5")
    comment = models.TextField(blank=True, null=True)
    user_identifier = models.CharField(max_length=255, blank=True, null=True, help_text="Optional user ID or anonymous session ID")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lesson_feedback'
        verbose_name_plural = 'lesson feedbacks'
        indexes = [
            models.Index(fields=['lesson'], name='idx_feedback_lesson'),
        ]

    def __str__(self):
        return f"Feedback for {self.lesson.lesson_name} - {self.rating} stars"
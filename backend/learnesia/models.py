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
    


class Quiz(models.Model):
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='quizzes',
        db_column='lesson_id'
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

    def __str__(self):
        return f"{self.question.question_text[:50]} - Option {self.order}"
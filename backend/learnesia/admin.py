from django.contrib import admin
from .models import (
    Course,
    Module,
    Lesson,
    ContentBlock,
    Reference,
    LessonCitation,
    Quiz,
    QuizQuestion,
    QuestionOption,
)


class LessonCitationInline(admin.TabularInline):
    model = LessonCitation
    extra = 1
    autocomplete_fields = ['reference']


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1
    show_change_link = True


class ModuleInline(admin.TabularInline):
    model = Module
    extra = 1
    show_change_link = True


class ContentBlockInline(admin.TabularInline):
    model = ContentBlock
    extra = 1
    show_change_link = True


class QuizQuestionInline(admin.TabularInline):
    model = QuizQuestion
    extra = 1
    show_change_link = True


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'course_name',
        'status',
        'language',
        'course_description',
        'created_at',
    ]
    search_fields = ['course_name', 'course_description']
    list_filter = ['status', 'language']
    inlines = [ModuleInline]


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ['id', 'course', 'name', 'order', 'created_at']
    list_filter = ['course']
    inlines = [LessonInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['id', 'module', 'lesson_name', 'order', 'created_at']
    list_filter = ['module__course', 'created_at']
    search_fields = ['lesson_name', 'module__course__course_name']
    inlines = [LessonCitationInline, ContentBlockInline]


@admin.register(ContentBlock)
class ContentBlockAdmin(admin.ModelAdmin):
    list_display = ['id', 'lesson', 'block_type', 'order', 'created_at']
    list_filter = ['block_type']


@admin.register(Reference)
class ReferenceAdmin(admin.ModelAdmin):
    list_display = ['title', 'source_type', 'url', 'created_at']
    list_filter = ['source_type', 'created_at']
    search_fields = ['title', 'url']


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['id', 'quiz_title', 'quiz_description', 'created_at', 'lesson_id']
    inlines = [QuizQuestionInline]


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ['id', 'quiz', 'question_text', 'explanation', 'order', 'created_at']


@admin.register(QuestionOption)
class QuestionOptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'question', 'option_text', 'is_correct']

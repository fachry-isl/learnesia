# courses/admin.py
from django.contrib import admin
from .models import Course, Lesson, LessonReference


class LessonReferenceInline(admin.TabularInline):
    model = LessonReference
    extra = 1


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1
    show_change_link = True


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['id', 'course_name', 'course_description', 'course_learning_objectives', 'created_at']
    search_fields = ['course_name', 'course_description']
    inlines = [LessonInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['id', 'course', 'lesson_name', 'lesson_content', 'created_at']
    list_filter = ['course', 'created_at']
    search_fields = ['lesson_description', 'course__course_name']
    inlines = [LessonReferenceInline]


@admin.register(LessonReference)
class LessonReferenceAdmin(admin.ModelAdmin):
    list_display = ['reference_title', 'lesson', 'reference_type', 'created_at']
    list_filter = ['reference_type', 'created_at']
    search_fields = ['reference_title', 'lesson__course__course_name']

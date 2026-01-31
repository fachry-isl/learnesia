from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, LessonViewSet, QuizViewSet, generate_course, generate_dummy_course, generate_course_structured, generate_course_lesson, generate_quiz

router = DefaultRouter()
router.register('courses', CourseViewSet)
router.register('lessons', LessonViewSet)
router.register('quiz', QuizViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('generate_course/', generate_course, name='generate_course'),
    path('generate_course_structured/', generate_course_structured, name='generate_course_structured'),
    path('generate_dummy_course/', generate_dummy_course, name='generate_dummy_course'),
    path('generate_course_lesson/', generate_course_lesson, name='generate_course_lesson'),
    path('generate_quiz/', generate_quiz, name="generate_quiz")
]

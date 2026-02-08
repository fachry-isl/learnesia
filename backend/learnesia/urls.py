from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, 
    LessonViewSet, 
    QuizViewSet, 
    QuizQuestionViewset, 
    QuestionOptionViewset
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'lessons', LessonViewSet, basename='lesson')
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'quiz-questions', QuizQuestionViewset, basename='quiz-question')
router.register(r'question-options', QuestionOptionViewset, basename='question-option')

urlpatterns = [
    path('', include(router.urls)),
]

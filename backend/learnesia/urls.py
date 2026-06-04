from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet,
    ModuleViewSet,
    LessonViewSet,
    ContentBlockViewSet,
    ReferenceViewSet,
    LessonCitationViewSet,
    QuizViewSet,
    QuizQuestionViewset,
    QuestionOptionViewset,
    LessonFeedbackViewSet,
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'lessons', LessonViewSet, basename='lesson')
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'quiz-questions', QuizQuestionViewset, basename='quiz-question')
router.register(r'question-options', QuestionOptionViewset, basename='question-option')
router.register(r'lesson-feedbacks', LessonFeedbackViewSet, basename='lesson-feedback')
router.register(r'references', ReferenceViewSet, basename='reference')

module_list = ModuleViewSet.as_view({'get': 'list', 'post': 'create'})
module_detail = ModuleViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy',
})

content_block_list = ContentBlockViewSet.as_view({'get': 'list', 'post': 'create'})
content_block_detail = ContentBlockViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy',
})

citation_list = LessonCitationViewSet.as_view({'get': 'list', 'post': 'create'})
citation_detail = LessonCitationViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy',
})

lesson_sources = LessonCitationViewSet.as_view({'get': 'sources'})

urlpatterns = [
    path(
        'courses/<slug:course_slug>/modules/',
        module_list,
        name='course-module-list',
    ),
    path(
        'courses/<slug:course_slug>/modules/<int:pk>/',
        module_detail,
        name='course-module-detail',
    ),
    path(
        'lessons/<int:lesson_pk>/content-blocks/',
        content_block_list,
        name='lesson-content-block-list',
    ),
    path(
        'lessons/<int:lesson_pk>/content-blocks/<int:pk>/',
        content_block_detail,
        name='lesson-content-block-detail',
    ),
    path(
        'lessons/<int:lesson_pk>/citations/',
        citation_list,
        name='lesson-citation-list',
    ),
    path(
        'lessons/<int:lesson_pk>/citations/<int:pk>/',
        citation_detail,
        name='lesson-citation-detail',
    ),
    path(
        'lessons/<int:lesson_pk>/sources/',
        lesson_sources,
        name='lesson-sources',
    ),
    path('', include(router.urls)),
]

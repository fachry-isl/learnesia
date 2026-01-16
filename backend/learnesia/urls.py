from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, LessonViewSet, generate_course, generate_dummy_course

router = DefaultRouter()
router.register('courses', CourseViewSet)
router.register('lessons', LessonViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('generate_course/', generate_course, name='generate_course'),
    path('generate_dummy_course/', generate_dummy_course, name='generate_dummy_course')
]

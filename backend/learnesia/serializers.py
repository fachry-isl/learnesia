from rest_framework import serializers
from .models import Course, Lesson, Quiz

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

    lessons = LessonSerializer(many=True, read_only=True)

class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model=Quiz
        fields = '__all__'
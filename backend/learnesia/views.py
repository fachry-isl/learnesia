# Django Essential
from rest_framework import viewsets
from .models import Course, Lesson
from .serializers import CourseSerializer, LessonSerializer

# Gemini API
from rest_framework.decorators import api_view
from rest_framework.response import Response
from google import genai
from rest_framework import status
import os
from dotenv import load_dotenv

# Load environment variable
load_dotenv()

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer


@api_view(['POST'])
def gemini_api_call(request):
    try:
        user_message = request.data.get('message')
        
        if not user_message:
            return Response(
                {'error': 'Message is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get API key
        api_key = os.environ.get('GEMINI_API_KEY')
        
        # Initialize client with new syntax
        client = genai.Client(api_key=api_key)
        
        # Generate response
        response = client.models.generate_content(
            model='gemini-2.0-flash-exp',
            contents=user_message
        )
        
        return Response({
            'user_message': user_message,
            'bot_response': response.text
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['POST'])
def generate_course(request):
    return Response(
        {"course_name":"Artificial Intelligence Fundamentals (Dummy)","course_learning_objectives":"Understand AI basics (Dummy Change),Understanding Machine Learning (basics),Understanding the application of Neural Networks","course_description":"A comprehensive introduction to AI concepts and applications","lessons":[{"lesson_name":"Introduction to AI","learning_objectives":"Learn what AI is and its applications"},{"lesson_name":"Machine Learning Basics","learning_objectives":"Understand supervised and unsupervised learning"},{"lesson_name":"Neural Networks","learning_objectives":"Learn how neural networks work and their applications"}]}
    , status=status.HTTP_200_OK)
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

# Langchain and Structured Output
from pydantic import BaseModel, Field
from langchain.chat_models import init_chat_model
from typing import Dict, Any, List, Optional, Mapping

# Load environment variable
load_dotenv()

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer

    

@api_view(['POST'])
def generate_dummy_course(request):
    return Response(
        {
            "course_name": "Artificial Intelligence Fundamentals (Dummy)",
            "course_learning_objectives": [
                "Understand AI basics (Dummy Change)",
                "Understanding Machine Learning (basics)",
                "Understanding the application of Neural Networks"
            ],
            "course_description": "A comprehensive introduction to AI concepts and applications",
            "lessons": [
                {
                    "lesson_name": "Introduction to AI",
                    "lesson_learning_objectives": [
                        "Learn what AI is and its applications",
                        "Understand the history and evolution of AI"
                    ]
                },
                {
                    "lesson_name": "Machine Learning Basics",
                    "lesson_learning_objectives": [
                        "Understand supervised and unsupervised learning",
                        "Learn about common ML algorithms"
                    ]
                },
                {
                    "lesson_name": "Neural Networks",
                    "lesson_learning_objectives": [
                        "Learn how neural networks work and their applications",
                        "Understand backpropagation and training processes"
                    ]
                }
            ]
        },
        status=status.HTTP_200_OK
    )



# Generate Course Endpoint
## Define Class for Structured Output
# Create structured output for learning roadmap
class LessonStructure(BaseModel):
    """
    Represents a single lesson in the subject
    """
    lesson_name: str = Field(..., description="The name of the module")
    lesson_learning_objectives: List[str] = Field(..., description="A list of learning objective of the lesson")
        
class CourseStructure(BaseModel):
    """
    Represents roadmap for specific subject
    """
    course_name: str = Field(..., description="The name of the main subject")
        
    # Specific learning objective that this roadmap accomplish
    course_learning_objectives: List[str] = Field(..., description="A list of learning objective of the course") 

    # Course Description
    course_description: str = Field(..., description="A short description of the course")
        
    # A single roadmap can consist of multiple module.
    lessons: List[LessonStructure]

## Define generate course endpoint
@api_view(['POST'])
def generate_course(request):
    try:
        user_message = request.data.get('prompt')
        print(user_message)
        
        if not user_message:
            return Response(
                {'error': 'Prompt is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        model = init_chat_model("gemini-2.0-flash", model_provider="google_genai", temperature=0)
        structured_llm = model.with_structured_output(schema=CourseStructure)

        result = structured_llm.invoke(user_message)

        
        return Response({
            'query': user_message,
            'response': result.model_dump_json()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
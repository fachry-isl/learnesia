# Django Essential
from rest_framework import viewsets
from .models import Course, Lesson
from .serializers import CourseSerializer, LessonSerializer

# Gemini API
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from dotenv import load_dotenv

# Langchain and Structured Output
from pydantic import BaseModel, Field
from langchain.chat_models import init_chat_model
from typing import List

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
        prompt = request.data.get('prompt')
        print(prompt)
        
        if not prompt:
            return Response(
                {'error': 'Prompt is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        model = init_chat_model("gemini-2.0-flash", model_provider="google_genai", temperature=0)
        structured_llm = model.with_structured_output(schema=CourseStructure)
        result = structured_llm.invoke(prompt)
        
        # Convert Pydantic model to dict
        course_data = result.model_dump()
        
        # Add order field to each lesson based on list position
        for index, lesson in enumerate(course_data['lessons'], start=1):
            lesson['order'] = index
        
        return Response({
            'query': prompt,
            'response': course_data  # Return dict instead of JSON string
        }, status=200)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    

## Define generate structured course endpoint
@api_view(['POST'])
def generate_course_structured(request):
    try:
        # Required parameters
        topic = request.data.get('topic')
        
        # Enhanced parameters with defaults
        num_modules = request.data.get('num_modules', "4 to 7")
        target_audience = request.data.get('target_audience', 'general learners')
        difficulty_level = request.data.get('difficulty_level', 'beginner to intermediate')
        learning_objectives = request.data.get('learning_objectives', '')
        course_duration = request.data.get('course_duration', '')
        prerequisites = request.data.get('prerequisites', 'none')
        language = request.data.get('language', 'Indonesian')
        
        if not topic:
            return Response({'error': 'topic is required'}, status=400)
        
        model = init_chat_model("gemini-2.0-flash", model_provider="google_genai", temperature=0)
        structured_llm = model.with_structured_output(schema=CourseStructure)

        prompt = f"""
        # Role
        You are a Syllabus Agent creating comprehensive learning roadmaps.

        # Input Parameters
        * Main Topic: {topic}
        * Target Audience: {target_audience}
        * Difficulty Level: {difficulty_level}
        * Prerequisites: {prerequisites}
        * Number of Modules: {num_modules}
        * Course Duration: {course_duration if course_duration else 'flexible'}
        * Learning Objectives: {learning_objectives if learning_objectives else 'to be determined based on topic'}

        # Requirements
        1. Create {num_modules} sequential modules progressing from foundational to advanced
        2. Tailor content complexity to {difficulty_level} level
        3. Assume students have: {prerequisites}
        4. Each module should:
           - Have clear title and description
           - Specify learning outcomes (what students will be able to DO)
           - Indicate estimated time to complete
        5. Ensure logical progression considering target audience's background
        
        # Output Language
        {language}
        """
        
        result = structured_llm.invoke(prompt)
        
        # Convert Pydantic model to dict
        course_data = result.model_dump()
        
        # Add order field to each lesson based on list position
        for index, lesson in enumerate(course_data['lessons'], start=1):
            lesson['order'] = index
        
        return Response({
            'query': prompt,
            'response': course_data  # Return dict instead of JSON string
        }, status=200)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

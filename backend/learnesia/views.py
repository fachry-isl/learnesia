# Django Essential
from rest_framework import viewsets
from .models import Course, Lesson, Quiz
from .serializers import CourseSerializer, LessonSerializer, QuizSerializer, QuizDetailSerializer, QuizQuestion, QuizQuestionSerializer,QuestionOption, QuestionOptionSerializer
from django.db.models import Prefetch


# Gemini API
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from dotenv import load_dotenv

# Langchain and Structured Output
from pydantic import BaseModel, Field
from langchain.chat_models import init_chat_model
from typing import List, Optional



# Load environment variable
load_dotenv()

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer

class QuizQuestionViewset(viewsets.ModelViewSet):
    queryset = QuizQuestion.objects.all()
    serializer_class=QuizQuestionSerializer

    def destroy(self, request, *args, **kwargs):
        """Custom delete response for quiz questions"""
        instance = self.get_object()  # Get the object before deleting
        question_id = instance.id
        question_text = instance.question_text[:50]  # First 50 chars
        
        # Perform the deletion
        self.perform_destroy(instance)
        
        # Return custom response
        return Response(
            {
                'message': f'Successfully deleted Question with ID {question_id}',
                'deleted_question': question_text
            },
            status=status.HTTP_200_OK
        )

class QuestionOptionViewset(viewsets.ModelViewSet):
    queryset = QuestionOption.objects.all()
    serializer_class=QuestionOptionSerializer

    def destroy(self, request, *args, **kwargs):
        """Custom delete response for quiz questions"""
        instance = self.get_object()  # Get the object before deleting
        option_id = instance.id
        option_text = instance.option_text[:50]  # First 50 chars
        
        # Perform the deletion
        self.perform_destroy(instance)
        
        # Return custom response
        return Response(
            {
                'message': f'Successfully deleted Option with ID {option_id}',
                'deleted_question': option_text
            },
            status=status.HTTP_200_OK
        )

class QuizViewSet(viewsets.ModelViewSet):
    """
    Usage: 
    Get All Quiz - /api/quiz/
    Get Specific Quiz by Lesson ID - /api/quiz/?lesson={id}
    Get Specific Quiz by Lesson ID (Detailed) - /api/quiz/?lesson={id}&?detail=full
    """
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

    def get_serializer_class(self):
        detail_level = self.request.query_params.get('detail', 'simple')

        # Use detailed serializer for POST/PUT
        if self.action in ['create', 'update', 'partial_update']:
            return QuizDetailSerializer

        if detail_level == "full":
            return QuizDetailSerializer
        return QuizSerializer

    def get_queryset(self):
        """
        Optionally filter quizzes by lesson ID via query parameter
        Usage: /api/quiz/?lesson=202
        """
        queryset = Quiz.objects.all()
        lesson_id = self.request.query_params.get('lesson', None)


        detail_level = self.request.query_params.get('detail', 'simple')
        
        if lesson_id is not None:
            queryset = queryset.filter(lesson_id=lesson_id)


        if detail_level == 'full':
            # Fetch all related data in optimized queries
            queryset = queryset.prefetch_related(
                Prefetch(
                    'questions',
                    queryset=QuizQuestion.objects.order_by('order').prefetch_related('options')
                )
            )
        elif detail_level == 'questions':
            # Just questions, no options
            queryset = queryset.prefetch_related('questions')


        return queryset



    

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
        model = init_chat_model("gemini-2.5-flash", model_provider="google_genai", temperature=0)
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
    

## Define generate course lesson
@api_view(['POST'])
def generate_course_lesson(request):
    try:
        # The overview of Course Structure for model to reason about
        course_structure = request.data.get('course_structure')

        # Generate specific lesson topic out of entire learning roadmap
        lesson_topic = request.data.get('lesson_topic')

        print(f"Generating Lesson: {lesson_topic}")

        prompt = f"""
        ## Role
        You are a Lesson creator agent, your job is to craft specific part of learning lesson topic from an entire Course Sylabus.

        ## Behaviour
        - Make it logically sound and has flow. For example instead of jumping into "why", start with "what" to introduce the topic first to the user. 
        - Generate around 600 words or 5 minutes reading content.
        - Avoid technical jargon and make it relevant and easy to understand for beginner
        - For concept word like budgeting try use english instead of translate it to bahasa. For example "budgeting" instead of "anggaran" to avoid confusion.

        ## Output Format
        # Lesson Topic
        [Module Content]

        Input:
        ## Lesson Topic
        {lesson_topic}

        ## Course Sylabus
        {course_structure}
        """

        model = init_chat_model("gemini-2.5-flash", model_provider="google_genai", temperature=0)
        response = model.invoke(prompt)

        return Response({
            'prompt': prompt,
            'response': response.model_dump()
        }, status=200)
    
    except Exception as e:
        return Response({'error': str(e)}, status=500)

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



# Quiz Generation
class QuestionOptionStructure(BaseModel):
    """
    Represents a single answer option for a quiz question
    """
    option_text: str = Field(..., description="The text of the answer option")
    is_correct: bool = Field(..., description="Whether this option is the correct answer")
    order: int = Field(default=0, description="Display order of the option")

class QuizQuestionStructure(BaseModel):
    """
    Represents a single question in the quiz
    """
    question_text: str = Field(..., description="The text of the question")
    explanation: Optional[str] = Field(
        None, 
        description="Explanation shown when answer is wrong or after completion"
    )
    options: List[QuestionOptionStructure] = Field(
        ..., 
        min_length=2,
        description="List of answer options (minimum 2, typically 4 for multiple choice)"
    )
    order: int = Field(default=0, description="Display order of the question in the quiz")

class QuizStructure(BaseModel):
    """
    Represents a complete quiz for a lesson
    """
    quiz_title: str = Field(..., description="The title of the quiz")
    quiz_description: Optional[str] = Field(
        None, 
        description="A brief description of what the quiz covers"
    )
    questions: List[QuizQuestionStructure] = Field(
        ..., 
        min_length=1,
        description="List of questions in the quiz"
    )
@api_view(['POST'])
def generate_quiz(request):
    """
    Generate a quiz for a specific lesson using AI
    
    Request body:
    {   
        "lesson_summary": Lesson Name and Learning Objectives
        "prompt": "Create a quiz about Python basics with 5 questions",
        "num_questions": 3,  # optional
        "num_options": 4     # optional, default 4 for multiple choice
    }
    """
    try:
        lesson_summary = request.data.get('lesson_summary')
        prompt = request.data.get('prompt')
        num_questions = request.data.get('num_questions', 3)
        num_options = request.data.get('num_options', 4)
        
        # Validation        
        if not prompt:
            return Response(
                {'error': 'Prompt is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Enhanced prompt with context
        enhanced_prompt = f"""
        {prompt}
        
        Generate a quiz with exactly {num_questions} questions.
        Each question should have {num_options} answer options.
        Ensure only ONE option per question is marked as correct (is_correct=True).
        Provide clear explanations for why the correct answer is right.
        
        Context: This quiz is for the lesson "{lesson_summary}".
        """
        
        # Initialize model and get structured output
        model = init_chat_model(
            "gemini-2.5-flash", 
            model_provider="google_genai", 
            temperature=0.7  # Slightly higher for creative question generation
        )
        structured_llm = model.with_structured_output(schema=QuizStructure)
        result = structured_llm.invoke(enhanced_prompt)
        
        # Convert Pydantic model to dict
        quiz_data = result.model_dump()
        
        # Add order fields based on list positions
        for q_index, question in enumerate(quiz_data['questions'], start=1):
            question['order'] = q_index
            for o_index, option in enumerate(question['options'], start=1):
                option['order'] = o_index
        
        return Response({
            'lesson_summary': lesson_summary,
            'query': prompt,
            'response': quiz_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

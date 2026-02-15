# Django Essential
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Prefetch
from django_filters.rest_framework import DjangoFilterBackend

# Models and Serializers
from .models import Course, Lesson, Quiz, QuizQuestion, QuestionOption
from .serializers import (
    CourseSerializer, 
    CourseListSerializer,
    LessonSerializer, 
    QuizSerializer, 
    QuizDetailSerializer,
    QuizQuestionSerializer,
    QuestionOptionSerializer
)

# Langchain and Structured Output
from pydantic import BaseModel, Field
from langchain.chat_models import init_chat_model
from typing import List, Optional
from dotenv import load_dotenv

# Load environment variable
load_dotenv()


# ============================================================================
# Pydantic Models for Structured Output
# ============================================================================

class LessonStructure(BaseModel):
    """Represents a single lesson in the subject"""
    lesson_name: str = Field(..., description="The name of the module")
    lesson_learning_objectives: List[str] = Field(..., description="A list of learning objectives of the lesson")


class CourseStructure(BaseModel):
    """Represents roadmap for specific subject"""
    course_name: str = Field(..., description="The name of the main subject")
    course_learning_objectives: List[str] = Field(..., description="A list of learning objectives of the course") 
    course_description: str = Field(..., description="Write a very short course description (1–2 sentences, max 35 words) for the following course. Focus on target learner, level, key Excel skills, and work benefit. Use active voice, no fluff.")
    lessons: List[LessonStructure] = Field(..., description="List of lessons in the course")


class QuestionOptionStructure(BaseModel):
    """Represents a single answer option for a quiz question"""
    option_text: str = Field(..., description="The text of the answer option")
    is_correct: bool = Field(..., description="Whether this option is the correct answer")
    order: int = Field(default=0, description="Display order of the option")


class QuizQuestionStructure(BaseModel):
    """Represents a single question in the quiz"""
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
    """Represents a complete quiz for a lesson"""
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


# ============================================================================
# ViewSets
# ============================================================================

class CourseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Course objects.
    
    Provides CRUD operations and AI-powered course generation.
    
    Endpoints:
        GET /api/courses/ - List all courses
        POST /api/courses/ - Create a new course
        GET /api/courses/{id}/ - Retrieve a specific course
        PUT /api/courses/{id}/ - Update a course
        PATCH /api/courses/{id}/ - Partial update a course
        DELETE /api/courses/{id}/ - Delete a course
        POST /api/courses/generate/ - Generate course from simple prompt
        POST /api/courses/generate-structured/ - Generate with detailed parameters
        POST /api/courses/generate-dummy/ - Generate dummy course for testing
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    lookup_field='course_slug'

    def get_serializer_class(self):
        if self.action == 'list':
            return CourseListSerializer
        return CourseSerializer

    @action(detail=False, methods=['post'], url_path='generate')
    def generate(self, request):
        """
        Generate a course structure using AI based on a user prompt.
        
        Request Body:
            {
                "prompt": "Create a course about Python programming"
            }
        
        Returns:
            Response: JSON with generated course structure including:
                - query (str): The original prompt
                - response (dict): Structured course data with ordered lessons
        
        Status Codes:
            200: Success
            400: Missing prompt parameter
            500: AI generation error
        """
        try:
            prompt = request.data.get('prompt')
            
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
                'response': course_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], url_path='generate-structured')
    def generate_structured(self, request):
        """
        Generate a highly customized course structure with detailed parameters.
        
        Request Body:
            {
                "topic": "Machine Learning",  // REQUIRED
                "num_modules": "5 to 8",      // Optional, default: "4 to 7"
                "target_audience": "developers",  // Optional, default: "general learners"
                "difficulty_level": "intermediate",  // Optional, default: "beginner to intermediate"
                "learning_objectives": "Build ML models",  // Optional
                "course_duration": "4 weeks",  // Optional, default: flexible
                "prerequisites": "Python basics",  // Optional, default: "none"
                "language": "English"  // Optional, default: "Indonesian"
            }
        
        Returns:
            Response: JSON with generated structured course including ordered lessons
        
        Status Codes:
            200: Success
            400: Missing required 'topic' parameter
            500: AI generation error
        """
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
                return Response(
                    {'error': 'topic is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
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
                'response': course_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], url_path='generate-dummy')
    def generate_dummy(self, request):
        """
        Generate a dummy AI course structure for testing purposes.
        
        Returns a hardcoded course structure with 3 lessons about
        Artificial Intelligence fundamentals.
        
        Returns:
            Response: JSON with dummy course structure
        
        Status Codes:
            200: Success
        """
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


class LessonViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Lesson objects.
    
    Provides CRUD operations and AI-powered lesson content generation.
    
    Endpoints:
        GET /api/lessons/ - List all lessons
        POST /api/lessons/ - Create a new lesson
        GET /api/lessons/{id}/ - Retrieve a specific lesson
        PUT /api/lessons/{id}/ - Update a lesson
        PATCH /api/lessons/{id}/ - Partial update a lesson
        DELETE /api/lessons/{id}/ - Delete a lesson
        POST /api/lessons/generate/ - Generate detailed lesson content
    """
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer

    @action(detail=False, methods=['post'], url_path='generate')
    def generate(self, request):
        """
        Generate detailed lesson content for a specific topic within a course.
        
        Uses Gemini 2.5 Flash to create comprehensive lesson content (~600 words)
        tailored to beginners with logical flow and minimal jargon.
        
        Request Body:
            {
                "course_structure": "Overview of the entire course syllabus",
                "lesson_topic": "Specific lesson topic to generate"
            }
        
        Returns:
            Response: JSON with generated lesson content including:
                - prompt (str): Full prompt sent to AI
                - response (dict): AI model response with lesson content
        
        Behavior:
            - Generates ~600 words (5 minutes reading)
            - Logical flow from "what" to "why"
            - Beginner-friendly language
            - Uses English for technical terms
        
        Status Codes:
            200: Success
            500: AI generation error
        """
        try:
            # The overview of Course Structure for model to reason about
            course_structure = request.data.get('course_structure')
            
            # Generate specific lesson topic out of entire learning roadmap
            lesson_topic = request.data.get('lesson_topic')

            prompt = f"""
            ## Role
            You are a Lesson creator agent, your job is to craft specific part of learning lesson topic from an entire Course Syllabus.

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

            ## Course Syllabus
            {course_structure}
            """

            model = init_chat_model("gemini-2.5-flash", model_provider="google_genai", temperature=0)
            response = model.invoke(prompt)

            return Response({
                'prompt': prompt,
                'response': response.model_dump()
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class QuizViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Quiz objects with dynamic serialization and prefetching.
    
    Supports different detail levels (simple/full) and filtering by lesson ID.
    Automatically uses detailed serializer for create/update operations.
    Optimizes queries with prefetch_related for nested data.
    
    Query Parameters:
        lesson (int, optional): Filter quizzes by lesson ID
        detail (str, optional): Response detail level ('simple', 'full', 'questions')
            - simple: Basic quiz info without questions
            - full: Complete quiz with questions and options (prefetched)
            - questions: Quiz with questions only, no options
    
    Endpoints:
        GET /api/quizzes/ - List all quizzes
        GET /api/quizzes/?lesson={id} - Filter quizzes by lesson ID
        GET /api/quizzes/?lesson={id}&detail=full - Get detailed quiz with all questions and options
        POST /api/quizzes/ - Create a new quiz (uses QuizDetailSerializer)
        GET /api/quizzes/{id}/ - Retrieve a specific quiz
        PUT /api/quizzes/{id}/ - Update a quiz (uses QuizDetailSerializer)
        PATCH /api/quizzes/{id}/ - Partial update a quiz (uses QuizDetailSerializer)
        DELETE /api/quizzes/{id}/ - Delete a quiz
        POST /api/quizzes/generate/ - Generate AI-powered quiz
    """
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

    def get_serializer_class(self):
        """
        Determine which serializer to use based on action and detail parameter.
        
        Uses QuizDetailSerializer for:
        - Create, update, and partial_update actions
        - GET requests with detail=full parameter
        
        Returns:
            Serializer class: QuizDetailSerializer or QuizSerializer
        """
        detail_level = self.request.query_params.get('detail', 'simple')

        # Use detailed serializer for POST/PUT
        if self.action in ['create', 'update', 'partial_update']:
            return QuizDetailSerializer

        if detail_level == "full":
            return QuizDetailSerializer
        return QuizSerializer

    def get_queryset(self):
        """
        Filter and optimize queryset based on query parameters.
        
        Applies filtering by lesson ID and optimizes database queries
        using prefetch_related based on requested detail level.
        
        Query Parameters:
            lesson (int, optional): Filter quizzes by lesson ID
            detail (str, optional): Controls prefetching strategy
                - 'full': Prefetch questions ordered by 'order' with their options
                - 'questions': Prefetch only questions without options
                - 'simple' (default): No prefetching
        
        Returns:
            QuerySet: Filtered and optimized Quiz queryset
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

    @action(detail=False, methods=['post'], url_path='generate')
    def generate(self, request):
        """
        Generate an AI-powered quiz for a specific lesson.
        
        Creates a complete quiz with multiple-choice questions, options, and
        explanations using Gemini 2.5 Flash model. Automatically adds ordering
        to questions and options.
        
        Request Body:
            {
                "lesson_summary": "Lesson name and learning objectives",  // Required
                "prompt": "Create a quiz about Python basics",  // Required
                "num_questions": 5,  // Optional, default: 3
                "num_options": 4     // Optional, default: 4
            }
        
        Returns:
            Response: JSON with generated quiz structure including:
                - lesson_summary (str): Echoed lesson context
                - query (str): Original prompt
                - response (dict): Complete quiz with ordered questions and options
        
        AI Model Configuration:
            - Model: Gemini 2.5 Flash
            - Temperature: 0.7 (for creative question generation)
            - Constraints: Exactly ONE correct answer per question
        
        Status Codes:
            200: Success
            400: Missing required 'prompt' parameter
            500: AI generation error
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


class QuizQuestionViewset(viewsets.ModelViewSet):
    """
    ViewSet for managing QuizQuestion objects.
    
    Provides CRUD operations for quiz questions with optional filtering by quiz ID.
    Returns custom success messages on deletion.
    
    Endpoints:
        GET /api/quiz-questions/ - List all quiz questions
        GET /api/quiz-questions/?quiz={id} - Filter questions by quiz ID
        POST /api/quiz-questions/ - Create a new quiz question
        GET /api/quiz-questions/{id}/ - Retrieve a specific question
        PUT /api/quiz-questions/{id}/ - Update a question
        PATCH /api/quiz-questions/{id}/ - Partial update a question
        DELETE /api/quiz-questions/{id}/ - Delete a question
    """
    queryset = QuizQuestion.objects.all()
    serializer_class = QuizQuestionSerializer

    def get_queryset(self):
        """
        Filter quiz questions by quiz ID if provided in query parameters.
        
        Query Parameters:
            quiz (int, optional): Filter questions by quiz ID
        
        Returns:
            QuerySet: Filtered or all quiz questions
        """
        queryset = super().get_queryset()
        quiz_id = self.request.query_params.get('quiz')
        

        queryset = queryset.prefetch_related('options')

        if quiz_id:
            queryset = queryset.filter(quiz=quiz_id)

        return queryset

    def destroy(self, request, *args, **kwargs):
        """
        Delete a quiz question with custom success response.
        
        Returns:
            Response: JSON response with deletion confirmation and deleted question preview
        """
        instance = self.get_object()
        question_id = instance.id
        question_text = instance.question_text[:50]
        
        self.perform_destroy(instance)
        
        return Response(
            {
                'message': f'Successfully deleted Question with ID {question_id}',
                'deleted_question': question_text
            },
            status=status.HTTP_200_OK
        )


class QuestionOptionViewset(viewsets.ModelViewSet):
    """
    ViewSet for managing QuestionOption objects.
    
    Provides CRUD operations for quiz question options with custom deletion response.
    
    Endpoints:
        GET /api/question-options/ - List all question options
        POST /api/question-options/ - Create a new question option
        GET /api/question-options/{id}/ - Retrieve a specific option
        PUT /api/question-options/{id}/ - Update an option
        PATCH /api/question-options/{id}/ - Partial update an option
        DELETE /api/question-options/{id}/ - Delete an option
    """
    queryset = QuestionOption.objects.all()
    serializer_class = QuestionOptionSerializer

    def destroy(self, request, *args, **kwargs):
        """
        Delete a question option with custom success response.
        
        Returns:
            Response: JSON response with deletion confirmation and deleted option preview
        """
        instance = self.get_object()
        option_id = instance.id
        option_text = instance.option_text[:50]
        
        self.perform_destroy(instance)
        
        return Response(
            {
                'message': f'Successfully deleted Option with ID {option_id}',
                'deleted_option': option_text
            },
            status=status.HTTP_200_OK
        )

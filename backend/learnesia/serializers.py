from rest_framework import serializers
from .models import Course, Lesson, Quiz, QuestionOption, QuizQuestion

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = '__all__'


class LessonCompactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'course', 'lesson_name', 'lesson_learning_objectives', 'order', 'created_at']


class CourseSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    class Meta:
        model = Course
        fields = '__all__'

class CourseListSerializer(serializers.ModelSerializer):
    lessons = LessonCompactSerializer(many=True, read_only=True)
    class Meta:
        model = Course
        fields = '__all__'

class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model=Quiz
        fields = '__all__'


class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model=QuestionOption
        fields='__all__'
        extra_kwargs = {
            'question': {'read_only': True}  # ✅ Tell DRF to ignore 'question' during input
        }
    
class QuizQuestionSerializer(serializers.ModelSerializer):
    # To rename the column
    # quiz_id = serializers.IntegerField(source='quiz.id', read_only=True)
    # Declare the nested serializer for options
    options = QuestionOptionSerializer(many=True)

    class Meta:
        model=QuizQuestion
        fields='__all__'

    def create(self, validated_data):
        """
        1. Extract nested data (options)
        2. Create parent Instance (Question)
        3. Put options into parent Instance
        """

        print(validated_data)

        option_data = validated_data.pop('options')

        question = QuizQuestion.objects.create(**validated_data)

        for option_data in option_data:
            # This is for linking each option to specific Quiz Question.
            QuestionOption.objects.create(question=question, **option_data)
        
        return question


class QuizQuestionDetailSerializer(serializers.ModelSerializer):
    options = QuestionOptionSerializer(many=True)

    class Meta:
        model=QuizQuestion
        fields='__all__'
        extra_kwargs = {
            'quiz': {'read_only': True}  # Tell DRF to ignore 'quiz' during write
        }

class QuizDetailSerializer(serializers.ModelSerializer):
    questions = QuizQuestionDetailSerializer(many=True)

    class Meta:
        model=Quiz
        fields='__all__'

    def create(self, validated_data):
        """
        Creates a Quiz with nested Questions and Options.
        
        Flow:
        1. Extract nested data (questions)
        2. Create parent (Quiz)
        3. For each question:
        a. Extract its nested data (options)
        b. Create question linked to quiz
        c. For each option:
            - Create option linked to question
        """
        # Extract questions before creating Quiz
        print(validated_data)
        questions_data = validated_data.pop('questions')
        
        # Create Quiz with remaining data (lesson, title, description) without questions.
        quiz = Quiz.objects.create(**validated_data)
        
        # Process each question
        for question_data in questions_data:
            # Extract options before creating QuizQuestion
            options_data = question_data.pop('options')
            
            # Create question and link to quiz
            question = QuizQuestion.objects.create(
                quiz=quiz,
                **question_data  # question_text, explanation, order
            )
            
            # Process each option for this question
            for option_data in options_data:
                # Create option and link to question
                QuestionOption.objects.create(
                    question=question,
                    **option_data  # option_text, is_correct, order
                )

        return quiz       


    def update(self, instance, validated_data):
        """
        Updates a Quiz with nested Questions and Options.
        
        Key differences from create():
        1. You receive an existing 'instance' parameter (the Quiz object being updated)
        2. You need to handle DELETING old nested objects
        3. You need to handle UPDATING existing nested objects vs CREATING new ones
        """
        # Extract nested data
        questions_data = validated_data.pop('questions', None)
        
        # Update parent fields (quiz_title, quiz_description, etc.)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle nested questions (this is the complex part)
        if questions_data is not None:
            # Decision: Do you DELETE all old questions and recreate?
            # Or do you UPDATE existing ones?
            # This is your business logic choice
            
            # Option 1: Delete all old questions and recreate (simpler but loses data)
            instance.questions.all().delete()
            for question_data in questions_data:
                options_data = question_data.pop('options')
                question = QuizQuestion.objects.create(quiz=instance, **question_data)
                for option_data in options_data:
                    QuestionOption.objects.create(question=question, **option_data)
        
        return instance    
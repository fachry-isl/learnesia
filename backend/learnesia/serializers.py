from rest_framework import serializers
from .models import Course, Lesson, Quiz, QuestionOption, QuizQuestion

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


class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model=QuestionOption
        fields='__all__'
        extra_kwargs = {
            'question': {'read_only': True}  # ✅ Tell DRF to ignore 'question' during input
        }
    
class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model=QuizQuestion
        fields='__all__'

class QuizQuestionDetailSerializer(serializers.ModelSerializer):
    options = QuestionOptionSerializer(many=True)

    class Meta:
        model=QuizQuestion
        fields='__all__'
        extra_kwargs = {
            'quiz': {'read_only': True}  # ✅ Tell DRF to ignore 'quiz' during write
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
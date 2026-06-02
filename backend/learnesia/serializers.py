from rest_framework import serializers

from learnesia.content_blocks.registry import PayloadValidationError, validate_block_payload
from .models import (
    Course,
    Module,
    Lesson,
    ContentBlock,
    Quiz,
    QuestionOption,
    QuizQuestion,
    LessonFeedback,
)


class ContentBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentBlock
        fields = '__all__'
        extra_kwargs = {
            'lesson': {'read_only': True},
        }

    def validate(self, attrs):
        block_type = attrs.get('block_type')
        if block_type is None and self.instance is not None:
            block_type = self.instance.block_type

        payload = attrs.get('payload')
        if payload is None and self.instance is not None:
            payload = self.instance.payload

        if block_type is not None and payload is not None:
            try:
                attrs['payload'] = validate_block_payload(block_type, payload)
            except PayloadValidationError as exc:
                raise serializers.ValidationError({'payload': str(exc)}) from exc

        return attrs


class LessonSerializer(serializers.ModelSerializer):
    content_blocks = ContentBlockSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = '__all__'


class LessonCompactSerializer(serializers.ModelSerializer):
    content_blocks = ContentBlockSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = [
            'id',
            'module',
            'lesson_name',
            'lesson_slug',
            'lesson_learning_objectives',
            'order',
            'estimated_time',
            'created_at',
            'content_blocks',
        ]


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = '__all__'
        extra_kwargs = {
            'course': {'read_only': True},
        }


class ModuleCompactSerializer(serializers.ModelSerializer):
    lessons = LessonCompactSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'course', 'name', 'description', 'order', 'created_at', 'lessons']


class CourseSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = '__all__'


class CourseListSerializer(serializers.ModelSerializer):
    modules = ModuleCompactSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = '__all__'


class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = '__all__'


class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionOption
        fields = '__all__'
        extra_kwargs = {
            'question': {'read_only': True}
        }


class QuizQuestionSerializer(serializers.ModelSerializer):
    options = QuestionOptionSerializer(many=True)

    class Meta:
        model = QuizQuestion
        fields = '__all__'

    def create(self, validated_data):
        option_data = validated_data.pop('options')
        question = QuizQuestion.objects.create(**validated_data)
        for option in option_data:
            QuestionOption.objects.create(question=question, **option)
        return question


class QuizQuestionDetailSerializer(serializers.ModelSerializer):
    options = QuestionOptionSerializer(many=True)

    class Meta:
        model = QuizQuestion
        fields = '__all__'
        extra_kwargs = {
            'quiz': {'read_only': True}
        }


class QuizDetailSerializer(serializers.ModelSerializer):
    questions = QuizQuestionDetailSerializer(many=True)

    class Meta:
        model = Quiz
        fields = '__all__'

    def create(self, validated_data):
        questions_data = validated_data.pop('questions')
        quiz = Quiz.objects.create(**validated_data)
        for question_data in questions_data:
            options_data = question_data.pop('options')
            question = QuizQuestion.objects.create(quiz=quiz, **question_data)
            for option_data in options_data:
                QuestionOption.objects.create(question=question, **option_data)
        return quiz

    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if questions_data is not None:
            instance.questions.all().delete()
            for question_data in questions_data:
                options_data = question_data.pop('options')
                question = QuizQuestion.objects.create(quiz=instance, **question_data)
                for option_data in options_data:
                    QuestionOption.objects.create(question=question, **option_data)

        return instance


class LessonFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonFeedback
        fields = '__all__'

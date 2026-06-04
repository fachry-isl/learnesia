from rest_framework import serializers

from learnesia.content_blocks.registry import PayloadValidationError, validate_block_payload
from .models import (
    Course,
    Module,
    Lesson,
    ContentBlock,
    Reference,
    LessonCitation,
    Quiz,
    QuestionOption,
    QuizQuestion,
    LessonFeedback,
)


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


class QuizBlockWriteSerializer(serializers.ModelSerializer):
    questions = QuizQuestionDetailSerializer(many=True)

    class Meta:
        model = Quiz
        fields = ['quiz_title', 'quiz_description', 'questions']

    def create(self, validated_data):
        questions_data = validated_data.pop('questions')
        quiz = Quiz.objects.create(**validated_data)
        for question_data in questions_data:
            options_data = question_data.pop('options')
            question = QuizQuestion.objects.create(quiz=quiz, **question_data)
            for option_data in options_data:
                QuestionOption.objects.create(question=question, **option_data)
        return quiz


class ContentBlockSerializer(serializers.ModelSerializer):
    quiz = QuizBlockWriteSerializer(required=False, allow_null=True, write_only=True)

    class Meta:
        model = ContentBlock
        fields = ['id', 'lesson', 'order', 'block_type', 'payload', 'quiz', 'created_at']
        extra_kwargs = {
            'lesson': {'read_only': True},
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.quiz_id:
            data['quiz'] = QuizDetailSerializer(instance.quiz).data
        else:
            data['quiz'] = None
        return data

    def validate(self, attrs):
        block_type = attrs.get('block_type')
        if block_type is None and self.instance is not None:
            block_type = self.instance.block_type

        payload = attrs.get('payload')
        if payload is None and self.instance is not None:
            payload = self.instance.payload

        if block_type == 'quiz' and payload is None:
            attrs['payload'] = {}

        if block_type is not None and payload is not None:
            try:
                attrs['payload'] = validate_block_payload(block_type, payload)
            except PayloadValidationError as exc:
                raise serializers.ValidationError({'payload': str(exc)}) from exc

        if block_type == 'quiz' and self.instance is None and not attrs.get('quiz'):
            raise serializers.ValidationError({'quiz': 'Quiz data is required for quiz blocks.'})

        return attrs

    def create(self, validated_data):
        quiz_data = validated_data.pop('quiz', None)
        block = super().create(validated_data)

        if block.block_type == 'quiz' and quiz_data is not None:
            quiz_data['lesson'] = block.lesson
            quiz = QuizBlockWriteSerializer().create(quiz_data)
            block.quiz = quiz
            block.save(update_fields=['quiz'])

        return block


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


class ReferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reference
        fields = ['id', 'url', 'title', 'source_type', 'created_at']


class LessonCitationSerializer(serializers.ModelSerializer):
    reference = ReferenceSerializer(read_only=True)
    reference_id = serializers.PrimaryKeyRelatedField(
        queryset=Reference.objects.all(),
        source='reference',
        write_only=True,
    )

    class Meta:
        model = LessonCitation
        fields = [
            'id',
            'lesson',
            'reference',
            'reference_id',
            'role',
            'content_block',
            'order',
            'created_at',
        ]
        extra_kwargs = {
            'lesson': {'read_only': True},
        }


class LessonFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonFeedback
        fields = '__all__'

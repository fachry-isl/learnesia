import django.db.models.deletion
from django.db import migrations, models


def migrate_quizzes_to_content_blocks(apps, schema_editor):
    Quiz = apps.get_model('learnesia', 'Quiz')
    ContentBlock = apps.get_model('learnesia', 'ContentBlock')

    for quiz in Quiz.objects.all():
        if ContentBlock.objects.filter(quiz_id=quiz.id).exists():
            continue

        ContentBlock.objects.create(
            lesson_id=quiz.lesson_id,
            order=1,
            block_type='quiz',
            payload={},
            quiz_id=quiz.id,
        )


def reverse_migrate_quizzes_to_content_blocks(apps, schema_editor):
    ContentBlock = apps.get_model('learnesia', 'ContentBlock')
    ContentBlock.objects.filter(block_type='quiz').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('learnesia', '0016_schema_foundation'),
    ]

    operations = [
        migrations.AlterField(
            model_name='quiz',
            name='lesson',
            field=models.ForeignKey(
                db_column='lesson_id',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='quizzes',
                to='learnesia.lesson',
            ),
        ),
        migrations.RunPython(
            migrate_quizzes_to_content_blocks,
            reverse_migrate_quizzes_to_content_blocks,
        ),
    ]

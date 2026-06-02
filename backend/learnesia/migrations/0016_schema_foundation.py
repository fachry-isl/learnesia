import django.contrib.postgres.fields
import django.db.models.deletion
from django.db import migrations, models


def migrate_to_module_content_blocks(apps, schema_editor):
    Course = apps.get_model('learnesia', 'Course')
    Module = apps.get_model('learnesia', 'Module')
    Lesson = apps.get_model('learnesia', 'Lesson')
    ContentBlock = apps.get_model('learnesia', 'ContentBlock')

    for course in Course.objects.all():
        if course.status == 'template':
            course.status = 'draft'
            course.save(update_fields=['status'])

        module = Module.objects.create(
            course=course,
            name=course.course_name,
            description='',
            order=0,
        )

        for lesson in Lesson.objects.filter(course_id=course.id).order_by('order', 'id'):
            lesson.module_id = module.id
            lesson.save(update_fields=['module_id'])

            if lesson.lesson_content:
                ContentBlock.objects.create(
                    lesson_id=lesson.id,
                    order=0,
                    block_type='text',
                    payload={'markdown': lesson.lesson_content},
                )


def reverse_migrate_to_module_content_blocks(apps, schema_editor):
    Module = apps.get_model('learnesia', 'Module')
    ContentBlock = apps.get_model('learnesia', 'ContentBlock')
    Lesson = apps.get_model('learnesia', 'Lesson')

    for lesson in Lesson.objects.select_related('module').all():
        if lesson.module_id:
            lesson.course_id = lesson.module.course_id
            lesson.save(update_fields=['course_id'])

    ContentBlock.objects.all().delete()
    Module.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('learnesia', '0015_course_course_thumbnail'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='language',
            field=models.CharField(
                choices=[('id', 'Bahasa Indonesia'), ('en', 'English')],
                db_index=True,
                default='id',
                max_length=10,
            ),
        ),
        migrations.CreateModel(
            name='Module',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('order', models.PositiveIntegerField(db_index=True, default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='modules', to='learnesia.course')),
            ],
            options={
                'ordering': ['order'],
            },
        ),
        migrations.AddField(
            model_name='lesson',
            name='module',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='lessons',
                to='learnesia.module',
            ),
        ),
        migrations.CreateModel(
            name='ContentBlock',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.PositiveIntegerField(db_index=True, default=0)),
                ('block_type', models.CharField(
                    choices=[
                        ('text', 'Text'),
                        ('video', 'Video'),
                        ('quiz', 'Quiz'),
                        ('exercise', 'Exercise'),
                    ],
                    max_length=20,
                )),
                ('payload', models.JSONField(default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('lesson', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='content_blocks', to='learnesia.lesson')),
                ('quiz', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='content_blocks', to='learnesia.quiz')),
            ],
            options={
                'ordering': ['order'],
            },
        ),
        migrations.RunPython(
            migrate_to_module_content_blocks,
            reverse_migrate_to_module_content_blocks,
        ),
        migrations.AlterField(
            model_name='course',
            name='status',
            field=models.CharField(
                choices=[('draft', 'Draft'), ('published', 'Published')],
                db_index=True,
                default='draft',
                max_length=20,
            ),
        ),
        migrations.RemoveField(
            model_name='lesson',
            name='course',
        ),
        migrations.AlterField(
            model_name='lesson',
            name='module',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='lessons',
                to='learnesia.module',
            ),
        ),
    ]

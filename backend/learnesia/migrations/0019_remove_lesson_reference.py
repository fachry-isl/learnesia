from itertools import groupby

from django.db import migrations


def _lesson_reference_table_exists(schema_editor):
    tables = schema_editor.connection.introspection.table_names()
    return 'learnesia_lessonreference' in tables


def migrate_lesson_references(apps, schema_editor):
    if not _lesson_reference_table_exists(schema_editor):
        return

    LessonReference = apps.get_model('learnesia', 'LessonReference')
    Reference = apps.get_model('learnesia', 'Reference')
    LessonCitation = apps.get_model('learnesia', 'LessonCitation')

    legacy_refs = LessonReference.objects.all().order_by('lesson_id', 'id')
    for _lesson_id, group in groupby(legacy_refs, key=lambda row: row.lesson_id):
        for order, old in enumerate(group):
            reference = Reference.objects.create(
                url=old.reference_url,
                title=old.reference_title,
                source_type=old.reference_type,
                created_at=old.created_at,
            )
            LessonCitation.objects.create(
                lesson_id=old.lesson_id,
                reference_id=reference.id,
                role='supplementary',
                order=order,
                created_at=old.created_at,
            )


def reverse_migrate_lesson_references(apps, schema_editor):
    LessonReference = apps.get_model('learnesia', 'LessonReference')
    LessonCitation = apps.get_model('learnesia', 'LessonCitation')
    Reference = apps.get_model('learnesia', 'Reference')

    for citation in LessonCitation.objects.select_related('reference').filter(role='supplementary'):
        ref = citation.reference
        LessonReference.objects.create(
            lesson_id=citation.lesson_id,
            reference_title=ref.title,
            reference_url=ref.url,
            reference_type=ref.source_type,
            created_at=citation.created_at,
        )

    LessonCitation.objects.filter(role='supplementary').delete()
    Reference.objects.all().delete()


def remove_lesson_reference_table(apps, schema_editor):
    LessonReference = apps.get_model('learnesia', 'LessonReference')
    if _lesson_reference_table_exists(schema_editor):
        schema_editor.delete_model(LessonReference)


def recreate_lesson_reference_table(apps, schema_editor):
    LessonReference = apps.get_model('learnesia', 'LessonReference')
    if not _lesson_reference_table_exists(schema_editor):
        schema_editor.create_model(LessonReference)


class Migration(migrations.Migration):

    dependencies = [
        ('learnesia', '0018_reference_lesson_citation'),
    ]

    operations = [
        migrations.RunPython(migrate_lesson_references, reverse_migrate_lesson_references),
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.DeleteModel(name='LessonReference'),
            ],
            database_operations=[
                migrations.RunPython(
                    remove_lesson_reference_table,
                    recreate_lesson_reference_table,
                ),
            ],
        ),
    ]

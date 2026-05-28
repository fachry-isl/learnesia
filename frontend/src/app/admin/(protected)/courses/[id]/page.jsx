"use client";

import { useParams } from "next/navigation";
import CourseEditor from "@/components/admin/CourseEditor";

export default function CourseEditorPage() {
  const { id } = useParams();
  return <CourseEditor courseId={id} />;
}

import React from "react";
import CreateCourseTemplate from "./pages/admin/CreateCourseTemplate";
import CourseTemplateLibrary from "./pages/admin/CourseTemplateLibrary";

import CreateLesson from "./pages/admin/CreateLesson";
import AdminCourseLibrary from "./pages/admin/AdminCourseLibrary";
import { Toaster } from "react-hot-toast";
import CourseEditor from "./pages/admin/CourseEditor";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/public/Home";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import CourseLibrary from "./pages/public/CourseLibrary";
import CourseOverview from "./pages/public/CourseOverview";
import CourseLesson from "./pages/public/CourseLesson";
import PublicCourseLayout from "./layouts/PublicCourseLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import ProtectedRoute from "./pages/admin/ProtectedRoute";
import NotFound from "./pages/NotFound";

const App: React.FC = () => {
  const adminPath = (import.meta.env.VITE_ADMIN_PATH as string) || "/admin";

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      {/* Main Content - with left margin to account for fixed sidebar */}
      {/* THE ROUTER MAP */}
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<CourseLibrary />} />
          <Route path={`${adminPath}/login`} element={<AdminLogin />}></Route>

          <Route path="/course/:course_slug" element={<PublicCourseLayout />}>
            <Route index element={<CourseOverview />} />
            <Route
              path="/course/:course_slug/overview"
              element={<CourseOverview />}
            />
            <Route path="lesson/:lesson_slug" element={<CourseLesson />} />
          </Route>
        </Route>

        {/* Protected Admin Page */}
        <Route element={<ProtectedRoute />}>
          <Route path={adminPath} element={<AdminLayout />}>
            <Route index element={<AdminCourseLibrary />} />
            <Route path="courses" element={<AdminCourseLibrary />} />
            <Route path="courses/:id" element={<CourseEditor />} />{" "}
            {/* Dynamic Route */}
            <Route path="templates" element={<CourseTemplateLibrary />} />
            <Route path="create-template" element={<CreateCourseTemplate />} />
            <Route path="create-lesson" element={<CreateLesson />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;

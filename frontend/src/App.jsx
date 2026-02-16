import CreateCourseTemplate from "./pages/admin/CreateCourseTemplate";
import IntegrationSandbox from "./pages/admin/IntegrationSandbox";
import ContentContainer from "./pages/admin/ContentContainer";
import CourseTemplateLibrary from "./pages/admin/CourseTemplateLibrary";

import CreateLesson from "./pages/admin/CreateLesson";

import SidebarLessonItem from "./components/admin/SidebarLessonItem";
import AdminCourseLibrary from "./pages/admin/AdminCourseLibrary";
import { Toaster } from "react-hot-toast";
import CourseEditor from "./pages/admin/CourseEditor";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Home from "./pages/public/Home";
import SidebarContainer from "./components/admin/SidebarContainer";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import CourseLibrary from "./pages/public/CourseLibrary";
import CourseOverview from "./pages/public/CourseOverview";
import CourseLesson from "./pages/public/CourseLesson";
import PublicCourseLayout from "./layouts/PublicCourseLayout";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      {/* Main Content - with left margin to account for fixed sidebar */}
      {/* THE ROUTER MAP */}
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<CourseLibrary />} />

          <Route path="/course/:course_slug" element={<PublicCourseLayout />}>
            <Route index element={<CourseOverview />} />
            <Route
              path="/course/:course_slug/overview"
              element={<CourseOverview />}
            />
            <Route path="lesson/:lesson_id" element={<CourseLesson />} />
          </Route>
        </Route>
        {/* Will be Admin Login, but Live it Like this for now*/}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminCourseLibrary />} />
          <Route path="courses" element={<AdminCourseLibrary />} />
          <Route path="courses/:id" element={<CourseEditor />} />{" "}
          {/* Dynamic Route */}
          <Route path="templates" element={<CourseTemplateLibrary />} />
          <Route path="create-template" element={<CreateCourseTemplate />} />
          <Route path="create-lesson" element={<CreateLesson />} />
          <Route path="integration-sandbox" element={<IntegrationSandbox />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;

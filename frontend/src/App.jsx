import CreateCourseTemplate from "./pages/admin/CreateCourseTemplate";
import IntegrationSandbox from "./pages/admin/IntegrationSandbox";
import ContentContainer from "./pages/admin/ContentContainer";
import CourseTemplateLibrary from "./pages/admin/CourseTemplateLibrary";

import CreateLesson from "./pages/admin/CreateLesson";

import SidebarLessonItem from "./components/SidebarLessonItem";
import CourseLibrary from "./pages/admin/CourseLibrary";
import { Toaster } from "react-hot-toast";
import CourseEditor from "./pages/admin/CourseEditor";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Home from "./pages/public/Home";
import SidebarContainer from "./components/SidebarContainer";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Toaster />
      {/* Main Content - with left margin to account for fixed sidebar */}
      {/* THE ROUTER MAP */}
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
        </Route>
        {/* Will be Admin Login, but Live it Like this for now*/}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<CourseLibrary />} />
          <Route path="courses" element={<CourseLibrary />} />
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

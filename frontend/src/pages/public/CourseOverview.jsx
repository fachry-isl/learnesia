import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById } from "../../services/api";
import {
  Clock,
  CheckCircle,
  PlayCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const CourseOverview = () => {
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [expandedModules, setExpandedModules] = useState({});
  const { course_slug } = useParams();
  const navigate = useNavigate();

  // Refs for scroll-spy
  const sectionRefs = {
    overview: useRef(null),
    syllabus: useRef(null),
    certificate: useRef(null),
    instructor: useRef(null),
    accreditations: useRef(null),
    faqs: useRef(null),
  };

  const fetchCourseData = async (slug) => {
    try {
      setIsLoading(true);
      const response = await getCourseById(slug);

      if (response.lessons) {
        response.lessons = [...response.lessons].sort(
          (a, b) => a.order - b.order,
        );
      }

      setCourse(response);

      // Initialize module expansion
      if (response.lessons && response.lessons.length > 0) {
        setExpandedModules({ [response.lessons[0].id]: true });
      }
    } catch (error) {
      console.error("Error fetching course detail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData(course_slug);
  }, [course_slug]);

  // Scroll Spy Logic
  useEffect(() => {
    const handleScroll = () => {
      const threshold = 120; // Distance from top of viewport to trigger active section

      for (const [section, ref] of Object.entries(sectionRefs)) {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();

          // If the top of the section is near the threshold, or if we're inside the section
          if (rect.top <= threshold && rect.bottom > threshold) {
            setActiveSection(section);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading]);

  const scrollToSection = (sectionId) => {
    const ref = sectionRefs[sectionId];
    if (ref && ref.current) {
      window.scrollTo({
        top: ref.current.offsetTop - 100,
        behavior: "smooth",
      });
      setActiveSection(sectionId);
    }
  };

  const toggleModule = (id) => {
    setExpandedModules((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
        <div className="w-12 h-12 border-4 border-black border-t-black-500 rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-gray-500 uppercase tracking-widest text-sm">
          Preparing Your Course...
        </p>
      </div>
    );
  }

  if (!course) return null;

  // Extract skills from objectives or description for "Skills you'll gain"
  const skills = course.course_learning_objectives?.slice(0, 6).map((obj) => {
    const words = obj.split(" ");
    return words.length > 3 ? words.slice(0, 2).join(" ") : obj;
  }) || ["Habit Loops", "Productivity", "Behavior Change", "Consistency"];

  const navItems = [
    { id: "overview", label: "Overview" },
    { id: "syllabus", label: "Syllabus" },
    // { id: "certificate", label: "Certificate" },
    // { id: "instructor", label: "Instructor" },
    // { id: "accreditations", label: "Accreditations" },
    // { id: "faqs", label: "FAQs" },
  ];

  return (
    <div className="min-h-screen">
      {/* Top Header / Breadcrumbs */}
      <div className="border-b border-gray-100 py-4 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
          <span
            className="hover:text-black-600 cursor-pointer"
            onClick={() => navigate("/courses")}
          >
            Courses
          </span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900">{course.course_name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* LEFT SIDEBAR: STICKY NAVIGATION */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">
                  Contents
                </p>
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    className={`w-full text-left px-4 py-3 text-sm font-bold border-l-4 transition-all ${
                      activeSection === item.id
                        ? "border-black-500 text-gray-900 bg-black-50/50"
                        : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="pt-6">
                <button
                  onClick={() =>
                    navigate(
                      `/course/${course_slug}/lesson/${course.lessons[0]?.lesson_slug}`,
                    )
                  }
                  className="w-full py-4 bg-black text-white font-black rounded-xl shadow-xl shadow-gray-200 hover:bg-gray-900 hover:-translate-y-0.5 transition-all active:translate-y-0 uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  Start Learning
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT AREA */}
          <div className="lg:col-span-3 space-y-24 pb-32">
            {/* 1. OVERVIEW SECTION */}
            <section
              id="overview"
              ref={sectionRefs.overview}
              className="space-y-10"
            >
              <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-6">
                {course.course_name}
              </h2>
              <p className="text-lg leading-relaxed mb-8">
                {course.course_description}
              </p>
              {/* <div className="space-y-6">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                  Skills you'll gain
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:border-black-300 hover:text-black-600 transition-colors cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div> */}

              <div className="prose prose-lg max-w-none prose-headings:font-black prose-p:text-gray-600">
                <h3 className="text-2xl font-black text-gray-900 mt-12 mb-6">
                  By the end of this course, you'll be able to:
                </h3>
                <ul className="space-y-4 !pl-0">
                  {course.course_learning_objectives?.map((obj, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-4 list-none text-gray-700 font-medium italic text-sm"
                    >
                      <CheckCircle className="w-5 h-5 text-black shrink-0 mt-1" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 2. SYLLABUS SECTION */}
            <section
              id="syllabus"
              ref={sectionRefs.syllabus}
              className="space-y-10"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-4xl font-black text-gray-900 tracking-tight underline decoration-black-500/30 underline-offset-8">
                  Syllabus
                </h2>
                <button className="px-6 py-2.5 border-2 border-black-500 text-black-500 font-black rounded-full hover:bg-black-50 transition-all uppercase text-xs tracking-widest">
                  Download syllabus
                </button>
              </div>

              <div className="space-y-4">
                {course.lessons?.map((lesson, idx) => {
                  const isExpanded = expandedModules[lesson.id];
                  return (
                    <div
                      key={lesson.id}
                      className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 transition-colors shadow-sm"
                    >
                      {/* Module Header */}
                      <button
                        onClick={() => toggleModule(lesson.id)}
                        className={`w-full flex items-center justify-between p-6 text-left transition-colors ${isExpanded ? "bg-blue-50/20" : "bg-white"}`}
                      >
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold text-gray-900">
                            {lesson.lesson_name}
                          </h3>
                          <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {`${lesson.estimated_time} min`}
                            </span>
                            {/* <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />1 Intelligence
                              Unit
                            </span> */}
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {/* Module Content (Expanded) */}
                      {isExpanded && (
                        <div className="p-6 pt-0 space-y-6 bg-white border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
                          <div className="pt-6 space-y-4">
                            {/* <p className="text-sm text-gray-500 font-medium italic border-l-2 border-black-200 pl-4 py-1">
                                Explore the core principles and cognitive
                                frameworks required for this model.
                              </p> */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {lesson.lesson_learning_objectives
                                ?.filter(
                                  (o) => !o.toLowerCase().includes("time"),
                                )
                                .map((obj, i) => (
                                  <div
                                    key={i}
                                    className="flex gap-3 text-xs font-bold text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100"
                                  >
                                    <div className="w-5 h-5 bg-black-100 text-black-600 flex items-center justify-center rounded-full shrink-0 text-[10px]">
                                      {i + 1}
                                    </div>
                                    {obj}
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 3. CERTIFICATE SECTION */}
            {/* <section
              id="certificate"
              ref={sectionRefs.certificate}
              className="p-10 bg-gray-900 rounded-3xl text-white overflow-hidden relative group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-black-500/20 blur-[100px] -z-0"></div>
              <div className="relative z-10 space-y-6 max-w-lg">
                <span className="inline-block px-3 py-1 bg-black-600 font-black text-[10px] uppercase tracking-widest rounded">
                  Certified Excellence
                </span>
                <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-tight">
                  Validate Your Intelligence
                </h2>
                <p className="text-gray-400 font-medium leading-relaxed">
                  Upon completion, receive a verified digital certificate.
                  Showcase your commitment to professional growth and habit
                  mastery to your network.
                </p>
                <div className="flex gap-4 pt-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2 mx-auto">
                      <Award className="w-6 h-6 text-black-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-gray-400">
                      Shareable
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2 mx-auto">
                      <Globe className="w-6 h-6 text-black-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-gray-400">
                      Global
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-96 h-64 border-[20px] border-white/5 rounded-full group-hover:scale-110 transition-transform -z-0"></div>
            </section> */}

            {/* 4. INSTRUCTOR SECTION */}
            {/* <section
              id="instructor"
              ref={sectionRefs.instructor}
              className="space-y-10"
            >
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                Your Instructor
              </h2>
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-32 h-32 bg-gray-100 border-2 border-gray-200 rounded-2xl flex items-center justify-center text-4xl font-black italic shadow-xl">
                  AI
                </div>
                <div className="space-y-4 flex-1">
                  <h3 className="text-2xl font-black italic hover:text-black-600 transition-colors cursor-pointer">
                    Learnesia Protocol
                  </h3>
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                    Principal Generative Architect
                  </p>
                  <p className="text-gray-600 leading-relaxed font-medium line-clamp-3">
                    Our AI synthesizes thousands of research papers and expert
                    behavioral studies to deliver the most efficient,
                    impact-driven learning experience possible...
                  </p>
                  <button className="text-black-600 font-black text-sm uppercase tracking-widest border-b-2 border-black-600 hover:text-black-700 hover:border-black-700 transition-all">
                    View Full Profile
                  </button>
                </div>
              </div>
            </section> */}

            {/* 5. ACCREDITATIONS SECTION */}
            {/* <section
              id="accreditations"
              ref={sectionRefs.accreditations}
              className="space-y-10"
            >
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                Accreditations
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-center opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                  >
                    <ShieldCheck
                      className="w-12 h-12 mb-4 text-gray-400"
                      strokeWidth={1}
                    />
                    <span className="text-[10px] font-black text-gray-400 text-center uppercase">
                      Verified Protocol {i}
                    </span>
                  </div>
                ))}
              </div>
            </section> */}

            {/* 6. FAQS SECTION */}
            {/* <section
              id="faqs"
              ref={sectionRefs.faqs}
              className="space-y-10 pt-10 border-t border-gray-100"
            >
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                Common Inquiries
              </h2>
              <div className="space-y-6">
                {[
                  {
                    q: "Is this course beginner-friendly?",
                    a: "Yes, we start with the absolute fundamentals of habit neurology and build upwards.",
                  },
                  {
                    q: "How long do I have access?",
                    a: "Lifetime access is granted upon initialization. You can revisit modules anytime.",
                  },
                  {
                    q: "Is there a certification fee?",
                    a: "The digital certificate is included in the initial course access.",
                  },
                ].map((faq, i) => (
                  <div key={i} className="group">
                    <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-black-500" />
                      {faq.q}
                    </h4>
                    <p className="text-gray-500 font-medium pl-8 italic">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </section> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseOverview;

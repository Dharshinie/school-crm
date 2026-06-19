import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  UserProfile, 
  Student, 
  Translations, 
  BadgeLog, 
  Assignment, 
  Submission, 
  Communication, 
  GalleryItem, 
  LostAndFoundItem, 
  BlogPost, 
  PermissionSlip 
} from "../types";
import { DataService } from "../db";
import { 
  Plus, 
  UserPlus, 
  Award, 
  FileCheck, 
  Send, 
  Image as ImageIcon, 
  Sparkles, 
  User, 
  Clock, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  X,
  PlusCircle, 
  Languages, 
  Edit2, 
  CheckSquare, 
  Megaphone,
  Trash2
} from "lucide-react";

interface TeacherDashboardProps {
  currentUser: UserProfile;
  dict: Translations;
  students: Student[];
  fetchStudents: () => void;
}

export default function TeacherDashboard({ currentUser, dict, students, fetchStudents }: TeacherDashboardProps) {
  // Tabs for managing different segments
  const [activeSubTab, setActiveSubTab] = useState<"students" | "badges" | "homework" | "comms" | "noticeboards" | "reports">("students");

  const [badgeLogs, setBadgeLogs] = useState<BadgeLog[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [comms, setComms] = useState<Communication[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [lostFound, setLostFound] = useState<LostAndFoundItem[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [slips, setSlips] = useState<PermissionSlip[]>([]);

  // States: Student Registration/Edit
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studName, setStudName] = useState("");
  const [studRoll, setStudRoll] = useState("");
  const [studClass, setStudClass] = useState("Grade 5-A");
  const [studHouse, setStudHouse] = useState<"Red" | "Blue" | "Gold">("Red");
  const [studEmail, setStudEmail] = useState("");
  const [studAttendance, setStudAttendance] = useState(95);
  // Separate individual grades state
  const [gradeMath, setGradeMath] = useState("A");
  const [gradeSci, setGradeSci] = useState("A");
  const [gradeEng, setGradeEng] = useState("A");
  const [gradeSocial, setGradeSocial] = useState("A");

  // States: Badge log awarding
  const [badgeStudId, setBadgeStudId] = useState("");
  const [badgeTitle, setBadgeTitle] = useState("Math Genius");
  const [badgeIcon, setBadgeIcon] = useState("📐");
  const [badgeDesc, setBadgeDesc] = useState("");

  const BADGE_PRESETS = [
    { title: "Math Genius", icon: "📐", desc: "Awarded for outstanding achievements and scoring 100% in mathematics tests." },
    { title: "Perfect Attendance", icon: "📅", desc: "For showing absolute commitment with 100% attendance during the school term." },
    { title: "Outstanding Athlete", icon: "🏆", desc: "Awarded for displaying spectacular athletic performance and teamwork in sports tournaments." },
    { title: "Kindness Captain", icon: "❤️", desc: "For display of warm empathy, peer cooperation, and stellar conduct inside class halls." },
    { title: "Creative Writer", icon: "⭐", desc: "Awarded for penning excellent essays and contributing brilliant school blog entries." }
  ];

  // States: Assignments Homework
  const [assignTitle, setAssignTitle] = useState("");
  const [assignDesc, setAssignDesc] = useState("");
  const [assignSubject, setAssignSubject] = useState("Science");
  const [assignClass, setAssignClass] = useState("Grade 5-A");
  const [assignDueDate, setAssignDueDate] = useState("");

  // States: Homework grading
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [gradeValue, setGradeValue] = useState("A");
  const [feedbackText, setFeedbackText] = useState("");

  // States: Messenger Parent Communication
  const [msgParentEmail, setMsgParentEmail] = useState("");
  const [msgSelectedStudent, setMsgSelectedStudent] = useState("");
  const [msgText, setMsgText] = useState("");

  // States: Curated magazine blog curations
  const [blogTitle, setBlogTitle] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogStudentName, setBlogStudentName] = useState("");

  // States: Digital slips permissions
  const [slipTitle, setSlipTitle] = useState("");
  const [slipDesc, setSlipDesc] = useState("");
  const [slipDue, setSlipDue] = useState("");

  // States: Gallery uploads
  const [galleryImgUrl, setGalleryImgUrl] = useState("");
  const [galleryCaption, setGalleryCaption] = useState("");

  // States: Lost & found registry
  const [lfTitle, setLfTitle] = useState("");
  const [lfDesc, setLfDesc] = useState("");
  const [lfLoc, setLfLoc] = useState("");
  const [lfContact, setLfContact] = useState("");
  const [lfStatus, setLfStatus] = useState<"lost" | "found">("found");

  // States: AI Report cards
  const [reportStudentId, setReportStudentId] = useState("");
  const [reportLang, setReportLang] = useState("en");
  const [generatedReportText, setGeneratedReportText] = useState("");
  const [generatingReport, setGeneratingReport] = useState(false);

  // Sync core lists
  const syncCRMLists = async () => {
    try {
      const dbBadges = await DataService.getBadgeLogs();
      const dbAssignments = await DataService.getAssignments();
      const dbSubmissions = await DataService.getSubmissions();
      const dbComms = await DataService.getCommunications();
      const dbGallery = await DataService.getGallery();
      const dbLost = await DataService.getLostAndFound();
      const dbBlogs = await DataService.getBlogPosts();
      const dbSlips = await DataService.getPermissionSlips();

      setBadgeLogs(dbBadges);
      setAssignments(dbAssignments);
      setSubmissions(dbSubmissions);
      setComms(dbComms);
      setGallery(dbGallery);
      setLostFound(dbLost);
      setBlogs(dbBlogs);
      setSlips(dbSlips);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
    syncCRMLists();
  }, []);

  // Preset badge select triggers preset description fill
  const handleBadgePresetChange = (title: string) => {
    setBadgeTitle(title);
    const found = BADGE_PRESETS.find(p => p.title === title);
    if (found) {
      setBadgeIcon(found.icon);
      setBadgeDesc(found.desc);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studName || !studEmail || !studRoll) return;

    try {
      if (editingStudentId) {
        await DataService.updateStudent(editingStudentId, {
          name: studName,
          rollNo: studRoll,
          class: studClass,
          house: studHouse,
          guardianEmail: studEmail.toLowerCase().trim(),
          attendancePercentage: Number(studAttendance),
          academicGrades: {
            "Mathematics": gradeMath,
            "Science": gradeSci,
            "English": gradeEng,
            "Social Studies": gradeSocial
          }
        });
        setEditingStudentId(null);
      } else {
        const student: Student = {
          id: "st_" + Math.random().toString(36).substr(2, 9),
          name: studName,
          rollNo: studRoll,
          class: studClass,
          house: studHouse,
          guardianEmail: studEmail.toLowerCase().trim(),
          meritPoints: 50, // default initial
          attendancePercentage: Number(studAttendance),
          academicGrades: {
            "Mathematics": gradeMath,
            "Science": gradeSci,
            "English": gradeEng,
            "Social Studies": gradeSocial
          },
          createdAt: new Date().toISOString()
        };
        await DataService.createStudent(student);
      }
      // Reset forms
      setStudName("");
      setStudRoll("");
      setStudEmail("");
      setStudAttendance(95);
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditStudentClick = (s: Student) => {
    setEditingStudentId(s.id);
    setStudName(s.name);
    setStudRoll(s.rollNo);
    setStudClass(s.class);
    setStudHouse(s.house);
    setStudEmail(s.guardianEmail);
    setStudAttendance(s.attendancePercentage);
    setGradeMath(s.academicGrades["Mathematics"] || "A");
    setGradeSci(s.academicGrades["Science"] || "A");
    setGradeEng(s.academicGrades["English"] || "A");
    setGradeSocial(s.academicGrades["Social Studies"] || "A");
  };

  const handleDeleteStudent = async (id: string) => {
    if (confirm("Are you sure you want to delete this student folder?")) {
      await DataService.deleteStudent(id);
      fetchStudents();
    }
  };

  const handleAwardBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeStudId) return;

    const studentObj = students.find(s => s.id === badgeStudId);
    if (!studentObj) return;

    try {
      const log: BadgeLog = {
        id: "bl_" + Math.random().toString(36).substr(2, 9),
        studentId: badgeStudId,
        studentName: studentObj.name,
        badgeTitle,
        badgeIcon,
        description: badgeDesc || "No custom comment",
        awardedBy: currentUser.name,
        awardedById: currentUser.uid,
        awardedAt: new Date().toISOString()
      };

      await DataService.awardBadge(log);
      setBadgeStudId("");
      setBadgeDesc("");
      syncCRMLists();
      fetchStudents(); // points change
      alert(`Successfully awarded ${badgeTitle} to ${studentObj.name}!`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle || !assignDueDate) return;

    try {
      const assignment: Assignment = {
        id: "as_" + Math.random().toString(36).substr(2, 9),
        title: assignTitle,
        description: assignDesc,
        subject: assignSubject,
        class: assignClass,
        dueDate: assignDueDate,
        createdBy: currentUser.name,
        createdById: currentUser.uid,
        createdAt: new Date().toISOString()
      };

      await DataService.createAssignment(assignment);
      setAssignTitle("");
      setAssignDesc("");
      syncCRMLists();
      alert("New Homework assigned!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmissionId) return;

    try {
      await DataService.gradeSubmission(selectedSubmissionId, gradeValue, feedbackText);
      setSelectedSubmissionId(null);
      setFeedbackText("");
      syncCRMLists();
      alert("Submission scored!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText) return;

    const studentObj = students.find(s => s.id === msgSelectedStudent);

    try {
      const message: Communication = {
        id: "cm_" + Math.random().toString(36).substr(2, 9),
        senderId: currentUser.uid,
        senderName: `Teacher ${currentUser.name}`,
        senderRole: "teacher",
        recipientEmail: msgParentEmail ? msgParentEmail.toLowerCase().trim() : (studentObj?.guardianEmail.toLowerCase().trim() || ""),
        studentId: studentObj?.id || "",
        studentName: studentObj?.name || "",
        message: msgText,
        createdAt: new Date().toISOString()
      };

      await DataService.postMessage(message);
      setMsgText("");
      syncCRMLists();
    } catch (err) {
      console.error(err);
    }
  };

  // Gallery item posting
  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryImgUrl) return;

    try {
      const item: GalleryItem = {
        id: "gl_" + Math.random().toString(36).substr(2, 9),
        imageUrl: galleryImgUrl,
        caption: galleryCaption,
        postedBy: currentUser.name,
        createdAt: new Date().toISOString()
      };
      await DataService.addGalleryItem(item);
      setGalleryImgUrl("");
      setGalleryCaption("");
      syncCRMLists();
      alert("Gallery image added!");
    } catch (err) {
      console.error(err);
    }
  };

  // Lost & Found Noticeboard posting
  const handleAddLostFound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lfTitle || !lfContact) return;

    try {
      const item: LostAndFoundItem = {
        id: "lf_" + Math.random().toString(36).substr(2, 9),
        title: lfTitle,
        description: lfDesc,
        location: lfLoc,
        contact: lfContact,
        status: lfStatus as any,
        createdAt: new Date().toISOString()
      };
      await DataService.createLostAndFound(item);
      setLfTitle("");
      setLfDesc("");
      setLfLoc("");
      setLfContact("");
      syncCRMLists();
      alert("Noticeboard entry created!");
    } catch (err) {
      console.error(err);
    }
  };

  // Magazine & Blog entry posting
  const handleAddBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle || !blogContent || !blogStudentName) return;

    try {
      const post: BlogPost = {
        id: "bp_" + Math.random().toString(36).substr(2, 9),
        title: blogTitle,
        content: blogContent,
        studentAuthor: blogStudentName,
        teacherPoster: currentUser.name,
        teacherId: currentUser.uid,
        createdAt: new Date().toISOString()
      };
      await DataService.createBlogPost(post);
      setBlogTitle("");
      setBlogContent("");
      setBlogStudentName("");
      syncCRMLists();
      alert("School Magazine article successfully published!");
    } catch (err) {
      console.error(err);
    }
  };

  // Permission Slip generation
  const handleAddPermissionSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slipTitle || !slipDue) return;

    try {
      const slip: PermissionSlip = {
        id: "ps_" + Math.random().toString(36).substr(2, 9),
        title: slipTitle,
        description: slipDesc,
        dueDate: slipDue,
        signatures: {},
        createdAt: new Date().toISOString()
      };
      await DataService.createPermissionSlip(slip);
      setSlipTitle("");
      setSlipDesc("");
      syncCRMLists();
      alert("Digital parent consent slip dispatched!");
    } catch (err) {
      console.error(err);
    }
  };

  // Core Gemini progress reports service
  const generateProgressReportAI = async () => {
    if (!reportStudentId) return;
    setGeneratingReport(true);
    setGeneratedReportText("");

    const studentObj = students.find(s => s.id === reportStudentId);
    const relatedBadges = badgeLogs.filter(b => b.studentId === reportStudentId);

    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student: studentObj,
          badges: relatedBadges,
          language: reportLang
        })
      });

      const data = await response.json();
      if (data.error) {
        setGeneratedReportText("Failure: " + data.error);
      } else {
        setGeneratedReportText(data.report);
      }
    } catch (err: any) {
      setGeneratedReportText("Unexpected network issue. Loading backup report instead.");
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-6" id="teacher-dashboard-main">
      
      {/* Upper Tab Selector */}
      <div className="border-b border-stone-200">
        <nav className="flex flex-wrap gap-2 -mb-px">
          {[
            { id: "students", label: dict.students, icon: GraduationCap },
            { id: "badges", label: dict.badges, icon: Award },
            { id: "homework", label: dict.homeworkDropbox, icon: BookOpen },
            { id: "comms", label: dict.communication, icon: Send },
            { id: "noticeboards", label: "Noticeboards & Magazine", icon: Megaphone },
            { id: "reports", label: dict.generateReport, icon: Sparkles }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
               <motion.button
                whileHover={{ y: -1, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                key={tab.id}
                id={`subtab-${tab.id}`}
                onClick={() => { setActiveSubTab(tab.id as any); }}
                className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer font-display ${
                  activeSubTab === tab.id
                    ? "border-[#4A5D4E] text-[#4A5D4E]"
                    : "border-transparent text-stone-500 hover:text-stone-850 hover:border-stone-300"
                }`}
              >
                <IconComponent className="h-4 w-4" />
                {tab.label}
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Content panes based on Subtab */}
      <div className="mt-4">
        
        {/* TAB 1: Student Tracking */}
        {activeSubTab === "students" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="pane-students">
            
            {/* Student Registration Form */}
            <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm self-start">
              <h3 className="font-bold text-stone-850 flex items-center gap-1.5 border-b border-stone-200 pb-2 font-display">
                <UserPlus className="h-4 w-4 text-[#4A5D4E]" />
                {editingStudentId ? "Edit Student Record" : "Register Student"}
              </h3>
              
              <form onSubmit={handleStudentSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase mb-1">{dict.studentName}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arjun Verma"
                    value={studName}
                    onChange={(e) => setStudName(e.target.value)}
                    className="w-full p-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{dict.rollNo}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 05A01"
                      value={studRoll}
                      onChange={(e) => setStudRoll(e.target.value)}
                      className="w-full p-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{dict.classGroup}</label>
                    <select
                      value={studClass}
                      onChange={(e) => setStudClass(e.target.value)}
                      className="w-full p-2 text-sm border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="Grade 5-A">Grade 5-A</option>
                      <option value="Grade 6-B">Grade 6-B</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{dict.teamHouse}</label>
                    <select
                      value={studHouse}
                      onChange={(e) => setStudHouse(e.target.value as any)}
                      className="w-full p-2 text-sm border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="Red">Red Phoenix</option>
                      <option value="Blue">Blue Neptune</option>
                      <option value="Gold">Gold Pegasus</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{dict.attendance}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={studAttendance}
                      onChange={(e) => setStudAttendance(Number(e.target.value))}
                      className="w-full p-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase mb-1">{dict.guardianEmail}</label>
                  <input
                    type="email"
                    required
                    placeholder="parent@school.com"
                    value={studEmail}
                    onChange={(e) => setStudEmail(e.target.value)}
                    className="w-full p-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
                  />
                </div>

                {/* Subject grades layout */}
                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  <span className="block text-xs font-bold text-slate-600 uppercase mb-2">Subject Grades</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="block text-slate-500 mb-0.5">Maths</span>
                      <select value={gradeMath} onChange={(e) => setGradeMath(e.target.value)} className="w-full p-1 border border-slate-200 rounded bg-white">
                        {["A+", "A", "B+", "B", "C+", "C"].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <span className="block text-slate-500 mb-0.5">Science</span>
                      <select value={gradeSci} onChange={(e) => setGradeSci(e.target.value)} className="w-full p-1 border border-slate-200 rounded bg-white">
                        {["A+", "A", "B+", "B", "C+", "C"].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <span className="block text-slate-500 mb-0.5">English</span>
                      <select value={gradeEng} onChange={(e) => setGradeEng(e.target.value)} className="w-full p-1 border border-slate-200 rounded bg-white">
                        {["A+", "A", "B+", "B", "C+", "C"].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <span className="block text-slate-500 mb-0.5">Social Studies</span>
                      <select value={gradeSocial} onChange={(e) => setGradeSocial(e.target.value)} className="w-full p-1 border border-slate-200 rounded bg-white">
                        {["A+", "A", "B+", "B", "C+", "C"].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 p-2 bg-[#4A5D4E] hover:bg-[#5E7A67] text-white font-semibold text-xs rounded-lg transition duration-150 cursor-pointer active:scale-95"
                  >
                    {editingStudentId ? "Update Student" : "Submit Student Folder"}
                  </button>
                  {editingStudentId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingStudentId(null);
                        setStudName("");
                        setStudRoll("");
                        setStudEmail("");
                      }}
                      className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs"
                    >
                      {dict.cancel}
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Student Folders directory */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <h3 className="font-bold text-stone-850 border-b border-stone-200 pb-2 font-display">
                📁 Registered Student Folders ({students.length})
              </h3>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 border-b border-slate-100 font-extrabold uppercase text-[10px]">
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Class/Roll</th>
                      <th className="p-3">Affiliation</th>
                      <th className="p-3">Merit ( pts )</th>
                      <th className="p-3">Attendance</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((stud) => (
                      <tr key={stud.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-700">{stud.name}</td>
                        <td className="p-3">
                          <span className="block">{stud.class}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Roll: {stud.rollNo}</span>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                            stud.house === "Red" 
                              ? "bg-red-50 text-red-600 border-red-100" 
                              : stud.house === "Blue" 
                              ? "bg-blue-50 text-blue-600 border-blue-100" 
                              : "bg-amber-50 text-amber-600 border-amber-100"
                          }`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current block"></span>
                            {stud.house} Team
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-600">{stud.meritPoints} pts</td>
                        <td className="p-3 font-mono">
                          <span className={`${stud.attendancePercentage < 90 ? "text-rose-600 font-bold" : "text-slate-600"}`}>
                            {stud.attendancePercentage}%
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleEditStudentClick(stud)}
                            className="p-1 px-2 text-[#4A5D4E] border border-[#E9EDC9] hover:bg-[#E9EDC9]/50 rounded cursor-pointer transition active:scale-95"
                            title="Edit student metrics"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(stud.id)}
                            className="p-1 px-2 text-rose-600 border border-rose-100 hover:bg-rose-50 rounded"
                            title="Remove student"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Achievement Medal Logs */}
        {activeSubTab === "badges" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="pane-badges">
            
            {/* Award Medals Form */}
            <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm self-start">
              <h3 className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Award className="h-4.5 w-4.5 text-amber-500" />
                {dict.meritBadgeTitle}
              </h3>

              <form onSubmit={handleAwardBadge} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Select Student</label>
                  <select
                    value={badgeStudId}
                    onChange={(e) => setBadgeStudId(e.target.value)}
                    required
                    className="w-full p-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none"
                  >
                    <option value="">-- Choose student folder --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.class})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Badge Presets</label>
                  <select
                    onChange={(e) => handleBadgePresetChange(e.target.value)}
                    className="w-full p-2 text-sm border border-slate-200 rounded-lg bg-white"
                  >
                    {BADGE_PRESETS.map(p => (
                      <option key={p.title} value={p.title}>{p.icon} {p.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Badge Icon</label>
                    <input
                      type="text"
                      className="w-full p-2 text-center text-xl border border-slate-200 rounded-lg bg-slate-50"
                      value={badgeIcon}
                      onChange={(e) => setBadgeIcon(e.target.value)}
                      placeholder="⭐"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Badge Name</label>
                    <input
                      type="text"
                      className="w-full p-2 text-sm border border-slate-200 rounded-lg"
                      value={badgeTitle}
                      onChange={(e) => setBadgeTitle(e.target.value)}
                      placeholder="Custom Badge"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Accomplishment Citation</label>
                  <textarea
                    rows={3}
                    className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
                    placeholder="Award details..."
                    value={badgeDesc}
                    onChange={(e) => setBadgeDesc(e.target.value)}
                  ></textarea>
                </div>

                <p className="text-[10px] text-slate-500">
                  💡 Awarding achievement medals boosts their house team standings automatically!
                </p>

                <button
                  type="submit"
                  className="w-full p-2 bg-[#4A5D4E] hover:bg-[#5E7A67] text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition duration-150 cursor-pointer active:scale-95"
                >
                  <Plus className="h-4 w-4" /> Issue Medal Record
                </button>
              </form>
            </div>

            {/* Medal Logs table */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <h3 className="font-bold text-stone-850 border-b border-stone-200 pb-2 font-display">
                🎓 Historic Achievement Logs ({badgeLogs.length})
              </h3>

              <div className="divide-y divide-slate-100 mt-4 max-h-[420px] overflow-y-auto pr-1">
                {badgeLogs.map((log) => (
                  <div key={log.id} className="py-3 flex items-start gap-3">
                    <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-lg self-start">
                      {log.badgeIcon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-700 text-xs">{log.badgeTitle}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.awardedAt).toLocaleString()}
                        </span>
                      </div>
                      <span className="block text-xs font-semibold text-[#4A5D4E] mt-0.5">Awarded to: {log.studentName}</span>
                      <p className="text-xs text-slate-500 mt-1 italic leading-relaxed">
                        &ldquo;{log.description}&rdquo;
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-1">Awarded by: {log.awardedBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: Virtual Homework Dropbox */}
        {activeSubTab === "homework" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="pane-homework">
            
            {/* Create homework sheet */}
            <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm self-start">
              <h3 className="font-bold text-stone-850 flex items-center gap-1.5 border-b border-stone-200 pb-2 font-display">
                <FileText className="h-4.5 w-4.5 text-[#4A5D4E]" />
                Create Worksheet Set
              </h3>

              <form onSubmit={handleCreateAssignment} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Worksheet Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Quadratic Formula Problems"
                    value={assignTitle}
                    onChange={(e) => setAssignTitle(e.target.value)}
                    className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{dict.subject}</label>
                    <select
                      value={assignSubject}
                      onChange={(e) => setAssignSubject(e.target.value)}
                      className="w-full p-2 text-sm border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="Mathematics">Mathematics</option>
                      <option value="Science">Science</option>
                      <option value="English">English</option>
                      <option value="Social Studies">Social Studies</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{dict.classGroup}</label>
                    <select
                      value={assignClass}
                      onChange={(e) => setAssignClass(e.target.value)}
                      className="w-full p-2 text-sm border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="Grade 5-A">Grade 5-A</option>
                      <option value="Grade 6-B">Grade 6-B</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{dict.dueDate}</label>
                  <input
                    type="date"
                    required
                    value={assignDueDate}
                    onChange={(e) => setAssignDueDate(e.target.value)}
                    className="w-full p-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Worksheet Descriptions</label>
                  <textarea
                    rows={4}
                    value={assignDesc}
                    onChange={(e) => setAssignDesc(e.target.value)}
                    placeholder="Provide questions/problems list..."
                    className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full p-2 bg-[#4A5D4E] hover:bg-[#5E7A67] text-white font-semibold text-xs rounded-lg transition duration-150 cursor-pointer active:scale-95"
                >
                  Publish Worksheet Task
                </button>
              </form>
            </div>

            {/* Submissions dropbox panel */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-stone-850 border-b border-stone-200 pb-2 font-display">
                  📪 Virtual Dropbox Submission Box ({submissions.length})
                </h3>

                <div className="space-y-4 mt-4 max-h-[300px] overflow-y-auto pr-1">
                  {submissions.map((sub) => (
                    <div 
                      key={sub.id} 
                      className={`p-3.5 rounded-xl border transition cursor-pointer ${
                        selectedSubmissionId === sub.id 
                          ? "border-[#4A5D4E] bg-[#E9EDC9]/30" 
                          : "border-stone-200 hover:bg-stone-50"
                      }`}
                      onClick={() => {
                        setSelectedSubmissionId(sub.id);
                        setGradeValue(sub.grade || "A");
                        setFeedbackText(sub.feedback || "");
                      }}
                    >
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-slate-700">{sub.assignmentTitle}</span>
                        <div className="flex gap-1.5">
                          {sub.grade ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                              Graded: {sub.grade}
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                              Pending Evaluation
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-[#4A5D4E] block mt-0.5">Submitted By Student: {sub.studentName}</span>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">{sub.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedSubmissionId && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-6" id="grader-panel">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">Grade Answer Sheets</span>
                    <button onClick={() => setSelectedSubmissionId(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <form onSubmit={handleGradeSubmission} className="space-y-3">
                    <div className="flex gap-4">
                      <div className="w-24">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Grade Score</label>
                        <select
                          value={gradeValue}
                          onChange={(e) => setGradeValue(e.target.value)}
                          className="w-full p-1.5 text-sm border border-slate-200 rounded-lg bg-white"
                        >
                          {["A+", "A", "B+", "B", "C+", "C", "D", "Fail"].map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Feedback / Comments</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Magnificent derivation steps shown!"
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          className="w-full p-1.5 text-sm border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition"
                    >
                      Save Homework Grade
                    </button>
                  </form>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: Parent-Teacher Communication */}
        {activeSubTab === "comms" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="pane-comms">
            
            {/* Direct messaging dispatcher */}
            <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm self-start">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">
                ✉️ Draft Counselor Message
              </h3>

              <form onSubmit={handleSendMessage} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Target Student Folder</label>
                  <select
                    value={msgSelectedStudent}
                    onChange={(e) => {
                      setMsgSelectedStudent(e.target.value);
                      const s = students.find(x => x.id === e.target.value);
                      if (s) setMsgParentEmail(s.guardianEmail);
                    }}
                    required
                    className="w-full p-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none"
                  >
                    <option value="">-- Choose student folder --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.class})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Guardian Email Reference</label>
                  <input
                    type="email"
                    required
                    value={msgParentEmail}
                    onChange={(e) => setMsgParentEmail(e.target.value)}
                    placeholder="cooper.parent@school.com"
                    className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Message Content</label>
                  <textarea
                    rows={5}
                    required
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    placeholder="Enter communication text..."
                    className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full p-2 bg-[#4A5D4E] hover:bg-[#5E7A67] text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                >
                  <Send className="h-4 w-4" /> Dispatch Conversation
                </button>
              </form>
            </div>

            {/* Messaging Logs history */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-stone-850 border-b border-stone-200 pb-2 font-display">
                  📬 Inbox Communication Thread Logs ({comms.length})
                </h3>

                <div className="space-y-3.5 mt-4 max-h-[380px] overflow-y-auto pr-1">
                  {comms.map((c) => (
                    <div 
                      key={c.id} 
                      className={`p-3.5 rounded-xl border leading-relaxed ${
                        c.senderRole === "teacher" 
                          ? "bg-stone-50 border-stone-150 ml-4 md:ml-12" 
                          : "bg-[#E9EDC9]/20 border-stone-200 mr-4 md:mr-12"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-slate-400">
                        <span className={`uppercase font-mono tracking-wider ${c.senderRole === "teacher" ? "text-stone-500" : "text-[#4A5D4E]"}`}>
                          {c.senderName} ({c.senderRole})
                        </span>
                        <span>{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      {c.studentName && (
                        <span className="text-[10px] text-slate-500 block mt-0.5">Student context: <b>{c.studentName}</b></span>
                      )}
                      <p className="text-xs text-slate-600 mt-2">{c.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: Noticeboards & Magazine */}
        {activeSubTab === "noticeboards" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="pane-noticeboards">
            
            {/* School Magazine publisher and Permission slip */}
            <div className="space-y-6">
              
              {/* Blog and Magazine Form */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                <h3 className="font-bold text-stone-850 border-b border-stone-200 pb-2 flex items-center gap-1.5 font-display">
                  <BookOpen className="h-4.5 w-4.5 text-[#4A5D4E]" />
                  School Magazine & Student Blog Publisher
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Draft creative articles or reports. The student author name is prominently displayed below as credit.
                </p>

                <form onSubmit={handleAddBlog} className="space-y-3 mt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-0.5">Article Title</label>
                      <input
                        type="text"
                        required
                        value={blogTitle}
                        onChange={(e) => setBlogTitle(e.target.value)}
                        placeholder="My Botanical Science Exploration"
                        className="w-full p-1.5 text-xs border border-slate-200 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-0.5">Display Student Writer</label>
                      <input
                        type="text"
                        required
                        value={blogStudentName}
                        onChange={(e) => setBlogStudentName(e.target.value)}
                        placeholder="e.g. Arjun Verma"
                        className="w-full p-1.5 text-xs border border-slate-200 rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-0.5">Creative Content</label>
                    <textarea
                      rows={3}
                      required
                      value={blogContent}
                      onChange={(e) => setBlogContent(e.target.value)}
                      placeholder="Write blog text..."
                      className="w-full p-1.5 text-xs border border-slate-200 rounded focus:outline-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full p-1.5 bg-[#4A5D4E] hover:bg-[#5E7A67] text-white font-semibold text-xs rounded transition cursor-pointer active:scale-95"
                  >
                    Publish to School Magazine
                  </button>
                </form>
              </div>

              {/* Permission consent slip form */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                <h3 className="font-bold text-stone-850 border-b border-stone-200 pb-2 flex items-center gap-1.5 font-display">
                  <CheckSquare className="h-4.5 w-4.5 text-[#4A5D4E]" />
                  Release Digital Permission Slip
                </h3>

                <form onSubmit={handleAddPermissionSlip} className="space-y-3 mt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-0.5">Field Trip / Event Title</label>
                      <input
                        type="text"
                        required
                        value={slipTitle}
                        onChange={(e) => setSlipTitle(e.target.value)}
                        placeholder="e.g. Annual Swimming Gala Contest"
                        className="w-full p-1.5 text-xs border border-slate-200 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-0.5">Signing Due Date</label>
                      <input
                        type="date"
                        required
                        value={slipDue}
                        onChange={(e) => setSlipDue(e.target.value)}
                        className="w-full p-1.5 text-xs border border-slate-200 rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-0.5">Slip Details & Declarations</label>
                    <textarea
                      rows={2}
                      required
                      value={slipDesc}
                      onChange={(e) => setSlipDesc(e.target.value)}
                      placeholder="e.g. Annual field trip terms..."
                      className="w-full p-1.5 text-xs border border-slate-200 rounded focus:outline-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded transition1"
                  >
                    Dispatch Permission Consent Slip
                  </button>
                </form>
              </div>

            </div>

            {/* Gallery and Lost & found Posting */}
            <div className="space-y-6">
              
              {/* Gallery upload */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                <h3 className="font-bold text-stone-850 border-b border-stone-200 pb-2 flex items-center gap-1.5 font-display">
                  <ImageIcon className="h-4.5 w-4.5 text-[#4A5D4E]" />
                  School Life Photo Gallery
                </h3>

                <form onSubmit={handleAddGallery} className="space-y-3 mt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-0.5">Photo URL</label>
                      <input
                        type="url"
                        required
                        value={galleryImgUrl}
                        onChange={(e) => setGalleryImgUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/photo..."
                        className="w-full p-1.5 text-xs border border-slate-200 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-0.5">Brief description</label>
                      <input
                        type="text"
                        required
                        value={galleryCaption}
                        onChange={(e) => setGalleryCaption(e.target.value)}
                        placeholder="Arjun Verma receiving medal..."
                        className="w-full p-1.5 text-xs border border-slate-200 rounded"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full p-1.5 bg-[#4A5D4E] hover:bg-[#5E7A67] text-white font-semibold text-xs rounded transition cursor-pointer active:scale-95"
                  >
                    Post Photo Frame
                  </button>
                </form>
              </div>

              {/* Digital Lost & Found Noticeboard */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                <h3 className="font-bold text-stone-850 border-b border-stone-200 pb-2 flex items-center gap-1.5 font-display">
                  <Clock className="h-4.5 w-4.5 text-[#4A5D4E]" />
                  Digital Lost & Found Noticeboard
                </h3>

                <form onSubmit={handleAddLostFound} className="space-y-3 mt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-0.5">Item Title</label>
                      <input
                        type="text"
                        required
                        value={lfTitle}
                        onChange={(e) => setLfTitle(e.target.value)}
                        placeholder="Blue thermos flask / spectacles"
                        className="w-full p-1.5 text-xs border border-slate-200 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-0.5">Reporter Contact</label>
                      <input
                        type="text"
                        required
                        value={lfContact}
                        onChange={(e) => setLfContact(e.target.value)}
                        placeholder="Teacher sarah room 5B"
                        className="w-full p-1.5 text-xs border border-slate-200 rounded"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 mb-0.5">Location Found / Lost</label>
                      <input
                        type="text"
                        value={lfLoc}
                        onChange={(e) => setLfLoc(e.target.value)}
                        placeholder="Auditorium floor / library racks"
                        className="w-full p-1.5 text-xs border border-slate-200 rounded"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-slate-600 mb-0.5">Type Status</label>
                      <select
                        value={lfStatus}
                        onChange={(e) => setLfStatus(e.target.value as any)}
                        className="w-full p-1.5 text-xs border border-slate-200 rounded bg-white"
                      >
                        <option value="found">Found Item</option>
                        <option value="lost">Lost Item</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-0.5">Physical descriptions</label>
                    <textarea
                      rows={2}
                      value={lfDesc}
                      onChange={(e) => setLfDesc(e.target.value)}
                      placeholder="Any stickers or labels..."
                      className="w-full p-1.5 text-xs border border-slate-200 rounded focus:outline-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full p-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded transition"
                  >
                    Publish Lost & Found Alert
                  </button>
                </form>
              </div>

            </div>

          </div>
        )}

        {/* TAB 6: Automated AI Report Card Generation */}
        {activeSubTab === "reports" && (
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm" id="pane-reports">
            <h3 className="font-bold text-stone-850 border-b border-stone-200 pb-3 flex items-center gap-2 font-display">
              <Sparkles className="h-5 w-5 text-[#4A5D4E]" />
              {dict.generateReport}
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Generate descriptive comprehensive progress report sheets using the Gemini AI processor.
              The AI reviews academic indexes, attendance metrics, house standings contribution points represent, and awarded achievers logs.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Choose Student Folder</label>
                  <select
                    value={reportStudentId}
                    onChange={(e) => setReportStudentId(e.target.value)}
                    className="w-full p-2.5 text-sm border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="">-- Choose student folder --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.class})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Target Language Translation</label>
                  <select
                    value={reportLang}
                    onChange={(e) => setReportLang(e.target.value)}
                    className="w-full p-2.5 text-sm border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="en">English (Professional)</option>
                    <option value="ta">தமிழ் (Tamil Translation)</option>
                    <option value="hi">हिन्दी (Hindi Translation)</option>
                    <option value="ml">മലയാളം (Malayalam Translation)</option>
                  </select>
                </div>

                <button
                  onClick={generateProgressReportAI}
                  disabled={!reportStudentId || generatingReport}
                  className="w-full p-3 bg-[#4A5D4E] hover:bg-[#5E7A67] disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition cursor-pointer active:scale-95"
                >
                  {generatingReport ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" /> Analyzing stats with Gemini AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Start Report Compilation
                    </>
                  )}
                </button>
              </div>

              <div className="md:col-span-2 bg-stone-50 border border-stone-200 p-6 rounded-2xl min-h-[300px] flex flex-col justify-between">
                <div>
                  <span className="block text-xs font-bold text-stone-500 uppercase tracking-widest border-b border-stone-200 pb-1.5 mb-3 select-none">
                    Resulting Councelling Report Sheet
                  </span>
                  
                  {generatedReportText ? (
                    <div className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line space-y-2">
                      {generatedReportText}
                    </div>
                  ) : (
                    <div className="text-slate-400 text-xs italic text-center py-16">
                      Select student and click above to compile localized smart progress sheets.
                    </div>
                  )}
                </div>

                {generatedReportText && (
                  <button 
                    onClick={() => { window.print(); }} 
                    className="self-end px-3 py-1.5 text-xs font-bold text-[#4A5D4E] bg-[#E9EDC9]/60 border border-[#4A5D4E]/20 rounded-lg cursor-pointer hover:bg-[#E9EDC9]/80 transition active:scale-93"
                  >
                    🖨️ Print Report Sheet
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  Award, 
  FileText, 
  CheckCircle, 
  Send, 
  FileCheck2, 
  BookOpen, 
  HelpCircle, 
  ExternalLink,
  ChevronRight,
  Clock,
  ArrowRight,
  CheckCircle2,
  Lock,
  User,
  Activity
} from "lucide-react";

interface ParentPortalProps {
  currentUser: UserProfile;
  dict: Translations;
  students: Student[];
  fetchStudents: () => void;
}

export default function ParentPortal({ currentUser, dict, students, fetchStudents }: ParentPortalProps) {
  const [parentStudent, setParentStudent] = useState<Student | null>(null);
  const [badgeLogs, setBadgeLogs] = useState<BadgeLog[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [comms, setComms] = useState<Communication[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [lostFound, setLostFound] = useState<LostAndFoundItem[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [slips, setSlips] = useState<PermissionSlip[]>([]);

  // Tab sub navigation
  const [activeParentTab, setActiveParentTab] = useState<"performance" | "homework" | "sign" | "messages" | "board">("performance");

  // States: Homework submission
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<string | null>(null);
  const [homeworkContent, setHomeworkContent] = useState("");

  // States: Signing permission slip
  const [signingSlipId, setSigningSlipId] = useState<string | null>(null);
  const [electronicSignature, setElectronicSignature] = useState("");

  // States: Messenger direct chat reply
  const [newMessageText, setNewMessageText] = useState("");

  // States: Self linking child
  const [typedChildName, setTypedChildName] = useState("");

  const syncParentPortal = async () => {
    try {
      // Find matching child folder based on guardian email or registered name
      const child = students.find(
        s => s.guardianEmail.toLowerCase() === currentUser.email.toLowerCase() ||
             s.name.toLowerCase() === currentUser.studentName?.toLowerCase()
      );

      if (child) {
        setParentStudent(child);
        const badges = await DataService.getBadgeLogs();
        const asm = await DataService.getAssignments();
        const sbm = await DataService.getSubmissions();
        const cm = await DataService.getCommunications();
        const gl = await DataService.getGallery();
        const lf = await DataService.getLostAndFound();
        const bl = await DataService.getBlogPosts();
        const sl = await DataService.getPermissionSlips();

        setBadgeLogs(badges.filter(b => b.studentId === child.id));
        setAssignments(asm.filter(a => a.class === child.class));
        setSubmissions(sbm.filter(s => s.studentId === currentUser.email));
        setComms(cm.filter(c => c.recipientEmail.toLowerCase() === currentUser.email.toLowerCase() || c.senderId === currentUser.uid));
        setGallery(gl);
        setLostFound(lf);
        setBlogs(bl);
        setSlips(sl);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    syncParentPortal();
  }, [students, currentUser]);

  const handleSelfLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedChildName) return;

    const matchedChild = students.find(s => s.name.toLowerCase() === typedChildName.trim().toLowerCase());
    if (matchedChild) {
      alert(`Child "${matchedChild.name}" located! Handshaking secure link.`);
      // Update custom status in LocalDB
      const users = await DataService.getAllUsers();
      const updated = users.map(u => u.uid === currentUser.uid ? { ...u, studentName: matchedChild.name } : u);
      // Re-save profiles
      localStorage.setItem("educrm_users", JSON.stringify(updated));
      currentUser.studentName = matchedChild.name;
      syncParentPortal();
    } else {
      alert("Student folder not found. Please verify correct spelling or contact administrative desks.");
    }
  };

  const handleSubmitHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignmentId || !homeworkContent || !parentStudent) return;

    const assignment = assignments.find(a => a.id === submittingAssignmentId);

    try {
      const sub: Submission = {
        id: "sb_" + Math.random().toString(36).substr(2, 9),
        assignmentId: submittingAssignmentId,
        assignmentTitle: assignment?.title || "Homework Tasks",
        studentId: currentUser.email, // link via guardian login email matching types.ts
        studentName: parentStudent.name,
        content: homeworkContent,
        submittedAt: new Date().toISOString()
      };

      await DataService.createSubmission(sub);
      setHomeworkContent("");
      setSubmittingAssignmentId(null);
      syncParentPortal();
      alert("Homework submission posted securely!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignPermissionSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signingSlipId || !electronicSignature) return;

    try {
      await DataService.signPermissionSlip(signingSlipId, currentUser.email, electronicSignature);
      setElectronicSignature("");
      setSigningSlipId(null);
      syncParentPortal();
      alert("Permission Slip digitally co-signed! Dispatched securely to school registries.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReplyMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText) return;

    try {
      const rep: Communication = {
        id: "cm_" + Math.random().toString(36).substr(2, 9),
        senderId: currentUser.uid,
        senderName: `${currentUser.name} (Parent)`,
        senderRole: "parent",
        recipientEmail: "teacher@school.com", // send to general teacher list
        studentId: parentStudent?.id || "",
        studentName: parentStudent?.name || "",
        message: newMessageText,
        createdAt: new Date().toISOString()
      };

      await DataService.postMessage(rep);
      setNewMessageText("");
      syncParentPortal();
    } catch (err) {
      console.error(err);
    }
  };

  if (!parentStudent) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm max-w-md mx-auto text-center space-y-6" id="parent-linker-panel">
        <div className="p-4 bg-[#E9EDC9]/60 text-[#4A5D4E] rounded-full w-16 h-16 mx-auto flex items-center justify-center">
          <User className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-stone-850 font-display">No Child Link Established</h2>
          <p className="text-xs text-slate-500 mt-2">
            The database found no students linked to the guardian address <b>{currentUser.email}</b>.
            Please type your child's exact student folder name below to handshake a secure link.
          </p>
        </div>

        <form onSubmit={handleSelfLinkChild} className="space-y-3">
          <input
            type="text"
            required
            placeholder="Child Name (e.g. Arjun Verma)"
            value={typedChildName}
            onChange={(e) => setTypedChildName(e.target.value)}
            className="w-full p-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] text-center"
          />
          <button
            type="submit"
            className="w-full p-2.5 bg-[#4A5D4E] hover:bg-[#5E7A67] text-white font-semibold text-xs rounded-lg transition"
          >
            Authorize Connection
          </button>
        </form>

        <p className="text-[10px] text-slate-400">
          💡 If you are evaluating, try using <b>Arjun Verma</b> or refer to the Student directory on an Admin account.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" id="parent-portal-main">
      
      {/* Sidebar: Child quick overview panel */}
      <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm self-start space-y-6">
        <div className="text-center border-b border-stone-200 pb-5">
          <div className="h-16 w-16 bg-gradient-to-tr from-[#4A5D4E] to-[#8B9A7A] text-white rounded-full mx-auto flex items-center justify-center text-xl font-bold uppercase shadow">
            {parentStudent.name.substr(0, 2)}
          </div>
          <h3 className="text-base font-bold text-stone-850 mt-3 font-display">{parentStudent.name}</h3>
          <span className="text-xs text-slate-400 block">{parentStudent.class} • Roll {parentStudent.rollNo}</span>
          
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mt-3 border ${
            parentStudent.house === "Red" 
              ? "bg-red-50 text-red-600 border-red-100" 
              : parentStudent.house === "Blue" 
              ? "bg-blue-50 text-blue-600 border-blue-100" 
              : "bg-amber-50 text-amber-600 border-amber-100"
          }`}>
            <span className="h-2 w-2 rounded-full bg-current block animate-ping"></span>
            House {parentStudent.house} Team
          </span>
        </div>

        {/* Dynamic radial-like metric card */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-150">
            <span className="block text-[10px] uppercase font-bold text-stone-400">Attendance</span>
            <span className="text-lg font-extrabold text-[#4A5D4E] font-display">{parentStudent.attendancePercentage}%</span>
          </div>
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-150">
            <span className="block text-[10px] uppercase font-bold text-stone-400">Merit Score</span>
            <span className="text-lg font-extrabold text-[#D4A373] font-display">{parentStudent.meritPoints} pts</span>
          </div>
        </div>

        {/* Small tabs menu */}
        <div className="space-y-1">
          {[
            { id: "performance", label: "Progress & Achievements", icon: Award },
            { id: "homework", label: "Homework Desk", icon: FileText },
            { id: "sign", label: "Sign Slips Consent", icon: FileCheck2 },
            { id: "messages", label: "Counsel messages", icon: Send },
            { id: "board", label: "Noticeboards & Feed", icon: BookOpen }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                whileHover={{ x: 4, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.98 }}
                key={tab.id}
                onClick={() => setActiveParentTab(tab.id as any)}
                className={`w-full flex items-center justify-between text-left p-2.5 rounded-lg text-xs font-semibold transition cursor-pointer font-display ${
                  activeParentTab === tab.id
                    ? "bg-[#4A5D4E] text-white shadow"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </span>
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3">
        
        {/* TAB 1: Progress Metrics & Achievement badge logs */}
        {activeParentTab === "performance" && (
          <div className="space-y-6" id="parent-performance-pane">
            
            {/* Academic metrics ledger */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">
                📝 Academic Subject Performance Index
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(parentStudent.academicGrades).map(([subj, grd]) => (
                  <div key={subj} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-xs font-bold text-slate-500 block truncate">{subj}</span>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-3xl font-extrabold text-slate-800">{grd}</span>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">Passed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements badgelogs medals log */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">
                🏅 Student Achievement Badge Log
              </h4>
              
              {badgeLogs.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-6 text-center">No digital achievements awarded this term yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {badgeLogs.map((log) => (
                    <div key={log.id} className="p-4 border border-slate-150 rounded-xl bg-slate-55 flex items-start gap-4 hover:shadow-sm transition">
                      <span className="text-3xl p-2 bg-amber-50 rounded-lg">{log.badgeIcon}</span>
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">{log.badgeTitle}</span>
                        <p className="text-[11px] text-slate-500 mt-1 italic">{log.description}</p>
                        <span className="text-[9px] text-slate-400 block mt-2">Awarded by: Teacher {log.awardedBy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: Virtual Homework Dropbox */}
        {activeParentTab === "homework" && (
          <div className="space-y-6" id="parent-homework-pane">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">
                📖 Homework Task Assignments
              </h4>

              <div className="space-y-4">
                {assignments.map((asm) => {
                  const alreadyDone = submissions.find(s => s.assignmentId === asm.id);
                  return (
                    <div key={asm.id} className="p-4 border border-slate-100 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-850">{asm.title}</span>
                          <span className="bg-[#E9EDC9]/85 text-[#4A5D4E] text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase">
                            {asm.subject}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-400">Due: {asm.dueDate}</span>
                      </div>

                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{asm.description}</p>

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200/50 pt-3">
                        {alreadyDone ? (
                          <div className="text-xs">
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4" /> Submission Filed
                            </span>
                            {alreadyDone.grade && (
                              <div className="mt-1 bg-white p-2.5 rounded border border-slate-150">
                                <p className="text-[11px] text-slate-600">Grade Score: <b className="text-emerald-700">{alreadyDone.grade}</b></p>
                                <p className="text-[11px] text-slate-500 italic mt-0.5">&ldquo;{alreadyDone.feedback}&rdquo;</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => setSubmittingAssignmentId(asm.id)}
                            className="px-3 py-1.5 bg-[#4A5D4E] hover:bg-[#5E7A67] text-white font-semibold text-xs rounded-lg transition"
                          >
                            Draft Answer Sheet
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {submittingAssignmentId && (
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mt-4">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800">Draft Assignment Answers</span>
                  <button onClick={() => setSubmittingAssignmentId(null)} className="text-slate-400 hover:text-slate-600">
                    Close Desk
                  </button>
                </div>

                <form onSubmit={handleSubmitHomework} className="space-y-4">
                  <textarea
                    rows={6}
                    required
                    placeholder="Solve calculations, or paste essay paragraphs here directly..."
                    value={homeworkContent}
                    onChange={(e) => setHomeworkContent(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none"
                  ></textarea>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition"
                  >
                    Submit in Virtual Dropbox
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Digital Permission Slip Signing */}
        {activeParentTab === "sign" && (
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm" id="parent-slips-pane">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">
              ✍️ Digital Permission Slip Registry
            </h4>

            <div className="space-y-4">
              {slips.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">No permission Slips outstanding.</p>
              ) : (
                slips.map((slip) => {
                  const signedObj = slip.signatures[currentUser.email.toLowerCase()];
                  return (
                    <div key={slip.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl" id={`slip-row-${slip.id}`}>
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-700">{slip.title}</span>
                        {signedObj?.signed ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                            Consent Signed
                          </span>
                        ) : (
                          <span className="bg-rose-100 text-rose-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                            Pending Parent Signature
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{slip.description}</p>
                      <span className="text-[10px] text-slate-400 block mt-2">Sign Deadline: {slip.dueDate}</span>

                      {!signedObj?.signed && (
                        <div className="mt-4 border-t border-slate-100 pt-4">
                          <button
                            onClick={() => setSigningSlipId(slip.id)}
                            className="px-3 py-1.5 bg-[#4A5D4E] hover:bg-[#5E7A67] text-white font-semibold text-xs rounded-lg transition"
                          >
                            Touch to Sign Permission Slip
                          </button>
                        </div>
                      )}

                      {signedObj?.signed && (
                        <div className="mt-3 text-[11px] text-slate-400 bg-emerald-50/50 p-2 border border-emerald-100/50 rounded flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                          <span>Electonical signature filed under name: <b>{signedObj.parentName}</b> on {new Date(signedObj.signedAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {signingSlipId && (
              <div className="bg-[#FAF9F6] border border-stone-200 p-4 rounded-xl mt-6 shadow-sm">
                <span className="block text-xs font-bold text-stone-700 mb-1">Verify Parents Consent Document</span>
                <p className="text-[11px] text-stone-500 mb-3">By typing your legal name, you authorize administrative clearance for your child's field trip attendance.</p>
                
                <form onSubmit={handleSignPermissionSlip} className="flex gap-2 flex-wrap">
                  <input
                    type="text"
                    required
                    placeholder="Enter Electronic Signature Name"
                    value={electronicSignature}
                    onChange={(e) => setElectronicSignature(e.target.value)}
                    className="flex-1 p-2 text-xs border border-stone-200 rounded-lg bg-white focus:ring-1 focus:ring-[#4A5D4E]"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 rounded-lg"
                  >
                    Digitally Sign
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Counselor Parent Messenger */}
        {activeParentTab === "messages" && (
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-[420px]" id="parent-messenger-pane">
            <div>
              <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">
                💬 Parent-Teacher Message Thread
              </h4>

              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                {comms.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-10">No messages exchanged yet.</p>
                ) : (
                  comms.map((c) => (
                    <div 
                      key={c.id} 
                      className={`p-3.5 rounded-xl border leading-relaxed ${
                        c.senderRole === "parent" 
                          ? "bg-stone-50 border-stone-150 ml-6 md:ml-12" 
                          : "bg-[#E9EDC9]/20 border-stone-200 mr-6 md:mr-12"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                        <span className="uppercase text-slate-500">{c.senderName}</span>
                        <span>{new Date(c.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-slate-600">{c.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <form onSubmit={handleSendReplyMessage} className="mt-4 flex gap-2">
              <input
                type="text"
                required
                placeholder="Enter counseling reply or message teacher..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="flex-1 p-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
              />
              <button
                type="submit"
                className="p-2 bg-[#4A5D4E] hover:bg-[#5E7A67] text-white text-xs font-bold px-4 rounded-lg transition"
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: Interactive noticeboards (Magazine + Lost and Found) */}
        {activeParentTab === "board" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="parent-board-pane">
            
            {/* School Magazine Blogs list */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2">
                📰 School Magazine & student blogs
              </h4>

              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                {blogs.map((b) => (
                  <div key={b.id} className="p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition">
                    <span className="block font-bold text-xs text-slate-700">{b.title}</span>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{b.content}</p>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 mt-3 border-t border-slate-100 pt-2">
                      <span>Co-authored by: <b>{b.studentAuthor}</b></span>
                      <span>Published by: Sarah Alston</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lost and Found notice list */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2">
                🔍 Digital Lost & Found Noticeboard
              </h4>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {lostFound.map((item) => (
                  <div key={item.id} className="p-3 border border-slate-100 rounded-xl flex items-start justify-between gap-2">
                    <div>
                      <span className="block font-bold text-xs text-slate-700">{item.title}</span>
                      <p className="text-[11px] text-slate-500 mt-1">{item.description}</p>
                      <span className="text-[10px] text-slate-400 block mt-2">Contact: {item.contact} • Location: {item.location}</span>
                    </div>

                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      item.status === "claimed" 
                        ? "bg-emerald-100 text-emerald-800" 
                        : item.status === "found" 
                        ? "bg-slate-100 text-slate-800" 
                        : "bg-rose-100 text-rose-800 animate-pulse"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}

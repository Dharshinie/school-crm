import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { UserProfile, Student, Translations, UserRole } from "../types";
import { DataService } from "../db";
import { Plus, Trash2, Shield, Users, User, ArrowRight, BookOpen, Award, CheckCircle2, RefreshCw } from "lucide-react";

interface AdminDashboardProps {
  currentUser: UserProfile;
  dict: Translations;
  students: Student[];
  fetchStudents: () => void;
}

export default function AdminDashboard({ currentUser, dict, students, fetchStudents }: AdminDashboardProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States to add new user
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("teacher");
  const [newHouse, setNewHouse] = useState<"Red" | "Blue" | "Gold" | "None">("None");
  const [newChildName, setNewChildName] = useState("");
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const [blogLen, setBlogLen] = useState(0);
  const [slipLen, setSlipLen] = useState(0);
  const [badgeLen, setBadgeLen] = useState(0);
  const [homeworkLen, setHomeworkLen] = useState(0);

  const fetchUsersAndMeta = async () => {
    setLoading(true);
    try {
      const allUsers = await DataService.getAllUsers();
      setUsers(allUsers);

      const blogs = await DataService.getBlogPosts();
      const slips = await DataService.getPermissionSlips();
      const badges = await DataService.getBadgeLogs();
      const assignments = await DataService.getAssignments();

      setBlogLen(blogs.length);
      setSlipLen(slips.length);
      setBadgeLen(badges.length);
      setHomeworkLen(assignments.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndMeta();
    fetchStudents();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) {
      setMessage({ text: "Please enter both Email and Full Name.", isError: true });
      return;
    }

    try {
      const mockUid = "usr_" + Math.random().toString(36).substr(2, 9);
      const profile: UserProfile = {
        uid: mockUid,
        name: newName,
        email: newEmail.toLowerCase().trim(),
        role: newRole,
        house: newRole === "parent" ? "None" : newHouse,
        studentName: newRole === "parent" ? newChildName.trim() : "",
        createdAt: new Date().toISOString()
      };

      await DataService.createUserProfile(profile);
      setMessage({ text: `Account for ${newName} successfully registered!`, isError: false });
      setNewName("");
      setNewEmail("");
      setNewChildName("");
      setNewHouse("None");
      fetchUsersAndMeta();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to create user", isError: true });
    }
  };

  const handleDeleteUser = async (uid: string, email: string) => {
    if (email === "edharshinie@gmail.com") {
      alert("System Administrator cannot be deleted!");
      return;
    }
    if (confirm("Are you sure you want to delete this user account?")) {
      try {
        await DataService.deleteUser(uid);
        fetchUsersAndMeta();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // House Standing score sums
  const housePoints = {
    Red: students.filter(s => s.house === "Red").reduce((sum, s) => sum + s.meritPoints, 0),
    Blue: students.filter(s => s.house === "Blue").reduce((sum, s) => sum + s.meritPoints, 0),
    Gold: students.filter(s => s.house === "Gold").reduce((sum, s) => sum + s.meritPoints, 0),
  };

  const totalHousePoints = Math.max(housePoints.Red + housePoints.Blue + housePoints.Gold, 1);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 14 } }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="admin-dashboard-root">
      
      {/* Title & Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm"
      >
        <div>
          <h2 className="text-xl font-bold text-stone-850 flex items-center gap-2 font-display">
            <Shield className="h-6 w-6 text-[#4A5D4E]" />
            {dict.adminPortal}
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Overseeing school operations, general metrics, student divisions, and credential listings.
          </p>
        </div>
        <button 
          onClick={() => { fetchUsersAndMeta(); fetchStudents(); }} 
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-stone-750 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg self-start md:self-auto cursor-pointer transition active:scale-95"
        >
          <RefreshCw className="h-3 w-3" /> Sync Realtime Logs
        </button>
      </motion.div>

      {/* Primary Metrics Bento Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -4, shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}
          className="bg-white p-5 rounded-2xl border border-stone-150 shadow-sm flex items-center gap-4 transition-all duration-300"
        >
          <div className="p-3 bg-[#E9EDC9]/60 text-[#4A5D4E] rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-stone-400">Total Registered CRM Users</span>
            <span className="text-2xl font-bold font-display text-stone-800">{users.length}</span>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -4, shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}
          className="bg-white p-5 rounded-2xl border border-stone-150 shadow-sm flex items-center gap-4 transition-all duration-300"
        >
          <div className="p-3 bg-[#FAEDCD]/60 text-[#D4A373] rounded-xl">
            <User className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-stone-400">Active Students Tracked</span>
            <span className="text-2xl font-bold font-display text-stone-800">{students.length}</span>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -4, shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}
          className="bg-white p-5 rounded-2xl border border-stone-150 shadow-sm flex items-center gap-4 transition-all duration-300"
        >
          <div className="p-3 bg-[#E9EDC9]/40 text-[#8B9A7A] rounded-xl">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-stone-400">Achievement Medals Logged</span>
            <span className="text-2xl font-bold font-display text-stone-800">{badgeLen}</span>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -4, shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}
          className="bg-white p-5 rounded-2xl border border-stone-150 shadow-sm flex items-center gap-4 transition-all duration-300"
        >
          <div className="p-3 bg-[#FEFAE0]/90 text-stone-700 border border-stone-200 rounded-xl">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-stone-400">Curated Worksheets Issued</span>
            <span className="text-2xl font-bold font-display text-stone-800">{homeworkLen}</span>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* House Standing comparison panel */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-stone-850 flex items-center gap-2 border-b border-stone-200 pb-3 font-display">
              👑 {dict.teamHouse} Standings
            </h3>
            <p className="text-xs text-stone-500 mt-2 leading-relaxed">
              Sum of merit points earned by student accomplishments in athletic tournaments, perfect conduct, or academic excellence.
            </p>

            <div className="space-y-5 mt-6">
              {/* Red House */}
              <div className="group">
                <div className="flex justify-between items-center text-xs font-semibold text-stone-600 mb-1 group-hover:text-rose-600 transition-colors">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-rose-650 to-rose-450 block shadow-sm shadow-rose-200 animate-pulse"></span>
                    Red Phoenix House
                  </span>
                  <span className="font-mono text-[11.5px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-bold">{housePoints.Red} pts</span>
                </div>
                <div className="w-full bg-stone-100 h-3.5 rounded-full overflow-hidden shadow-inner p-0.5 border border-stone-200/40">
                  <div 
                    className="bg-gradient-to-r from-red-400 to-rose-500 h-full rounded-full transition-all duration-700 shadow"
                    style={{ width: `${(housePoints.Red / totalHousePoints) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Blue House */}
              <div className="group">
                <div className="flex justify-between items-center text-xs font-semibold text-stone-600 mb-1 group-hover:text-blue-600 transition-colors">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 block shadow-sm shadow-blue-200 animate-pulse"></span>
                    Blue Neptune House
                  </span>
                  <span className="font-mono text-[11.5px] bg-blue-50 text-blue-650 px-2 py-0.5 rounded-full font-bold">{housePoints.Blue} pts</span>
                </div>
                <div className="w-full bg-stone-100 h-3.5 rounded-full overflow-hidden shadow-inner p-0.5 border border-stone-200/40">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-sky-500 h-full rounded-full transition-all duration-700 shadow"
                    style={{ width: `${(housePoints.Blue / totalHousePoints) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Gold House */}
              <div className="group">
                <div className="flex justify-between items-center text-xs font-semibold text-stone-600 mb-1 group-hover:text-amber-600 transition-colors">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 block shadow-sm shadow-amber-200 animate-pulse"></span>
                    Gold Pegasus House
                  </span>
                  <span className="font-mono text-[11.5px] bg-amber-50 text-amber-650 px-2 py-0.5 rounded-full font-bold">{housePoints.Gold} pts</span>
                </div>
                <div className="w-full bg-stone-100 h-3.5 rounded-full overflow-hidden shadow-inner p-0.5 border border-stone-200/40">
                  <div 
                    className="bg-gradient-to-r from-amber-450 to-yellow-500 h-full rounded-full transition-all duration-700 shadow"
                    style={{ width: `${(housePoints.Gold / totalHousePoints) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl mt-6 border border-stone-200">
            <span className="block text-xs font-semibold text-stone-500">Teacher/Curator Activity Summary</span>
            <div className="grid grid-cols-2 gap-2 mt-2.5 text-xs text-stone-600">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#4A5D4E]" />
                <span>Slips: <b>{slipLen}</b> active</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#4A5D4E]" />
                <span>Blogs: <b>{blogLen}</b> online</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Account Registry Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h3 className="font-bold text-stone-850 border-b border-stone-200 pb-3 flex items-center gap-2 font-display">
            👤 Create School CRM Account
          </h3>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            Pre-register teacher profiles or parent permissions so they can log in and immediately view their portals.
          </p>

          <form onSubmit={handleCreateUser} className="space-y-4 mt-5">
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Timothy Cooper"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g. cooper.parent@email.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full p-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">CRM Role Platform Access</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full p-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none text-stone-700"
              >
                <option value="teacher">Teacher (Hubs & Management)</option>
                <option value="parent">Parent (Portal & Client)</option>
                <option value="admin">Administrator (Universal Oversee)</option>
              </select>
            </div>

            {newRole === "teacher" && (
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Teacher House Affiliation</label>
                <select
                  value={newHouse}
                  onChange={(e) => setNewHouse(e.target.value as any)}
                  className="w-full p-2 text-sm border border-stone-200 rounded-lg bg-white text-stone-700"
                >
                  <option value="None">None (General Teacher)</option>
                  <option value="Red">Red Phoenix Patron</option>
                  <option value="Blue">Blue Neptune Patron</option>
                  <option value="Gold">Gold Pegasus Patron</option>
                </select>
              </div>
            )}

            {newRole === "parent" && (
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Linked Student Name</label>
                <select
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  required
                  className="w-full p-2 text-sm border border-stone-200 rounded-lg bg-white text-stone-700"
                >
                  <option value="">-- Choose child name to link --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.name}>{s.name} ({s.class})</option>
                  ))}
                </select>
              </div>
            )}

            {message && (
              <div className={`p-2.5 rounded text-xs leading-relaxed ${message.isError ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-emerald-50 text-emerald-850 border border-emerald-150"}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              className="w-full p-2 bg-[#4A5D4E] hover:bg-[#5E7A67] text-white font-semibold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition duration-150 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Register New Account
            </button>
          </form>
        </div>

        {/* User Accounts list */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-stone-850 border-b border-stone-200 pb-3 flex items-center gap-2 font-display">
            🔑 Accounts Registry ({users.length})
          </h3>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            List of platform credentials. Ensure role boundaries are preserved correctly.
          </p>

          <div className="overflow-y-auto max-h-[360px] divide-y divide-stone-100 mt-4 flex-grow pr-1">
            {loading ? (
              <div className="text-xs text-stone-400 py-6 text-center">{dict.loading}</div>
            ) : (
              users.map((usr) => (
                <div key={usr.uid} className="py-2.5 flex items-center justify-between gap-2" id={`account-row-${usr.uid}`}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-stone-850 truncate block">{usr.name}</span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        usr.role === "admin" 
                          ? "bg-rose-100 text-rose-700" 
                          : usr.role === "teacher" 
                          ? "bg-[#E9EDC9]/80 text-[#4A5D4E]" 
                          : "bg-stone-100 text-stone-700"
                      }`}>
                        {usr.role}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400 truncate block mt-0.5">{usr.email}</span>
                    {usr.studentName && (
                      <span className="text-[10px] text-stone-500 mt-0.5 block italic">
                        Child: {usr.studentName}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteUser(usr.uid, usr.email)}
                    className="p-1 px-2 rounded hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition cursor-pointer"
                    title="Delete Account"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

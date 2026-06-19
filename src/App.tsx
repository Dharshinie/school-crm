import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, Student, Translations, UserRole } from "./types";
import { translations } from "./translations";
import { DataService } from "./db";
import { auth, isMockFirebase } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import LanguageSelector from "./components/LanguageSelector";
import AdminDashboard from "./components/AdminDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import ParentPortal from "./components/ParentPortal";
import { 
  GraduationCap, 
  LogOut, 
  Key, 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  User, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  Activity,
  Heart
} from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [language, setLanguage] = useState<string>("en");
  
  // Auth Form details
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regRole, setRegRole] = useState<UserRole>("teacher");
  const [regChildName, setRegChildName] = useState("");

  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Active translation dictionary
  const dict: Translations = translations[language as keyof typeof translations] || translations.en;

  const fetchStudents = async () => {
    try {
      const data = await DataService.getStudents();
      setStudents(data);
    } catch (err) {
      console.error("Failed to query student database", err);
    }
  };

  // Check persisted mock login on mount and seed backend if empty
  useEffect(() => {
    const savedUser = localStorage.getItem("educrm_active_user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem("educrm_active_user");
      }
    }
    
    // Seed real Firebase database if running in live mode and database is empty
    const initData = async () => {
      await DataService.seedDatabaseIfEmpty();
      await fetchStudents();
    };
    initData();
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setAuthLoading(true);

    if (!authEmail) {
      setAuthError("Email is required.");
      setAuthLoading(false);
      return;
    }

    try {
      if (isLoginTab) {
        // --- 1. Login Logic ---
        if (isMockFirebase) {
          // Standard mock log-in lookup
          const profile = await DataService.getUserProfile(authEmail.trim());
          if (profile) {
            setCurrentUser(profile);
            localStorage.setItem("educrm_active_user", JSON.stringify(profile));
            setAuthSuccess(`Welcome back, ${profile.name}!`);
          } else {
            setAuthError("No matching school profile found. Toggle signup to sign up your email.");
          }
        } else {
          // Real Firebase auth implementation
          const res = await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword);
          const profile = await DataService.getUserProfile(res.user.email || "");
          if (profile) {
            setCurrentUser(profile);
            localStorage.setItem("educrm_active_user", JSON.stringify(profile));
            setAuthSuccess(`Welcome back, ${profile.name}!`);
          } else {
            setAuthError("Auth succeeded, but no matching CRM roles profile mapped.");
          }
        }
      } else {
        // --- 2. Registration Logic ---
        if (!regName) {
          setAuthError("Name field is required.");
          setAuthLoading(false);
          return;
        }

        if (isMockFirebase) {
          const fallbackUid = "usr_" + Math.random().toString(36).substr(2, 9);
          const newProfile: UserProfile = {
            uid: fallbackUid,
            name: regName,
            email: authEmail.toLowerCase().trim(),
            role: regRole,
            studentName: regRole === "parent" ? regChildName : "",
            createdAt: new Date().toISOString()
          };

          await DataService.createUserProfile(newProfile);
          setCurrentUser(newProfile);
          localStorage.setItem("educrm_active_user", JSON.stringify(newProfile));
          setAuthSuccess(`Successfully constructed ${regRole} profile!`);
        } else {
          // Real Firebase auth user creation
          const res = await createUserWithEmailAndPassword(auth, authEmail.trim(), authPassword);
          const newProfile: UserProfile = {
            uid: res.user.uid,
            name: regName,
            email: authEmail.toLowerCase().trim(),
            role: regRole,
            studentName: regRole === "parent" ? regChildName : "",
            createdAt: new Date().toISOString()
          };
          await DataService.createUserProfile(newProfile);
          setCurrentUser(newProfile);
          localStorage.setItem("educrm_active_user", JSON.stringify(newProfile));
          setAuthSuccess(`Successfully created authenticated ${regRole} profile!`);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || "Credential authentication issue.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSandboxLogin = async (role: UserRole) => {
    setAuthError(null);
    setAuthSuccess(null);
    setAuthLoading(true);
    
    let targetEmail = "parent@school.com"; // default Parent
    if (role === "admin") targetEmail = "edharshinie@gmail.com";
    else if (role === "teacher") targetEmail = "teacher@school.com";

    try {
      if (isMockFirebase) {
        const profile = await DataService.getUserProfile(targetEmail);
        if (profile) {
          setCurrentUser(profile);
          localStorage.setItem("educrm_active_user", JSON.stringify(profile));
          setAuthSuccess(`Welcome back (Sandbox mode), ${profile.name}!`);
        }
      } else {
        // Real Firebase Live Auth Sandbox integration
        let userCredential;
        try {
          userCredential = await signInWithEmailAndPassword(auth, targetEmail, "password123");
        } catch (signInErr: any) {
          // If user doesn't exist, register them in Firebase auth
          if (signInErr.code === "auth/user-not-found" || signInErr.code === "auth/invalid-credential" || signInErr.message?.includes("not found")) {
            try {
              userCredential = await createUserWithEmailAndPassword(auth, targetEmail, "password123");
              
              // Seed their profile mapping inside Firestore users collection too
              const newUid = userCredential.user.uid;
              let name = "Sarah Alston";
              let studentName = "";
              if (role === "admin") {
                name = "Principal Arthur Pendelton";
              } else if (role === "parent") {
                name = "Vikram Verma";
                studentName = "Arjun Verma";
              }

              const newProfile: UserProfile = {
                uid: newUid,
                name: name,
                email: targetEmail,
                role: role,
                studentName: studentName,
                createdAt: new Date().toISOString()
              };
              await DataService.createUserProfile(newProfile);
            } catch (regErr: any) {
              throw new Error("Unable to auto-create credentials for sandbox user. Try creating normal credentials first. Error: " + regErr.message);
            }
          } else {
            throw signInErr;
          }
        }
        
        // Fetch official profile from Firestore
        const profile = await DataService.getUserProfile(targetEmail);
        if (profile) {
          setCurrentUser(profile);
          localStorage.setItem("educrm_active_user", JSON.stringify(profile));
          setAuthSuccess(`Welcome back (Sandbox mode), ${profile.name}!`);
        } else {
          // Fallback creation if profile record got lost but Auth exists
          const newProfile: UserProfile = {
            uid: userCredential.user.uid,
            name: role === "admin" ? "Principal Arthur Pendelton" : (role === "parent" ? "Vikram Verma" : "Sarah Alston"),
            email: targetEmail,
            role: role,
            studentName: role === "parent" ? "Arjun Verma" : "",
            createdAt: new Date().toISOString()
          };
          await DataService.createUserProfile(newProfile);
          setCurrentUser(newProfile);
          localStorage.setItem("educrm_active_user", JSON.stringify(newProfile));
          setAuthSuccess(`Welcome back (Sandbox mode), ${newProfile.name}!`);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to log into sandbox environment.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (!isMockFirebase) {
        await signOut(auth);
      }
      setCurrentUser(null);
      localStorage.removeItem("educrm_active_user");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9ff] bg-grid-pattern text-[#1e1b4b] flex flex-col font-sans relative overflow-x-hidden" id="app-layout-wrapper">
      {/* Dynamic Ambient Background Blobs with vibrant neon purple glow colors */}
      <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[40%] bg-purple-500/12 rounded-full blur-3xl pointer-events-none animate-blob-drift-1"></div>
      <div className="absolute top-[25%] right-[-10%] w-[35%] h-[45%] bg-fuchsia-500/12 rounded-full blur-3xl pointer-events-none animate-blob-drift-2"></div>
      <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[35%] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-blob-drift-3"></div>
      <div className="absolute bottom-[-10%] right-[10%] w-[45%] h-[40%] bg-violet-500/12 rounded-full blur-3xl pointer-events-none animate-blob-drift-4"></div>
      
      {/* Universal Top Header panel */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-200 py-2.5 px-3 md:px-8 flex items-center justify-between shadow-sm select-none">
        
        {/* Logo Shield */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 text-white p-2 md:p-2.5 rounded-xl shadow-md shrink-0">
            <GraduationCap className="h-5.5 w-5.5 md:h-6 md:w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm md:text-base font-bold text-white tracking-tight leading-none font-display">EDUCRM</h1>
            <span className="text-[9px] md:text-[10px] text-stone-500 font-bold block mt-0.5 tracking-wider uppercase truncate max-w-[130px] sm:max-w-none">
              Elite Academy Connect
            </span>
          </div>
        </div>

        {/* Translation Bar and active session badges */}
        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          <LanguageSelector currentLanguage={language} setLanguage={setLanguage} dict={dict} />
          
          {currentUser && (
            <div className="hidden lg:flex items-center gap-2 bg-[#FAF9F6] border border-stone-200 py-1.5 px-3 rounded-lg text-xs font-semibold text-stone-700">
              <User className="h-3.5 w-3.5 text-[#4A5D4E]" />
              <span>{currentUser.name} ({currentUser.role})</span>
            </div>
          )}

          {currentUser && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-2 py-1.5 md:px-3 text-xs font-bold text-rose-750 hover:bg-rose-50 border border-rose-100 rounded-lg cursor-pointer transition active:scale-95"
              title="Sign Out Session"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          )}
        </div>
      </header>

      {/* Primary Dashboard Frame */}
      <main className="flex-grow p-4 md:p-8 max-w-7xl w-full mx-auto">
        
        {currentUser ? (
          <div className="space-y-6">
            
            {/* Direct Multi-Role Header Notification banner */}
            <div className="bg-[#0dacd4] p-6 rounded-2xl text-indigo-950 shadow-md relative overflow-hidden">
              <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full blur-2xl transform translate-x-12 -translate-y-12"></div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-200/50">
                    {dict.activeSession} • {currentUser.role} {dict.access}
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold font-display mt-2.5 tracking-tight text-indigo-950">
                    {dict.welcomeBack}, {currentUser.name}
                  </h2>
                  <p className="text-indigo-900/85 text-xs mt-1.5 max-w-xl leading-relaxed">
                    Welcome to the central school administration console. Monitor coursework performance indexes, merit house point summaries, parent consent slips, and issue badgelogs securely.
                  </p>
                </div>
                
                {/* Secondary Sandbox Switcher buttons specifically for evaluating user review convenience! */}
                <div className="bg-white/50 backdrop-blur-sm p-3.5 rounded-xl border border-indigo-100 self-start md:self-auto">
                  <span className="block text-[9px] uppercase font-bold text-indigo-900 mb-2">⚡ Evaluate Sandbox Roles:</span>
                  <div className="flex gap-1.5 flex-wrap">
                    <button onClick={() => handleSandboxLogin("admin")} className="px-2 py-1 bg-white hover:bg-stone-100 text-[#4A5D4E] rounded text-[10px] font-bold transition">Admin Portal</button>
                    <button onClick={() => handleSandboxLogin("teacher")} className="px-2 py-1 bg-white hover:bg-stone-100 text-[#4A5D4E] rounded text-[10px] font-bold transition">Teacher Hub</button>
                    <button onClick={() => handleSandboxLogin("parent")} className="px-2 py-1 bg-white hover:bg-stone-100 text-[#4A5D4E] rounded text-[10px] font-bold transition">Parent Portal</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Render Role-Based Components */}
            <div>
              {currentUser.role === "admin" && (
                <AdminDashboard 
                  currentUser={currentUser} 
                  dict={dict} 
                  students={students} 
                  fetchStudents={fetchStudents} 
                />
              )}
              {currentUser.role === "teacher" && (
                <TeacherDashboard 
                  currentUser={currentUser} 
                  dict={dict} 
                  students={students} 
                  fetchStudents={fetchStudents} 
                />
              )}
              {currentUser.role === "parent" && (
                <ParentPortal 
                  currentUser={currentUser} 
                  dict={dict} 
                  students={students} 
                  fetchStudents={fetchStudents} 
                />
              )}
            </div>

          </div>
        ) : (
          
          /* AUTHENTICATION PORTAL (GORGEOUS AUTHENTIC COVER LAYOUTS) */
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-md mx-auto my-12"
            id="authentication-panel"
          >
            <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-sky-500 via-emerald-500 to-pink-500"></div>
              
              <div className="text-center mb-6">
                <span className="text-[10px] text-sky-700 font-extrabold uppercase tracking-widest bg-sky-100 px-2.5 py-1 rounded-full">
                  EDUCRM Secure Entry
                </span>
                <h3 className="text-lg font-bold text-stone-850 mt-2.5 font-display">Access CRM Platform</h3>
                <p className="text-xs text-stone-500 mt-1">Select your access model below and log in.</p>
              </div>

              {/* Toggle Admin / Registration Tabs */}
              <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-lg border border-stone-200 mb-6">
                <button
                  type="button"
                  id="tab-login"
                  onClick={() => { setIsLoginTab(true); setAuthError(null); }}
                  className={`py-2 text-xs font-bold rounded cursor-pointer transition ${
                    isLoginTab ? "bg-white text-[#4A5D4E] shadow-sm" : "text-stone-600 hover:text-stone-850"
                  }`}
                >
                  Sign In Account
                </button>
                <button
                  type="button"
                  id="tab-register"
                  onClick={() => { setIsLoginTab(false); setAuthError(null); }}
                  className={`py-2 text-xs font-bold rounded cursor-pointer transition ${
                    !isLoginTab ? "bg-white text-[#4A5D4E] shadow-sm" : "text-stone-600 hover:text-stone-850"
                  }`}
                >
                  Create Profile
                </button>
              </div>

              {/* Login Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                
                {/* Registration fields shown only when IsLoginTab is false */}
                {!isLoginTab && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Richard Hendricks"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full p-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Direct CRM Role</label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as UserRole)}
                        className="w-full p-2.5 text-sm border border-stone-200 rounded-lg bg-white"
                      >
                        <option value="teacher">Teacher (Curriculum Overseer)</option>
                        <option value="parent">Parent / Family Guardian</option>
                        <option value="admin">Administrator Staff</option>
                      </select>
                    </div>

                    {regRole === "parent" && (
                      <div>
                        <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Link Child Name Selection</label>
                        <input
                          type="text"
                          placeholder="Arjun Verma"
                          value={regChildName}
                          onChange={(e) => setRegChildName(e.target.value)}
                          className="w-full p-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
                        />
                        <span className="text-[10px] text-stone-500 block mt-1">💡 Link Arjun Verma for instant testing.</span>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase mb-1">{dict.emailAddress}</label>
                  <input
                    type="email"
                    required
                    placeholder="name@school.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full p-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase mb-1">{dict.password}</label>
                  <input
                    type="password"
                    placeholder="Enter security password..."
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full p-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
                  />
                </div>

                {authError && (
                  <div className="bg-rose-50 text-rose-700 p-3 rounded-lg text-xs leading-relaxed flex items-start gap-2 border border-rose-100">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                {authSuccess && (
                  <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg text-xs leading-relaxed flex items-start gap-2 border border-emerald-100">
                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{authSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full p-2.5 bg-[#4A5D4E] hover:bg-[#5E7A67] disabled:bg-stone-300 text-white font-semibold text-xs rounded-xl shadow-sm transition transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {authLoading ? "Decrypting credentials..." : (isLoginTab ? "Access Portal Dashboard" : "Initiate CRM Profile")}
                </button>
              </form>

              {/* Dev Sandbox quick clicker triggers inside auth cards */}
              <div className="border-t border-stone-200 mt-6 pt-5">
                <span className="block text-[10px] uppercase font-bold text-stone-400 text-center mb-3">
                  ⚡ Evaluate CRM Sandbox Roles (Instant Click)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSandboxLogin("admin")}
                    className="p-1.5 px-2.5 text-center text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition cursor-pointer active:scale-95 shadow-sm"
                  >
                    👑 Administrator
                  </button>
                  <button
                    onClick={() => handleSandboxLogin("teacher")}
                    className="p-1.5 px-2.5 text-center text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition cursor-pointer active:scale-95 shadow-sm"
                  >
                    👩‍🏫 Teacher
                  </button>
                  <button
                    onClick={() => handleSandboxLogin("parent")}
                    className="p-1.5 px-2.5 text-center text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition cursor-pointer active:scale-95 shadow-sm"
                  >
                    👪 Parent Link
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </main>

      {/* Universal Footer */}
      <footer className="bg-white border-t border-stone-200 pt-3 pb-0 mb-0 text-center text-xs text-slate-400 mt-6">
        <p className="m-0 p-0 pb-1">&copy; {new Date().getFullYear()} EDUCRM School Suite.</p>
      </footer>
    </div>
  );
}


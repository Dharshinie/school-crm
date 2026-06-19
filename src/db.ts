import { 
  Student, 
  BadgeLog, 
  Assignment, 
  Submission, 
  Communication, 
  GalleryItem, 
  LostAndFoundItem, 
  BlogPost, 
  PermissionSlip, 
  UserProfile,
  UserRole
} from "./types";
import { isMockFirebase, db, handleFirestoreError, OperationType } from "./firebase";
import { 
  collection, 
  addDoc, 
  setDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from "firebase/firestore";

// --- Seed Data Definition ---
const INITIAL_STUDENTS: Student[] = [
  {
    id: "st_1",
    name: "Arjun Verma",
    house: "Red",
    class: "Grade 5-A",
    rollNo: "05A01",
    guardianEmail: "parent@school.com",
    meritPoints: 120,
    attendancePercentage: 96,
    academicGrades: { "Mathematics": "A", "Science": "A+", "English": "B+", "Social Studies": "A" },
    createdAt: new Date().toISOString()
  },
  {
    id: "st_2",
    name: "Meera Nair",
    house: "Gold",
    class: "Grade 5-A",
    rollNo: "05A02",
    guardianEmail: "meera.parent@school.com",
    meritPoints: 150,
    attendancePercentage: 98,
    academicGrades: { "Mathematics": "A+", "Science": "A+", "English": "A", "Social Studies": "A+" },
    createdAt: new Date().toISOString()
  },
  {
    id: "st_3",
    name: "Rohan Das",
    house: "Blue",
    class: "Grade 5-A",
    rollNo: "05A03",
    guardianEmail: "rohan.parent@school.com",
    meritPoints: 95,
    attendancePercentage: 89,
    academicGrades: { "Mathematics": "B", "Science": "B+", "English": "A", "Social Studies": "B" },
    createdAt: new Date().toISOString()
  },
  {
    id: "st_4",
    name: "Ananya Iyer",
    house: "Red",
    class: "Grade 6-B",
    rollNo: "06B12",
    guardianEmail: "ananya.parent@school.com",
    meritPoints: 140,
    attendancePercentage: 97,
    academicGrades: { "Mathematics": "A+", "Science": "A", "English": "A+", "Social Studies": "A" },
    createdAt: new Date().toISOString()
  },
  {
    id: "st_5",
    name: "Gautham Pillai",
    house: "Gold",
    class: "Grade 6-B",
    rollNo: "06B15",
    guardianEmail: "gautham.parent@school.com",
    meritPoints: 110,
    attendancePercentage: 94,
    academicGrades: { "Mathematics": "B+", "Science": "A", "English": "A", "Social Studies": "A+" },
    createdAt: new Date().toISOString()
  },
  {
    id: "st_6",
    name: "Fathima Latheef",
    house: "Blue",
    class: "Grade 6-B",
    rollNo: "06B18",
    guardianEmail: "fathima.parent@school.com",
    meritPoints: 160,
    attendancePercentage: 99,
    academicGrades: { "Mathematics": "A+", "Science": "A+", "English": "A+", "Social Studies": "A+" },
    createdAt: new Date().toISOString()
  }
];

const INITIAL_BADGE_LOGS: BadgeLog[] = [
  {
    id: "bl_1",
    studentId: "st_2",
    studentName: "Meera Nair",
    badgeTitle: "Math Genius",
    badgeIcon: "📐",
    description: "Awarded for scoring a clean 100% in the algebra assessment term exam.",
    awardedBy: "Sarah Alston",
    awardedById: "t_1",
    awardedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: "bl_2",
    studentId: "st_6",
    studentName: "Fathima Latheef",
    badgeTitle: "Perfect Attendance",
    badgeIcon: "📅",
    description: "Maintained 100% school attendance for three consecutive school terms.",
    awardedBy: "Sarah Alston",
    awardedById: "t_1",
    awardedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: "bl_3",
    studentId: "st_1",
    studentName: "Arjun Verma",
    badgeTitle: "Outstanding Athlete",
    badgeIcon: "🏆",
    description: "Represented the Red House and secured first place in high jump during Sports Meet.",
    awardedBy: "Sarah Alston",
    awardedById: "t_1",
    awardedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  }
];

const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: "as_1",
    title: "Phases of the Moon Research Paper",
    description: "Conduct research and write a summary paragraph of the different phases of the moon with illustrations. Submit high quality answers here.",
    subject: "Science",
    class: "Grade 5-A",
    dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split("T")[0],
    createdBy: "Sarah Alston",
    createdById: "t_1",
    createdAt: new Date().toISOString()
  },
  {
    id: "as_2",
    title: "Algebra Basics Practice Worksheet",
    description: "Complete all questions from Section C regarding linear equations on Page 128.",
    subject: "Mathematics",
    class: "Grade 5-A",
    dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split("T")[0],
    createdBy: "Sarah Alston",
    createdById: "t_1",
    createdAt: new Date().toISOString()
  },
  {
    id: "as_3",
    title: "Essay on Global Biodiversity Preservation",
    description: "Write an inspiring writeup on actions steps students can take to preserve local wildlife.",
    subject: "English",
    class: "Grade 6-B",
    dueDate: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString().split("T")[0],
    createdBy: "Sarah Alston",
    createdById: "t_1",
    createdAt: new Date().toISOString()
  }
];

const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: "sb_1",
    assignmentId: "as_2",
    assignmentTitle: "Algebra Basics Practice Worksheet",
    studentId: "parent@school.com",
    studentName: "Arjun Verma",
    content: "Solved all 10 linear equations correctly on paper. I found equations 7 and 8 tricky but utilized help from my dad. Final solutions: 1) x=4, 2) y=7, 3) z=-2...",
    grade: "A+",
    feedback: "Excellent layout of solutions, Arjun! Very clear stepwise derivation.",
    submittedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  }
];

const INITIAL_COMMUNICATIONS: Communication[] = [
  {
    id: "cm_1",
    senderId: "t_1",
    senderName: "Teacher Sarah Alston",
    senderRole: "teacher",
    recipientEmail: "parent@school.com",
    studentId: "st_1",
    studentName: "Arjun Verma",
    message: "Hello Mr & Mrs Verma, Arjun has performed exceptionally well in Science this term, scoring an A+. However, please verify that he finishes his quadratic equation worksheets this weekend. Thanks!",
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: "cm_2",
    senderId: "parent@school.com",
    senderName: "Verma (Arjun's Parent)",
    senderRole: "parent",
    recipientEmail: "teacher@school.com",
    studentId: "st_1",
    studentName: "Arjun Verma",
    message: "Thank you, Ms Alston! We have noticed his dedication and will definitely supervise his math worksheets this Saturday. Highly appreciate the feedback.",
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  }
];

const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: "gl_1",
    imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600",
    caption: "Our Grade 5 students working hard on their team botanical science garden experiment!",
    postedBy: "Sarah Alston",
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: "gl_2",
    imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600",
    caption: "The Blue House secures the victory in the 4x100m school tracks relay!",
    postedBy: "Sarah Alston",
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: "gl_3",
    imageUrl: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=600",
    caption: "Creative arts exhibition organized in the high school auditorium last Friday.",
    postedBy: "Sarah Alston",
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  }
];

const INITIAL_LOST_AND_FOUND: LostAndFoundItem[] = [
  {
    id: "lf_1",
    title: "Blue Metal Water Flask",
    description: "Found next to the Red House pavilion steps. Decathlon brand with an astronaut sticker on it.",
    location: "Playground Pavilions",
    contact: "Teacher Room 5B",
    status: "found",
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: "lf_2",
    title: "Unbranded black spectacles case",
    description: "Left behind near the computer labs desks. Contains prescription round rim eyeglasses.",
    location: "Main Library Room",
    contact: "Admin Desk Ext 201",
    status: "found",
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: "lf_3",
    title: "Adidas Running shoes - Size US 7",
    description: "Forgot mine under locker number 248. It is blue-yellow colored.",
    location: "Gymnasium Locker area",
    contact: "Arjun Verma (Grade 5-A)",
    status: "lost",
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  }
];

const INITIAL_BLOGS: BlogPost[] = [
  {
    id: "bp_1",
    title: "The Magic of Ancient Indian Mathematics",
    content: "Mathematics is not just about solving numbers but exploring amazing patterns. Did you know Aryabhata calculated the value of Pi so accurately centuries ago? I love diving into algebra because it makes me feel like a detective searching for x!",
    studentAuthor: "Arjun Verma",
    teacherPoster: "Sarah Alston",
    teacherId: "t_1",
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: "bp_2",
    title: "A Day inside the Life of a Honeybee",
    content: "Honeybees are nature's tiny engineering heroes! In our science lab, we studied how they communicate via 'waggle dances' to signal honey locations. If they disappear, our entire ecology collapses. We should plant more wild marigolds to help them.",
    studentAuthor: "Meera Nair",
    teacherPoster: "Sarah Alston",
    teacherId: "t_1",
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  }
];

const INITIAL_PERMISSION_SLIPS: PermissionSlip[] = [
  {
    id: "ps_1",
    title: "National Science Center Field Trip - Grade 5-A",
    description: "We are organizing a guided educational tour to the National Science Planetarium on 20th June, departures at 8:30 AM returning by 4:00 PM. Travel provided by sanitized school buses. Requires Parental Signing to allow attendance.",
    dueDate: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString().split("T")[0],
    signatures: {
      "meera.parent@school.com": {
        signed: true,
        signedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        parentName: "Lakshmi Nair"
      }
    },
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: "ps_2",
    title: "Inter-School Swimming Gala Championship Meet",
    description: "Your child has been nominated to represent the Gold House team in our regional children swimming gala. Ensure parent confirmation to enlist them in sports insurance.",
    dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split("T")[0],
    signatures: {},
    createdAt: new Date().toISOString()
  }
];

const INITIAL_PROFILES: UserProfile[] = [
  {
    uid: "admin_user",
    name: "Principal Arthur Pendelton",
    email: "edharshinie@gmail.com",
    role: "admin",
    createdAt: new Date().toISOString()
  },
  {
    uid: "teacher_user",
    name: "Sarah Alston",
    email: "teacher@school.com",
    role: "teacher",
    createdAt: new Date().toISOString()
  },
  {
    uid: "parent_user",
    name: "Vikram Verma",
    email: "parent@school.com",
    role: "parent",
    studentName: "Arjun Verma",
    createdAt: new Date().toISOString()
  }
];

// --- Initialization of Local Storage Database ---
const loadData = <T>(key: string, initial: T[]): T[] => {
  const stored = localStorage.getItem(`educrm_${key}`);
  if (!stored) {
    localStorage.setItem(`educrm_${key}`, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(stored);
  } catch (err) {
    return initial;
  }
};

const saveData = <T>(key: string, data: T[]) => {
  localStorage.setItem(`educrm_${key}`, JSON.stringify(data));
};

// --- Local Database Replication API ---
export const LocalDB = {
  getUsers: () => loadData<UserProfile>("users", INITIAL_PROFILES),
  saveUsers: (data: UserProfile[]) => saveData<UserProfile>("users", data),

  getStudents: () => loadData<Student>("students", INITIAL_STUDENTS),
  saveStudents: (data: Student[]) => saveData<Student>("students", data),

  getBadgeLogs: () => loadData<BadgeLog>("badgelogs", INITIAL_BADGE_LOGS),
  saveBadgeLogs: (data: BadgeLog[]) => saveData<BadgeLog>("badgelogs", data),

  getAssignments: () => loadData<Assignment>("assignments", INITIAL_ASSIGNMENTS),
  saveAssignments: (data: Assignment[]) => saveData<Assignment>("assignments", data),

  getSubmissions: () => loadData<Submission>("submissions", INITIAL_SUBMISSIONS),
  saveSubmissions: (data: Submission[]) => saveData<Submission>("submissions", data),

  getCommunications: () => loadData<Communication>("communications", INITIAL_COMMUNICATIONS),
  saveCommunications: (data: Communication[]) => saveData<Communication>("communications", data),

  getGallery: () => loadData<GalleryItem>("gallery", INITIAL_GALLERY),
  saveGallery: (data: GalleryItem[]) => saveData<GalleryItem>("gallery", data),

  getLostAndFound: () => loadData<LostAndFoundItem>("lostandfound", INITIAL_LOST_AND_FOUND),
  saveLostAndFound: (data: LostAndFoundItem[]) => saveData<LostAndFoundItem>("lostandfound", data),

  getBlogPosts: () => loadData<BlogPost>("blogposts", INITIAL_BLOGS),
  saveBlogPosts: (data: BlogPost[]) => saveData<BlogPost>("blogposts", data),

  getPermissionSlips: () => loadData<PermissionSlip>("permissionslips", INITIAL_PERMISSION_SLIPS),
  savePermissionSlips: (data: PermissionSlip[]) => saveData<PermissionSlip>("permissionslips", data),
};

// --- Hybrid Cloud / Local Unified Data Service API (Real interface used by UI) ---
export const DataService = {
  // Auto-seed Firestore on startup if empty
  async seedDatabaseIfEmpty(): Promise<void> {
    if (isMockFirebase) return;
    try {
      // Check if users collection is empty
      const userSnap = await getDocs(collection(db, "users"));
      if (userSnap.empty) {
        console.log("Seeding initial profiles to Firestore...");
        for (const profile of INITIAL_PROFILES) {
          await setDoc(doc(db, "users", profile.uid), profile);
        }
      }
      
      // Check if students collection is empty
      const studentSnap = await getDocs(collection(db, "students"));
      if (studentSnap.empty) {
        console.log("Seeding initial students to Firestore...");
        for (const student of INITIAL_STUDENTS) {
          await setDoc(doc(db, "students", student.id), student);
        }
      }

      // Check badgelogs
      const badgeSnap = await getDocs(collection(db, "badgelogs"));
      if (badgeSnap.empty) {
        console.log("Seeding initial badge logs...");
        for (const log of INITIAL_BADGE_LOGS) {
          await setDoc(doc(db, "badgelogs", log.id), log);
        }
      }

      // Check assignments
      const assignmentSnap = await getDocs(collection(db, "assignments"));
      if (assignmentSnap.empty) {
        console.log("Seeding initial assignments...");
        for (const assignment of INITIAL_ASSIGNMENTS) {
          await setDoc(doc(db, "assignments", assignment.id), assignment);
        }
      }

      // Check submissions
      const submissionSnap = await getDocs(collection(db, "submissions"));
      if (submissionSnap.empty) {
        console.log("Seeding initial submissions...");
        for (const sub of INITIAL_SUBMISSIONS) {
          await setDoc(doc(db, "submissions", sub.id), sub);
        }
      }

      // Check communications
      const communicationSnap = await getDocs(collection(db, "communications"));
      if (communicationSnap.empty) {
        console.log("Seeding initial communications...");
        for (const comm of INITIAL_COMMUNICATIONS) {
          await setDoc(doc(db, "communications", comm.id), comm);
        }
      }

      // Check gallery
      const gallerySnap = await getDocs(collection(db, "gallery"));
      if (gallerySnap.empty) {
        console.log("Seeding initial gallery items...");
        for (const item of INITIAL_GALLERY) {
          await setDoc(doc(db, "gallery", item.id), item);
        }
      }

      // Check lostandfound
      const lfSnap = await getDocs(collection(db, "lostandfound"));
      if (lfSnap.empty) {
        console.log("Seeding initial lost and found...");
        for (const item of INITIAL_LOST_AND_FOUND) {
          await setDoc(doc(db, "lostandfound", item.id), item);
        }
      }

      // Check blogposts
      const blogSnap = await getDocs(collection(db, "blogposts"));
      if (blogSnap.empty) {
        console.log("Seeding initial blog posts...");
        for (const post of INITIAL_BLOGS) {
          await setDoc(doc(db, "blogposts", post.id), post);
        }
      }

      // Check permissionslips
      const slipSnap = await getDocs(collection(db, "permissionslips"));
      if (slipSnap.empty) {
        console.log("Seeding initial permission slips...");
        for (const slip of INITIAL_PERMISSION_SLIPS) {
          await setDoc(doc(db, "permissionslips", slip.id), slip);
        }
      }
    } catch (err) {
      console.error("Error seeding initial data: ", err);
    }
  },

  // 1. Users Profile Call
  async getUserProfile(email: string): Promise<UserProfile | null> {
    if (isMockFirebase) {
      const users = LocalDB.getUsers();
      return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    } else {
      try {
        const q = query(collection(db, "users"), where("email", "==", email));
        const snap = await getDocs(q);
        if (snap.empty) return null;
        return snap.docs[0].data() as UserProfile;
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, "users");
        return null;
      }
    }
  },

  async createUserProfile(profile: UserProfile): Promise<void> {
    if (isMockFirebase) {
      const users = LocalDB.getUsers();
      if (!users.some(u => u.email.toLowerCase() === profile.email.toLowerCase())) {
        users.push(profile);
        LocalDB.saveUsers(users);
      }
    } else {
      try {
        await setDoc(doc(db, "users", profile.uid), profile);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${profile.uid}`);
      }
    }
  },

  async getAllUsers(): Promise<UserProfile[]> {
    if (isMockFirebase) {
      return LocalDB.getUsers();
    } else {
      try {
        const snap = await getDocs(collection(db, "users"));
        return snap.docs.map(d => d.data() as UserProfile);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "users");
        return [];
      }
    }
  },

  async deleteUser(uid: string): Promise<void> {
    if (isMockFirebase) {
      const users = LocalDB.getUsers();
      LocalDB.saveUsers(users.filter(u => u.uid !== uid));
    } else {
      try {
        await deleteDoc(doc(db, "users", uid));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${uid}`);
      }
    }
  },

  // 2. Students Call Method
  async getStudents(): Promise<Student[]> {
    if (isMockFirebase) {
      return LocalDB.getStudents();
    } else {
      try {
        const snap = await getDocs(collection(db, "students"));
        return snap.docs.map(d => d.data() as Student);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "students");
        return [];
      }
    }
  },

  async createStudent(student: Student): Promise<void> {
    if (isMockFirebase) {
      const studs = LocalDB.getStudents();
      studs.push(student);
      LocalDB.saveStudents(studs);
    } else {
      try {
        await setDoc(doc(db, "students", student.id), student);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `students/${student.id}`);
      }
    }
  },

  async updateStudent(studentId: string, updates: Partial<Student>): Promise<void> {
    if (isMockFirebase) {
      const studs = LocalDB.getStudents();
      const updated = studs.map(s => s.id === studentId ? { ...s, ...updates } : s);
      LocalDB.saveStudents(updated);
    } else {
      try {
        await updateDoc(doc(db, "students", studentId), updates as any);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `students/${studentId}`);
      }
    }
  },

  async deleteStudent(studentId: string): Promise<void> {
    if (isMockFirebase) {
      const studs = LocalDB.getStudents();
      LocalDB.saveStudents(studs.filter(s => s.id !== studentId));
    } else {
      try {
        await deleteDoc(doc(db, "students", studentId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `students/${studentId}`);
      }
    }
  },

  // 3. Achievement Badges Call
  async getBadgeLogs(): Promise<BadgeLog[]> {
    if (isMockFirebase) {
      return LocalDB.getBadgeLogs();
    } else {
      try {
        const snap = await getDocs(collection(db, "badgelogs"));
        return snap.docs.map(d => d.data() as BadgeLog);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "badgelogs");
        return [];
      }
    }
  },

  async awardBadge(log: BadgeLog): Promise<void> {
    if (isMockFirebase) {
      const logs = LocalDB.getBadgeLogs();
      logs.push(log);
      LocalDB.saveBadgeLogs(logs);

      // Automatically award merit points based on badge score!
      const studs = LocalDB.getStudents();
      let ptsIncrease = 20; // default points
      if (log.badgeTitle.includes("Genius")) ptsIncrease = 30;
      if (log.badgeTitle.includes("Perfect")) ptsIncrease = 25;
      
      const updated = studs.map(s => {
        if (s.id === log.studentId) {
          return { ...s, meritPoints: s.meritPoints + ptsIncrease };
        }
        return s;
      });
      LocalDB.saveStudents(updated);
    } else {
      try {
        await setDoc(doc(db, "badgelogs", log.id), log);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `badgelogs/${log.id}`);
      }
    }
  },

  // 4. Assignments Homework Dropbox
  async getAssignments(): Promise<Assignment[]> {
    if (isMockFirebase) {
      return LocalDB.getAssignments();
    } else {
      try {
        const snap = await getDocs(collection(db, "assignments"));
        return snap.docs.map(d => d.data() as Assignment);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "assignments");
        return [];
      }
    }
  },

  async createAssignment(assignment: Assignment): Promise<void> {
    if (isMockFirebase) {
      const list = LocalDB.getAssignments();
      list.push(assignment);
      LocalDB.saveAssignments(list);
    } else {
      try {
        await setDoc(doc(db, "assignments", assignment.id), assignment);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `assignments/${assignment.id}`);
      }
    }
  },

  // Submissions drop-box
  async getSubmissions(): Promise<Submission[]> {
    if (isMockFirebase) {
      return LocalDB.getSubmissions();
    } else {
      try {
        const snap = await getDocs(collection(db, "submissions"));
        return snap.docs.map(d => d.data() as Submission);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "submissions");
        return [];
      }
    }
  },

  async createSubmission(sub: Submission): Promise<void> {
    if (isMockFirebase) {
      const list = LocalDB.getSubmissions();
      list.push(sub);
      LocalDB.saveSubmissions(list);
    } else {
      try {
        await setDoc(doc(db, "submissions", sub.id), sub);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `submissions/${sub.id}`);
      }
    }
  },

  async gradeSubmission(submissionId: string, grade: string, feedback: string): Promise<void> {
    if (isMockFirebase) {
      const list = LocalDB.getSubmissions();
      const updated = list.map(s => s.id === submissionId ? { ...s, grade, feedback } : s);
      LocalDB.saveSubmissions(updated);
    } else {
      try {
        await updateDoc(doc(db, "submissions", submissionId), { grade, feedback });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `submissions/${submissionId}`);
      }
    }
  },

  // 5. Parent-Teacher Messaging Communication
  async getCommunications(): Promise<Communication[]> {
    if (isMockFirebase) {
      return LocalDB.getCommunications();
    } else {
      try {
        const snap = await getDocs(collection(db, "communications"));
        return snap.docs.map(d => d.data() as Communication);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "communications");
        return [];
      }
    }
  },

  async postMessage(message: Communication): Promise<void> {
    if (isMockFirebase) {
      const list = LocalDB.getCommunications();
      list.push(message);
      LocalDB.saveCommunications(list);
    } else {
      try {
        await setDoc(doc(db, "communications", message.id), message);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `communications/${message.id}`);
      }
    }
  },

  // 6. Gallery Life Media
  async getGallery(): Promise<GalleryItem[]> {
    if (isMockFirebase) {
      return LocalDB.getGallery();
    } else {
      try {
        const snap = await getDocs(collection(db, "gallery"));
        return snap.docs.map(d => d.data() as GalleryItem);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "gallery");
        return [];
      }
    }
  },

  async addGalleryItem(item: GalleryItem): Promise<void> {
    if (isMockFirebase) {
      const list = LocalDB.getGallery();
      list.push(item);
      LocalDB.saveGallery(list);
    } else {
      try {
        await setDoc(doc(db, "gallery", item.id), item);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `gallery/${item.id}`);
      }
    }
  },

  // 7. Lost And Found Notices
  async getLostAndFound(): Promise<LostAndFoundItem[]> {
    if (isMockFirebase) {
      return LocalDB.getLostAndFound();
    } else {
      try {
        const snap = await getDocs(collection(db, "lostandfound"));
        return snap.docs.map(d => d.data() as LostAndFoundItem);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "lostandfound");
        return [];
      }
    }
  },

  async createLostAndFound(item: LostAndFoundItem): Promise<void> {
    if (isMockFirebase) {
      const list = LocalDB.getLostAndFound();
      list.push(item);
      LocalDB.saveLostAndFound(list);
    } else {
      try {
        await setDoc(doc(db, "lostandfound", item.id), item);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `lostandfound/${item.id}`);
      }
    }
  },

  async updateLostAndFoundStatus(id: string, status: "lost" | "found" | "claimed"): Promise<void> {
    if (isMockFirebase) {
      const list = LocalDB.getLostAndFound();
      const updated = list.map(item => item.id === id ? { ...item, status } : item);
      LocalDB.saveLostAndFound(updated);
    } else {
      try {
        await updateDoc(doc(db, "lostandfound", id), { status });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `lostandfound/${id}`);
      }
    }
  },

  // 8. School Magazine & Curated Student Blogs
  async getBlogPosts(): Promise<BlogPost[]> {
    if (isMockFirebase) {
      return LocalDB.getBlogPosts();
    } else {
      try {
        const snap = await getDocs(collection(db, "blogposts"));
        return snap.docs.map(d => d.data() as BlogPost);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "blogposts");
        return [];
      }
    }
  },

  async createBlogPost(post: BlogPost): Promise<void> {
    if (isMockFirebase) {
      const list = LocalDB.getBlogPosts();
      list.push(post);
      LocalDB.saveBlogPosts(list);
    } else {
      try {
        await setDoc(doc(db, "blogposts", post.id), post);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `blogposts/${post.id}`);
      }
    }
  },

  // 9. Digital Permission Sign Slips
  async getPermissionSlips(): Promise<PermissionSlip[]> {
    if (isMockFirebase) {
      return LocalDB.getPermissionSlips();
    } else {
      try {
        const snap = await getDocs(collection(db, "permissionslips"));
        return snap.docs.map(d => d.data() as PermissionSlip);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "permissionslips");
        return [];
      }
    }
  },

  async createPermissionSlip(slip: PermissionSlip): Promise<void> {
    if (isMockFirebase) {
      const list = LocalDB.getPermissionSlips();
      list.push(slip);
      LocalDB.savePermissionSlips(list);
    } else {
      try {
        await setDoc(doc(db, "permissionslips", slip.id), slip);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `permissionslips/${slip.id}`);
      }
    }
  },

  async signPermissionSlip(slipId: string, parentEmail: string, parentName: string): Promise<void> {
    if (isMockFirebase) {
      const list = LocalDB.getPermissionSlips();
      const updated = list.map(slip => {
        if (slip.id === slipId) {
          return {
            ...slip,
            signatures: {
              ...slip.signatures,
              [parentEmail.toLowerCase()]: {
                signed: true,
                signedAt: new Date().toISOString(),
                parentName
              }
            }
          };
        }
        return slip;
      });
      LocalDB.savePermissionSlips(updated);
    } else {
      try {
        const docRef = doc(db, "permissionslips", slipId);
        const updates = {
          [`signatures.${parentEmail.replace(/\./g, "_")}`]: {
            signed: true,
            signedAt: new Date().toISOString(),
            parentName
          }
        };
        await updateDoc(docRef, updates);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `permissionslips/${slipId}`);
      }
    }
  }
};

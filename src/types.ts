export type UserRole = "admin" | "teacher" | "parent";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  house?: "Red" | "Blue" | "Gold" | "None";
  studentName?: string; // If parent, the child's name
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  house: "Red" | "Blue" | "Gold";
  class: string; // e.g. "Grade 5-A", "Grade 6-B"
  rollNo: string;
  guardianEmail: string;
  meritPoints: number;
  attendancePercentage: number;
  academicGrades: {
    [subject: string]: string; // e.g. { "Mathematics": "A", "Science": "B+" }
  };
  createdAt: string;
}

export interface BadgeLog {
  id: string;
  studentId: string;
  studentName: string;
  badgeTitle: string;
  badgeIcon: string;
  description: string;
  awardedBy: string; // Teacher's name
  awardedById: string;
  awardedAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  class: string;
  dueDate: string;
  createdBy: string; // Teacher's name
  createdById: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string; // Parent UID or Student ID
  studentName: string;
  content: string; // Text answer
  fileUrl?: string; // Optional document link
  grade?: string; // Evaluated by teacher, e.g. "A+", "B"
  feedback?: string; // Teacher feedback
  submittedAt: string;
}

export interface Communication {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientEmail: string;
  studentId?: string;
  studentName?: string;
  message: string;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  caption: string;
  postedBy: string;
  createdAt: string;
}

export interface LostAndFoundItem {
  id: string;
  title: string;
  description: string;
  location: string;
  contact: string;
  status: "lost" | "found" | "claimed";
  imageUrl?: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  studentAuthor: string; // Student name printed as author below the article
  teacherPoster: string; // Teacher who curated/posted it
  teacherId: string;
  createdAt: string;
}

export interface PermissionSlip {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  // Map of parent email -> signature details
  signatures: {
    [parentEmail: string]: {
      signed: boolean;
      signedAt: string;
      parentName: string;
    };
  };
  createdAt: string;
}

// Language Translations Interface
export interface Translations {
  appName: string;
  dashboard: string;
  teachers: string;
  students: string;
  parentPortal: string;
  adminPortal: string;
  attendance: string;
  grades: string;
  meritPoints: string;
  teamHouse: string;
  badges: string;
  communication: string;
  gallery: string;
  lostAndFound: string;
  blogMagazine: string;
  permissionSlips: string;
  homeworkDropbox: string;
  submitHomework: string;
  signSlip: string;
  signSlipsCode: string;
  generateReport: string;
  language: string;
  loading: string;
  unauthorized: string;
  logout: string;
  save: string;
  delete: string;
  edit: string;
  add: string;
  cancel: string;
  studentName: string;
  teacherName: string;
  rollNo: string;
  classGroup: string;
  guardianEmail: string;
  meritBadgeTitle: string;
  subject: string;
  dueDate: string;
  send: string;
  writePost: string;
  activeSession: string;
  access: string;
  welcomeBack: string;
  emailAddress: string;
  password: string;
}

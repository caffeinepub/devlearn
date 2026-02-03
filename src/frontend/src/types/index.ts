// Frontend type definitions for backend data structures
// These types mirror the backend Motoko types but are defined here
// since the backend interface only exports minimal types

import type { Principal } from '@dfinity/principal';

export type CourseId = string;
export type LessonId = string;

export interface Course {
  id: CourseId;
  title: string;
  description: string;
  lessons: Lesson[];
  quizzes: Quiz[];
  codingChallenges: CodingChallenge[];
  price: bigint;
}

export interface Lesson {
  id: LessonId;
  title: string;
  description: string;
  videoBlob: { id: string; url: string };
  duration: bigint;
  isCompleted: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  questions: string[];
}

export interface CodingChallenge {
  id: string;
  title: string;
  description: string;
}

export interface CodingChallengeAttempt {
  challengeId: string;
  attempts: bigint;
  avgScore: bigint;
}

export interface AssessmentResult {
  assessmentId: string;
  assessmentType: AssessmentType;
  result: AssessmentResultType;
  timestamp: bigint;
}

export type AssessmentType = { __kind__: 'quiz' } | { __kind__: 'codingChallenge' };

export type AssessmentResultType =
  | { __kind__: 'score'; score: bigint }
  | { __kind__: 'feedback'; feedback: string }
  | { __kind__: 'success'; success: boolean };

export interface EngagementMetrics {
  videoEngagement: VideoEngagement[];
  quizTries: QuizTry[];
  codingChallengeAttempts: CodingChallengeAttempt[];
  attentionScore: bigint;
}

export interface QuizTry {
  quizId: string;
  attempts: bigint;
  avgScore: bigint;
}

export interface VideoEngagement {
  lessonId: LessonId;
  attentionScore: bigint;
  participationScore: bigint;
}

export interface UserProfile {
  id: Principal;
  name: string;
  isInstructor: boolean;
  courseProgress: CourseProgress[];
  assessmentHistory: AssessmentResult[];
  earnedCertificates: Certificate[];
  engagementMetrics: EngagementMetrics;
  purchasedCourses: CourseId[];
}

export interface CourseProgress {
  courseId: CourseId;
  completedLessons: bigint;
  totalLessons: bigint;
  progress: bigint;
}

export interface Certificate {
  id: string;
  userId: Principal;
  courseId: CourseId;
  courseTitle: string;
  userName: string;
  completionDate: bigint;
  engagementScore: bigint;
  quizResults: QuizResult[];
  codingChallengeResults: CodingChallengeResult[];
}

export interface QuizResult {
  quizId: string;
  title: string;
  score: bigint;
  totalQuestions: bigint;
}

export interface CodingChallengeResult {
  challengeId: string;
  title: string;
  score: bigint;
  testCasesPassed: bigint;
  totalTestCases: bigint;
}

export interface CertificateAnalytics {
  engagementScore: bigint;
  quizAverage: bigint;
  codingChallengeStats: CodingChallengeStats;
  quizResults: QuizResult[];
  codingChallengeResults: CodingChallengeResult[];
}

export interface CodingChallengeStats {
  averageScore: bigint;
  totalChallenges: bigint;
  completedChallenges: bigint;
}

// External Certification Types
export interface ExternalApiConfig {
  id: string;
  name: string;
  endpointUrl: string;
  apiKey: string;
  isActive: boolean;
  providerType: string;
  supportedCourses: string[];
}

export interface ExternalRegistrationRecord {
  externalId: string;
  providerName: string;
  courseId: string;
  userId: Principal;
  registrationDate: bigint;
  status: 'pending' | 'in_progress' | 'success' | 'failed' | 'external_verification';
  responseData: string;
  verificationLink?: string;
  externalRecordId?: string;
}

export interface VerifiedAlumniRecord {
  userId: Principal;
  completionDate: bigint;
  externalRegistrations: ExternalRegistrationRecord[];
  certificateId: string;
  verified: boolean;
  graduationDate: bigint;
  engagementScore: bigint;
  quizAverage: bigint;
  codingScore: bigint;
  courseTitle: string;
  courseId: CourseId;
}


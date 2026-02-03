import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Result_2 = {
    __kind__: "ok";
    ok: Array<Course>;
} | {
    __kind__: "err";
    err: string;
};
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface Quiz {
    id: string;
    title: string;
    questions: Array<string>;
}
export interface VideoEngagement {
    participationScore: bigint;
    lessonId: LessonId;
    attentionScore: bigint;
}
export type Result_1 = {
    __kind__: "ok";
    ok: UserProfile;
} | {
    __kind__: "err";
    err: string;
};
export interface Course {
    id: CourseId;
    title: string;
    codingChallenges: Array<CodingChallenge>;
    description: string;
    lessons: Array<Lesson>;
    price: bigint;
    quizzes: Array<Quiz>;
}
export interface EngagementMetrics {
    videoEngagement: Array<VideoEngagement>;
    codingChallengeAttempts: Array<CodingChallengeAttempt>;
    attentionScore: bigint;
    quizTries: Array<QuizTry>;
}
export interface Lesson {
    id: LessonId;
    title: string;
    duration: bigint;
    isCompleted: boolean;
    description: string;
    videoBlob: {
        id: string;
        url: string;
    };
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface SystemHealth {
    courseCount: bigint;
    initializationComplete: boolean;
    adminAssigned: boolean;
    coursesLoaded: boolean;
    systemReady: boolean;
}
export type CourseId = string;
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface CodingChallenge {
    id: string;
    title: string;
    description: string;
}
export interface CodingChallengeAttempt {
    avgScore: bigint;
    attempts: bigint;
    challengeId: string;
}
export type LessonId = string;
export interface QuizResult {
    title: string;
    score: bigint;
    totalQuestions: bigint;
    quizId: string;
}
export interface QuizTry {
    avgScore: bigint;
    attempts: bigint;
    quizId: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export type Result_3 = {
    __kind__: "ok";
    ok: Course | null;
} | {
    __kind__: "err";
    err: string;
};
export type Result = {
    __kind__: "ok";
    ok: Course;
} | {
    __kind__: "err";
    err: string;
};
export type AssessmentResultType = {
    __kind__: "feedback";
    feedback: string;
} | {
    __kind__: "score";
    score: bigint;
} | {
    __kind__: "success";
    success: boolean;
};
export interface CodingChallengeResult {
    title: string;
    testCasesPassed: bigint;
    score: bigint;
    challengeId: string;
    totalTestCases: bigint;
}
export interface AssessmentResult {
    result: AssessmentResultType;
    assessmentType: AssessmentType;
    timestamp: Time;
    assessmentId: string;
}
export interface CourseProgress {
    totalLessons: bigint;
    progress: bigint;
    completedLessons: bigint;
    courseId: CourseId;
}
export interface Certificate {
    id: string;
    userName: string;
    completionDate: bigint;
    userId: Principal;
    codingChallengeResults: Array<CodingChallengeResult>;
    quizResults: Array<QuizResult>;
    courseTitle: string;
    engagementScore: bigint;
    courseId: CourseId;
}
export interface UserProfile {
    id: Principal;
    isInstructor: boolean;
    earnedCertificates: Array<Certificate>;
    assessmentHistory: Array<AssessmentResult>;
    engagementMetrics: EngagementMetrics;
    name: string;
    purchasedCourses: Array<CourseId>;
    courseProgress: Array<CourseProgress>;
}
export enum AssessmentType {
    quiz = "quiz",
    codingChallenge = "codingChallenge"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    finalizeCoursePurchase(courseId: string, stripeSessionId: string): Promise<Result_1>;
    getCallerUserProfile(): Promise<Result_1>;
    getCallerUserRole(): Promise<UserRole>;
    getCourse(courseId: string): Promise<Result_3>;
    getCourses(): Promise<Result_2>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getSystemHealth(): Promise<SystemHealth>;
    getUserProfiles(): Promise<Array<UserProfile>>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<Result_1>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateCoursePrice(courseId: string, price: bigint): Promise<Result>;
}

import List "mo:core/List";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import Error "mo:core/Error";

actor {
  // Type definitions
  type CourseId = Text;
  type LessonId = Text;
  type PaymentStatus = {
    #pending;
    #completed;
    #failed;
    #refunded;
  };

  public type AssessmentType = {
    #quiz;
    #codingChallenge;
  };

  public type AssessmentResultType = {
    #score : Nat;
    #feedback : Text;
    #success : Bool;
  };

  public type EngagementMetrics = {
    videoEngagement : [VideoEngagement];
    quizTries : [QuizTry];
    codingChallengeAttempts : [CodingChallengeAttempt];
    attentionScore : Nat;
  };

  public type CodingChallengeAttempt = {
    challengeId : Text;
    attempts : Nat;
    avgScore : Nat;
  };

  public type QuizTry = {
    quizId : Text;
    attempts : Nat;
    avgScore : Nat;
  };

  public type VideoEngagement = {
    lessonId : LessonId;
    attentionScore : Nat;
    participationScore : Nat;
  };

  public type PaymentTransaction = {
    userId : Principal;
    courseId : CourseId;
    amount : Nat;
    date : Time.Time;
    status : PaymentStatus;
    transactionId : Text;
  };

  public type PurchaseRecord = {
    userId : Principal;
    courseId : CourseId;
    purchaseDate : Time.Time;
    paymentStatus : PaymentStatus;
    stripeSessionId : Text;
  };

  public type AssessmentResult = {
    assessmentId : Text;
    assessmentType : AssessmentType;
    result : AssessmentResultType;
    timestamp : Time.Time;
  };

  type Quiz = {
    id : Text;
    title : Text;
    questions : [Text];
  };

  type CodingChallenge = {
    id : Text;
    title : Text;
    description : Text;
  };

  public type Course = {
    id : CourseId;
    title : Text;
    description : Text;
    lessons : [Lesson];
    quizzes : [Quiz];
    codingChallenges : [CodingChallenge];
    price : Nat; // Price in cents (USD)
  };

  public type Lesson = {
    id : LessonId;
    title : Text;
    description : Text;
    videoBlob : { id : Text; url : Text };
    duration : Nat;
    isCompleted : Bool;
  };

  public type UserProfile = {
    id : Principal;
    name : Text;
    isInstructor : Bool;
    courseProgress : [CourseProgress];
    assessmentHistory : [AssessmentResult];
    earnedCertificates : [Certificate];
    engagementMetrics : EngagementMetrics;
    purchasedCourses : [CourseId];
  };

  public type CourseProgress = {
    courseId : CourseId;
    completedLessons : Nat;
    totalLessons : Nat;
    progress : Nat;
  };

  public type Certificate = {
    id : Text;
    userId : Principal;
    courseId : CourseId;
    courseTitle : Text;
    userName : Text;
    completionDate : Int;
    engagementScore : Nat;
    quizResults : [QuizResult];
    codingChallengeResults : [CodingChallengeResult];
  };

  public type QuizResult = {
    quizId : Text;
    title : Text;
    score : Nat;
    totalQuestions : Nat;
  };

  public type CodingChallengeResult = {
    challengeId : Text;
    title : Text;
    score : Nat;
    testCasesPassed : Nat;
    totalTestCases : Nat;
  };

  public type CodingChallengeStats = {
    averageScore : Nat;
    totalChallenges : Nat;
    completedChallenges : Nat;
  };

  public type CertificateAnalytics = {
    engagementScore : Nat;
    quizAverage : Nat;
    codingChallengeStats : CodingChallengeStats;
    quizResults : [QuizResult];
    codingChallengeResults : [CodingChallengeResult];
  };

  public type SystemHealth = {
    initializationComplete : Bool;
    coursesLoaded : Bool;
    courseCount : Nat;
    adminAssigned : Bool;
    systemReady : Bool;
  };

  // External API types
  public type ExternalApiConfig = {
    id : Text;
    name : Text;
    endpointUrl : Text;
    apiKey : Text;
    isActive : Bool;
    providerType : ProviderType;
    testData : Text;
    supportedCourses : [CourseId];
    verificationEndpoint : ?Text;
    requestFormat : RequestFormat;
    responseFormat : ResponseFormat;
  };

  public type ProviderType = {
    #aws_certify;
    #google_courses;
    #ibm_cloud;
    #custom_provider : Text;
    #accreditation_center;
    #education_vendor;
    #blockchain_certification;
    #test_provider;
  };

  public type RequestFormat = {
    #json;
    #xml;
    #custom : Text;
  };

  public type ResponseFormat = {
    #json;
    #xml;
    #custom : Text;
  };

  public type ExternalRegistrationStatus = {
    #pending;
    #in_progress;
    #success;
    #failed;
    #external_verification;
  };

  public type ExternalRegistrationRecord = {
    externalId : Text;
    providerName : Text;
    courseId : CourseId;
    userId : Principal;
    registrationDate : Time.Time;
    status : ExternalRegistrationStatus;
    responseData : Text;
    verificationLink : ?Text;
    externalRecordId : ?Text;
    rawProviderData : ?Text;
  };

  public type VerifiedAlumniRecord = {
    userId : Principal;
    completionDate : Time.Time;
    externalRegistrations : [ExternalRegistrationRecord];
    certificateId : Text;
    verified : Bool;
    graduationDate : Time.Time;
    engagementScore : Nat;
    quizAverage : Nat;
    codingScore : Nat;
    courseTitle : Text;
    courseId : CourseId;
  };

  // Internal state and type aliases
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let certificates = Map.empty<Text, Certificate>();
  var userProfiles = Map.empty<Principal, UserProfile>();
  var firstUserPrincipal : ?Principal = null;
  var legacyCourses = Map.empty<CourseId, Course>();
  let purchaseRecords = Map.empty<Text, PurchaseRecord>();
  var stripeConfig : ?Stripe.StripeConfiguration = null;
  var initialCoursesPopulated = false;
  var adminInitializationComplete = false;

  let alumniRegistry = Map.empty<Text, VerifiedAlumniRecord>();
  let externalConfigs = Map.empty<Text, ExternalApiConfig>();

  // Internal helper types and functions
  public type Result<T> = {
    #ok : T;
    #err : Text;
  };
  type InternalResult<T> = Result<T>;

  func map<T, U>(r : Result<T>, f : (T) -> U) : Result<U> {
    switch (r) {
      case (#ok(val)) { #ok(f(val)) };
      case (#err(msg)) { #err(msg) };
    };
  };
  public type Maybe<T> = ?T;

  func userProfileCompare(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
    Text.compare(profile1.name, profile2.name);
  };

  // Public getter for profiles
  public query ({ caller }) func getUserProfiles() : async [UserProfile] {
    let profilesList = List.empty<UserProfile>();
    let iter = profilesList.values();
    iter.toArray();
  };

  func defaultUserProfile(principal : Principal) : UserProfile {
    {
      id = principal;
      name = "Anonymous";
      isInstructor = false;
      courseProgress = [];
      assessmentHistory = [];
      earnedCertificates = [];
      engagementMetrics = defaultMetrics();
      purchasedCourses = [];
    };
  };

  func defaultMetrics() : EngagementMetrics {
    {
      videoEngagement = [];
      quizTries = [];
      codingChallengeAttempts = [];
      attentionScore = 0;
    };
  };

  func findCourseProgressForResult(progressArray : [CourseProgress], courseId : CourseId) : InternalResult<CourseProgress> {
    let filteredArray = progressArray.filter(func(progress) { progress.courseId == courseId });
    if (filteredArray.size() == 0) {
      #err("Course progress not found for courseId: " # courseId);
    } else { #ok(filteredArray[0]) };
  };

  func updateLessonProgressHelper(courseProgress : CourseProgress, isCompleted : Bool, _lessonId : LessonId) : CourseProgress {
    let completedLessons = if (isCompleted) { courseProgress.completedLessons + 1 } else {
      Nat.sub(courseProgress.completedLessons, 1);
    };
    {
      courseProgress with
      completedLessons;
      progress = calculateProgress(completedLessons, courseProgress.totalLessons);
    };
  };

  func filterCourseProgress(progressArray : [CourseProgress], courseId : CourseId) : [CourseProgress] {
    progressArray.filter(
      func(progress) { progress.courseId != courseId }
    );
  };

  func calculateProgress(completed : Nat, total : Nat) : Nat {
    if (total == 0) { return 0 };
    (completed * 100) / total;
  };

  func isQuizComplete(_lesson : Lesson) : Bool {
    true;
  };

  func isCodingChallengeComplete(_lesson : Lesson) : Bool {
    true;
  };

  func hasUserPurchasedCourse(userId : Principal, courseId : CourseId) : Bool {
    switch (userProfiles.get(userId)) {
      case (null) { false };
      case (?profile) {
        profile.purchasedCourses.filter(func(id) { id == courseId }).size() > 0;
      };
    };
  };

  func isCourseFree(courseId : CourseId) : Bool {
    switch (legacyCourses.get(courseId)) {
      case (null) { false };
      case (?course) { course.price == 0 };
    };
  };

  func ensureUserProfile(caller : Principal) : UserProfile {
    switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) {
        let newProfile = defaultUserProfile(caller);
        userProfiles.add(caller, newProfile);
        newProfile;
      };
    };
  };

  func initializeFirstUserAsAdmin(caller : Principal) {
    if (caller.isAnonymous()) { return };

    switch (firstUserPrincipal) {
      case (null) {
        switch (userProfiles.get(caller)) {
          case (null) {
            let defaultProfile = defaultUserProfile(caller);
            userProfiles.add(caller, defaultProfile);
          };
          case (?_) { () };
        };

        firstUserPrincipal := ?caller;
        AccessControl.initialize(accessControlState, caller, "", "");
        adminInitializationComplete := true;
      };
      case (?existingAdmin) { () };
    };
  };

  func initializeDefaultCourses() {
    let coursesArray = [
      {
        id = "full_stack_intro";
        title = "Intro to Full-Stack Development";
        description = "Comprehensive course on HTML, CSS, JavaScript, React, and Motoko programming";
        lessons = [
          {
            id = "lesson1";
            title = "HTML Fundamentals";
            description = "Learn the basics of HTML structure and elements";
            videoBlob = { id = "video1"; url = "/generated/video-placeholder.dim_400x300.png" };
            duration = 30;
            isCompleted = false;
          },
        ];
        quizzes = [{
          id = "quiz1";
          title = "HTML Basics Quiz";
          questions = [
            "What does HTML stand for?",
            "Which tag is used for paragraphs?",
            "How do you create a link?",
          ];
        }];
        codingChallenges = [{
          id = "challenge1";
          title = "Create a Simple HTML Page";
          description = "Build a basic HTML page with headings and paragraphs";
        }];
        price = 4999;
      },
      {
        id = "web_security";
        title = "Web Security Fundamentals";
        description = "Learn authentication, encryption, and secure API design";
        lessons = [
          {
            id = "lesson1";
            title = "Authentication Methods";
            description = "Understanding different authentication approaches";
            videoBlob = { id = "video2"; url = "/generated/video-placeholder.dim_400x300.png" };
            duration = 25;
            isCompleted = false;
          },
        ];
        quizzes = [{
          id = "quiz1";
          title = "Security Basics Quiz";
          questions = [
            "What is authentication?",
            "What is encryption?",
          ];
        }];
        codingChallenges = [{
          id = "challenge1";
          title = "Implement Secure Authentication";
          description = "Build a secure authentication system";
        }];
        price = 3999;
      },
      {
        id = "dapps";
        title = "Building Decentralized Apps (dApps)";
        description = "Master canister architecture and smart contract development";
        lessons = [
          {
            id = "lesson1";
            title = "Canister Architecture";
            description = "Understanding Internet Computer canisters";
            videoBlob = { id = "video3"; url = "/generated/video-placeholder.dim_400x300.png" };
            duration = 35;
            isCompleted = false;
          },
        ];
        quizzes = [{
          id = "quiz1";
          title = "DApp Concepts Quiz";
          questions = [
            "What is a canister?",
            "What is a smart contract?",
          ];
        }];
        codingChallenges = [{
          id = "challenge1";
          title = "Create a Simple Canister";
          description = "Build your first Internet Computer canister";
        }];
        price = 5999;
      },
      {
        id = "ai_interfaces";
        title = "AI-Powered Interfaces";
        description = "Build intelligent user interfaces with AI integration";
        lessons = [
          {
            id = "lesson1";
            title = "UX Automation Principles";
            description = "Learn how AI enhances user experience";
            videoBlob = { id = "video4"; url = "/generated/video-placeholder.dim_400x300.png" };
            duration = 30;
            isCompleted = false;
          },
        ];
        quizzes = [{
          id = "quiz1";
          title = "AI Concepts Quiz";
          questions = [
            "What is UX automation?",
            "How does AI improve interfaces?",
          ];
        }];
        codingChallenges = [{
          id = "challenge1";
          title = "Integrate AI API";
          description = "Connect an AI service to your application";
        }];
        price = 6999;
      },
    ];

    legacyCourses.clear();
    coursesArray.forEach(func(course) { legacyCourses.add(course.id, course) });
  };

  // Addded: stripe integration (finalized)
  system func preupgrade() {};
  system func postupgrade() {
    if (not initialCoursesPopulated or legacyCourses.size() < 4) {
      initializeDefaultCourses();
      initialCoursesPopulated := true;
    };
  };

  public query func isStripeConfigured() : async Bool {
    not (stripeConfig == null);
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public query func getSystemHealth() : async SystemHealth {
    let coursesExist = legacyCourses.size() >= 4;
    let adminExists = firstUserPrincipal != null and adminInitializationComplete;
    let initComplete = initialCoursesPopulated;
    let systemReady = initComplete and coursesExist and adminExists;

    {
      initializationComplete = initComplete;
      coursesLoaded = coursesExist;
      courseCount = legacyCourses.size();
      adminAssigned = adminExists;
      systemReady = systemReady;
    };
  };

  // ADDED: Unified shared getCallerUserProfile endpoint
  public shared ({ caller }) func getCallerUserProfile() : async Result<UserProfile> {
    try {
      if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
        Runtime.trap("Unauthorized: Only users can retrieve their profile");
      };
      // Always ensures a profile is created for new users.
      let profile = ensureUserProfile(caller);
      #ok(profile);
    } catch (err : Error.Error) {
      #err("Error retrieving profile for " # caller.toText() # ": " # err.message());
    };
  };

  // ADDED: Strict shared saveCallerUserProfile endpoint
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async Result<UserProfile> {
    try {
      if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
        Runtime.trap("Unauthorized: Only users can save their profile");
      };
      if (profile.id != caller) {
        Runtime.trap("Unauthorized: Injected principal does not match caller");
      };
      userProfiles.add(caller, profile);
      #ok(profile);
    } catch (err : Error.Error) {
      #err("Error saving profile for " # caller.toText() # ": " # err.message());
    };
  };

  public query ({ caller }) func getCourses() : async Result<[Course]> {
    try {
      let courses = legacyCourses.values().toArray();
      #ok(courses);
    } catch (err : Error.Error) {
      #err("Failed to retrieve courses: " # err.message());
    };
  };

  public query ({ caller }) func getCourse(courseId : Text) : async Result<?Course> {
    try {
      let course = legacyCourses.get(courseId);
      #ok(course);
    } catch (err : Error.Error) {
      #err("Failed to retrieve course: " # err.message());
    };
  };

  public shared ({ caller }) func updateCoursePrice(courseId : Text, price : Nat) : async Result<Course> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update course prices");
    };
    switch (legacyCourses.get(courseId)) {
      case (null) {
        #err("Course not found for ID: " # courseId);
      };
      case (?existingCourse) {
        let updatedCourse = { existingCourse with price };
        legacyCourses.add(courseId, updatedCourse);
        #ok(updatedCourse);
      };
    };
  };

  public shared ({ caller }) func finalizeCoursePurchase(courseId : Text, stripeSessionId : Text) : async Result<UserProfile> {
    // Check existing purchase record.
    switch (purchaseRecords.get(stripeSessionId)) {
      case (?purchaseRecord) {
        if (purchaseRecord.paymentStatus == #completed) {
          // Already processed.
          switch (userProfiles.get(caller)) {
            case (?profile) { return #ok(profile) };
            case (null) {
              return #err("Internal error: Profile not found in existing purchase record");
            };
          };
        } else {
          // Existing purchase, but not completed. Continue with normal flow.
        };
      };
      case (null) {
        // No existing record, continue with normal processing.
      };
    };
    let stripeStatus = await getStripeSessionStatus(stripeSessionId);
    switch (stripeStatus) {
      case (#failed { error }) {
        #err("Payment failed: " # error);
      };
      case (#completed _) {
        // Assuming completed means payment is successful.
        let updatedProfile = addCourseToProfile(caller, courseId);
        switch (updatedProfile) {
          case (#ok(profile)) {
            let newPurchaseRecord = {
              userId = caller;
              courseId;
              purchaseDate = Time.now();
              paymentStatus = #completed;
              stripeSessionId;
            };
            purchaseRecords.add(stripeSessionId, newPurchaseRecord);
            #ok(profile);
          };
          case (#err(error)) {
            // Should never happen here.
            #err("Internal Profile update error: " # error);
          };
        };
      };
      case (_) {
        #err("Invalid Stripe session status");
      };
    };
  };

  func addCourseToProfile(caller : Principal, courseId : Text) : Result<UserProfile> {
    switch (userProfiles.get(caller)) {
      case (?currentProfile) {
        // Add course if not already purchased.
        if (not hasUserPurchasedCourse(caller, courseId)) {
          let updatedPurchases = currentProfile.purchasedCourses.concat([courseId]);
          let updatedProfile = { currentProfile with purchasedCourses = updatedPurchases };
          userProfiles.add(caller, updatedProfile);
          #ok(updatedProfile);
        } else {
          // Course already purchased, return current profile.
          #ok(currentProfile);
        };
      };
      case (null) {
        // Create new profile with purchased course.
        let newProfile = {
          id = caller;
          name = "Anonymous";
          isInstructor = false;
          courseProgress = [];
          assessmentHistory = [];
          earnedCertificates = [];
          engagementMetrics = defaultMetrics();
          purchasedCourses = [courseId];
        };
        userProfiles.add(caller, newProfile);
        #ok(newProfile);
      };
    };
  };
};

import type { Course } from '../types';

export const defaultCourses: Course[] = [
  {
    id: 'full_stack_intro',
    title: 'Intro to Full-Stack Development',
    description: 'Comprehensive course on HTML, CSS, JavaScript, React, and Motoko programming',
    lessons: [
      {
        id: 'lesson1',
        title: 'HTML Fundamentals',
        description: 'Learn the basics of HTML structure and elements',
        videoBlob: { id: 'video1', url: '/assets/generated/video-placeholder.dim_400x300.png' },
        duration: BigInt(30),
        isCompleted: false,
      },
    ],
    quizzes: [
      {
        id: 'quiz1',
        title: 'HTML Basics Quiz',
        questions: ['What does HTML stand for?', 'Which tag is used for paragraphs?', 'How do you create a link?'],
      },
    ],
    codingChallenges: [
      {
        id: 'challenge1',
        title: 'Create a Simple HTML Page',
        description: 'Build a basic HTML page with headings and paragraphs',
      },
    ],
    price: BigInt(4999),
  },
  {
    id: 'web_security',
    title: 'Web Security Fundamentals',
    description: 'Learn authentication, encryption, and secure API design',
    lessons: [
      {
        id: 'lesson1',
        title: 'Authentication Methods',
        description: 'Understanding different authentication approaches',
        videoBlob: { id: 'video2', url: '/assets/generated/video-placeholder.dim_400x300.png' },
        duration: BigInt(25),
        isCompleted: false,
      },
    ],
    quizzes: [
      {
        id: 'quiz1',
        title: 'Security Basics Quiz',
        questions: ['What is authentication?', 'What is encryption?'],
      },
    ],
    codingChallenges: [
      {
        id: 'challenge1',
        title: 'Implement Secure Authentication',
        description: 'Build a secure authentication system',
      },
    ],
    price: BigInt(3999),
  },
  {
    id: 'dapps',
    title: 'Building Decentralized Apps (dApps)',
    description: 'Master canister architecture and smart contract development',
    lessons: [
      {
        id: 'lesson1',
        title: 'Canister Architecture',
        description: 'Understanding Internet Computer canisters',
        videoBlob: { id: 'video3', url: '/assets/generated/video-placeholder.dim_400x300.png' },
        duration: BigInt(35),
        isCompleted: false,
      },
    ],
    quizzes: [
      {
        id: 'quiz1',
        title: 'DApp Concepts Quiz',
        questions: ['What is a canister?', 'What is a smart contract?'],
      },
    ],
    codingChallenges: [
      {
        id: 'challenge1',
        title: 'Create a Simple Canister',
        description: 'Build your first Internet Computer canister',
      },
    ],
    price: BigInt(5999),
  },
  {
    id: 'ai_interfaces',
    title: 'AI-Powered Interfaces',
    description: 'Build intelligent user interfaces with AI integration',
    lessons: [
      {
        id: 'lesson1',
        title: 'UX Automation Principles',
        description: 'Learn how AI enhances user experience',
        videoBlob: { id: 'video4', url: '/assets/generated/video-placeholder.dim_400x300.png' },
        duration: BigInt(30),
        isCompleted: false,
      },
    ],
    quizzes: [
      {
        id: 'quiz1',
        title: 'AI Concepts Quiz',
        questions: ['What is UX automation?', 'How does AI improve interfaces?'],
      },
    ],
    codingChallenges: [
      {
        id: 'challenge1',
        title: 'Integrate AI API',
        description: 'Connect an AI service to your application',
      },
    ],
    price: BigInt(6999),
  },
];


import type { Relation } from 'typeorm';
import { User } from './core.entity.js';
import { Course, Lesson } from './education.entity.js';
export declare class Test {
    id: string;
    course: Relation<Course | null>;
    lesson: Relation<Lesson | null>;
    title: string;
    description: string | null;
    passingScore: number;
    timeLimitSeconds: number | null;
    attemptLimit: number | null;
    status: 'draft' | 'published' | 'archived';
    createdAt: Date;
    updatedAt: Date;
    questions: Relation<Question[]>;
    attempts: Relation<TestAttempt[]>;
}
export declare class Question {
    id: string;
    test: Relation<Test>;
    prompt: string;
    position: number;
    points: number;
    allowMultipleAnswers: boolean;
    createdAt: Date;
    updatedAt: Date;
    options: Relation<AnswerOption[]>;
    studentAnswers: Relation<StudentAnswer[]>;
}
export declare class AnswerOption {
    id: string;
    question: Relation<Question>;
    text: string;
    position: number;
    isCorrect: boolean;
    createdAt: Date;
    studentSelections: Relation<StudentAnswerOption[]>;
}
export declare class TestAttempt {
    id: string;
    test: Relation<Test>;
    user: Relation<User>;
    attemptNumber: number;
    startedAt: Date;
    submittedAt: Date | null;
    scorePercent: number | null;
    passed: boolean | null;
    createdAt: Date;
    answers: Relation<StudentAnswer[]>;
}
export declare class StudentAnswer {
    id: string;
    attempt: Relation<TestAttempt>;
    question: Relation<Question>;
    isCorrectSnapshot: boolean | null;
    awardedPoints: number | null;
    createdAt: Date;
    selectedOptions: Relation<StudentAnswerOption[]>;
}
export declare class StudentAnswerOption {
    id: string;
    studentAnswer: Relation<StudentAnswer>;
    answerOption: Relation<AnswerOption>;
    createdAt: Date;
}

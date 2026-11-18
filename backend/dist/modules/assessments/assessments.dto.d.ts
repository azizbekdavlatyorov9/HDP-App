export declare class OptionDto {
    text: string;
    isCorrect: boolean;
}
export declare class QuestionDto {
    prompt: string;
    points: number;
    allowMultipleAnswers: boolean;
    options: OptionDto[];
}
export declare class CreateTestDto {
    courseId?: string;
    lessonId?: string;
    title: string;
    description?: string;
    passingScore: number;
    timeLimitSeconds?: number;
    attemptLimit?: number;
    questions: QuestionDto[];
}
export declare class SubmitAnswerDto {
    questionId: string;
    optionIds: string[];
}
export declare class SubmitTestDto {
    answers: SubmitAnswerDto[];
}

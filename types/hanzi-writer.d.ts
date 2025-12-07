declare module 'hanzi-writer' {
    export interface HanziWriterOptions {
        width?: number;
        height?: number;
        padding?: number;
        showOutline?: boolean;
        strokeAnimationSpeed?: number;
        delayBetweenStrokes?: number;
        strokeColor?: string;
        radicalColor?: string;
        outlineColor?: string;
        drawingWidth?: number;
        showCharacter?: boolean;
        showHintAfterMisses?: number;
        highlightOnComplete?: boolean;
        charDataLoader?: (char: string, onComplete: (data: any) => void) => void;
        // Add other options as needed
    }

    export interface QuizOptions {
        leniency?: number;
        acceptBackwardsStrokes?: boolean;
        showHintAfterMisses?: number | false;
        markStrokeCorrectAfterMisses?: number | false;
        quizStartStrokeNum?: number;
        highlightOnComplete?: boolean;
        onMistake?: (strokeData: any) => void;
        onCorrectStroke?: (strokeData: any) => void;
        onComplete?: (summary: any) => void;
    }

    export default class HanziWriter {
        static create(element: HTMLElement | string, character: string, options?: HanziWriterOptions): HanziWriter;

        showCharacter(options?: { onComplete?: () => void }): void;
        hideCharacter(options?: { onComplete?: () => void }): void;
        animateCharacter(options?: { onComplete?: () => void }): void;
        loopCharacterAnimation(): void;
        showOutline(options?: { onComplete?: () => void }): void;
        hideOutline(options?: { onComplete?: () => void }): void;
        updateColor(colorName: string, colorValue: string, options?: { onComplete?: () => void }): void;
        quiz(options?: QuizOptions): void;
        cancelQuiz(): void;
        setCharacter(character: string): void;
    }
}

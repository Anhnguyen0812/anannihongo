'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import HanziWriter from 'hanzi-writer';

interface WritingWidgetProps {
    text: string;
    showOutline?: boolean;
    mode: 'QUIZ' | 'TRACE';
    onComplete?: () => void;
}

interface CharState {
    char: string;
    status: 'pending' | 'active' | 'completed' | 'error';
    writer: HanziWriter | null;
}

const WritingWidget: React.FC<WritingWidgetProps> = ({
    text,
    showOutline = true,
    mode,
    onComplete,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [charStates, setCharStates] = useState<CharState[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const writersRef = useRef<Map<number, HanziWriter>>(new Map());
    const charSize = 150;

    // Initialize character states
    useEffect(() => {
        const chars = text.split('');
        setCharStates(chars.map((char, index) => ({
            char,
            status: index === 0 ? 'active' : 'pending',
            writer: null,
        })));
        setCurrentIndex(0);
        writersRef.current.clear();
    }, [text]);

    // Initialize HanziWriter for each character
    useEffect(() => {
        if (!containerRef.current || charStates.length === 0) return;

        charStates.forEach((state, index) => {
            if (writersRef.current.has(index)) return; // Already initialized

            const charDiv = document.getElementById(`hanzi-char-${index}`);
            if (!charDiv) return;

            // Skip only special characters (punctuation, spaces, etc.)
            // Youyin CDN supports Kanji, Hiragana, and Katakana
            const isWritableChar = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/.test(state.char);
            if (!isWritableChar) {
                setCharStates(prev => prev.map((s, i) =>
                    i === index ? { ...s, status: 'completed' } : s
                ));
                return;
            }

            try {
                const writer = HanziWriter.create(charDiv, state.char, {
                    width: charSize,
                    height: charSize,
                    padding: 15,
                    showOutline: showOutline,
                    strokeColor: '#333333',
                    radicalColor: '#168F16',
                    outlineColor: '#DDD',
                    showCharacter: false,
                    showHintAfterMisses: 3,
                    charDataLoader: (char: string, onComplete: (data: any) => void) => {
                        // Use Youyin CDN which supports Hiragana, Katakana, and Kanji
                        const url = `https://cdn.jsdelivr.net/gh/MadLadSquad/hanzi-writer-data-youyin@latest/data/${char}.json`;

                        fetch(url)
                            .then(res => {
                                if (!res.ok) {
                                    throw new Error(`HTTP ${res.status}`);
                                }
                                return res.json();
                            })
                            .then(onComplete)
                            .catch(err => {
                                console.error(`Failed to load char data for ${char}:`, err);
                                // Mark as error -> fallback to text display
                                setCharStates(prev => prev.map((s, i) =>
                                    s.char === char ? { ...s, status: 'error' } : s
                                ));
                            });
                    },
                    onLoadCharDataSuccess: () => {
                        writersRef.current.set(index, writer);
                    },
                    onLoadCharDataError: () => {
                        setCharStates(prev => prev.map((s, i) =>
                            i === index ? { ...s, status: 'error' } : s
                        ));
                    }
                } as any);

                writersRef.current.set(index, writer);
            } catch (error) {
                console.error('Error creating HanziWriter:', error);
            }
        });
    }, [charStates, showOutline, charSize]);

    const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (completionTimeoutRef.current) {
                clearTimeout(completionTimeoutRef.current);
            }
        };
    }, []);

    // Handle quiz mode for current character
    useEffect(() => {
        const currentWriter = writersRef.current.get(currentIndex);
        const currentState = charStates[currentIndex];

        if (!currentWriter || !currentState || currentState.status === 'error' || currentState.status === 'completed') {
            // If current char is error/completed, move to next
            if (currentState && (currentState.status === 'error' || currentState.status === 'completed')) {
                if (currentIndex < charStates.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                    setCharStates(prev => prev.map((s, i) =>
                        i === currentIndex + 1 ? { ...s, status: 'active' } : s
                    ));
                } else if (currentIndex === charStates.length - 1) {
                    // All done check - ensure we don't fire multiple times
                    // This effect dependency is on currentIndex, but checking length ensures we only do this once at the end
                    if (completionTimeoutRef.current) clearTimeout(completionTimeoutRef.current);
                    completionTimeoutRef.current = setTimeout(() => onComplete?.(), 500);
                }
            }
            return;
        }

        // Update outline visibility
        if (showOutline) {
            currentWriter.showOutline();
        } else {
            currentWriter.hideOutline();
        }

        // Start quiz with more lenient settings
        currentWriter.quiz({
            leniency: 2.0, // Higher = more lenient (default is 1.0)
            acceptBackwardsStrokes: false, // Accept strokes drawn in reverse
            showHintAfterMisses: 1, // Show hint after 1 mistake
            markStrokeCorrectAfterMisses: 3, // Auto-accept after 2 failed attempts (faster)
            onMistake: (strokeData: any) => {
                console.log('Mistake on stroke', strokeData.strokeNum);
            },
            onCorrectStroke: (strokeData: any) => {
                console.log('Correct stroke', strokeData.strokeNum);
            },
            onComplete: (summary: any) => {
                console.log('Character complete', summary);

                // Mark current as completed
                setCharStates(prev => prev.map((s, i) =>
                    i === currentIndex ? { ...s, status: 'completed' } : s
                ));

                // Move to next character or finish
                if (currentIndex < charStates.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                    setCharStates(prev => prev.map((s, i) =>
                        i === currentIndex + 1 ? { ...s, status: 'active' } : s
                    ));
                } else {
                    // All done
                    if (completionTimeoutRef.current) clearTimeout(completionTimeoutRef.current);
                    completionTimeoutRef.current = setTimeout(() => onComplete?.(), 500);
                }
            }
        });

    }, [currentIndex, charStates, showOutline, onComplete]);

    return (
        <div className="flex flex-col items-center">
            <div ref={containerRef} className="flex flex-wrap justify-center gap-2">
                {charStates.map((state, index) => {
                    const isActive = state.status === 'active';
                    const isCompleted = state.status === 'completed';
                    const isError = state.status === 'error';
                    const isPending = state.status === 'pending';

                    // Check if it's a writable character
                    const isWritableChar = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/.test(state.char);

                    if (isError || !isWritableChar) {
                        // Render as plain text (fallback for unsupported chars)
                        return (
                            <div
                                key={index}
                                className="flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50"
                                style={{ width: charSize, height: charSize }}
                            >
                                <span className="text-6xl font-bold text-gray-400">{state.char}</span>
                            </div>
                        );
                    }

                    return (
                        <div
                            key={index}
                            id={`hanzi-char-${index}`}
                            className={`
                                relative border-2 rounded-xl transition-all duration-300
                                ${isActive ? 'border-indigo-500 shadow-lg shadow-indigo-200 bg-white' : ''}
                                ${isCompleted ? 'border-green-400 bg-green-50' : ''}
                                ${isPending ? 'border-gray-200 bg-gray-50 pointer-events-none opacity-50' : ''}
                            `}
                            style={{ width: charSize, height: charSize }}
                        >
                            {isCompleted && (
                                <div className="absolute top-1 right-1 text-green-500">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center gap-4 mt-4">
                <p className="text-sm text-gray-500">
                    {mode === 'QUIZ' ? '✏️ Viết chữ' : '👆 Tập tô theo nét'}
                    {text.length > 1 && (
                        <>
                            {' • '}
                            Ký tự {Math.min(currentIndex + 1, text.length)} / {text.length}
                        </>
                    )}
                </p>
                {text.length > 1 && (
                    <button
                        onClick={() => {
                            // Skip current character
                            const currentWriter = writersRef.current.get(currentIndex);
                            if (currentWriter) {
                                currentWriter.cancelQuiz();
                            }
                            setCharStates(prev => prev.map((s, i) =>
                                i === currentIndex ? { ...s, status: 'completed' } : s
                            ));
                            if (currentIndex < charStates.length - 1) {
                                setCurrentIndex(prev => prev + 1);
                                setCharStates(prev => prev.map((s, i) =>
                                    i === currentIndex + 1 ? { ...s, status: 'active' } : s
                                ));
                            } else {
                                setTimeout(() => onComplete?.(), 500);
                            }
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Bỏ qua →
                    </button>
                )}
            </div>
        </div>
    );
};

export default WritingWidget;

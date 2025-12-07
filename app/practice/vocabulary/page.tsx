'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import WritingWidget from '@/components/WritingWidget';
import { speakJapanese } from '@/lib/ttsUtils';
import {
    VocabularyProgress,
    calculateNextReview,
    updateSrsLevel,
    isDueForReview,
    getSrsStatusLabel,
    getSrsStatusColor
} from '@/lib/srsUtils';
import {
    Loader2, CheckCircle2, ChevronRight, RefreshCcw, Volume2,
    ArrowRight, ArrowLeft, BookOpen, PenTool, Settings, X, Check
} from 'lucide-react';
import Link from 'next/link';

interface VocabularyItem {
    id: number;
    kanji: string;
    hiragana: string;
    han_viet: string;
    meaning: string;
    part_of_speech: string;
    level: string;
}

interface VocabularyWithProgress extends VocabularyItem {
    progress?: VocabularyProgress;
    selected?: boolean;
}

type ViewMode = 'list' | 'learn' | 'review';
type Step = 'INPUT' | 'TRACE' | 'TEST';
type WritingMode = 'kanji' | 'hiragana';

interface PracticeSettings {
    wordsPerSession: number;
    includeMastered: boolean;
    shuffleOrder: boolean;
}

const DEFAULT_SETTINGS: PracticeSettings = {
    wordsPerSession: 10,
    includeMastered: false,
    shuffleOrder: true,
};

const WORDS_PER_PAGE = 50;

const VocabularyPracticePage = () => {
    const [level, setLevel] = useState<string>('N5');
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [words, setWords] = useState<VocabularyWithProgress[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [step, setStep] = useState<Step>('INPUT');
    const [loading, setLoading] = useState(true);
    const [isCompleted, setIsCompleted] = useState(false);
    const [writingMode, setWritingMode] = useState<WritingMode>('kanji');
    const [currentPage, setCurrentPage] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState<PracticeSettings>(DEFAULT_SETTINGS);
    const [practiceWords, setPracticeWords] = useState<VocabularyWithProgress[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [selectAll, setSelectAll] = useState(false);

    const supabase = createClient();

    // Get current user
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id || null);
        };
        getUser();
    }, []);

    // Fetch vocabulary and progress
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // Fetch vocabulary
            const { data: vocabData, error: vocabError } = await supabase
                .from('vocabulary')
                .select('*')
                .eq('level', level)
                .order('id', { ascending: true });

            if (vocabError) {
                console.error('Error fetching vocabulary:', vocabError);
                setLoading(false);
                return;
            }

            let wordsWithProgress: VocabularyWithProgress[] = ((vocabData as any) || []).map((w: any) => ({
                ...w,
                selected: false,
            }));

            // Fetch user progress if logged in
            if (userId) {
                const vocabIds = wordsWithProgress.map(w => w.id);
                const { data: progressData } = await supabase
                    .from('user_vocabulary_progress')
                    .select('*')
                    .eq('user_id', userId)
                    .in('vocabulary_id', vocabIds);

                if (progressData) {
                    const progressMap = new Map((progressData as any[]).map(p => [p.vocabulary_id, p]));
                    wordsWithProgress = wordsWithProgress.map(w => ({
                        ...w,
                        progress: progressMap.get(w.id),
                    }));
                }
            }

            setWords(wordsWithProgress);
            setLoading(false);
        };

        fetchData();
    }, [level, userId]);

    // Pagination
    const totalPages = Math.ceil(words.length / WORDS_PER_PAGE);
    const paginatedWords = words.slice(
        (currentPage - 1) * WORDS_PER_PAGE,
        currentPage * WORDS_PER_PAGE
    );

    const currentWord = practiceWords[currentIndex];

    // TTS on INPUT step
    useEffect(() => {
        if (!currentWord || step !== 'INPUT' || viewMode === 'list') return;
        const timer = setTimeout(() => {
            speakJapanese(currentWord.kanji || currentWord.hiragana);
        }, 300);
        return () => clearTimeout(timer);
    }, [step, currentWord, viewMode]);

    // Toggle word selection
    const toggleSelection = (wordId: number) => {
        setWords(prev => prev.map(w =>
            w.id === wordId ? { ...w, selected: !w.selected } : w
        ));
    };

    // Toggle select all on current page
    const toggleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        const pageIds = paginatedWords.map(w => w.id);
        setWords(prev => prev.map(w =>
            pageIds.includes(w.id) ? { ...w, selected: newSelectAll } : w
        ));
    };

    // Get selected words for practice
    const getWordsForPractice = useCallback(() => {
        let selectedWords = words.filter(w => w.selected);

        // If no words selected, use words due for review or new words
        if (selectedWords.length === 0) {
            selectedWords = words.filter(w => {
                if (!w.progress) return true; // New word
                if (!settings.includeMastered && w.progress.srs_level >= 5) return false;
                return isDueForReview(w.progress.next_review);
            });
        }

        // Limit to wordsPerSession
        let wordsToUse = selectedWords.slice(0, settings.wordsPerSession);

        // Shuffle if enabled
        if (settings.shuffleOrder) {
            wordsToUse = [...wordsToUse].sort(() => Math.random() - 0.5);
        }

        return wordsToUse;
    }, [words, settings]);

    // Save progress after completing a word
    const saveProgress = async (wordId: number, isCorrect: boolean) => {
        if (!userId) return;

        const word = practiceWords.find(w => w.id === wordId);
        if (!word) return;

        const existingProgress = word.progress;
        const newLevel = existingProgress
            ? updateSrsLevel(existingProgress.srs_level, isCorrect)
            : (isCorrect ? 1 : 0);
        const nextReview = calculateNextReview(newLevel);

        const progressData = {
            user_id: userId,
            vocabulary_id: wordId,
            srs_level: newLevel,
            next_review: nextReview.toISOString(),
            review_count: (existingProgress?.review_count || 0) + 1,
            correct_count: (existingProgress?.correct_count || 0) + (isCorrect ? 1 : 0),
            last_reviewed: new Date().toISOString(),
        };

        if (existingProgress?.id) {
            await (supabase
                .from('user_vocabulary_progress') as any)
                .update(progressData)
                .eq('id', existingProgress.id);
        } else {
            await (supabase
                .from('user_vocabulary_progress') as any)
                .insert(progressData);
        }

        // Update local state
        setWords(prev => prev.map(w =>
            w.id === wordId
                ? { ...w, progress: { ...progressData, id: existingProgress?.id } as VocabularyProgress }
                : w
        ));
    };

    const isProcessingRef = React.useRef(false);

    const handleNextStep = async () => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        try {
            if (viewMode === 'learn') {
                if (step === 'INPUT') {
                    setStep('TRACE');
                } else if (step === 'TRACE') {
                    setStep('TEST');
                } else if (step === 'TEST') {
                    await saveProgress(currentWord.id, true);
                    goToNextWord();
                }
            } else if (viewMode === 'review') {
                await saveProgress(currentWord.id, true);
                goToNextWord();
            }
        } finally {
            // Add a small delay to prevent rapid double-clicks
            setTimeout(() => {
                isProcessingRef.current = false;
            }, 500);
        }
    };

    const goToNextWord = () => {
        if (currentIndex < practiceWords.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setStep(viewMode === 'learn' ? 'INPUT' : 'TEST');
        } else {
            setIsCompleted(true);
        }
    };

    const startPractice = (mode: ViewMode) => {
        const wordsToLearn = getWordsForPractice();
        if (wordsToLearn.length === 0) {
            alert('Không có từ nào để học. Hãy chọn từ hoặc đợi từ đến kỳ ôn tập.');
            return;
        }
        setPracticeWords(wordsToLearn);
        setViewMode(mode);
        setCurrentIndex(0);
        setStep(mode === 'learn' ? 'INPUT' : 'TEST');
        setIsCompleted(false);
    };

    const backToList = () => {
        setViewMode('list');
        setCurrentIndex(0);
        setStep('INPUT');
        setIsCompleted(false);
        setPracticeWords([]);
    };

    const getPracticeText = () => {
        if (!currentWord) return '';
        if (writingMode === 'hiragana') return currentWord.hiragana;
        return currentWord.kanji || currentWord.hiragana;
    };

    const progressPercent = practiceWords.length > 0
        ? ((currentIndex / practiceWords.length) * 100)
        : 0;

    const selectedCount = words.filter(w => w.selected).length;
    const dueCount = words.filter(w =>
        !w.progress || isDueForReview(w.progress.next_review)
    ).length;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl min-h-screen flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    {viewMode !== 'list' ? (
                        <button onClick={backToList} className="p-2 hover:bg-gray-100 rounded-lg">
                            <ArrowLeft size={20} />
                        </button>
                    ) : (
                        <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                            <ArrowLeft size={20} />
                        </Link>
                    )}
                    <h1 className="text-xl font-bold text-gray-800">
                        {viewMode === 'list' && 'Từ vựng'}
                        {viewMode === 'learn' && '📚 Học từ mới'}
                        {viewMode === 'review' && '🔄 Ôn tập'}
                    </h1>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                    {viewMode === 'list' && (
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        >
                            <Settings size={20} />
                        </button>
                    )}
                    {['N5', 'N4', 'N3'].map((l) => (
                        <button
                            key={l}
                            onClick={() => { setLevel(l); setCurrentPage(1); }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${level === l ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            </div>

            {/* LIST VIEW */}
            {viewMode === 'list' && (
                <>
                    {/* Stats & Actions */}
                    <div className="flex flex-wrap gap-3 mb-4">
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                            <span>📊 {words.length} từ</span>
                            <span>•</span>
                            <span>⏰ {dueCount} cần ôn</span>
                            {selectedCount > 0 && (
                                <>
                                    <span>•</span>
                                    <span className="text-indigo-600 font-medium">✓ {selectedCount} đã chọn</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mb-4">
                        <button
                            onClick={() => startPractice('learn')}
                            disabled={words.length === 0}
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <BookOpen size={20} />
                            Học ({selectedCount > 0 ? selectedCount : Math.min(dueCount, settings.wordsPerSession)} từ)
                        </button>
                        <button
                            onClick={() => startPractice('review')}
                            disabled={words.length === 0}
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <PenTool size={20} />
                            Ôn tập
                        </button>
                    </div>

                    {/* Vocabulary Table */}
                    {words.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            Không tìm thấy từ vựng cho cấp độ {level}.
                        </div>
                    ) : (
                        <>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-2 py-2 w-10">
                                                <input
                                                    type="checkbox"
                                                    checked={selectAll}
                                                    onChange={toggleSelectAll}
                                                    className="rounded"
                                                />
                                            </th>
                                            <th className="px-2 py-2 text-left text-gray-600">Từ vựng</th>
                                            <th className="px-2 py-2 text-left text-gray-600">Nghĩa</th>
                                            <th className="px-2 py-2 text-center text-gray-600 w-20">Trạng thái</th>
                                            <th className="px-2 py-2 w-10">🔊</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedWords.map((word, index) => (
                                            <tr
                                                key={word.id}
                                                className={`border-b border-gray-50 hover:bg-indigo-50 transition-colors ${word.selected ? 'bg-indigo-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                                    }`}
                                            >
                                                <td className="px-2 py-2 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={word.selected || false}
                                                        onChange={() => toggleSelection(word.id)}
                                                        className="rounded"
                                                    />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <div className="font-bold text-gray-900">{word.kanji || word.hiragana}</div>
                                                    <div className="text-xs text-gray-500">{word.hiragana} • {word.han_viet}</div>
                                                </td>
                                                <td className="px-2 py-2 text-gray-700">{word.meaning}</td>
                                                <td className="px-2 py-2 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSrsStatusColor(word.progress?.srs_level || 0)
                                                        }`}>
                                                        {getSrsStatusLabel(word.progress?.srs_level || 0)}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2 text-center">
                                                    <button
                                                        onClick={() => speakJapanese(word.kanji || word.hiragana)}
                                                        className="p-1 hover:bg-indigo-100 rounded text-indigo-600"
                                                    >
                                                        <Volume2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-1 mt-4">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-2 py-1 rounded text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                                    >
                                        ‹
                                    </button>
                                    {currentPage > 2 && (
                                        <>
                                            <button onClick={() => setCurrentPage(1)} className="px-2 py-1 rounded text-sm text-gray-600 hover:bg-gray-100">1</button>
                                            {currentPage > 3 && <span className="px-1 text-gray-400 text-sm">...</span>}
                                        </>
                                    )}
                                    {[currentPage - 1, currentPage, currentPage + 1]
                                        .filter(p => p >= 1 && p <= totalPages)
                                        .map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-2 py-1 rounded text-sm ${currentPage === page ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    {currentPage < totalPages - 1 && (
                                        <>
                                            {currentPage < totalPages - 2 && <span className="px-1 text-gray-400 text-sm">...</span>}
                                            <button onClick={() => setCurrentPage(totalPages)} className="px-2 py-1 rounded text-sm text-gray-600 hover:bg-gray-100">{totalPages}</button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-2 py-1 rounded text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                                    >
                                        ›
                                    </button>
                                </div>
                            )}
                            <p className="text-center text-xs text-gray-400 mt-2">{words.length} từ</p>
                        </>
                    )}
                </>
            )}

            {/* LEARN / REVIEW VIEW */}
            {(viewMode === 'learn' || viewMode === 'review') && (
                <>
                    {isCompleted ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <CheckCircle2 size={80} className="text-green-500 mb-6" />
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Xuất sắc!</h2>
                            <p className="text-lg text-gray-600 mb-8">
                                Hoàn thành {practiceWords.length} từ vựng.
                            </p>
                            <div className="flex gap-4">
                                <button onClick={backToList} className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">
                                    <ArrowLeft size={20} /> Quay lại
                                </button>
                                <button onClick={() => startPractice(viewMode)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg">
                                    <RefreshCcw size={20} /> Làm lại
                                </button>
                            </div>
                        </div>
                    ) : currentWord && (
                        <div className="flex-1 flex flex-col items-center">
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                                <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                            </div>

                            {/* Writing Mode Toggle */}
                            <div className="flex items-center gap-2 mb-4">
                                <button
                                    onClick={() => setWritingMode('kanji')}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium ${writingMode === 'kanji' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    漢字
                                </button>
                                <button
                                    onClick={() => setWritingMode('hiragana')}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium ${writingMode === 'hiragana' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    ひらがな
                                </button>
                            </div>

                            {/* Step Indicator */}
                            {viewMode === 'learn' && (
                                <div className="flex items-center gap-2 mb-4 text-xs">
                                    <span className={`px-2 py-1 rounded-full ${step === 'INPUT' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>1. Học</span>
                                    <ArrowRight size={12} className="text-gray-400" />
                                    <span className={`px-2 py-1 rounded-full ${step === 'TRACE' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>2. Tô</span>
                                    <ArrowRight size={12} className="text-gray-400" />
                                    <span className={`px-2 py-1 rounded-full ${step === 'TEST' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>3. Test</span>
                                </div>
                            )}

                            {/* Main Card */}
                            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 border border-gray-100">
                                {viewMode === 'learn' && step === 'INPUT' && (
                                    <div className="text-center space-y-4">
                                        <h2 className="text-5xl font-black text-gray-900">{currentWord.kanji || currentWord.hiragana}</h2>
                                        <p className="text-xl text-indigo-600">{currentWord.hiragana}</p>
                                        <p className="text-gray-500">{currentWord.han_viet} • {currentWord.part_of_speech}</p>
                                        <p className="text-xl font-medium text-gray-800 pt-4 border-t">{currentWord.meaning}</p>
                                        <div className="flex justify-center gap-4 pt-4">
                                            <button onClick={() => speakJapanese(currentWord.kanji || currentWord.hiragana)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                                                <Volume2 size={18} /> Nghe
                                            </button>
                                            <button onClick={handleNextStep} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">
                                                Tiếp <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {viewMode === 'learn' && step === 'TRACE' && (
                                    <div className="text-center">
                                        <p className="text-gray-600 mb-2"><b>{currentWord.meaning}</b> ({currentWord.han_viet})</p>
                                        <WritingWidget
                                            key={`trace-${currentWord.id}-${writingMode}`}
                                            text={getPracticeText()}
                                            mode="TRACE"
                                            showOutline={true}
                                            onComplete={() => setTimeout(handleNextStep, 500)}
                                        />
                                        <button
                                            onClick={handleNextStep}
                                            className="mt-4 px-4 py-2 text-gray-400 hover:text-gray-600 text-sm font-medium hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            Bỏ qua
                                        </button>
                                    </div>
                                )}

                                {step === 'TEST' && (
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-gray-900 mb-2">Viết: &quot;{currentWord.meaning}&quot;</p>
                                        {viewMode === 'review' && <p className="text-gray-500 mb-2">({currentWord.han_viet})</p>}
                                        <WritingWidget
                                            key={`test-${currentWord.id}-${writingMode}`}
                                            text={getPracticeText()}
                                            mode="QUIZ"
                                            showOutline={false}
                                            onComplete={() => {
                                                speakJapanese(getPracticeText());
                                                setTimeout(handleNextStep, 1000);
                                            }}
                                        />
                                        <button
                                            onClick={handleNextStep}
                                            className="mt-4 px-4 py-2 text-gray-400 hover:text-gray-600 text-sm font-medium hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            Bỏ qua
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                                <span className="text-lg font-bold">{currentIndex + 1}</span>
                                <span className="text-sm">/ {practiceWords.length}</span>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Cài đặt học tập</h2>
                            <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Số từ mỗi lần học</label>
                                <div className="flex gap-2">
                                    {[5, 10, 20, 50].map(n => (
                                        <button
                                            key={n}
                                            onClick={() => setSettings(s => ({ ...s, wordsPerSession: n }))}
                                            className={`px-4 py-2 rounded-lg font-medium ${settings.wordsPerSession === n ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">Bao gồm từ đã thuộc</label>
                                <button
                                    onClick={() => setSettings(s => ({ ...s, includeMastered: !s.includeMastered }))}
                                    className={`w-12 h-6 rounded-full transition-colors ${settings.includeMastered ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.includeMastered ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">Xáo trộn thứ tự</label>
                                <button
                                    onClick={() => setSettings(s => ({ ...s, shuffleOrder: !s.shuffleOrder }))}
                                    className={`w-12 h-6 rounded-full transition-colors ${settings.shuffleOrder ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.shuffleOrder ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowSettings(false)}
                            className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
                        >
                            Lưu
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VocabularyPracticePage;

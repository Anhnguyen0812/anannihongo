'use client';

import React, { useState } from 'react';
import {
    HIRAGANA_BASIC, HIRAGANA_DAKUON, HIRAGANA_HANDAKUON, HIRAGANA_YOON,
    KATAKANA_BASIC, KATAKANA_DAKUON, KATAKANA_HANDAKUON, KATAKANA_YOON,
    KanaChar
} from '@/lib/constants';
import WritingWidget from '@/components/WritingWidget';
import { speakJapanese } from '@/lib/ttsUtils';
import { X, Volume2 } from 'lucide-react';

type ScriptType = 'hiragana' | 'katakana';
type CategoryType = 'basic' | 'dakuon' | 'handakuon' | 'yoon';

const KanaPracticePage = () => {
    const [script, setScript] = useState<ScriptType>('hiragana');
    const [category, setCategory] = useState<CategoryType>('basic');
    const [selectedChar, setSelectedChar] = useState<KanaChar | null>(null);

    const getKanaData = (): KanaChar[][] => {
        if (script === 'hiragana') {
            switch (category) {
                case 'basic': return HIRAGANA_BASIC;
                case 'dakuon': return HIRAGANA_DAKUON;
                case 'handakuon': return HIRAGANA_HANDAKUON;
                case 'yoon': return HIRAGANA_YOON;
            }
        } else {
            switch (category) {
                case 'basic': return KATAKANA_BASIC;
                case 'dakuon': return KATAKANA_DAKUON;
                case 'handakuon': return KATAKANA_HANDAKUON;
                case 'yoon': return KATAKANA_YOON;
            }
        }
    };

    const handleCharClick = (char: KanaChar) => {
        setSelectedChar(char);
        speakJapanese(char.char);
    };

    const closeModal = () => {
        setSelectedChar(null);
    };

    const categories: { key: CategoryType; label: string; labelVi: string }[] = [
        { key: 'basic', label: 'Basic', labelVi: 'Cơ bản' },
        { key: 'dakuon', label: 'Dakuon', labelVi: 'Âm đục' },
        { key: 'handakuon', label: 'Handakuon', labelVi: 'Âm bán đục' },
        { key: 'yoon', label: 'Yōon', labelVi: 'Âm ghép' }
    ];

    return (
        <div className="container mx-auto p-4 max-w-4xl min-h-screen">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
                    Luyện viết bảng chữ cái
                </h1>

                {/* Script Toggle (Hiragana / Katakana) */}
                <div className="flex justify-center gap-2 mb-4">
                    <button
                        onClick={() => setScript('hiragana')}
                        className={`px-6 py-3 rounded-xl font-bold text-lg transition-all ${script === 'hiragana'
                            ? 'bg-pink-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        ひらがな Hiragana
                    </button>
                    <button
                        onClick={() => setScript('katakana')}
                        className={`px-6 py-3 rounded-xl font-bold text-lg transition-all ${script === 'katakana'
                            ? 'bg-purple-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        カタカナ Katakana
                    </button>
                </div>

                {/* Category Tabs */}
                <div className="flex justify-center gap-2 flex-wrap">
                    {categories.map((cat) => (
                        <button
                            key={cat.key}
                            onClick={() => setCategory(cat.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${category === cat.key
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {cat.labelVi}
                        </button>
                    ))}
                </div>
            </div>

            {/* Kana Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="space-y-3">
                    {getKanaData().map((row, rowIndex) => (
                        <div key={rowIndex} className="flex justify-center gap-2 md:gap-3 flex-wrap">
                            {row.map((item) => (
                                <button
                                    key={item.char}
                                    onClick={() => handleCharClick(item)}
                                    className="w-14 h-14 md:w-16 md:h-16 flex flex-col items-center justify-center border border-gray-200 rounded-xl bg-white hover:bg-gray-100 hover:border-gray-300 transition-all cursor-pointer"
                                >
                                    <span className="text-xl md:text-2xl font-bold text-gray-800">{item.char}</span>
                                    <span className="text-xs text-gray-500">{item.romaji}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Practice Modal */}
            {selectedChar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-4">
                            <span className={`text-6xl font-black ${script === 'hiragana' ? 'text-pink-600' : 'text-purple-600'
                                }`}>
                                {selectedChar.char}
                            </span>
                            <p className="text-xl text-gray-500 mt-2">{selectedChar.romaji}</p>
                        </div>

                        <div className="flex justify-center py-4">
                            <WritingWidget
                                key={selectedChar.char}
                                text={selectedChar.char}
                                mode="TRACE"
                                showOutline={true}
                                onComplete={() => {
                                    speakJapanese(selectedChar.char);
                                }}
                            />
                        </div>

                        <div className="flex justify-center gap-3 mt-4">
                            <button
                                onClick={() => speakJapanese(selectedChar.char)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                            >
                                <Volume2 size={18} /> Nghe
                            </button>
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KanaPracticePage;

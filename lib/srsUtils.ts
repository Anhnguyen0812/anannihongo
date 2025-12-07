// SRS (Spaced Repetition System) utility functions

export interface VocabularyProgress {
    id?: string;
    user_id: string;
    vocabulary_id: number;
    srs_level: number;
    next_review: string;
    review_count: number;
    correct_count: number;
    last_reviewed: string | null;
    created_at?: string;
    updated_at?: string;
}

// SRS intervals in days (Leitner system)
export const SRS_INTERVALS = [
    0,    // Level 0: Now (new word)
    1,    // Level 1: 1 day
    3,    // Level 2: 3 days
    7,    // Level 3: 7 days
    14,   // Level 4: 14 days
    30,   // Level 5: 30 days (mastered)
];

export const MAX_SRS_LEVEL = 5;

/**
 * Calculate next review date based on SRS level
 */
export function calculateNextReview(srsLevel: number): Date {
    const intervalDays = SRS_INTERVALS[Math.min(srsLevel, MAX_SRS_LEVEL)];
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + intervalDays);
    return nextReview;
}

/**
 * Update SRS level after a review
 * @param currentLevel Current SRS level
 * @param isCorrect Whether the answer was correct
 * @returns New SRS level
 */
export function updateSrsLevel(currentLevel: number, isCorrect: boolean): number {
    if (isCorrect) {
        // Move up one level (max 5)
        return Math.min(currentLevel + 1, MAX_SRS_LEVEL);
    } else {
        // Reset to level 1 (not 0, to avoid instant re-review)
        return Math.max(1, Math.floor(currentLevel / 2));
    }
}

/**
 * Check if a word is due for review
 */
export function isDueForReview(nextReview: string | Date): boolean {
    const reviewDate = new Date(nextReview);
    return reviewDate <= new Date();
}

/**
 * Get status label for SRS level
 */
export function getSrsStatusLabel(srsLevel: number): string {
    if (srsLevel === 0) return 'Mới';
    if (srsLevel < 3) return 'Đang học';
    if (srsLevel < 5) return 'Sắp thuộc';
    return 'Đã thuộc';
}

/**
 * Get status color for SRS level
 */
export function getSrsStatusColor(srsLevel: number): string {
    if (srsLevel === 0) return 'bg-gray-100 text-gray-600';
    if (srsLevel < 3) return 'bg-blue-100 text-blue-600';
    if (srsLevel < 5) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-600';
}

/**
 * Format next review date for display
 */
export function formatNextReview(nextReview: string | Date): string {
    const date = new Date(nextReview);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Hôm nay';
    if (diffDays === 1) return 'Ngày mai';
    if (diffDays < 7) return `${diffDays} ngày`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} tuần`;
    return `${Math.ceil(diffDays / 30)} tháng`;
}

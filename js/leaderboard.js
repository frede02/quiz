import { storage } from './storage.js';

export function saveScore(result, user) {
    const scores = storage.get('leaderboard') || [];
    scores.push({
        userId: user.userId,
        username: user.username,
        sport: result.sport,
        quizType: result.quizType,
        score: result.totalPoints,
        correctCount: result.correctCount,
        totalQuestions: result.totalQuestions,
        duration: result.duration,
        date: new Date().toISOString()
    });
    storage.set('leaderboard', scores);
}

export function getTopScores(sport = null, limit = 10) {
    let scores = storage.get('leaderboard') || [];
    if (sport) {
        scores = scores.filter(s => s.sport === sport);
    }
    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, limit);
}

export function getGlobalRanking(limit = 10) {
    const scores = storage.get('leaderboard') || [];
    const totals = {};
    for (const s of scores) {
        if (!totals[s.username]) {
            totals[s.username] = { username: s.username, totalScore: 0, quizCount: 0 };
        }
        totals[s.username].totalScore += s.score;
        totals[s.username].quizCount++;
    }
    return Object.values(totals)
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, limit);
}

export function getUserHistory(userId) {
    const scores = storage.get('leaderboard') || [];
    return scores.filter(s => s.userId === userId).sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getUserStats(userId) {
    const history = getUserHistory(userId);
    if (history.length === 0) return null;
    const totalScore = history.reduce((sum, s) => sum + s.score, 0);
    const avgScore = Math.round(totalScore / history.length);
    const bestScore = Math.max(...history.map(s => s.score));

    // Best sport
    const sportScores = {};
    for (const h of history) {
        if (!sportScores[h.sport]) sportScores[h.sport] = [];
        sportScores[h.sport].push(h.score);
    }
    let bestSport = null;
    let bestAvg = 0;
    for (const [sport, scores] of Object.entries(sportScores)) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (avg > bestAvg) { bestAvg = avg; bestSport = sport; }
    }

    return {
        totalGames: history.length,
        totalScore,
        avgScore,
        bestScore,
        bestSport
    };
}

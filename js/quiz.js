import { questions } from './questions.js';

let currentQuiz = null;

export function startQuiz(sport, type, difficulty = 'all') {
    let pool = [];

    if (type === 'mix') {
        for (const t of ['qcm', 'vrai_faux', 'estimation']) {
            pool.push(...questions[sport][t].map(q => ({ ...q, type: t })));
        }
    } else if (type === 'qui_suis_je') {
        pool = (questions[sport].qui_suis_je || []).map(q => ({ ...q, type: 'qui_suis_je' }));
    } else {
        pool = questions[sport][type].map(q => ({ ...q, type }));
    }

    // Filter by difficulty
    if (difficulty !== 'all') {
        pool = pool.filter(q => q.difficulty === difficulty);
    }

    // Shuffle and pick 10 (or fewer if not enough questions)
    const shuffled = pool.sort(() => Math.random() - 0.5);
    const count = Math.min(10, shuffled.length);
    const selected = shuffled.slice(0, count);

    currentQuiz = {
        sport,
        quizType: type,
        difficulty,
        questions: selected,
        currentIndex: 0,
        answers: [],
        startTime: Date.now(),
        totalPoints: 0
    };

    return currentQuiz;
}

export function getCurrentQuiz() {
    return currentQuiz;
}

export function getCurrentQuestion() {
    if (!currentQuiz) return null;
    return currentQuiz.questions[currentQuiz.currentIndex];
}

export function submitAnswer(userAnswer) {
    const q = getCurrentQuestion();
    if (!q) return null;

    const timeTaken = Date.now() - (currentQuiz._questionStart || Date.now());
    let correct = false;
    let earned = 0;

    if (q.type === 'qcm') {
        correct = userAnswer === q.correct;
        earned = correct ? q.points : 0;
    } else if (q.type === 'vrai_faux') {
        correct = userAnswer === q.correct;
        earned = correct ? q.points : 0;
    } else if (q.type === 'estimation') {
        const diff = Math.abs(userAnswer - q.answer);
        if (diff <= q.tolerance) {
            correct = true;
            earned = q.points;
        } else if (diff <= q.tolerance * 3) {
            // Partial points for close answers
            correct = false;
            earned = Math.round(q.points * 0.3);
        }
    } else if (q.type === 'qui_suis_je') {
        const guess = (userAnswer.guess || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const answer = q.answer.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        // Check if the guess contains the last name or full name
        const nameParts = answer.split(' ');
        const lastName = nameParts[nameParts.length - 1];
        correct = guess.includes(answer) || guess.includes(lastName);
        earned = correct ? (userAnswer.pointsLeft || q.points) : 0;
    }

    // Speed bonus (not for qui_suis_je)
    if (correct && timeTaken < 5000 && q.type !== 'qui_suis_je') {
        earned += 2;
    }

    const result = {
        questionId: q.id,
        question: q.type === 'qui_suis_je' ? 'Qui suis-je ? ' + q.indices[0] : q.question,
        userAnswer: q.type === 'qui_suis_je' ? userAnswer.guess : userAnswer,
        correctAnswer: q.type === 'qui_suis_je' ? q.answer : (q.type === 'estimation' ? q.answer : q.correct),
        correct,
        earned,
        type: q.type,
        explanation: q.explanation || null,
        tolerance: q.tolerance,
        unit: q.unit
    };

    currentQuiz.answers.push(result);
    currentQuiz.totalPoints += earned;

    return result;
}

export function nextQuestion() {
    if (!currentQuiz) return false;
    currentQuiz.currentIndex++;
    currentQuiz._questionStart = Date.now();
    return currentQuiz.currentIndex < currentQuiz.questions.length;
}

export function markQuestionStart() {
    if (currentQuiz) {
        currentQuiz._questionStart = Date.now();
    }
}

export function getResults() {
    if (!currentQuiz) return null;

    const correctCount = currentQuiz.answers.filter(a => a.correct).length;
    const totalQuestions = currentQuiz.questions.length;
    const perfectBonus = correctCount === totalQuestions ? 20 : 0;
    const totalPoints = currentQuiz.totalPoints + perfectBonus;
    const duration = Math.round((Date.now() - currentQuiz.startTime) / 1000);

    return {
        sport: currentQuiz.sport,
        quizType: currentQuiz.quizType,
        difficulty: currentQuiz.difficulty,
        answers: currentQuiz.answers,
        correctCount,
        totalQuestions,
        totalPoints,
        perfectBonus,
        duration
    };
}

export function clearQuiz() {
    currentQuiz = null;
}

import { getCurrentUser, logout } from './auth.js';
import { navigate } from './router.js';
import { questions, sportLabels, quizTypeLabels } from './questions.js';
import { startQuiz, getCurrentQuiz, getCurrentQuestion, submitAnswer, nextQuestion, getResults, markQuestionStart, clearQuiz } from './quiz.js';
import { saveScore, getTopScores, getGlobalRanking, getUserHistory, getUserStats } from './leaderboard.js';
import { register, login } from './auth.js';

const app = () => document.getElementById('app');

// ---- NAV ----
export function updateNav() {
    const user = getCurrentUser();
    const links = document.getElementById('nav-links');
    if (user) {
        links.innerHTML = `
            <a href="#/categories">Jouer</a>
            <a href="#/classement">Classement</a>
            <a href="#/profil">Profil</a>
            <span class="nav-user">${user.username}</span>
            <button id="btn-logout" class="btn btn-sm">Déconnexion</button>
        `;
        document.getElementById('btn-logout').addEventListener('click', () => {
            logout();
            updateNav();
            navigate('/');
        });
    } else {
        links.innerHTML = `
            <a href="#/classement">Classement</a>
            <a href="#/connexion">Connexion</a>
            <a href="#/inscription">Inscription</a>
        `;
    }
}

// ---- HOME ----
export function renderHome() {
    app().innerHTML = `
        <div class="home">
            <div class="hero">
                <h1>Quiz Sport</h1>
                <p class="hero-sub">Testez vos connaissances en Football, Cyclisme et Tennis</p>
                <div class="hero-sports">
                    ${Object.entries(sportLabels).map(([key, s]) => `
                        <div class="sport-preview" style="--sport-color: ${s.color}">
                            <span class="sport-icon">${s.icon}</span>
                            <span>${s.name}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="hero-actions">
                    ${getCurrentUser()
                        ? '<a href="#/categories" class="btn btn-primary btn-lg">Commencer un quiz</a>'
                        : '<a href="#/inscription" class="btn btn-primary btn-lg">Créer un compte</a><a href="#/connexion" class="btn btn-outline btn-lg">Se connecter</a>'
                    }
                </div>
            </div>
            <div class="features">
                <div class="feature-card">
                    <span class="feature-icon">📝</span>
                    <h3>3 types de quiz</h3>
                    <p>QCM, Vrai/Faux et Estimation pour varier les plaisirs</p>
                </div>
                <div class="feature-card">
                    <span class="feature-icon">🏆</span>
                    <h3>Classement</h3>
                    <p>Comparez vos scores avec les autres joueurs</p>
                </div>
                <div class="feature-card">
                    <span class="feature-icon">⚡</span>
                    <h3>Bonus vitesse</h3>
                    <p>Répondez vite pour gagner des points bonus</p>
                </div>
            </div>
        </div>
    `;
}

// ---- AUTH ----
export function renderLogin() {
    app().innerHTML = `
        <div class="auth-page">
            <div class="auth-card">
                <h2>Connexion</h2>
                <div id="auth-error" class="error-msg hidden"></div>
                <form id="login-form">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" required placeholder="votre@email.com">
                    </div>
                    <div class="form-group">
                        <label for="password">Mot de passe</label>
                        <input type="password" id="password" required placeholder="Votre mot de passe">
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Se connecter</button>
                </form>
                <p class="auth-switch">Pas encore de compte ? <a href="#/inscription">S'inscrire</a></p>
            </div>
        </div>
    `;
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errEl = document.getElementById('auth-error');
        try {
            await login(
                document.getElementById('email').value,
                document.getElementById('password').value
            );
            updateNav();
            navigate('/categories');
        } catch (err) {
            errEl.textContent = err.message;
            errEl.classList.remove('hidden');
        }
    });
}

export function renderRegister() {
    app().innerHTML = `
        <div class="auth-page">
            <div class="auth-card">
                <h2>Inscription</h2>
                <div id="auth-error" class="error-msg hidden"></div>
                <form id="register-form">
                    <div class="form-group">
                        <label for="username">Nom d'utilisateur</label>
                        <input type="text" id="username" required placeholder="Votre pseudo" minlength="2">
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" required placeholder="votre@email.com">
                    </div>
                    <div class="form-group">
                        <label for="password">Mot de passe</label>
                        <input type="password" id="password" required placeholder="Au moins 4 caractères" minlength="4">
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Créer mon compte</button>
                </form>
                <p class="auth-switch">Déjà un compte ? <a href="#/connexion">Se connecter</a></p>
            </div>
        </div>
    `;
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errEl = document.getElementById('auth-error');
        try {
            await register(
                document.getElementById('username').value,
                document.getElementById('email').value,
                document.getElementById('password').value
            );
            updateNav();
            navigate('/categories');
        } catch (err) {
            errEl.textContent = err.message;
            errEl.classList.remove('hidden');
        }
    });
}

// ---- CATEGORIES ----
export function renderCategories() {
    app().innerHTML = `
        <div class="categories-page">
            <h2>Choisissez un sport</h2>
            <div class="sport-grid">
                ${Object.entries(sportLabels).map(([key, s]) => `
                    <div class="sport-card" data-sport="${key}" style="--sport-color: ${s.color}">
                        <span class="sport-card-icon">${s.icon}</span>
                        <h3>${s.name}</h3>
                    </div>
                `).join('')}
            </div>
            <div id="type-selection" class="type-selection hidden">
                <h2>Choisissez le type de quiz</h2>
                <div class="type-grid">
                    ${Object.entries(quizTypeLabels).map(([key, t]) => `
                        <div class="type-card" data-type="${key}">
                            <span class="type-card-icon">${t.icon}</span>
                            <h3>${t.name}</h3>
                            <p>${t.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div id="difficulty-selection" class="type-selection hidden">
                <h2>Choisissez la difficulté</h2>
                <div class="difficulty-grid">
                    <div class="diff-card" data-diff="facile">
                        <span class="diff-icon">🟢</span>
                        <h3>Facile</h3>
                        <p>Pour débuter en douceur</p>
                    </div>
                    <div class="diff-card" data-diff="moyen">
                        <span class="diff-icon">🟡</span>
                        <h3>Moyen</h3>
                        <p>Un bon challenge</p>
                    </div>
                    <div class="diff-card" data-diff="difficile">
                        <span class="diff-icon">🔴</span>
                        <h3>Difficile</h3>
                        <p>Pour les experts !</p>
                    </div>
                    <div class="diff-card" data-diff="all">
                        <span class="diff-icon">🎯</span>
                        <h3>Toutes</h3>
                        <p>Mélange de tout</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    let selectedSport = null;
    let selectedType = null;

    document.querySelectorAll('.sport-card').forEach(card => {
        card.addEventListener('click', () => {
            selectedSport = card.dataset.sport;
            selectedType = null;
            document.querySelectorAll('.sport-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            document.getElementById('type-selection').classList.remove('hidden');
            document.getElementById('difficulty-selection').classList.add('hidden');
            document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
            document.documentElement.style.setProperty('--sport-color', sportLabels[selectedSport].color);
            // Show/hide type cards based on available data for selected sport
            document.querySelectorAll('.type-card').forEach(c => {
                const t = c.dataset.type;
                const hasData = questions[selectedSport] && questions[selectedSport][t] && questions[selectedSport][t].length > 0;
                const isMix = t === 'mix';
                c.style.display = (hasData || isMix) ? '' : 'none';
            });
        });
    });

    document.querySelectorAll('.type-card').forEach(card => {
        card.addEventListener('click', () => {
            if (!selectedSport) return;
            selectedType = card.dataset.type;
            document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            document.getElementById('difficulty-selection').classList.remove('hidden');
        });
    });

    document.querySelectorAll('.diff-card').forEach(card => {
        card.addEventListener('click', () => {
            if (!selectedSport || !selectedType) return;
            navigate(`/quiz/${selectedSport}/${selectedType}/${card.dataset.diff}`);
        });
    });
}

// ---- QUIZ ----
export function renderQuiz(params) {
    const { sport, type, difficulty } = params;
    const quiz = startQuiz(sport, type, difficulty || 'all');

    if (!quiz || quiz.questions.length === 0) {
        app().innerHTML = `<div class="error-page"><h2>Aucune question disponible</h2><a href="#/categories" class="btn btn-primary">Retour</a></div>`;
        return;
    }

    document.documentElement.style.setProperty('--sport-color', sportLabels[sport].color);
    markQuestionStart();
    showQuestion();
}

function showQuestion() {
    const quiz = getCurrentQuiz();
    const q = getCurrentQuestion();
    if (!q) return;

    const progress = ((quiz.currentIndex) / quiz.questions.length) * 100;
    const sportInfo = sportLabels[quiz.sport];

    let answersHTML = '';
    if (q.type === 'qcm') {
        answersHTML = `<div class="answers-grid">
            ${q.options.map((opt, i) => `
                <button class="answer-btn" data-index="${i}">${opt}</button>
            `).join('')}
        </div>`;
    } else if (q.type === 'vrai_faux') {
        answersHTML = `<div class="answers-grid vf-grid">
            <button class="answer-btn vf-btn vrai" data-value="true">Vrai</button>
            <button class="answer-btn vf-btn faux" data-value="false">Faux</button>
        </div>`;
    } else if (q.type === 'estimation') {
        answersHTML = `<div class="estimation-form">
            <p class="estimation-hint">${q.tolerance > 0 ? `Tolérance : ± ${q.tolerance} ${q.unit}` : 'Réponse exacte requise'}</p>
            <input type="number" id="estimation-input" class="estimation-input" placeholder="Votre réponse" autofocus>
            <button class="btn btn-primary" id="submit-estimation">Valider</button>
        </div>`;
    } else if (q.type === 'qui_suis_je') {
        answersHTML = `<div class="qsj-container" data-current-indice="0">
            <div class="qsj-indices">
                <div class="qsj-indice visible"><span class="qsj-num">1</span> ${q.indices[0]}</div>
                ${q.indices.slice(1).map((ind, i) => `<div class="qsj-indice hidden" data-idx="${i + 1}"><span class="qsj-num">${i + 2}</span> ${ind}</div>`).join('')}
            </div>
            <div class="qsj-actions">
                <button class="btn btn-outline" id="qsj-next-indice">Indice suivant (-3 pts)</button>
                <div class="qsj-input-row">
                    <input type="text" id="qsj-input" class="qsj-input" placeholder="Votre réponse..." autofocus>
                    <button class="btn btn-primary" id="qsj-submit">Deviner</button>
                </div>
            </div>
            <p class="qsj-points-info">Points restants : <strong id="qsj-points-display">${q.points}</strong></p>
        </div>`;
    } else if (q.type === 'carriere') {
        answersHTML = `<div class="carriere-container">
            <div class="carriere-timeline">
                <div class="carriere-club visible">
                    <span class="carriere-num">1</span>
                    <div class="carriere-club-info">
                        <span class="carriere-club-name">${q.clubs[0].club}</span>
                        <span class="carriere-club-periode">${q.clubs[0].periode}</span>
                    </div>
                </div>
                ${q.clubs.slice(1).map((c, i) => `
                    <div class="carriere-club hidden" data-club-idx="${i + 1}">
                        <span class="carriere-num">${i + 2}</span>
                        <div class="carriere-club-info">
                            <span class="carriere-club-name">${c.club}</span>
                            <span class="carriere-club-periode">${c.periode}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="carriere-actions">
                <button class="btn btn-outline" id="carriere-pass">Passer / Club suivant (-4 pts)</button>
                <div class="qsj-input-row">
                    <input type="text" id="carriere-input" class="qsj-input" placeholder="Nom du joueur..." autofocus>
                    <button class="btn btn-primary" id="carriere-submit">Deviner</button>
                </div>
            </div>
            <p class="qsj-points-info">Points restants : <strong id="carriere-points-display">${q.points}</strong></p>
        </div>`;
    }

    app().innerHTML = `
        <div class="quiz-page">
            <div class="quiz-header">
                <div class="quiz-info">
                    <span class="quiz-sport-badge" style="background: ${sportInfo.color}">${sportInfo.icon} ${sportInfo.name}</span>
                    <span class="quiz-counter">Question ${quiz.currentIndex + 1} / ${quiz.questions.length}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="quiz-points">Score : ${quiz.totalPoints} pts</div>
            </div>
            <div class="quiz-body">
                <div class="question-type-badge">${quizTypeLabels[q.type]?.icon || ''} ${quizTypeLabels[q.type]?.name || q.type}</div>
                <h2 class="question-text">${q.type === 'qui_suis_je' ? 'Devinez le sportif !' : q.type === 'carriere' ? 'Quel joueur a eu cette carrière ?' : q.question}</h2>
                ${answersHTML}
            </div>
        </div>
    `;

    // Bind events
    if (q.type === 'qcm') {
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', () => handleAnswer(parseInt(btn.dataset.index)));
        });
    } else if (q.type === 'vrai_faux') {
        document.querySelectorAll('.vf-btn').forEach(btn => {
            btn.addEventListener('click', () => handleAnswer(btn.dataset.value === 'true'));
        });
    } else if (q.type === 'estimation') {
        const submitBtn = document.getElementById('submit-estimation');
        const input = document.getElementById('estimation-input');
        submitBtn.addEventListener('click', () => {
            const val = parseFloat(input.value);
            if (isNaN(val)) return;
            handleAnswer(val);
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = parseFloat(input.value);
                if (!isNaN(val)) handleAnswer(val);
            }
        });
    } else if (q.type === 'qui_suis_je') {
        let indicesShown = 1;
        let pointsLeft = q.points;
        const container = document.querySelector('.qsj-container');

        const revealNextIndice = () => {
            if (indicesShown >= q.indices.length) return false;
            const nextIndice = container.querySelector(`[data-idx="${indicesShown}"]`);
            if (nextIndice) {
                nextIndice.classList.remove('hidden');
                nextIndice.classList.add('visible');
                indicesShown++;
                pointsLeft = Math.max(5, pointsLeft - 3);
                document.getElementById('qsj-points-display').textContent = pointsLeft;
            }
            if (indicesShown >= q.indices.length) {
                document.getElementById('qsj-next-indice').disabled = true;
                document.getElementById('qsj-next-indice').textContent = 'Plus d\'indices';
            }
            return true;
        };

        document.getElementById('qsj-next-indice').addEventListener('click', revealNextIndice);

        const submitGuess = () => {
            const input = document.getElementById('qsj-input');
            const val = input.value.trim();
            if (!val) return;
            // Check locally if correct
            const guess = val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const answer = q.answer.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const nameParts = answer.split(' ');
            const lastName = nameParts[nameParts.length - 1];
            const isCorrect = guess.includes(answer) || guess.includes(lastName);

            if (isCorrect || indicesShown >= q.indices.length) {
                handleAnswer({ guess: val, pointsLeft });
            } else {
                // Wrong guess: lose points, reveal next indice, show feedback
                pointsLeft = Math.max(5, pointsLeft - 3);
                document.getElementById('qsj-points-display').textContent = pointsLeft;
                revealNextIndice();
                input.value = '';
                input.placeholder = 'Mauvaise réponse, réessayez...';
                input.classList.add('shake');
                setTimeout(() => input.classList.remove('shake'), 500);
            }
        };
        document.getElementById('qsj-submit').addEventListener('click', submitGuess);
        document.getElementById('qsj-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') submitGuess();
        });
    } else if (q.type === 'carriere') {
        let clubsShown = 1;
        let pointsLeft = q.points;

        const revealNextClub = () => {
            if (clubsShown >= q.clubs.length) return false;
            const nextClub = document.querySelector(`[data-club-idx="${clubsShown}"]`);
            if (nextClub) {
                nextClub.classList.remove('hidden');
                nextClub.classList.add('visible');
                clubsShown++;
                pointsLeft = Math.max(5, pointsLeft - 4);
                document.getElementById('carriere-points-display').textContent = pointsLeft;
            }
            if (clubsShown >= q.clubs.length) {
                document.getElementById('carriere-pass').disabled = true;
                document.getElementById('carriere-pass').textContent = 'Plus de clubs';
            }
            return true;
        };

        document.getElementById('carriere-pass').addEventListener('click', revealNextClub);

        const submitCarriere = () => {
            const input = document.getElementById('carriere-input');
            const val = input.value.trim();
            if (!val) return;
            // Check locally if correct
            const guess = val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const answer = q.answer.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const nameParts = answer.split(' ');
            const lastName = nameParts[nameParts.length - 1];
            const isCorrect = guess.includes(answer) || guess.includes(lastName);

            if (isCorrect || clubsShown >= q.clubs.length) {
                handleAnswer({ guess: val, pointsLeft });
            } else {
                // Wrong guess: lose points, reveal next club, show feedback
                pointsLeft = Math.max(5, pointsLeft - 4);
                document.getElementById('carriere-points-display').textContent = pointsLeft;
                revealNextClub();
                input.value = '';
                input.placeholder = 'Mauvaise réponse, réessayez...';
                input.classList.add('shake');
                setTimeout(() => input.classList.remove('shake'), 500);
            }
        };
        document.getElementById('carriere-submit').addEventListener('click', submitCarriere);
        document.getElementById('carriere-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') submitCarriere();
        });
    }
}

function handleAnswer(userAnswer) {
    const q = getCurrentQuestion();
    const result = submitAnswer(userAnswer);
    if (!result) return;

    // Disable all buttons
    document.querySelectorAll('.answer-btn').forEach(btn => btn.disabled = true);

    // Show feedback
    if (q.type === 'qcm') {
        document.querySelectorAll('.answer-btn').forEach(btn => {
            const idx = parseInt(btn.dataset.index);
            if (idx === q.correct) btn.classList.add('correct');
            else if (idx === userAnswer && !result.correct) btn.classList.add('wrong');
        });
    } else if (q.type === 'vrai_faux') {
        document.querySelectorAll('.vf-btn').forEach(btn => {
            const val = btn.dataset.value === 'true';
            if (val === q.correct) btn.classList.add('correct');
            else if (val === userAnswer && !result.correct) btn.classList.add('wrong');
        });
    } else if (q.type === 'estimation') {
        document.getElementById('estimation-input').disabled = true;
        document.getElementById('submit-estimation').disabled = true;
    } else if (q.type === 'qui_suis_je') {
        document.getElementById('qsj-input').disabled = true;
        document.getElementById('qsj-submit').disabled = true;
        document.getElementById('qsj-next-indice').disabled = true;
        // Reveal all indices
        document.querySelectorAll('.qsj-indice.hidden').forEach(el => {
            el.classList.remove('hidden');
            el.classList.add('visible');
        });
    } else if (q.type === 'carriere') {
        document.getElementById('carriere-input').disabled = true;
        document.getElementById('carriere-submit').disabled = true;
        document.getElementById('carriere-pass').disabled = true;
        // Reveal all clubs
        document.querySelectorAll('.carriere-club.hidden').forEach(el => {
            el.classList.remove('hidden');
            el.classList.add('visible');
        });
    }

    // Feedback message
    const feedbackHTML = `
        <div class="feedback ${result.correct ? 'feedback-correct' : result.earned > 0 ? 'feedback-partial' : 'feedback-wrong'}">
            <span class="feedback-icon">${result.correct ? '✓' : result.earned > 0 ? '≈' : '✗'}</span>
            <span class="feedback-text">
                ${result.correct ? 'Bonne réponse !' : result.earned > 0 ? 'Presque !' : 'Mauvaise réponse'}
                ${result.earned > 0 ? ` (+${result.earned} pts)` : ''}
            </span>
            ${result.explanation ? `<p class="feedback-explanation">${result.explanation}</p>` : ''}
            ${q.type === 'estimation' && !result.correct ? `<p class="feedback-explanation">La réponse était : ${q.answer} ${q.unit || ''}</p>` : ''}
            ${q.type === 'qui_suis_je' || q.type === 'carriere' ? `<p class="feedback-explanation">C'était : <strong>${q.answer}</strong></p>` : ''}
        </div>
    `;

    const quizBody = document.querySelector('.quiz-body');
    quizBody.insertAdjacentHTML('beforeend', feedbackHTML);

    // Update score display
    const quiz = getCurrentQuiz();
    document.querySelector('.quiz-points').textContent = `Score : ${quiz.totalPoints} pts`;

    // Next button
    const nextHTML = `<button class="btn btn-primary btn-next" id="next-btn">
        ${quiz.currentIndex + 1 < quiz.questions.length ? 'Question suivante →' : 'Voir les résultats →'}
    </button>`;
    quizBody.insertAdjacentHTML('beforeend', nextHTML);

    document.getElementById('next-btn').addEventListener('click', () => {
        if (nextQuestion()) {
            showQuestion();
        } else {
            showResults();
        }
    });
}

function showResults() {
    const results = getResults();
    const user = getCurrentUser();
    if (user) saveScore(results, user);

    const sportInfo = sportLabels[results.sport];
    const percentage = Math.round((results.correctCount / results.totalQuestions) * 100);

    let medal = '';
    if (percentage === 100) medal = '🏆';
    else if (percentage >= 80) medal = '🥇';
    else if (percentage >= 60) medal = '🥈';
    else if (percentage >= 40) medal = '🥉';

    app().innerHTML = `
        <div class="results-page">
            <div class="results-card">
                <div class="results-header" style="background: ${sportInfo.color}">
                    <span class="results-medal">${medal}</span>
                    <h2>Résultats</h2>
                    <span class="results-sport">${sportInfo.icon} ${sportInfo.name}</span>
                </div>
                <div class="results-body">
                    <div class="results-score">
                        <span class="score-number">${results.totalPoints}</span>
                        <span class="score-label">points</span>
                    </div>
                    <div class="results-stats">
                        <div class="stat">
                            <span class="stat-value">${results.correctCount}/${results.totalQuestions}</span>
                            <span class="stat-label">Bonnes réponses</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${percentage}%</span>
                            <span class="stat-label">Réussite</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${results.duration}s</span>
                            <span class="stat-label">Temps</span>
                        </div>
                        ${results.perfectBonus > 0 ? `<div class="stat bonus"><span class="stat-value">+${results.perfectBonus}</span><span class="stat-label">Bonus parfait !</span></div>` : ''}
                    </div>
                    <div class="results-review">
                        <h3>Détail des réponses</h3>
                        ${results.answers.map((a, i) => `
                            <div class="review-item ${a.correct ? 'review-correct' : a.earned > 0 ? 'review-partial' : 'review-wrong'}">
                                <span class="review-num">${i + 1}</span>
                                <span class="review-icon">${a.correct ? '✓' : a.earned > 0 ? '≈' : '✗'}</span>
                                <span class="review-question">${a.question}</span>
                                <span class="review-pts">+${a.earned}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="results-actions">
                        <a href="#/quiz/${results.sport}/${results.quizType}/${results.difficulty}" class="btn btn-primary">Rejouer</a>
                        <a href="#/categories" class="btn btn-outline">Autre quiz</a>
                        <a href="#/classement" class="btn btn-outline">Classement</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    clearQuiz();
}

// ---- LEADERBOARD ----
export function renderLeaderboard() {
    let currentFilter = 'global';

    function render() {
        let data;
        let title;

        if (currentFilter === 'global') {
            data = getGlobalRanking(20);
            title = 'Classement Général';
        } else {
            data = getTopScores(currentFilter, 20);
            title = `Classement - ${sportLabels[currentFilter]?.name || currentFilter}`;
        }

        const medals = ['🥇', '🥈', '🥉'];

        app().innerHTML = `
            <div class="leaderboard-page">
                <h2>${title}</h2>
                <div class="leaderboard-tabs">
                    <button class="tab ${currentFilter === 'global' ? 'active' : ''}" data-filter="global">Global</button>
                    ${Object.entries(sportLabels).map(([key, s]) => `
                        <button class="tab ${currentFilter === key ? 'active' : ''}" data-filter="${key}">${s.icon} ${s.name}</button>
                    `).join('')}
                </div>
                <div class="leaderboard-table">
                    ${data.length === 0 ? '<p class="empty-msg">Aucun score enregistré pour le moment. Jouez un quiz !</p>' : ''}
                    ${data.map((entry, i) => `
                        <div class="lb-row ${i < 3 ? 'lb-top' : ''}">
                            <span class="lb-rank">${i < 3 ? medals[i] : i + 1}</span>
                            <span class="lb-name">${entry.username}</span>
                            <span class="lb-score">${currentFilter === 'global' ? entry.totalScore : entry.score} pts</span>
                            ${currentFilter === 'global' ? `<span class="lb-games">${entry.quizCount} quiz</span>` : `<span class="lb-games">${entry.correctCount}/${entry.totalQuestions}</span>`}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                currentFilter = tab.dataset.filter;
                render();
            });
        });
    }

    render();
}

// ---- PROFILE ----
export function renderProfile() {
    const user = getCurrentUser();
    if (!user) { navigate('/connexion'); return; }

    const stats = getUserStats(user.userId);
    const history = getUserHistory(user.userId);

    app().innerHTML = `
        <div class="profile-page">
            <div class="profile-card">
                <div class="profile-header">
                    <div class="profile-avatar">${user.username.charAt(0).toUpperCase()}</div>
                    <h2>${user.username}</h2>
                </div>
                <div class="profile-stats">
                    ${stats ? `
                        <div class="stat">
                            <span class="stat-value">${stats.totalGames}</span>
                            <span class="stat-label">Quiz joués</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${stats.totalScore}</span>
                            <span class="stat-label">Score total</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${stats.avgScore}</span>
                            <span class="stat-label">Score moyen</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${stats.bestScore}</span>
                            <span class="stat-label">Meilleur score</span>
                        </div>
                        ${stats.bestSport ? `<div class="stat"><span class="stat-value">${sportLabels[stats.bestSport]?.icon || ''}</span><span class="stat-label">Meilleur sport</span></div>` : ''}
                    ` : '<p class="empty-msg">Jouez votre premier quiz pour voir vos stats !</p>'}
                </div>
            </div>
            <div class="history-section">
                <h3>Historique</h3>
                ${history.length === 0 ? '<p class="empty-msg">Aucun quiz joué pour le moment.</p>' : ''}
                ${history.map(h => `
                    <div class="history-item">
                        <span class="history-sport">${sportLabels[h.sport]?.icon || ''} ${sportLabels[h.sport]?.name || h.sport}</span>
                        <span class="history-type">${quizTypeLabels[h.quizType]?.name || h.quizType}</span>
                        <span class="history-score">${h.score} pts</span>
                        <span class="history-result">${h.correctCount}/${h.totalQuestions}</span>
                        <span class="history-date">${new Date(h.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

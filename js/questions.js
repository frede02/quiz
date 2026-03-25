import { football } from './questions/football.js';
import { cyclisme } from './questions/cyclisme.js';
import { tennis } from './questions/tennis.js';

export const questions = { football, cyclisme, tennis };

export const sportLabels = {
    football: { name: "Football", icon: "⚽", color: "#2d6a4f" },
    cyclisme: { name: "Cyclisme", icon: "🚴", color: "#f4a261" },
    tennis: { name: "Tennis", icon: "🎾", color: "#e76f51" }
};

export const quizTypeLabels = {
    qcm: { name: "QCM", description: "Questions à choix multiples", icon: "📝" },
    vrai_faux: { name: "Vrai ou Faux", description: "Vrai ou faux ?", icon: "✅" },
    estimation: { name: "Estimation", description: "Trouvez le bon nombre", icon: "🔢" },
    qui_suis_je: { name: "Qui suis-je ?", description: "Devinez le sportif grâce aux indices", icon: "🕵️" },
    carriere: { name: "Carrière", description: "Devinez le joueur par ses clubs", icon: "🏟️" },
    mix: { name: "Mix", description: "Un peu de tout !", icon: "🎲" }
};

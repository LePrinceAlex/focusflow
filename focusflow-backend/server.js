const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Pour lire le JSON dans les requêtes

const Session = require('./models/Session');

// Route pour enregistrer une session
app.post('/api/sessions', async (req, res) => {
    try {
        const { taskName, duration, category } = req.body;
        
        const newSession = new Session({
            taskName,
            duration,
            category
        });

        const savedSession = await newSession.save();
        res.status(201).json(savedSession);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Route pour récupérer toutes les sessions
app.get('/api/sessions', async (req, res) => {
    try {
        const sessions = await Session.find().sort({ createdAt: -1 });
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Route pour supprimer une session
app.delete('/api/sessions/:id', async (req, res) => {
    try {
        const deletedSession = await Session.findByIdAndDelete(req.params.id);
        if (!deletedSession) {
            return res.status(404).json({ message: "Session non trouvée" });
        }
        res.json({ message: "Session supprimée avec succès" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connecté à MongoDB"))
    .catch(err => console.error("❌ Erreur de connexion :", err));

// Route de test
app.get('/', (req, res) => {
    res.send("Le serveur FocusFlow est en ligne !");
});

// Route pour obtenir les stats de focus du jour
app.get('/api/sessions/stats/today', async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0); // On remonte à minuit ce matin

        const stats = await Session.aggregate([
            {
                // Étape 1 : Filtrer les sessions créées après minuit
                $match: {
                    createdAt: { $gte: startOfDay }
                }
            },
            {
                // Étape 2 : Additionner le champ 'duration'
                $group: {
                    _id: null,
                    totalMinutes: { $sum: "$duration" },
                    sessionCount: { $sum: 1 }
                }
            }
        ]);

        // Si aucune session aujourd'hui, on renvoie 0
        const result = stats.length > 0 ? stats[0] : { totalMinutes: 0, sessionCount: 0 };
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
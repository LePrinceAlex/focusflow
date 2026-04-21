const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    taskName: { type: String, required: true },
    duration: { type: Number, required: true },
    category: { 
        type: String, 
        enum: ['work', 'break'], // Sécurité : on n'accepte que ces deux valeurs
        default: 'work' 
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', SessionSchema);
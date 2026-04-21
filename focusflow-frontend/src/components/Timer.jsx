import { useState, useEffect, use } from 'react';
import axios from 'axios';
import { Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';

export default function Timer ({ onSessionComplete }) {
    const getSavedPrefs = () => {
        const saved = localStorage.getItem('focusflow_prefs');
        return saved ? JSON.parse(saved) : null;
    };

    const savedPrefs = getSavedPrefs();

    // Initialisation intelligente
    const [cycleConfig, setCycleConfig] = useState(savedPrefs?.cycleConfig || { work: 25, break: 5 });
    const [autoMode, setAutoMode] = useState(savedPrefs?.autoMode || false);
    // On initialise le temps restant en fonction du mode sauvegardé et de la config chargée
    const [totalTime, setTotalTime] = useState((savedPrefs?.cycleConfig?.work || 25) * 60);
    const [timeLeft, setTimeLeft] = useState((savedPrefs?.cycleConfig?.work || 25) * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('work');

    const displayMinutes = Math.floor(timeLeft / 60);
    const displaySeconds = timeLeft % 60;
    const progress = timeLeft / totalTime;

    const [taskName, setTaskName] = useState("");

    const [isSaving, setIsSaving] = useState(false);

    const themeColor = mode === 'work' ? 'stroke-blue-500' : 'stroke-green-500';
    const bgThemeColor = mode === 'work' ? 'bg-blue-500' : 'bg-green-500';

    // Logique du Timer
    useEffect(() => {
        let interval = null;

        if (isActive && (timeLeft > 0)) {
        interval = setInterval(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);
        } else if (timeLeft === 0) {
            handleSessionComplete();
            handleSwitchMode();
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);


    const playNotification = () => {
        const audio = new Audio('/OP_transi.mp3'); // Chemin vers ton fichier dans public/
        audio.play().catch(error => {
            console.error("L'audio n'a pas pu être joué :", error);
        });
    };

    // Fonction pour enregistrer en BDD via notre API Node
    const handleSessionComplete = async () => {
        if (isSaving) return; // Si on est déjà en train de sauvegarder, on stoppe
        setIsSaving(true);
        setIsActive(false);
        try {
            await axios.post('http://localhost:5000/api/sessions', {
                taskName: taskName || (mode === 'work' ? "Focus Session" : "Pause"),
                duration: Math.floor(totalTime / 60),
                category: mode // On enregistre 'work' ou 'break'
            });

            if (onSessionComplete) {
                onSessionComplete();
            }

        } catch (error) {
            console.error("Erreur lors de l'enregistrement", error);
        } finally {
            setIsSaving(false); // On libère le verrou
            if (autoMode) {
                setIsActive(true);
            }
        }
    };

    const handleSwitchMode = () => {
        playNotification();

        const nextMode = mode === 'work' ? 'break' : 'work';
        const nextMinutes = nextMode === 'work' ? cycleConfig.work : cycleConfig.break;
        const nextTime = nextMinutes * 60;

        setMode(nextMode);
        setTotalTime(nextTime);
        setTimeLeft(nextTime);
        if (!autoMode) {
            setIsActive(false); // On stoppe pour que l'utilisateur lance la suite
        }
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(totalTime);
    };

    const RADIUS = 45;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

    const applyPreset = (workMins, breakMins) => {
        setCycleConfig({ work: workMins, break: breakMins });
        setTotalTime(workMins * 60);
        setTimeLeft(workMins * 60);
        setMode('work'); // On repasse en mode travail par défaut lors d'un changement de preset
        setIsActive(false);
    };

    useEffect(() => {
        const preferences = {
            cycleConfig,
            autoMode
        };
        localStorage.setItem('focusflow_prefs', JSON.stringify(preferences));
    }, [cycleConfig, autoMode]); // Se déclenche dès que l'un des deux change

    return (
        <div className="bg-slate-800 p-10 rounded-3xl shadow-2xl flex flex-col items-center">   
            <input 
            type="text" 
            placeholder="Sur quoi travaillez-vous ?"
            className="bg-slate-700 border-none rounded-lg p-3 mb-6 w-full text-center focus:ring-2 focus:ring-blue-500 outline-none"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            />

            <div className="relative flex items-center justify-center w-64 h-64 mb-6">
                {/* SVG de Progression */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Cercle de fond (le rail) */}
                    <circle
                    cx="50" cy="50" r={RADIUS}
                    strokeWidth="6"
                    fill="transparent"
                    className="stroke-slate-700"
                    />
                    {/* Cercle de progression (le tracé bleu) */}
                    <circle
                    cx="50" cy="50" r={RADIUS}
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={CIRCUMFERENCE}
                    style={{
                        strokeDashoffset: CIRCUMFERENCE * (1 - progress),
                        transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease'
                    }}
                    strokeLinecap="round"
                    className={`${mode === 'work' ? 'stroke-blue-500' : 'stroke-green-500'}`}
                    />
                </svg>

                {/* Affichage du Temps au centre */}
                <div className="text-5xl font-mono font-bold z-10">
                    {String(displayMinutes).padStart(2, '0')}:{String(displaySeconds).padStart(2, '0')}
                </div>
            </div>

            <div className="flex gap-2 mb-6">
                    <button className="px-3 py-1 text-xs rounded-full bg-slate-700 hover:bg-slate-600 transition" onClick={() => applyPreset(50,10)}>Focus (50/10)</button>
                    <button className="px-3 py-1 text-xs rounded-full bg-slate-700 hover:bg-slate-600 transition" onClick={() => applyPreset(25,5)}>Pomodoro (25/5)</button>
                    <button className="px-3 py-1 text-xs rounded-full bg-slate-700 hover:bg-slate-600 transition" onClick={() => applyPreset(1,1)}>Test (1/1)</button>
                </div>

            <div className="flex gap-4 mb-6">
                <button 
                    onClick={() => setIsActive(!isActive)}
                    className={`p-4 rounded-full ${isActive ? 'bg-orange-500' : 'bg-green-500'} hover:opacity-90 transition`}
                >
                    {isActive ? <Pause size={32} /> : <Play size={32} />}
                </button>
                
                <button 
                    onClick={resetTimer}
                    className="p-4 bg-slate-600 rounded-full hover:bg-slate-500 transition"
                >
                    <RotateCcw size={32} />
                </button>
            </div>

            <div className='flex gap-2 text-sm'>
                <input 
                    type="checkbox" 
                    checked={autoMode} // On lie la checkbox à l'état (Controlled Component)
                    onChange={(e) => setAutoMode(e.target.checked)} 
                    id='autoMode'
                    className="accent-blue-500"
                />
                <label htmlFor="autoMode">Activer le mode automatique</label>
            </div>
        </div>
    );
}
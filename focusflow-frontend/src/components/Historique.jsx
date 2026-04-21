import axios from "axios";
import { useEffect, useState } from "react";
import { History, Target, Clock, Trash2 } from "lucide-react"; // Pour le côté pro

export default function Historique({ refreshTrigger }) {
    const [sessions, setSessions] = useState([]);
    const [stats, setStats] = useState({ totalMinutes: 0, sessionCount: 0 });

    const fetchSessions = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/sessions');
            setSessions(response.data);
        } catch (error) {
            console.error("Erreur sessions", error);
        }
    };

    const fetchStats = async () => {
        try {
            const reponse = await axios.get('http://localhost:5000/api/sessions/stats/today');
            // On s'assure de stocker les données même si elles sont vides
            setStats(reponse.data);
        } catch (error) {
            console.error("Erreur stats", error);
        }
    };

    const deleteSession = async (id) => {
        if (window.confirm("Voulez-vous vraiment supprimer cette session ?")) {
            try {
                await axios.delete(`http://localhost:5000/api/sessions/${id}`);
                // Après suppression, on rafraîchit les données localement
                fetchSessions();
                fetchStats();
            } catch (error) {
                console.error("Erreur lors de la suppression", error);
            }
        }
    };

    useEffect(() => {
        fetchStats();
        fetchSessions();
    }, [refreshTrigger]);

    return (
        <div className="w-full max-w-2xl mt-10 space-y-8">
            {/* Section Statistiques */}
            <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-400">
                    <Target size={20} /> Statistiques du jour
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <p className="text-slate-400 text-sm">Temps total</p>
                        <p className="text-2xl font-bold">{stats.totalMinutes} min</p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <p className="text-slate-400 text-sm">Sessions</p>
                        <p className="text-2xl font-bold">{stats.sessionCount}</p>
                    </div>
                </div>
            </section>

            {/* Section Historique */}
            <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-400">
                    <History size={20} /> Historique récent
                </h2>
                <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                    {sessions.length === 0 ? (
                        <p className="p-4 text-slate-500 italic">Aucune session enregistrée.</p>
                    ) : (
                        <ul className="divide-y divide-slate-700">
                            {sessions.map((session) => (
                                <li key={session._id} className="p-4 flex justify-between items-center hover:bg-slate-700/40 transition group">
                                    <div className="flex items-center gap-3">
                                        {/* Pastille de couleur dynamique */}
                                        <div className={`w-3 h-3 rounded-full shadow-[0_0_8px] ${
                                            session.category === 'work' 
                                            ? 'bg-blue-500 shadow-blue-500/50' 
                                            : 'bg-green-500 shadow-green-500/50'
                                        }`} />
                                        
                                        <div>
                                            <p className="font-medium text-slate-200">{session.taskName}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span>{new Date(session.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                <span>•</span>
                                                <span className="capitalize">{session.category === 'work' ? 'Focus' : 'Pause'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className={`font-mono font-semibold ${session.category === 'work' ? 'text-blue-400' : 'text-green-400'}`}>
                                            {session.duration} min
                                        </span>
                                        
                                        {/* Le bouton de suppression */}
                                        <button 
                                            onClick={() => deleteSession(session._id)}
                                            className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                                            title="Supprimer la session"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </div>
    );
}
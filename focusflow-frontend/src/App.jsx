import { useState } from 'react';
import Timer from './components/Timer';
import Historique from './components/Historique';

function App() {

  // Cet état servira de signal de rafraîchissement
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Cette fonction sera appelée par le Timer une fois le POST réussi
  const triggerRefresh = () => {
    setLastUpdate(Date.now());
  };


  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">FocusFlow</h1>
      
      {/* On passe la fonction de déclenchement au Timer */}
      <Timer onSessionComplete={triggerRefresh} />

      {/* On passe la valeur du déclencheur à l'Historique */}
      <Historique refreshTrigger={lastUpdate} />
      
    </div>
  );
}

export default App;
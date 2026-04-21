# 🚀 FocusFlow - Pomodoro Fullstack

FocusFlow est une application de productivité complète basée sur la méthode Pomodoro. 
Ce projet m'a permis de mettre en pratique des concepts avancés de développement Fullstack, de la gestion d'états complexes en React à la persistance de données avec MongoDB.

## 🛠️ Stack Technique

- **Frontend :** React 19, Vite, Tailwind CSS (via @tailwindcss/vite).

- **Backend :** Node.js, Express.

- **Base de données :** MongoDB Atlas (Mongoose).

- **Icons & UI :** Lucide-React, SVG dynamique.

## ✨ Fonctionnalités Clés

- **Timer Dynamique :** Visualisation de la progression via un cercle SVG animé (calcul de stroke-dashoffset).

- **Gestion de Cycles :** Alternance automatique entre modes "Travail" et "Pause".

- **Presets Personnalisables :** Modes 25/5, 50/10 et mode Test (1min).

- **Mode Automatique :** Enchaînement des sessions sans intervention manuelle.

- **Historique & Stats :** Suivi des sessions en temps réel avec stockage en base de données.

- **Persistance :** Sauvegarde des préférences utilisateur (presets, mode auto) via LocalStorage.

- **Audio :** Alertes sonores lors des transitions de mode.

## 🧠 Défis Techniques Relevés


### **1. Synchronisation des Composants (Lifting State Up)**

Pour que le composant Timer puisse mettre à jour l'affichage de l'historique sans recharger la page, j'ai implémenté une remontée d'état dans App.jsx. Un "trigger" de rafraîchissement est passé via les props, déclenchant le useEffect du composant Historique.

### **2. Animation SVG Mathématique**

   Le cercle de progression n'est pas une simple image, mais un tracé SVG piloté par les mathématiques :
   
        $Offset = Circonférence \times (1 - \frac{TempsRestant}{TempsTotal})$
   Cela permet une fluidité parfaite et une netteté absolue sur tous les écrans.

### **3. Architecture API & Intégrité des données**

   Mise en place d'un CRUD complet. Côté Backend, j'ai utilisé des enums Mongoose pour garantir que seules les catégories work ou break soient enregistrées, assurant la fiabilité des statistiques journalières.
    
## 🚀 Installation & Lancement
### 1. Cloner le dépôt :
    
        git clone https://github.com/ton-pseudo/focusflow.git

### 2. Installer les dépendances (Front & Back) :

        cd focusflow-frontend && npm install
        cd focusflow-backend && npm install

### 3. Variables d'environnement :
        
Créer un fichier .env dans le dossier backend avec votre MONGO_URI.
    
### 4. Lancer le projet :

**Backend :** 
        
        node server.js (Port 5000)
        
**Frontend :**

        npm run dev (Port 5173)

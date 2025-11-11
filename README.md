# 🎓 Flashcard Quiz - Istruzioni

## 🚀 Accesso Rapido

### Opzione 1: Online su GitHub Pages
Se il repository è su GitHub, accedi a:
```
https://[tuonome].github.io/[nome-repo]/
```

### Opzione 2: Offline Locale
1. **Scarica i file** dal repository
2. **Apri `index.html`** direttamente nel browser
3. Tutto funziona senza server!

---

## 📝 Come Usare

1. **Copia il formato JSON** dal file `esempio-domande.json` oppure crea le tue domande
2. **Incolla il JSON** nella casella di testo
3. **Clicca "Carica Domande"** per iniziare il quiz
4. **Rispondi alle domande** - puoi provare più volte
5. **Guarda il riepilogo** alla fine con le statistiche

---

## 📋 Formato delle Domande

Le domande devono essere in formato JSON con questa struttura:

```json
[
  {
    "domanda": "Testo della domanda?",
    "risposte": ["Risposta 1", "Risposta 2", "Risposta 3", "Risposta 4"],
    "corretta": 0,
    "spiegazione": "Spiegazione della risposta corretta"
  }
]
```

### Campi Obbligatori:
- **domanda** (string): Il testo della domanda
- **risposte** (array): Esattamente 4 risposte possibili
- **corretta** (number): Indice della risposta corretta (0, 1, 2 o 3)
- **spiegazione** (string): Spiegazione della risposta corretta

### Esempio Completo:
```json
[
  {
    "domanda": "Qual è la capitale dell'Italia?",
    "risposte": ["Roma", "Milano", "Napoli", "Torino"],
    "corretta": 0,
    "spiegazione": "Roma è la capitale d'Italia dal 1871."
  },
  {
    "domanda": "Quanto fa 2 + 2?",
    "risposte": ["3", "4", "5", "6"],
    "corretta": 1,
    "spiegazione": "2 più 2 fa 4."
  }
]
```

---

## ✨ Funzionalità

### 🎨 Immagini Generate dall'AI
- Ogni domanda ha un'immagine unica generata automaticamente
- Usa l'API gratuita di Pollinations.ai
- Le immagini si caricano **in parallelo** per velocità massima

### 🎮 Quiz Interattivo
1. **Vedi la domanda** con immagine e 4 risposte
2. **Clicca una risposta**
3. **Se è sbagliata** → diventa ROSSA e puoi riprovare
4. **Se è corretta** → diventa VERDE e appare la spiegazione
5. **Clicca "Prossima"** per la domanda successiva
6. **Al termine** vedi il riepilogo con le statistiche

### 📊 Riepilogo Finale
- ✅ Numero di risposte corrette al **primo tentativo**
- 📈 Dettaglio per ogni domanda con numero di tentativi
- 🏆 Badge colorati (verde = 1 tentativo, arancione = più tentativi)
- 🔤 Mostra la risposta corretta e la spiegazione per ogni domanda

### 🎯 Pulsanti di Controllo
- **⏭️ Salta al Riepilogo**: Vai direttamente al riepilogo finale
- **🏠 Torna alla Home**: Ritorna al menu iniziale

---

## 🛠️ Tecnologia

- **Frontend**: HTML5 + CSS3 + JavaScript vanilla (nessuna libreria esterna)
- **Immagini**: Pollinations.ai (API gratuita)
- **Matematica**: KaTeX per formule LaTeX
- **Design**: Fully responsive (desktop, tablet, mobile)
- **Storage**: LocalStorage per salvare il progresso

---

## 💡 Caratteristiche Speciali

✅ **Nessun backend necessario** - Tutto nel browser  
✅ **Funziona offline** - Tranne generazione immagini (richiede internet)  
✅ **Salva il progresso** - Puoi chiudere e riprendere dopo  
✅ **Supporta LaTeX** - Puoi usare formule matematiche come `$x = \frac{-b}{2a}$`  
✅ **Generazione parallela** - Tutte le immagini si caricano velocemente  
✅ **Responsive design** - Perfetto su qualsiasi dispositivo  

---

## 🌐 Deploy su GitHub Pages

### Se vuoi pubblicare il tuo quiz online:

1. **Crea un repository GitHub** (pubblico)
2. **Carica i file** nel repository:
   - `index.html`
   - `style.css`
   - `script.js`
   - `README.md` (opzionale)

3. **Abilita GitHub Pages**:
   - Vai su Settings → Pages
   - Scegli "Deploy from a branch"
   - Seleziona il branch `main`
   - Salva

4. **Attendi 1-2 minuti** e il sito sarà live su:
   ```
   https://[tuonome].github.io/[nome-repo]/
   ```

---

## 🐛 Troubleshooting

### Le immagini non si caricano?
- Verifica la connessione internet
- Prova a ricaricare la pagina
- Controlla la console del browser (F12) per errori CORS

### Il JSON non viene accettato?
- Verifica che sia JSON valido (usa un validatore online)
- Assicurati di avere esattamente 4 risposte per domanda
- Verifica che `corretta` sia un numero (0-3)

### Vuoi supportare LaTeX?
Scrivi le formule con `$` per inline:
```
"domanda": "Calcola $x = \frac{-b}{2a}$"
```

O con `$$` per display:
```
"domanda": "Risolvi: $$x^2 + 2x + 1 = 0$$"
```

---

## 📄 Licenza

Libero da usare per progetti personali ed educativi.

---

## 🚀 Tips per Risultati Migliori

1. **Domande chiare** - Scrivi domande ben formulate
2. **Risposte credibili** - Le risposte sbagliate dovrebbero essere plausibili
3. **Spiegazioni utili** - Aiuta gli utenti a imparare
4. **Poca fretta** - Non caricare troppe domande contemporaneamente
5. **Testa prima** - Prova il quiz localmente prima di condividerlo

---

Buon divertimento con le tue flashcard! 🎓✨

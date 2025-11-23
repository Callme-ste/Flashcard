# 🎓 Flashcard Quiz - Istruzioni

## Come usare il sito

1. **Apri il file `index.html`** nel tuo browser
2. **Copia il contenuto** del file `esempio-domande.json` o crea le tue domande
3. **Incolla** nella casella di testo
4. **Clicca "Inizia Quiz"** per cominciare

## Formato delle domande

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

### Campi richiesti:
- **domanda**: Il testo della domanda (stringa)
- **risposte**: Array di esattamente 4 risposte possibili
- **corretta**: Indice della risposta corretta (0, 1, 2 o 3)
- **spiegazione**: Testo che spiega perché la risposta è corretta

## Funzionalità

### ✅ Cosa fa il sito:
- **Generazione automatica immagini**: Ogni domanda ha un'immagine generata dall'AI (Pollinations.ai)
- **Feedback visivo**: Bottoni rossi per risposte sbagliate, verde per quella corretta
- **Tentativi multipli**: Puoi continuare a provare finché non trovi la risposta giusta
- **Spiegazione**: Appare solo quando trovi la risposta corretta
- **Riepilogo finale**: Mostra quante domande hai indovinato al primo tentativo e il dettaglio per ogni domanda

### 🎮 Come funziona il quiz:
1. Vedi la domanda con un'immagine generata dall'AI
2. Clicca su una risposta
3. Se è sbagliata → diventa ROSSA e non puoi più cliccarla
4. Se è corretta → diventa VERDE e appare la spiegazione
5. Clicca "Prossima Domanda" per continuare
6. Al termine vedi il riepilogo con tutte le statistiche

### 📊 Riepilogo finale mostra:
- Numero di risposte corrette al primo tentativo
- Lista dettagliata con numero di tentativi per ogni domanda
- Badge colorati (verde = 1 tentativo, arancione = più tentativi)

## Tecnologia utilizzata

- **HTML5 + CSS3 + JavaScript** (nessuna libreria esterna)
- **Pollinations.ai**: API gratuita per generazione immagini AI
- **Design responsive**: Funziona su desktop, tablet e mobile

## Note

- Il formato JSON è tollerante: può avere spazi o andare a capo
- Le immagini vengono generate velocemente (1-2 secondi)
- Tutto funziona offline tranne la generazione immagini (richiede connessione internet)
- Non ci sono limiti al numero di domande che puoi caricare

Buon divertimento con le tue flashcard! 🚀

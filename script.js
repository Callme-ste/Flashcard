// Variabili globali
let domande = [];
let immaginiGenerate = []; // Array per memorizzare le immagini pre-generate
let indiceDomandaCorrente = 0;
let tentativi = []; // Array per tracciare i tentativi per ogni domanda
let tentativiDomandaCorrente = 0;
let risposteGiaSelezionate = new Set();
let generazioneInCorso = false; // Flag per la generazione in background
let immaginiCaricateCount = 0; // Contatore immagini generate

// Chiavi per localStorage
const STORAGE_KEYS = {
    DOMANDE: 'flashcard_domande',
    IMMAGINI: 'flashcard_immagini',
    INDICE: 'flashcard_indice',
    TENTATIVI: 'flashcard_tentativi',
    IMG_CARICATE: 'flashcard_img_caricate',
    IN_CORSO: 'flashcard_in_corso'
};

// Elementi DOM
const menuIniziale = document.getElementById('menuIniziale');
const schermaFlashcard = document.getElementById('schermaFlashcard');
const schermaRiepilogo = document.getElementById('schermaRiepilogo');
const domandeInput = document.getElementById('domandeInput');
const btnCarica = document.getElementById('btnCarica');
const btnCopiaEsempio = document.getElementById('btnCopiaEsempio');
const btnCancella = document.getElementById('btnCancella');
const btnProssima = document.getElementById('btnProssima');
const btnRicomincia = document.getElementById('btnRicomincia');
const errorMessage = document.getElementById('errorMessage');

// Inizializzazione al caricamento della pagina
window.addEventListener('DOMContentLoaded', () => {
    ripristinaStatoSalvato();
});

// Funzione per renderizzare LaTeX in un elemento
function renderLaTeX(elemento) {
    if (window.renderMathInElement) {
        renderMathInElement(elemento, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
            ],
            throwOnError: false
        });
    }
}

// Funzione per mostrare una schermata
function mostraSchermata(schermata) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    schermata.classList.add('active');
}

// Salva lo stato corrente in localStorage
function salvaStato() {
    try {
        localStorage.setItem(STORAGE_KEYS.DOMANDE, JSON.stringify(domande));
        localStorage.setItem(STORAGE_KEYS.IMMAGINI, JSON.stringify(immaginiGenerate));
        localStorage.setItem(STORAGE_KEYS.INDICE, indiceDomandaCorrente.toString());
        localStorage.setItem(STORAGE_KEYS.TENTATIVI, JSON.stringify(tentativi));
        localStorage.setItem(STORAGE_KEYS.IMG_CARICATE, immaginiCaricateCount.toString());
        localStorage.setItem(STORAGE_KEYS.IN_CORSO, generazioneInCorso.toString());
    } catch (e) {
        console.error('Errore nel salvataggio dello stato:', e);
    }
}

// Ripristina lo stato salvato
function ripristinaStatoSalvato() {
    try {
        const domandeStr = localStorage.getItem(STORAGE_KEYS.DOMANDE);
        const immaginiStr = localStorage.getItem(STORAGE_KEYS.IMMAGINI);
        const indiceStr = localStorage.getItem(STORAGE_KEYS.INDICE);
        const tentativiStr = localStorage.getItem(STORAGE_KEYS.TENTATIVI);
        const imgCaricateStr = localStorage.getItem(STORAGE_KEYS.IMG_CARICATE);
        const inCorsoStr = localStorage.getItem(STORAGE_KEYS.IN_CORSO);
        
        if (domandeStr && immaginiStr && indiceStr && tentativiStr) {
            domande = JSON.parse(domandeStr);
            immaginiGenerate = JSON.parse(immaginiStr);
            indiceDomandaCorrente = parseInt(indiceStr);
            tentativi = JSON.parse(tentativiStr);
            immaginiCaricateCount = parseInt(imgCaricateStr || '0');
            generazioneInCorso = inCorsoStr === 'true';
            
            // Aggiorna UI
            document.getElementById('immaginiTotali').textContent = domande.length;
            document.getElementById('immaginiCaricate').textContent = immaginiCaricateCount;
            
            // Mostra la schermata del quiz
            mostraSchermata(schermaFlashcard);
            mostraDomanda();
            
            // Riprendi generazione se era in corso
            if (generazioneInCorso && immaginiCaricateCount < domande.length) {
                riprendiGenerazioneImmagini();
            } else if (immaginiCaricateCount >= domande.length) {
                // Tutte le immagini caricate, nascondi contatore
                const contatore = document.getElementById('contatoreImmagini');
                contatore.style.display = 'none';
            }
        }
    } catch (e) {
        console.error('Errore nel ripristino dello stato:', e);
        pulisciStato();
    }
}

// Pulisce lo stato salvato
function pulisciStato() {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}

// Copia l'esempio JSON
btnCopiaEsempio.addEventListener('click', async () => {
    const esempio = document.getElementById('esempioJSON').textContent;
    try {
        await navigator.clipboard.writeText(esempio);
        btnCopiaEsempio.textContent = '✅ Copiato!';
        setTimeout(() => {
            btnCopiaEsempio.textContent = '📋 Copia Esempio';
        }, 2000);
    } catch (err) {
        // Fallback per browser che non supportano clipboard API
        domandeInput.value = esempio;
        btnCopiaEsempio.textContent = '✅ Inserito!';
        setTimeout(() => {
            btnCopiaEsempio.textContent = '📋 Copia Esempio';
        }, 2000);
    }
});

// Pulisce la casella di testo
btnCancella.addEventListener('click', () => {
    domandeInput.value = '';
    errorMessage.textContent = '';
});

// Carica le domande e inizia la generazione immagini
btnCarica.addEventListener('click', () => {
    const testo = domandeInput.value.trim();
    
    if (!testo) {
        mostraErrore('Per favore, inserisci le domande in formato JSON!');
        return;
    }
    
    let testoPulito = testo;

    try {
        // Pulisce il testo da eventuali tag [cite_start] e [cite: X]
        
        // 1. Normalizza virgolette curve in dritte
        testoPulito = testoPulito.replace(/[''`´]/g, "'");
        testoPulito = testoPulito.replace(/[""«»]/g, '"');
        
        // 2. Rimuove ritorni a capo e tab che possono invalidare il JSON
        testoPulito = testoPulito.replace(/\r?\n/g, ' ');
        testoPulito = testoPulito.replace(/\t/g, ' ');

        // 3. Protegge le formule LaTeX temporaneamente
        const latexCommands = testoPulito.match(/\$[^$]*\$/g) || [];
        const latexPlaceholders = latexCommands.map((_, i) => `___LATEX_PLACEHOLDER_${i}___`);
        latexCommands.forEach((latex, i) => {
            testoPulito = testoPulito.replace(latex, latexPlaceholders[i]);
        });
        
        // 4. Rimuove tag cite
        testoPulito = testoPulito.replace(/\[cite_start\]/g, '');
        testoPulito = testoPulito.replace(/\[cite:\s*\d+(?:\s*,\s*\d+)*\]/g, '');
        
        // 4. Ripristina LaTeX originale
        latexPlaceholders.forEach((placeholder, i) => {
            testoPulito = testoPulito.replace(placeholder, latexCommands[i]);
        });
        
        // 6. NON fare escape dei backslash - rimuovili invece (tranne quelli in LaTeX che sono già protetti)
        // I backslash nelle stringhe JSON vengono rimossi perché non servono
        // (il LaTeX è già stato protetto e ripristinato)
        
        // Parsing con tolleranza agli errori
        domande = JSON.parse(testoPulito);    // Validazione
        if (!Array.isArray(domande) || domande.length === 0) {
            throw new Error('Il formato deve essere un array di domande');
        }
        
        // Valida e normalizza ogni domanda
        for (let i = 0; i < domande.length; i++) {
            const d = domande[i];
            
            // Normalizza i nomi dei campi (accetta vari formati)
            if (d.opzioni && !d.risposte) {
                d.risposte = d.opzioni;
                delete d.opzioni;
            }
            if (d.risposta_corretta !== undefined && d.corretta === undefined) {
                d.corretta = d.risposta_corretta;
                delete d.risposta_corretta;
            }
            
            // Rimuove campi extra non necessari
            delete d.image_prompt;
            delete d.id;
            delete d.difficulty;
            delete d.tags;
            
            // Validazione
            if (!d.domanda || !Array.isArray(d.risposte) || d.risposte.length !== 4 || 
                typeof d.corretta !== 'number' || !d.spiegazione) {
                throw new Error(`Domanda ${i + 1} non valida. Assicurati che abbia: domanda, risposte/opzioni (array di 4), corretta/risposta_corretta (numero 0-3), spiegazione`);
            }
            
            // Pulisce anche i campi interni da eventuali tag rimasti
            d.domanda = d.domanda.replace(/\[cite_start\]/g, '').replace(/\[cite:\s*\d+(?:\s*,\s*\d+)*\]/g, '').trim();
            d.spiegazione = d.spiegazione.replace(/\[cite_start\]/g, '').replace(/\[cite:\s*\d+(?:\s*,\s*\d+)*\]/g, '').trim();
            d.risposte = d.risposte.map(r => r.replace(/\[cite_start\]/g, '').replace(/\[cite:\s*\d+(?:\s*,\s*\d+)*\]/g, '').trim());
        }
        
        // Inizializza tracking tentativi
        tentativi = new Array(domande.length).fill(0);
        indiceDomandaCorrente = 0;
        immaginiGenerate = new Array(domande.length).fill(null); // Array con placeholder null
        immaginiCaricateCount = 0;
        generazioneInCorso = true;
        
        errorMessage.textContent = '';
        
        // Aggiorna contatore
        document.getElementById('immaginiTotali').textContent = domande.length;
        document.getElementById('immaginiCaricate').textContent = '0';
        
        // Salva lo stato iniziale
        salvaStato();
        
        // Inizia il quiz immediatamente
        mostraSchermata(schermaFlashcard);
        mostraDomanda();
        
        // Genera le immagini in background
        generaImmaginiInBackground();
        
    } catch (e) {
        // Log diagnostico per individuare il carattere problematico
        try {
            const match = e.message.match(/position\s(\d+)/i);
            if (match) {
                const pos = parseInt(match[1], 10);
                const start = Math.max(0, pos - 50);
                const end = Math.min(testoPulito.length, pos + 50);
                console.error('Errore JSON vicino a:', testoPulito.slice(start, end));
            }
        } catch (diagErr) {
            console.error('Diagnostica JSON fallita:', diagErr);
        }
        mostraErrore('Errore nel formato JSON: ' + e.message);
    }
});

// Genera tutte le immagini in background
async function generaImmaginiInBackground() {
    for (let i = 0; i < domande.length; i++) {
        // Salta se l'immagine è già stata generata
        if (immaginiGenerate[i]) continue;
        
        const domanda = domande[i];
        const imageUrl = await generaImmagineAI(domanda.domanda, i);
        immaginiGenerate[i] = imageUrl;
        immaginiCaricateCount++;
        
        // Aggiorna contatore
        document.getElementById('immaginiCaricate').textContent = immaginiCaricateCount;
        
        // Salva lo stato dopo ogni immagine generata
        salvaStato();
        
        // Se siamo alla domanda corrente e l'immagine è stata generata, aggiornala
        if (i === indiceDomandaCorrente) {
            const immagineAI = document.getElementById('immagineAI');
            immagineAI.src = imageUrl;
        }
        
        // Nascondi il contatore quando tutte le immagini sono caricate
        if (immaginiCaricateCount === domande.length) {
            generazioneInCorso = false;
            salvaStato();
            const contatore = document.getElementById('contatoreImmagini');
            setTimeout(() => {
                contatore.style.opacity = '0';
                setTimeout(() => contatore.style.display = 'none', 300);
            }, 1000);
        }
    }
}

// Riprende la generazione delle immagini dal punto dove era rimasta
async function riprendiGenerazioneImmagini() {
    for (let i = 0; i < domande.length; i++) {
        // Salta se l'immagine è già stata generata
        if (immaginiGenerate[i]) continue;
        
        const domanda = domande[i];
        const imageUrl = await generaImmagineAI(domanda.domanda, i);
        immaginiGenerate[i] = imageUrl;
        immaginiCaricateCount++;
        
        // Aggiorna contatore
        document.getElementById('immaginiCaricate').textContent = immaginiCaricateCount;
        
        // Salva lo stato dopo ogni immagine generata
        salvaStato();
        
        // Se siamo alla domanda corrente e l'immagine è stata generata, aggiornala
        if (i === indiceDomandaCorrente) {
            const immagineAI = document.getElementById('immagineAI');
            immagineAI.src = imageUrl;
        }
        
        // Nascondi il contatore quando tutte le immagini sono caricate
        if (immaginiCaricateCount === domande.length) {
            generazioneInCorso = false;
            salvaStato();
            const contatore = document.getElementById('contatoreImmagini');
            setTimeout(() => {
                contatore.style.opacity = '0';
                setTimeout(() => contatore.style.display = 'none', 300);
            }, 1000);
        }
    }
}

// Mostra errore
function mostraErrore(messaggio) {
    errorMessage.textContent = messaggio;
    errorMessage.style.display = 'block';
}

// Mostra la domanda corrente
function mostraDomanda() {
    if (indiceDomandaCorrente >= domande.length) {
        mostraRiepilogo();
        return;
    }
    
    const domanda = domande[indiceDomandaCorrente];
    tentativiDomandaCorrente = 0;
    risposteGiaSelezionate.clear();
    
    // Aggiorna progress bar
    document.getElementById('numeroDomanda').textContent = indiceDomandaCorrente + 1;
    document.getElementById('totaleDomande').textContent = domande.length;
    const progressPercent = ((indiceDomandaCorrente) / domande.length) * 100;
    document.getElementById('progressFill').style.width = progressPercent + '%';
    
    // Mostra domanda
    const testoDomanda = document.getElementById('testoDomanda');
    testoDomanda.textContent = domanda.domanda;
    // Renderizza LaTeX nella domanda
    setTimeout(() => renderLaTeX(testoDomanda), 0);
    
    // Nascondi spiegazione
    document.getElementById('spiegazioneContainer').classList.add('hidden');
    
    // Mostra immagine (pre-generata o placeholder)
    const immagineAI = document.getElementById('immagineAI');
    if (immaginiGenerate[indiceDomandaCorrente]) {
        // Immagine già generata
        immagineAI.src = immaginiGenerate[indiceDomandaCorrente];
    } else {
        // Immagine placeholder temporanea con gradiente colorato
        const colors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        ];
        const randomColor = colors[indiceDomandaCorrente % colors.length];
        immagineAI.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23667eea;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23764ba2;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='450' fill='url(%23grad)' /%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle'%3E🎨 Caricamento...%3C/text%3E%3C/svg%3E`;
    }
    immagineAI.style.display = 'block';
    
    // Crea bottoni risposta
    const containerRisposte = document.getElementById('containerRisposte');
    containerRisposte.innerHTML = '';
    
    domanda.risposte.forEach((risposta, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = risposta;
        btn.onclick = () => verificaRisposta(index);
        containerRisposte.appendChild(btn);
        // Renderizza LaTeX nelle risposte
        setTimeout(() => renderLaTeX(btn), 0);
    });
}

// Genera immagine con AI (Pollinations.ai - veloce e gratuito)
async function generaImmagineAI(testoDomanda, seed = null) {
    return new Promise((resolve) => {
        try {
            // Crea prompt per l'immagine
            const prompt = encodeURIComponent(
                `educational illustration about: ${testoDomanda.substring(0, 100)}, simple, clean, colorful`
            );
            
            // Usa seed per evitare duplicati
            const seedValue = seed !== null ? seed : Math.floor(Math.random() * 10000);
            
            // Pollinations.ai - API gratuita e velocissima
            const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=450&nologo=true&seed=${seedValue}`;
            
            // Precarica l'immagine
            const img = new Image();
            img.onload = () => {
                resolve(imageUrl);
            };
            img.onerror = () => {
                // In caso di errore, usa un'immagine placeholder
                resolve(`https://via.placeholder.com/800x450/4CAF50/ffffff?text=${encodeURIComponent('Quiz')}`);
            };
            img.src = imageUrl;
            
        } catch (error) {
            console.error('Errore generazione immagine:', error);
            resolve(`https://via.placeholder.com/800x450/4CAF50/ffffff?text=${encodeURIComponent('Quiz')}`);
        }
    });
}

// Verifica la risposta
function verificaRisposta(indiceSelezionato) {
    const domanda = domande[indiceDomandaCorrente];
    const bottoni = document.querySelectorAll('.answer-btn');
    const btnSelezionato = bottoni[indiceSelezionato];
    
    // Evita doppi click sulla stessa risposta
    if (risposteGiaSelezionate.has(indiceSelezionato)) {
        return;
    }
    
    tentativiDomandaCorrente++;
    risposteGiaSelezionate.add(indiceSelezionato);
    
    if (indiceSelezionato === domanda.corretta) {
        // Risposta corretta
        btnSelezionato.classList.add('correct');
        tentativi[indiceDomandaCorrente] = tentativiDomandaCorrente;
        
        // Disabilita tutti i bottoni
        bottoni.forEach(btn => btn.disabled = true);
        
        // Mostra spiegazione
        const testoSpiegazione = document.getElementById('testoSpiegazione');
        testoSpiegazione.textContent = domanda.spiegazione;
        document.getElementById('spiegazioneContainer').classList.remove('hidden');
        // Renderizza LaTeX nella spiegazione
        setTimeout(() => renderLaTeX(testoSpiegazione), 0);
        
        // Salva dopo risposta corretta
        salvaStato();
        
    } else {
        // Risposta sbagliata
        btnSelezionato.classList.add('wrong');
        btnSelezionato.disabled = true;
        
        // Animazione shake
        btnSelezionato.classList.add('shake');
        setTimeout(() => btnSelezionato.classList.remove('shake'), 500);
    }
}

// Prossima domanda
btnProssima.addEventListener('click', () => {
    indiceDomandaCorrente++;
    salvaStato(); // Salva dopo ogni avanzamento
    mostraDomanda();
});

// Mostra riepilogo finale
function mostraRiepilogo() {
    mostraSchermata(schermaRiepilogo);
    
    // Calcola risposte corrette al primo tentativo
    const primoTentativo = tentativi.filter(t => t === 1).length;
    
    document.getElementById('risposteCorrette').textContent = primoTentativo;
    document.getElementById('totaleDomandeRiepilogo').textContent = domande.length;
    
    // Dettaglio tentativi
    const dettaglio = document.getElementById('dettaglioTentativi');
    dettaglio.innerHTML = '';
    
    domande.forEach((domanda, index) => {
        const card = document.createElement('div');
        card.className = 'attempt-card';
        
        const numTentativi = tentativi[index];
        const classe = numTentativi === 1 ? 'first-try' : 'multiple-tries';
        
        card.innerHTML = `
            <div class="attempt-header ${classe}">
                <span class="attempt-number">Domanda ${index + 1}</span>
                <span class="attempt-badge">${numTentativi} ${numTentativi === 1 ? 'tentativo' : 'tentativi'}</span>
            </div>
            <p class="attempt-question">${domanda.domanda}</p>
            <p class="attempt-answer"><strong>✓</strong> ${domanda.risposte[domanda.corretta]}</p>
            <div class="attempt-explanation hidden" id="explanation-${index}">
                <strong>📖 Spiegazione:</strong>
                <p>${domanda.spiegazione}</p>
            </div>
            <button class="btn-show-explanation" onclick="toggleSpiegazione(${index})">
                <span id="btn-text-${index}">👁️ Mostra Spiegazione</span>
            </button>
        `;
        
        dettaglio.appendChild(card);
        
        // Renderizza LaTeX in tutti gli elementi della card
        setTimeout(() => {
            renderLaTeX(card.querySelector('.attempt-question'));
            renderLaTeX(card.querySelector('.attempt-answer'));
            renderLaTeX(card.querySelector('.attempt-explanation'));
        }, 0);
    });
}

// Toggle spiegazione nel riepilogo
function toggleSpiegazione(index) {
    const explanation = document.getElementById(`explanation-${index}`);
    const btnText = document.getElementById(`btn-text-${index}`);
    
    if (explanation.classList.contains('hidden')) {
        explanation.classList.remove('hidden');
        btnText.textContent = '🙈 Nascondi Spiegazione';
    } else {
        explanation.classList.add('hidden');
        btnText.textContent = '👁️ Mostra Spiegazione';
    }
}

// Ricomincia quiz
btnRicomincia.addEventListener('click', () => {
    domande = [];
    indiceDomandaCorrente = 0;
    tentativi = [];
    immaginiGenerate = [];
    immaginiCaricateCount = 0;
    generazioneInCorso = false;
    domandeInput.value = '';
    errorMessage.textContent = '';
    
    // Pulisci localStorage
    pulisciStato();
    
    mostraSchermata(menuIniziale);
});

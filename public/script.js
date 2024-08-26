// script.js
console.log("Script caricato");

// Importa le funzioni necessarie da Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, query, collection, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js"; 
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js"; 

// Configurazione Firebase
export const firebaseConfig = {
  apiKey: "AIzaSyBgvJNsw-tBHQ9p7pKjwVobY21eP4yinME",
  authDomain: "demos-fc108.firebaseapp.com",
  projectId: "demos-fc108",
  storageBucket: "demos-fc108.appspot.com",
  messagingSenderId: "764587003476",
  appId: "1:764587003476:web:10e894c9e01fa1b136e7c1",
  measurementId: "G-ZNGCE89DF4"
};

// Inizializza Firebase, Firestore e Auth
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Inizializza Firestore
const auth = getAuth(app); // Inizializza Auth

console.log("Firebase inizializzato:", app);
console.log("Firebase configurato:", firebaseConfig);

// Verifica che il database e l'autenticazione siano correttamente inizializzati
console.log("Firestore:", db);
console.log("Auth:", auth);

async function getHeartbeats() {
    try {
        const heartbeatsCollection = collection(db, "heartbeat1");
        const heartbeatsSnapshot = await getDocs(heartbeatsCollection);
        const heartbeatsList = heartbeatsSnapshot.docs.map(doc => doc.data());
        return heartbeatsList;
    } catch (error) {
        console.error("Errore nel recupero dei heartbeats:", error);
        return []; // Restituisce un array vuoto in caso di errore
    }
}

// Funzione per passare a un'altra pagina
window.mostraPagina = function(pagina) {
  const tutteLePagine = document.querySelectorAll('.pagina');
  tutteLePagine.forEach(pagina => pagina.classList.remove('attiva'));
  const paginaDaMostrare = document.getElementById(pagina);
  if (paginaDaMostrare) {
    paginaDaMostrare.classList.add('attiva');
  } else {
    console.error(`Pagina ${pagina} non trovata`);
  }
}


// Funzione per inizializzare il caricamento della pagina iniziale

document.addEventListener('DOMContentLoaded', async () => {
   console.log("DOM completamente caricato e analizzato");
    mostraPagina('pagina-iniziale'); // Mostra la pagina iniziale all'avvio

   // Chiamata alla funzione per recuperare i heartbeats
    const heartbeatsList = await getHeartbeats();
    console.log("Heartbeats recuperati:", heartbeatsList); // Logga i heartbeats recuperati
});
  
// Event listener per i pulsanti

// Funzione di registrazione
document.getElementById("registrazione-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const nome = document.getElementById("nome").value;
    const cognome = document.getElementById("cognome").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const codiceFiscale = document.getElementById("codice-fiscale").value;
    const tipoProfilo = document.getElementById("tipo-profilo").value;

    // Verifica il codice fiscale
    if (!verificaCodiceFiscale(codiceFiscale)) {
        return; // Esci se il codice fiscale non è valido
    }

    try {
        // Crea l'utente con Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Salva ulteriori dettagli utente nel Firestore
        await setDoc(doc(db, "utenti", user.uid), {
            nome: nome,
            cognome: cognome,
            email: email,
            codiceFiscale: codiceFiscale,
            tipoProfilo: tipoProfilo,
            preferenze: []
        });

        // Aggiungi codice fiscale utilizzato all'array (se necessario)
        codiceFiscaleUtilizzato.push(codiceFiscale);

        // Reindirizza alla pagina del menu
        mostraPagina('menu');
        alert("Registrazione avvenuta con successo!");
    } catch (error) {
        console.error("Errore durante la registrazione: ", error.message);
        alert("Registrazione fallita: " + error.message);
    }
});


// Mostra la pagina di login
document.getElementById("login-button").addEventListener("click", () => {
    mostraPagina('login');
});


// Gestire le Preferenze
document.getElementById("preferenze-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        alert("Devi essere loggato per salvare le tue preferenze.");
        return;
    }

    const preferenze = {
        economia1: document.querySelector('input[name="economia1"]:checked').value,
        // Aggiungi altre domande per ogni categoria
    };

    try {
        const docRef = await setDoc(doc(db, "preferenze", user.uid), preferenze);
        alert("Preferenze salvate con successo!");
    } catch (e) {
        console.error("Errore nel salvataggio delle preferenze: ", e);
    }
});

// Carica le preferenze salvate quando la pagina preferenze è visualizzata
async function caricaPreferenze() {
    const user = auth.currentUser;
    if (!user) return;

    const docRef = doc(db, "preferenze", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const preferenze = docSnap.data();
        document.querySelector(`input[name="economia1"][value="${preferenze.economia1}"]`).checked = true;
        // Carica altre domande
    }
}

// Generatore di Candidati e Politici proposti
async function scegliMigliori(tipo) {
    const user = auth.currentUser;
    if (!user) return;

    const preferenzeDoc = await getDoc(doc(db, "preferenze", user.uid));
    if (!preferenzeDoc.exists()) {
        alert("Devi prima impostare le tue preferenze.");
        return;
    }

    const preferenze = preferenzeDoc.data();

    // Logica per trovare i migliori candidati o politici in base alle preferenze
    let risultati = []; // Sostituire con la logica per ottenere i risultati

    const listaElement = document.getElementById("candidati-politici-lista");
    listaElement.innerHTML = "";
    
    risultati.forEach(risultato => {
        const item = document.createElement("div");
        item.textContent = risultato.nome; // Aggiungi più dettagli se necessario
        listaElement.appendChild(item);
    });
}


// Chiama questa funzione quando la pagina Preferenze viene mostrata
document.getElementById("preferenze").addEventListener("click", caricaPreferenze);





// Gestire il login
document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Reindirizza alla pagina del Menù dopo il login
        mostraPagina('menu');
    })
    .catch((error) => {
        console.error("Errore durante il login: ", error);
    });
});


// Funzione per Salvare le Preferenze
document.getElementById("preferenze-form").addEventListener("submit", (e) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    const preferenzeSelezionate = Array.from(document.querySelectorAll("input[name='preferenza']:checked"))
        .map(input => input.value);

    if (user) {
        setDoc(doc(db, "utenti", user.uid), {
            preferenze: preferenzeSelezionate
        }, { merge: true }) // merge: true evita di sovrascrivere altri dati dell'utente
        .then(() => {
            alert("Preferenze salvate con successo!");
        })
        .catch((error) => {
            console.error("Errore nel salvataggio delle preferenze: ", error);
        });
    } else {
        alert("Devi essere autenticato per salvare le preferenze.");
    }
});


function trovaCandidatiOPolitici(tipo) {
    const user = auth.currentUser;
    
    if (user) {
        // Recupera le preferenze dell'utente autenticato
        getDoc(doc(db, "utenti", user.uid))
        .then((docSnapshot) => {
            if (docSnapshot.exists()) {
                const userPreferenze = docSnapshot.data().preferenze;
                
                // Cerca i candidati/politici nel Firestore
                const utentiQuery = query(collection(db, "utenti"), where("tipoProfilo", "==", tipo));
                
                getDocs(utentiQuery)
                .then((querySnapshot) => {
                    let risultati = [];
                    
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        const preferenzeComune = data.preferenze.filter(preferenza => userPreferenze.includes(preferenza));
                        const compatibilita = (preferenzeComune.length / userPreferenze.length) * 100;

                        risultati.push({ id: doc.id, nome: data.nome, cognome: data.cognome, compatibilita });
                    });
                    
                    // Ordina i risultati per compatibilità in ordine decrescente
                    risultati.sort((a, b) => b.compatibilita - a.compatibilita);
                    
                    // Mostra i tre migliori candidati/politici
                    mostraCandidatiSuggeriti(risultati.slice(0, 3));
                });
            }
        });
    }
}

function mostraCandidatiSuggeriti(candidati) {
    const lista = document.getElementById("lista-candidati");
    lista.innerHTML = ""; // Pulisce la lista

    candidati.forEach(candidato => {
        const div = document.createElement("div");
        div.className = "candidato";
        div.innerHTML = `
            <p>${candidato.nome} ${candidato.cognome}</p>
            <p>Compatibilità: ${candidato.compatibilita.toFixed(2)}%</p>
            <button onclick="scegliRappresentante('${candidato.id}')">Scegli questo</button>
        `;
        lista.appendChild(div);
    });
}

function scegliRappresentante(candidatoId) {
    const user = auth.currentUser;
    
    if (user) {
        setDoc(doc(db, "utenti", user.uid), {
            rappresentanteScelto: candidatoId
        }, { merge: true })
        .then(() => {
            alert("Rappresentante selezionato con successo!");
            mostraPagina('rappresentanti');
        })
        .catch((error) => {
            console.error("Errore nella selezione del rappresentante: ", error);
        });
    }
}

function visualizzaRappresentantiScelti() {
    const user = auth.currentUser;
    
    if (user) {
        getDoc(doc(db, "utenti", user.uid))
        .then((docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                
                if (data.rappresentanteScelto) {
                    getDoc(doc(db, "utenti", data.rappresentanteScelto))
                    .then((rappresentanteDoc) => {
                        if (rappresentanteDoc.exists()) {
                            const rappresentante = rappresentanteDoc.data();
                            document.getElementById("rappresentante-selezionato").textContent = `${rappresentante.nome} ${rappresentante.cognome}`;
                        }
                    });
                }
            }
        });
    }
}

// Chiama la funzione per visualizzare i rappresentanti selezionati
visualizzaRappresentantiScelti();

// Riferimenti agli elementi DOM
const iscrivitiButton = document.getElementById("iscriviti-button");
const registrazioneForm = document.getElementById("registrazione-form");
const codiceFiscaleInput = document.getElementById("codice-fiscale");
const passwordInput = document.getElementById("password");
const confermaPasswordInput = document.getElementById("conferma-password");
const iconPassword = document.getElementById("icon-password");
const iconConfermaPassword = document.getElementById("icon-conferma-password");
const errorMessages = {
    codiceFiscale: document.getElementById("error-codice-fiscale"),
    password: document.getElementById("error-password"),
    confermaPassword: document.getElementById("error-conferma-password"),
};

let codiceFiscaleUtilizzato = []; // Array per simulare i codici fiscali registrati



// Funzione dei Pulsanti
// Riferimenti agli elementi DOM
const pulsantiMenu = document.querySelectorAll('.menu-container button');

// Aggiungi l'event listener per i pulsanti del menu
pulsantiMenu.forEach(pulsante => {
    pulsante.addEventListener('click', () => {
        const pagina = pulsante.getAttribute('onclick').split("'")[1]; // Estrai il nome della pagina dall'attributo onclick
        
        // Mostra la pagina selezionata
        mostraPagina(pagina);
        
        // Gestisci l'attivazione del pulsante
        const tuttiIButton = document.querySelectorAll('.menu-container button');
        tuttiIButton.forEach(btn => btn.classList.remove('attivo')); // Rimuovi la classe 'attivo' da tutti i pulsanti
        pulsante.classList.add('attivo'); // Aggiungi la classe 'attivo' al pulsante cliccato
    });
});


// Event listener per il pulsante "Iscriviti"
iscrivitiButton.addEventListener("click", () => {
    mostraPagina("registrazione");
});
// Validazione della password
passwordInput.addEventListener("input", () => {
    iconPassword.style.display = passwordInput.value.length > 0 ? "inline" : "none"; // Mostra o nascondi l'icona
});
// Validazione della conferma password
confermaPasswordInput.addEventListener("input", () => {
    iconConfermaPassword.style.display = confermaPasswordInput.value === passwordInput.value ? "inline" : "none"; // Mostra o nascondi l'icona
});

// Funzione per controllare il codice fiscale
function verificaCodiceFiscale(codiceFiscale) {
    if (codiceFiscaleUtilizzato.includes(codiceFiscale)) {
        errorMessages.errorCodiceFiscale.textContent = "Cittadino già registrato"; // Messaggio di errore
        errorCodiceFiscale.style.display = "block"; // Mostra il messaggio
        return false; // Non valido
    } else if (codiceFiscale.length !== 16) {
        errorCodiceFiscale.textContent = "Il codice fiscale deve avere 16 caratteri"; // Messaggio di errore
        errorCodiceFiscale.style.display = "block"; // Mostra il messaggio
        return false; // Non valido
    } else {
        errorCodiceFiscale.textContent = ""; // Nessun messaggio di errore
        errorCodiceFiscale.style.display = "none"; // Nascondi il messaggio
        return true; // Valido
    }
}


// Array fittizio di codici fiscali già registrati (dovresti sostituirlo con una chiamata al tuo database)
const codiciFiscaliRegistrati = ["RSSMRA85M01H501Z", "VRNGNN99R01H501F"]; // Esempi di codici fiscali

// Funzione per controllare se il codice fiscale è già registrato
function isCodiceFiscaleRegistrato(codiceFiscale) {
    return codiciFiscaliRegistrati.includes(codiceFiscale);
}


// Funzione per accedere come Admin
document.getElementById('accedi-admin-button').addEventListener('click', function() {
    mostraPagina('menu'); // Passa al menù senza autenticazione
});
  
document.addEventListener('DOMContentLoaded', function() {
  const pulsantiIndietro = document.querySelectorAll('.indietro');
  pulsantiIndietro.forEach(pulsante => {
    pulsante.addEventListener('click', function() {
      mostraPagina('menu');
    });
  });
});

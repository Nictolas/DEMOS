// script.js

// Importa le funzioni necessarie da Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, query, collection, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js"; 
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js"; 

// Configurazione Firebase
const firebaseConfig = {
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

// Funzione per passare a un'altra pagina
function mostraPagina(pagina) {
  console.log(`Mostra pagina: ${pagina}`);
    const tutteLePagine = document.querySelectorAll('.pagina');
    tutteLePagine.forEach(pagina => pagina.classList.remove('attiva')); // Rimuovi la classe 'attiva' da tutte le pagine

    const paginaDaMostrare = document.getElementById(pagina);
    paginaDaMostrare.classList.add('attiva'); // Aggiungi la classe 'attiva' alla pagina desiderata
}

// Funzione per inizializzare il caricamento della pagina iniziale
document.addEventListener('DOMContentLoaded', () => {
    mostraPagina('pagina-iniziale'); // Mostra la pagina iniziale all'avvio

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
                        
                        // Ordina i risultati in base alla compatibilità
                        risultati.sort((a, b) => b.compatibilita - a.compatibilita);
                        
                        // Mostra i risultati
                        const listaElement = document.getElementById("candidati-politici-lista");
                        listaElement.innerHTML = ""; // Pulisce l'elenco precedente
                        
                        risultati.forEach((risultato) => {
                            const item = document.createElement("li");
                            item.textContent = `${risultato.nome} ${risultato.cognome} - Compatibilità: ${risultato.compatibilita.toFixed(2)}%`;
                            listaElement.appendChild(item);
                        });
                    });
                }
            });
        } else {
            alert("Devi essere autenticato per vedere i risultati.");
        }
    }

    // Associa la funzione di ricerca ai pulsanti "Candidati" e "Politici"
    document.getElementById("candidati-button").addEventListener("click", () => scegliMigliori('candidati'));
    document.getElementById("politici-button").addEventListener("click", () => scegliMigliori('politici'));
});

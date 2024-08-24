// firestore.js

// Importa le funzioni necessarie da Firebase
import { getFirestore, doc, setDoc, getDoc, query, collection, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js"; 

let db; // Dichiarazione della variabile db

// Funzione per inizializzare Firestore
export function initializeFirestore(app) {
    db = getFirestore(app);
    return db;
}

// Funzione per salvare le preferenze
export async function salvaPreferenze(userId, preferenze) {
    await setDoc(doc(db, "preferenze", userId), preferenze);
}

// Funzione per caricare le preferenze
export async function caricaPreferenze(userId) {
    const docRef = doc(db, "preferenze", userId);
    return await getDoc(docRef);
}

// Funzione per trovare candidati o politici
export async function trovaCandidati(tipo, userPreferenze) {
    const utentiQuery = query(collection(db, "utenti"), where("tipoProfilo", "==", tipo));
    const querySnapshot = await getDocs(utentiQuery);
    
    let risultati = [];
    
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const preferenzeComune = data.preferenze.filter(preferenza => userPreferenze.includes(preferenza));
        const compatibilita = (preferenzeComune.length / userPreferenze.length) * 100;

        risultati.push({ id: doc.id, nome: data.nome, cognome: data.cognome, compatibilita });
    });
    
    // Ordina i risultati per compatibilità in ordine decrescente
    risultati.sort((a, b) => b.compatibilita - a.compatibilita);
    return risultati;
}


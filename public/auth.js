// auth.js

// Importa le funzioni necessarie da Firebase
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js"; 
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js"; 

let auth; // Dichiarazione della variabile auth

// Funzione per inizializzare l'autenticazione
export function initializeAuth(app) {
    auth = getAuth(app);
    return auth;
}

// Funzione di registrazione
export async function registrazione(db, nome, cognome, email, password, codiceFiscale, tipoProfilo) {
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

        return user;
    } catch (error) {
        throw new Error("Registrazione fallita: " + error.message);
    }
}

// Funzione di login
export async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}


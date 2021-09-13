import firebase from "firebase/app"; 
import 'firebase/auth';
import 'firebase/firestore';
import "firebase/storage"

export const firebaseApp = firebase.initializeApp({
	/*Credenciales de Firebase*/
	})

export const auth = firebase.auth(); 
export const firestore = firebase.firestore();
export const storage = firebase.storage();
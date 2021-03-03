import firebase from 'firebase'

var firebaseConfiguration = {
    apiKey: "AIzaSyCVAiUdEApviDI9OVBwUiBOwWva71N1DKQ",
    authDomain: "edgecomputingplatform.firebaseapp.com",
    projectId: "edgecomputingplatform",
    storageBucket: "edgecomputingplatform.appspot.com",
    messagingSenderId: "470179799944",
    appId: "1:470179799944:web:477355a4c057098c3d903d",
    measurementId: "G-WRY8RRB974"
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfiguration);
firebase.analytics();

export const firebaseConfig = {
    signInFlow: "popup",
    signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    callbacks: {
        signInSuccess: () => false
    }
};

export const signout = () => {
    firebase.auth().signout();
}

export default {firebaseConfig, signout};
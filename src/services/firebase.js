const firebaseClient = require('firebase')
const {
  API_KEY,
  AUTH_DOMAIN,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  APP_ID,
  MEASUREMENT_ID
} = process.env;

const firebaseConfig = {
  apiKey: "AIzaSyCsbAmqhgwE9TBYObaiSqy8-5owO_LwwS8",
  authDomain: "ecogreen-4ab6f.firebaseapp.com",
  databaseURL: "https://ecogreen-4ab6f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ecogreen-4ab6f",
  storageBucket: "ecogreen-4ab6f.appspot.com",
  messagingSenderId: "738768975118",
  appId: "1:738768975118:web:07b19229d696ec1336535f",
  measurementId: "G-WB4E0PS20X"
};

const firebaseApp = firebaseClient.initializeApp(firebaseConfig);
module.exports = {firebaseApp};

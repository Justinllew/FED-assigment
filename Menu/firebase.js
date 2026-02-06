import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getDatabase,
    ref,
    push,
    set,
    get,
    update,
    remove,
    child
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCVJTnHQ8M34R2FSsKYrLBDhhA5B9MeydU",
    authDomain: "fedassignment-660ba.firebaseapp.com",
    databaseURL: "https://fedassignment-660ba-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fedassignment-660ba",
    storageBucket: "fedassignment-660ba.firebasestorage.app",
    messagingSenderId: "431205226605",
    appId: "1:431205226605:web:770121547e15d930458764"
  };

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
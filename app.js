import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Firebase Configuration
// LÜTFEN KENDİ FIREBASE BİLGİLERİNİZİ BURAYA GİRİN
const firebaseConfig = {
  apiKey: "AIzaSyD2hhiCZllHsS01vdY0rJmA0TdJ9i5ABHg",
  authDomain: "ramazan-etkinlik.firebaseapp.com",
  projectId: "ramazan-etkinlik",
  storageBucket: "ramazan-etkinlik.firebasestorage.app",
  messagingSenderId: "569554682598",
  appId: "1:569554682598:web:66227f7d31dfe7a541f127"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const systemStatus = document.getElementById('system-status');
const questionArea = document.getElementById('question-area');
const waitArea = document.getElementById('wait-area');
const activeQuestionDisplay = document.getElementById('active-question-display');
const form = document.getElementById('submission-form');
const inputAnswer = document.getElementById('user-answer');
const btnSubmit = document.getElementById('btn-submit');
const toast = document.getElementById('toast');

let currentActiveQuestion = null;
let hasAnsweredCurrentQuestion = false;

// 1. LISTEN TO MODERATOR FOR ACTIVE QUESTION
onSnapshot(doc(db, "active_game", "current_question"), (docSnap) => {
    if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.text !== currentActiveQuestion) {
            // New Question Started!
            currentActiveQuestion = data.text;
            
            // Check if answered before in this browser
            hasAnsweredCurrentQuestion = localStorage.getItem('answered_' + currentActiveQuestion) === 'true';
            
            systemStatus.innerText = "Yarışma Başladı!";
            systemStatus.style.color = "var(--success)";
            
            activeQuestionDisplay.innerText = data.text;
            
            if (hasAnsweredCurrentQuestion) {
                questionArea.classList.add('hidden');
                waitArea.classList.remove('hidden');
            } else {
                // Show Form, Hide Wait Space
                inputAnswer.value = "";
                questionArea.classList.remove('hidden');
                waitArea.classList.add('hidden');
                
                // Auto focus for better UX
                inputAnswer.focus();
            }
        } 
    } else {
        // No active question
        currentActiveQuestion = null;
        systemStatus.innerText = "Soru Bekleniyor...";
        systemStatus.style.color = "var(--text-muted)";
        questionArea.classList.add('hidden');
        waitArea.classList.remove('hidden');
    }
});

// 2. SUBMIT ANSWER
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if(hasAnsweredCurrentQuestion) {
        alert("Bu soruya zaten yanıt verdiniz!");
        return;
    }
    
    btnSubmit.classList.add('loading');
    btnSubmit.disabled = true;

    const answerTxt = inputAnswer.value.trim();

    try {
        // We write to responses collection
        await addDoc(collection(db, "responses"), {
            question: currentActiveQuestion,
            answer: answerTxt,
            timestamp: Date.now()
        });
        
        hasAnsweredCurrentQuestion = true;
        localStorage.setItem('answered_' + currentActiveQuestion, 'true');
        showToast();
        
        // Hide form, show wait area again to prevent double submission UX-wise
        questionArea.classList.add('hidden');
        waitArea.classList.remove('hidden');
        
    } catch (error) {
        console.error("Hata: ", error);
        alert("Bağlantı hatası: " + error.message);
    } finally {
        btnSubmit.classList.remove('loading');
        btnSubmit.disabled = false;
    }
});

function showToast() {
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 400); 
    }, 3000);
}

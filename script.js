// Firebaseの設定
const firebaseConfig = {
  apiKey: "AIzaSyB8zY_Nq_9gHpnc66lC9rw8UwUQNMAv0h4",
  authDomain: "colorclick-1be19.firebaseapp.com",
  projectId: "colorclick-1be19",
  storageBucket: "colorclick-1be19.appspot.com",
  messagingSenderId: "701662068622",
  appId: "1:701662068622:web:8cb6ce538e49b5cf796edf"
};

// Firebaseの初期化
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// ユーザー認証
firebase.auth().signInAnonymously()
    .then(() => {
        console.log('匿名でサインインしました');
    })
    .catch((error) => {
        console.error('サインインエラー:', error);
    });

// ユーザー名の取得（簡易的にプロンプトを使用）
let userName = localStorage.getItem('userName');
if (!userName) {
    userName = prompt('ユーザー名を入力してください:', `Player_${Date.now()}`);
    if (userName) {
        localStorage.setItem('userName', userName);
    } else {
        userName = `Player_${Date.now()}`;
    }
}

let score = 0;
let timeLeft = 30;
let timerInterval;

const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const colorButton = document.getElementById('color-button');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');
const buttonWrapper = document.getElementById('button-wrapper');
const highScoreElement = document.getElementById('high-score');
const leaderboardList = document.getElementById('leaderboard-list');

let highScore = localStorage.getItem('highScore') || 0;
highScoreElement.textContent = `ハイスコア: ${highScore}`;

function startGame() {
    score = 0;
    timeLeft = 30;
    scoreElement.textContent = `スコア: ${score}`;
    timerElement.textContent = `残り時間: ${timeLeft}秒`;
    gameOverElement.classList.add('hidden');
    restartButton.classList.add('hidden');
    colorButton.disabled = false;
    changeButtonColor();
    moveButtonRandomly();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    timeLeft--;
    timerElement.textContent = `残り時間: ${timeLeft}秒`;
    if (timeLeft <= 0) {
        endGame();
    }
}

function endGame() {
    clearInterval(timerInterval);
    colorButton.disabled = true;
    gameOverElement.classList.remove('hidden');
    finalScoreElement.textContent = score;
    restartButton.classList.remove('hidden');

    // ハイスコアの更新
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreElement.textContent = `ハイスコア: ${highScore}`;
    }

    // Firestoreにスコアを送信
    submitScore(highScore);
}

function changeButtonColor() {
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    colorButton.style.backgroundColor = randomColor;
}

function moveButtonRandomly() {
    const wrapperRect = buttonWrapper.getBoundingClientRect();
    const buttonWidth = colorButton.offsetWidth;
    const buttonHeight = colorButton.offsetHeight;

    // ランダムな位置を計算
    const maxX = wrapperRect.width - buttonWidth;
    const maxY = wrapperRect.height - buttonHeight;
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    colorButton.style.left = `${randomX}px`;
    colorButton.style.top = `${randomY}px`;
}

colorButton.addEventListener('click', () => {
    score++;
    scoreElement.textContent = `スコア: ${score}`;
    changeButtonColor();
    moveButtonRandomly();
});

restartButton.addEventListener('click', startGame);

// ゲーム開始
startGame();

// ウィンドウリサイズ時にボタンの位置を再調整
window.addEventListener('resize', () => {
    moveButtonRandomly();
});

// リーダーボードにスコアを送信
function submitScore(score) {
    db.collection('leaderboard').add({
        name: userName,
        score: parseInt(score),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log('スコアが送信されました');
        // リーダーボードを取得して表示
        fetchLeaderboard();
    })
    .catch((error) => {
        console.error('スコア送信エラー:', error);
    });
}

// リーダーボードを取得して表示
function fetchLeaderboard() {
    db.collection('leaderboard')
        .orderBy('score', 'desc')
        .limit(10)
        .onSnapshot((querySnapshot) => { // リアルタイム更新
            leaderboardList.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const listItem = document.createElement('li');
                listItem.textContent = `${data.name}: ${data.score}`;
                leaderboardList.appendChild(listItem);
            });
        }, (error) => {
            console.error('リーダーボード取得エラー:', error);
        });
}
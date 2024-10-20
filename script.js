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

const adContainer = document.getElementById('ad-container');

// サウンドエフェクトの取得
const clickSound = document.getElementById('click-sound');
const gameoverSound = document.getElementById('gameover-sound');
const backgroundMusic = document.getElementById('background-music');

// 背景音楽の再生
backgroundMusic.volume = 0.3; // 音量調整
backgroundMusic.play();

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
const shareContainer = document.getElementById('share-container');
const shareButton = document.getElementById('share-button');
const achievementsList = document.getElementById('achievements-list');

// ハイスコアの取得
let highScore = parseInt(localStorage.getItem('highScore')) || 0;
highScoreElement.textContent = `ハイスコア: ${highScore}`;

// アチーブメントの定義
const achievements = [
    { id: 1, name: 'スターター', description: '最初の10回クリック', achieved: false },
    { id: 2, name: 'スピードスター', description: '残り時間25秒で50回クリック', achieved: false },
    { id: 3, name: 'ハイスコアマスター', description: 'ハイスコアを100点以上にする', achieved: false },
    // 追加のアチーブメントをここに定義
];

// アチーブメントのチェック関数
function checkAchievements() {
    achievements.forEach(achievement => {
        if (!achievement.achieved) {
            if (achievement.id === 1 && score >= 10) {
                achievement.achieved = true;
                displayAchievement(achievement);
            }
            if (achievement.id === 2 && score >= 50 && timeLeft >= 25) { // 残り時間25秒以上で50回クリック
                achievement.achieved = true;
                displayAchievement(achievement);
            }
            if (achievement.id === 3 && highScore >= 100) {
                achievement.achieved = true;
                displayAchievement(achievement);
            }
            // 他のアチーブメントの条件をここに追加
        }
    });
}

// アチーブメントを表示する関数
function displayAchievement(achievement) {
    const listItem = document.createElement('li');
    listItem.textContent = `${achievement.name}: ${achievement.description}`;
    achievementsList.appendChild(listItem);
}

function startGame() {
    score = 0;
    timeLeft = 30;
    scoreElement.textContent = `スコア: ${score}`;
    timerElement.textContent = `残り時間: ${timeLeft}秒`;
    gameOverElement.classList.add('hidden');
    restartButton.classList.add('hidden');
    shareContainer.classList.add('hidden'); // 共有ボタンを非表示
    adContainer.classList.add('hidden'); // 広告を非表示
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
    shareContainer.classList.remove('hidden'); // 共有ボタンを表示

    // ハイスコアの更新
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreElement.textContent = `ハイスコア: ${highScore}`;
    }

    // Firestoreにスコアを送信
    submitScore(highScore);

    // 広告を表示
    adContainer.classList.remove('hidden');
    (adsbygoogle = window.adsbygoogle || []).push({}); // 広告を再レンダリング

    // ゲーム終了効果音を再生
    gameoverSound.currentTime = 0;
    gameoverSound.play();
}

function changeButtonColor() {
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
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

    // スムーズな移動のためにトランジションを有効に
    colorButton.style.transition = 'left 0.3s, top 0.3s';
    colorButton.style.left = `${randomX}px`;
    colorButton.style.top = `${randomY}px`;
}

// クリック時にスコアを増加、ボタンの色と位置を変更、サウンド再生、アチーブメントチェック
colorButton.addEventListener('click', () => {
    score++;
    scoreElement.textContent = `スコア: ${score}`;
    changeButtonColor();
    moveButtonRandomly();
    clickSound.currentTime = 0;
    clickSound.play();
    checkAchievements();
});

// リスタートボタンのクリックイベント
restartButton.addEventListener('click', startGame);

// 共有ボタンのクリックイベント
shareButton.addEventListener('click', () => {
    const shareText = `私のスコアは ${score} 点です！ #カラークリックゲーム`;
    const shareUrl = window.location.href;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
});

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

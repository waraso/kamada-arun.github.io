/**
 * 乱数を生成する関数
 * @param {number} min - 最小値
 * @param {number} max - 最大値
 * @returns {number} - 生成された乱数
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function changeNumber() {
    const qNumber = document.getElementById('q-number');
    qNumber.textContent = getRandomInt(0, 255);
}

function calcCorrectAnswer() {
    const qNumber = document.getElementById('q-number').textContent;
    const intNum = parseInt(qNumber, 10);
    const index = parseInt(document.getElementById('index').value, 10);
    return (intNum >> (index - 1)) & 1;
}

function toFormattedBinary(num) {
    // >>> 0 は符号なし整数への変換、下位32bitを扱う
    const binaryStr = (num >>> 0).toString(2).padStart(32, '0');
    const last8Bits = binaryStr.slice(-8); // 常に下位8ビットを取る
    // 4桁区切りの文字列
    const formattedBinary = last8Bits.replace(/(.{4})/g, '$1 ').trim();
    // index取得（localStorageは文字列なのでNumberに変換）
    const index = Number(localStorage.getItem('index'));
    // ハイライト処理
    const highlightIdx = index <= 4 ? 9 - index : 8 - index;
    return [...formattedBinary].map((c, i) =>
        i === highlightIdx ? `<span class="highlight">${c}</span>` : c
    ).join('');
}

/**
 * 結果を更新する関数
 */
function updateResults() {
    const correctAnswerCountEl = document.getElementById('q-cor-cnt');
    const answerCountEl = document.getElementById('q-cnt');
    const correctAnswerPercentEl = document.getElementById('q-cor-per');

    let correctCount = parseInt(localStorage.getItem('correctAnswerCount') || '0', 10);
    let answerCount = parseInt(localStorage.getItem('answerCount') || '0', 10);

    correctAnswerCountEl.textContent = correctCount;
    answerCountEl.textContent = answerCount;
    const percent = answerCount > 0 ? Math.round((correctCount / answerCount) * 100) : 0;
    correctAnswerPercentEl.textContent = percent;
}
function incrementResultCount(isCorrect) {
    let correctCount = parseInt(localStorage.getItem('correctAnswerCount') || '0', 10);
    let answerCount = parseInt(localStorage.getItem('answerCount') || '0', 10);

    if (isCorrect) {
        correctCount++;
    }
    answerCount++;

    localStorage.setItem('correctAnswerCount', correctCount);
    localStorage.setItem('answerCount', answerCount);
}

let timerInterval = null;
let startTime = null;

function startTimer() {
    const timerEl = document.getElementById('timer');
    timerEl.classList.add('working');
    startTime = Date.now();
    timerEl.textContent = '0.0秒';
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        timerEl.textContent = elapsed.toFixed(1) + '秒';
    }, 100);
}

function stopTimer() {
    document.getElementById('timer').classList.remove('working');
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

/**
 * 初期設定
 */
document.addEventListener('DOMContentLoaded', function() {
    const index = localStorage.getItem('index');
    if (index) {
        document.getElementById('index').value = index;
    }

    updateResults();
});

/**
 * スタート
 */
document.getElementById('start-button').addEventListener('click', function() {
    localStorage.setItem('index', document.getElementById('index').value);
    document.getElementById('start-button').classList.add('hidden');
    document.getElementById('index').classList.add('hidden');
    document.getElementById('answer').classList.remove('hidden');
    document.getElementById('timer').classList.remove('hidden');
    document.getElementById('reset-button').classList.add('hidden');

    changeNumber();
    startTimer();
    updateResults();
});

/**
 * 答え選択
 */
document.addEventListener('click', function(e) {
    if (!e.target.classList.contains('ans')) return;
    if (document.getElementById('ans-o').classList.contains('selected-ans')) return;
    if (document.getElementById('ans-x').classList.contains('selected-ans')) return;

    stopTimer();

    const selectedAnswer = e.target.textContent;
    const correctAnswer = calcCorrectAnswer();
    document.getElementById('answer').classList.add('hidden');
    document.getElementById('next-button').classList.remove('hidden');
    document.getElementById('correct-answer').classList.remove('hidden');
    if (selectedAnswer == correctAnswer) {
        document.getElementById('ans-o').classList.add('selected-ans');
        incrementResultCount(true);
    } else {
        document.getElementById('ans-x').classList.add('selected-ans');
        incrementResultCount(false);
    }

    // 2進数に変換、4桁で空白区切り、8桁まで0埋め、負の数も対応
    const num = parseInt(document.getElementById('q-number').textContent, 10);
    const formattedBinary = toFormattedBinary(num);
    document.getElementById('binary').innerHTML = formattedBinary;

    updateResults();
});

/**
 * 次の問題
 */
document.getElementById('next-button').addEventListener('click', function() {
    document.getElementById('next-button').classList.add('hidden');
    document.getElementById('correct-answer').classList.add('hidden');
    document.getElementById('answer').classList.remove('hidden');
    document.getElementById('ans-o').classList.remove('selected-ans');
    document.getElementById('ans-x').classList.remove('selected-ans');

    changeNumber();
    startTimer();
});

/**
 * キー操作
 */
document.addEventListener('keydown', event => {
    if (event.code === 'Digit1') {
        if (document.querySelector('#answer').classList.contains('hidden')) return;
        document.querySelectorAll('.ans')[0].click();
    }
    if (event.code === 'Digit2') {
        if (document.querySelector('#answer').classList.contains('hidden')) return;
        document.querySelectorAll('.ans')[1].click();
    }
    if (event.code === 'Space') {
        const startButton = document.getElementById('start-button');
        const nextButton = document.getElementById('next-button');
        
        event.preventDefault();
        if (!startButton.classList.contains('hidden')) {
            startButton.click();
        } else if (!nextButton.classList.contains('hidden')) {
            nextButton.click();
        }
    }
});

/**
 * ローカルストレージ リセット
 */
document.getElementById('reset-button').addEventListener('click', function() {
    localStorage.clear();
    updateResults();
    document.getElementById('reset-button').textContent = '削除しました';
});

/**
 * サービスワーカー
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').then(function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(err) {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }
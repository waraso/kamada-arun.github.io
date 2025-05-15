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

function calcCorrectAnswer(
    qNumber = parseInt(document.getElementById('q-number').textContent, 10),
    index = parseInt(document.getElementById('index').value, 10)
) {
    return (qNumber >> (index - 1)) & 1;
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
    const logs = JSON.parse(localStorage.getItem('logs')) || [];
    
    const correctCount = logs.filter(log => log.isCorrect).length;
    const answerCount = logs.length;

    document.getElementById('q-cor-cnt').textContent = correctCount;
    document.getElementById('q-cnt').textContent = answerCount;
    const percent = answerCount > 0 ? Math.round((correctCount / answerCount) * 100) : 0;
    document.getElementById('q-cor-per').textContent = percent;
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
 * ログを保存する関数
 * @param {string} time - 経過時間
 * @param {string} question - 問題番号
 * @param {string} answer - 選択した答え
 */
function saveLogs(time, question, answer) {
    const isCorrect = calcCorrectAnswer(question) == answer;
    const date = new Date();
    time = parseFloat(time.slice(0, -1));
    question = parseInt(question, 10);

    const logs = JSON.parse(localStorage.getItem('logs')) || [];
    logs.push({ date, time, question, answer, isCorrect });
    localStorage.setItem('logs', JSON.stringify(logs));
}

function backToStart() {
    document.getElementById('start-button').classList.remove('hidden');
    document.getElementById('index').classList.remove('hidden');
    document.getElementById('answer').classList.add('hidden');
    document.getElementById('timer').classList.add('hidden');
    document.getElementById('reset-button').classList.remove('hidden');
    document.getElementById('next-button').classList.add('hidden');
    document.getElementById('correct-answer').classList.add('hidden');
    document.getElementById('ans-o').classList.remove('selected-ans');
    document.getElementById('ans-x').classList.remove('selected-ans');
    document.getElementById('back-btn').classList.add('hidden');
    document.getElementById('q-number').textContent = '0';

    stopTimer();
}

function clickAnswer(selectedAnswer) {

    stopTimer();

    const correctAnswer = calcCorrectAnswer();
    document.getElementById('answer').classList.add('hidden');
    document.getElementById('next-button').classList.remove('hidden');
    document.getElementById('correct-answer').classList.remove('hidden');
    if (selectedAnswer == correctAnswer) {
        document.getElementById('ans-o').classList.add('selected-ans');
    } else {
        document.getElementById('ans-x').classList.add('selected-ans');
    }

    // 2進数に変換、4桁で空白区切り、8桁まで0埋め、負の数も対応
    const num = parseInt(document.getElementById('q-number').textContent, 10);
    const formattedBinary = toFormattedBinary(num);
    document.getElementById('binary').innerHTML = formattedBinary;

    saveLogs(
        document.getElementById('timer').textContent,
        document.getElementById('q-number').textContent,
        selectedAnswer
    );
    updateResults();
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
    document.getElementById('back-btn').classList.remove('hidden');
    document.getElementById('reset-button').textContent = '保存したデータを全て削除する';

    changeNumber();
    startTimer();
    updateResults();
});

/**
 * 答え選択
 */
document.addEventListener('mousedown', function(e) {
    if (!e.target.classList.contains('ans')) return;
    if (document.getElementById('ans-o').classList.contains('selected-ans')) return;
    if (document.getElementById('ans-x').classList.contains('selected-ans')) return;

    clickAnswer(e.textContent);
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
 * 終了
 */
document.getElementById('back-btn').addEventListener('click', backToStart);

/**
 * キー操作
 */
document.addEventListener('keydown', event => {
    if (event.code === 'Digit1') {
        if (document.querySelector('#answer').classList.contains('hidden')) return;
        clickAnswer(0);
    }
    if (event.code === 'Digit2') {
        if (document.querySelector('#answer').classList.contains('hidden')) return;
        clickAnswer(1);
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
    if (event.code === 'Escape') {
        const backButton = document.getElementById('back-btn');
        if (!backButton.classList.contains('hidden')) {
            backToStart();
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
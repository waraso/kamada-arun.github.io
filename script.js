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
    qNumber.textContent = getRandomInt(1, 255);
}

function calcCorrectAnswer() {
    const qNumber = document.getElementById('q-number').textContent;
    const intNum = parseInt(qNumber, 10);
    const index = parseInt(document.getElementById('difficulty').value, 10);
    return (intNum >> (index - 1)) & 1;
}

/**
 * 初期設定
 */
document.addEventListener('DOMContentLoaded', function() {
    const difficulty = localStorage.getItem('difficulty');
    if (difficulty) {
        document.getElementById('difficulty').value = difficulty;
    }
});

/**
 * スタート
 */
document.getElementById('start-button').addEventListener('click', function() {
    localStorage.setItem('difficulty', document.getElementById('difficulty').value);
    document.getElementById('start-button').style.display = 'none';
    document.getElementById('difficulty').style.display = 'none';
    document.getElementById('answer').style.display = 'flex';

    changeNumber();
});

/**
 * 答え選択
 */
document.addEventListener('click', function(e) {
    if (!e.target.classList.contains('ans')) return;
    if (document.getElementById('ans-o').classList.contains('selected-ans')) return;
    if (document.getElementById('ans-x').classList.contains('selected-ans')) return;
    const selectedAnswer = e.target.textContent;
    const correctAnswer = calcCorrectAnswer();
    document.getElementById('answer').style.display = 'none';
    document.getElementById('next-button').style.display = 'block';
    document.getElementById('correct-answer').style.display = 'block';
    document.getElementById('correct-answer-value').textContent = correctAnswer;
    console.log('Selected Answer:', selectedAnswer);
    console.log('Correct Answer:', correctAnswer);
    if (selectedAnswer == correctAnswer) {
        document.getElementById('ans-o').classList.add('selected-ans');
    } else {
        document.getElementById('ans-x').classList.add('selected-ans');
    }
});

/**
 * 次の問題
 */
document.getElementById('next-button').addEventListener('click', function() {
    document.getElementById('next-button').style.display = 'none';
    document.getElementById('correct-answer').style.display = 'none';
    document.getElementById('answer').style.display = 'flex';
    document.getElementById('ans-o').classList.remove('selected-ans');
    document.getElementById('ans-x').classList.remove('selected-ans');

    changeNumber();
});

/**
 * キー操作
 */
document.addEventListener('keydown', event => {
    if (event.code === 'Digit1') {
        document.querySelectorAll('.ans')[0].click();
    }
    if (event.code === 'Digit2') {
        document.querySelectorAll('.ans')[1].click();
    }
    if (event.code === 'Space') {
        const startButton = document.getElementById('start-button');
        const nextButton = document.getElementById('next-button');
        
        event.preventDefault();
        if (startButton.style.display !== 'none') {
            startButton.click();
        } else if (nextButton.style.display !== 'none') {
            nextButton.click();
        }

        console.log('Space key pressed');
    }
});

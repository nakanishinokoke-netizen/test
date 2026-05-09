const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const imgBg = new Image(); imgBg.src = 'images/bg_tokyo.jpg'; 
const imgGodzilla = new Image(); imgGodzilla.src = 'images/godzilla_sheet.png'; 
const imgMothra = new Image(); imgMothra.src = 'images/mothra_sheet.png'; 

const startScreen = document.getElementById('startScreen');
const gameContainer = document.getElementById('gameContainer');

let gameState = 'start';
let playerType = '';
let enemyType = '';
let score = 0;
let lives = 3;
let frameCount = 0;
let bgX = 0;

const groundY = canvas.height - 60;

let player = {};
let enemies = [];
let playerAttacks = [];
let enemyAttacks = [];

// キャラ選択ボタン
document.getElementById('btnMothra').onclick = () => startGame('mothra');
document.getElementById('btnGodzilla').onclick = () => startGame('godzilla');

function startGame(type) {
    // ★追加: スタート時に画面の向きをチェック
    if (!isLandscape()) {
        console.log('Landscape check failed, cannot start game');
        return; 
    }

    console.log('Starting game with', type);
    playerType = type;
    enemyType = type === 'mothra' ? 'godzilla' : 'mothra';
    
    const pWidth = type === 'mothra' ? 150 : 80;
    const pHeight = type === 'mothra' ? 150 : 120;

    player = {
        x: 100, y: type === 'mothra' ? 30 : groundY - pHeight,
        width: pWidth, height: pHeight,
        velocity: 0, 
        gravity: type === 'mothra' ? 0.2 : 0.8,
        jump: type === 'mothra' ? -7 : -18,
        type: type,
        isOnGround: false
    };

    enemies = []; playerAttacks = []; enemyAttacks = [];
    score = 0; lives = 3; frameCount = 0;
    startScreen.style.display = 'none';
    gameContainer.style.display = 'flex'; 
    gameState = 'playing';
    gameLoop();
}

// ★追加: 横画面かどうかを判定する関数
function isLandscape() {
    // デバッグ: 現在の画面サイズを表示
    console.log('Window size:', window.innerWidth, 'x', window.innerHeight, 'ratio:', (window.innerWidth / window.innerHeight));
    
    // プレビュー時は条件を緩和（開発用）
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return true; // ローカル開発時は常に許可
    }
    
    // CSSと合わせて、幅950px以下の時は横長画面（アスペクト比13/9以上）である必要がある
    if (window.innerWidth <= 950) {
        return (window.innerWidth / window.innerHeight) >= (13 / 9);
    }
    // PCサイズなら常にOK
    return true;
}

// ★追加: 画面の向きが変わった時のロジック
function checkOrientation() {
    // ゲーム中にスマホの縦画面になった場合
    if (gameState === 'playing' && !isLandscape()) {
        // タイトルに戻す（案内オーバーレイがCSSで表示されるため、プログラム的には停止させる）
        resetToStart();
    }
}

// 画面サイズ・向きが変更された時にチェックを実行
window.addEventListener('resize', checkOrientation);
// 初期読み込み時にもチェック
checkOrientation();


function update() {
    if (gameState !== 'playing') return;
    frameCount++;

    bgX -= 2;
    if (bgX <= -canvas.width) bgX = 0;

    player.velocity += player.gravity;
    player.y += player.velocity;
    if (player.y + player.height > groundY) {
        player.y = groundY - player.height;
        player.velocity = 0;
        player.isOnGround = true;
    } else {
        player.isOnGround = false;
    }
    if (player.y < 0) { player.y = 0; player.velocity = 0; }

    if (frameCount % 120 === 0) {
        const eWidth = enemyType === 'mothra' ? 150 : 80;
        const eHeight = enemyType === 'mothra' ? 150 : 120;
        enemies.push({
            x: canvas.width, 
            y: enemyType === 'mothra' ? 50 + Math.random()*150 : groundY - eHeight,
            width: eWidth, height: eHeight,
            type: enemyType,
            attackTimer: 0
        });
    }

    for (let i = 0; i < enemies.length; i++) {
        let en = enemies[i];
        en.x -= 4;
        
        en.attackTimer++;
        if (en.attackTimer > 100 && Math.random() < 0.02) {
            enemyAttacks.push({x: en.x, y: en.y + en.height / 2, speed: -7, color: 'orange'});
            en.attackTimer = 0;
        }
        
        if (en.x + en.width < 0) {
            enemies.splice(i, 1); score++; i--; continue;
        }

        if (checkHit(player, en)) {
            lives--; enemies.splice(i, 1); i--;
            if (lives <= 0) gameOver();
        }
    }

    for (let i = 0; i < playerAttacks.length; i++) {
        let at = playerAttacks[i];
        at.x += 10;
        if (at.x > canvas.width) { playerAttacks.splice(i, 1); i--; continue; }

        for (let ei = 0; ei < enemies.length; ei++) {
            let en = enemies[ei];
            if (checkHit(at, en)) {
                enemies.splice(ei, 1); playerAttacks.splice(i, 1);
                score += 10; i--; break;
            }
        }
    }

    for (let i = 0; i < enemyAttacks.length; i++) {
        let at = enemyAttacks[i];
        at.x -= 8;
        if (at.x + 10 < 0) { enemyAttacks.splice(i, 1); i--; continue; }

        if (checkHit(at, player)) {
            lives--; enemyAttacks.splice(i, 1); i--;
            if (lives <= 0) gameOver();
        }
    }
}

function checkHit(a, b) {
    const margin = 5;
    return a.x + margin < b.x + b.width - margin && 
           a.x + (a.width||10) - margin > b.x + margin &&
           a.y + margin < b.y + b.height - margin && 
           a.y + (a.height||10) - margin > b.y + margin;
}

function drawSprite(obj, isPlayer) {
    const img = obj.type === 'godzilla' ? imgGodzilla : imgMothra;
    if (!img.complete || img.width === 0) return; 

    const sx = 0; const sy = 0;
    const sWidth = img.width; const sHeight = img.height;

    ctx.save();
    let scaleX = 1;
    if (isPlayer) scaleX = (obj.type === 'mothra') ? -1 : 1;
    else scaleX = (obj.type === 'godzilla') ? -1 : 1;

    if (scaleX === -1) {
        ctx.scale(-1, 1);
        ctx.drawImage(img, sx, sy, sWidth, sHeight, -obj.x - obj.width, obj.y, obj.width, obj.height);
    } else {
        ctx.drawImage(img, sx, sy, sWidth, sHeight, obj.x, obj.y, obj.width, obj.height);
    }
    ctx.restore();
}

function draw() {
    ctx.drawImage(imgBg, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(imgBg, bgX + canvas.width - 1, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, groundY, canvas.width, 60);

    drawSprite(player, true);
    for (let en of enemies) drawSprite(en, false);

    for (let at of playerAttacks) {
        ctx.fillStyle = playerType === 'godzilla' ? '#00BFFF' : '#FFFF00';
        ctx.fillRect(at.x, at.y, 20, 10);
    }
    for (let at of enemyAttacks) {
        ctx.fillStyle = enemyType === 'godzilla' ? '#00BFFF' : '#FFFF00';
        ctx.fillRect(at.x, at.y, 20, 10);
    }

    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px "Press Start 2P", sans-serif';
    ctx.fillText(`SCORE: ${score}  LIVES: ${lives}`, 20, 40);
}

function gameLoop() {
    if (gameState === 'playing') {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

function gameOver() {
    gameState = 'gameover';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f39c12';
    ctx.font = '24px "Press Start 2P", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.fillText('画面かボタンをタップしてタイトルへ', canvas.width / 2, canvas.height / 2 + 40);
    ctx.textAlign = 'left'; 
}

// アクションの共通処理
function doJump() {
    if (gameState === 'gameover') return resetToStart();
    if (gameState !== 'playing') return;
    if (player.isOnGround || playerType === 'mothra') player.velocity = player.jump;
}

function doAttack() {
    if (gameState === 'gameover') return resetToStart();
    if (gameState !== 'playing') return;
    playerAttacks.push({ x: player.x + player.width, y: player.y + player.height / 2 });
}

function resetToStart() {
    // ★追加: CSSで案内が表示される状態なら、スタート画面を表示しない
    if (!isLandscape()) return;

    startScreen.style.display = 'block';
    gameContainer.style.display = 'none';
    gameState = 'start';
}

// PCキーボード
window.addEventListener('keydown', e => {
    if (e.code === 'Space') { e.preventDefault(); doJump(); }
    if (e.code === 'KeyF') doAttack();
});

// スマホタップ
const btnJump = document.getElementById('btnJump');
const btnAttack = document.getElementById('btnAttack');

btnJump.addEventListener('touchstart', (e) => { e.preventDefault(); doJump(); });
btnJump.addEventListener('mousedown', (e) => { e.preventDefault(); doJump(); });

btnAttack.addEventListener('touchstart', (e) => { e.preventDefault(); doAttack(); });
btnAttack.addEventListener('mousedown', (e) => { e.preventDefault(); doAttack(); });

canvas.addEventListener('touchstart', (e) => { if(gameState === 'gameover'){ e.preventDefault(); resetToStart(); } });
canvas.addEventListener('mousedown', (e) => { if(gameState === 'gameover') resetToStart(); });
function playAudioElementById(id) {
    var el = document.getElementById(id);
    if (el.readyState >= 4) {
        el.pause();
    }
    el.currentTime = 0;
    el.play();
}

const numbers = {
    '0': [
        'xxxx',
        'x  x',
        'x  x',
        'x  x',
        'xxxx',
    ],
    '1': [
        '   x',
        '   x',
        '   x',
        '   x',
        '   x',
    ],
    '2': [
        'xxxx',
        '   x',
        'xxxx',
        'x   ',
        'xxxx',
    ],
    '3': [
        'xxxx',
        '   x',
        'xxxx',
        '   x',
        'xxxx',
    ],
    '4': [
        'x  x',
        'x  x',
        'xxxx',
        '   x',
        '   x',
    ],
    '5': [
        'xxxx',
        'x   ',
        'xxxx',
        '   x',
        'xxxx',
    ],
    '6': [
        'xxxx',
        'x   ',
        'xxxx',
        'x  x',
        'xxxx',
    ],
    '7': [
        'xxxx',
        '   x',
        '   x',
        '   x',
        '   x',
    ],
    '8': [
        'xxxx',
        'x  x',
        'xxxx',
        'x  x',
        'xxxx',
    ],
    '9': [
        'xxxx',
        'x  x',
        'xxxx',
        '   x',
        'xxxx',
    ],
    '-': [
        '    ',
        '    ',
        'xxxx',
        '    ',
        '    ',
    ],
    'e': [
        'xxxx',
        'x   ',
        'xxxx',
        'x   ',
        'xxxx',
    ],
    'r': [
        '    ',
        '    ',
        'xxxx',
        'x   ',
        'x   ',
    ],
    '.': [
        '    ',
        '    ',
        '    ',
        '  xx',
        '  xx',
    ]
};
let objects = [];
let gameEnded = false;
const frameRate = 25;
const w = document.getElementsByTagName('canvas')[0].width;
const h = document.getElementsByTagName('canvas')[0].height;
// all dimensions are scalable by changing the width of the canvas.
// the stupid 10:9 aspect ratio is assumed to be kept
const px = w / 1000;
const lowbarH = 200 * px;
const highbarH = 250 * px;
const playArea = { w: w, h: h - lowbarH };
const jar = { w: 100 * px, h: 100 * px };
const cookie1 = { w: 100 * px, h: 100 * px };
const cookie10 = { w: 100 * px, h: 100 * px };
const monster = { w: 100 * px, h: 100 * px };
const resultCookie = { w: 40 * px, h: 40 * px };
const button = { w: 1000 / 6 * px, h: 1000 / 6 / 1.291 * px };
const margin = 10 * px;
objects.push({
    x: playArea.w / 2,
    y: playArea.h - jar.h,
    id: 'jar'
});
const makeSprite = url => {
    const i = new Image();
    i.src = url;
    return i;
};
const sprites = {
    jar: makeSprite('CookieJar.png'),
    cookie1: makeSprite('CookieBiten.png'),
    cookie10: makeSprite('Cookies1.png'),
    resultCookie: makeSprite('CookieSingle.png'),
    monster: makeSprite('CookieMonster.png'),
    buttonDiv: makeSprite('divide.png'),
    buttonMult: makeSprite('multiply.png'),
    buttonSub: makeSprite('minus.png'),
    buttonAdd: makeSprite('plus.png'),
    buttonEq: makeSprite('equals.png')
};
const ctx = document.getElementsByTagName('canvas')[0].getContext('2d');
let movingJar = 'no';
const moveJar = () => {
    if (movingJar === 'no') return;
    const jarObj = objects.find(o => o.id === 'jar');
    const speed = 30 * px;
    if (movingJar === 'right') {
        jarObj.x += speed;
        if (jarObj.x > playArea.w - jar.w / 2) {
            jarObj.x -= speed;
        }
    } else {
        jarObj.x -= speed;
        if (jarObj.x < jar.w / 2) {
            jarObj.x += speed;
        }
    }
};

const pressButtonPossibly = (x, y) => {
    objects
        .filter(o => o.id.indexOf('button') === 0)
        .forEach(o => {
            if (Math.abs(x - o.x) < button.w / 2 && Math.abs(y - o.y) < button.h / 2) {
                o.onClick();
                playAudioElementById('button-press');
                objects.push({
                    x, y,
                    id: 'button-press-fx',
                    duration: 10
                })
            }
        });
}

document.getElementsByTagName('canvas')[0].ontouchstart = e => {
    e.preventDefault();
    const layerX = e.targetTouches[0].clientX - document.getElementsByTagName('canvas')[0].getBoundingClientRect().left;
    const layerY = e.targetTouches[0].clientY - document.getElementsByTagName('canvas')[0].getBoundingClientRect().top;
    if (layerY >= playArea.h) return pressButtonPossibly(layerX, layerY);
    const jarObj = objects.find(o => o.id === 'jar');
    const right = layerX > jarObj.x;
    movingJar = right ? 'right' : 'left';
};
document.getElementsByTagName('canvas')[0].ontouchend = e => {
    e.preventDefault();
    movingJar = 'no';
};
document.getElementsByTagName('canvas')[0].onmousedown = e => {
    e.preventDefault();
    if (e.layerY >= playArea.h) return pressButtonPossibly(e.layerX, e.layerY);
    const jarObj = objects.find(o => o.id === 'jar');
    const right = e.layerX > jarObj.x;
    movingJar = right ? 'right' : 'left';
};
document.getElementsByTagName('canvas')[0].onmouseup = e => {
    e.preventDefault();
    movingJar = 'no';
};

let cookieGeneratorCounter = 0;
let smallCookieInterval = 50;
const smallCookieIntervalLimit = 10;
const calculator = {
    left: 0,
    right: 0,
    operator: '+',
    setOperator: function (op) {
        if (operand === 'left')
            operand = 'right';
        else {
            let result;
            if (this.operator === '+') {
                result = this.left + this.right;
            }
            if (this.operator === '-') {
                result = this.left - this.right;
            }
            if (this.operator === '*') {
                result = this.left * this.right;
            }
            if (this.operator === '/' && this.right !== 0) {
                result = this.left / this.right;
            }
            this.left = result;
            this.right = 0;
        }
        this.operator = op;
    },
    calculate: function () {
        operand = 'left';
        let result = 'err';
        if (this.operator === '+') {
            result = this.left + this.right;
        }
        if (this.operator === '-') {
            result = this.left - this.right;
        }
        if (this.operator === '*') {
            result = this.left * this.right;
        }
        if (this.operator === '/' && this.right !== 0) {
            result = this.left / this.right;
        }
        this.left = 0;
        this.right = 0;
        smallCookieInterval = 50;

        if (typeof result === 'number') {
            const flr = Math.floor(result);
            if (flr !== result && (result <= -10 || result >= 100)) {
                result = flr;
            }
            if (result > 999 || result < -99) {
                result = 'err';
            }
        }
        renderNumbers(result + '');
    }
};
let operand = 'left';

const renderNumbers = str => {
    objects = objects.filter(o => o.id !== 'result-cookie' && o.id !== 'cookie-monster');

    const renderNumber = (idx, arr) => {
        for (let y = 0; y < arr.length; y++) {
            for (let x = 0; x < arr[y].length; x++) {
                if (arr[y].charAt(x) === 'x') {
                    objects.push({
                        x: margin * 4 + (idx * 6 + x) * resultCookie.w,
                        y: margin * 4 + y * resultCookie.h,
                        id: 'result-cookie'
                    });
                }
            }
        }
    };

    for (let i = 0; i < str.length && i < 4; i++) {
        renderNumber(i, numbers[str.charAt(i)]);
    }
    objects.push({
        x: w - monster.w,
        y: highbarH - monster.h,
        id: 'cookie-monster',
        homing: {
            redirCountdown: 50,
            dx: 0,
            dy: 0
        }
    });
};

objects.push({
    x: button.w / 2 + margin * 4,
    y: playArea.h + lowbarH / 2,
    id: 'buttonDiv',
    onClick: () => calculator.setOperator('/')
});
objects.push({
    x: button.w / 2 + margin * 5 + button.w,
    y: playArea.h + lowbarH / 2,
    id: 'buttonMult',
    onClick: () => calculator.setOperator('*')
});
objects.push({
    x: button.w / 2 + margin * 6 + button.w * 2,
    y: playArea.h + lowbarH / 2,
    id: 'buttonSub',
    onClick: () => calculator.setOperator('-')
});
objects.push({
    x: button.w / 2 + margin * 7 + button.w * 3,
    y: playArea.h + lowbarH / 2,
    id: 'buttonAdd',
    onClick: () => calculator.setOperator('+')
});
objects.push({
    x: button.w / 2 + margin * 8 + button.w * 4,
    y: playArea.h + lowbarH / 2,
    id: 'buttonEq',
    onClick: () => calculator.calculate()
});

const jarObj = objects.find(o => o.id === 'jar');

const gameLoop = () => {
    if (gameEnded) return;
    setTimeout(() => gameLoop(), frameRate);
    cookieGeneratorCounter++;
    if (cookieGeneratorCounter % smallCookieInterval === 0) {
        smallCookieInterval = Math.max(smallCookieInterval - 1, smallCookieIntervalLimit);
        objects.push({
            x: Math.random() * w,
            y: highbarH + cookie1.h / 2,
            id: 'cookie-1'
        });
    }
    if (cookieGeneratorCounter > 500 && cookieGeneratorCounter % 40 === 0) {
        objects.push({
            x: Math.random() * w,
            y: highbarH + cookie10.h / 2,
            id: 'cookie-10'
        });
    }


    ctx.clearRect(0, 0, w, h);
    // Draw areas
    ctx.beginPath();
    ctx.rect(margin, margin, w - margin * 2, highbarH - margin * 2);
    ctx.rect(margin, highbarH + margin, w - margin * 2, playArea.h - highbarH - margin * 2);
    ctx.rect(margin, playArea.h + margin, w - margin * 2, lowbarH - margin * 2);
    ctx.strokeStyle = 'black';
    ctx.stroke();
    // Draw stuff
    objects.forEach(
        o => {
            if (o.id === 'cookie-collected-fx') {
                ctx.beginPath();
                ctx.arc(o.x, o.y, 10 * o.duration * px, 0, 2 * Math.PI);
                ctx.fillStyle = 'brown';
                ctx.fill();
                if (--o.duration <= 0) o.removed = true;
                return;
            }
            if (o.id === 'button-press-fx') {
                ctx.beginPath();
                ctx.arc(o.x, o.y, 7 * o.duration * px, 0, 2 * Math.PI);
                ctx.fillStyle = `rgb(${o.duration * 20}, 0, 0)`;
                ctx.fill();
                if (--o.duration <= 0) o.removed = true;
                return;
            }
            let spriteDimensions = {};
            let image;
            if (o.id === 'jar') {
                spriteDimensions = jar;
                image = sprites.jar;
            }
            if (o.id === 'cookie-1') {
                spriteDimensions = cookie1;
                image = sprites.cookie1;
            }
            if (o.id === 'cookie-10') {
                spriteDimensions = cookie10;
                image = sprites.cookie10;
            }
            if (o.id === 'result-cookie') {
                spriteDimensions = resultCookie;
                image = sprites.resultCookie;
            }
            if (o.id === 'cookie-monster') {
                spriteDimensions = monster;
                image = sprites.monster;
            }
            if (o.id.indexOf('button') === 0) {
                spriteDimensions = button;
                image = sprites[o.id];
            }
            ctx.drawImage(image, 0, 0, image.width, image.height, o.x - spriteDimensions.w / 2, o.y - spriteDimensions.w / 2, spriteDimensions.w, spriteDimensions.h);
        }
    );

    const monsterObj = objects.find(o => o.id === 'cookie-monster');
    // Move stuff
    objects.forEach(
        o => {
            if (o.id.match(/cookie-[\d]+/) !== null) {
                o.y += 5 * px;
                if (o.y > playArea.h - cookie1.h) {
                    o.removed = true;
                }
                if (Math.abs(o.x - jarObj.x) < jar.w / 2 && Math.abs(o.y - jarObj.y) < jar.h / 2) {
                    o.removed = true;
                    playAudioElementById('cookie');
                    calculator[operand] += Number(o.id.replace('cookie-', ''));
                    objects.push({ x: o.x, y: o.y, id: 'cookie-collected-fx', duration: 5 });
                }
            }
            if (o.id === 'cookie-monster') {
                if (--o.homing.redirCountdown <= 0) {
                    o.homing.redirCountdown = 10;
                    const distP2 = (x1, y1, x2, y2) => (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
                    const targetCookie = objects
                        .filter(o2 => o2.id === 'result-cookie')
                        .sort((a, b) => distP2(o.x, o.y, a.x, a.y) - distP2(o.x, o.y, b.x, b.y))[0];
                    if (targetCookie !== undefined) {
                        const dist = Math.sqrt(distP2(o.x, o.y, targetCookie.x, targetCookie.y));
                        o.homing.dx = (targetCookie.x - o.x) / dist;
                        o.homing.dy = (targetCookie.y - o.y) / dist;
                    } else {
                        o.removed = true;
                    }
                }
                const monsterSpeed = 3 * px;
                o.x += o.homing.dx * monsterSpeed;
                o.y += o.homing.dy * monsterSpeed;
            }
            if (o.id === 'result-cookie' && Math.abs(o.x - monsterObj.x) < resultCookie.w / 2 && Math.abs(o.y - monsterObj.y) < resultCookie.h / 2) {
                o.removed = true;
                playAudioElementById('chip' + Math.floor(Math.random() * 4 + 1));
                objects.push({ x: o.x, y: o.y, id: 'cookie-collected-fx', duration: 5 });
            }
        }
    );
    moveJar();
    objects = objects.filter(o => !o.removed).sort((a, b) => a.id === 'jar' ? 1 : 0);
};
gameLoop();
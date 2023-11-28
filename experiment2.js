const wheel = document.getElementById('wheel');
const startBtn = document.getElementById('startBtn');
const speedBtn = document.getElementById("speedBtn");
const rollbackBtn = document.getElementById("counterclockwise");
const stopBtn = document.getElementById("stopBtn");
const updateBtn = document.getElementById("updateBtn");
const historyListElement = document.getElementById('historyList');
const history = []; // 用于保存抽奖记录的数组


let state = 1;//用于表示现在是逆时针转还是顺时针转（默认顺时针）
//存储所有的奖项
const awards = [
    '华为手机',
    '联想拯救者',
    '苹果15Plus',
    '收音机',
    '音乐盒',
    '戴尔电脑',
    '10元',
    '100元',
    '待定一',
    '待定二',
]
//存储所有的color
const colors = [
    'orange',
    'white',
    'yellow',
    'blue',
    'gray',
    '#be2c71',
    '#de2c71',
    '#ae2c71',
]
let options = [
    /* { color: 'orange', text: '奖品华为手机' },
     { color: 'white', text: '苹果1' },
     { color: 'yellow', text: '苹果二' },
     { color: 'blue', text: '联想拯救者' },
     { color: 'gray', text: '戴尔灵越' },
     { color: '#be2c71', text: '华硕' },
     { color: '#de2c71', text: '机器革命' },
     { color: '#ae2c71', text: '未中奖' },*/

    // 可以根据实际需要添加更多的数据项
];

let isSpinning = false;
let currentRotation = 0; // 添加一个变量用于存储当前的旋转度数
updateWheel();

// 生成背景的函数
function generateConicGradient(data) {
    const total = data.length;
    const gradientStops = data
        .map((item, index) => `${item.color} ${(index / total) * 100}% ${(index + 1) / total * 100}%`)
        .join(', ');

    return `conic-gradient(${gradientStops})`;
}



function createDynamicWheel(data) {
    const total = data.length;
    const wheel = document.getElementById('wheel');
    wheel.innerHTML = ''; // 清空转盘内容

    // 计算每个扇形的角度
    const angle = 360 / total;

    for (let i = 0; i < total; i++) {
        const sector = document.createElement('div');
        sector.classList.add('sector');

        const text = document.createElement('div');
        text.innerText = data[i].text;
        text.classList.add('text');

        // Adjust text position within each sector
        const textDistance = 120; // Distance from the center of the wheel
        const textAngle = angle * i + angle / 2;
        const textX = textDistance * Math.cos((textAngle - 90) * (Math.PI / 180));
        const textY = textDistance * Math.sin((textAngle - 90) * (Math.PI / 180));



        text.style.position = 'absolute';
        text.style.top = `calc(50% + ${textY}px)`;
        text.style.left = `calc(50% + ${textX}px)`;
        //text.style.transform = 'translate(-50%, -50%)';
        //  text.style.transform = `rotate(${textAngle}deg)`;
        text.style.transform = `translate(-50%, -50%) rotate(${textAngle}deg)`;




        sector.appendChild(text);
        wheel.appendChild(sector);
    }


}
//随机生成奖项的数量和名称
function updateWheel() {
    options.length = 0;
    //随机生成奖品个数(5-8个)
    const numPrizes = Math.floor(Math.random() * 4) + 5;

    let tmp_awards = getRandomItems(awards, numPrizes);
    let tmp_colors = getRandomItems(colors, numPrizes);

    for (let i = 0; i < numPrizes; i++) {
        options.push({ color: tmp_colors[i], text: tmp_awards[i] });
    }

    wheel.style.background = generateConicGradient(options);
    createDynamicWheel(options);

}
// 辅助函数，从数组中随机选择指定数量的项
function getRandomItems(array, numItems) {
    const shuffled = array.sort(() => 0.5 - Math.random());//将数组顺序打乱
    return shuffled.slice(0, numItems);
}
//让转盘停止转动
function stopWheel() {
    isSpinning = false;
    // 获取当前旋转角度
    const computedStyle = window.getComputedStyle(wheel);
    const transformValue = computedStyle.getPropertyValue('transform');
    const matrix = new DOMMatrix(transformValue);
    currentRotation = Math.round(Math.atan2(matrix.b, matrix.a) * (180 / Math.PI));

    // 清除过渡效果
    wheel.style.transition = 'none';
    // 停止旋转
    wheel.style.transform = `rotate(${currentRotation}deg)`;
    handleTransitionEnd();
    // 重新设置过渡效果
    setTimeout(() => {
        wheel.style.transition = 'transform 3s ease-out';
    }, 0);
}
//逆时针旋转
function rollback() {
    if (!isSpinning) {
        state = 0;
        isSpinning = true;
        const randomDegree = -Math.floor(Math.random() * 360) - 1080; // 旋转3圈以上
        currentRotation += randomDegree;
        wheel.style.transform = `rotate(${currentRotation}deg)`; // 调整旋转方向
        wheel.addEventListener('transitionend', handleTransitionEnd);
    }
}

function spinWheel() {
    if (!isSpinning) {
        isSpinning = true;
        state = 1;

        const randomDegree = Math.floor(Math.random() * 360) + 1080; // 旋转3圈以上
        currentRotation += randomDegree;
        wheel.style.transform = `rotate(${currentRotation}deg)`; // 调整旋转方向
        wheel.addEventListener('transitionend', handleTransitionEnd);

    }
}
function handleTransitionEnd() {
    isSpinning = false;
    wheel.removeEventListener('transitionend', handleTransitionEnd);

    const selectedOption = getSelectedOption(currentRotation);

    const endTime = new Date(); // 记录抽奖结束时间

    // 更新抽奖记录数组
    const historyItem = {
        text: selectedOption.text,
        time: formatLocalTime(endTime), // 获取本地时间并格式化
    };
    history.push(historyItem);

    // 更新抽奖记录列表
    updateHistoryList();

    console.log('Selected Option:', selectedOption);
}

function getSelectedOption(rotation) {
    const total = options.length;
    const angle = 360 / total;
    const normalizedRotation = (rotation % 360 + 360) % 360; // 处理负数和大于360的情况
    console.log(normalizedRotation)
    const sectorIndex = Math.floor(normalizedRotation / angle);
    return options[total - 1 - sectorIndex];
}
function speedUp() {
    if (state == 1) {
        currentRotation += 720;
    }
    else {
        currentRotation -= 720;
    }

    wheel.style.transform = `rotate(${currentRotation}deg)`; // 调整旋转方向
}
function formatLocalTime(date) {
    const options = {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        timeZoneName: 'short',
    };
    return new Intl.DateTimeFormat('default', options).format(date);
}

function updateHistoryList() {
    // 清空抽奖记录列表
    historyListElement.innerHTML = '';

    // 遍历抽奖记录数组，添加到列表中
    history.forEach((item) => {
        const listItem = document.createElement('li');
        listItem.innerText = `${item.text}        （抽奖时间：${item.time}）`;
        historyListElement.appendChild(listItem);
    });
}


startBtn.addEventListener('click', spinWheel);
speedBtn.addEventListener('click', speedUp);
rollbackBtn.addEventListener("click", rollback);
stopBtn.addEventListener("click", stopWheel);
updateBtn.addEventListener("click", updateWheel);

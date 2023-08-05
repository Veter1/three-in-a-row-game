
import {
    setupAndLaunch as launchGame,
    onClickRock as onClickRockFunction,
    permissionToClick
} from './game_manager.js';

const loadingWindow = document.getElementsByClassName('loadingWindow')[0];
const menuWindow = document.getElementsByClassName('menuWindow')[0];
const lvlMapWindow = document.getElementsByClassName('lvlMapWindow')[0];
const gameWindow = document.getElementsByClassName('gameWindow')[0];
const gameOverWindow = document.getElementsByClassName('gameOverWindow')[0];
const starsInResult = gameOverWindow.getElementsByClassName('star');
const scoreCountInResult = gameOverWindow.getElementsByClassName('scoreCount')[0];
let userDevice = null; // phone or pc
export let permissionToPlay = true;
let progressData = [], lvlMap = [], selectLvl = 0, windowLoadSpeed = 800, windowOpacitySpeed = 400;
let versionOfApp = '0.1'; 
let lvlList = [{
    starsCountToOpen: 0,
    maxScore: 2000,
    rocks: {'1': 3,'2':3},
    // rocks: {'1': 3,'2':6 ,'3': 3},
    blocks: null,/* ['2/3', '0/1'] */
}, {
    starsCountToOpen: 1,
    maxScore: 1000,
    rocks: {'4': 6, '3': 6},
    blocks: null, /* ['0/4', '0/2'], */
}, {
    starsCountToOpen: 3,
    maxScore: 1300,
    rocks: {'1': 3, '2': 6},
    blocks: null, /* ['0/4', '0/2'], */
}];

// localStorage.clear();

window.onload = function(){ onLoadApp();}
window.onerror = function(msg, url, lineNo, columnNo, error) { alert(msg+'\n'+url+'\n'+lineNo+'\n'+columnNo+'\n'+error); }


// OTHER FUNCTIONS //
// фукція при завантаженні гри
async function onLoadApp(){
    console.log('Гру успішно завантажено');
    // вияснюємо який пристрій у користувача
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        console.log('це телефон/планшет')
        userDevice = 'phone';
      } else {
        console.log('це пк')
        userDevice = 'pc';
    }
    // попередні налаштування демонстрації ігрових вікон
    gameWindow.style = gameWindow.style.cssText + "display: none";
    menuWindow.style = menuWindow.style.cssText + "display: none";
    lvlMapWindow.style = lvlMapWindow.style.cssText + "display: none";
    loadingWindow.style = loadingWindow.style.cssText + "display: none";
    gameOverWindow.style = gameOverWindow.style.cssText + "display: none";
    changeWindow(null, menuWindow);
    await updateUserProgress(true);
}
// перехід між вікнами
async function changeWindow(currentWindow, newWindow){
    if (currentWindow !== null){
        currentWindow.style = currentWindow.style.cssText + "display: none"        
    }
    loadingWindow.style = loadingWindow.style.cssText + "display: flex";
    loadingWindow.style = loadingWindow.style.cssText + "opacity: 1";

    // типу завантажується нове вікно
    setTimeout(()=>{
        newWindow.style = newWindow.style.cssText + "display: flex";
        loadingWindow.style = loadingWindow.style.cssText + "display: none";
    }, windowLoadSpeed);
}
// оновлення відображення прогрессу рівнів
async function updateLvlMap(onLoadApp, countStars){    
    // при першому завантаженні створюємо рівні на мапі
    if (onLoadApp){
        let lvlNode = lvlMapWindow.children[0].children[0];
        for(let i in lvlList){
            lvlMap[i] = lvlNode.cloneNode(true);
            lvlMapWindow.children[0].append(lvlMap[i]);
        }
        lvlNode.remove();
    }

    // задаємо нові властивості та значення рівням відповідно до прогессу
    for(let i in lvlList){
        if (Number(progressData[i][0]) == 1){
            lvlMap[i].textContent = 'рівень доступний';
        } else { lvlMap[i].textContent = 'рівень закритий' }
        lvlMap[i].textContent += '\n потрібно зірок: '+lvlList[i].starsCountToOpen;
        // lvlMap[i].textContent += '\n ви маєте зірок: '+countStars;
        lvlMap[i].textContent += '\n зірок зароблених на цьому рівні: '+progressData[i][2];

        // виділяємо обраний рівень
        if (selectLvl == i)
            lvlMap[i].style = lvlMap[i].style.cssText + "border: solid 3px greenyellow";
        else
            lvlMap[i].style = lvlMap[i].style.cssText + "border: none";
    }
}
// оновлення прогрессу користувача
async function updateUserProgress(onLoadApp, newScore, NewStars){
    // перший запуск додатку без збережених данних
    if (localStorage.length == 0 && onLoadApp){
        console.log('це перший запуск гри створюю данні користувача');

        // записуємо данні в storage
        localStorage.setItem('versionOfApp', versionOfApp);
        localStorage.setItem('userName', 'testUserName');

        // заповнюємо массив данних для роботи з ним
        for (let i in lvlList){
            if (i == 0)
                progressData[i] = [1, 0, 0]
            else
                progressData[i] = [0, 0, 0]
        }
        
        // рядок данних прогрессу для збереження
        let newProgressData = '';
        for (let i in progressData){
            for (let j in progressData[0])
                newProgressData += progressData[i][j] + ',';
            newProgressData = newProgressData.slice(0, -1);
            newProgressData += '/';
        }
        newProgressData = newProgressData.slice(0, -1);    
        // записуємо данні в storage
        localStorage.setItem('progress', newProgressData);

        updateLvlMap(onLoadApp, 0);
    }
    // запуск додатку але користувач має збережені данні
    else if (localStorage.length != 0 && onLoadApp){
        console.log('користувач вже раніше грав та має збережений прогресс');

        // переносимо данні в двовимірний масив для простоти використання
        let progressMas = localStorage.progress.split('/');
        for (let i in progressMas){
            progressData.push([]);
            for (let j in progressMas[0].split(','))
                progressData[i].push(progressMas[i].split(',')[j]);
        }

        // рахуємо його зірки
        let countStars = 0;
        for (let i in progressMas)
            countStars += Number(progressMas[i].split(',')[2]);

        updateLvlMap(onLoadApp, countStars);
    }
    // оновлення данних в процессі гри
    else if (localStorage.length != 0 && !onLoadApp){
        console.log('оновлення данних в процессі гри..');
        if (progressData[selectLvl][1] < newScore){
            let onNewStars = false;
            let countStars = 0;
        
            // записуємо нові данні про поточний рівень
            progressData[selectLvl][1] = newScore;
            if (progressData[selectLvl][2] < NewStars){
                progressData[selectLvl][2] = NewStars;
        
                for (let i in progressData)
                    countStars += Number(progressData[i][2]);
                for (let i in progressData){
                    if (lvlList[i].starsCountToOpen <= countStars)
                        progressData[i][0] = 1;
                }
        
                onNewStars = true;
            }
            
            // формуємо новий рядок данних прогрессу для збереження
            let newProgressData = '';
            for (let i in progressData){
                for (let j in progressData[0])
                    newProgressData += progressData[i][j] + ',';
                newProgressData = newProgressData.slice(0, -1);
                newProgressData += '/';
            }
            newProgressData = newProgressData.slice(0, -1);
        
            // перезаписуємо данні в storage
            localStorage.removeItem('progress');
            localStorage.setItem('progress', newProgressData);
        
            if (onNewStars)
                updateLvlMap(onLoadApp, countStars);    
        } else {
            console.log('нових рекордів не зроблено :(');
        }
    }

    // довідка:
    // '1,0,0' це:
    // {status: 'open', bestScore: 0, starsCounter: 0}
    // '/' - ділить рядок на рівні
    // ',' - розділяє окремі значення в рівні
}


// ON MENU FUNCTIONS //
// вупрацювання кнопок у вікні "меню"
menuWindow.addEventListener('click', async (event)=>{
    if (event.target.classList.contains('btnPlayStart')){
        await changeWindow(menuWindow, gameWindow);
        startGame();
    } else if (event.target.classList.contains('btnSelectLvl')){
        await changeWindow(menuWindow, lvlMapWindow);
    }
})
// вупрацювання кнопок у вікні "результати гри"
gameOverWindow.addEventListener('click', async (event)=>{
    if (event.target.classList.contains('btnNextLvl')){
        if ((selectLvl+1) <= (lvlList.length-1)){
            selectLvl++;
            gameWindow.style = gameWindow.style.cssText + "display: none";  
            await changeWindow(gameOverWindow, gameWindow);
            startGame();
        } else {
            console.log('це був останній рівень')
        }
    } else if (event.target.classList.contains('btnRestart')){
        await changeWindow(gameOverWindow, gameWindow);
        startGame();
    } else if (event.target.classList.contains('btnBackToMenu')){
        gameWindow.style = gameWindow.style.cssText + "display: none";
        await gameOver('backToMenuFromResultWindow');
    }
})
lvlMapWindow.addEventListener('click', async (event)=>{
    if (event.target.classList.contains('lvl')){
        for (let i in lvlMap)
            if (event.target == lvlMap[i] && Number(progressData[i][0]) == 1){
                selectLvl = i;
                updateLvlMap(false);
                await changeWindow(lvlMapWindow, gameWindow);
                startGame();
            }
            else if (event.target == lvlMap[i] && Number(progressData[i][0]) == 0)
                console.log('lvl № '+i+' is closed')
    } else if (event.target.classList.contains('btnBackToMenu'))
        await changeWindow(lvlMapWindow, menuWindow);

})
// завантаження рівня та початок гри
function startGame(){
    permissionToPlay = true;
    launchGame(lvlList[selectLvl], selectLvl);
}


// ON GAME FUNCTIONS //
// відпрацювання натискань (камені, кнопки інтерфейсу)
gameWindow.addEventListener('click', async (event)=>{
    if (event.target.classList.contains('rock') && permissionToPlay === true && permissionToClick === true)
        await onClickRockFunction(event)

    else if (event.target.classList.contains('btnRestart') && permissionToPlay === true && permissionToClick === true){
        if (userDevice === 'pc'){
            event.target.style = event.target.style.cssText + "transform: scale(1)";
            gameWindow.style = gameWindow.style.cssText + "cursor: default";
        }
        await changeWindow(gameWindow, gameWindow);
        startGame();
    }

    else if (event.target.classList.contains('btnBackToMenu') && permissionToPlay === true && permissionToClick === true)
        await gameOver('backToMenuFromGame');
})
// еффект наведення/прибирання миші на об’єкти та кнопки
gameWindow.addEventListener('mousemove', (event)=>{
    if (userDevice === 'pc'){
        let obj = event.target;
        if (obj.classList.contains('rock') && permissionToPlay === true && permissionToClick === true)
            gameWindow.style = gameWindow.style.cssText + "cursor: pointer";
        else if (obj.classList.contains('btnRestart') && permissionToPlay === true && permissionToClick === true){
            gameWindow.style = gameWindow.style.cssText + "cursor: pointer";
            obj.style = obj.style.cssText + "transform: scale(1.2)";
        }
        else if (obj.classList.contains('btnBackToMenu') && permissionToPlay === true && permissionToClick === true){
            gameWindow.style = gameWindow.style.cssText + "cursor: pointer";
            obj.style = obj.style.cssText + "transform: scale(1.2)";
        }
        else
            gameWindow.style = gameWindow.style.cssText + "cursor: default";        
    }
})
gameWindow.addEventListener('mouseout', (event)=>{
    if (userDevice === 'pc'){
        if (event.target.classList.contains('btnRestart'))
            event.target.style = event.target.style.cssText + "transform: scale(1)";
        else if (event.target.classList.contains('btnBackToMenu'))
            event.target.style = event.target.style.cssText + "transform: scale(1)";
    }
})
// кінець гри
export async function gameOver(status, score, stars){
    if (permissionToPlay === true || status === 'backToMenuFromResultWindow'){
        permissionToPlay = false;
        switch(status){
            case 'win':{
                resultOfGame(score, stars);
                break;
            }
            case 'lose':{
                // console.log('you lose the game :(');
                break;
            }
            case 'backToMenuFromGame':{
                console.log('you go back to menu');
                await changeWindow(gameWindow, menuWindow);
                break;
            }
            case 'backToMenuFromResultWindow':{
                // console.log('you go back to menu');
                await changeWindow(gameOverWindow, menuWindow);
                break;
            }
        }
    }
}
// вікно результатів гри та їх підрахунок
async function resultOfGame(score, stars){
    //check any progress 
    let someTxt = '';   
    if (await updateUserProgress(false, score, stars))
        someTxt = 'New rocord!';

    // show result window    
    for (let i = 0; i < 3; i++){
        if ((i+1) <= stars){
            starsInResult[i].style = starsInResult[i].style.cssText +
            "background: url('/img/fulledStar.png') 0 0/100% 100% no-repeat";
        } else {
            starsInResult[i].style = starsInResult[i].style.cssText +
            "background: url('/img/emptyStar.png') 0 0/100% 100% no-repeat";
        }
    }
    scoreCountInResult.textContent = score;
    gameOverWindow.style = gameOverWindow.style.cssText + "display: flex";
}




/*
// перехід між вікнами плавний варіант
async function changeWindow(currentWindow, newWindow){
    if (currentWindow !== null){
        // currentWindow.style = currentWindow.style.cssText + "display: none"
        currentWindow.style = currentWindow.style.cssText + "opacity: 0";
        setTimeout(()=> currentWindow.style = currentWindow.style.cssText + "display: none" , windowOpacitySpeed)          
    }
    loadingWindow.style = loadingWindow.style.cssText + "display: flex"
    setTimeout(()=>{
        loadingWindow.style = loadingWindow.style.cssText + "opacity: 1";
    }, (windowOpacitySpeed/2))  
    // loadingWindow.style = loadingWindow.style.cssText + "display: flex";
    // loadingWindow.style = loadingWindow.style.cssText + "opacity: 1";

    // типу завантажується нове вікно
    setTimeout(()=>{
        // newWindow.style = newWindow.style.cssText + "display: flex";
        // loadingWindow.style = loadingWindow.style.cssText + "display: none";
        loadingWindow.style = loadingWindow.style.cssText + "opacity: 0";
        newWindow.style = newWindow.style.cssText + "display: flex";
        setTimeout(()=>{
            loadingWindow.style = loadingWindow.style.cssText + "display: none";
            newWindow.style = newWindow.style.cssText + "opacity: 1";
        }, windowOpacitySpeed)  
    }, windowLoadSpeed);
}*/

// window.onload = function(){ alert('усі ресурси успішно завантажені'); }
// window.onerror = function(msg, url, lineNo, columnNo, error) { alert(msg+'\n'+url+'\n'+lineNo+'\n'+columnNo+'\n'+error); }

import {
    setupAndLaunch as launchGame,
    onClickRock as onClickRockFunction,
    restartGame as resetGameProgress,
    permissionToClick
} from './game_manager.js';

const loadingWindow = document.getElementsByClassName('loadingWindow')[0];
const menuWindow = document.getElementsByClassName('menuWindow')[0];
const gameWindow = document.getElementsByClassName('gameWindow')[0];
let userDevice = null; // phone or pc
export let permissionToPlay = true;
let selectLvl = 1, windowLoadSpeed = 1000;
let lvlTasks = [{
    maxScore: 1000,
    rocks: {'1': 2, '2': 3},
    blocks: null,/* ['2/3', '0/1'] */
    status: 'open' // open or lock
}, {
    maxScore: 2000,
    rocks: {4: 1, 3: 2},
    blocks: null, /* ['0/4', '0/2'], */
    status: 'open'
}];

onLoadApp();



// OTHER FUNCTIONS //
// фукція при завантаженні гри
async function onLoadApp(){
    console.log('добрий день, гру завантажено');
    // вияснюємо який пристрій у користувача
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        console.log('это телефон/планшет')
        userDevice = 'phone';
      } else {
        console.log('это пк')
        userDevice = 'pc';
    }
    // попередні налаштування демонстрації ігрових вікон
    gameWindow.style = gameWindow.style.cssText + "display: none";
    menuWindow.style = menuWindow.style.cssText + "display: none";
    loadingWindow.style = loadingWindow.style.cssText + "display: none";
    changeWindow(null, menuWindow);
}
// перехід між вікнами
async function changeWindow(currentWindow, newWindow){
    if (currentWindow !== null)
        currentWindow.style = currentWindow.style.cssText + "display: none";    
    loadingWindow.style = loadingWindow.style.cssText + "display: flex";

    // типу завантажується нове вікно
    setTimeout(()=>{
        newWindow.style = newWindow.style.cssText + "display: flex";
        loadingWindow.style = loadingWindow.style.cssText + "display: none";
    }, windowLoadSpeed);
}


// ON MENU FUNCTIONS //
// натискання на кнопку "грати"
menuWindow.addEventListener('click', async (event)=> {
    if (event.target.classList.contains('btnPlayStart')){
        await changeWindow(menuWindow, gameWindow);
        permissionToPlay = true;
        launchGame(lvlTasks[selectLvl]);
    }
})


// ON GAME FUNCTIONS //
// відпрацювання натискань (камені, кнопки інтерфейсу)
gameWindow.addEventListener('click', async (event)=> {
    if (event.target.classList.contains('rock') && permissionToPlay === true && permissionToClick === true)
        await onClickRockFunction(event)

    else if (event.target.classList.contains('btnRestart') && permissionToPlay === true && permissionToClick === true){
        if (userDevice === 'pc'){
            event.target.style = event.target.style.cssText + "transform: scale(1)";
            gameWindow.style = gameWindow.style.cssText + "cursor: default";
        }
        await resetGameProgress(event)
    }

    else if (event.target.classList.contains('btnBackToMenu') && permissionToPlay === true && permissionToClick === true)
        await gameOver('backToMenu');
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
// закінчення гри
export async function gameOver(status, score){
    if (permissionToPlay === true){
        permissionToPlay = false;
        switch(status){
            case 'win':{
                console.log('you win the game!');
                console.log('your score = '+score);
                break;
            }
            case 'lose':{
                console.log('you lose the game :(');
                break;
            }
            case 'backToMenu':{
                console.log('you go back to menu');
                break;
            }
        }
        await changeWindow(gameWindow, menuWindow);
    }
}

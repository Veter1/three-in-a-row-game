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
const gameOverWindow = document.getElementsByClassName('gameOverWindow')[0];
let userDevice = null; // phone or pc
export let permissionToPlay = true;
let selectLvl = 0, windowLoadSpeed = 1000, windowOpacitySpeed = 400;
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
    gameOverWindow.style = gameOverWindow.style.cssText + "display: none";
    changeWindow(null, menuWindow);
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


// ON MENU FUNCTIONS //
// натискання на кнопку "грати"
menuWindow.addEventListener('click', async (event)=>{
    if (event.target.classList.contains('btnPlayStart')){
        await changeWindow(menuWindow, gameWindow);
        permissionToPlay = true;
        launchGame(lvlTasks[selectLvl]);
    }
})
gameOverWindow.addEventListener('click', async (event)=>{
    if (event.target.classList.contains('btnNextLvl')){
        if ((selectLvl+1) <= (lvlTasks.length-1)){
            selectLvl++;
            gameWindow.style = gameWindow.style.cssText + "display: none";  
            await changeWindow(gameOverWindow, gameWindow);
            permissionToPlay = true;
            launchGame(lvlTasks[selectLvl]);
        } else {
            console.log('це був останній рівень')
        }
    } else if (event.target.classList.contains('btnRestart')){
        await changeWindow(gameOverWindow, gameWindow);
        permissionToPlay = true;
        launchGame(lvlTasks[selectLvl]);
    } else if (event.target.classList.contains('btnBackToMenu')){
        gameWindow.style = gameWindow.style.cssText + "display: none";  
        console.log('asd')      
        await gameOver('backToMenuFromResultWindow');
        console.log('11')      
    }
})


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
        // await resetGameProgress(event)
        await changeWindow(gameWindow, gameWindow);
        permissionToPlay = true;
        launchGame(lvlTasks[selectLvl]);
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
// закінчення гри
export async function gameOver(status, score){
    if (permissionToPlay === true || status === 'backToMenuFromResultWindow'){
        permissionToPlay = false;
        switch(status){
            case 'win':{
                console.log('you win the game!');
                console.log('your score = '+score);
                let resultSection = gameOverWindow.children[0].children[0];
                gameOverWindow.style = gameOverWindow.style.cssText + "display: flex";
                resultSection.textContent = 'your score = '+score;
                break;
            }
            case 'lose':{
                console.log('you lose the game :(');
                break;
            }
            case 'backToMenuFromGame':{
                console.log('you go back to menu');
                await changeWindow(gameWindow, menuWindow);
                break;
            }
            case 'backToMenuFromResultWindow':{
                console.log('you go back to menu');
                await changeWindow(gameOverWindow, menuWindow);
                break;
            }
        }
    }
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

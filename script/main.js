import {
    setupAndLaunch as launchGame,
    onClickRock as onClickRockFunction,
    permissionToClick
} from './game_manager.js';

const helpWindow = document.getElementsByClassName('helpWindow')[0];
const loadingWindow = document.getElementsByClassName('loadingWindow')[0];
const menuWindow = document.getElementsByClassName('menuWindow')[0];
const lvlMapWindow = document.getElementsByClassName('lvlMapWindow')[0];
const gameWindow = document.getElementsByClassName('gameWindow')[0];
const gameOverWindow = document.getElementsByClassName('gameOverWindow')[0];
const starsInResult = gameOverWindow.getElementsByClassName('star');
const scoreCountInResult = gameOverWindow.getElementsByClassName('scoreCount')[0];
let btnNextInResult = gameOverWindow.getElementsByClassName('btnNextLvl')[0];

const lvlSound1_2 = new Audio("../sound/lvl1_2.mp3");
const lvlSound3_4 = new Audio("../sound/lvl3_4.mp3");
const lvlSound5_6 = new Audio("../sound/lvl5_6.mp3");
const mainThemeSound = new Audio("../sound/mainTheme.mp3");
const addScoreSound = new Audio("../sound/bubbleSound_2_1.mp3");
const onWinSound = new Audio("../sound/onWin.mp3");
const popUpSound = new Audio("../sound/popUp_1_1.mp3");
const onClickSound = new Audio("../sound/popUp_2_1.mp3");
const onClickSound2 = new Audio("../sound/popUp_2_1.mp3");

let userDevice = null; // phone or pc
export let permissionToPlay = true, musicVolume = 1, SoundVolume = 1;
let progressData = [], lvlMap = [], selectLvl = 0, windowLoadSpeed = 800, windowOpacitySpeed = 400;
let countStars = 0, onClickSoundSwitcher = 0, anyInteract = false, permissionToSkip = true;
let versionOfApp = '0.1'; 
let lvlList = [{
    starsCountToOpen: 0,
    maxScore: 900,
    rocks: {'1': 3,'2':6 ,'3': 3},
    blocks: null, /* приклад: ['2/3', '0/1'] */
    playFieldHoles: ['0/0', '0/5', '5/0', '5/5'],
}, {
    starsCountToOpen: 1,
    maxScore: 1200,
    rocks: {'4': 6, '3': 6, '1': 3},
    blocks: null,
    playFieldHoles: ['1/1', '1/4', '4/1', '4/4'],
}, {
    starsCountToOpen: 3,
    maxScore: 1500,
    rocks: {'1': 9, '2': 12},
    blocks: null,
    playFieldHoles: ['0/0', '0/5', '5/0', '5/5', '1/1', '1/4', '4/1', '4/4'],
}, {
    starsCountToOpen: 6,
    maxScore: 1800,
    rocks: {'3': 6, '2': 6, '1': 6},
    blocks: null,
    playFieldHoles: ['2/2', '2/3', '3/2', '3/3'],
}, {
    starsCountToOpen: 10,
    maxScore: 2100,
    rocks: {'1': 15, '2': 3, '3': 6},
    blocks: null,
    playFieldHoles: [ '2/0', '3/0', '2/5', '3/5'],
}, {
    starsCountToOpen: 15,
    maxScore: 2500,
    rocks: {'1': 21, '2': 18, '3': 15},
    blocks: null,
    playFieldHoles: [ '0/2', '0/3', '5/2', '5/3', '2/0', '3/0', '2/5', '3/5'],
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
    gameOverWindow.style = gameOverWindow.style.cssText + "display: none";
    helpWindow.style = helpWindow.style.cssText + "display: none";
    menuWindow.style = menuWindow.style.cssText + "display: none";
    lvlMapWindow.style = lvlMapWindow.style.cssText + "display: none";
    loadingWindow.style = loadingWindow.style.cssText + "display: none";
    changeVolume('onloadApp');
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
        if (currentWindow !== null)
            popUpSound.play();
        newWindow.style = newWindow.style.cssText + "display: flex";
        loadingWindow.style = loadingWindow.style.cssText + "display: none";
    }, windowLoadSpeed);
}
// оновлення відображення прогрессу рівнів
async function updateLvlMap(onLoadApp){    
    // при першому завантаженні створюємо рівні на мапі
    if (onLoadApp){
        let lvlNode = lvlMapWindow.children[0].children[0].children[0];
        for(let i in lvlList){
            lvlMap[i] = lvlNode.cloneNode(true);
            lvlMapWindow.children[0].children[0].append(lvlMap[i]);
        }
        lvlNode.remove();
    }

    // задаємо нові властивості та значення рівням відповідно до прогессу
    for(let i in lvlList){
        if (Number(progressData[i][0]) == 1){
            // пишемо номер рівня
            lvlMap[i].children[1].textContent = Number(i)+1;
            lvlMap[i].style = lvlMap[i].style.cssText +
            "background: url('../img/openLvlBG.png') 0 0/100% 100% no-repeat";
            // відмічаємо зірки на рівні
            lvlMap[i].children[0].style = lvlMap[i].children[0].style.cssText + "display: flex";
            for (let j = 0; j < 3; j++){
                // зірка є
                if (progressData[i][2] >= (j+1)){
                    lvlMap[i].children[0].children[j].style = lvlMap[i].children[0].children[j].style.cssText +
                    "opacity: 1";
                }
                // нема зірки
                else{
                    lvlMap[i].children[0].children[j].style = lvlMap[i].children[0].children[j].style.cssText +
                    "opacity: 0.3";
                }
            }
        } else {
            lvlMap[i].style = lvlMap[i].style.cssText +
            "background: url('../img/closeLvlBG.png') 0 0/100% 100% no-repeat";
            lvlMap[i].children[0].style = lvlMap[i].children[0].style.cssText + "display: none";
        }
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
        countStars = 0;
        for (let i in progressMas)
            countStars += Number(progressMas[i].split(',')[2]);

        updateLvlMap(onLoadApp);
    }
    // оновлення данних в процессі гри
    else if (localStorage.length != 0 && !onLoadApp){
        console.log('оновлення данних в процессі гри..');
        if (progressData[selectLvl][1] < newScore){
            let onNewStars = false;
            countStars = 0;
        
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
                updateLvlMap(onLoadApp);    
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
// вкл/викл звуку та музики
function changeVolume(type){
    switch(type){
        case 'onloadApp':{
            mainThemeSound.volume = 0.3;
            lvlSound1_2.volume = 0.3;
            lvlSound3_4.volume = 0.3;
            lvlSound5_6.volume = 0.3;
            onWinSound.volume = 0.7;
            addScoreSound.volume = 0.4;
            popUpSound.volume = 0.5;
            onClickSound.volume = 0.5;
            onClickSound2.volume = 0.5;
            mainThemeSound.loop = true;
            console.log('1')
            break;
        }
        case 'sound':{
            if (popUpSound.volume != 0){
                SoundVolume = 0;
                onWinSound.volume = 0;
                addScoreSound.volume = 0;
                popUpSound.volume = 0;
                onClickSound.volume = 0;
                onClickSound2.volume = 0;
                menuWindow.children[1].style = menuWindow.children[1].style.cssText +
                "background: url('../img/btnSoundOffBG.png') 0 0/100% 100% no-repeat";
            } else{
                SoundVolume = 1;
                onWinSound.volume = 0.7;
                addScoreSound.volume = 0.4;
                popUpSound.volume = 0.5;
                onClickSound.volume = 0.5;
                onClickSound2.volume = 0.5;
                menuWindow.children[1].style = menuWindow.children[1].style.cssText +
                "background: url('../img/btnSoundOnBG.png') 0 0/100% 100% no-repeat";
            }
            break;
        }
        case 'music':{
            if (mainThemeSound.volume != 0){
                musicVolume = 0;
                mainThemeSound.volume = 0;
                lvlSound1_2.volume = 0;
                lvlSound3_4.volume = 0;
                lvlSound5_6.volume = 0;
                menuWindow.children[2].style = menuWindow.children[2].style.cssText +
                "background: url('../img/btnMusicOffBG.png') 0 0/100% 100% no-repeat";
            }
            else{
                musicVolume = 1;
                mainThemeSound.volume = 0.3;
                lvlSound1_2.volume = 0.3;
                lvlSound3_4.volume = 0.3;
                lvlSound5_6.volume = 0.3;
                menuWindow.children[2].style = menuWindow.children[2].style.cssText +
                "background: url('../img/btnMusicOnBG.png') 0 0/100% 100% no-repeat";
            }
            break;
        }
    }

}
// програвання звуку при натисканні на кнопку
function playSoundBtnClick(){
    if (onClickSoundSwitcher == 0){
        onClickSound.play(); onClickSoundSwitcher = 1;
    } else{
        onClickSound2.play(); onClickSoundSwitcher = 0;
    }    
}


// ON MENU FUNCTIONS //
// вупрацювання кнопок у вікні "меню"
menuWindow.addEventListener('click', async (event)=>{
    if (!anyInteract){
        anyInteract = true;
        mainThemeSound.play();
    }
    if (event.target.classList.contains('btnSelectLvl')){
        playSoundBtnClick()
        await changeWindow(menuWindow, lvlMapWindow);
    } else if (event.target.classList.contains('btnSoundVolumeChange')){
        changeVolume('sound');
        playSoundBtnClick();
    } else if (event.target.classList.contains('btnMusicVolumeChange')){
        playSoundBtnClick()
        changeVolume('music');        
    } else if (event.target.classList.contains('btnHelp')){
        playSoundBtnClick()
        await changeWindow(menuWindow, helpWindow);
    }
})
// вупрацювання кнопок у вікні "результати гри"
gameOverWindow.addEventListener('click', async (event)=>{
    if (event.target.classList.contains('btnNextLvl') && permissionToSkip){
        playSoundBtnClick()
        // якщо наступний рівень відкритий        
        if (lvlList[Number(selectLvl)+1].starsCountToOpen <= countStars){
            selectLvl++;
            gameWindow.style = gameWindow.style.cssText + "display: none";  
            await changeWindow(gameOverWindow, gameWindow);
            startGame();
        }
        // якщо ні      
         else{
            let msg = btnNextInResult.children[0].cloneNode(true);
            msg.style = msg.style.cssText + "display: block; top: 0; transition-duration: 2.5s; opacity: 1;";
            btnNextInResult.append(msg);
            setTimeout(()=> msg.style = msg.style.cssText + "top: -300%; opacity: 0;", 50);
            setTimeout(()=>{ msg.style = msg.style.cssText + "display: none;"; msg.remove(); }, 2400);
        }
    } else if (event.target.classList.contains('btnRestart') && permissionToSkip){
        playSoundBtnClick()
        await changeWindow(gameOverWindow, gameWindow);
        startGame();
    } else if (event.target.classList.contains('btnBackToMenu') && permissionToSkip){
        playSoundBtnClick()
        gameWindow.style = gameWindow.style.cssText + "display: none";
        await gameOver('backToMenuFromResultWindow');
    }
})
lvlMapWindow.addEventListener('click', async (event)=>{
    if (event.target.classList.contains('lvl') || event.target.parentNode.classList.contains('lvl')){
        playSoundBtnClick()
        for (let i in lvlMap)
            // рівень відкритий
            if ((event.target == lvlMap[i] || event.target.parentNode == lvlMap[i]) && Number(progressData[i][0]) == 1){
                selectLvl = i;
                updateLvlMap(false);
                await changeWindow(lvlMapWindow, gameWindow);
                startGame();
            }
            // рівень закритий
            else if ((event.target == lvlMap[i] || event.target.parentNode == lvlMap[i]) && Number(progressData[i][0]) == 0){
                console.log('lvl № '+i+' is closed');
                let msg = event.target.children[2].cloneNode(true);
                msg.style = msg.style.cssText + "display: block; top: 0; transition-duration: 2.5s; opacity: 1;";
                event.target.append(msg);
                setTimeout(()=> msg.style = msg.style.cssText + "top: -300%; opacity: 0;", 50);
                setTimeout(()=>{ msg.style = msg.style.cssText + "display: none;"; msg.remove(); }, 2400);
            }
    } else if (event.target.classList.contains('btnBackToMenu')){
        playSoundBtnClick()
        await changeWindow(lvlMapWindow, menuWindow);
    }
})
helpWindow.addEventListener('click', async (event)=>{
    if (event.target.classList.contains('btnBackToMenu')){
        playSoundBtnClick()
        await changeWindow(helpWindow, menuWindow);
    }
})
// завантаження рівня та початок гри
function startGame(){
    gameWindow.style = gameWindow.style.cssText +
    "background: url('../img/lvlBG"+(Number(selectLvl)+1)+".jpg') 0 0/100% 100% no-repeat;";
    // if (musicVolume == 1){
    //     mainThemeSound.pause();
    //     if (selectLvl < 2)
    //         lvlSound1_2.play();
    //     else if (selectLvl > 1 && selectLvl < 4)
    //         lvlSound3_4.play();
    //     else if (selectLvl > 3)
    //         lvlSound5_6.play();
    // }
    permissionToPlay = true;
    launchGame(lvlList[selectLvl]);
}


// ON GAME FUNCTIONS //
// відпрацювання натискань (камені, кнопки інтерфейсу)
gameWindow.addEventListener('click', async (event)=>{
    if (event.target.classList.contains('rock') && permissionToPlay === true && permissionToClick === true)
        await onClickRockFunction(event)

    else if (event.target.classList.contains('btnRestart') && permissionToPlay === true && permissionToClick === true){
        playSoundBtnClick()
        if (userDevice === 'pc'){
            event.target.style = event.target.style.cssText + "transform: scale(1)";
            gameWindow.style = gameWindow.style.cssText + "cursor: default";
        }
        await changeWindow(gameWindow, gameWindow);
        startGame();
    }

    else if (event.target.classList.contains('btnBackToMenu') && permissionToPlay === true && permissionToClick === true){
        playSoundBtnClick()
        await gameOver('backToMenuFromGame');
    }
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
                await changeWindow(gameWindow, lvlMapWindow);
                break;
            }
            case 'backToMenuFromResultWindow':{
                await changeWindow(gameOverWindow, lvlMapWindow);
                break;
            }
        }
        // // changed music
        // if (selectLvl < 2)
        //     lvlSound1_2.pause();
        // else if (selectLvl > 1 && selectLvl < 4)
        //     lvlSound3_4.pause();
        // else if (selectLvl > 3)
        //     lvlSound5_6.pause();
        // mainThemeSound.play();
    }
}
// вікно результатів гри та їх підрахунок
async function resultOfGame(score, stars){
    permissionToSkip = false;
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

    if ((Number(selectLvl)+1) <= lvlList.length){
        if (lvlList[(Number(selectLvl)+1)].starsCountToOpen <= countStars)
            btnNextInResult.style = btnNextInResult.style.cssText +
            "background: url('../img/btnNext.png') 0 0/100% 100% no-repeat";
        else
            btnNextInResult.style = btnNextInResult.style.cssText +
            "background: url('../img/btnNextLock.png') 0 0/100% 100% no-repeat";
    } else {
        console.log('це був останній рівень');
        btnNextInResult.style = btnNextInResult.style.cssText + "display: none";
    }
    
    gameOverWindow.style = gameOverWindow.style.cssText + "display: flex";
    onWinSound.play();
    addScoreSound.volume = 0.1;
    let volumeAddcount = 0.9/(score/10); // крок збільшення гучності нархування очок
    let timeAddScore = 2000/(score/10); // очки будуть нараховуватися за 2 с. в не залежності від їх кількості
    setTimeout(async ()=>{        
        if (score > 0){
            for (let i = 0; i < score; i += 10){
                await new Promise((resolve)=>{
                    setTimeout(()=>{
                        scoreCountInResult.textContent = i;
                        if (SoundVolume != 0){
                            addScoreSound.play();
                            if (addScoreSound.volume < 0.9)
                                addScoreSound.volume += volumeAddcount;
                        }
                        resolve('done')
                    }, timeAddScore)
                })   
            }
            permissionToSkip = true;
        } else
            scoreCountInResult.textContent = score;
    }, 100);
}

import { gameOver, permissionToPlay, SoundVolume} from './main.js';

const onGetStarSound = new Audio("../sound/wii.wav");
const bubbleSound = new Audio("../sound/bubbleSound_3.mp3");
const bubbleSound2 = new Audio("../sound/bubbleSound_3.mp3");
const bubbleSound3 = new Audio("../sound/bubbleSound_3.mp3");

const node_taskList = document.getElementsByClassName('taskList')[0];
const taskItem = document.getElementsByClassName('taskItem')[0];
const starsNode = document.getElementsByClassName("progressBar")[0].getElementsByClassName("star");
const progressBar = document.getElementsByClassName('bar')[0];
const popUpPoints = document.getElementsByClassName('popUpPoints')[0];
const rock = document.getElementsByClassName('rock')[0];
const gameField = document.getElementsByClassName('gameField')[0];
let rocksArr = [[-1, 0, 0, 0, -1], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [-1, 0, 0, 0, -1]];
let destroyRocksArr = [[-1, 0, 0, 0, -1], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [-1, 0, 0, 0, -1]];
let taskList = {}, taskRocks = null, taskBlocks = null, doTaskRocks = false, doTaskBlocks = false;
let rockSize = 50, rockGap = 10, margine = 10, bgColor = 'white', currentScore = 0, maxScore = 1000, starsCounter = 0;
let oldSelectRockI = null, oldSelectRockJ = null, newSelectRockI = null, newSelectRockJ = null;
export let permissionToClick = true;

// налаштування та запуск гри (з меню)
export async function setupAndLaunch(getLvlTask){
    switch(SoundVolume){
        case 1:{
            onGetStarSound.volume = 1;
            bubbleSound.volume = 1;
            bubbleSound2.volume = 1;
            bubbleSound3.volume = 1;
            break;
        }
        case 0:{
            onGetStarSound.volume = 0;
            bubbleSound.volume = 0;
            bubbleSound2.volume = 0;
            bubbleSound3.volume = 0;
            break;
        }
    }    
    
    starsCounter = 0;
    for (let i in taskList.rocks)
        taskList.rocks[i].remove();
    taskList = {};

    maxScore = getLvlTask.maxScore;
    if (getLvlTask.rocks !== null){
        taskRocks = {};
        taskList.rocks = {};
        for (let i in getLvlTask.rocks){
            taskRocks[i] = getLvlTask.rocks[i];
            taskList.rocks[i] = getLvlTask.rocks[i];
        }
        doTaskRocks = true;
    }
    if (getLvlTask.blocks !== null){
        taskBlocks = {};
        taskList.blocks = {};
        for (let i in getLvlTask.blocks){
            taskBlocks[i] = getLvlTask.blocks[i];  
            taskList.blocks[i] = getLvlTask.blocks[i];  
        }     
        doTaskBlocks = true;
    }
    start();    
}

// запуск гри
function start(){
    // налаштування фону
    gameField.style = gameField.style.cssText + "width: "+(rocksArr.length*(rockSize+rockGap)+margine)+"px; "+
    "height: "+(rocksArr.length*(rockSize+rockGap)+margine)+"px";

    // гасимо зірочки
    starsNode[0].style = starsNode[0].style.cssText + "opacity: 0.3; transform: scale(1)";
    starsNode[1].style = starsNode[1].style.cssText + "opacity: 0.3; transform: scale(1)";
    starsNode[2].style = starsNode[2].style.cssText + "opacity: 0.3; transform: scale(1)";

    for (let i in taskList.rocks){
        let x = taskList.rocks[i];
        taskList.rocks[i] = taskItem.cloneNode(true);
        switch(i){
            case '1':{
                taskList.rocks[i].style = taskList.rocks[i].style.cssText +
                "background: url('../img/bubble_1.png') 0 0/100% 100% no-repeat";
                break;
            }
            case '2':{
                taskList.rocks[i].style = taskList.rocks[i].style.cssText +
                "background: url('../img/bubble_2.png') 0 0/100% 100% no-repeat";
                break;
            }
            case '3':{
                taskList.rocks[i].style = taskList.rocks[i].style.cssText +
                "background: url('../img/bubble_3.png') 0 0/100% 100% no-repeat";         
                break;
            }
            case '4':{  
                taskList.rocks[i].style = taskList.rocks[i].style.cssText + 
                "background: url('../img/bubble_4.png') 0 0/100% 100% no-repeat";           
                break;
            }
        }
        taskList.rocks[i].children[0].textContent = 'X'+x;
        node_taskList.append(taskList.rocks[i]);
    }    
    taskItem.remove();   


    if (rocksArr[0][1] === 0 || rocksArr[0][1] === null){
        for (let i = 0; i < rocksArr.length; i++)
            for (let j = 0; j < rocksArr[0].length; j++){
                if (rocksArr[i][j] != -1){
                    // create new rock
                    rocksArr[i][j] = rock.cloneNode(true);
        
                    // set color, position and size of rock
                    let x = Math.random();
                    if (x >= 0.75){
                        bgColor = 'red';
                        rocksArr[i][j].dataset.typeRock = '1';
                    } else if (x >= 0.5){
                        bgColor = 'green';
                        rocksArr[i][j].dataset.typeRock = '2';
                    } else if (x >= 0.25){
                        bgColor = 'yellow';
                        rocksArr[i][j].dataset.typeRock = '3';
                    } else {
                        bgColor = 'darkblue';
                        rocksArr[i][j].dataset.typeRock = '4';
                    }        
                    rocksArr[i][j].style = rocksArr[i][j].style.cssText + "background-color: "+bgColor;
                    rocksArr[i][j].style = rocksArr[i][j].style.cssText + "width: " +rockSize+ "px; height: " +rockSize+"px;";
                    rocksArr[i][j].style = rocksArr[i][j].style.cssText + "top: " +(i*(rockSize+rockGap)+margine)+
                    "px; left: " +(j*(rockSize+rockGap)+margine)+"px";
        
                    // added rock to field
                    gameField.append(rocksArr[i][j]);
                }
            }
            // for (let i in rocksArr)
            //     for (let j in rocksArr[0])
            //      console.log(rocksArr[i][j]);
        rock.remove();        
    }
    setTimeout(()=>{restartGame()}, 200);   
}

// натискання на камінь
export async function onClickRock(event){
    // якщо нема дозволу клікати прериваємо виконання функції
    if (permissionToClick === false)
        return false;
    else
        permissionToClick = false;
    
    // визначаємо на який камінь за массиву натиснули
    for (let i = 0; i < rocksArr.length; i++)
        for (let j = 0; j < rocksArr[0].length; j++)
            if (rocksArr[i][j] === event.target){
                newSelectRockI = i; newSelectRockJ = j;
            }
    
    // якщо це перший вибраний камінь то записуємо його позицію в масиві
    if (oldSelectRockI === null){
        oldSelectRockI = newSelectRockI; oldSelectRockJ = newSelectRockJ;
        rocksArr[oldSelectRockI][oldSelectRockJ].style = rocksArr[oldSelectRockI][oldSelectRockJ].style.cssText +
        "transform: scale(1.2); box-shadow: 0px 5px 10px 2px rgba(0, 0, 0, 0.8);";
    }
    //  якщо це другий камінь то викликаємо свап першого та другого каменів
    else if (oldSelectRockI !== null && (newSelectRockI !== oldSelectRockI || newSelectRockJ !== oldSelectRockJ) ) {
        rocksArr[oldSelectRockI][oldSelectRockJ].style = rocksArr[oldSelectRockI][oldSelectRockJ].style.cssText +
            "transform: scale(1); border: none; box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.5);";
        await swapRock(newSelectRockI, newSelectRockJ, false);
        // console.log('something after await swapRock in onClickRock function');
        newSelectRockI = null; newSelectRockJ = null;
        oldSelectRockI = null; oldSelectRockJ = null;
    }
    //  якщо знову вибрано той самий камінь
    else if (oldSelectRockI !== null && newSelectRockI === oldSelectRockI && newSelectRockJ === oldSelectRockJ){
        rocksArr[oldSelectRockI][oldSelectRockJ].style = rocksArr[oldSelectRockI][oldSelectRockJ].style.cssText +
            "transform: scale(1); border: none; box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.5);";
        newSelectRockI = null; newSelectRockJ = null;
        oldSelectRockI = null; oldSelectRockJ = null;
    }
    permissionToClick = true;
    // console.log('(onClick function)permissionStatus = '+permissionToClick);
}

// рух каменів
async function swapRock(i, j, backSwap){
    // перевірка, рухати можна лише сусідні камені
    if (backSwap !== true &&
        ((oldSelectRockI !== i && oldSelectRockJ !== j) ||
        ((oldSelectRockI+oldSelectRockJ)-(i+j) > 1) ||
        ((oldSelectRockI+oldSelectRockJ)-(i+j) < -1)))
        return false;

    // swap on massiv
    let tempRock = rocksArr[i][j];
    rocksArr[i][j] = rocksArr[oldSelectRockI][oldSelectRockJ];
    rocksArr[oldSelectRockI][oldSelectRockJ] = tempRock;

    let i2 = oldSelectRockI, j2 = oldSelectRockJ;

    // update positions
    rocksArr[i][j].style = rocksArr[i][j].style.cssText + "top: " +(i*(rockSize+rockGap)+margine)+
        "px; left: " +(j*(rockSize+rockGap)+margine)+"px";
    rocksArr[i2][j2].style = rocksArr[i2][j2].style.cssText + "top: " +(i2*(rockSize+rockGap)+margine)+
        "px; left: " +(j2*(rockSize+rockGap)+margine)+"px";
                
    let timer = 100;
    return new Promise(async (resolve, reject) => {
        setTimeout(async() =>{
            if (backSwap !== true){
                if (await checkField(true) === false){
                    timer = 550;
                    setTimeout(function(){swapRock(i, j, true)}, 500);
                }
            }
            setTimeout(() =>{
                // console.log('end swap | backSwap='+backSwap);
                resolve("готово!")
            }, backSwap ? 0 : timer)
        }, 500)
      });
}

// перевірка складених рядочків
async function checkField(afterSwap){
    if (permissionToPlay === true){
        
    permissionToClick = false;
    // console.log('(checkgield f 0)permissionStatus = '+permissionToClick)
    let anyCoincidence = false;
    // перевірка по рядках та ставпчиках
    for (let i = 0; i < rocksArr.length; i++){
        let contInRow = 0, countInColumn = 0;
        for (let j = 0; j < rocksArr[0].length; j++){
            // console.log(i+'/'+j)
            if ((j-1) < 0){
                // console.log('skip')
                continue;
            }
            // перевірка на співпадання каменів у..
            if (rocksArr[i][j] != -1 && rocksArr[i][j-1] != -1){
                // console.log('first = '+i+'/'+j)
                // ..рядку
                if (j !== 0 && rocksArr[i][j].dataset.typeRock === rocksArr[i][j-1].dataset.typeRock)
                    contInRow++;
                else if (j !== 0 && rocksArr[i][j].dataset.typeRock !== rocksArr[i][j-1].dataset.typeRock)
                    contInRow = 0;
            }
            if (rocksArr[j][i] != -1 && rocksArr[j-1][i] != -1){
                // console.log('sec = '+i+'/'+j)
                // ..стовпчику
                if (j !== 0 && rocksArr[j][i].dataset.typeRock === rocksArr[j-1][i].dataset.typeRock)
                    countInColumn++;
                else if (j !== 0 && rocksArr[j][i].dataset.typeRock !== rocksArr[j-1][i].dataset.typeRock)
                    countInColumn = 0;    
            }
            // знайдено співпадіння у рядку          
            if (contInRow > 1){
                // переносимо зібраний рядок до массиву знищених
                for (let x = contInRow; x > -1; x--)
                    destroyRocksArr[i][j-x] = rocksArr[i][j-x];
                anyCoincidence = true;
            }
            // знайдено співпадіння у стовпчику   
            if (countInColumn > 1){
                // переносимо зібраний рядок до массиву знищених
                for (let x = countInColumn; x > -1; x--)
                    destroyRocksArr[j-x][i] = rocksArr[j-x][i];
                anyCoincidence = true;
            }
        }
    }

    // дивимось результат перевірки
    if (anyCoincidence === false){
        if (afterSwap !== true){
            permissionToClick = true;
            // console.log('(checkgield f 1)permissionStatus = '+permissionToClick)
        }
        return false;
    }
    else if (anyCoincidence === true){
        await addScore();
        await destroyRocks(afterSwap);
        if (afterSwap !== true){
            permissionToClick = true;
            // console.log('(checkgield f 2)permissionStatus = '+permissionToClick)
        }
    }
    }
}

// додавання очків за знищені камні
async function addScore(restart){
    let counter = 0;
    // скидання прогрессу до нуля, якщо рестар
    if (restart === true){
        currentScore = 0;
        progressBar.style = progressBar.style.cssText + "width: 0%";
        popUpPoints.style = popUpPoints.style.cssText + "opacity: 0; top: -10%; left: 0%"
    }
    // рахуємо прогресс
    else if (restart !== true && currentScore < maxScore){
        for (let i = 0; i < destroyRocksArr.length; i++){
            for (let j = 0; j < destroyRocksArr[0].length; j++){
                if (destroyRocksArr[i][j] !== null && destroyRocksArr[i][j] !== 0){
                    counter++;
                }
            }
        }    
        currentScore += (counter * 10);
        let progres = Math.round(currentScore/maxScore*100);

        console.log('check to get stars.. progres = '+progres+'; starsCounter = '+starsCounter);
        // первіряємо чи отримали зірку
        if (progres >= 100){
            progres = 100;
            if (starsCounter == 2){
                starsCounter = 3;
                onGetStarSound.play();
                starsNode[2].style = starsNode[2].style.cssText + "opacity: 1; transform: scale(1.3)";
                setTimeout(()=>
                starsNode[2].style = starsNode[2].style.cssText + "transform: scale(1)"
                , 400)
            }
        }
        else if (progres >= 65 && starsCounter == 1){
            starsCounter = 2;
            onGetStarSound.play();
            starsNode[1].style = starsNode[1].style.cssText + "opacity: 1; transform: scale(1.3)";
            setTimeout(()=>
            starsNode[1].style = starsNode[1].style.cssText + "transform: scale(1)"
            , 400)
        }
        else if (progres >= 30 && starsCounter == 0){
            starsCounter = 1;
            onGetStarSound.play();
            starsNode[0].style = starsNode[0].style.cssText + "opacity: 1; transform: scale(1.3)";
            setTimeout(()=>
            starsNode[0].style = starsNode[0].style.cssText + "transform: scale(1)"
            , 400)
        }
    
        // демонструємо прогресс (полоска та число)
        progressBar.style = progressBar.style.cssText + "width: "+progres+"%";
        popUpPoints.textContent = '+'+(counter * 10);
        popUpPoints.style = popUpPoints.style.cssText + "opacity: 1; top: -120%; left: "+progres+"%";
        setTimeout(()=>{
            popUpPoints.style = popUpPoints.style.cssText + "opacity: 0; top: -10%";
        }, 1000)
    }
    else if (currentScore >= maxScore){
        // console.log('you already have a max score of this lvl');
    }
}

// знищення каменів
async function destroyRocks(checkFieldAfterSwap, ifRestart){
    // check task progress
    if (!ifRestart){
        // bubbleSound.play();
        await checkTask();
    }

    // приховуємо камені, видаляємо з основного массиву та створюємо нові
    for (let i = 0; i < destroyRocksArr.length; i++)
        for (let j = 0; j < destroyRocksArr[0].length; j++){
            if (destroyRocksArr[i][j] !== 0 && destroyRocksArr[i][j] !== null && destroyRocksArr[i][j] !== -1){
                rocksArr[i][j] = null;
                destroyRocksArr[i][j].style = destroyRocksArr[i][j].style.cssText +
                "opacity: 0; transform: scale(2);";
                setTimeout(function(){
                    // set color
                    let x = Math.random();
                    if (x >= 0.75){
                        bgColor = "background: url('../img/bubble_1.png') 0 0/100% 100% no-repeat;";
                        destroyRocksArr[i][j].dataset.typeRock = '1';
                    } else if (x >= 0.5){
                        bgColor = "background: url('../img/bubble_2.png') 0 0/100% 100% no-repeat;";
                        destroyRocksArr[i][j].dataset.typeRock = '2';
                    } else if (x >= 0.25){
                        bgColor = "background: url('../img/bubble_3.png') 0 0/100% 100% no-repeat;";
                        destroyRocksArr[i][j].dataset.typeRock = '3';
                    } else {
                        bgColor = "background: url('../img/bubble_4.png') 0 0/100% 100% no-repeat;";
                        destroyRocksArr[i][j].dataset.typeRock = '4';
                    }  
                    destroyRocksArr[i][j].style = destroyRocksArr[i][j].style.cssText +
                    "transform: scale(1); top: -100px; "+bgColor;
                }, 500);
                if (!ifRestart){                    
                    bubbleSound.play(),
                    setTimeout(()=>bubbleSound2.play(), 50)
                    setTimeout(()=>bubbleSound3.play(), 100)
                }
            }
        }

    // pause for end animation
    await new Promise((resolve)=>{setTimeout(()=>{resolve('done')}, 600)})

    // замощуємо нові камені    
    for (let i = (rocksArr.length-1); i > -1; i--)
        for (let j = (rocksArr[0].length-1); j > -1; j--){
            if (rocksArr[i][j] === null){
                // console.log('find null in = '+i+'/'+j);
                // пошук каменю для переміщення в основному масиві
                if (i > 0){                    
                    for (let i2 = (i-1); i2 > -1; i2--){
                        if (rocksArr[i2][j] !== null && rocksArr[i2][j] !== -1){
                            // console.log('(mainArr) find new rock in = '+i2+'/'+j);
                            rocksArr[i][j] = rocksArr[i2][j];
                            rocksArr[i2][j] = null;
                            rocksArr[i][j].style = rocksArr[i][j].style.cssText + "top: " +(i*(rockSize+rockGap)+margine)+
                                "px; left: " +(j*(rockSize+rockGap)+margine)+"px";
                            // console.log(rocksArr[i][j]);
                            // console.log(rocksArr[i2][j]);
                            break;
                        }
                    }
                }
                // пошук каменю для переміщення в масиві знищених (якщо не знайдено в попередньому способі)
                if (rocksArr[i][j] === null){
                    for (let i2 = 0; i2 < rocksArr.length; i2++){
                        if (destroyRocksArr[i2][j] !== null && destroyRocksArr[i2][j] !== 0 && destroyRocksArr[i2][j] !== -1){
                            // console.log('(destroyArr) find new rock in = '+i2+'/'+j);
                            // console.log(rocksArr[i][j]);
                            // console.log(destroyRocksArr[i2][j]);
                            rocksArr[i][j] = destroyRocksArr[i2][j];
                            destroyRocksArr[i2][j] = null;
                            setTimeout(()=>{
                                rocksArr[i][j].style = rocksArr[i][j].style.cssText + "top: " +(i*(rockSize+rockGap)+margine)+
                                    "px; left: " +(j*(rockSize+rockGap)+margine)+"px; opacity: 1;";
                            }, 600);
                            break;
                        }
                    }
                }
            }           
        }

    // pause for end animation
    await new Promise((resolve)=>{setTimeout(()=>{resolve('done')}, 1500)})
    await checkField(checkFieldAfterSwap);
}

// перевірка прогрессу виконання завдань цього рівня
async function checkTask(){
    // перевірка прогрессу виконання завдання з каменями
    if (taskRocks !== null){
        for (let i = 0; i < destroyRocksArr.length; i++){
            for (let j = 0; j < destroyRocksArr[0].length; j++){
                // знаходимо знищений камін
                if (destroyRocksArr[i][j] !== 0 && destroyRocksArr[i][j] !== null && destroyRocksArr[i][j] !== -1){                    
                    // порівнюємо його тип з типами цільових камені в завданні
                    if (doTaskRocks){
                        let anyProgress = false;
                        let activeTask = 0;
                        for (let k in taskRocks){  
                            if (taskRocks[k] > 0)
                                activeTask += taskRocks[k];
                            if (taskRocks[k] > 0 && k === rocksArr[i][j].dataset.typeRock){
                                anyProgress = true;
                                taskRocks[k]--;
                                activeTask--;
                                if (taskRocks[k] >= 0){
                                    taskList.rocks[k].children[0].textContent = 'X'+taskRocks[k];
                                    taskList.rocks[k].style = taskList.rocks[k].style.cssText + "transform: scale(1.1)";
                                    setTimeout(()=>{
                                        taskList.rocks[k].style = taskList.rocks[k].style.cssText +
                                        "transform: scale(1)"
                                    }, 300);
                                }
                                if (taskRocks[k] === 0){
                                    console.log('ви виконали завдання з каменями № '+k);
                                    taskList.rocks[k].style = taskList.rocks[k].style.cssText + "transform: scale(1.2)";
                                    setTimeout(()=>{
                                        taskList.rocks[k].style = taskList.rocks[k].style.cssText +
                                        "transform: scale(0.85); opacity: 0.1;"
                                    }, 400);
                                }
                            }
                        }
                        if (anyProgress === true && activeTask === 0){
                            // console.log('ви виконали усі завдання з какменями..')
                            doTaskRocks = false;
                            if (doTaskBlocks === false)
                                setTimeout(()=>{ gameOver('win', currentScore, starsCounter) }, 1000);
                        }
                    }
                }
            }
        }
    }
    // перевірка прогрессу виконання завдання з блоками
    if (taskBlocks !== null){

    }
}

async function restartGame(){
    // кнопка не активна якщо щось відбувається
    if (permissionToClick === false)
        return false;
    permissionToClick = false;

    for (let i = 0; i < destroyRocksArr.length; i++){
        for (let j = 0; j < destroyRocksArr[0].length; j++){
            destroyRocksArr[i][j] = rocksArr[i][j];
        }
    }
    await addScore(true);
    await destroyRocks(false, true);
    permissionToClick = true;
}

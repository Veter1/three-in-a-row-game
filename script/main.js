// window.onload = function(){ alert('усі ресурси успішно завантажені'); }
// window.onerror = function(msg, url, lineNo, columnNo, error) { alert(msg+'\n'+url+'\n'+lineNo+'\n'+columnNo+'\n'+error); }

let body = document.body;
let progressBar = document.getElementsByClassName('bar')[0];
let popUpPoints = document.getElementsByClassName('popUpPoints')[0];
let rock = document.getElementsByClassName('rock')[0];
let gameField = document.getElementsByClassName('gameField')[0];
let rocksArr = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
let destroyRocksArr = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
const scoreToWin = 1000;
let rockSize = 50, rockGap = 10, margine = 10, bgColor = 'white', currentScore = 0;
let oldSelectRockI = null, oldSelectRockJ = null, newSelectRockI = null, newSelectRockJ = null, permissionToClick = true;

start();

// запуск гри
function start(){
    // налаштування фону
    gameField.style = gameField.style.cssText + "width: "+(rocksArr.length*(rockSize+rockGap)+margine)+"px; "+
    "height: "+(rocksArr.length*(rockSize+rockGap)+margine)+"px";
    // створення каменів
    for (let i = 0; i < rocksArr.length; i++)
        for (let j = 0; j < rocksArr[0].length; j++){
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
    rock.remove();
    setTimeout(()=>{restartGame()}, 200);   
}

// натискання на камінь
async function onClickRock(event){
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
        "transform: scale(1.2); border: solid 0.3px black; box-shadow: 0px 5px 10px 2px rgba(0, 0, 0, 0.8);";
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
    permissionToClick = false;
    // console.log('(checkgield f 0)permissionStatus = '+permissionToClick)
    let anyCoincidence = false;
    // перевірка по рядках та ставпчиках
    for (let i = 0; i < rocksArr.length; i++){
        let contInRow = 0, countInColumn = 0;
        for (let j = 0; j < rocksArr[0].length; j++){
            // перевірка на співпадання каменів у..
            // ..рядку
            if (j !== 0 && rocksArr[i][j].dataset.typeRock === rocksArr[i][j-1].dataset.typeRock)
                contInRow++;
            else if (j !== 0 && rocksArr[i][j].dataset.typeRock !== rocksArr[i][j-1].dataset.typeRock)
                contInRow = 0;
            // ..стовпчику
            if (j !== 0 && rocksArr[j][i].dataset.typeRock === rocksArr[j-1][i].dataset.typeRock)
                countInColumn++;
            else if (j !== 0 && rocksArr[j][i].dataset.typeRock !== rocksArr[j-1][i].dataset.typeRock)
                countInColumn = 0;

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
    else if (restart !== true){
        for (let i = 0; i < destroyRocksArr.length; i++){
            for (let j = 0; j < destroyRocksArr[0].length; j++){
                if (destroyRocksArr[i][j] !== null && destroyRocksArr[i][j] !== 0){
                    counter++;
                }
            }
        }    
        currentScore += (counter * 10);
        let progres = Math.round(currentScore/scoreToWin*100);    
    
        // демонструємо прогресс (полоска та число)
        progressBar.style = progressBar.style.cssText + "width: "+progres+"%";
        popUpPoints.textContent = '+'+(counter * 10);
        popUpPoints.style = popUpPoints.style.cssText + "opacity: 1; top: -120%; left: "+progres+"%";
        setTimeout(()=>{
            popUpPoints.style = popUpPoints.style.cssText + "opacity: 0; top: -10%"
        }, 1000)
    }
}

async function destroyRocks(checkFieldAfterSwap){
    // приховуємо камені, видаляємо з основного массиву та створюємо нові
    for (let i = 0; i < destroyRocksArr.length; i++)
        for (let j = 0; j < destroyRocksArr[0].length; j++){
            if (destroyRocksArr[i][j] !== 0 && destroyRocksArr[i][j] !== null){
                rocksArr[i][j] = null;
                destroyRocksArr[i][j].style = destroyRocksArr[i][j].style.cssText +
                "opacity: 0; transform: scale(2);";
                setTimeout(function(){
                    // set color
                    let x = Math.random();
                    if (x >= 0.75){
                        bgColor = 'red';
                        destroyRocksArr[i][j].dataset.typeRock = '1';
                    } else if (x >= 0.5){
                        bgColor = 'green';
                        destroyRocksArr[i][j].dataset.typeRock = '2';
                    } else if (x >= 0.25){
                        bgColor = 'yellow';
                        destroyRocksArr[i][j].dataset.typeRock = '3';
                    } else {
                        bgColor = 'darkblue';
                        destroyRocksArr[i][j].dataset.typeRock = '4';
                    }  
                    destroyRocksArr[i][j].style = destroyRocksArr[i][j].style.cssText +
                    "transform: scale(1); top: -100px;"+" background-color: "+bgColor;
                }, 500);                
            }
        }

    // pause for end animation
    await new Promise((resolve)=>{setTimeout(()=>{resolve('done')}, 600)})
    // console.log('goTo create rocks');

    // замощуємо нові камені    
    for (let i = (rocksArr.length-1); i > -1; i--)
        for (let j = (rocksArr[0].length-1); j > -1; j--){
            if (rocksArr[i][j] === null){
                // console.log('find null in = '+i+'/'+j);
                // пошук каменю для переміщення в основному масиві
                if (i > 0){                    
                    for (let i2 = (i-1); i2 > -1; i2--){
                        if (rocksArr[i2][j] !== null){
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
                        if (destroyRocksArr[i2][j] !== null && destroyRocksArr[i2][j] !== 0){
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

async function restartGame(){
    // кнопка не активна якщо щось відбувається
    if (permissionToClick === false)
        return false;
    permissionToClick = false;

    console.log('start of Restart');
    for (let i = 0; i < destroyRocksArr.length; i++){
        for (let j = 0; j < destroyRocksArr[0].length; j++){
            destroyRocksArr[i][j] = rocksArr[i][j];
        }
    }
    await addScore(true);
    await destroyRocks(false);
    console.log('end of Restart');
    permissionToClick = true;
}

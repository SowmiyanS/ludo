console.log("hello ludo");

const topQuad = document.getElementById("topQuad");
const leftQuad = document.getElementById("leftQuad");
const rightQuad = document.getElementById("rightQuad");
const bottomQuad = document.getElementById("bottomQuad");
let tQ; // top Quadrant
let lQ; // left Quadrant
let rQ; // right Quadrant
let bQ; // bottom Quadrant
const topLeftHome = document.getElementById("p1Home");
const topRightHome = document.getElementById("p2Home");
const bottomLeftHome = document.getElementById("p3Home");
const bottomRightHome = document.getElementById("p4Home");
let tLH; // top left home
let tRH; // top right home
let bLH; // bottom left home
let bRH; // bottom right home
let homes = [];
let HTMLHomes = [topLeftHome, topRightHome, bottomLeftHome, bottomRightHome];

let player1;
let player2;
let player3;
let player4;

// Decoration but they cause the elements to clip
const p1Fn = document.getElementById("one");
const p2Fn = document.getElementById("two");
const p3Fn = document.getElementById("three");
const p4Fn = document.getElementById("four");

// Real DOM elements so they stay at exact positions
const p1Fnsh = document.createElement("div");
const p2Fnsh = document.createElement("div");
const p3Fnsh = document.createElement("div");
const p4Fnsh = document.createElement("div");
p1Fnsh.classList.toggle("oneFnsh");
p2Fnsh.classList.toggle("twoFnsh");
p3Fnsh.classList.toggle("threeFnsh");
p4Fnsh.classList.toggle("fourFnsh");
// See p1Fnsh up top
p1Fn.appendChild(p1Fnsh);
p2Fn.appendChild(p2Fnsh);
p3Fn.appendChild(p3Fnsh);
p4Fn.appendChild(p4Fnsh);

let dices = [[], [], [], []];
const p1Dice = document.getElementById("p1Dice");
const p2Dice = document.getElementById("p2Dice");
const p3Dice = document.getElementById("p3Dice");
const p4Dice = document.getElementById("p4Dice");
let diceIndex = [0, 0, 0, 0];
let isRolledOnce = [false, false, false, false];
// For the move back argument passing
let revAnim;
let revOrderCell;

let crowns = ["images/crown1.png", "images/crown2.png", "images/crown3.png", "images/crown4.png"];
let crownIdx = 0;

class Quadrant {
    outerCells = [];
    innerCells = [];
    constructor(player, htmlOuterCells, htmlInnerCells) {
        this.player = player;
        for(let htmlCell of htmlOuterCells) {
            this.outerCells.push(htmlCell);
        }
        for(let htmlCell of htmlInnerCells) {
            this.innerCells.push(htmlCell);
        }
    }
}

class Home {
    bases = [];
    constructor(player, htmlBases) {
        this.player = player;
        for(let htmlBase of htmlBases) {
            this.bases.push(htmlBase);
        }
    }
}

class Player {
    coins = [];
    pos = [];
    quadrant = ['home', 'home', 'home', 'home'];
    order = [];
    anim = [];
    animIndex = [0, 0, 0, 0];
    constructor(player, htmlCoins, homeEls, order, anim) {
        this.player = player;
        this.order = order;
        this.anim = anim;
        for(let htmlCoin of htmlCoins) {
            this.coins.push(htmlCoin);
        }
        //debugger;
        for(let home of homeEls) {
            this.pos.push(home);
        }
    }
    start() {
        // show the coins to UI
        for(let i = 0;i < this.coins.length;i++) {
            this.pos[i].appendChild(this.coins[i]);
        }
        // So they show in home bases
    }
    moveBack(coin) {
        return new Promise((resolve, reject) => {
            //debugger;
            let index = this.coins.indexOf(coin);
            //debugger;
            // play animation
            let animat = revAnim;
            this.animIndex[index]--;
            let next_cell = revOrderCell;
            this.coins[index].classList.toggle(animat);
            setTimeout(() => {
                // successfully played animation
                // now update DOM and store
                this.coins[index].classList.toggle(animat);
                this.pos[index].removeChild(this.coins[index]);
                next_cell.appendChild(this.coins[index]);   

                this.pos[index] = next_cell;
                resolve();
            }, "400");
        });
    }
    moveHome(coin) {
        return new Promise((resolve, reject) => {
            //this.coins[index].classList.toggle("tr");
            let index = this.coins.indexOf(coin);
            let plrIdx = gtPlrIdx(this.player);
            // finding the first free index in the home bases
            // here player has the attackeR player ref
            // and this has the attackeD player ref
            let freeIdxInHme = -1;
            for(let i = 0;i < 4;i++) {
                if(homes[plrIdx].bases[i].childElementCount === 0) {
                    freeIdxInHme = i;
                }
            }
            if(freeIdxInHme === -1) {
                console.log("error no free index found in the home bases");
                reject("error no free index found in the home bases");
            }
            let next_cell = homes[plrIdx].bases[freeIdxInHme];
            //let next_cell = revOrderCell;
            let next_x = next_cell.getBoundingClientRect().x - this.pos[index].getBoundingClientRect().x;
            let next_y = next_cell.getBoundingClientRect().y - this.pos[index].getBoundingClientRect().y;
            //debugger;
            this.coins[index].classList.add("tr");
            this.coins[index].style.transform = "translate("+next_x+"px, "+next_y+"px)";
            setTimeout(() => {
                // successfully played animation
                // now update DOM and store
                this.coins[index].classList.remove("tr");
                this.coins[index].style.transform = "";
                this.pos[index].removeChild(this.coins[index]);
                next_cell.appendChild(this.coins[index]);

                this.pos[index] = next_cell;
                //this.quadrant[index] = this.player;
                // code to stack the coins
                //this.coins[index].style.transform = "translate("+-(index+1)+"px,"+-(index+1)+"px)";
                this.quadrant[index] = "home";
                resolve();
            }, "1100");
        });
    }
    move(coin) {
        return new Promise((resolve, reject) => {
            // move the element
            let index = this.coins.indexOf(coin);
            if(this.quadrant[index] === "home") {
                //this.coins[index].classList.toggle("tr");
                let plrIdx = gtPlrIdx(this.player);
                if(diceIndex[plrIdx] < 5) {
                    console.log("Cannot bring coin from base if the number is not 6");
                    resolve("insufficientMoves");
                    return;
                }
                // To compensate the diceIndex is zero index set the 56 animation count to 57
                else if(diceIndex[plrIdx] > (57 - this.animIndex[index])) {
                    //debugger;
                    console.log("Cannot move this coid since the moves don't match!!!");
                    resolve("surplusMoves");
                    return;
                }
                else {
                    console.log("ok moves");
                }
                let next_cell = this.order[this.order.indexOf(this.pos[index])+1];
                let next_x = next_cell.getBoundingClientRect().x - this.pos[index].getBoundingClientRect().x;
                let next_y = next_cell.getBoundingClientRect().y - this.pos[index].getBoundingClientRect().y;
                //debugger;
                this.coins[index].classList.add("tr");
                this.coins[index].style.transform = "translate("+next_x+"px, "+next_y+"px)";
                this.quadrant[index] = this.player;
                playAudio("sounds/out.mp3");
                setTimeout(() => {
                    // successfully played animation
                    // now update DOM and store
                    this.coins[index].classList.remove("tr");
                    this.coins[index].style.transform = "";
                    this.pos[index].removeChild(this.coins[index]);
                    next_cell.appendChild(this.coins[index]);

                    this.pos[index] = next_cell;
                    //this.quadrant[index] = this.player;
                    // code to stack the coins
                    //this.coins[index].style.transform = "translate("+-(index+1)+"px,"+-(index+1)+"px)";
                    resolve();
                }, "1100");
            }
            else if(this.animIndex[index] == this.anim.length - 1) {
                // reached the end
                // play animation
                if(this.animIndex[index] == this.anim.length - 1) {
                    coin.removeEventListener("click", handleClick);
                    //return;
                }
                let animat = this.anim[this.animIndex[index]++];
                let next_cell = this.order[this.order.indexOf(this.pos[index])+1];

                let plrIdx = gtPlrIdx(this.player);
                //debugger;
                this.coins[index].classList.toggle(animat);
                this.quadrant[index] = "win";
                playAudio("sounds/win.mp3");
                setTimeout(() => {
                    // successfully played animation
                    // now update DOM and store
                    this.coins[index].classList.toggle(animat);
                    this.pos[index].removeChild(this.coins[index]);
                    this.coins[index].style.position = "absolute";
                    next_cell.appendChild(this.coins[index]);   

                    this.pos[index] = next_cell;
                    let wcnt = 0;
                    for(let i = 0;i < 4;i++) {
                        if(win[plrIdx][i]) {
                            wcnt++;
                        }
                    }
                    if(wcnt == 3) {
                        // TODO show the crown
                        setCrown(this);
                        console.log("Player "+(plrIdx+1)+" Won!!");
                    }
                    resolve("reachFinish");
                }, "400");
            }
            else {
                // play animation
                let animat = this.anim[this.animIndex[index]++];
                let next_cell = this.order[this.order.indexOf(this.pos[index])+1];
                //debugger;
                this.coins[index].classList.toggle(animat);
                this.quadrant[index] = this.player;
                playAudio("sounds/move.mp3");
                setTimeout(() => {
                    // successfully played animation
                    // now update DOM and store
                    this.coins[index].classList.toggle(animat);
                    this.pos[index].removeChild(this.coins[index]);
                    next_cell.appendChild(this.coins[index]);   

                    this.pos[index] = next_cell;
                    resolve();
                }, "400");
            }
        });
    }
}

function generateCells(quad, player) {
    let n = 13;
    let htmlOuterCells = [];
    for(let i = 0;i < n;i++) {
        let cell = document.createElement("div");
        cell.classList.add("cell");
        if(i === 3) {
            cell.classList.add("Safe");
        }
        if(i === 6) {
            cell.classList.add(player+"Arw"); // p2arw - player 2 arw style
        }
        if(i === 8) {
            cell.classList.add(player+"Cell");
        }

        htmlOuterCells.push(cell);
    }
    let htmlInnerCells = [];
    n = 5;
    for(let i = 0;i < n;i++) {
        let cell = document.createElement("div");
        cell.classList.add(player+"Cell"); // p2cell - player 2 cell

        htmlInnerCells.push(cell);
    }
    // Spread the html elements in a single list so we can pick them with order list later!!!
    let tempHE = [...htmlOuterCells, ...htmlInnerCells];
    let tempQ = new Quadrant(player, htmlOuterCells, htmlInnerCells);
    let order = [];

    // This ordering is for grid layout to work
    switch(player) {
        case "p2":
            tQ = tempQ
            order = [5, 6, 7, 4, 13, 8, 3, 14, 9, 2, 15, 10, 1, 16, 11, 0, 17, 12];
            break;
        case "p1":
            lQ = tempQ;
            order = [7, 8, 9, 10, 11, 12, 6, 13, 14, 15, 16, 17, 5, 4, 3, 2, 1, 0];
            break;
        case "p4":
            rQ = tempQ;
            order = [0, 1, 2, 3, 4, 5, 17, 16, 15, 14, 13, 6, 12, 11, 10, 9, 8, 7];
            break;
        case "p3":
            bQ = tempQ;
            order = [12, 17, 0, 11, 16, 1, 10, 15, 2, 9, 14, 3, 8, 13, 4, 7, 6, 5];
            break;
        default:
            console.log("error invalid player while generating quadrants");
    }

    // finally we have the unique order in which each element is layed out we can create DOM list.
    for(let i of order) {
        quad.appendChild(tempHE[i]);
    }
}

function generateHomes(home, player) {
    let htmlBases = [];
    let n = 4;
    for(let i = 0;i < n;i++) {
        let base = document.createElement("div");
        htmlBases.push(base);
        home.appendChild(base);
    }
    let tempH = new Home(player, htmlBases);
    switch(player) {
        case "p1":
            tLH = tempH;
            homes.push(tLH);
            break;
        case "p2":
            tRH = tempH; 
            homes.push(tRH);
            break;
        case "p3":
            bLH = tempH;
            homes.push(bLH);
            break;
        case "p4":
            bRH = tempH;
            homes.push(bRH);
            break;
        default:
            console.log("error invalid player while generating homes");
    }
}

function generateCoins(homeEls, player) {
    let coins = [];
    for(let i = 0;i < 4;i++) {
        let coin = document.createElement("div");
        coin.classList.add(player+"Coin");
        //coin.innerHTML = "&#128522;";
        //coin.style.transform = "translate(0px,"+-(i+0)+"px)";
        coin.addEventListener("click", handleClick);
        coins.push(coin);
    }
    // order of htmlDOM cell in which the coins must travel to finish
    let order = [];
    switch(player) {
        case "p1":
            order = [...lQ.outerCells.slice(8, 13), ...tQ.outerCells, ...rQ.outerCells, ...bQ.outerCells, ...lQ.outerCells.slice(0, 7), ...lQ.innerCells, p1Fnsh];
            anim = ['mr', 'mr', 'mr', 'mr', 'mur', 'mu', 'mu', 'mu', 'mu', 'mu', 'mr', 'mr', 'md', 'md', 'md', 'md', 'md', 'mdr', 'mr', 'mr', 'mr', 'mr', 'mr', 'md', 'md', 'ml', 'ml', 'ml', 'ml', 'ml', 'mdl', 'md', 'md', 'md', 'md', 'md', 'ml', 'ml', 'mu', 'mu', 'mu', 'mu', 'mu', 'mul', 'ml', 'ml', 'ml', 'ml', 'ml', 'mu', 'mr', 'mr', 'mr', 'mr', 'mr', 'mr'];
            player1 = new Player(player, coins, homeEls.bases, order, anim);
            break;
        case "p2":
            order = [...tQ.outerCells.slice(8, 13), ...rQ.outerCells, ...bQ.outerCells, ...lQ.outerCells, ...tQ.outerCells.slice(0, 7), ...tQ.innerCells, p2Fnsh];
            anim = ['md', 'md', 'md', 'md', 'mdr', 'mr', 'mr', 'mr', 'mr', 'mr', 'md', 'md', 'ml', 'ml', 'ml', 'ml', 'ml', 'mdl', 'md', 'md', 'md', 'md', 'md', 'ml', 'ml', 'mu', 'mu', 'mu', 'mu', 'mu', 'mul', 'ml', 'ml', 'ml', 'ml', 'ml', 'mu', 'mu', 'mr', 'mr', 'mr', 'mr', 'mr', 'mur', 'mu', 'mu', 'mu', 'mu', 'mu', 'mr', 'md', 'md', 'md', 'md', 'md', 'md'];
            player2 = new Player(player, coins, homeEls.bases, order, anim);
            break;
        case "p3":
            order = [...bQ.outerCells.slice(8, 13), ...lQ.outerCells, ...tQ.outerCells, ...rQ.outerCells, ...bQ.outerCells.slice(0, 7), ...bQ.innerCells, p3Fnsh];
            anim = ['mu', 'mu', 'mu', 'mu', 'mul', 'ml', 'ml', 'ml', 'ml', 'ml', 'mu', 'mu', 'mr', 'mr', 'mr', 'mr', 'mr', 'mur', 'mu', 'mu', 'mu', 'mu', 'mu', 'mr', 'mr', 'md', 'md', 'md', 'md', 'md', 'mdr', 'mr', 'mr', 'mr', 'mr', 'mr', 'md', 'md', 'ml', 'ml', 'ml', 'ml', 'ml', 'mdl', 'md', 'md', 'md', 'md', 'md', 'ml', 'mu', 'mu', 'mu', 'mu', 'mu', 'mu'];
            player3 = new Player(player, coins, homeEls.bases, order, anim);
            break;
        case "p4":
            order = [...rQ.outerCells.slice(8, 13), ...bQ.outerCells, ...lQ.outerCells, ...tQ.outerCells, ...rQ.outerCells.slice(0, 7), ...rQ.innerCells, p4Fnsh];
            anim = ['ml', 'ml', 'ml', 'ml', 'mdl', 'md', 'md', 'md', 'md', 'md', 'ml', 'ml', 'mu', 'mu', 'mu', 'mu', 'mu', 'mul', 'ml', 'ml', 'ml', 'ml', 'ml', 'mu', 'mu', 'mr', 'mr', 'mr', 'mr', 'mr', 'mur', 'mu', 'mu', 'mu', 'mu', 'mu', 'mr', 'mr', 'md', 'md', 'md', 'md', 'md', 'mdr', 'mr', 'mr', 'mr', 'mr', 'mr', 'md', 'ml', 'ml', 'ml', 'ml', 'ml', 'ml'];
            player4 = new Player(player, coins, homeEls.bases, order, anim);
            break;
    }
}

async function handleClick() {
    if(mutex === false) {
        mutex = true;
        //debugger;
        let plrIdx = gtPlrIdx(currentPlayer.player);
        let coinIdx = currentPlayer.coins.indexOf(this);
        if(coinIdx === -1) {
            console.log("Active Player " + (plrIdx + 1) +"'s coins are only allowed to move");
            mutex = false;
            return;
        }
        console.log(currentPlayer.coins[coinIdx]);
        if(isRolledOnce[plrIdx] === false) {
            console.log("Roll the die before you can move");
            mutex = false;
            return;
        }
        // get the count form the player's dice currently showing
        let cnt = diceIndex[plrIdx] + 1;
        //debugger;
        if(currentPlayer.quadrant[coinIdx] === "home") {
            if(cnt > 5) {
                let msg = await currentPlayer.move(this);
                console.log("Getting coin : "+coinIdx+" out of home");
                mutex = false;
                isRolledOnce[plrIdx] = false;
                //switchPlayer();
                return;
            }
            else {
                console.log("cannot move player due to insufficient moves!!");
                //switchPlayer();
                //debugger;
                mutex = false;
                isRolledOnce[plrIdx] = true;
                // see if no other moveable players are there
                let moveAbleCoins = 0;
                for(let i = 0;i < 4;i++) {
                    if(currentPlayer.quadrant[i] !== "home" && currentPlayer.quadrant[i] !== "win") {
                        moveAbleCoins++;
                    }
                }
                if(moveAbleCoins > 1) {
                    console.log("move other coins");
                    isRolledOnce[plrIdx] = true;
                    mutex = false;
                    return;
                }
                else {
                    console.log("No other coin is moveable so taking decision automatically");
                    if(cnt > 5) {
                        console.log("extra move");
                        isRolledOnce[plrIdx] = false;
                        mutex = false;
                        //switchPlayer();
                        return;
                    }
                    else {
                        isRolledOnce[plrIdx] = false;
                        mutex = false;
                        switchPlayer();
                        return;
                    }
                }
                return;
            }
        }
        else {
            if(diceIndex[plrIdx] >= (56 - currentPlayer.animIndex[coinIdx])) {
                //debugger;
                console.log("Cannot move this coin since the moves don't match!!!");
                //resolve("surplusMoves");
                mutex = false;
                isRolledOnce[plrIdx] = true;
                // check if there are other free coins if there are then retry otherwise switchplayer
                let moveAbleCoins = 0;
                for(let i = 0;i < 4;i++) {
                    if(currentPlayer.quadrant[i] !== "home" && currentPlayer.quadrant[i] !== "win") {
                        moveAbleCoins++;
                    }
                }
                if(moveAbleCoins > 1) {
                    console.log("move other coins");
                    isRolledOnce[plrIdx] = true;
                    mutex = false;
                    return;
                }
                else {
                    console.log("No other coin is moveable so taking decision automatically");
                    if(cnt > 5) {
                        console.log("extra move");
                        isRolledOnce[plrIdx] = true;
                        mutex = false;
                        //switchPlayer();
                        return;
                    }
                    else {
                        isRolledOnce[plrIdx] = false;
                        mutex = false;
                        switchPlayer();
                        return;
                    }
                }

                mutex = false;
                return;
            }
            for(let i = 0;i < cnt;i++) { 
                //debugger;
                //if(isSafe()) {
                //}
                let msg = await currentPlayer.move(this);
                console.log("move "+i+" finished with message: "+msg);
                if(msg === "reachFinish") {
                    console.log("successfully reached the finish update the win array;");
                    win[plrIdx][coinIdx] = true;
                    isRolledOnce[plrIdx] = false;
                    mutex = false;
                    // give extra move
                    //switchPlayer();
                    return;
                }
                mutex = false;
            }
            checkPosition(currentPlayer.coins[coinIdx]);
            if(cnt > 5) {
                console.log("extra move");
                isRolledOnce[plrIdx] = false;
                mutex = false;
            }
            else {
                switchPlayer();
                isRolledOnce[plrIdx] = false;
                mutex = false;
            }
        }
    }
    else {
        console.log("cannot perform operation when lock is hold");
        //isRolledOnce[plrIdx] = false;
        return;
    }
}

function generateDice(playerIdx) {
    let dice1 = document.createElement("div");
    let n = 1;
    for(let i = 0;i < n;i++) {
        let mark = document.createElement("div");
        mark.classList.toggle("dice");
        dice1.appendChild(mark);
    }
    dice1.id = "d1";
    dices[playerIdx].push(dice1);

    let dice2 = document.createElement("div");
    n = 2;
    for(let i = 0;i < n;i++) {
        let mark = document.createElement("div");
        mark.classList.toggle("dice");
        dice2.appendChild(mark);
    }
    dice2.id = "d2";
    dices[playerIdx].push(dice2);

    let dice3 = document.createElement("div");
    n = 3;
    for(let i = 0;i < n;i++) {
        let mark = document.createElement("div");
        mark.classList.toggle("dice");
        dice3.appendChild(mark);
    }
    dice3.id = "d3";
    dices[playerIdx].push(dice3);

    let dice4 = document.createElement("div");
    n = 4;
    for(let i = 0;i < n;i++) {
        let mark = document.createElement("div");
        mark.classList.toggle("dice");
        dice4.appendChild(mark);
    }
    dice4.id = "d4";
    dices[playerIdx].push(dice4);
    
    let dice5 = document.createElement("div");
    n = 5;
    for(let i = 0;i < n;i++) {
        let mark = document.createElement("div");
        mark.classList.toggle("dice");
        dice5.appendChild(mark);
    }
    dice5.id = "d5";
    dices[playerIdx].push(dice5);

    let dice6 = document.createElement("div");
    n = 6;
    for(let i = 0;i < n;i++) {
        let mark = document.createElement("div");
        mark.classList.toggle("dice");
        dice6.appendChild(mark);
    }
    dice6.id = "d6";
    dices[playerIdx].push(dice6);
}

generateCells(topQuad, "p2");
generateCells(leftQuad, "p1");
generateCells(rightQuad, "p4");
generateCells(bottomQuad, "p3");


generateHomes(topLeftHome, "p1");
generateHomes(topRightHome, "p2");
generateHomes(bottomLeftHome, "p3");
generateHomes(bottomRightHome, "p4");

generateCoins(tLH, "p1");
generateCoins(tRH, "p2");
generateCoins(bLH, "p3");
generateCoins(bRH, "p4");

generateDice(0);
generateDice(1);
generateDice(2);
generateDice(3);


// Get Dice Index function used to get the index of player so we can index the current dice index that is showen for that player
function gtDceIdx(pnDice) {
    let id = pnDice.id;
    switch(id) {
        case "p1Dice":
            return 0;
        case "p2Dice":
            return 1;
        case "p3Dice":
            return 2;
        case "p4Dice":
            return 3;
        default:
            return -1;
    }
}
function gtDce(playerIndex) {
    switch(playerIndex) {
        case 0:
            return p1Dice;
        case 1:
            return p2Dice;
        case 2:
            return p3Dice;
        case 3:
            return p4Dice;
        default:
            console.log("player index not valid to get player's dice");
            return null;
    }
}
function gtPlrIdx(playerString) {
    switch(playerString) {
        case "p1":
            return 0;
        case "p2":
            return 1;
        case "p3":
            return 2;
        case "p4":
            return 3;
        default:
            return -1;
    }
}
function gtInvsAnim(anim) {
    switch(anim) {
        case "mr":
            return "ml";
        case "ml":
            return "mr";
        case "mu":
            return "md";
        case "md":
            return "mu";
        case "mul":
            return "mdr";
        case "mur":
            return "mdl";
        case "mdl":
            return "mur";
        case "mdr":
            return "mul";
        default:
            return -1;
    }
}
function showDice(pnDice) {
    let idx = gtDceIdx(pnDice);
    let randIndex = Math.round(Math.random()*5);
    pnDice.appendChild(dices[idx][randIndex]);
    diceIndex[idx] = randIndex;
    pnDice.addEventListener("click", showRandomDice);
}
function gtRndAni() {
    let n = Math.round(Math.random()*10);
    if(n > 5) {
        return "rr"
    }
    else {
        return "rl";
    }
}
function showRandomDice() {
    //debugger;
    let idx = gtDceIdx(this);
    if(mutex === false) {
        mutex = true;
        if(isRolledOnce[idx] === true) {
            console.log("You Already Roled the dice!!!");
            mutex = false;
            return;
        }
        if(idx !== gtPlrIdx(currentPlayer.player)) {
            console.log("Only active player : "+(idx+1)+" is allowed to roll the dice!!!");
            mutex = false;
            return;
        }
        this.classList.remove("rr");
        this.classList.remove("rl");
        this.nextDice = function() {
            //debugger;
            this.removeChild(dices[idx][diceIndex[idx]]);
            let randCount = Math.round(Math.random()*10);
            let nextIndex;
            for(let i = 0;i < randCount;i++) {
                nextIndex = (diceIndex[idx] + 1) % 6;
                diceIndex[idx] = nextIndex;
            }
            this.appendChild(dices[idx][diceIndex[idx]]);
        }
        // play some animation
        //show random number
        this.classList.toggle(gtRndAni());
        playAudio("sounds/dice"+(Math.round(Math.random())+1)+".mp3");
        setTimeout(()=>{
            this.nextDice();
            this.classList.toggle("rr");
            this.classList.toggle("rl");
            setTimeout(()=>{
                this.nextDice();
                this.classList.toggle("rr");
                this.classList.toggle("rl");
                setTimeout(()=>{
                    this.nextDice();
                    this.classList.toggle("rr");
                    this.classList.toggle("rl");
                    setTimeout(()=>{
                        this.nextDice();
                        this.classList.toggle("rr");
                        this.classList.toggle("rl");
                        setTimeout(()=>{
                            this.nextDice();
                            this.classList.toggle("rr");
                            this.classList.toggle("rl");
                            setTimeout(()=> {
                                isRolledOnce[idx] = true;
                                mutex = false;
                                // check if all the coins of player is inside home before you can skip turn
                                let allInHome = true;
                                for(let i = 0;i < 4;i++) {
                                    if(currentPlayer.quadrant[i] !== "home") {
                                        allInHome = false;
                                        break;
                                    }
                                }
                                if(allInHome) {
                                    if(diceIndex[idx] < 5) {
                                        console.log("less than 6 detected i : "+ idx);
                                        // Change the isRolledOnce to false for current player's dice
                                        isRolledOnce[idx] = false;
                                        // so we automatically change current player
                                        switchPlayer();
                                    }
                                    else {
                                        console.log(diceIndex[idx]);
                                        //isRolledOnce[idx] = false;
                                    }
                                }
                                else {
                                    console.log("few coins of the players are already out of home so let him click on valid coins");
                                    let moveableCoins = 0;
                                    for(let i = 0;i < 4;i++) {
                                        if(currentPlayer.quadrant[i] !== "home" && currentPlayer.quadrant[i] !== "win") {
                                            moveableCoins++;
                                        }
                                    }
                                    if(moveableCoins === 1) {
                                        console.log("I can move a coin");
                                        if(diceIndex[idx] >= 5) {
                                            console.log("The player may take any of the home coin now");
                                            let homeCoins = 0;
                                            for(let i = 0;i < 4;i++) {
                                                if(currentPlayer.quadrant[i] === "home") {
                                                    homeCoins++;
                                                }
                                            }
                                            if(homeCoins === 0) {
                                                console.log("Already win player detected switching player!");
                                                isRolledOnce[idx] = false;
                                                switchPlayer();
                                            }
                                            else {
                                                // give chance to choose a coin in home base
                                                isRolledOnce[idx] = true;
                                            }
                                        }
                                        else {
                                            let moveableCoin;
                                            for(let i = 0;i < 4;i++) {
                                                if(currentPlayer.quadrant[i] !== "home" && currentPlayer.quadrant[i] !== "win") {
                                                    moveableCoin = currentPlayer.coins[i];
                                                }
                                            }
                                            console.log(moveableCoin);
                                            isRolledOnce[idx] = true;
                                            moveableCoin.dispatchEvent(new Event("click"));
                                        }
                                    }
                                    else if(moveableCoins === 0) {
                                        console.log("no moveable coin found so check if count is > 5 so we can take some home coins");
                                        let homeCoins = 0;
                                        for(let i = 0;i < 4;i++) {
                                            if(currentPlayer.quadrant[i] === "home") {
                                                homeCoins++;
                                            }
                                        }
                                        if(homeCoins === 0) {
                                            console.log("Already win player detected switching player!");
                                            isRolledOnce[idx] = false;
                                            switchPlayer();
                                        }
                                        else {
                                            // give chance to choose a coin in home base
                                            console.log("we have few home coins check if the dice is big enough");
                                            let homeCoin;
                                            for(let i = 0;i < 4;i++) {
                                                // select any random home coin to move automatically
                                                if(currentPlayer.quadrant[i] === "home") {
                                                    homeCoin = currentPlayer.coins[i];
                                                    break;
                                                }
                                            }
                                            console.log(homeCoin);
                                            isRolledOnce[idx] = true;
                                            homeCoin.dispatchEvent(new Event("click"));
                                        }

                                    }
                                }
                            }, "200");
                        }, "200");
                    }, "200");
                }, "200");
            }, "200");
        }, "200");
    }
    else {
        console.log("Cannot Roll dice until current roll is finished");
    }
    return;
}
function isSafeCell(cell) {
    let posiblts = [];
    for(let i = 0;i < 4;i++) {
        posiblts.push("p"+(i+1)+"Cell");
    }
    for(let i = 0;i < 4;i++) {
        posiblts.push("p"+(i+1)+"Arw");
    }
    let isSafe = false;
    cell.classList.forEach((cl) => {
        for(let i = 0;i < 4;i++) {
            if(cl === posiblts[i]) {
                isSafe = true;
            }
        }
    }); 
    if(cell.classList.contains("Safe") || isSafe) {
        playAudio("sounds/safe.mp3");
        console.log("Detected Safe Place skip check position");
        return true;
    }
    else {
        return false;
    }
}
class Sounds {
    constructor() {
        this.win = new Audio("sounds/win.mp3");
        this.die = new Audio("sounds/die.mp3");
        this.move = new Audio("sounds/move.mp3");
        this.lose1 = new Audio("sounds/lose1.mp3");
        this.lose2 = new Audio("sounds/lose2.mp3");
        this.safe = new Audio("sounds/safe.mp3");
        this.out = new Audio("sounds/out.mp3");
        this.victory1 = new Audio("sounds/victory1.mp3");
        this.victory2 = new Audio("sounds/victory2.mp3");
        this.victory3 = new Audio("sounds/victory3.mp3");
        this.victory4 = new Audio("sounds/victory4.mp3");
        this.dice1 = new Audio("sounds/dice1.mp3");
        this.dice2 = new Audio("sounds/dice2.mp3");
        this.dice1.load();
        this.dice2.load();
        this.win.load();
        this.die.load();
        this.move.load();
        this.lose1.load();
        this.lose2.load();
        this.safe.load();
        this.out.load();
        this.victory1.load();
        this.victory2.load();
        this.victory3.load();
        this.victory4.load();
    }
    getAudio(file) {
        switch(file) {
            case "sounds/win.mp3":
                return this.win;
            case "sounds/die.mp3":
                return this.die;
            case "sounds/move.mp3":
                return this.move;
            case "sounds/lose1.mp3":
                return this.lose1;
            case "sounds/lose2.mp3":
                return this.lose2;
            case "sounds/safe.mp3":
                return this.safe;
            case "sounds/out.mp3":
                return this.out;
            case "sounds/victory1.mp3":
                return this.victory1;
            case "sounds/victory2.mp3":
                return this.victory2;
            case "sounds/victory3.mp3":
                return this.victory3;
            case "sounds/victory4.mp3":
                return this.victory4;
            case "sounds/dice1.mp3":
                return this.dice1;
            case "sounds/dice2.mp3":
                return this.dice2;
            default:
                return null;
        }
    }
}

let sounds = new Sounds();
function playAudio(file) {
    try {
        let audio = sounds.getAudio(file);
        audio.currentTime = 0;
        audio.play();
    }
    catch(err) {
        console.log(err);
    }
}
function setCrown(player) {
    let plr = player.player;
    // update the order (global) variable
    winOrder.push(plr);
    let plrBases = [];
    let plrIdx = 0;
    for(let i = 0;i < 4;i++) {
        if (homes[i].player === plr) {
            plrBases = homes[i].bases;
            plrIdx = i;
            break;
        }
    }
    let cIdx = crownIdx + 1;
    playAudio("sounds/victory"+(cIdx)+".mp3");
    plrBases[0].classList.toggle("fo");
    setTimeout(() => {
        plrBases[0].classList.remove("fo");
        HTMLHomes[plrIdx].removeChild(plrBases[0]);
        plrBases[1].classList.toggle("fo");
        setTimeout(() => {
            plrBases[1].classList.remove("fo");
            HTMLHomes[plrIdx].removeChild(plrBases[1]);
            plrBases[2].classList.toggle("fo");
            setTimeout(() => {
                plrBases[2].classList.remove("fo");
                HTMLHomes[plrIdx].removeChild(plrBases[2]);
                plrBases[3].classList.toggle("fo");
                setTimeout(() => {
                    plrBases[3].classList.remove("fo");
                    HTMLHomes[plrIdx].removeChild(plrBases[3]);
                    // fade in the crown
                    let crown = document.createElement("section");
                    crown.classList.toggle("crown"+(cIdx));
                    crown.classList.toggle("fi");
                    crown.id = "crown";
                    HTMLHomes[plrIdx].appendChild(crown);
                    setTimeout(() => {
                        crown.classList.remove("fi");
                        crown.classList.toggle("fde");
                        setTimeout(() => {
                            crown.classList.remove("fde");
                            //debugger;
                            checkIfAllWon();
                        }, "1000");
                    }, "200");
                }, "200");
            }, "200");
        }, "200");
    }, "200");
    crownIdx++;
    console.log("CROWNIDX ++ ");
}
function checkIfAllWon() {
    let allWon = true;
    for(let i = 0;i < 4;i++) {
        for(let j = 0;j < 4;j++) {
            if(!win[i][j]) {
                allWon = false;
                break;
            }
        }
    }
    if(allWon) {
        // We wait for few seconds and redirect to the win page
        // the win pags should have all the win details like who
        // win first and second etc
        setTimeout(() => {
            // Save the shared data in localstorage
            for(let i = 0;i < 4;i++) {
                localStorage.setItem("w"+(i+1), winOrder[i]);
            }
            window.location.href = "win.html";
        }, "10000");
    }
}
let reOrdered = [false, false, false, false];
function reOrderCoins() {
    // Make the coins of the active player show above all other coins
    let cntPlrIdx = gtPlrIdx(currentPlayer.player);
    for(let i = 0;i < 4;i++) {
        if(reOrdered[cntPlrIdx]) {
            console.log("Reorder already finished!");
            break;
        }
        let HTMLCell = currentPlayer.pos[i];
        let coinCnt = HTMLCell.childElementCount;
        if(coinCnt > 1) {
            console.log("More cells detected so performing the reorder");
            let allCoins = [];
            // Save all the coins in a list so we can remove all and 
            // attach out current player coins first
            for(let j = 0;j < coinCnt;j++) {
                allCoins.push(HTMLCell.childNodes[j]);
            }
            // remove all the coins
            for(let j = 0;j < coinCnt;j++) {
                HTMLCell.removeChild(allCoins[j]);
            }
            let crntPlrCoins = allCoins.filter((coin) => coin.classList.contains(currentPlayer.player+"Coin"));
            let othrPlrCoins = allCoins.filter((coin) => !coin.classList.contains(currentPlayer.player+"Coin"));
            for(let j = 0;j < othrPlrCoins.length;j++) {
                HTMLCell.appendChild(othrPlrCoins[j]);
            }
            for(let j = 0;j < crntPlrCoins.length;j++) {
                HTMLCell.appendChild(crntPlrCoins[j]);
            }
            // Update the reOrdered Value
            reOrdered[cntPlrIdx] = true;
        }
    }
}

showDice(p1Dice);
showDice(p2Dice);
showDice(p3Dice);
showDice(p4Dice);

let currentPlayer = player1;
let mutex = false;
// Creating global win state store and initializing to false
let win = [];
for(let i = 0;i < 4;i++) {
    win.push([]);
    for(let j = 0;j < 4;j++) {
        win[i].push(false);
    }
}
// Used to keep track of the order of winnings
let winOrder = [];

// change the current player in a loop
let players = [player1, player2, player3, player4]; // create the player ordering
let cntPlrIdx = 0;

// function to check if coins are in safe place or not
async function checkPosition(pnCoin) {
    let cidx = currentPlayer.coins.indexOf(pnCoin);
    let cell = currentPlayer.pos[cidx];
    if(isSafeCell(cell)) {
        console.log("safe cell detected");
    }
    else {
        // we can see what are all other coins present in the same cell
        let otherCoins = [];
        let otherPlayers = [...players].filter((player) => player !== currentPlayer);
        for(let player of otherPlayers) {
            for(let i = 0;i < 4;i++) {
                if(player.pos[i] === cell) {
                    //otherCoins.push(player.coins[i]);
                    console.log("sending home: ");
                    //debugger;
                    playAudio("sounds/die.mp3");
                    setTimeout(() => {
                            playAudio("sounds/lose"+(Math.round(Math.random()*1) + 1)+".mp3");
                    }, "1000");
                    let index = player.animIndex[i];
                    // construct the reverse position list and reverse animation list that we can loop normally but we get expected results
                    /*
                     * slice the order list up until the current animIndex
                     * reverse that slice with .toReversed() so not to change the original array
                     * set it to new reversed order that we have to follow
                     */
                    let revOrderLst = [...player.order.slice(0, index).toReversed()];
                    /*
                     * slice the anim list up until the current animIndex
                     * reverse that slice
                     * set it to new reversed anim list
                     */
                    let rAnimLst = [...player.anim.slice(0, index).toReversed()];
                    let revAnimLst = rAnimLst.map((a) => gtInvsAnim(a));
                    player.quadrant[i] = "home";

                    for(let j = 0;j < index;j++) {
                        revAnim = revAnimLst[j];
                        revOrderCell = revOrderLst[j];
                        let msg = await player.moveBack(player.coins[i]);
                    }
                    let mst = await player.moveHome(player.coins[i]);
                }
            }
            
        }
    }
    //if(otherCoins.length > 0) {
    //    //for(let coin of otherCoins) {
    //        // send these coins to home
    //        console.log("sending home: ");
    //        console.log(coin);
    //    //}
    //}
    //else {
    //    console.log("all clear");
    //}
}
// Testing purpose so setting a mock game

player1.start();
player2.start();
player3.start();
player4.start();

function move_plr_n_cn_x(plrIdx, n, x) {
    return new Promise(async function(resolve, reject) {
        cntPlrIdx = plrIdx;
        // Set the current Player this is apparently used in some places to check and
        // is straight up beleived that this is 100 % the player we are at
        // like check position function and handle click function
        currentPlayer = players[plrIdx];
        cntDce = gtDce(plrIdx);
        cntDce.classList.toggle("hlgt");
        cntDce.removeChild(dices[plrIdx][diceIndex[plrIdx]]);
        // Set the dice index array to bind it with number
        diceIndex[plrIdx] = n;
        // Then Set the p1Dice div to show 6 number die
        cntDce.appendChild(dices[plrIdx][diceIndex[plrIdx]]);
        isRolledOnce[plrIdx] = true;
        player = players[plrIdx];
        //mutex = true
        if(player.quadrant[x] == "home") {
            let msg = await player.move(player.coins[x]);
            console.log("move from home finished with message: "+msg);
            resolve();
        }
        else {
            for(let i = 0;i < n + 1;i++) { 
                //player.move(player.coins[x]);
                let msg = await player.move(player.coins[x]);
                // DEBUG console.log("move "+i+" finished with message: "+msg);
                if(msg === "reachFinish") {
                    console.log("successfully reached the finish update the win array;");
                    win[plrIdx][x] = true;
                    //switchPlayer();
                    //isRolledOnce[plrIdx] = false;
                    //return;
                    resolve();
                }
                //mutex = false;
                isRolledOnce[plrIdx] = false;
            }
            resolve();
        }
        cntDce.classList.remove("hlgt");
    });
}
// So the player 1 is active dieactivating the defence mechanisms
//player1.move(player1.coins[0]);
async function mock_game() {
    let msg;
    // Move the player 1
    //await move_plr_n_cn_x(0, 5, 0);
    //checkPosition(currentPlayer.coins[0]);
    //for(let l = 0;l < 4;l++) {
    //    for(let j = 0;j < 4;j++) {
    //        for(let i = 0;i < 10;i++) {
    //            await move_plr_n_cn_x(l, 5, j);
    //        }
    //        await move_plr_n_cn_x(l, 1, j);
    //    }
    //}
    // TEST THE SEND HOME BASE ERROR
    //await move_plr_n_cn_x(0, 5, 3);
    //await move_plr_n_cn_x(0, 0, 3);
    //await move_plr_n_cn_x(2, 5, 3);
    //await move_plr_n_cn_x(2, 5, 3);
    //await move_plr_n_cn_x(2, 5, 3);
    //await move_plr_n_cn_x(2, 1, 3);
    //checkPosition(currentPlayer.coins[3]);
    //await move_plr_n_cn_x(0, 5, 0);
    //await move_plr_n_cn_x(0, 1, 0);
    //await move_plr_n_cn_x(2, 0, 3);
    //checkPosition(currentPlayer.coins[3]);
    //setTimeout(async function() {
    //    for(let i = 0;i < 4;i++) {
    //        await move_plr_n_cn_x(0, 5, i);
    //    }
    //    for(let i = 0;i < 4;i++) {
    //        await move_plr_n_cn_x(0, 2, i);
    //    }
    //    await move_plr_n_cn_x(2, 0, 3);
    //    checkPosition(currentPlayer.coins[3]);
    //}, "2700");
    // TEST THE REORDER PLAYER COINS
    await move_plr_n_cn_x(0, 5, 0);
    await move_plr_n_cn_x(0, 5, 1);
    await move_plr_n_cn_x(0, 5, 2);
    await move_plr_n_cn_x(0, 5, 3);
    await move_plr_n_cn_x(2, 5, 3);
    await move_plr_n_cn_x(2, 5, 3);
    await move_plr_n_cn_x(2, 5, 3);
    await move_plr_n_cn_x(2, 0, 3);
    isRolledOnce[0] = false;
    currentPlayer = player1;
    reOrderCoins();
    reOrdered[0] = "false";
}
//move_plr_n_cn_x(0, 6, 0);
//move_plr_n_cn_x(0, 6, 0);
//move_plr_n_cn_x(0, 6, 0);
//player1.move(player1.coins[1]);

//mock_game();

cntDce = gtDce(cntPlrIdx);
// highlight the current dice
cntDce.classList.toggle("hlgt");

function switchPlayer() {
    // before switching the player the check Position must be called
    // unhighlight previous dice
    let cntDce = gtDce(cntPlrIdx);
    cntDce.classList.remove("hlgt");
    // find the next player
    let nextPlrIdx = (cntPlrIdx + 1) % 4;
    let prevPlrIdx = cntPlrIdx;
    //console.log("setting current player to : ");
    currentPlayer = players[nextPlrIdx];
    //console.dir(currentPlayer);
    cntPlrIdx = nextPlrIdx;
    //console.log("Active Player changed to : "+(cntPlrIdx + 1));
    cntDce = gtDce(cntPlrIdx);
    // highlight the current dice
    cntDce.classList.toggle("hlgt");
    // Make the coins of the active player show above all other coins
    reOrdered[prevPlrIdx] = "false";
    reOrderCoins();
}

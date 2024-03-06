    
    const boards = document.querySelector('.Boards')
    const gridSize = 10;
    let playerTurn
    let gameOver = false;
    playerHits=[]
    computerHits=[]
    playerMisses=[]
    computerMisses=[]
    const hitSound = document.getElementById('hit-sound');
    const missSound = document.getElementById('miss-sound');
    const sunkSound = document.getElementById('sunk-sound');
    const victorySound = document.getElementById('victory-sound');
    const lostSound = document.getElementById('lost-sound');
    const clickSound = document.getElementById('click-sound');
    
    
    //  Helper Functions
    

   
    function initializeBoard(user) {
      // For each user(player/computer) create a div element and call it board, give it a id of user
      let board = document.createElement('div')
      board.classList.add('board')
      board.id = user

        //Loop through the board and create 100 tiles and append them to the board
        for(let i=0; i<gridSize *gridSize; i++){
          const tile = document.createElement('div');
          tile.classList.add('tile')
          tile.id = i
          board.append(tile)
        }
          
        
      //Add the board to a another div which will have two boards. 
      boards.append(board)
      
      
    }

    // Call this to make it happen. 
    initializeBoard('player')
    initializeBoard('computer')

    

      
    //Create a Ship object with an Id, length and orientation

    class Ship{
      constructor(id, length, orientation){
        this.id =id,
        this.length=length,
        this.orientation= orientation
      }
    
    }

    // Render available ships with different lengths and ids.
    const availableShips = [
      new Ship ( 0, 2, 'horizontal'),
      new Ship ( 1, 3, 'horizontal'),
      new Ship ( 2, 3, 'horizontal'),
      new Ship ( 3, 4, 'horizontal'),
      new Ship ( 4, 5, 'horizontal'),
     ]
     
    
     let undropped

    
    // COMPUTER SHIP PLACEMENT 

  
    function generateStartOrientation() {
      // Generate a random start orientation (true for horizontal, false for vertical)
      return Math.random() < 0.5;
    }
  
      function generateStartIndex() {
      // Generate a random start index within the grid size
      return Math.floor(Math.random() * Math.floor(gridSize * gridSize));
    }

    //For every tile that has a ship, add class of ship, taken and ship id
  
    function placeShip(shipTiles, shipId) {
    // Place the ship by adding appropriate classes to ship tiles
      shipTiles.forEach(shipTile => {
          //If a tile has a ship on it add class ship
          shipTile.classList.add('ship')
          shipTile.classList.add('taken')
          shipTile.classList.add(`${shipId}`)

      });
    }     


    
    function calculateLegalStart(startOrientation, startIndex, shipLength) {
      // Calculate a legal starting position based on ship length and orientation
      const maxIndex = gridSize * gridSize;
      if (startOrientation) {
          return startIndex <= maxIndex - shipLength ? startIndex : maxIndex - shipLength;
      } else {
          return startIndex <= maxIndex - shipLength * gridSize ? startIndex : startIndex - shipLength * gridSize + gridSize;
      }
  }

  // Create an array of ship tiles
  function createShipTiles(tiles, legalStart, isHorizontal, shipLength) {
    const shipTiles = [];

    
    legalStart = parseInt(legalStart);
    for (let i = 0; i < shipLength; i++) {
        const index = isHorizontal ? legalStart + i : legalStart + i * gridSize;
        shipTiles.push(tiles[index]);
    }
    return shipTiles;
  }


  
  function checkBounds(shipTiles, isHorizontal) {
      // Check if all ship tiles fall within the bounds of the grid when it is placed on the grid 
      if (isHorizontal) {
          return shipTiles.every((shipTile, i) =>
              shipTiles[0].id % gridSize !== gridSize - (shipTiles.length - (i + 1)));
      } else {
          return shipTiles.every((shipTile, i) =>
              shipTiles[0].id < gridSize * gridSize - gridSize + (gridSize * i + 1));
      }
  }




  function checkAvailability(shipTiles) {
      // Check if all ship tiles are available to place
      return shipTiles.every(shipTile => !shipTile.classList.contains('taken'));
  }

  // Place the ship on the board
  function putShipTile(user,ship,startId) {

      const tiles = document.querySelectorAll(`#${user} div`);
      const startOrientation =  generateStartOrientation();
      const startIndex = startId ? startId : generateStartIndex();
      const shipId= ship.id
  
      const isHorizontal = user === 'player' ? ship.orientation === 'horizontal': startOrientation;
      const legalStart = calculateLegalStart(isHorizontal, startIndex, ship.length);
      const shipTiles = createShipTiles(tiles, legalStart, isHorizontal, ship.length);
      const withinBounds = checkBounds(shipTiles, isHorizontal);
      const canPlace = checkAvailability(shipTiles);
  
      
      if (withinBounds && canPlace) {
          placeShip(shipTiles, shipId)
      } else {
          if (user === 'computer') putShipTile('computer', ship)// Retry if not within bounds or cannot place
          // if (user === 'player') undropped= true //The corresponding ship is not being able to drop 
          if (user === 'player') {
            undropped= true 
            alert("Not a valid placement, make sure entire ship is on the board!")} //The corresponding ship is not being able to drop 
      }
  }

  
  // For each available ship, place them on computer's board accordingly
  function placeAllComputerShips(){
      availableShips.forEach(ship => putShipTile('computer', ship))
      }

  

  placeAllComputerShips();



     
 
 

//Create Draggable Ships 
function createShips(ships) {
      // Get the container element
      const shipContainer = document.querySelector('.Ships')

      // Iterate through each ship in the ships array
       ships.forEach((ship,index) => {
        // Create a div element for the ship
        const shipElement = document.createElement('div');
        shipElement.textContent=`${index}`
        shipElement.style.color='white'
        shipElement.style.display = 'flex';
        shipElement.style.alignItems = 'center';
        shipElement.style.justifyContent = 'center';
        shipElement.style.fontWeight = 'bold';
        // Assign a class to the ship element (for styling)
        shipElement.classList.add('ship-replica');
        shipElement.id = index;
        // Set the width of the ship based on its length
        shipElement.style.width = `${ship.length * 40}px`; 
        // Set the ship's orientation to horizontal by default
        shipElement.dataset.orientation = 'horizontal';
        shipElement.draggable = true;
        shipElement.addEventListener('dragstart', handleDragStart);
        shipElement.addEventListener('click', handleClick);
        // Append the ship element to the container
        shipContainer.appendChild(shipElement);

        
      });

    }

    
    createShips(availableShips);
    
    //Keep track of which ship is being dragged
    let draggedShip
    let isRotated =false;
    const playerTiles = document.querySelectorAll('#player div')

    playerTiles.forEach(playerTile => {
      playerTile.addEventListener('dragover', handleDragOver)
      playerTile.addEventListener('drop', handleDrop)
    })

    

    function handleClick(event) {
      // Get the ship element that was clicked
      const shipElement = event.target;
  
      // Change the ship's orientation between horizontal and vertical
      const currentOrientation = shipElement.dataset.orientation;
      shipElement.dataset.orientation = currentOrientation === 'horizontal' ? 'vertical' : 'horizontal';
      shipElement.style.transform = `rotate(${currentOrientation === 'horizontal' ? '90deg' : '0'})`;
      isRotated = true;
      shipElement.textContent=''
      
  }
  
  function handleDragStart(event) {
      event.dataTransfer.effectAllowed ='move'
      undropped = false;
      draggedShip = event.target;
       
  }

    
  function handleDragOver(e){
    e.preventDefault()
    
  }
  
  
  function handleDrop(event) {
      //Get which tile the cursor move
      const startId = event.target.id;
      // retrieve the ship object based on the ID of the dragged ship.
      const ship = availableShips[draggedShip.id];
      //Set the orientation of the ship based on whether it was rotated during dragging.
      isRotated ? ship.orientation ='vertical' : ship.orientation ='horizontal'
      
      //Reset the isRotated

      isRotated=false
      putShipTile('player', ship, startId);
      if (!undropped) {
          //If the ship is dropped remove from its parent container Ships
          draggedShip.remove();
      }
      clickSound.play()
  }

  const header = document.querySelector('.header')
  const shipsContainer = document.querySelector('.Ships')
  const menu = document.querySelector('.menu')
  const startButton = document.querySelector('.start')
  const turnStatus = document.querySelector('.turn')
  const resetButton = document.querySelector('.reset');
  const gameInfo=  document.getElementById('game-info')


  // When all ships are placed, start the game
  function startGame() {
    
    if(shipsContainer.children.length != 0){
      alert('Place all your ships to start a game!');
      return;
    } else{
      compTiles = document.querySelectorAll('#computer div')
      compTiles.forEach(tile => tile.addEventListener('click', handleUserTurn))
      

    }
      //Modify header

      turnStatus.textContent='Your Turn'
      turnStatus.style.display='block'
      shipsContainer.style.display = 'none';
      menu.style.width ='30%'
      menu.style.margin='35px auto'
      startButton.style.display='none'
      resetButton.style.display='block'
      gameInfo.style.display='none'
    
  }
  
  startButton.addEventListener('click', startGame)
  resetButton.addEventListener('click', resetGame)
  

  function getShipId(classList) {
    return classList.filter(className =>
        !['taken', 'tile', 'hit', 'ship'].includes(className)
    );
}
  

  // USER TURN 

  function handleUserTurn(tile){
    //Check if the game is not over
    if(!gameOver){
      
      //Check if a tile has clicked before
      if (tile.target.classList.contains('hit') || tile.target.classList.contains('miss')) {
        alert('INVALID!Try hitting a different spot')
        return;
      }

      //If it has not been clicked before and contains a ship then add a hit class to tile
      if (tile.target.classList.contains('taken')){
        tile.target.classList.add('hit')
        hitSound.play()
        
        let tileStatus = getShipId(Array.from(tile.target.classList));
        playerHits.push(...tileStatus)
        updateSunkShips('computer', playerHits, parseInt(tileStatus))
        isGameOver('player', playerHits)
        
      } else {
        missSound.play()
        tile.target.classList.add('miss')
        playerMisses.push(tile.target)

      }
  
      updatePlayerScore(playerHits.length, playerMisses.length)
      playerTurn = false
      compTiles = document.querySelectorAll('#computer div')
      compTiles.forEach(tile => tile.removeEventListener('click', handleUserTurn))
      
      
      setTimeout(handleComputerTurn, 500)
    }
  }


  
  //COMPUTER TURN 
  function handleComputerTurn(){
    //Check if the game is not over
    if(!gameOver){
      turnStatus.textContent = 'Computer Turn'
      
      setTimeout (() => {
        //Get a random index where Computer attempted between 0-99
        let computerShot = Math.floor(Math.random() * gridSize * gridSize)
        const playerTiles = document.querySelectorAll('#player div')
        isShip = playerTiles[computerShot].classList.contains('taken')
        isHit = playerTiles[computerShot].classList.contains('hit')

        if (isShip&&isHit){
          
          handleComputerTurn()

        } else if (isShip && !isHit){
          hitSound.play()
          playerTiles[computerShot].classList.add('hit')
          let tileStatus = getShipId(Array.from(playerTiles[computerShot].classList));
          computerHits.push(...tileStatus)
          updateSunkShips('player', computerHits, parseInt(tileStatus))
          isGameOver('computer', computerHits)
         
        }else {
          missSound.play()
          playerTiles[computerShot].classList.add('miss')
          computerMisses.push(playerTiles[computerShot])
        }
        
        updateComputerScore(computerHits.length, computerMisses.length)
      }, 2000)

      
      setTimeout(() => {
        playerTurn = true
        turnStatus.textContent = 'Your Turn'
        compTiles = document.querySelectorAll('#computer div')
        compTiles.forEach(tile => tile.addEventListener('click', handleUserTurn))
      }, 2000)
      
    }
  }

  

  // Function to update the player's score
  function updatePlayerScore(hit,miss) {
  const playerHitElement = document.getElementById('player-hits');
  const playerMissElement = document.getElementById('player-miss');
  playerHitElement.textContent = ` ${hit}`;
  playerMissElement.textContent = ` ${miss}`;


}

  // Function to update the computer's score
  function updateComputerScore(hit,miss) {
    const computerHitElement = document.getElementById('computer-hits');
    const computerMissElement = document.getElementById('computer-miss');
    computerHitElement.textContent = ` ${hit}`;
    computerMissElement.textContent = `${miss}`;
  
  
  }


  //Add a class sunk to a tile and update the appearance of the sunk tiles 

  function updateSunkShips(user, hits, shipId,){
    const myShip = availableShips.find(ship => ship.id === shipId)
    const tiles = document.querySelectorAll(`#${user} div`)
    let shipTiles =[]
    
    // How many times hits array include the ship id
    const hitCount = hits.filter(id => id === shipId.toString()).length
   
    //Check if it is as many time as ship's length
    if(hitCount === myShip.length){
       
       tiles.forEach(tile => {
        if (tile.classList.contains(`${shipId}`)) {
            shipTiles.push(tile);
        }
    });
    
    shipTiles.forEach(tile => {
      tile.classList.add('sunk')
    })
    sunkSound.play()
    }
  }

  function resetGame() {
    // Reset game state
    playerHits = [];
    computerHits = [];
    playerMisses = [];
    computerMisses = [];
    gameOver = false;
    updatePlayerScore(0,0)
    updateComputerScore(0,0)

    // Reset boards
    const body = document.body
    const boards = document.querySelector('.Boards')
    const playerBoard = document.getElementById('player')
    const computerBoard = document.getElementById('computer')
    boards.innerHTML = '';
    playerBoard.innerHTML = '';
    computerBoard.innerHTML = '';
    body.style.height='100vh'
    //Do everything again
    initializeBoard('player');
    initializeBoard('computer');
    placeAllComputerShips();
    createShips(availableShips);
    
    draggedShip = null;
    isRotated =false;
    const playerTiles = document.querySelectorAll('#player div')


    // Re-enable interactions
    playerTiles.forEach(playerTile => {
        playerTile.addEventListener('dragover', handleDragOver);
        playerTile.addEventListener('drop', handleDrop);
    });

    // Update UI
    
    turnStatus.textContent = ''; 
    turnStatus.style.display = 'none'; 
    startButton.style.display='block'
    resetButton.style.display='none'
    shipsContainer.style.display = 'flex';
    menu.style.width ='40px'
    menu.style.margin='30px 0'
    gameInfo.style.display='block'
    
    
}

// CONFETTI
var interval

// Function to start the confetti animation External library 
function startConfettiAnimation() {
  var duration = 8 * 1000;
  var animationEnd = Date.now() + duration;
  var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  interval = setInterval(function() {
    var timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    var particleCount = 50 * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
}

// Function to stop the confetti animation
function stopConfettiAnimation() {
  clearInterval(interval);
  
}


// Get modal elements
const modalOverlay = document.getElementById('modal-overlay');
const modalMessage = document.getElementById('modal-message');
const playAgainButton = document.getElementById('play-again');


function showModal(message) {
  modalMessage.textContent = message;
  modalOverlay.style.display = 'flex'; 
  
}


function hideModal() {
  modalOverlay.style.display = 'none'; // Hide modal
}

// Event listener for restart button click
playAgainButton.addEventListener('click', () => {
  hideModal(); // Hide modal
  resetGame(); // Reset the game
  stopConfettiAnimation();
});


// Function to check if the game is over.
function  isGameOver(user, userHits) {
  if (playerHits.length === 17) {
    gameOver = true;
    startConfettiAnimation();
    showModal('YAAAAAY!! YOU WON');
    victorySound.play()
  } else if (computerHits.length === 17) {
    gameOver = true;
    showModal('YOU LOST :( Try Again');
    lostSound.play()
  }
}













    
const GAMEDATA = "gamedata";
const SAFE_TRANSITION_TYPES = ["link", "auto_subframe", "auto_toplevel"];

let contextId = -1;
let gameData;
let gameRunning = false;

function getGameOverlay() {
  return "var de = document.createElement('div');"
  + "de.style.height = '50px'; de.style.width = '400px'; de.style.backgroundColor = 'coral'; de.style.position = 'fixed';"
  + "de.style.top = '10%'; de.style.left = '50%'; de.style.transform = 'translate(-50%, -50%)';"
  + "de.style.display = 'flex'; de.style.justifyContent = 'center'; de.style.alignItems = 'center';"
  + "document.body.appendChild(de);"

  + "var hfour = document.createTextNode('GOAL: "+ gameData.end +"');"
  + "de.appendChild(hfour);"
  + "document.getElementById('searchInput').disabled = true; "
  + "document.getElementById('searchInput').placeholder = 'No Cheating!'; "
  + "window.addEventListener(\"keydown\",function (e) {"
  + "if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70) || (e.keyCode == 114)) { "
  +     "e.preventDefault();"
  + " }"
  + "})";
}

function getVictoryOverlay(totalTime) {
  //rabbit freedom https://i.imgur.com/5RZrxLE.jpg
  const font = "Impact,Charcoal,sans-serif";
  return "var bigDiv = document.createElement('div');"
  + "bigDiv.style.height = '420px'; bigDiv.style.width = '800px';"
  + "bigDiv.style.position = 'fixed'; bigDiv.style.top = '50%'; bigDiv.style.left = '50%'; bigDiv.style.transform = 'translate(-50%, -50%)';"
  + "bigDiv.style.display = 'flex'; bigDiv.style.justifyContent = 'center'; bigDiv.style.alignItems = 'center'; bigDiv.style.flexDirection = 'column';"
  + "document.body.appendChild(bigDiv);"

  + "var rabbitImg = document.createElement('img');"
  + "rabbitImg.src='https://i.imgur.com/5RZrxLE.jpg';"
  + "rabbitImg.style.height = '408px'; rabbitImg.style.width = '612px';"
  + "bigDiv.appendChild(rabbitImg);"

  + "var textContainer = document.createElement('p');"
  + "textContainer.style.fontSize = '40px';"
  + "textContainer.style.textAlign = 'center';"
  + "textContainer.style.fontFamily = '" + font + "';"
  + "textContainer.style.color = '#dd42f5';"
  + "bigDiv.appendChild(textContainer);"

  + "var victoryText = document.createTextNode('You Won In: " + totalTime + " seconds!');"
  + "textContainer.appendChild(victoryText);"
}

function getCheaterOverlay() {
  return "var rabbitImg = document.createElement('img');"
  + "rabbitImg.src='https://i.imgur.com/jl6RPeF.png';"
  + "rabbitImg.style.height = '530px'; rabbitImg.style.width = '550px';"
  + "rabbitImg.style.position = 'fixed'; rabbitImg.style.top = '50%'; rabbitImg.style.left = '50%'; rabbitImg.style.transform = 'translate(-50%, -50%)';"
  + "document.body.appendChild(rabbitImg);"
}

//Reset information when starting browser up for the first time
chrome.runtime.onStartup.addListener(function() {
    chrome.storage.sync.set({
        startSite: '',
        endSite: '' ,
        cheated: false,
    });
});

//The icon is clicked
chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.browserAction.setPopup({
    popup: "options.html?superSecretPopupKey=true",
  });
  // prepareGame('https://www.amazon.com/', 'https://www.amazon.com/gp/bestsellers/?ref_=nav_cs_bestsellers');
});

//NEW TAB ENTERED
chrome.webNavigation.onCommitted.addListener(function (obj) {
  if (!gameRunning) return; //Don't check anything if the game isn't running!
  if (obj.url.includes("superSecretPopupKey")) return; //Don't check if the url contains the popup key
  
  modifySite(getGameOverlay());
  //This will check the method used in order to get to this url
  if (!SAFE_TRANSITION_TYPES.includes(obj.transitionType)) {
    cheatingDetected(obj.url);
    return;
  }

  //We got to a new site via link! Let's check it out...
  checkUrl(obj.url);
});

//Stop CTRL+F
chrome.commands.onCommand.addListener('nosearching', function (listener) {
  console.log('Pressed ', listener);
  cheatingDetected();
});

function recieveOptionsStart() {
  chrome.storage.sync.get(
    { startSite: '', endSite: ''},
    function (items) {
      console.log(items.startSite);
      prepareGame(items.startSite, items.endSite);
    }
  );
}



function modifySite(script) {
  chrome.tabs.query(
    { active: true, currentWindow: true },
    function (activeTabs) {
      //searchInput
      chrome.tabs.executeScript(activeTabs[0].id, { code: script });
    }
  );
}

function prepareGame(startLink, endLink) {
  if (gameRunning) {
    alert("Game is already running!");
    return;
  }

  gameData = {
    end: endLink.toLowerCase(),
    startTime: Date.now(),
  };

  startGame(startLink, endLink);
  // chrome.storage.sync.set({[GAMEDATA]: gameData}, function() {

  // });
}

function startGame(s, e) {
  //Starting link goes here??
  gameRunning = true;
  chrome.tabs.create({ url: s });

  var myAudio = new Audio(chrome.runtime.getURL("amongus.mp3"));
  myAudio.volume = 0.005;
  myAudio.play();

  // alert('Game started, you have to find: "' + e + '"');
}

function checkUrl(url) {
  console.log("Fairly checking...");
  if (url.toLowerCase().includes(gameData.end)) {
    finishGame(gameData);
  } else {
  }
  // chrome.storage.sync.get(GAMEDATA, function(data) {
  //     const gameData = data[GAMEDATA];

  // });
}

function finishGame(gameData) {
  const secondsElapsed = Math.floor((Date.now() - gameData.startTime) / 1000);
  gameRunning = false;
  chrome.storage.sync.get({
    bestTime: '???',
    gamesWon: 0,
    }, function(items) {
        
        let bt = items.bestTime;
        if(bt === '???') bt = 99995999;
        if(secondsElapsed < bt) bt = secondsElapsed;
        let gw = items.gamesWon + 1;

        if(bt === 99995999) bt = '???';
        chrome.storage.sync.set({
            startSite: '',
            endSite: '',
            cheated: false,
            bestTime: bt,
            gamesWon: gw,
          });
    });

  modifySite(getVictoryOverlay(secondsElapsed));
}

function cheatingDetected(url) {
  console.log("Non link click detected...");
  
  console.log('trying to modify site');
  modifySite(getCheaterOverlay());

  gameRunning = false;

  chrome.storage.sync.set({
    startSite: "",
    endSite: "",
    cheated: true,
  });
}

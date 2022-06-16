const GAMEDATA = "gamedata";
const SAFE_TRANSITION_TYPES = ["link", "auto_subframe", "auto_toplevel"];

let contextId = -1;
let gameData;
let gameRunning = false;

//Reset information when starting browser up for the first time
chrome.runtime.onStartup.addListener(function() {
    chrome.storage.sync.set({
        startSite: '',
        endSite: '' ,
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

  disableSearch();
  //This will check the method used in order to get to this url
  if (!SAFE_TRANSITION_TYPES.includes(obj.transitionType)) {
    cheatingDetected(obj.url);
    return;
  }

  //We got to a new site via link! Let's check it out...
  checkUrl(obj.url);
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

//Abstraction & Gamelogic
function disableSearch() {
  const disableScript = "document.getElementById('searchInput').disabled = true; document.getElementById('searchInput').placeholder = 'No Cheating!';";
  chrome.tabs.query(
    { active: true, currentWindow: true },
    function (activeTabs) {
      //searchInput
      chrome.tabs.executeScript(activeTabs[0].id, { code: disableScript });
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
  alert('Game started, you have to find: "' + e + '"');
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

  alert(`Game finished in ${secondsElapsed} seconds!\nGood work!`);
}

function cheatingDetected(url) {
  console.log("Non link click detected...");
  alert("NO CHEATING");
  gameRunning = false;

  chrome.storage.sync.set({
    startSite: "",
    endSite: "",
    cheated: true,
  });
}

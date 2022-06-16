//https://blog.jakelee.co.uk/creating-a-history-clearing-chrome-extension/#saving-options
//https://blog.jakelee.co.uk/creating-a-history-clearing-chrome-extension/#loading-options

const sites = [
    'https://en.wikipedia.org/wiki/Napoleon',
    'https://en.wikipedia.org/wiki/JavaScript',
    'https://en.wikipedia.org/wiki/Rabbit',
    'https://en.wikipedia.org/wiki/Redux_(JavaScript_library)',
    'https://en.wikipedia.org/wiki/SpongeBob_SquarePants',
    'https://en.wikipedia.org/wiki/Street_Fighter',
    'https://en.wikipedia.org/wiki/Pasta',
    'https://en.wikipedia.org/wiki/Hannah_Montana',
    'https://en.wikipedia.org/wiki/Quokka',
    'https://en.wikipedia.org/wiki/C%2B%2B',
    'https://en.wikipedia.org/wiki/MongoDB',
    'https://en.wikipedia.org/wiki/SQL',
    'https://en.wikipedia.org/wiki/Dwayne_Johnson',
    'https://en.wikipedia.org/wiki/Cheese',
    'https://en.wikipedia.org/wiki/Hot_pot',
    'https://en.wikipedia.org/wiki/Bacon',
    'https://en.wikipedia.org/wiki/Among_Us'
];

document.getElementById('start').addEventListener('click', start);

function start() {
    console.log(sites.length);

    let startSite = 'https://en.wikipedia.org/wiki/Special:Random';
    let endSite = sites[Math.floor(Math.random() * sites.length)];

    while(startSite === endSite) {
        endSite = sites[Math.floor(Math.random() * sites.length)];
    }

    console.log(startSite);

    chrome.storage.sync.set({
        startSite: startSite,
        endSite: endSite
    }, startGame);
}


function startGame() {
    const mainApp = chrome.extension.getBackgroundPage();
    mainApp.recieveOptionsStart();
    window.close();
}

document.addEventListener('DOMContentLoaded', load);

function load() {
    chrome.storage.sync.get({
        startSite: '',
        endSite: '',
        cheated: false,
        bestTime: '???',
        gamesWon: 0,
    }, function(items) {
        if(items.cheated) {
            document.getElementById('toptext').textContent = "Welcome to Rabbit Hole... cheater";
        }

        if(items.startSite !== '') {
            document.getElementById('toptext').textContent = 'You are currently playing!';
            document.getElementById('subtext').textContent = 'You are looking for: ' + items.endSite;
        }

        document.getElementById('besttime').textContent = 'Best Time: ' + items.bestTime + ' seconds';
        document.getElementById('gameswon').textContent = 'Games Won: ' + items.gamesWon;
    });
}

//Display the current site we're looking for
const readline = require('readline-promise').default;
const fetch = require('node-fetch');
const {google}=require('googleapis');
const sheets = google.sheets('v4');
require('dotenv').config();
const moment = require('moment');
moment().format(); 

const { HUE_BRIDGE_IP, HUE_API_KEY, LIGHT_ID, SPREADSHEET_ID, GREEN_HUE, GOOGLE_API_KEY } = process.env;

async function getNewGrav() {
    const response2 = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Report!D2?key=${GOOGLE_API_KEY}`)
    const data = await response2.json()
    console.log(`New Gravity = ${data.values[0][0]}`);
    return data.values[0][0];
};

function setLight(newHue) {
    console.log(`New Hue = ${newHue}`);
    fetch(`http://${HUE_BRIDGE_IP}/api/${HUE_API_KEY}/lights/${LIGHT_ID}/state`, {
        method: 'PUT',
        body: JSON.stringify({
            on: true, 
            hue: newHue, 
            sat: 254
        })
    })
}

async function mainLogic(startGrav, endGrav, gravConversion, multFact){
    console.log('\n' + moment().format("dddd, MMMM Do YYYY, h:mm:ss a"));
    let newGrav = await getNewGrav()

    if(newGrav>startGrav)
        newGrav = startGrav;
    else if (newGrav<endGrav)
        newGrav = endGrav;

    const hueDifference = (newGrav - endGrav) * gravConversion * multFact;
    const newHue = Math.floor(GREEN_HUE - hueDifference);
    if(newHue < 0) setLight(0);
    else setLight(newHue);

}

(async function(){
    const timeToWait = 900000, gravConversion = 1000;
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true
    });

    const startGrav = await rl.questionAsync("Starting Gravity? ")
    const endGrav = await rl.questionAsync("Ending Gravity? ")
    const diff = (startGrav - endGrav)*gravConversion;
    const multFact = GREEN_HUE / diff;

    mainLogic(startGrav, endGrav, gravConversion, multFact)

    setInterval(async function(){

        mainLogic(startGrav, endGrav, gravConversion, multFact)

    }, timeToWait)
})();

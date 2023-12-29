function calculate() {
    let birthDate = document.getElementById('birthDate').valueAsDate;
    let testDate = document.getElementById('testDate').valueAsDate;
    let height = parseFloat(document.getElementById('height').value);
    let isFemale = document.getElementById('female').checked;

    // Basic validation
    if (!birthDate || !testDate || isNaN(height) || (!isFemale && !document.getElementById('male').checked)) {
        document.getElementById('results').innerHTML = "Invalid Input";
        return;
    }

        // Date validation
        if (testDate <= birthDate) {
            document.getElementById('results').innerHTML =  "Check the birthdate and testdate!";
            return;
        }
        if (height > 500.0) {
            document.getElementById('results').innerHTML =  "Check the height - unlikely value.";
            return;
        }

    let age = millisecondsToYears(testDate - birthDate);
    let ibw = calcIBW(age, height, isFemale);
    let tidalVol = calculateIdealTidalVol(ibw);
    let rrRange = setRR(age);

    // Display results
    document.getElementById('results').innerHTML = `<b>Age</b>: ${(age).toFixed(2)} years<br>` + 
                                                    `<b>IBW:</b>${ibw.toFixed(2)} kg<br><br>` +
                                                   `<b>5mL/kg IBW:  </b>${tidalVol[3]} mL <br>` +
                                                   `<b>10 mL/kg IBW:  </b>${tidalVol[0]} mL <br>` +
                                                   `<b>15 mL/kg IBW:  </b>${tidalVol[1]} mL <br>` +
                                                   `<b>20 mL/kg IBW:  </b>${tidalVol[2]} mL <br><br>` +
                                                   `<b>Sigh (150% of 15 mL/kg IBW):  </b>${tidalVol[4]} mL <br><br>` +
                                                   `<b>Respiratory Rate: </b>${rrRange.join(' - ')}<br>`;
}

function millisecondsToYears(milliseconds) {
    const seconds = milliseconds / 1000;
    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;
    const years = days / 365.25; // Using 365.25 to account for leap years
    return years;
}


function calcIBW(age, height, isFemale) {
    let subjectHeightm = height / 100.0;
    let IBW;

    if (age <= 18) {
        let heightCubed = Math.pow(subjectHeightm, 3);
        let logHeight = Math.log(subjectHeightm);

        if (isFemale) {
            IBW = 9.835 * (heightCubed - 1.562) + 1.466 * (heightCubed * logHeight - 0.2322) + 21.09;
        } else {
            IBW = 9.278 * (heightCubed - 1.851) + 1.992 * (heightCubed * logHeight - 0.3798) + 23.98;
        }
    } else {
        let subjectHeightOver5 = subjectHeightm - 1.5;
        IBW = 55.0 + 87.5 * subjectHeightOver5;
    }

    return IBW;
}

function calculateIdealTidalVol(IBW) {
    let underVt = IBW * 5.0;
    let minVt = IBW * 10.0;
    let maxVt = IBW * 15.0;
    let overVt = IBW * 20.0;
    let sighVt = maxVt * 1.5;
    return [minVt, maxVt, overVt, underVt, sighVt].map(vol => Math.ceil(vol));
}

function setRR(age) {
    const ageThresholds = [
        { maxAge: 0.25, RRrange: [35, 55] },
        { maxAge: 0.5, RRrange: [30, 45] },
        { maxAge: 1.0, RRrange: [22, 38] },
        { maxAge: 3.0, RRrange: [22, 30] },
        { maxAge: 6.0, RRrange: [20, 24] },
        { maxAge: 12.0, RRrange: [16, 22] },
        { maxAge: Infinity, RRrange: [12, 20] }
    ];

    for (let i = 0; i < ageThresholds.length; i++) {
        if (age < ageThresholds[i].maxAge) {
            return ageThresholds[i].RRrange;
        }
    }
}


document.getElementById('birthDate').addEventListener('input', calculate);
document.getElementById('testDate').addEventListener('input', calculate);
document.getElementById('height').addEventListener('input', calculate);
document.getElementById('male').addEventListener('input', calculate);
document.getElementById('female').addEventListener('input', calculate);
document.getElementById('todayButton').addEventListener('click', setTodayDate);
document.getElementById('calculate').addEventListener('click', calculate);
function setTodayDate() {
    document.getElementById('testDate').valueAsDate = new Date();
}
// Event listeners for input fields and buttons
document.getElementById('birthDate').addEventListener('input', calculate);
document.getElementById('testDate').addEventListener('input', calculate);
document.getElementById('height').addEventListener('input', calculate);
document.getElementById('male').addEventListener('input', calculate);
document.getElementById('female').addEventListener('input', calculate);
document.getElementById('todayButton').addEventListener('click', setTodayDate);
document.getElementById('calculate').addEventListener('click', calculate);

// Sets the test date to today's date
function setTodayDate() {
    document.getElementById('testDate').valueAsDate = new Date();
    calculate();
}

// Main calculation function
function calculate() {
    const birthDate = document.getElementById('birthDate').valueAsDate;
    const testDate = document.getElementById('testDate').valueAsDate;
    const height = parseFloat(document.getElementById('height').value);
    const isFemale = document.getElementById('female').checked;

    // Basic validation
    if (!birthDate || !testDate || isNaN(height) || (!isFemale && !document.getElementById('male').checked)) {
        displayError("Invalid Input");
        return;
    }

    // Date validation
    if (testDate <= birthDate) {
        displayError("Check the birthdate and testdate!");
        return;
    }
    if (height > 500.0) {
        displayError("Check the height - unlikely value.");
        return;
    }

    const age = millisecondsToYears(testDate - birthDate);
    const ibw = calcIBW(age, height, isFemale);
    const tidalVol = calculateIdealTidalVol(ibw);
    const rrRange = setRR(age);

    // Displaying the results
    displayResults(age, ibw, tidalVol, rrRange);
}

// Converts milliseconds to years
function millisecondsToYears(milliseconds) {
    return milliseconds / (1000 * 60 * 60 * 24 * 365.25); // Using 365.25 to account for leap years
}

// Calculates Ideal Body Weight (IBW)
function calcIBW(age, height, isFemale) {
    const subjectHeightm = height / 100.0;

    if (age <= 18) {
        const heightCubed = Math.pow(subjectHeightm, 3);
        const logHeight = Math.log(subjectHeightm);

        return isFemale
            ? 9.835 * (heightCubed - 1.562) + 1.466 * (heightCubed * logHeight - 0.2322) + 21.09
            : 9.278 * (heightCubed - 1.851) + 1.992 * (heightCubed * logHeight - 0.3798) + 23.98;
    } else {
        const subjectHeightOver5 = subjectHeightm - 1.5;
        return 55.0 + 87.5 * subjectHeightOver5;
    }
}

// Calculates ideal tidal volume
function calculateIdealTidalVol(IBW) {
    const underVt = IBW * 5.0;
    const minVt = IBW * 10.0;
    const maxVt = IBW * 15.0;
    const overVt = IBW * 20.0;
    const sighVt = maxVt * 1.5;
    return [minVt, maxVt, overVt, underVt, sighVt].map(vol => Math.ceil(vol));
}

// Sets the Respiratory Rate based on age
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

    for (let threshold of ageThresholds) {
        if (age < threshold.maxAge) {
            return threshold.RRrange;
        }
    }
}

// Displays error messages
function displayError(message) {
    document.getElementById('results').innerHTML = `<span style="color: red;">${message}</span>`;
}

// Displays the results
function displayResults(age, ibw, tidalVol, rrRange) {
    document.getElementById('results').innerHTML = `<b>Age:</b> ${age.toFixed(2)} years<br>` +
                                                   `<b>IBW:</b> ${ibw.toFixed(2)} kg<br><br>` +
                                                   `<b>5mL/kg IBW:</b> ${tidalVol[3]} mL <br>` +
                                                   `<b>10 mL/kg IBW:</b> ${tidalVol[0]} mL <br>` +
                                                   `<b>15 mL/kg IBW:</b> ${tidalVol[1]} mL <br>` +
                                                   `<b>20 mL/kg IBW:</b> ${tidalVol[2]} mL <br><br>` +
                                                   `<b>Sigh (150% of 15 mL/kg IBW):</b> ${tidalVol[4]} mL <br><br>` +
                                                   `<b>Respiratory Rate:</b> ${rrRange.join(' - ')}<br>`;
}
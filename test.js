const fs = require('fs');
const readline = require('readline');

// Initializing a new Map to store cell data
let dataMap = new Map();

// Storing a cell's value in the map
function setCell(key, value) {
    dataMap.set(key.toUpperCase(), value);
}

// Retrieving a cell's value from the map
function getCell(key) {
    return dataMap.get(key.toUpperCase());
}

function parseCSV(data) {
    const csvData = data.split('\n').filter(row => row).map(row => row.split(',').map(cell => cell.trim()));

    if (!csvData.every(row => row.length === csvData[0].length)) {
        throw new Error('Incorrect CSV format');
    }
    return csvData;
}

function loadCSVtoSpreadsheet(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const rows = parseCSV(content);

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        for (let colIndex = 0; colIndex < rows[rowIndex].length; colIndex++) {
            const key = `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`;
            setCell(key, parseFloat(rows[rowIndex][colIndex]) || rows[rowIndex][colIndex]);
        }
    }
}

function processFormula(formula) {
    let calc, range = [];

    // Splitting the formula to get the operation and the cell range
    if (formula.startsWith('=')) {
        calc = formula.split('=').pop().split('(')[0];
        range = formula.split('(').pop().split(')')[0].split(':');
    }

    // Ensuring valid format for the cell range
    if (range.length !== 2) {
        throw new Error('Invalid formula format');
    }

    const startCol = range[0][0];
    const endCol = range[1][0];
    const startRow = parseInt(range[0].substring(1));
    const endRow = parseInt(range[1].substring(1));

    // Initialize total and count for calculation
    let total = 0;
    let count = 0;

    // If it's a column range like A1:A3
    if (startCol === endCol) {
        for (let row = startRow; row <= endRow; row++) {
            const cellValue = parseFloat(getCell(`${startCol}${row}`)) || 0;
            total += cellValue;
            count++;
        }
    } 
    // If it's a row range like A1:C1
    else if (startRow === endRow) {
        for (let col = startCol.charCodeAt(0); col <= endCol.charCodeAt(0); col++) {
            const cellValue = parseFloat(getCell(`${String.fromCharCode(col)}${startRow}`)) || 0;
            total += cellValue;
            count++;
        }
    } else {
        throw new Error('Unsupported range format');
    }

    // Return calculated value based on the operation
    if (calc === "SUM") {
        return total;
    } else if (calc === "AVERAGE") {
        return total / count;
    } else {
        throw new Error('Unsupported operation');
    }
}


function promptUser() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter the formula: ', (formula) => {
        try {
            const result = processFormula(formula);
            console.log(`Result: ${result}`);
        } catch (error) {
            console.error(`Error: ${error.message}`);
        }

        rl.close();
    });
}

function displayCSV(filePath) {
    loadCSVtoSpreadsheet(filePath);
    promptUser();
}

displayCSV('test1.csv');

module.exports = { displayCSV, parseCSV, loadCSVtoSpreadsheet, processFormula };

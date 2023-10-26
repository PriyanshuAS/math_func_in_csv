const fs = require('fs');
const readline = require('readline');

//Read CSV file
function csv_read(csv_name){
    try{
        return(fs.readFileSync(csv_name, 'utf-8'));
    }
    catch(error) {
        console.error(error);
    }
}

let dataMap = new Map();

function setCell(key, value) {
    dataMap.set(key.toUpperCase(), value);
}

function getValue(key) {
    return dataMap.get(key.toUpperCase());
}

function getCellValue(cellKey) {
    const value = getValue(cellKey);
    if (value === undefined) {
        throw new Error(`Cell ${cellKey} is not defined in the dataset.`);
    }
    return parseFloat(value) || 0;
}

//Convert csv to 2D array
function matrix(data) {
    //split with \n
    let csvData = data.split('\n');
    //remove empty row
    csvData = csvData.filter(row => row);
    //each row is split by ',' and trim leading or tailing whitespace
    csvData = csvData.map(row => row.split(',').map(cell => cell.trim()));

    //throws an error if num of columns is not same in each row
    if (!csvData.every(row => row.length === csvData[0].length)) {
        throw new Error('Incorrect CSV format');
    }

    return csvData;
}

//extract value from matrix and feed to the global dict "dataMap"
function createMap(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const rows = matrix(content);

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        for (let colIndex = 0; colIndex < rows[rowIndex].length; colIndex++) {
            const key = `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`;
            setCell(key, parseFloat(rows[rowIndex][colIndex]) || rows[rowIndex][colIndex]);
        }
    }
}


function executeEquation(formula) {
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

    const colstart = range[0][0];
    const colend = range[1][0];
    const rowstart = parseInt(range[0].substring(1));
    const rowend = parseInt(range[1].substring(1));

    // Initialize total and count for calculation
    let total = 0;
    let count = 0;

    // If it's a column range like A1:A3
    if (colstart === colend) {
        for (let row = rowstart; row <= rowend; row++) {
            const cellValue = parseFloat(getCellValue(`${colstart}${row}`)) || 0;
            total += cellValue;
            count++;
        }
    } 
    // If it's a row range like A1:C1
    else if (rowstart === rowend) {
        for (let col = colstart.charCodeAt(0); col <= colend.charCodeAt(0); col++) {
            const cellValue = parseFloat(getCellValue(`${String.fromCharCode(col)}${rowstart}`)) || 0;
            total += cellValue;
            count++;
        }
    } else {
        throw new Error('Unsupported range format');
    }

    // Return calculated value based on the operation
    let avg = total / count;

    // For Standard Deviation operation
    if (calc === "SD") {
        let squaredDifferencesSum = 0;

        // If it's a column range like A1:A3
        if (colstart === colend) {
            for (let row = rowstart; row <= rowend; row++) {
                const cellValue = parseFloat(getCellValue(`${colstart}${row}`)) || 0;
                squaredDifferencesSum += Math.pow(cellValue - avg, 2);
            }
        } 
        // If it's a row range like A1:C1
        else if (rowstart === rowend) {
            for (let col = colstart.charCodeAt(0); col <= colend.charCodeAt(0); col++) {
                const cellValue = parseFloat(getCellValue(`${String.fromCharCode(col)}${rowstart}`)) || 0;
                squaredDifferencesSum += Math.pow(cellValue - avg, 2);
            }
        }

        return Math.sqrt(squaredDifferencesSum / count);
    } 
    // For SUM operation
    else if (calc === "SUM") {
        return total;
    } 
    // For average operation
    else if (calc === "AVG") {
        return avg;
    } 
    else {
        throw new Error('Unsupported operation');
    }
}


function getEquation() {
    const equation = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    equation.question('Enter the equation: ', (equationInput) => {  // renaming the parameter to avoid conflict
        try {
            const result = executeEquation(equationInput);
            console.log(`Result: ${result}`);
        } catch (error) {
            console.error(error);
        }
        equation.close();
    });
}


function run(filePath) {
    createMap(filePath);
    getEquation();
}

run('test1.csv');

module.exports = { csv_read, matrix, createMap, executeEquation, getCellValue };

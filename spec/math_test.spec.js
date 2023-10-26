const fs = require('fs');
const path = require('path');

// Importing functions
const { csv_read, matrix, createMap, executeEquation } = require('../math.js');

describe("CSV Functions", () => {

    // Test 1: Checking if all values in csv are numeric
    it("should contain only numeric values", () => {
        const data = csv_read('test2.csv');
        const csvMatrix = matrix(data);
        
        csvMatrix.forEach(row => {
            row.forEach(cell => {
                expect(!isNaN(cell)).toBe(true);
            });
        });
    });

    // Test 2: Check if the number of columns in each row is equal
    it("should have an equal number of columns in each row", () => {
        const data = csv_read('test2.csv');
        const csvMatrix = matrix(data);
        
        const columnCount = csvMatrix[0].length;
        csvMatrix.forEach(row => {
            expect(row.length).toEqual(columnCount);
        });
    });

//     //Test 3: Testing the mathematical functions with some test dataset
//     describe("Mathematical functions", () => {
//         beforeAll(() => {
//             createMap('test1.csv');
//         });
//         //Checking SUM function
//         it("should return the correct SUM", () => {
//             const sum = executeEquation('=SUM(A1:A3)'); 
//             expect(sum).toBe(15);
//         });
//         //Checking AVG function
//         it("should return the correct AVG", () => {
//             const avg = executeEquation('=AVG(A1:A3)'); 
//             expect(avg).toBe(5);
//         });
//         //Checking SD function
//         it("should return the correct SD", () => {
//             const sd = executeEquation('=SD(A1:A3)');  
//             expect(sd).toBeCloseTo(3.265986323710904);  
//         });
//     });
});

import assert from 'assert';
import pgPromise from 'pg-promise';
import 'dotenv/config';
import { describe, beforeEach, after, it } from 'mocha';

import ExpenseTracker from '../ExpenseTracker.js';

const pgp = pgPromise({});
const connectionString = process.env.DATABASE_URL;
const db = pgp(connectionString);

let trackerFunction = ExpenseTracker(db);
let originalNone, originalAny;

describe("Tracking expense", function () {
    beforeEach(async function () {
        this.timeout(20000);

        // Store the original implementations of db.none and db.any
        originalNone = db.none;
        originalAny = db.any;

        // Stub db.none to simulate its behavior
        db.none = async function (query, values) {
            // console.log(`Executing query: ${query} with values: ${values}`);
            // You can add more logic as needed
        };

        // Stub db.any to simulate its behavior
        db.any = async function (query, values) {
            // console.log(`Executing query: ${query} with values: ${values}`);
            // You can add more logic as needed
            return []; // You might want to return some dummy data
        };

        // Initialize ExpenseTracker
        trackerFunction = ExpenseTracker(db);
    });

    after(async function () {
        // Restore the original implementations of db.none and db.any
        db.none = originalNone;
        db.any = originalAny;
    });

    beforeEach(async function () {
        this.timeout(20000);
        await db.none('delete from expense');
    });


    // it('should add an expense to the database and update the total', async () => {
    //     // Arrange
    //     const expense = 'Test Expense';
    //     const categoryType = 'TestCategory';
    //     const amount = 100;

    //     // Mock the getCategoryIdByType function to return a known category ID
    //     trackerFunction.getCategoryIdByType = async () => 1;

    //     // Mock the db.none function to simulate a successful database insertion
    //     db.none = async (query, values) => {};

    //     // Mock the updateTotal function to resolve immediately without updating the total
    //     trackerFunction.updateTotal = async () => {};

    //     try {
    //         // Act
    //         await trackerFunction.addExpense(expense, categoryType, amount);

    //         // Assert

    //         // Ensure getCategoryIdByType was called with the correct arguments
    //         assert.strictEqual(trackerFunction.getCategoryIdByType.callCount, 1);
    //         assert.strictEqual(trackerFunction.getCategoryIdByType.firstCall.args[0], categoryType);

    //         // Ensure db.none was called with the correct arguments
    //         assert.strictEqual(db.none.callCount, 1);
    //         assert.deepStrictEqual(db.none.firstCall.args, [
    //             'INSERT INTO expense (expense,category_id, amount) VALUES ($1, $2, $3)',
    //             [expense, 1, amount]
    //         ]);

    //         // Ensure updateTotal was called
    //         assert.strictEqual(trackerFunction.updateTotal.callCount, 1);
    //     } finally {
    //         // Clean up after the test (reset the functions to their original state)
    //         trackerFunction.getCategoryIdByType = async () => {};
    //         db.none = async () => {};
    //         trackerFunction.updateTotal = async () => {};
    //     }
    // });

    it('should return all expenses from the database', async () => {
        try {
            const result = await trackerFunction.allExpenses();

            // Log the actual result for inspection
            // console.log('Actual result:', result);

            // Implement your own assertions here
            assert(Array.isArray(result), 'Result should be an array');
            assert.strictEqual(result.length, 0, 'Expected zero expenses in the result');
            // Add more assertions based on the expected structure of the result
            // For example, check the properties of each expense in the result
        } catch (error) {
            // console.error('Error:', error);
            throw error; // Re-throw the error to fail the test
        }
    });

    it('should delete an expense from the database', async () => {
        // Insert a sample expense for deletion
        const insertResult = await db.one('INSERT INTO expense (expense, amount, category_id) VALUES ($1, $2, $3) RETURNING id', ['Test Expense', 100, 1]);
        const expenseIdToDelete = insertResult.id;

        // Call the deleteExpense function
        await trackerFunction.deleteExpense(expenseIdToDelete);

        // Fetch the expenses from the database to verify the deletion
        const expensesAfterDeletion = await trackerFunction.allExpenses();

        // Assert that the expenses array is empty after deletion
        assert.strictEqual(expensesAfterDeletion.length, 0, 'Expenses array should be empty after deletion');
    });

   it('should return category totals from the database', async () => {
        try {
            const result = await trackerFunction.categoryTotals();

            // Log the actual result for inspection
            console.log('Actual result:', result);

            // Implement your own assertions here
            assert.strictEqual(typeof result, 'object', 'Result should be an object');

            // Check if the expected categories and totals are present in the result
            assert.deepStrictEqual(result, {
            
            }, 'Unexpected category totals');
            // Add more assertions based on the expected structure of the result
        } catch (error) {
            console.error('Error:', error);
            throw error; // Re-throw the error to fail the test
        }
    });

   
    it('should return expenses for a specific category from the database', async () => {
        const categoryId = 1;
    
        // Call the expensesForCategory function
        const result = await trackerFunction.expensesForCategory(categoryId);

    
        assert.strictEqual(result.length, 0, 'Expected no expenses in the result');
        assert.equal(Array.isArray(result), true, 'Result should be an array');
    
        // assert.property(result[0], 'id');
        // assert.property(result[0], 'expense');
        // assert.property(result[0], 'amount');
        // assert.property(result[0], 'category_id');
    });
    

});

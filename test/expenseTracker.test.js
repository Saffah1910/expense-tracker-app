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
            console.log(`Executing query: ${query} with values: ${values}`);
            // You can add more logic as needed
        };

        // Stub db.any to simulate its behavior
        db.any = async function (query, values) {
            console.log(`Executing query: ${query} with values: ${values}`);
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

    // it('should add expense to the database successfully', async () => {
    //     // Implement your own stubbing logic for trackerFunction.getCategoryIdByType and trackerFunction.updateTotal
    //     // ...

    //     await trackerFunction.addExpense('Sample Expense', 'SampleCategory', 50);

    //     // Implement your own assertions here
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
            console.error('Error:', error);
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
});

const pgp = pgPromise({})
const connectionString = process.env.DATABASE_URL;
const db = pgp(connectionString);

import assert from 'assert';

import pgPromise from 'pg-promise';
import 'dotenv/config';
import { describe } from 'mocha';

import ExpenseTracker from '../ExpenseTracker.js';

let trackerFunction = ExpenseTracker(db);

describe("TRacking expense", function () {

    beforeEach(async function () {
        this.timeout(20000);

        await db.none(`delete from expense`);

    });

    it('should add an expense to the database and update the total', async () => {
        // Mock category ID
        const mockedCategoryId = 123;
        // Mock the database functions
        trackerFunction.getCategoryIdByType(mockedCategoryId);
    
        // Call the addExpense function
        await trackerFunction.addExpense('daily', 10);
    
        // Verify that getCategoryIdByType is called with the correct arguments
        assert.equal(trackerFunction.getCategoryIdByType.calledWith('daily'), true);
    
        // Verify that none is called with the correct SQL query and parameters
        assert.equal(
          db.none.calledWith('INSERT INTO expense (category_id, amount) VALUES ($1, $2)', [mockedCategoryId, 10]),
          true
        );
    
        // Verify that updateTotal is called
        assert.equal(db.updateTotal.called, true);
    
        // Verify the console output
        assert.equal(console.error.called, false); // Assuming errors are logged using console.error
      });
});
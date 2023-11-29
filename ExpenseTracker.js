export default function ExpenseTracker(db) {




    async function getCategoryIdByType(categoryType) {
        try {
            //get the category id based on category type from db
            const result = await db.oneOrNone('SELECT id FROM category WHERE category_type = $1', [categoryType]);
            // this checs if the result is dound otherwise returns null
            return result ? result.id : null;
        } catch (error) {
            console.error('Error fetching category ID:', error);
            throw error;
        }
    }

    // add expense will take the category id the user selects from checkbox and the amount they put into the input
    async function addExpense(expense, categoryType, amount) {
        try {
            // Retrieve category ID based on category type
            const categoryId = await getCategoryIdByType(categoryType);

            if (!categoryId) {
                throw new Error('Invalid category type.');
            }

            // Insert the expense into the database
            await db.none(
                'INSERT INTO expense (expense,category_id, amount) VALUES ($1, $2, $3)',
                [expense, categoryId, amount]
            );

            // Update the total column with the sum of amounts from all categories
            await updateTotal();
            // let message = "Expense added successfully";
            // return message
            // console.log('Expense added successfully.');
        } catch (error) {
            console.error('Error adding expense to the database:', error);
            throw error;
        }
    }
    async function updateTotal() {
        try {
            // Update the total column with the sum of amounts from all categories
            await db.none('UPDATE expense SET total = (SELECT SUM(amount) FROM expense)');

            console.log('Total updated successfully.');
        } catch (error) {
            console.error('Error updating total:', error);
            throw error;
        }
    }

    // this is to diaply the total on screen
    async function getTotal() {
        try {

            const result = await db.one('SELECT SUM(amount) as total FROM expense');
            return result.total || 0;
        } catch (error) {
            console.error('Error fetching total from the database:', error);
            throw error;
        }
    }


    async function allExpenses() {
        try {
            const expenses = await db.any(`
                SELECT expense.id, expense.expense, expense.amount, category.category_type, category_id
                FROM expense
                JOIN category ON expense.category_id = category.id
            `);
            // console.log(expenses);
            return expenses;
        } catch (error) {
            console.error('Error fetching expenses:', error);
            throw error;
        }
    }

    async function deleteExpense(expenseId) {
        try {
            // Perform the deletion in the database
            await db.none('DELETE FROM expense WHERE id = $1', expenseId);
            
            console.log('Expense deleted successfully.');
        } catch (error) {
            console.error('Error deleting expense:', error);
            throw error;
        }
    }
    

    async function categoryTotals() {
        try {
            // Query to get category totals with category types
            const categoryTotals = await db.any(`
                SELECT c.category_type, SUM(e.amount) as total
                FROM expense e
                JOIN category c ON e.category_id = c.id
                GROUP BY c.category_type
            `);

            // Format the result as an object for easy access
            const totalsObject = {};
            categoryTotals.forEach((row) => {
                totalsObject[row.category_type] = row.total;
            });

            return totalsObject;
        } catch (error) {
            console.error('Error fetching category totals:', error);
            throw error;
        }

    }

    async function expensesForCategory(categoryId) {
        try {
            
            // Query to get expenses for a specific category
            const expenses = await db.any(
               'SELECT * FROM expense WHERE category_id = $1',
               [categoryId]
            );
    
            // console.log(expenses);
            return expenses;
        } catch (error) {
            console.error('Error fetching expenses for category:', error);
            throw error;
        }
    }
    



    return {
        getCategoryIdByType,
        addExpense,
        updateTotal,
        allExpenses,
        getTotal,
        deleteExpense,
        categoryTotals,
        expensesForCategory
    }
}
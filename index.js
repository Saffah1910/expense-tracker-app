// index file will contain import of all packages used
import express from 'express';
import { engine } from 'express-handlebars';
import bodyParser from 'body-parser';
import flash from 'express-flash';
import session from 'express-session';
import pgPromise from 'pg-promise';
import Handlebars from 'handlebars';
import 'dotenv/config';

// import factory function
import ExpenseTracker from './ExpenseTracker.js';


const connectionString = process.env.DATABASE_URL;
const pgp = pgPromise({});
const db = pgp(connectionString);

const app = express();

// create an instance for factory function
const logic = ExpenseTracker(db);


app.engine(
    'handlebars',
    engine({
        handlebars: Handlebars,
        helpers: {
            json: function (context) {
                return JSON.stringify(context);
            },
        },
    })
); app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
    session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: false,
    })
);
app.use(flash());



app.get('/', async function (req, res) {
    // Fetch all expenses
    const allExpenses = await logic.allExpenses();

    // Fetch category totals
    const totals = await logic.categoryTotals();
    const success = req.flash('success')[0];

    // Get the selected category from the request query parameters
    const selectedCategory = req.query.category;

    // If a category is selected, fetch expenses for that category
    let filteredExpenses = [];
    if (selectedCategory) {
        const categoryId = parseInt(selectedCategory, 10);
        // console.log('bad boy ' +categoryId );
        filteredExpenses = await logic.expensesForCategory(categoryId);
    }

    const total = await logic.getTotal();

    res.render('addExpense', {
        success,
        total,
        allExpenses,
        totals,
        filteredExpenses,
        selectedCategory
    });
});



app.get('/viewAll', async function (req, res) {
    const viewExpenses = await logic.allExpenses()
    res.render('viewAllExpenses',{
        viewExpenses
    })
});



app.post('/add-expense', async (req, res) => {
    const description = req.body.description;
    const categoryType = req.body.category_type;
    const amount_used = req.body.amount;

    try {
        await logic.addExpense(description, categoryType, amount_used);
         req.flash('success', 'Expense added successfully.');
        // res.status(200).send('Expense added successfully.');
        res.redirect('/')
    } catch (error) {
        console.error('Error adding expense to the database:', error);
        res.status(500).send('Internal server error.');
    }
});


app.post('/delete-expense', async (req, res) => {
    const expenseId = req.body.expenseId;

    try {
        // Perform the deletion in the database based on the expenseId
        await logic.deleteExpense(expenseId);
        req.flash('success', 'Expense deleted successfully.');
        res.redirect('/viewAll'); // Redirect to the expense list page
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).send('Internal server error.');
    }
});

// Inside your route handler




const PORT = process.env.PORT || 3002;

app.listen(PORT, function () {
    console.log('App started at port', PORT);
});
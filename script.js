let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let debts = [];

const expenseList = document.getElementById("expenseList");
const totalDisplay = document.getElementById("total");
const burnRateDisplay = document.getElementById("burnRate");
const exhaustionDisplay = document.getElementById("exhaustion");

function saveData() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

function addExpense() {
    const desc = document.getElementById("desc").value;
    const amount = parseFloat(document.getElementById("amount").value);

    if (!desc || !amount) return alert("Enter valid data");

    const expense = {
        desc,
        amount,
        date: new Date().toISOString()
    };

    expenses.push(expense);
    saveData();
    renderExpenses();
    calculateStats();
}

function renderExpenses() {
    expenseList.innerHTML = "";
    expenses.forEach((e, index) => {
        const li = document.createElement("li");
        li.innerHTML = `${e.desc} - ₹${e.amount}`;
        expenseList.appendChild(li);
    });
}

function calculateStats() {
    let total = expenses.reduce((sum, e) => sum + e.amount, 0);
    totalDisplay.textContent = total.toFixed(2);

    let days = 30;
    let burnRate = total / new Date().getDate();
    burnRateDisplay.textContent = burnRate.toFixed(2);

    let remaining = 10000 - total; // assume ₹10000 monthly budget
    let daysLeft = Math.floor(remaining / burnRate);
    let exhaustionDate = new Date();
    exhaustionDate.setDate(exhaustionDate.getDate() + daysLeft);

    exhaustionDisplay.textContent = exhaustionDate.toDateString();

    updateChart();
}

let chart;

function updateChart() {
    const ctx = document.getElementById('chart').getContext('2d');
    const labels = expenses.map(e => e.desc);
    const data = expenses.map(e => e.amount);

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Spending',
                data: data
            }]
        }
    });
}

function addDebt() {
    const from = document.getElementById("from").value;
    const to = document.getElementById("to").value;
    const amount = parseFloat(document.getElementById("debtAmount").value);

    debts.push({ from, to, amount });
    renderDebts();
}

function renderDebts() {
    const list = document.getElementById("debtList");
    list.innerHTML = "";
    debts.forEach(d => {
        const li = document.createElement("li");
        li.textContent = `${d.from} → ${d.to} : ₹${d.amount}`;
        list.appendChild(li);
    });
}

function simplifyDebts() {
    let balance = {};

    debts.forEach(d => {
        balance[d.from] = (balance[d.from] || 0) - d.amount;
        balance[d.to] = (balance[d.to] || 0) + d.amount;
    });

    let creditors = [];
    let debtors = [];

    for (let person in balance) {
        if (balance[person] > 0) creditors.push({ person, amount: balance[person] });
        if (balance[person] < 0) debtors.push({ person, amount: -balance[person] });
    }

    let result = "";

    debtors.forEach(d => {
        creditors.forEach(c => {
            let settle = Math.min(d.amount, c.amount);
            if (settle > 0) {
                result += `${d.person} → ${c.person} : ₹${settle} <br>`;
                d.amount -= settle;
                c.amount -= settle;
            }
        });
    });

    document.getElementById("simplifiedResult").innerHTML = result;
}

renderExpenses();
calculateStats();

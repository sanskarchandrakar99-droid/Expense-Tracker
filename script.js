document.addEventListener("DOMContentLoaded", () => {

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let budget = parseFloat(localStorage.getItem("budget")) || 0;
let debts = [];

const descInput = document.getElementById("desc");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const list = document.getElementById("list");

const totalSpan = document.getElementById("total");
const burnSpan = document.getElementById("burn");
const exhaustSpan = document.getElementById("exhaust");

const budgetInput = document.getElementById("budgetInput");
const budgetSpan = document.getElementById("budget");

budgetSpan.innerText = budget;

function save(){
localStorage.setItem("expenses",JSON.stringify(expenses));
localStorage.setItem("budget",budget);
}

window.addExpense = function(){
const desc = descInput.value.trim();
const amount = parseFloat(amountInput.value);
const category = categoryInput.value;

if(!desc || isNaN(amount) || amount<=0){
alert("Enter valid expense details");
return;
}

expenses.push({
id:Date.now(),
desc,
amount,
category,
date:new Date()
});

descInput.value="";
amountInput.value="";
save();
render();
};

window.setBudget = function(){
const value = parseFloat(budgetInput.value);
if(isNaN(value) || value<=0){
alert("Enter valid budget");
return;
}
budget=value;
budgetSpan.innerText=budget;
save();
render();
};

function deleteExpense(id){
expenses = expenses.filter(e=>e.id!==id);
save();
render();
}

function render(){

let total = expenses.reduce((a,b)=>a+b.amount,0);
totalSpan.innerText = total.toFixed(2);

const last7 = expenses.slice(-7);
let weighted=0, weightSum=0;

last7.forEach((e,i)=>{
let weight=i+1;
weighted+=e.amount*weight;
weightSum+=weight;
});

let burn = weightSum? weighted/weightSum:0;
burnSpan.innerText=burn.toFixed(2);

if(budget>0 && burn>0){
let remaining = budget-total;
let daysLeft = Math.floor(remaining/burn);
let date = new Date();
date.setDate(date.getDate()+daysLeft);
exhaustSpan.innerText = remaining>0 ? date.toDateString() : "Budget Exhausted";
}

list.innerHTML="";
expenses.forEach(e=>{
let li=document.createElement("li");
li.innerHTML=`
<span>${e.desc} - ₹${e.amount} (${e.category})</span>
<button class="delete-btn" onclick="deleteExpense(${e.id})">X</button>
`;
list.appendChild(li);
});

updateCharts();
}

let lineChart,pieChart;

function updateCharts(){

const ctx1=document.getElementById("lineChart");
const ctx2=document.getElementById("pieChart");

if(lineChart) lineChart.destroy();
if(pieChart) pieChart.destroy();

lineChart=new Chart(ctx1,{
type:"line",
data:{
labels:expenses.map(e=>new Date(e.date).toLocaleDateString()),
datasets:[{
label:"Spending",
data:expenses.map(e=>e.amount),
borderColor:"#38bdf8",
backgroundColor:"rgba(56,189,248,0.2)",
fill:true,
tension:0.4
}]
}
});

let categoryData={};
expenses.forEach(e=>{
categoryData[e.category]=(categoryData[e.category]||0)+e.amount;
});

pieChart=new Chart(ctx2,{
type:"doughnut",
data:{
labels:Object.keys(categoryData),
datasets:[{
data:Object.values(categoryData),
backgroundColor:["#38bdf8","#22c55e","#ef4444","#f59e0b","#8b5cf6"]
}]
}
});
}

window.addDebt=function(){
let f=document.getElementById("from").value;
let t=document.getElementById("to").value;
let a=parseFloat(document.getElementById("debtAmt").value);

if(!f||!t||isNaN(a)||a<=0) return;

debts.push({f,t,a});
renderDebts();
};

function renderDebts(){
let debtList=document.getElementById("debtList");
debtList.innerHTML="";
debts.forEach(d=>{
let li=document.createElement("li");
li.innerText=`${d.f} → ${d.t} ₹${d.a}`;
debtList.appendChild(li);
});
}

window.simplify=function(){
let balance={};

debts.forEach(d=>{
balance[d.f]=(balance[d.f]||0)-d.a;
balance[d.t]=(balance[d.t]||0)+d.a;
});

let creditors=[],debtors=[];
for(let p in balance){
if(balance[p]>0) creditors.push({p,amt:balance[p]});
if(balance[p]<0) debtors.push({p,amt:-balance[p]});
}

let output="";
debtors.forEach(d=>{
creditors.forEach(c=>{
let settle=Math.min(d.amt,c.amt);
if(settle>0){
output+=`${d.p} → ${c.p} ₹${settle}<br>`;
d.amt-=settle;
c.amt-=settle;
}
});
});

document.getElementById("result").innerHTML=output||"No debts to simplify";
};

render();

});

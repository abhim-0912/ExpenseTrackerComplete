document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("User is not authenticated");
    return (window.location.href = "/signup.html");
  }

  await fetchExpenses();
  await checkPremiumStatus();
});

document.getElementById("expenseForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const addBtn = document.getElementById("addBtn");
  const id = addBtn.getAttribute("data-id");
  id ? await updateExpense(id) : await addExpense();
});

async function addExpense() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const data = {
    expenseName: document.getElementById("expenseName").value.trim(),
    amount: document.getElementById("amount").value.trim(),
    expenseType: document.getElementById("expenseType").value.trim(),
  };

  const res = await fetch("/expense", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (res.ok) {
    alert("Expense added successfully!");
    document.getElementById("expenseForm").reset();
    addExpenseToList(result.expense);
  } else {
    alert("Error: " + result.message);
  }
}

async function fetchExpenses() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const res = await fetch("/expense", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const result = await res.json();
  if (res.ok) {
    const list = document.getElementById("expensesList");
    list.innerHTML = "";
    result.expenses.forEach(addExpenseToList);
  }
}

function addExpenseToList(expense) {
  let item = document.getElementById(`expense-${expense.id}`);
  if (!item) {
    item = document.createElement("li");
    item.id = `expense-${expense.id}`;
    document.getElementById("expensesList").appendChild(item);
  }

  item.innerHTML = `
    ${expense.expenseName} - $${expense.amount} - ${expense.expenseType} 
  `;

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.onclick = () => editExpense(expense);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.onclick = () => deleteExpense(expense.id);

  item.appendChild(editBtn);
  item.appendChild(deleteBtn);
}

async function deleteExpense(id) {
  const token = localStorage.getItem("token");
  if (!token) return;

  const res = await fetch(`/expense/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const result = await res.json();
  if (res.ok) {
    alert("Expense Deleted Successfully");
    document.getElementById(`expense-${id}`).remove();
  } else {
    alert("Error: " + result.message);
  }
}

function editExpense(expense) {
  document.getElementById("expenseName").value = expense.expenseName;
  document.getElementById("amount").value = expense.amount;
  document.getElementById("expenseType").value = expense.expenseType;

  const addBtn = document.getElementById("addBtn");
  addBtn.textContent = "Update Expense";
  addBtn.setAttribute("data-id", expense.id);
}

async function updateExpense(id) {
  const token = localStorage.getItem("token");
  if (!token) return;

  const data = {
    expenseName: document.getElementById("expenseName").value.trim(),
    amount: document.getElementById("amount").value.trim(),
    expenseType: document.getElementById("expenseType").value.trim(),
  };

  const res = await fetch(`/expense/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (res.ok) {
    alert("Expense Updated Successfully");
    addExpenseToList({ ...data, id });
    document.getElementById("expenseForm").reset();
    const addBtn = document.getElementById("addBtn");
    addBtn.textContent = "Add Expense";
    addBtn.removeAttribute("data-id");
  } else {
    alert("Error: " + result.message);
  }
}

function parseJwt(token) {
  const base64Payload = token.split(".")[1];
  return JSON.parse(atob(base64Payload));
}

async function checkPremiumStatus() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const decoded = parseJwt(token);
  if (!decoded.isPremium) return;

  document.getElementById("payBtn").style.display = "none";
  document.getElementById("premium-text").textContent = "You are a premium user 👑";
  document.getElementById("leaderboardBtn").hidden = false;
}

document.getElementById("payBtn").addEventListener("click", async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token not found");

    const res = await fetch("/purchase/premium", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message);

    const cashfree = Cashfree({ mode: "sandbox" });
    cashfree.checkout({
      paymentSessionId: result.paymentSessionId,
      redirectTarget: "_self",
    });
  } catch (error) {
    alert("Payment error: " + error.message);
  }
});


const showLeaderboardList = async (req,res) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Token not found");
    const response = await fetch('/user/leaderboard',{
      method: 'GET',
      headers: {
        Authorization : `Bearer ${token}`,
        'Content-Type' : 'application/json'
      }
    });
    if(!response.ok){
      console.log("Unable to receive any response");
      return;
    }
    const result = await response.json();
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = "";
    result.leaderboard.forEach((user) => {
      const name = user.name;
      const totalExpense = user.totalExpense;
      const userExpenseList = document.createElement('li');
      userExpenseList.textContent = `${name} - $${totalExpense}`;
      leaderboardList.appendChild(userExpenseList);
    });
    document.getElementById("leaderboardContainer").style.display = "block";
  } catch(error) {
    console.log("Error in getting the Leaderboard : ",error);
  }
};

document.getElementById('leaderboardBtn').addEventListener('click',showLeaderboardList);

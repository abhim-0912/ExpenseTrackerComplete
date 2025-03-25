document.addEventListener("DOMContentLoaded", async function () {
  let token = localStorage.getItem("token");
  if (!token) {
    const tempToken = sessionStorage.getItem("tempToken");
    if (tempToken) {
      localStorage.setItem("token", tempToken);
      token = tempToken;
      sessionStorage.removeItem("tempToken");
    }
  }

  if (!token) {
    alert("User is not authenticated");
    window.location.href = "/signup.html";
    return;
  }

  const queryParam = new URLSearchParams(window.location.search);
  const orderId = queryParam.get("orderId");
  if (orderId) {
    const response = await fetch(
      `/purchase/updateTransaction?orderId=${orderId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const result = await response.json();
    if (result.success) {
      alert("Payment successful! You're now a Premium user");
      await checkPremiumStatus();
      history.replaceState(null, "", window.location.pathname);
    } else {
      alert("Payment Failed");
    }
  }

  await fetchExpenses();
  await checkPremiumStatus();
});

document
  .getElementById("expenseForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const addBtn = document.getElementById("addBtn");
    if (addBtn.getAttribute("data-id")) {
      await updateExpense(addBtn.getAttribute("data-id"));
    } else {
      await addExpense();
    }
  });

async function addExpense() {
  try {
    const expenseName = document.getElementById("expenseName").value.trim();
    const amount = document.getElementById("amount").value.trim();
    const expenseType = document.getElementById("expenseType").value.trim();
    const token = localStorage.getItem("token");
    if (!token) return;

    const newExpense = { expenseName, amount, expenseType };
    const response = await fetch("/expense", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newExpense),
    });

    const result = await response.json();
    if (response.ok) {
      alert("Expense added successfully!");
      document.getElementById("expenseForm").reset();
      addExpenseToList(result.expense);
    } else {
      alert("Error: " + result.message);
    }
  } catch (error) {
    alert("Failed to connect to the server");
  }
}

async function fetchExpenses() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await fetch("/expense", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await response.json();
    if (response.ok) {
      const expenseList = document.getElementById("expensesList");
      expenseList.innerHTML = "";
      result.expenses.forEach((expense) => addExpenseToList(expense));
    }
  } catch (error) {
    console.log(error);
  }
}

function addExpenseToList(expense) {
  let expenseItem = document.getElementById(`expense-${expense.id}`);
  if (!expenseItem) {
    expenseItem = document.createElement("li");
    expenseItem.id = `expense-${expense.id}`;
    document.getElementById("expensesList").appendChild(expenseItem);
  }

  expenseItem.innerHTML = `
    ${expense.expenseName} - $${expense.amount} - ${expense.expenseType} 
  `;

  const editButton = document.createElement("button");
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => editExpense(expense));

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => deleteExpense(expense.id));

  expenseItem.appendChild(editButton);
  expenseItem.appendChild(deleteButton);
}

async function deleteExpense(expenseId) {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await fetch(`/expense/${expenseId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (response.ok) {
      alert("Expense Deleted Successfully");
      document.getElementById(`expense-${expenseId}`).remove();
    } else {
      alert("Failed to delete expense: " + result.message);
    }
  } catch (error) {
    alert("Unable to connect to the server");
  }
}

async function editExpense(expense) {
  document.getElementById("expenseName").value = expense.expenseName;
  document.getElementById("amount").value = expense.amount;
  document.getElementById("expenseType").value = expense.expenseType;

  const addBtn = document.getElementById("addBtn");
  addBtn.textContent = "Update Expense";
  addBtn.setAttribute("data-id", expense.id);
}

async function updateExpense(expenseId) {
  try {
    const updatedExpense = {
      expenseName: document.getElementById("expenseName").value.trim(),
      amount: document.getElementById("amount").value.trim(),
      expenseType: document.getElementById("expenseType").value.trim(),
    };

    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await fetch(`/expense/${expenseId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedExpense),
    });

    const result = await response.json();
    if (response.ok) {
      alert("Expense Updated Successfully");
      addExpenseToList({ ...updatedExpense, id: expenseId });
      document.getElementById("expenseForm").reset();
      const addBtn = document.getElementById("addBtn");
      addBtn.textContent = "Add Expense";
      addBtn.removeAttribute("data-id");
    } else {
      alert("Failed to update expense: " + result.message);
    }
  } catch (error) {
    alert("Unable to update the expense.");
  }
}

function parseJwt(token) {
  const base64Payload = token.split(".")[1];
  const decodedPayload = atob(base64Payload);
  return JSON.parse(decodedPayload);
}

async function checkPremiumStatus() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decodedToken = parseJwt(token);
    if (!decodedToken.isPremium) return;

    const payBtn = document.getElementById("payBtn");
    payBtn.style.display = "none";

    const premiumText = document.getElementById("premium-text");
    premiumText.textContent = "You are a premium user 👑";

    const leaderboardBtn = document.getElementById("leaderboardBtn");
    leaderboardBtn.hidden = false;
  } catch (error) {
    console.error("Error in checking premium status:", error);
  }
}

document
  .getElementById("payBtn")
  .addEventListener("click", async function () {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found");

      sessionStorage.setItem("tempToken", token);

      const response = await fetch("/purchase/premium", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to create payment");

      const result = await response.json();
      const paymentSessionId = result.paymentSessionId;

      const cashfree = Cashfree({ mode: "sandbox" });
      cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (error) {
      console.error("Error in creating an order:", error);
    }
  });

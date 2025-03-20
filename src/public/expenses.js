document
  .getElementById("expenseForm")
  .addEventListener("submit", async function (event) {
    try {
      event.preventDefault();
      const expenseName = document.getElementById("expenseName").value;
      const amount = document.getElementById("amount").value;
      const expenseType = document.getElementById("expenseType").value;
      const newExpense = {
        expenseName,
        amount,
        expenseType,
      };
      const token = localStorage.getItem("token");
      if (!token) {
        alert("User is not authenticated");
        return;
      }
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
      console.log("Error:", error);
      alert("Failed to connect to the server");
    }
  });

function addExpenseToList(expense) {
  const newList = document.createElement("li");
  newList.id = `expense-${expense.id}`;
  newList.innerHTML = "";
  newList.textContent = `${expense.expenseName} - $${expense.amount} - ${expense.expenseType} `;
  const expenseList = document.getElementById("expensesList");

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", () => editExpense(expense));

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => deleteExpense(expense.id));

  newList.appendChild(editBtn);
  newList.appendChild(deleteBtn);
  expenseList.appendChild(newList);
}

async function deleteExpense(expenseId) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("User is not authenticated");
      return;
    }
    const response = await fetch(`/expense/${expenseId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    if (response.ok) {
      alert("Expense Deleted Successfully");
      const expenseItem = document.getElementById(`expense-${expenseId}`);
      if (expenseItem) {
        expenseItem.remove();
      }
    } else {
      alert("Failed to delete expense: " + result.message);
    }
  } catch (error) {
    console.log("Error:", error);
    alert("Unable to connect to the server");
  }
}

async function editExpense(expense) {
  try {
    document.getElementById("expenseName").value = expense.expenseName;
    document.getElementById("amount").value = expense.amount;
    document.getElementById("expenseType").value = expense.expenseType;

    const addBtn = document.getElementById("addBtn");
    addBtn.textContent = "Update Expense";
    addBtn.setAttribute("data-id", expense.id);

    document.getElementById("expenseForm").onsubmit = async function (event) {
      event.preventDefault();

      const updatedExpense = {
        expenseName: document.getElementById("expenseName").value,
        amount: document.getElementById("amount").value,
        expenseType: document.getElementById("expenseType").value,
      };

      const token = localStorage.getItem("token");
      if (!token) {
        alert("User is not authenticated");
        return;
      }
      const response = await fetch(`/expense/${expense.id}`, {
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

        const expenseItem = document.getElementById(`expense-${expense.id}`);
        expenseItem.innerHTML = "";
        expenseItem.textContent = `${updatedExpense.expenseName} - $${updatedExpense.amount} (${updatedExpense.expenseType}) `;

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () =>
          editExpense({ ...updatedExpense, id: expense.id })
        );

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteExpense(expense.id));

        expenseItem.appendChild(editButton);
        expenseItem.appendChild(deleteButton);

        document.getElementById("expenseForm").reset();
        addBtn.textContent = "Add Expense";
        addBtn.removeAttribute("data-id");
        document.getElementById("expenseForm").onsubmit = addExpense;
      } else {
        alert("Failed to update expense: " + result.message);
      }
    };
  } catch (error) {
    console.error("Error in editing expense:", error);
    alert("Unable to edit the expense.");
  }
}

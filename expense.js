

const expenses = JSON.parse(localStorage.getItem('expenses')) || [];

function renderExpenses() {
    const tbody = document.querySelector('#expenseTable tbody');
    tbody.innerHTML = '';

    expenses.forEach((expense, index) => {
      const row = tbody.insertRow();
      const cell1 = row.insertCell(0);
      const cell2 = row.insertCell(1);
      const cell3 = row.insertCell(2);
      const cell4 = row.insertCell(3);

      cell1.textContent = expense.description;
      cell2.textContent = expense.amount;
      cell3.textContent = expense.category;

      // Edit Button
      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.classList.add('btn', 'btn-primary'); 
      editButton.onclick = () => editExpense(index);
      cell4.appendChild(editButton);

      // Delete Button
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.classList.add('btn', 'btn-primary'); 

      deleteButton.onclick = () => deleteExpense(index);
      cell4.appendChild(deleteButton);
    });
  }

  const addBtn=document.querySelector('#add-btn');


  addBtn.addEventListener('click', function addExpense() {
    const description = document.getElementById('expenseDescription').value;
    const amount = document.getElementById('expenseAmount').value;
    const category = document.getElementById('expenseCategory').value;

    if (description && amount) {
      const newExpense = { description, amount, category };
      expenses.push(newExpense);

      // Save expenses to local storage
      localStorage.setItem('expenses', JSON.stringify(expenses));

      // Render updated expenses
      renderExpenses();

      // Clear input fields
      document.getElementById('expenseDescription').value = '';
      document.getElementById('expenseAmount').value = '';
      document.getElementById('expenseCategory').value = 'movies';
    }
  })

  

  function editExpense(index) {
    const updatedDescription = prompt('Enter updated description:', expenses[index].description);
    const updatedAmount = prompt('Enter updated amount:', expenses[index].amount);
    const updatedCategory = prompt('Enter updated category:', expenses[index].category);

    if (updatedDescription !== null && updatedAmount !== null && updatedCategory !== null) {
      expenses[index].description = updatedDescription;
      expenses[index].amount = updatedAmount;
      expenses[index].category = updatedCategory;

      // Save updated expenses to local storage
      localStorage.setItem('expenses', JSON.stringify(expenses));

      // Render updated expenses
      renderExpenses();
    }
  }

  // Function to delete an expense
  function deleteExpense(index) {
    const confirmDelete = confirm('Are you sure you want to delete this expense?');

    if (confirmDelete) {
      expenses.splice(index, 1);

      // Save updated expenses to local storage
      localStorage.setItem('expenses', JSON.stringify(expenses));

      // Render updated expenses
      renderExpenses();
    }
  }

  // Initial rendering of expenses
  renderExpenses();

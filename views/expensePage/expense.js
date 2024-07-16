const form = document.getElementById('expenseForm');
let currentPage = 1;
let itemsPerPage = localStorage.getItem('itemsPerPage') ? parseInt(localStorage.getItem('itemsPerPage')) : 2;

// After window refresh, fetch expenses

    window.addEventListener('DOMContentLoaded', async () => {
        await fetchExpenses(currentPage, itemsPerPage);
    });



// Posting the data to the expense page
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('description').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        const response = await axios.post('http://13.232.126.5:3000/exp/expense', {
            description: description,
            amount: amount,
            category: category
        }, {
            headers: { "Authorization": token }
        });

        document.getElementById('description').value = '';
        document.getElementById('amount').value = '';
        document.getElementById('category').value = '';


         fetchExpenses(currentPage, itemsPerPage);

    } catch (error) {
        console.error('Error adding expense:', error);
    }
});

// Fetch details and show them on the screen
async function fetchExpenses(page = 1, limit = 2) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found");
            return;
        }

        const parseToken = parseJwt(token);
        if (parseToken.isPremium) {
            premiumUser();
        }

        const response = await axios.get(`http://13.232.126.5:3000/exp/expense?page=${page}&limit=${limit}`, { headers: { "Authorization": token } });
        const totalPages = response.data.data.totalPages;

        const expenseArray = response.data.data.expense;

        const tbody = document.querySelector("#expenseTable tbody");
        tbody.innerHTML = "";

        // Create table rows for expenses
        for (let expense of expenseArray) {
            const row = document.createElement("tr");

            const createdCell = document.createElement('td');
            const date = formatDate(expense.createdAt);
            createdCell.textContent = date;
            row.appendChild(createdCell);

            const descriptionCell = document.createElement("td");
            descriptionCell.textContent = expense.description;
            row.appendChild(descriptionCell);

            const amountCell = document.createElement("td");
            amountCell.textContent = expense.amount;
            row.appendChild(amountCell);

            const categoryCell = document.createElement("td");
            categoryCell.textContent = expense.category;
            row.appendChild(categoryCell);

            // Create cell with a delete button
            const actionCell = document.createElement("td");
            const actionButton = document.createElement("button");
            actionButton.classList.add('delete');
            actionButton.textContent = "Delete";
            actionButton.addEventListener("click", () => {
                deleteExpense(expense.id);
                row.remove();
            });
            actionCell.appendChild(actionButton);
            row.appendChild(actionCell);

            // Append the row to the table body
            tbody.appendChild(row);
            updatePaginationControls(totalPages, page);
        }
    } catch (err) {
        console.log(err);
    }
}

async function deleteExpense(expenseId) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found");
            return;
        }

        await axios.delete(`http://13.232.126.5:3000/exp/expense/${expenseId}`, { headers: { "Authorization": token } });
    } catch (err) {
        console.error("Error deleting expense:", err);
    }
}

function updatePaginationControls(totalPages, currentPage) {
    const paginationControls = document.getElementById('pagination-controls');
    paginationControls.innerHTML = '';

    for (let page = 1; page <= totalPages; page++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = page;
        pageButton.classList.add('page-button');
        if (page === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.addEventListener('click', () => {
            fetchExpenses(page, itemsPerPage);
        });
        paginationControls.appendChild(pageButton);
    }
}

document.getElementById('buy-premium-btn').addEventListener('click', async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        const response = await axios.get('http://13.232.126.5:3000/purchase/premiummembership', {
            headers: { "Authorization": token }
        });

        const options = {
            "key": response.data.key_id,
            "name": "Expense Tracker",
            "description": "Premium Membership",
            "order_id": response.data.order.id,
            "handler": async function (response) {
                await axios.post('http://13.232.126.5:3000/purchase/updateTransactionStatus', {
                    payment_id: response.razorpay_payment_id,
                    order_id: response.razorpay_order_id,
                    signature: response.razorpay_signature
                }, {
                    headers: { "Authorization": token }
                }).then((verificationResponse) => {
                    if (verificationResponse.data.status === "success") {
                        localStorage.setItem('token', verificationResponse.data.token);
                        alert('Payment verified successfully, You are a premium user');
                        premiumUser();
                    } else {
                        alert('Payment verification failed');
                    }
                }).catch(error => {
                    console.error('Error verifying payment:', error);
                });
            },
            "prefill": {
                "name": "User Name",
                "email": "user@example.com",
                "contact": "9999999999"
            },
            "notes": {
                "address": "User Address"
            },
            "theme": {
                "color": "#3399cc"
            }
        };

        const rzp1 = new Razorpay(options);
        rzp1.on('payment.failed', function (response) {
            alert(response.error.reason);
        });

        rzp1.open();
    } catch (error) {
        console.error('Error initiating premium purchase:', error);
    }
});

function premiumUser() {
    // Adding show leaderboard button
    document.getElementById('buy-premium-btn').style.visibility = "hidden";
    document.getElementById('nav-itemID').style.visibility = "hidden";

    const message = document.getElementById('message');
    message.innerText = "You are a premium user";
    
    // Check if leaderboard button exists before adding it
    if (!document.getElementById('leaderbtn')) {
        const leaderbtn = document.createElement('button');
        leaderbtn.innerText = "SHOW LEADERBOARD";
        leaderbtn.setAttribute("id", "leaderbtn");
        leaderbtn.addEventListener('click', showleaderboard);
        message.appendChild(leaderbtn);
    }

    // Check if reports button exists before adding it
    if (!document.getElementById('reports-btn')) {
        const newListItem = document.createElement('li');
        newListItem.className = 'nav-item';

        const newButton = document.createElement('button');
        newButton.id = 'reports-btn';
        newButton.className = 'btn btn-info nav-link';
        newButton.textContent = 'SHOW REPORTS';
        newButton.addEventListener('click', fetchReports);
        newListItem.appendChild(newButton);

        const ulElement = document.querySelector('.navbar-nav.ml-auto');
        ulElement.insertBefore(newListItem, ulElement.firstChild);
    }
}

async function showleaderboard() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://13.232.126.5:3000/premium/showleaderboard', { headers: { "Authorization": token } });
        
        const leaderboardElement = document.getElementById('leaderboard');
        leaderboardElement.innerHTML = ""; // Clear previous leaderboard data
        response.data.data.forEach(userDetails => {
            leaderboardElement.innerHTML += `<li>
                <span class="user-name">Name: ${userDetails.name}</span>
                <span class="total-expense">Total Expense: ${userDetails.totalExpense}</span>
            </li>`;
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
    }
}

async function fetchReports() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        const response = await axios.get('http://13.232.126.5:3000/premium/reports', {
            headers: { "Authorization": token }
        });
        
       localStorage.setItem('reportsData', JSON.stringify(response.data.result))
        if (response.data.status === 'success') {
            console.log('In frontend fetchReport before redirecting');
            window.location.href = 'http://13.232.126.5:3000/premium/reportsPage'
        } else {
            console.error('Error fetching reports:', response.data.message);
        }
    } catch (error) {
        console.error('Error fetching reports:', error);
    }
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function formatDate(isoString) {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-based
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}


document.getElementById('setItemsPerPageBtn').addEventListener('click', () => {
    const itemsPerPageInput = document.getElementById('itemsPerPageInput').value;
    itemsPerPage = parseInt(itemsPerPageInput);
    localStorage.setItem('itemsPerPage', itemsPerPage);
    fetchExpenses(currentPage, itemsPerPage);
});

document.getElementById('itemsPerPageInput').value = itemsPerPage;

document.getElementById('signupForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent page refresh

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/user/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const result = await response.json();
        console.log("API Response:", result);

        if (response.ok) {
            alert("Signup successful!");
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        alert("Failed to connect to the server.");
    }
});

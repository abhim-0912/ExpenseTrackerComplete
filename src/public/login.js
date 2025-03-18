document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch('/user/login',{
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({email,password})
        });

        const result = await response.json();
        console.log(result);

        if(response.ok){
            console.log("Login Successful: ",result);
        } else {
            alert("Error: "+result.message);
        }

    } catch (error) {
        console.error("Fetch error : ",error);
        alert("Failed to connect to Server");
    }
});
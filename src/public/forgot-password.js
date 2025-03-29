const forgotPasswordForm = document.getElementById('forgot-password-form');

forgotPasswordForm.addEventListener('submit',async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    try {
        const response = await fetch('/user/forgot-password',{
            method: "POST",
            headers : {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({email}),
        });
        const result = await response.json();
        if(response.ok){
            alert("Password Reset Link sent Succesfully to your email");
        } else {
            alert(result.message || "Something went wrong");
        }
    } catch(error) {
        alert("Error sending reset link");
        console.error(error);
    }
});


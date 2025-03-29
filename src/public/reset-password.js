const form = document.getElementById('resetPasswordForm');

form.addEventListener('submit',async (e) => {
    e.preventDefault();
    const token = new URLSearchParams(window.location.search).get('token');
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if(newPassword!==confirmPassword){
        alert("Confirm password doesnt match with New password");
        return;
    }
    try {
        const response = await fetch('/user/reset-password',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body : JSON.stringify({token,newPassword})
        });
        const result = await response.json();
        if(response.ok){
            alert("Password Reset Successfull");
            setTimeout(() => {
                window.location.href = "/login.html";
              }, 1000);
        }
    } catch(error) {
        alert("Error resetting the password");
        console.error(error);
    }
})
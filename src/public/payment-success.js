document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication error. Please login again.");
      window.location.href = "/login.html";
      return;
    }
  
    try {
      const response = await fetch("/purchase/verify-payment", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const result = await response.json();
  
      if (result.success && result.newToken) {
        localStorage.setItem("token", result.newToken);
        alert("You are now a Premium User!");
      } else {
        alert(result.message || "Payment verification failed");
      }
  
      setTimeout(() => {
        window.location.href = "/expenses.html";
      }, 3000);
    } catch (err) {
      console.error("Verification error:", err);
      alert("Something went wrong during verification.");
      window.location.href = "/expenses.html";
    }
  });
  
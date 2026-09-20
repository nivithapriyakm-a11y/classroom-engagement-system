function login() {

    const email = document.querySelector('input[type="email"]').value;
    const password = document.querySelector('input[type="password"]').value;

    if (email === "" || password === "") {
        alert("Please enter your email and password.");
        return;
    }

    window.location.href = "role.html";
}
/* =========================================================
   CLASSPULSE - COMPLETE SCRIPT
   public/script.js
========================================================= */


/* =========================================================
   LOGIN / REGISTER TABS
========================================================= */

function showLogin() {

    const loginContainer =
        document.getElementById("login-form-container");

    const registerContainer =
        document.getElementById("register-form-container");

    const loginTab =
        document.getElementById("login-tab");

    const registerTab =
        document.getElementById("register-tab");

    if (loginContainer)
        loginContainer.classList.remove("hidden");

    if (registerContainer)
        registerContainer.classList.add("hidden");

    if (loginTab)
        loginTab.classList.add("active");

    if (registerTab)
        registerTab.classList.remove("active");
}


function showRegister() {

    const loginContainer =
        document.getElementById("login-form-container");

    const registerContainer =
        document.getElementById("register-form-container");

    const loginTab =
        document.getElementById("login-tab");

    const registerTab =
        document.getElementById("register-tab");

    if (loginContainer)
        loginContainer.classList.add("hidden");

    if (registerContainer)
        registerContainer.classList.remove("hidden");

    if (loginTab)
        loginTab.classList.remove("active");

    if (registerTab)
        registerTab.classList.add("active");
}


/* =========================================================
   LOGIN ROLE
========================================================= */

function selectRole(role) {

    const studentButton =
        document.getElementById("student-role");

    const teacherButton =
        document.getElementById("teacher-role");

    const roleInput =
        document.getElementById("login-role");

    if (!studentButton || !teacherButton || !roleInput)
        return;

    if (role === "student") {

        studentButton.classList.add("active");
        teacherButton.classList.remove("active");

        roleInput.value = "student";
    }

    if (role === "teacher") {

        teacherButton.classList.add("active");
        studentButton.classList.remove("active");

        roleInput.value = "teacher";
    }
}


/* =========================================================
   REGISTER ROLE
========================================================= */

function selectRegisterRole(role) {

    const studentButton =
        document.getElementById("register-student-role");

    const teacherButton =
        document.getElementById("register-teacher-role");

    const roleInput =
        document.getElementById("register-role");

    if (!studentButton || !teacherButton || !roleInput)
        return;

    if (role === "student") {

        studentButton.classList.add("active");
        teacherButton.classList.remove("active");

        roleInput.value = "student";
    }

    if (role === "teacher") {

        teacherButton.classList.add("active");
        studentButton.classList.remove("active");

        roleInput.value = "teacher";
    }
}


/* =========================================================
   LOGIN
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const loginForm =
        document.getElementById("login-form");

    if (!loginForm)
        return;


    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        const email =
            document.getElementById("login-email").value.trim();

        const password =
            document.getElementById("login-password").value;

        const role =
            document.getElementById("login-role").value;

        const message =
            document.getElementById("login-message");


        message.textContent = "";
        message.className = "message";


        try {

            const response = await fetch("/api/auth/login", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password,
                    role: role
                })

            });


            /*
             * Get response safely.
             * This prevents JSON.parse errors if
             * the server sends HTML instead of JSON.
             */

            const contentType =
                response.headers.get("content-type") || "";


            let data;


            if (contentType.includes("application/json")) {

                data = await response.json();

            } else {

                const text = await response.text();

                console.error(
                    "Server returned non-JSON:",
                    text
                );

                throw new Error(
                    "Server returned an unexpected response."
                );
            }


            /* =================================================
               LOGIN FAILED
            ================================================= */

            if (!response.ok) {

                message.textContent =
                    data.message || "Login failed.";

                message.classList.add("error");

                return;
            }


            /* =================================================
               LOGIN SUCCESS
            ================================================= */

            message.textContent =
                data.message || "Login successful.";

            message.classList.add("success");


            /*
             * Save login information
             */

            localStorage.setItem(
                "classpulseToken",
                data.token
            );

            localStorage.setItem(
                "classpulseUser",
                JSON.stringify(data.user)
            );


            /*
             * Redirect according to role
             */

            setTimeout(function () {

              if (data.user.role === "teacher") {

    window.location.href = "/teacher";

} else {

    window.location.href = "/student";

}

            }, 500);


        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            message.textContent =
                error.message ||
                "Unable to login. Please try again.";

            message.classList.add("error");
        }

    });

});


/* =========================================================
   REGISTER
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const registerForm =
        document.getElementById("register-form");

    if (!registerForm)
        return;


    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        const name =
            document.getElementById("register-name").value.trim();

        const email =
            document.getElementById("register-email").value.trim();

        const password =
            document.getElementById("register-password").value;

        const role =
            document.getElementById("register-role").value;

        const message =
            document.getElementById("register-message");


        message.textContent = "";
        message.className = "message";


        try {

            const response = await fetch("/api/auth/register", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password,
                    role: role
                })

            });


            const contentType =
                response.headers.get("content-type") || "";


            let data;


            if (contentType.includes("application/json")) {

                data = await response.json();

            } else {

                const text = await response.text();

                console.error(
                    "Server returned non-JSON:",
                    text
                );

                throw new Error(
                    "Server returned an unexpected response."
                );
            }


            /* =================================================
               REGISTER FAILED
            ================================================= */

            if (!response.ok) {

                message.textContent =
                    data.message || "Registration failed.";

                message.classList.add("error");

                return;
            }


            /* =================================================
               REGISTER SUCCESS
            ================================================= */

            message.textContent =
                data.message ||
                "Account created successfully.";

            message.classList.add("success");


            /*
             * Clear form
             */

            registerForm.reset();


            /*
             * Keep student as default role
             */

            selectRegisterRole("student");


            /*
             * After successful registration,
             * show login page.
             */

            setTimeout(function () {

                showLogin();

                const loginEmail =
                    document.getElementById("login-email");

                if (loginEmail) {

                    loginEmail.value = email;

                }

            }, 800);


        } catch (error) {

            console.error(
                "Register error:",
                error
            );

            message.textContent =
                error.message ||
                "Unable to create account.";

            message.classList.add("error");
        }

    });

});


/* =========================================================
   NAVIGATION - SMOOTH SCROLL
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const navLinks =
        document.querySelectorAll(
            ".navbar-menu a, .nav-menu a, .navbar a"
        );


    navLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            const targetId =
                this.getAttribute("href");


            if (!targetId)
                return;


            if (targetId.startsWith("#")) {

                const target =
                    document.querySelector(targetId);


                if (target) {

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }

        });

    });

});


/* =========================================================
   ACTIVE NAVIGATION LINK
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const sections =
        document.querySelectorAll("section[id]");

    const navLinks =
        document.querySelectorAll(
            ".navbar-menu a, .nav-menu a, .navbar a"
        );


    if (!sections.length || !navLinks.length)
        return;


    window.addEventListener("scroll", function () {

        let currentSection = "";


        sections.forEach(function (section) {

            const sectionTop =
                section.offsetTop - 150;

            const sectionHeight =
                section.offsetHeight;


            if (
                window.scrollY >= sectionTop &&
                window.scrollY <
                sectionTop + sectionHeight
            ) {

                currentSection =
                    section.getAttribute("id");

            }

        });


        navLinks.forEach(function (link) {

            link.classList.remove("active");


            const href =
                link.getAttribute("href");


            if (
                href &&
                href === "#" + currentSection
            ) {

                link.classList.add("active");

            }

        });

    });

});


/* =========================================================
   MOBILE MENU
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const menuButton =
        document.getElementById("mobile-menu-btn");

    const navMenu =
        document.querySelector(
            ".navbar-menu, .nav-menu"
        );


    if (!menuButton || !navMenu)
        return;


    menuButton.addEventListener("click", function () {

        navMenu.classList.toggle(
            "mobile-open"
        );

        menuButton.classList.toggle(
            "active"
        );

    });


    navMenu.querySelectorAll("a").forEach(function (link) {

        link.addEventListener("click", function () {

            navMenu.classList.remove(
                "mobile-open"
            );

            menuButton.classList.remove(
                "active"
            );

        });

    });

});


/* =========================================================
   BUTTON CLICK EFFECT
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const buttons =
        document.querySelectorAll("button");


    buttons.forEach(function (button) {

        button.addEventListener("click", function () {

            this.classList.add("clicked");


            setTimeout(function () {

                button.classList.remove("clicked");

            }, 150);

        });

    });

});


/* =========================================================
   INPUT FOCUS EFFECT
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const inputs =
        document.querySelectorAll(
            "input, textarea"
        );


    inputs.forEach(function (input) {

        input.addEventListener("focus", function () {

            const parent =
                this.closest(".form-group");


            if (parent)
                parent.classList.add("focused");

        });


        input.addEventListener("blur", function () {

            const parent =
                this.closest(".form-group");


            if (parent)
                parent.classList.remove("focused");

        });

    });

});


/* =========================================================
   PREVENT EMPTY LINKS
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    document
        .querySelectorAll('a[href="#"]')
        .forEach(function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                }
            );

        });

});


/* =========================================================
   DEFAULT LOGIN PAGE
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const loginContainer =
        document.getElementById(
            "login-form-container"
        );

    const registerContainer =
        document.getElementById(
            "register-form-container"
        );


    if (loginContainer && registerContainer) {

        loginContainer.classList.remove(
            "hidden"
        );

        registerContainer.classList.add(
            "hidden"
        );

    }


    const roleInput =
        document.getElementById("login-role");

    const studentButton =
        document.getElementById("student-role");


    if (roleInput && !roleInput.value) {

        roleInput.value = "student";

    }


    if (studentButton) {

        studentButton.classList.add(
            "active"
        );

    }

});
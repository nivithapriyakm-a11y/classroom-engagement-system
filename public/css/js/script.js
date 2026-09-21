// ============================================================
// ClassPulse - Frontend JavaScript
// public/js/script.js
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    // ========================================================
    // GLOBAL VARIABLES
    // ========================================================

    let currentRole = "student";
    let currentClassCode = "";
    let currentClass = null;

    let selectedUnderstanding = "";
    let selectedRating = 0;
    let selectedQuizAnswer = null;

    let socket = null;


    // ========================================================
    // COMMON HELPERS
    // ========================================================

    function $(id) {
        return document.getElementById(id);
    }


    function show(element) {
        if (element) {
            element.classList.remove("hidden");
        }
    }


    function hide(element) {
        if (element) {
            element.classList.add("hidden");
        }
    }


    function setText(id, value) {
        const element = $(id);

        if (element) {
            element.textContent = value ?? "";
        }
    }


    function showMessage(id, message, type = "") {

        const element = $(id);

        if (!element) return;

        element.textContent = message;
        element.className = "message";

        if (type) {
            element.classList.add(type);
        }
    }


    async function apiRequest(url, options = {}) {

        try {

            const response = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                },
                ...options
            });


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message || "Something went wrong."
                );

            }


            return data;

        } catch (error) {

            console.error("API Error:", error);

            throw error;

        }

    }


    // ========================================================
    // PAGE NAVIGATION
    // ========================================================

    function goToPage(page) {

        document
            .querySelectorAll(".page")
            .forEach(section => {
                section.classList.remove("active");
            });


        const target = $(page);

        if (target) {
            target.classList.add("active");
        }

    }


    // ========================================================
    // LOGIN / REGISTER TABS
    // ========================================================

    const loginTab = $("login-tab");
    const registerTab = $("register-tab");

    const loginForm = $("login-form");
    const registerForm = $("register-form");


    if (loginTab) {

        loginTab.addEventListener("click", () => {

            loginTab.classList.add("active");

            if (registerTab) {
                registerTab.classList.remove("active");
            }


            show(loginForm);
            hide(registerForm);

        });

    }


    if (registerTab) {

        registerTab.addEventListener("click", () => {

            registerTab.classList.add("active");

            if (loginTab) {
                loginTab.classList.remove("active");
            }


            show(registerForm);
            hide(loginForm);

        });

    }


    // ========================================================
    // ROLE SELECTION
    // ========================================================

    function setupRoleButtons() {

        const roleButtons =
            document.querySelectorAll(".role-btn");


        roleButtons.forEach(button => {

            button.addEventListener("click", () => {

                const parent =
                    button.closest(".role-buttons");


                if (parent) {

                    parent
                        .querySelectorAll(".role-btn")
                        .forEach(btn => {
                            btn.classList.remove("active");
                        });

                }


                button.classList.add("active");


                currentRole =
                    button.dataset.role || "student";

            });

        });

    }


    setupRoleButtons();


    // ========================================================
    // REGISTER
    // ========================================================

    const registerButton = $("register-btn");


    if (registerButton) {

        registerButton.addEventListener("click", async () => {

            const name =
                $("register-name")?.value.trim();

            const email =
                $("register-email")?.value.trim();

            const password =
                $("register-password")?.value;

            const confirmPassword =
                $("register-confirm-password")?.value;


            if (!name || !email || !password || !confirmPassword) {

                showMessage(
                    "register-message",
                    "Please fill all fields.",
                    "error"
                );

                return;

            }


            if (password !== confirmPassword) {

                showMessage(
                    "register-message",
                    "Passwords do not match.",
                    "error"
                );

                return;

            }


            if (password.length < 6) {

                showMessage(
                    "register-message",
                    "Password must contain at least 6 characters.",
                    "error"
                );

                return;

            }


            /*
             * NOTE:
             * Your current app.js does not yet contain
             * /api/auth/register.
             *
             * Therefore this section is prepared for the
             * professional backend that we will add next.
             */

            try {

                const data = await apiRequest(
                    "/api/auth/register",
                    {
                        method: "POST",
                        body: JSON.stringify({
                            name,
                            email,
                            password,
                            role: currentRole
                        })
                    }
                );


                showMessage(
                    "register-message",
                    data.message || "Account created successfully.",
                    "success"
                );


                setTimeout(() => {

                    if (loginTab) {
                        loginTab.click();
                    }

                }, 1000);


            } catch (error) {

                showMessage(
                    "register-message",
                    error.message,
                    "error"
                );

            }

        });

    }


    // ========================================================
    // LOGIN
    // ========================================================

    const loginButton = $("login-btn");


    if (loginButton) {

        loginButton.addEventListener("click", async () => {

            const email =
                $("login-email")?.value.trim();

            const password =
                $("login-password")?.value;


            if (!email || !password) {

                showMessage(
                    "login-message",
                    "Please enter email and password.",
                    "error"
                );

                return;

            }


            /*
             * NOTE:
             * This requires /api/auth/login.
             * The current app.js does not yet have this route.
             */

            try {

                const data = await apiRequest(
                    "/api/auth/login",
                    {
                        method: "POST",
                        body: JSON.stringify({
                            email,
                            password,
                            role: currentRole
                        })
                    }
                );


                if (data.token) {

                    localStorage.setItem(
                        "classpulse_token",
                        data.token
                    );

                }


                if (data.user) {

                    localStorage.setItem(
                        "classpulse_user",
                        JSON.stringify(data.user)
                    );

                }


                showMessage(
                    "login-message",
                    "Login successful.",
                    "success"
                );


                setTimeout(() => {

                    if (currentRole === "teacher") {

                        window.location.href = "/teacher";

                    } else {

                        window.location.href = "/student";

                    }

                }, 500);


            } catch (error) {

                showMessage(
                    "login-message",
                    error.message,
                    "error"
                );

            }

        });

    }


    // ========================================================
    // LOAD USER INFORMATION
    // ========================================================

    function loadUserInformation() {

        const userString =
            localStorage.getItem("classpulse_user");


        if (!userString) {
            return;
        }


        try {

            const user =
                JSON.parse(userString);


            const name =
                user.name ||
                user.fullName ||
                user.username ||
                "User";


            setText(
                "student-name-display",
                name
            );

            setText(
                "student-welcome-name",
                name
            );


            setText(
                "teacher-name-display",
                name
            );

            setText(
                "teacher-welcome-name",
                name
            );


        } catch (error) {

            console.error(
                "Could not load user information:",
                error
            );

        }

    }


    loadUserInformation();


    // ========================================================
    // LOGOUT
    // ========================================================

    function logout() {

        localStorage.removeItem(
            "classpulse_token"
        );

        localStorage.removeItem(
            "classpulse_user"
        );


        window.location.href = "/";

    }


    const studentLogout =
        $("student-logout-btn");

    const teacherLogout =
        $("teacher-logout-btn");


    if (studentLogout) {
        studentLogout.addEventListener(
            "click",
            logout
        );
    }


    if (teacherLogout) {
        teacherLogout.addEventListener(
            "click",
            logout
        );
    }


    // ========================================================
    // STUDENT - JOIN CLASS
    // ========================================================

    const joinClassButton =
        $("join-class-btn");


    if (joinClassButton) {

        joinClassButton.addEventListener(
            "click",
            joinClass
        );

    }


    async function joinClass() {

        const input =
            $("class-code-input");


        if (!input) return;


        const code =
            input.value.trim().toUpperCase();


        if (!code) {

            showMessage(
                "join-class-message",
                "Please enter a class code.",
                "error"
            );

            return;

        }


        try {

            /*
             * Current app.js supports:
             *
             * GET /api/classrooms/:code
             */

            const classroom =
                await apiRequest(
                    `/api/classrooms/${code}`
                );


            currentClassCode =
                classroom.code;


            currentClass =
                classroom;


            // Store class information
            localStorage.setItem(
                "classpulse_class_code",
                currentClassCode
            );


            // Display class information
            setText(
                "student-class-name",
                classroom.topic
            );

            setText(
                "student-class-topic",
                classroom.topic
            );

            setText(
                "student-class-code",
                classroom.code
            );


            show($("class-info"));


            showMessage(
                "join-class-message",
                "Successfully joined the class.",
                "success"
            );


            // Load quiz
            loadQuiz(classroom);


            // Connect Socket.IO
            connectStudentSocket(classroom.code);

        } catch (error) {

            showMessage(
                "join-class-message",
                error.message || "Class not found.",
                "error"
            );

        }

    }


    // ========================================================
    // STUDENT - LOAD QUIZ
    // ========================================================

    function loadQuiz(classroom) {

        const quizSection =
            $("student-quiz-section");


        if (!quizSection) return;


        show(quizSection);


        selectedQuizAnswer = null;


        setText(
            "quiz-progress",
            "1 / 1"
        );


        setText(
            "quiz-question-text",
            classroom.quizQuestion ||
            "No question available."
        );


        const optionsContainer =
            $("quiz-options");


        if (!optionsContainer) return;


        optionsContainer.innerHTML = "";


        const options =
            classroom.quizOptions || [];


        options.forEach((option, index) => {

            const button =
                document.createElement("button");


            button.type = "button";

            button.className =
                "quiz-option";


            button.dataset.answer =
                index;


            button.textContent =
                option;


            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".quiz-option"
                        )
                        .forEach(btn => {
                            btn.classList.remove(
                                "selected"
                            );
                        });


                    button.classList.add(
                        "selected"
                    );


                    selectedQuizAnswer =
                        index;

                }
            );


            optionsContainer.appendChild(
                button
            );

        });

    }


    // ========================================================
    // STUDENT - SUBMIT QUIZ
    // ========================================================

    const quizSubmitButton =
        $("quiz-submit-btn");


    if (quizSubmitButton) {

        quizSubmitButton.addEventListener(
            "click",
            submitQuiz
        );

    }


    async function submitQuiz() {

        if (selectedQuizAnswer === null) {

            showMessage(
                "quiz-message",
                "Please select an answer.",
                "error"
            );

            return;

        }


        if (!currentClassCode) {

            showMessage(
                "quiz-message",
                "Please join a class first.",
                "error"
            );

            return;

        }


        try {

            /*
             * The current backend stores quizAnswer
             * together with the pulse response.
             *
             * We temporarily keep the answer locally
             * until the student submits the pulse.
             */

            localStorage.setItem(
                "classpulse_quiz_answer",
                selectedQuizAnswer
            );


            showMessage(
                "quiz-message",
                "Answer selected successfully.",
                "success"
            );


            // Show pulse section
            show(
                $("student-pulse-section")
            );


            // Scroll to pulse
            $("student-pulse-section")
                ?.scrollIntoView({
                    behavior: "smooth"
                });


        } catch (error) {

            showMessage(
                "quiz-message",
                error.message,
                "error"
            );

        }

    }


    // ========================================================
    // STUDENT - UNDERSTANDING SELECTION
    // ========================================================

    const pulseOptions =
        document.querySelectorAll(
            ".pulse-option"
        );


    pulseOptions.forEach(option => {

        option.addEventListener(
            "click",
            () => {

                pulseOptions.forEach(
                    item => {
                        item.classList.remove(
                            "selected"
                        );
                    }
                );


                option.classList.add(
                    "selected"
                );


                selectedUnderstanding =
                    option.dataset.understanding || "";

            }
        );

    });


    // ========================================================
    // STUDENT - CLASS RATING
    // ========================================================

    const ratingButtons =
        document.querySelectorAll(
            "#class-rating button"
        );


    ratingButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                ratingButtons.forEach(
                    item => {
                        item.classList.remove(
                            "selected"
                        );
                    }
                );


                button.classList.add(
                    "selected"
                );


                selectedRating =
                    Number(
                        button.dataset.rating
                    );

            }
        );

    });


    // ========================================================
    // STUDENT - SUBMIT PULSE
    // ========================================================

    const submitPulseButton =
        $("submit-pulse-btn");


    if (submitPulseButton) {

        submitPulseButton.addEventListener(
            "click",
            submitPulse
        );

    }


    async function submitPulse() {

        if (!currentClassCode) {

            showMessage(
                "pulse-message",
                "Please join a class first.",
                "error"
            );

            return;

        }


        if (!selectedUnderstanding) {

            showMessage(
                "pulse-message",
                "Please select your understanding level.",
                "error"
            );

            return;

        }


        const savedAnswer =
            localStorage.getItem(
                "classpulse_quiz_answer"
            );


        if (savedAnswer === null) {

            showMessage(
                "pulse-message",
                "Please complete the quiz first.",
                "error"
            );

            return;

        }


        const quizAnswer =
            Number(savedAnswer);


        try {

            /*
             * Current app.js endpoint:
             *
             * POST /api/responses
             */

            const data =
                await apiRequest(
                    "/api/responses",
                    {
                        method: "POST",

                        body: JSON.stringify({
                            classCode:
                                currentClassCode,

                            understanding:
                                selectedUnderstanding,

                            quizAnswer:
                                quizAnswer
                        })
                    }
                );


            showMessage(
                "pulse-message",
                "Your classroom pulse has been submitted.",
                "success"
            );


            // Display result
            displayStudentResult(
                data.stats
            );


            // Clear saved answer
            localStorage.removeItem(
                "classpulse_quiz_answer"
            );


            // Update teacher dashboard through socket
            if (socket) {

                socket.emit(
                    "student-response-submitted",
                    currentClassCode
                );

            }


        } catch (error) {

            showMessage(
                "pulse-message",
                error.message ||
                "Could not submit your response.",
                "error"
            );

        }

    }


    // ========================================================
    // STUDENT - DISPLAY RESULT
    // ========================================================

    function displayStudentResult(stats) {

        if (!stats) return;


        show(
            $("student-result-section")
        );


        setText(
            "result-accuracy",
            `${stats.quizAccuracy || 0}%`
        );


        setText(
            "result-quiz",
            `${stats.quizAccuracy || 0}%`
        );


        setText(
            "result-participation",
            "Completed"
        );


        setText(
            "result-understanding",
            getUnderstandingText(stats)
        );


        let level = "Needs Support";


        if (stats.cri >= 75) {

            level = "High Engagement";

        } else if (stats.cri >= 50) {

            level = "Moderate Engagement";

        }


        setText(
            "result-level",
            level
        );


        setText(
            "student-ai-insight",
            generateStudentInsight(stats)
        );


        setText(
            "student-recommendation",
            generateStudentRecommendation(stats)
        );


        $("student-result-section")
            ?.scrollIntoView({
                behavior: "smooth"
            });

    }


    function getUnderstandingText(stats) {

        if (!stats.total) {
            return "No data";
        }


        if (
            stats.understand >=
            stats.somewhat &&
            stats.understand >=
            stats.dontUnderstand
        ) {

            return "Good";

        }


        if (
            stats.dontUnderstand >
            stats.understand
        ) {

            return "Needs Improvement";

        }


        return "Moderate";

    }


    function generateStudentInsight(stats) {

        if (!stats || !stats.total) {

            return "Your engagement data is being collected.";

        }


        if (stats.cri >= 75) {

            return "Your responses indicate good understanding and participation in the classroom.";

        }


        if (stats.cri >= 50) {

            return "You are participating, but reviewing the topic again may improve your understanding.";

        }


        return "Consider reviewing the topic and asking your teacher for additional clarification.";

    }


    function generateStudentRecommendation(stats) {

        if (!stats || !stats.total) {

            return "Continue participating in classroom activities.";

        }


        if (stats.cri >= 75) {

            return "Keep participating actively and maintain your learning progress.";

        }


        if (stats.cri >= 50) {

            return "Review the topic once more and participate in the next classroom activity.";

        }


        return "Ask questions, review the topic, and seek clarification from your teacher.";

    }


    // ========================================================
    // SOCKET.IO - STUDENT
    // ========================================================

    function connectStudentSocket(code) {

        if (
            typeof io === "undefined"
        ) {

            console.warn(
                "Socket.IO is not available."
            );

            return;

        }


        if (socket) {

            socket.disconnect();

        }


        socket = io();


        socket.on(
            "connect",
            () => {

                console.log(
                    "Student Socket connected."
                );


                socket.emit(
                    "join-class",
                    code
                );

            }
        );


        socket.on(
            "stats:update",
            stats => {

                console.log(
                    "Live stats received:",
                    stats
                );

            }
        );

    }


    // ========================================================
    // TEACHER - CREATE CLASS
    // ========================================================

    const createClassButton =
        $("create-class-btn");


    if (createClassButton) {

        createClassButton.addEventListener(
            "click",
            createClass
        );

    }


    async function createClass() {

        const topic =
            $("new-class-subject")
                ?.value
                .trim();


        const className =
            $("new-class-name")
                ?.value
                .trim();


        if (!className || !topic) {

            showMessage(
                "create-class-message",
                "Please enter class name and subject.",
                "error"
            );

            return;

        }


        /*
         * Current backend expects:
         *
         * topic
         * quizQuestion
         * quizOptions
         * correctAnswer
         *
         * Therefore the current UI needs a question.
         *
         * Until the backend is upgraded to a question
         * bank, these values are requested from the
         * teacher through prompts.
         */


        const quizQuestion =
            prompt(
                `Enter one quiz question for ${topic}:`
            );


        if (!quizQuestion) {

            return;

        }


        const option1 =
            prompt("Enter option 1:");


        const option2 =
            prompt("Enter option 2:");


        const option3 =
            prompt("Enter option 3:");


        const option4 =
            prompt("Enter option 4:");


        if (
            !option1 ||
            !option2 ||
            !option3 ||
            !option4
        ) {

            showMessage(
                "create-class-message",
                "Please enter all four options.",
                "error"
            );

            return;

        }


        const correctAnswer =
            prompt(
                "Enter correct option number (1-4):"
            );


        const correctIndex =
            Number(correctAnswer) - 1;


        if (
            correctIndex < 0 ||
            correctIndex > 3 ||
            Number.isNaN(correctIndex)
        ) {

            showMessage(
                "create-class-message",
                "Correct answer must be between 1 and 4.",
                "error"
            );

            return;

        }


        try {

            const data =
                await apiRequest(
                    "/api/classrooms",
                    {
                        method: "POST",

                        body: JSON.stringify({

                            topic,

                            quizQuestion,

                            quizOptions: [
                                option1,
                                option2,
                                option3,
                                option4
                            ],

                            correctAnswer:
                                correctIndex

                        })
                    }
                );


            const code =
                data.code;


            setText(
                "created-class-code",
                code
            );


            show(
                $("created-class-info")
            );


            showMessage(
                "create-class-message",
                "Class created successfully.",
                "success"
            );


            currentClassCode =
                code;


            // Save class code
            localStorage.setItem(
                "teacher_class_code",
                code
            );


            // Load dashboard
            loadTeacherStats(code);


            // Connect teacher socket
            connectTeacherSocket(code);


        } catch (error) {

            showMessage(
                "create-class-message",
                error.message ||
                "Could not create class.",
                "error"
            );

        }

    }


    // ========================================================
    // TEACHER - LOAD STATS
    // ========================================================

    async function loadTeacherStats(code) {

        if (!code) return;


        try {

            const stats =
                await apiRequest(
                    `/api/stats/${code}`
                );


            updateTeacherDashboard(
                stats
            );


        } catch (error) {

            console.error(
                "Could not load teacher statistics:",
                error
            );

        }

    }


    // ========================================================
    // TEACHER - UPDATE DASHBOARD
    // ========================================================

    function updateTeacherDashboard(stats) {

        if (!stats) return;


        show(
            $("teacher-stats-section")
        );


        // -----------------------------------------
        // TOTAL STUDENTS
        // -----------------------------------------

        setText(
            "total-students",
            stats.total || 0
        );


        // -----------------------------------------
        // HIGH / MEDIUM / LOW
        // -----------------------------------------

        const total =
            Number(stats.total || 0);


        let high = 0;
        let medium = 0;
        let low = 0;


        /*
         * Current backend does not yet return
         * engagement levels.
         *
         * We estimate the distribution from
         * understanding responses.
         */

        if (total > 0) {

            high =
                Math.round(
                    (
                        stats.understand /
                        total
                    ) * 100
                );


            medium =
                Math.round(
                    (
                        stats.somewhat /
                        total
                    ) * 100
                );


            low =
                Math.round(
                    (
                        stats.dontUnderstand /
                        total
                    ) * 100
                );

        }


        setText(
            "high-percentage",
            `${high}%`
        );


        setText(
            "medium-percentage",
            `${medium}%`
        );


        setText(
            "low-percentage",
            `${low}%`
        );


        // -----------------------------------------
        // ENGAGED COUNTS
        // -----------------------------------------

        setText(
            "highly-engaged",
            stats.understand || 0
        );


        setText(
            "needs-attention",
            stats.dontUnderstand || 0
        );


        // -----------------------------------------
        // AVERAGE ENGAGEMENT
        // -----------------------------------------

        setText(
            "avg-engagement",
            `${stats.cri || 0}%`
        );


        setText(
            "class-engagement-percentage",
            `${stats.cri || 0}%`
        );


        // -----------------------------------------
        // PROGRESS BAR
        // -----------------------------------------

        const progressBar =
            $("engagement-progress-bar");


        if (progressBar) {

            progressBar.style.width =
                `${Math.min(
                    100,
                    Math.max(
                        0,
                        stats.cri || 0
                    )
                )}%`;

        }


        // -----------------------------------------
        // PULSE
        // -----------------------------------------

        setText(
            "pulse-understand",
            stats.understand || 0
        );


        setText(
            "pulse-somewhat",
            stats.somewhat || 0
        );


        setText(
            "pulse-dont-understand",
            stats.dontUnderstand || 0
        );


        setText(
            "class-cri",
            stats.cri || 0
        );


        // -----------------------------------------
        // STATUS
        // -----------------------------------------

        setText(
            "class-status",
            stats.status ||
            "Waiting for student responses."
        );


        // -----------------------------------------
        // AI INSIGHT
        // -----------------------------------------

        setText(
            "teacher-ai-insight",
            generateTeacherInsight(stats)
        );


        setText(
            "teacher-recommendation",
            generateTeacherRecommendation(stats)
        );

    }


    // ========================================================
    // TEACHER - AI INSIGHT
    // ========================================================

    function generateTeacherInsight(stats) {

        if (!stats || !stats.total) {

            return "Waiting for student responses. Classroom insights will appear after students participate.";

        }


        if (stats.cri >= 75) {

            return `${stats.understand} students indicated that they understand the topic. Overall classroom engagement is currently ${stats.cri}%.`;

        }


        if (stats.cri >= 50) {

            return `${stats.somewhat} students reported partial understanding. Some students may benefit from additional explanation or examples.`;

        }


        return `${stats.dontUnderstand} students indicated that they need help. The topic may require additional explanation before moving forward.`;

    }


    function generateTeacherRecommendation(stats) {

        if (!stats || !stats.total) {

            return "Ask students to join the class and complete the quiz and classroom pulse.";

        }


        if (stats.cri >= 75) {

            return "Continue with the planned lesson and maintain active student participation.";

        }


        if (stats.cri >= 50) {

            return "Consider revisiting the difficult parts of the topic and provide additional examples.";

        }


        return "Pause and provide additional explanation, examples, or a short revision activity.";

    }


    // ========================================================
    // SOCKET.IO - TEACHER
    // ========================================================

    function connectTeacherSocket(code) {

        if (
            typeof io === "undefined"
        ) {

            console.warn(
                "Socket.IO is not available."
            );

            return;

        }


        if (socket) {

            socket.disconnect();

        }


        socket = io();


        socket.on(
            "connect",
            () => {

                console.log(
                    "Teacher Socket connected."
                );


                socket.emit(
                    "join-class",
                    code
                );

            }
        );


        socket.on(
            "stats:update",
            stats => {

                console.log(
                    "Live teacher stats:",
                    stats
                );


                updateTeacherDashboard(
                    stats
                );

            }
        );

    }


    // ========================================================
    // LOAD SAVED TEACHER CLASS
    // ========================================================

    const savedTeacherClass =
        localStorage.getItem(
            "teacher_class_code"
        );


    if (
        savedTeacherClass &&
        $("teacher-page")
    ) {

        currentClassCode =
            savedTeacherClass;


        loadTeacherStats(
            savedTeacherClass
        );


        connectTeacherSocket(
            savedTeacherClass
        );

    }


    // ========================================================
    // LOAD SAVED STUDENT CLASS
    // ========================================================

    const savedStudentClass =
        localStorage.getItem(
            "classpulse_class_code"
        );


    if (
        savedStudentClass &&
        $("student-page")
    ) {

        currentClassCode =
            savedStudentClass;


        $("class-code-input").value =
            savedStudentClass;


        joinClass();

    }


    // ========================================================
    // ENTER KEY SUPPORT
    // ========================================================

    const classCodeInput =
        $("class-code-input");


    if (classCodeInput) {

        classCodeInput.addEventListener(
            "keypress",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    joinClass();

                }

            }
        );

    }


    // ========================================================
    // CREATE CLASS ENTER SUPPORT
    // ========================================================

    const subjectInput =
        $("new-class-subject");


    if (subjectInput) {

        subjectInput.addEventListener(
            "keypress",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    createClass();

                }

            }
        );

    }


    // ========================================================
    // INITIAL PAGE DETECTION
    // ========================================================

    const currentPath =
        window.location.pathname;


    if (currentPath === "/student") {

        console.log(
            "ClassPulse Student Dashboard loaded."
        );

    }


    if (currentPath === "/teacher") {

        console.log(
            "ClassPulse Teacher Dashboard loaded."
        );

    }


    if (currentPath === "/") {

        console.log(
            "ClassPulse Home page loaded."
        );

    }


});
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");


dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const geminiRoutes = require("./routes/gemini");


const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/gemini", geminiRoutes);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err.message));

const classSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, required: true },
    topic: { type: String, required: true },
    quizQuestion: { type: String, required: true },
    quizOptions: [{ type: String }],
    correctAnswer: { type: Number, required: true }
  },
  { timestamps: true }
);

const responseSchema = new mongoose.Schema(
  {
    classCode: { type: String, required: true, index: true },
    understanding: {
      type: String,
      enum: ["understand", "somewhat", "dont-understand"],
      required: true
    },
    topic: { type: String, required: true },
    quizAnswer: { type: Number, required: true },
    quizCorrect: { type: Boolean, required: true }
  },
  { timestamps: true }
);

const Classroom = mongoose.model("Classroom", classSchema);
const Response = mongoose.model("Response", responseSchema);

function makeCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function getStats(code) {
  const responses = await Response.find({ classCode: code }).lean();

  const total = responses.length;
  const understand = responses.filter(r => r.understanding === "understand").length;
  const somewhat = responses.filter(r => r.understanding === "somewhat").length;
  const dontUnderstand = responses.filter(r => r.understanding === "dont-understand").length;
  const correct = responses.filter(r => r.quizCorrect).length;

  // Simple hackathon-friendly Classroom Resonance Index.
  // Understanding: 70% weight, quiz accuracy: 30% weight.
  const understandingScore = total
    ? ((understand * 100) + (somewhat * 50)) / total
    : 0;

  const quizScore = total ? (correct / total) * 100 : 0;
  const cri = total
    ? Math.round((understandingScore * 0.7) + (quizScore * 0.3))
    : 0;

  let status = "Waiting for responses";
  if (total > 0 && cri >= 75) status = "Class is following well";
  else if (total > 0 && cri >= 50) status = "Some students may need clarification";
  else if (total > 0) status = "Topic needs more explanation";

  return {
    total,
    understand,
    somewhat,
    dontUnderstand,
    correct,
    quizAccuracy: total ? Math.round((correct / total) * 100) : 0,
    cri,
    status
  };
}

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/teacher", (req, res) => {
  res.render("teacher");
});

app.get("/student", (req, res) => {
  res.render("student");
});

app.post("/api/classrooms", async (req, res) => {
  try {
    const { topic, quizQuestion, quizOptions, correctAnswer } = req.body;

    if (!topic || !quizQuestion || !quizOptions || correctAnswer === undefined) {
      return res.status(400).json({ message: "Please fill all fields." });
    }

    let code;
    do {
      code = makeCode();
    } while (await Classroom.exists({ code }));

    const classroom = await Classroom.create({
      code,
      topic,
      quizQuestion,
      quizOptions,
      correctAnswer: Number(correctAnswer)
    });

    res.json({ code: classroom.code });
  } catch (err) {
    res.status(500).json({ message: "Could not create class." });
  }
});

app.get("/api/classrooms/:code", async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const classroom = await Classroom.findOne({ code }).lean();

    if (!classroom) {
      return res.status(404).json({ message: "Class not found." });
    }

    res.json({
      code: classroom.code,
      topic: classroom.topic,
      quizQuestion: classroom.quizQuestion,
      quizOptions: classroom.quizOptions
    });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

app.post("/api/responses", async (req, res) => {
  try {
    const { classCode, understanding, quizAnswer } = req.body;

    const classroom = await Classroom.findOne({
      code: classCode.toUpperCase()
    });

    if (!classroom) {
      return res.status(404).json({ message: "Class not found." });
    }

    const validLevels = ["understand", "somewhat", "dont-understand"];
    if (!validLevels.includes(understanding)) {
      return res.status(400).json({ message: "Invalid understanding level." });
    }

    const answer = Number(quizAnswer);
    const saved = await Response.create({
      classCode: classroom.code,
      understanding,
      topic: classroom.topic,
      quizAnswer: answer,
      quizCorrect: answer === classroom.correctAnswer
    });

    const stats = await getStats(classroom.code);
    io.to(classroom.code).emit("stats:update", stats);

    res.json({ message: "Response submitted.", stats });
  } catch (err) {
    res.status(500).json({ message: "Could not submit response." });
  }
});

app.get("/api/stats/:code", async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const classroom = await Classroom.findOne({ code });

    if (!classroom) {
      return res.status(404).json({ message: "Class not found." });
    }

    const stats = await getStats(code);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: "Could not load stats." });
  }
});

io.on("connection", (socket) => {
  socket.on("join-class", (code) => {
    socket.join(code.toUpperCase());
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
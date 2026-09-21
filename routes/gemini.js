const express = require("express");
const router = express.Router();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

router.post("/analyze", async (req, res) => {

    try {

        const understand = req.body.understand;
        const somewhat = req.body.somewhat;
        const dontUnderstand = req.body.dontUnderstand;
        const topic = req.body.topic;

        const prompt = `
You are an AI assistant for a classroom engagement system.

Today's topic is: ${topic}

Student understanding:
Understand: ${understand}
Somewhat understand: ${somewhat}
Don't understand: ${dontUnderstand}

Analyze this classroom situation.

Give the teacher:
1. A short observation
2. A simple teaching suggestion
3. One quick activity or question for students

Use simple English.
Do not give a very long answer.
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt
        });

        res.json({
            success: true,
            suggestion: response.text
        });

    } catch (error) {

        console.error("Gemini Error:", error);

        res.status(500).json({
            success: false,
            message: "Gemini AI failed"
        });

    }

});

module.exports = router;
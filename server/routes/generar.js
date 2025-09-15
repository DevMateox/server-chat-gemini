
require("dotenv").config();
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const pool = require("../../database/db");

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

router.post("/", async (req, res, next) => {
  try {
    const { prompt, pdfNombre } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const respuesta = result.response.text();

    await pool.query(
      "INSERT INTO historial_chat (pdf_nombre, pregunta, respuesta) VALUES ($1, $2, $3)",
      [pdfNombre || "SoloConversacion", prompt, respuesta]
    );

    res.json({ prompt, respuesta });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

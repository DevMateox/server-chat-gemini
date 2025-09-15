const express = require("express");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const pool = require("../../database/db");

const router = express.Router();
const upload = multer({ dest: "uploads/" });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Variable en memoria para guardar el texto del PDF temporalmente
let textoPDF = "";
let pdfNombreActual = "";

// Subir y procesar PDF
router.post("/subir", upload.single("pdf"), async (req, res) => {
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    textoPDF = pdfData.text;
    pdfNombreActual = req.file.originalname;
    fs.unlinkSync(req.file.path);

    res.json({ mensaje: "PDF procesado, ya puedes hacer preguntas." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error procesando PDF" });
  }
});

// Preguntar sobre el PDF
router.post("/preguntar", async (req, res) => {
  try {
    const { pregunta } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
Eres un asistente que conoce el contenido del siguiente PDF:
${textoPDF}

Usuario pregunta: "${pregunta}"
Responde de forma clara, concisa y conversacional.
`;

    const result = await model.generateContent(prompt);
    const respuesta = result.response.text();

    // Guardar historial
    await pool.query(
      "INSERT INTO historial_chat (pdf_nombre, pregunta, respuesta) VALUES ($1, $2, $3)",
      [pdfNombreActual || "sinPDF", pregunta, respuesta]
    );

    res.json({ respuesta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generando respuesta" });
  }
});

module.exports = router;

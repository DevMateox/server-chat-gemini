const express = require("express");
const pool = require("../../database/db"); // tu conexión a PostgreSQL

const router = express.Router();

// GET /historial → devuelve todo el historial
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        pdf_nombre,
        pregunta,
        respuesta,
        created_at
      FROM historial_chat
      ORDER BY created_at DESC
    `);

    // Devuelve un array con todos los registros
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el historial completo" });
  }
});

module.exports = router;

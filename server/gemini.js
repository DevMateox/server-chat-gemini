const express = require("express");
const dotenv = require("dotenv");
const generarRoutes = require("./routes/generar");
const pdfRoutes = require("./routes/pdf"); 
const cors = require("cors");
const historialRoutes = require("./routes/historial");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: "https://chat-gemini-neon.vercel.app",
    methods: ["GET", "POST"],
  })
);

// Middleware
app.use(express.json());

// Rutas
app.use("/generar", generarRoutes); // prompts generales
app.use("/pdf", pdfRoutes);         // endpoints PDF
app.use("/historial", historialRoutes); // historial completo


// Middleware de error genérico
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Ocurrió un error en el servidor" });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

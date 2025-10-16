const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const escaladoresRoutes = require('./routes/escaladores.routes');
const pistasRoutes = require('./routes/pistas.routes');

// Middlewares
app.use(cors()); // Tuve que "configurar" CORS para permitir peticiones desde el frontend (ToDo: Configurar bien CORS)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos si los hay
app.use(express.static(path.join(__dirname, '..', 'web', 'public')));

// Rutas API
app.use('/escaladores', escaladoresRoutes);
app.use('/pistas', pistasRoutes);

module.exports = app;

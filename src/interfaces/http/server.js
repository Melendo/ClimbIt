const express = require('express');
const path = require('path');

const app = express();
const escaladoresRoutes = require('./routes/escaladores.routes');
const pistasRoutes = require('./routes/pistas.routes');

// Middleware para parsear JSON y formularios HTML
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos si los hay
app.use(express.static(path.join(__dirname, '..', 'web', 'public')));

// Rutas API
app.use('/escaladores', escaladoresRoutes);
app.use('/pistas', pistasRoutes);

// Rutas de formularios HTML
app.get('/formulario/escalador', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'web', 'views', 'escaladores', 'formulario.html'));
});

app.get('/formulario/pista', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'web', 'views', 'pistas', 'formulario.html'));
});

module.exports = app;

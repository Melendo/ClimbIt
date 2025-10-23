const app = require('./src/interfaces/http/server');
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await app.conectar();

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}.`);
    });
  } catch (err) {
    console.error(
      'Error al conectar con la BD o arrancar el servidor:',
      err.message
    );
    process.exit(1);
  }
}

start();

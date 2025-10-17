const Pista = require('../../domain/pistas/Pista');

function crearPistaUseCase(repository) {
  return async function ({ nombre, dificultad }) {
    const pista = new Pista({ nombre, dificultad });
    return await repository.guardar(pista);
  };
}

module.exports = crearPistaUseCase;

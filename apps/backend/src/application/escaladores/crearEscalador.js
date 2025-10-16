const Escalador = require('../../domain/escaladores/Escalador');

function crearEscaladorUseCase(repository) {
  return async function ({ nombre, edad, experiencia }) {
    const escalador = new Escalador({ nombre, edad, experiencia });
    return await repository.guardar(escalador);
  };
}

module.exports = crearEscaladorUseCase;

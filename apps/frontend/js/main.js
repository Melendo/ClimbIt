document.addEventListener('DOMContentLoaded', () => {
  const apiButton = document.getElementById('test-api');
  const responseContainer = document.getElementById('api-response');

  apiButton.addEventListener('click', async () => {
    try {
      const response = await fetch('http://localhost:3000/api/hello');
      const data = await response.json();
      responseContainer.textContent = JSON.stringify(data.message, null, 2);
    } catch (error) {
      responseContainer.textContent = `Error al llamar a la API: ${error.message}`;
      console.error('Error:', error);
    }
  });
});

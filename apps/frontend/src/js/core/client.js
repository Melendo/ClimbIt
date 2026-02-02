export async function fetchClient(url, options = {}) {

    const response = await fetch(url, options);
    if (!response.ok) {
        const error = new Error(`Error ${response.status}: ${response.statusText}`);
        error.response = response;
        throw error;
    }
    return response;
}

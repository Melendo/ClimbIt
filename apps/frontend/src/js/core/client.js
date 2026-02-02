export async function fetchClient(url, options = {}) {

    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response;
}

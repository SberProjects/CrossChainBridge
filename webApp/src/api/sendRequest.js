export const sendRequest = async(url, type, data) => {
    let headers = new Headers();
    headers.append('Origin', 'http://localhost:3000');
    
    return await fetch(url, { headers: headers }).then(response => {
        console.log("RESPONSE ", response)
        return response.json()
    })
}
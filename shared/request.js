import { axios, all } from 'axios';
import fs from 'fs';

// GET
axios({
    method: 'get',
    url: 'http://www.google.com',
    responseType: 'stream'
}).then((response) => {
    response.data.pipe(fs.createWriteStream('google.html'));
}).catch((error) => {
    console.error(error);
});

// POST
axios({
    method: 'post',
    url: 'https://localhost:443/users',
    data: { userName: 'dannyt100' },
    transformRequest: (data, headers) => {
        const newData = { username: data.userName + '!' }
        return JSON.stringify(newData);
    }
}).then((response) => {
    console.log(response);
}).catch((error) => {
    console.error(error);
});

// Concurrent requests:
const getMetadata = () => {
    return axios.get('https://localhost:443/metadata?id=1');
};

const getMetadataAgain = () => {
    return axios.get('https://localhost:443/metadata?id=1');
};

all([
    getMetadata(), getMetadataAgain()
]).then((responseArray) => {
    console.log(responseArray[0].data.description);
    console.log(responseArray[1].data.description);
})


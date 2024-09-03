import axios from 'axios';

const URL = 'http://localhost:3000/courses/create/store'; // Đảm bảo rằng địa chỉ URL này là đúng

const courseData = {
    name: "Test Course",
    description: "This is a test description",
    images: ""
};

async function sendRequest() {
    try {
        const response = await axios.post(URL, courseData);
        console.log('Success:', response.status);
    } catch (error) {
        console.error('Error:', error.response ? error.response.status : error.message);
    }
}

async function testLoad() {
    const requests = [];
    for (let i = 0; i < 10; i++) {
        requests.push(sendRequest());
    }

    await Promise.all(requests);
    console.log('All requests completed');
}

testLoad();

//https://www.youtube.com/watch?v=-obvxYp_kbc

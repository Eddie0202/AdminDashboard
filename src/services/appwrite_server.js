const sdk = require("node-appwrite");
require('dotenv').config();

const client = new sdk.Client();
const storage = new sdk.Storage(client);
// Thiết lập endpoint và project từ các biến môi trường
client.setEndpoint(process.env.APPWRITE_URL)
    .setProject(process.env.APPWRITE_PROJECT)
    .setKey(process.env.APPWRITE_API_KEY);
    // Bạn cũng có thể thiết lập key ở đây nếu cần
const users = new sdk.Users(client);

module.exports = {
    storage
};

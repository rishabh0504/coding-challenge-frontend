const Redis = require('ioredis');
const redis = new Redis();

module.exports.setBulkIntoCache = (type, key, items) => {
    items.map((eachItem) => {
        redis.set(`${type}:${eachItem.identifier}`, JSON.stringify(eachItem));
    });
}

module.exports.getItemFromCache = async (key) => {
    const response = await redis.get(key);
    return response;
}
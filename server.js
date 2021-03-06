const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const moment = require('moment');
const path = require('path');
const port = process.env.port || 3001;
let caching;
if (process.env.isRedisEnable) {
    caching = require('./caching');
}


// For high performance Redis is used but it's like a feature
let isRedisSync = false;



let allLogs = fs.readFileSync(__dirname + '/json-data/logs.json', 'utf8');
let agents = fs.readFileSync(__dirname + '/json-data/agents.json', 'utf8');
let resolutions = fs.readFileSync(__dirname + '/json-data/resolution.json', 'utf8');

agents = JSON.parse(agents);
resolutions = JSON.parse(resolutions);
allLogs = JSON.parse(allLogs);

// Setting Redis data for agent and resolution
if (process.env.isRedisEnabled && isRedisSync === false) {
    caching.setBulkIntoCache('agent', 'identifier', agents);
    caching.setBulkIntoCache('resolution', 'identifier', resolutions);
    isRedisSync = true;
}

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'dist'))); //  "public" off of current is root


// At the time of the posting the logs we will be updating the cache
// Get all the logs 

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/dist/index.html`);
})

app.get('/api/', async (req, res) => {
    try {
        let allLogs = fs.readFileSync(__dirname + '/json-data/logs.json', 'utf8');
        allLogs = JSON.parse(allLogs);
        const map = new Map();
        for (const item of allLogs) {
            if (map.has(item.number)) {
                console.log('available');
                map.set(item.number, map.get(item.number) + 1);
            } else {
                console.log('not available');
                map.set(item.number, 1);
            }

            console.log(map)
        }
        res.json(await map);
    } catch (error) {
        res.json({ message: 'Something went wrong' })
    }
})

// Get agent by id with resolution
app.get('/api/agent/:agentId', async (req, res) => {
    const { agentId } = req.params;
    if (agentId) {
        try {
            const agentCallsHistory = [];
            // Filter logs by agentId
            const filteredData = await allLogs.filter(log => log.agentIdentifier === agentId);
            // Iterate over logs and get resolution
            for (const eachLogs of filteredData) {
                const { number, dateTime, identifier } = eachLogs;
                const formattedDate = moment(dateTime).format('DD/MM/YYYY HH:mm:ss');
                let resolution;
                // If Redis is enabled
                if (process.env.isRedisEnable) {
                    const key = `resolution:${identifier}`;
                    let resolutionCaching = await caching.getItemFromCache(key);
                    resolution = JSON.parse(resolutionCaching).resolution;
                }
                else {
                    // Read from json
                    const filteredResolution = resolutions.find(resl => resl.identifier === identifier);
                    resolution = filteredResolution.resolution;
                }
                agentCallsHistory.push({
                    number,
                    formattedDate,
                    resolution
                });
            }
            res.json(agentCallsHistory);
        } catch (error) {
            res.json({ message: 'Something went wrong', err: error })
        }
    } else {
        res.json({ message: 'Please provide the agent id.' })
    }

})

// Get call details by number
app.get('/api/call/:number', async (req, res) => {
    const { number } = req.params;
    if (number) {
        try {
            let logs = allLogs;
            const agentCallsHistory = [];
            // Filter logs by number
            const filteredData = await logs.filter(log => log.number === number)

            // Iterate over logs and get resolution and name
            for (const eachLogs of filteredData) {
                const { dateTime, identifier, agentIdentifier } = eachLogs;
                const formattedDate = moment(dateTime).format('DD/MM/YYYY HH:mm:ss')
                let resolution;
                let agent;
                // If Redis is enabled
                if (process.env.isRedisEnabled) {
                    const key = `resolution:${identifier}`;
                    const agentkey = `agent:${agentIdentifier}`;
                    let resolutionCaching = await caching.getItemFromCache(key);
                    let agentCaching = await caching.getItemFromCache(agentkey);
                    agentCaching = JSON.parse(agentCaching);
                    resolutionCaching = JSON.parse(resolutionCaching);
                    resolution = resolutionCaching.resolution;
                    agent = `${agentCaching.firstName} ${agentCaching.lastName}`;
                }
                else {
                    const filteredResolution = resolutions.find(resl => resl.identifier === identifier);
                    const filteredAgent = agents.find(resl => resl.identifier === agentIdentifier);
                    resolution = filteredResolution.resolution;
                    agent = `${filteredAgent.firstName} ${filteredAgent.lastName}`;
                }
                agentCallsHistory.push({
                    name: `${agent}`,
                    formattedDate,
                    resolution
                });
            }
            res.json(agentCallsHistory);
        } catch (error) {
            console.log(error);
            res.json({ message: 'Something went wrong' })
        }
    } else {
        res.json({ message: 'Please provide the number.' })
    }
})


app.listen(port, () => {
    console.log('Application started');
})

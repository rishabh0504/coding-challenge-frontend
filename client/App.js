import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
import Header from './components/header';
import AgentLogs from './page/agent-logs';
import AggregateLogs from './page/aggregate-logs';

const App = () => {
    return (
        <>
            <Router>
                <Header />
                <Switch>
                    <Route path="/">
                        <AggregateLogs />
                    </Route>
                    <Route path="#/agent/:agentId">
                        <AgentLogs />
                    </Route>
                </Switch>

            </Router>
        </>
    )
}

export default App;
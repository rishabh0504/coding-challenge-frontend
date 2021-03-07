import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
const Table = (props) => {
    const { columns = [], data = [] } = props;
    return (
        <table className="table table-sm">
            <thead className="thead-dark">
                <tr>
                    <th scope='col'>#</th>
                    {
                        columns && columns.map((item, index) => {
                            return <th key={index} scope='col'>{item}</th>
                        })
                    }
                </tr>
            </thead>
            <tbody>

                {
                    data && data.map((item, index) => {
                        return (
                            <tr key={index}>
                                <th scope="row">{index + 1}</th>
                                <td>{item.phone}</td>
                                <td>{item.calls}</td>
                                <td>{item.dateTime}</td>
                                <td>
                                    <Link to={{ pathname: `/agent/${item.agentId}` }} >
                                        {item.agentId}
                                    </Link>
                                </td>
                            </tr>
                        )
                    })
                }
            </tbody>
        </table>
    )
}

export default Table;
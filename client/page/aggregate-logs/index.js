import React, { useState, useEffect } from 'react';
import Table from '../../components/table';
import { get } from '../../service/api';

const columns = [
    'Phone number',
    'Number of calls',
    'Last call details',
    'Agent Id'
]

const AggregateLogs = () => {

    const [data, setData] = useState([]);

    useEffect(async () => {
        const url = '/';
        const data = await get(url);
        setData(data);
    }, []);

    return (
        <>
            <div className="container-fluid p-5">
                <h5 className='pb-2'>Aggregated Details</h5>
                <Table columns={columns} data={data} />
            </div>
        </>
    )
}

export default AggregateLogs;
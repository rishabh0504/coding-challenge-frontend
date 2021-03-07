import React from 'react';
import axios from 'axios';
import { API_ENDPOINT } from '../config';

// Setting default base url
axios.defaults.baseURL = API_ENDPOINT;

export const get = async (url) => {
    try {
        const data = await axios.get('http://localhost:3001');
        return data.data;
    } catch (error) {
        return []
    }
};

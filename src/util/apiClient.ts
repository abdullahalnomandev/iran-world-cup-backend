import axios from 'axios';
import config from '../config';

export const apiClient = axios.create({
    baseURL: config.anysport.base_url,
    headers: {
        'X-API-Key': config.anysport.api_key,
    },
});
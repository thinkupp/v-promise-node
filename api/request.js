const axios = require('axios');

// 在发送请求之前做些什么
const axionsRequest = function (config) {
    return config;
};

// 对请求错误做些什么
const axiosRequestError = function (error) {
    return Promise.reject(error);
};

// 对响应数据做点什么
const axiosResponse = function (response) {
    return response.data;
};

// 对响应错误做点什么
const axiosResponseError = function (error) {
};

let req = axios.create({
});

// 添加请求拦截器
req.interceptors.request.use(axionsRequest, axiosRequestError);

// 添加响应拦截器
req.interceptors.response.use(axiosResponse, axiosResponseError);

module.exports = req;

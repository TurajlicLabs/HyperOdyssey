export const get = jest.fn();
export const put = jest.fn();
export const head = jest.fn();
export const post = jest.fn();
export const patch = jest.fn();
export const trace = jest.fn();
export const del = jest.fn();
export const connect = jest.fn();
export const options = jest.fn();

export default {
    get,
    put,
    head,
    post,
    patch,
    trace,
    delete : del,
    connect,
    options
};
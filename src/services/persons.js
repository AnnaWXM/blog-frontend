import axios from 'axios'
//before dist build remove localhost
const baseUrl = '/api/blogs'

const getAll = () => {
    const request = axios.get(baseUrl)
    return request.then(response => response.data)
}

const create = newObject => {
    const request = axios.post(baseUrl, newObject)
    return request.then(response => response.data)
}

const update = (id, newObject) => {
    const request = axios.put(`${baseUrl}/${id}`, newObject)
    return request.then(response => response.data)
}

const remove = id => {
    console.log(id)
    const request = axios.delete(`${baseUrl}/${id}`)
    return request.then(response => response.data)
}

export default { getAll, create, update, remove }
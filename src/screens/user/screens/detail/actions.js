import {
  authApi,
  authFileUploadApi
} from 'utils'

export const getUserById = (_id) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/user/getById?id=${_id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const updateUser = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/user/update',
      data: obj
    }
    return authFileUploadApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

export const deleteUser = (id) => {
  return (dispatch) => {
    let data = {
      method: 'DELETE',
      url: `/rest/user/delete?id=${id}`
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}
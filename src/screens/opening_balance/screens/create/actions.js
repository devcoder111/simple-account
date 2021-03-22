import {
  authApi
} from 'utils'


// Create & Save

export const addOpeningBalance = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url:`/rest/transactionCategoryBalance/save`,
      data: obj
    }
    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}
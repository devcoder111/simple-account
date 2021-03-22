import {
  authApi
} from 'utils'

export const createTransactionCategory = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: `/rest/transactioncategory/save`,
      data: obj
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}
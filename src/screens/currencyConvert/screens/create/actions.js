import {
  authApi
} from 'utils'


// Create & Save
export const createCurrencyConvert = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'POST',
      url: `/rest/currencyConversion/save`,
      data: obj
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}
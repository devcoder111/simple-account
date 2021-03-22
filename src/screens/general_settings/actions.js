// import { SETTINGS } from 'constants/types'
import {
  authApi
} from 'utils'

export const getGeneralSettingDetail = () => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: `/rest/companySetting/get`,
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}


export const updateGeneralSettings = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: `/rest/companySetting/update`,
      data: obj
    }

    return authApi(data).then((res) => {
      return res
    }).catch((err) => {
      throw err
    })
  }
}

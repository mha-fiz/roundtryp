/* eslint-disable */
import axios from 'axios'
import { showAlert } from './alert'

export const login = async (email, password) => {
  console.log(email, password)
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    })
    console.log(res)
    if (res.data.status === 'success') {
      showAlert('success', 'Login success!')

      window.setTimeout(() => {
        location.assign('/')
      }, 1500)
    }
  } catch (error) {
    // alert(error.response.data.message)
    showAlert('error', error.response.data.message)
  }
}

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    })

    if (res.data.status === 'success') location.reload(true)
    // window.setTimeout(() => {
    //   location.assign('/')
    // }, 1500)

    console.log(res)
  } catch (error) {
    showAlert('error', 'Log out failed')
  }
}
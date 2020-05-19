/*eslint-disable*/
import axios from 'axios'
import { showAlert } from './alert'

export const signup = async (data) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data,
    })

    if (res.data.status === 'success') {
      showAlert('success', 'Signup success!')

      window.setTimeout(() => {
        location.assign('/')
      }, 1500)
    }
  } catch (error) {
    // alert(error.response.data.message)
    showAlert('error', error.response.data.message)
  }
}

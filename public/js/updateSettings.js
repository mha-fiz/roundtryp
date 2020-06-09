import axios from 'axios'
import { showAlert } from './alert'

export const updateSettings = async (data, type) => {
  //the 'type' is either password or data(user data)
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe'

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    })

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} successfuly updated!`)
      setTimeout(location.reload(), 2000)
    }
  } catch (e) {
    showAlert('error', 'Update data failed!')
    console.log(e.response.data.message)
  }
}

/*eslint-disable*/
import axios from 'axios'
import { showAlert } from './alert'

export const signup = async (data) => {
  // console.log({name, email, password, passwordConfirm})
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/signup',
      data,
    })
    console.log(res)
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

// const signupForm = document.querySelector('.form--signup')

// // DELEGATION
// signupForm.addEventListener('submit', (e) => {
//     e.preventDefault()

//     const name = document.getElementById('name').value
//     const email = document.getElementById('email').value
//     const password = document.getElementById('password').value
//     const passwordConfirm = document.getElementById('passwordConfirm').value

//     signup({ name, email, password, passwordConfirm })
//   })

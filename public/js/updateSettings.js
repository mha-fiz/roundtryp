// import axios from 'axios'
// import { showAlert } from './alert'
const axios = require('axios')
const { showAlert } = require('./alert')

export const updateSettings = async (data, type) => {
	//the 'type' is either password or data(user data)
	try {
		const url = type ==='password' ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword' : 'http://127.0.0.1:3000/api/v1/users/updateMe' 

	const res = await axios({
		method: 'PATCH',
		url,
		data,
	})

	if (res.data.status === 'success') {
		showAlert('success', `${type.toUpperCase()} successfuly updated!`)
	}

	} catch(e) {
		showAlert('error', 'Update data failed!')
		console.log(e.response.data.message);
	}
}
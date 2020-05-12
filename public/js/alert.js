export const hideAlert = () => {
  const element = document.querySelector('.alert')
  if (element) element.parentElement.removeChild(element)
}

export const showAlert = (type, msg) => {
  //hide any current alert
  hideAlert()
  const alert = `<div class='alert alert--${type}'>${msg}</div>`

  //insert the alert
  document.querySelector('body').insertAdjacentHTML('afterbegin', alert)

  window.setTimeout(hideAlert, 5000)
}

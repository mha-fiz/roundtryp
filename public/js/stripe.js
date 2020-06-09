/*eslint-disable*/
// import axios from 'axios'
// import { showAlert } from './alert'
const stripe = Stripe('pk_test_5tbf2ssfdSKIqkTM00NsmXBf00xnIdoBE9')

const bookTour = async (tourId) => {
  try {
    //a.  Get session from backend
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`)
    console.log(session)

    //b.  redirect to payment pagee
    await stripe.redirectToCheckout({ sessionId: session.data.session.id })
  } catch (error) {
    alert('error', error)
  }
}

const bookBtn = document.getElementById('book-tour')

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...'
    const { tourId } = e.target.dataset //tour-id in tour.pug turned into camel case
    bookTour(tourId)
  })
}

const fs = require('fs')
const express = require('express')
const app = express()
const port = 3000

app.use(express.json())

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`))

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  })
}

const getTour = (req, res) => {
  console.log(req.params)
  const paramID = req.params.id * 1

  if (paramID > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID / No tour found',
    })
  }

  const tour = tours.find((el) => el.id === paramID)

  res.status(200).json({ status: 'success', data: { tour } })
}

const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1
  const newTour = Object.assign({ id: newId }, req.body)

  tours.push(newTour)
  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    })
  })
}

const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID / No tour found for update',
    })
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: 'The tour has been updated',
    },
  })
}

const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID / No tour found for update',
    })
  }

  res.status(204).json({
    status: 'success',
    data: null,
  })
}

app.route('/api/v1/tours').get(getAllTours).post(createTour)
app.route('/api/v1/tours/:id').get(getTour).patch(updateTour).delete(deleteTour)

app.listen(port, () => {
  console.log(`App running on port ${port}....`)
})

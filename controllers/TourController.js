const fs = require('fs')

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))

exports.getAllTours = (req, res) => {
  console.log(req.requestTime)
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  })
}

exports.getTour = (req, res) => {
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

exports.createTour = (req, res) => {
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

exports.updateTour = (req, res) => {
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

exports.deleteTour = (req, res) => {
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

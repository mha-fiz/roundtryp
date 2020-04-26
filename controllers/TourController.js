const fs = require('fs')

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
)

exports.checkId = (req, res, next, val) => {
  console.log(`Tour ID is: ${val}`)

  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID / No tour found for update',
    })
  }
  next()
}

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name / price input',
    })
  }
  next()
}

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
  const newTour = Object.assign(req.body, { id: newId })

  tours.push(newTour)
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      })
    }
  )
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
  res.status(204).json({
    status: 'success',
    data: null,
  })
}

const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

const Tour = require('../../models/TourModel')
const User = require('../../models/UserModel')
const Review = require('../../models/ReviewModel')

dotenv.config({ path: './config.env' })

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
)

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('connection to DB successful!'))

//  #1 Read the JSON file
const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours.json', 'utf-8'))
const users = JSON.parse(fs.readFileSync('./dev-data/data/users.json', 'utf-8'))
const reviews = JSON.parse(
  fs.readFileSync('./dev-data/data/reviews.json', 'utf-8')
)

//  #2 Import data to DB
const importData = async () => {
  try {
    await Tour.create(tours)
    await User.create(users, { validateBeforeSave: false })
    await Review.create(reviews)

    console.log('Tour, User, Review Data successfully loaded!')
  } catch (error) {
    console.log(error)
  }
  process.exit()
}

//  #3 Delete existing document in DB
const deleteData = async () => {
  try {
    await Tour.deleteMany()
    await User.deleteMany()
    await Review.deleteMany()
    console.log('Tour, User, Review Data are deleted!')
  } catch (error) {
    console.log(error)
  }
  process.exit()
}

//  #4 Set wether to import or delete by running this line in terminal:
//  node dev-data/data/import-dev-data.js --import || --delete
if (process.argv[2] === '--import') {
  importData()
} else if (process.argv[2] === '--delete') {
  deleteData()
}

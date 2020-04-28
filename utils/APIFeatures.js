class APIFeatures {
  constructor(query, queryString) {
    this.query = query
    this.queryString = queryString
  }

  filter() {
    const queryObj = { ...this.queryString } //from url
    const excludedFields = ['page', 'sort', 'limit', 'fields']
    excludedFields.forEach((el) => delete queryObj[el])

    //  #1b Advance Filtering
    let queryStr = JSON.stringify(queryObj)

    queryStr = queryStr.replace(
      /\b(gte|gte|lte|lt)\b/g,
      (matchedKeyword) => `$${matchedKeyword}`
    )

    this.query = this.query.find(JSON.parse(queryStr))

    return this
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ')
      this.query = this.query.sort(sortBy)
    } else {
      this.query = this.query.sort('-createdAt')
    }

    return this
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ')
      this.query = this.query.select(fields)
    } else {
      this.query.select('-__v') //excluding the mongoose property
    }

    return this
  }

  paginate() {
    const page = this.queryString.page * 1 || 1
    const limit = this.queryString.limit * 1 || 100
    const skippedDocs = (page - 1) * limit

    this.query = this.query.skip(skippedDocs).limit(limit)

    return this
  }
}

module.exports = APIFeatures

class APIFeatures {
  constructor(queryCollection, queryRequest) {
    this.queryCol = queryCollection;
    this.queryReq = queryRequest;
  }

  filter() {
    let filter = { ...this.queryReq };
    const exclude = ["page", "sort", "limit", "fields"];
    exclude.forEach((el) => delete filter[el]);

    filter = JSON.stringify(filter);
    filter = filter.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    this.queryCol.find(JSON.parse(filter));

    return this;
  }

  sort() {
    if ("sort" in this.queryReq) {
      const sort = this.queryReq.sort.replace(/,/g, " ");
      this.queryCol.sort(sort);
    } else {
      this.queryCol.sort("-createdAt");
    }

    return this;
  }

  limitFields() {
    if ("fields" in this.queryReq) {
      const fields = this.queryReq.fields.replace(/,/g, " ");
      this.queryCol.select(fields);
    }

    return this;
  }

  paginate() {
    const page = +this.queryReq.page ?? 1;
    const limit = +this.queryReq.limit ?? 100;
    const skip = (page - 1) * limit;
    this.queryCol.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;

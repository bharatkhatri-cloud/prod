class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query; //BagInoculationModel.find();==this.query
        this.queryStr = queryStr; //keyword==queryStr==samosa(from postman)
    };


    filter(timeStamp) {
        const queryCopy = { ...this.queryStr };

        if (this.queryStr.onDate && !isNaN(new Date(this.queryStr.onDate).getTime())) {
            queryCopy[timeStamp] = {
                $gte: new Date(new Date(this.queryStr.onDate).setHours(0, 0, 0, 0)),
                $lte: new Date(new Date(this.queryStr.onDate).setHours(23, 59, 59, 999))
            };
        }

        if (
            this.queryStr.startDate &&
            this.queryStr.endDate &&
            !isNaN(new Date(this.queryStr.startDate).getTime()) &&
            !isNaN(new Date(this.queryStr.endDate).getTime())
        ) {
            queryCopy[timeStamp] = {
                $gte: new Date(new Date(this.queryStr.startDate).setHours(0, 0, 0, 0)),
                $lte: new Date(new Date(this.queryStr.endDate).setHours(23, 59, 59, 999))
            };
        }

        const removeFields = ["page", "limit", "startDate", 'endDate', 'onDate', 'sort'];
        removeFields.forEach((key) => delete queryCopy[key]);

        // Clean up empty strings, null, and undefined values so they don't break queries
        Object.keys(queryCopy).forEach((key) => {
            if (queryCopy[key] === "" || queryCopy[key] === null || queryCopy[key] === undefined) {
                delete queryCopy[key];
            }
        });

        // Apply remaining fields as filters
        this.query = this.query.find(queryCopy);

        return this;
    }

    sort(field) {
        this.query = this.query.sort({ [field]: -1 }); // 1 for ascending, -1 for descending
        if (typeof this.query.allowDiskUse === "function") {
            this.query = this.query.allowDiskUse(true);
        }
        return this;
    }

    pagination(resultPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resultPerPage * (currentPage - 1);
        //BagInoculationModel.find().limit(resultPerPage).skip(skip)
        this.query = this.query.limit(resultPerPage).skip(skip);
        return this;
    }

}

module.exports = ApiFeatures;



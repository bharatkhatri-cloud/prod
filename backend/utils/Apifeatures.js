class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query; //BagInoculationModel.find();==this.query
        this.queryStr = queryStr; //keyword==queryStr==samosa(from postman)
    };


    filter(timeStamp) {
        const queryCopy = { ...this.queryStr };

        if ('onDate' in this.queryStr) {
            queryCopy[timeStamp] = {
                // $gte: new Date(this.queryStr.onDate),
                // $lte: new Date(new Date(this.queryStr.onDate).setUTCHours(23, 59, 59, 999))
                $gte: new Date(new Date(this.queryStr.onDate).setHours(0, 0, 0, 0)),
                $lte: new Date(new Date(this.queryStr.onDate).setHours(23, 59, 59, 999))
            }
        }


        if ('startDate' in this.queryStr && 'endDate' in this.queryStr) {
            queryCopy[timeStamp] = {
                // $gte: new Date(this.queryStr.startDate),
                // $lte: new Date(new Date(this.queryStr.endDate).setUTCHours(23, 59, 59, 999))
                $gte: new Date(new Date(this.queryStr.startDate).setHours(0, 0, 0, 0)),
                $lte: new Date(new Date(this.queryStr.endDate).setHours(23, 59, 59, 999))
            }
        }

        // console.log('====================================');
        // console.log("queryCopy[timeStamp] -1 ",queryCopy[timeStamp]);
        // console.log('====================================');
     

        const removeFields = ["page", "limit", "startDate", 'endDate', 'onDate','sort'];
        removeFields.forEach((key) => delete queryCopy[key]);

        // Apply remaining fields as filters
        this.query = this.query.find(queryCopy);

     
        return this;
    }

    sort(field) {
        this.query = this.query.sort({ [field]: -1 }); // 1 for ascending, -1 for descending
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



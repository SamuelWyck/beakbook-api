class Pagination {
    constructor() {
        this.takeNum = 51;
    }


    calcSkipNum(pageNum) {
        return (this.takeNum - 1) * pageNum;
    };
};



module.exports = new Pagination();
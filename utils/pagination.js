class Pagination {
    constructor() {
        this.msgTakeNum = 51;
        this.userTakeNum = 31;
    };


    calcMsgSkip(pageNum) {
        return (this.msgTakeNum - 1) * pageNum;
    };


    calcUserSkip(pageNum) {
        return (this.userTakeNum - 1) * pageNum;
    };
};



module.exports = new Pagination();
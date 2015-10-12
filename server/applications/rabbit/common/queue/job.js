function Job(data) {
    if(!data){
        throw new Error('Cannot find data');
    }

    this.data = data;
}

module.exports = Job;
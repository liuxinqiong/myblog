/**
 * Created by sky on 2017/5/13.
 */
module.exports={
    port:8899,
    session:{
        secret:'myblog',
        key:'myblog',
        maxAge:2592000000
    },
    mongodb:'mongodb://localhost:27017/myblog'
}
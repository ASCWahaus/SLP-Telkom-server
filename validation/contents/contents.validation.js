// const Schema = require('./contents.schema');

import schema from './contents.schema.js'


// module.exports = {
//     createcontents: async (req, res, next) => {
//         const{error, value} = schema.create.validate(req.body);
    
//         if(error){
//             res.status(422).send({
//                 code: 422,
//                 success: false,
//                 message: error.details[0].message
//             })
//         }else {
//             next()
//         }
//     }
// }

// export const Validation = Schema('skema', module.exports)
export default async function createcontents(req, res, next) {
    const{error, value} = schema.create.validate(req.body);

    if(error){
        res.status(422).send({
            code: 422,
            success: false,
            message: error.details[0].message
        })
    }else {
        next()
    }
}
// module.exports = Validation;
// export const add =  (a, b) =>  a + b;

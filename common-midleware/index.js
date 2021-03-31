var multer = require('multer')
var multerS3 = require('multer-s3')
const s3 = require('../private/credentials-s3')

const uploadS3 = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'syswa-gestion',
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString()+'-'+file.originalname)
        }
    })
})

module.exports = uploadS3
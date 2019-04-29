const crypto = require('crypto')

function hashPassword(tpassword){
    //random string as char
    const len =16
    const salt = crypto.randomBytes(len/2).toString('hex')

    //SHA512 
    const has = crypto.createHmac('sha512', salt)
    has.update(tpassword)
    const hashed = has.digest('hex')

    return {salt, hashed}
}

function verifyPassword(tpassword, user) {
    const hash = crypto.createHmac('sha512', user.password.salt)
    hash.update(tpassword)
    const tpasswordHashed = hash.digest('hex')

    return tpasswordHashed == user.password.hashed
}

module.exports = {hashPassword, verifyPassword}
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const ObjectID= mongodb.ObjectID
const username = 'user'
const password = 'password'
const dbName = 'wsp'
const dbHost = 'localhost'
const dbPort = 27017
const collectionName = 'customers'

const dbUrl = `mongodb://${username}:${password}@${dbHost}:${dbPort}?authSource=${dbName}`

let dbclient
let customerCollection

function startDBandApp (app, PORT) {
    MongoClient.connect(dbUrl, {poolSize:30, useNewUrlParser: true})
        .then(client=>{
            dbclient = client
            customerCollection = client.db(dbName).collection(collectionName)
            app.locals.customerCollection = customerCollection
            app.locals.imageCollection = client.db(dbName).collection('images')
            app.locals.ObjectID = ObjectID
            app.listen(PORT, ()=>{
                console.log(`Server is running at port ${PORT}`)
            })
        })
        .catch(error=>{
            console.log("db can't be connected.", error)
        })
}

process.on('SIGINT', ()=>{
    dbclient.close()
    console.log("db connection closed by SIGINT")
    process.exit()
})

module.exports = {startDBandApp, ObjectID, customerCollection}
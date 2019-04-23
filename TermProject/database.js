const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const ObjectID= mongodb.ObjectID
const username = 'dugtrio'
const password = 'password'
const dbName = 'for_never_alone'
const dbHost = 'localhost'
const dbPort = 27017
const collectionName = 'users'

const dbUrl = `mongodb://${username}:${password}@${dbHost}:${dbPort}?authSource=${dbName}`

let dbclient
let usersCollection

function startDBandApp (app, PORT) {
    MongoClient.connect(dbUrl, {poolSize:30, useNewUrlParser: true})
        .then(client=>{
            dbclient = client
            usersCollection = client.db(dbName).collection(collectionName)
            app.locals.usersCollection = usersCollection
            app.locals.filesCollection = client.db(dbName).collection('files')
            app.locals.chatRoomsCollection = client.db(dbName).collection('chat_rooms')
            app.locals.messagesCollection = client.db(dbName).collection('messages')
            app.locals.requestsCollection = client.db(dbName).collection('requests')
            app.locals.invitesCollection = client.db(dbName).collection('invites')
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

module.exports = {startDBandApp, ObjectID, usersCollection: usersCollection}
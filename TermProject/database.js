const mongodb = require('mongodb')
const socket = require('socket.io')
const MongoClient = mongodb.MongoClient
const ObjectID= mongodb.ObjectID
const username = 'dugtrio'
const password = 'password'
const dbName = 'for_never_alone'
const dbHost = 'localhost'
const dbPort = 27017
const collectionName = 'users'

const dbUrl = `mongodb://${username}:${password}@${dbHost}:${dbPort}?authSource=${dbName}&replicaSet=rs0`

let server
let dbclient
let usersCollection
// let messagesChangeStream

function startDBandApp (app, PORT) {
    return MongoClient.connect(dbUrl, {poolSize:30, useNewUrlParser: true})
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

            // messagesChangeStream = app.locals.messagesCollection.watch()
            // messagesChangeStream.on('change', (change) => {
            //     console.log(change); // You could parse out the needed info and send only that data. 
            // }); 

            server = app.listen(PORT, ()=>{
                console.log(`Server is running at port ${PORT}`)
            })

            app.locals.io = socket(server)    //create server socket

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

module.exports = {startDBandApp, ObjectID, usersCollection}//, messagesChangeStream}
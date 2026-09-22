import express from 'express'
const app = express()

import { createServer } from 'node:http'
const server = createServer(app)

import cors from 'cors'
app.use(cors())

import { Server } from 'socket.io'
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173'
    }
})

/* 
io.on('connection', (socket) => {
    socket.on('join', (data) => {
        socket.join(data)
    })

    socket.on('sender', (data) => {
        socket.to(data.room).emit('received', data)
    })
}) */

server.listen(3001, () => {
    console.log('Server is running')
})
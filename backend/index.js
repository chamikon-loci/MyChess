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

const rooms = new Map()

io.on('connection', (socket) => {

    socket.on('join_room', (data) => {
        if(!rooms.has(data.room)) {
            rooms.set(data.room, {
                white: null,
                black: null,
                turn: 'white',
                board: null
            })
        }

        const room = rooms.get(data.room)

        let yourcolor = null

        if(room.white === null) {
            room.white = socket.id
            yourcolor = 'white'
        } else if(room.black === null) {
            room.black = socket.id
            yourcolor = 'black'
        } else {
            socket.emit('room_full')
            return
        }

        socket.join(data.room)
        socket.emit('joined', {
            room: data.room,
            yourcolor: yourcolor,
            turn: room.turn,
            board: room.board
        })
    })

    socket.on('moved', (data) => {
        const room = rooms.get(data.joined_room)

        if(!room) return

        let playerColor = null

        if((room.white === socket.id)) 
            playerColor = 'white'

        if(room.black === socket.id)
            playerColor = 'black'

        if(playerColor === null)
            return

        if(playerColor !== room.turn)
            return

        room.board = data.board

        room.turn = room.turn === 'white' ? 'black' : 'white'

        io.to(data.joined_room).emit('newBoard', {
            board: room.board,
            turn: room.turn
        })

    })
})

server.listen(3001, () => {
    console.log('Server is running')
})
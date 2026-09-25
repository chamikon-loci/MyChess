import '../styles/chess.css'
import blackRook from '../images/br.png'
import blackBishop from '../images/bb.png'
import blackKnight from '../images/bn.png'
import blackQueen from '../images/bq.png'
import blackKing from '../images/bk.png'

import blackPawn from '../images/bp.png'

import whiteRook from '../images/wr.png'
import whiteBishop from '../images/wb.png'
import whiteKnight from '../images/wn.png'
import whiteQueen from '../images/wq.png'
import whiteKing from '../images/wk.png'

import whitePawn from '../images/wp.png'

import { useState, useEffect } from 'react'

import io from 'socket.io-client'
const socket = io.connect(import.meta.env.VITE_SOCKET_URL)

const Board = () => {

    const row = []
    for(let i=0; i<8; i++)
        row.push(8-i)

    const col = ['a','b','c','d','e','f','g','h']

    function whatColor(i, j) {
        return (i+j)%2 === 0 ? 'light' : 'dark'
    }

    const [pieces, setPieces] = useState({
        a1: whiteRook, b1: whiteKnight, c1: whiteBishop, d1: whiteQueen, e1: whiteKing, f1: whiteBishop, g1: whiteKnight, h1: whiteRook,
        a2: whitePawn, b2: whitePawn, c2: whitePawn, d2: whitePawn, e2: whitePawn, f2: whitePawn, g2: whitePawn, h2: whitePawn,
        a3: '', b3: '', c3: '', d3: '', e3: '', f3: '', g3: '', h3: '',
        a4: '', b4: '', c4: '', d4: '', e4: '', f4: '', g4: '', h4: '',
        a5: '', b5: '', c5: '', d5: '', e5: '', f5: '', g5: '', h5: '',
        a6: '', b6: '', c6: '', d6: '', e6: '', f6: '', g6: '', h6: '', 
        a7: blackPawn, b7: blackPawn, c7: blackPawn, d7: blackPawn, e7: blackPawn, f7: blackPawn, g7: blackPawn, h7: blackPawn,
        a8: blackRook, b8: blackKnight, c8: blackBishop, d8: blackQueen, e8: blackKing, f8: blackBishop, g8: blackKnight, h8: blackRook,
    })

    const [select, setSelect] = useState(null)
    const [prevPos, setPrevPos] = useState('')

    const [turn, setTurn] = useState('white')

    const [winner, setWinner] = useState('None')

    function isClearPath(from, to, board) {
        const fromCol = from.charCodeAt(0)
        const fromRow = Number(from[1])

        const toCol = to.charCodeAt(0)
        const toRow = Number(to[1])

        let colMove = Math.sign(toCol - fromCol)
        let rowMove = Math.sign(toRow - fromRow)

        let currentCol = fromCol + colMove
        let currentRow = fromRow + rowMove

        while(currentCol !== toCol || currentRow !== toRow) {

            const tempPos = String.fromCharCode(currentCol) + currentRow
            console.log(tempPos)
            if(board[tempPos] !== '') 
                return false

            currentCol += colMove
            currentRow += rowMove
        }

        return true
    }

    function findKing(color, board) {
        const king = color === 'white' ? whiteKing : blackKing

        for(const position of Object.keys(board)) {
            if(board[position] === king)
                return position
        }

        return null
    }

    function wouldLeaveKingInCheck(from, to, color, board) {
        const tempBoard = {...board}

        tempBoard[to] = tempBoard[from]
        tempBoard[from] = ''

        return isKingInCheck(color, tempBoard)
    }

    function isCheckMate(color) {
        const tempBoard = {...pieces}

        if(!isKingInCheck(color, tempBoard))
            return false

        for(const position of Object.keys(tempBoard)) {

            const piece = tempBoard[position]

            if(getPieceColor(piece) !== color) 
                continue

            for(const target of Object.keys(tempBoard)) {

                const targetPiece = tempBoard[target]

                if(targetPiece !== '' && getPieceColor(targetPiece) === color) 
                    continue

                let validMove = false

                if(piece === whitePawn || piece === blackPawn) {
                    if(targetPiece === '')
                        validMove = isValidPawnMove(position, target, piece,tempBoard)
                    else 
                        validMove = isValidPawnCapture(position, target, piece)
                } else if(piece === whiteRook || piece === blackRook) {
                    validMove = isValidRookMove(position, target, tempBoard)
                } else if(piece === whiteKnight || piece === blackKnight) {
                    validMove = isValidKnightMove(position, target)
                } else if(piece === whiteBishop || piece === blackBishop) {
                    validMove = isValidBishopMove(position, target, tempBoard)
                } else if(piece === whiteQueen || piece === blackQueen) {
                    validMove = isValidQueenMove(position, target, tempBoard)
                } else if(piece === whiteKing|| piece === blackKing) {
                    validMove = isValidKingMove(position, target, tempBoard)
                }

                if(!validMove)
                    continue

                const simulateMove = simulateMoveInTempBoard(position, target, tempBoard)

                if(!isKingInCheck(color, simulateMove))
                    return false
            }
        }
        return true
    }

    function simulateMoveInTempBoard(from, to, board) {
        const tempBoard = {...board}

        tempBoard[to] = tempBoard[from]
        tempBoard[from] = ''

        return tempBoard
    }

    function isKingInCheck(color, board) {
        const kingPosition = findKing(color, board)

        if(kingPosition === null) return false
        
        const enermyColor = color === 'white' ? 'black' : 'white'

        for(const position of Object.keys(board)) {

            const piece = board[position]

            if(piece === '') continue

            if(getPieceColor(piece) !== enermyColor) continue

            if(piece === whitePawn || piece === blackPawn) {
                if(isValidPawnCapture(position, kingPosition, piece, board)) {
                    return true
                }
            }

            if(piece === whiteRook || piece === blackRook) {
                if(isValidRookMove(position, kingPosition, board)) {
                    return true
                }
            }

            if(piece === whiteKnight || piece === blackKnight) {
                if(isValidKnightMove(position, kingPosition, board)) {
                    return true
                }
            }

            if(piece === whiteBishop || piece === blackBishop) {
                if(isValidBishopMove(position, kingPosition, board)) {
                    return true
                }
            }

            if(piece === whiteQueen || piece === blackQueen) {
                if(isValidQueenMove(position, kingPosition, board)) {
                    return true
                }
            }

            if(piece === whiteKing || piece === blackKing) {
                if(isValidKingMove(position, kingPosition, board)) {
                    return true
                }
            }
            
        }

        return false

    }

    const [inCheck, setInCheck] = useState('None')
    useEffect(() => {
        if(isKingInCheck('white', pieces)) {
            setInCheck('white')
        } else if(isKingInCheck('black', pieces)) {
            setInCheck('black')
        } else {
            setInCheck('None')
        }

        if(isCheckMate('black')) {
            setWinner('white')
            setDraw(false)
        } else if(isCheckMate('white')) {
            setWinner('black')
            setDraw(false)
        } else if(isStatemate('black') || isStatemate('white')) {
            setWinner('None')
            setDraw(true)
        } else {
            setWinner('None')
            setDraw(false)
        }
    }, [pieces, turn])

    useEffect(() => {
        socket.on('newBoard', (data) => {
            setPieces(data.board)
            setTurn(data.turn)
        })
    }, [])

    function isValidKnightMove(from, to) {

        const fromCol = from.charCodeAt(0)
        const fromRow = Number(from[1])

        const toCol = to.charCodeAt(0)
        const toRow = Number(to[1])

        if(Math.abs(toCol - fromCol) === 1 && Math.abs(toRow - fromRow) === 2)
            return true
        if(Math.abs(toCol - fromCol) === 2 && Math.abs(toRow - fromRow) === 1)
            return true

        return false
        
    }

    function isValidKingMove(from, to) {
        const fromCol = from.charCodeAt(0)
        const fromRow = Number(from[1])
        
        const toCol = to.charCodeAt(0)
        const toRow = Number(to[1])
        
        if(Math.abs(toCol - fromCol) <= 1 && Math.abs(toRow - fromRow) <= 1 && 
        (Math.abs(toCol - fromCol) !== 0 || Math.abs(toRow - fromRow) !== 0))
            return true

        return false
    }

    function isValidRookMove(from, to, board) {
        const fromCol = from.charCodeAt(0)
        const fromRow = Number(from[1])
        
        const toCol = to.charCodeAt(0)
        const toRow = Number(to[1])

        if(toCol !== fromCol && toRow !== fromRow)
            return false

        if(!isClearPath(from, to, board)) 
            return false

        return true
    }

    function isValidBishopMove(from, to, board) {

        const fromCol = from.charCodeAt(0)
        const fromRow = Number(from[1])

        const toCol = to.charCodeAt(0)
        const toRow = Number(to[1])

        if(!(Math.abs(toCol - fromCol) === Math.abs(toRow - fromRow)))
            return false

        if(!isClearPath(from, to, board)) 
            return false

        return true
    }

    function isValidQueenMove(from, to, board) {
        const fromCol = from.charCodeAt(0)
        const fromRow = Number(from[1])

        const toCol = to.charCodeAt(0)
        const toRow = Number(to[1])

        if(!(isValidBishopMove(from, to, board) || isValidRookMove(from, to, board)))
            return false

        return true
    }

    function isValidPawnMove(from, to, piece, board) {
        const fromCol = from.charCodeAt(0)
        const fromRow = Number(from[1])

        const toCol = to.charCodeAt(0)
        const toRow = Number(to[1])

        if(piece === whitePawn) {
            if(toCol !== fromCol) 
                return false

            if(toRow - fromRow === 1)
                return true

            if(fromRow === 2 && toRow - fromRow === 2) {
                if(!isClearPath(from, to, board))
                    return false

                return true
            }

            return false
        }

        if(piece === blackPawn) {
            if(toCol !== fromCol)
                return false

            if(fromRow - toRow === 1)
                return true

            if(fromRow === 7 && fromRow - toRow === 2) {
                if(!isClearPath(from, to, board))
                    return false

                return true
            }

            return false
        }
    }

    function getPieceColor(piece){
        if(piece === whitePawn ||
            piece === whiteRook ||
            piece === whiteKnight ||
            piece === whiteBishop ||
            piece === whiteQueen ||
            piece === whiteKing
        ) return 'white'

        if(piece === blackPawn ||
            piece === blackRook ||
            piece === blackKnight ||
            piece === blackBishop ||
            piece === blackQueen ||
            piece === blackKing
        ) return 'black'

        return null
    }

    function capture(from ,to, board) {
        const fromPiece = board[from]
        const toPiece = board[to]

        const fromColor = getPieceColor(fromPiece)
        const toColor = getPieceColor(toPiece)

        if(toPiece === '')
            return false

        if(fromColor === toColor)
            return false

        return true
    }

    function isValidPawnCapture(from, to, piece) {
        const fromCol = from.charCodeAt(0)
        const fromRow = Number(from[1])

        const toCol = to.charCodeAt(0)
        const toRow = Number(to[1])

        if(piece === whitePawn) {
            if(Math.abs(toCol - fromCol) === 1 && toRow - fromRow === 1)
                return true

            return false
        }

        if(piece === blackPawn) {
            if(Math.abs(toCol - fromCol) === 1 && fromRow - toRow === 1)
                return true
            return false
        }

        return false
    }

    const whitePromotionList = [
        whiteKnight,
        whiteBishop,
        whiteRook,
        whiteQueen
    ]

    const blackPromotionList = [
        blackKnight,
        blackBishop,
        blackRook,
        blackQueen
    ]
    
    function isPromotion(piece, to) {
        const toRow = Number(to[1])

        if(piece === whitePawn) {
            if(toRow === 8) {
                return true
            }
        }

        if(piece === blackPawn) {
            if(toRow === 1) {
                return true
            }
        }

        return false
    }

    const [promotion, setPromotion] = useState(null)

    function promote(piece) {
        console.log('promote to: ', promotion)
        const newBoard = {...pieces}
        newBoard[promotion.position] = piece
        setPieces(newBoard)
        socket.emit('moved', {
            joined_room: joined_room,
            board: newBoard
        })
        setPromotion(null)
    }
    
    const [draw, setDraw] = useState(false)
    function isStatemate(color) {

        const tempBoard = {...pieces}

        if(isKingInCheck(color, tempBoard))
            return false

        for(const position of Object.keys(tempBoard)) {
            const piece = tempBoard[position]
            if(getPieceColor(piece) !== color) continue

            for(const target of Object.keys(tempBoard)){
                const targetPiece = tempBoard[target]

                if(targetPiece !== '' && getPieceColor(targetPiece) === color) continue

                let validMove = false

                if(piece === whitePawn || piece === blackPawn) {
                    if(targetPiece === '')
                        validMove = isValidPawnMove(position, target, piece,tempBoard)
                    else 
                        validMove = isValidPawnCapture(position, target, piece)
                } else if(piece === whiteRook || piece === blackRook) {
                    validMove = isValidRookMove(position, target, tempBoard)
                } else if(piece === whiteKnight || piece === blackKnight) {
                    validMove = isValidKnightMove(position, target)
                } else if(piece === whiteBishop || piece === blackBishop) {
                    validMove = isValidBishopMove(position, target, tempBoard)
                } else if(piece === whiteQueen || piece === blackQueen) {
                    validMove = isValidQueenMove(position, target, tempBoard)
                } else if(piece === whiteKing|| piece === blackKing) {
                    validMove = isValidKingMove(position, target, tempBoard)
                }

                if(!validMove)
                    continue

                const simulateMove = simulateMoveInTempBoard(position, target, tempBoard)

                if(!isKingInCheck(color, simulateMove))
                    return false
            }
        }

        return true
        
    }

    function movePiece(position) {

        if(winner !== 'None' || draw)
            return

        if(promotion !== null)
            return

        if(select === null) {
            if(pieces[position] === '') return;

            if(getPieceColor(pieces[position]) !== turn) return

            if(getPieceColor(pieces[position]) !== myColor) return
            
            setPrevPos(position)
            setSelect(pieces[position]) 
            return;
        }
        if(pieces[position] === '' || capture(prevPos, position, pieces)) {

            /* WHITE TURN */
            if(select === whitePawn && turn === 'white') {
                if(isValidPawnMove(prevPos, position, select, pieces) && pieces[position] === ''){
                    if(wouldLeaveKingInCheck(prevPos, position, 'white', pieces)) {
                        setSelect(null)
                        return
                    }
                    const newBoard = {...pieces}
                    newBoard[prevPos] = ''
                    newBoard[position] = select
                    setPieces(newBoard)
                    socket.emit('moved', {joined_room: joined_room, board: newBoard})
                    if(isPromotion(select, position)){
                        console.log('White get promotion')
                        setPromotion({
                            color: 'white',
                            position: position
                        })
                    } 
                    setSelect(null)
                } else if(isValidPawnCapture(prevPos, position, select) && capture(prevPos, position, pieces)) {
                    if(wouldLeaveKingInCheck(prevPos, position, 'white', pieces)) {
                        setSelect(null)
                        return
                    }
                    const newBoard = {...pieces}
                    newBoard[prevPos] = ''
                    newBoard[position] = select
                    setPieces(newBoard)
                    socket.emit('moved', {joined_room: joined_room, board: newBoard})
                    if(isPromotion(select, position)){
                        console.log('White get promotion')
                        setPromotion({
                            color: 'white',
                            position: position
                        })
                    } 
                    setSelect(null)
                } else {
                    setSelect(null)
                }
            }

            if(select === whiteRook && turn === 'white') {
                if(isValidRookMove(prevPos, position, pieces)) {
                    if(wouldLeaveKingInCheck(prevPos, position, 'white', pieces)) {
                        setSelect(null)
                        return
                    }
                    const newBoard = {...pieces}
                    newBoard[prevPos] = ''
                    newBoard[position] = select
                    setPieces(newBoard)
                    socket.emit('moved', {joined_room: joined_room, board: newBoard})
                    setSelect(null)
                } else {
                    setSelect(null)
                }
            }

            if(select === whiteKnight && turn === 'white') {
                if(isValidKnightMove(prevPos, position)) {
                    if(wouldLeaveKingInCheck(prevPos, position, 'white', pieces)) {
                        setSelect(null)
                        return
                    }
                    const newBoard = {...pieces}
                    newBoard[prevPos] = ''
                    newBoard[position] = select
                    setPieces(newBoard)
                    socket.emit('moved', {joined_room: joined_room, board: newBoard})
                    setSelect(null)
                } else {
                    setSelect(null)
                }

            }

            if(select === whiteBishop && turn === 'white') {
                if(isValidBishopMove(prevPos, position, pieces)) {
                    if(wouldLeaveKingInCheck(prevPos, position, 'white', pieces)) {
                        setSelect(null)
                        return
                    }
                    const newBoard = {...pieces}
                    newBoard[prevPos] = ''
                    newBoard[position] = select
                    setPieces(newBoard)
                    socket.emit('moved', {joined_room: joined_room, board: newBoard})
                    setSelect(null)
                } else {
                    setSelect(null)
                }
            }

            if(select === whiteQueen && turn === 'white') {
                if(isValidQueenMove(prevPos, position, pieces)){
                    if(wouldLeaveKingInCheck(prevPos, position, 'white', pieces)) {
                        setSelect(null)
                        return
                    }
                    const newBoard = {...pieces}
                    newBoard[prevPos] = ''
                    newBoard[position] = select
                    setPieces(newBoard)
                    socket.emit('moved', {joined_room: joined_room, board: newBoard})
                    setSelect(null) 
                } else {
                    setSelect(null)
                }
            }

            if(select === whiteKing && turn === 'white') {
                if(isValidKingMove(prevPos, position)) {
                    if(wouldLeaveKingInCheck(prevPos, position, 'white', pieces)) {
                        setSelect(null)
                        return
                    }
                    const newBoard = {...pieces}
                    newBoard[prevPos] = ''
                    newBoard[position] = select
                    setPieces(newBoard)
                    socket.emit('moved', {joined_room: joined_room, board: newBoard})
                    setSelect(null)
                } else {
                    setSelect(null)
                }
            }

            /* BLACK TURN */
            if(select === blackPawn && turn === 'black') {
                if(isValidPawnMove(prevPos, position, select, pieces) && pieces[position] === '') {
                    if(wouldLeaveKingInCheck(prevPos, position, 'black', pieces)) {
                        setSelect(null)
                        return
                    }
                    const newBoard = {...pieces}
                    newBoard[prevPos] = ''
                    newBoard[position] = select
                    setPieces(newBoard)
                    socket.emit('moved', {joined_room: joined_room, board: newBoard})
                    if(isPromotion(select, position)){
                        console.log('Black get promotion')
                        setPromotion({
                            color: 'black',
                            position: position
                        })
                    }
                    setSelect(null)
                } else if(isValidPawnCapture(prevPos, position, select) && capture(prevPos, position, pieces)) {
                    if(wouldLeaveKingInCheck(prevPos, position, 'black', pieces)) {
                        setSelect(null)
                        return
                    }
                    const newBoard = {...pieces}
                    newBoard[prevPos] = ''
                    newBoard[position] = select
                    setPieces(newBoard)
                    socket.emit('moved', {joined_room: joined_room, board: newBoard})
                    if(isPromotion(select, position)){
                        console.log('Black get promotion')
                        setPromotion({
                            color: 'black',
                            position: position
                        })
                    }
                    setSelect(null)
                }
            }

            if(select === blackRook && turn === 'black') {
                if(isValidRookMove(prevPos, position, pieces)) {
                    if(wouldLeaveKingInCheck(prevPos, position, 'black', pieces)) {
                        setSelect(null)
                        return
                    }
                    const newBoard = {...pieces}
                    newBoard[prevPos] = ''
                    newBoard[position] = select
                    setPieces(newBoard)
                    socket.emit('moved', {joined_room: joined_room, board: newBoard})
                    setSelect(null)
                } else {
                    setSelect(null)
                }
            }

            if(select === blackKnight && turn === 'black') {
                if(isValidKnightMove(prevPos, position)) {
                    if(wouldLeaveKingInCheck(prevPos, position, 'black', pieces)) {
                        setSelect(null)
                        return
                    }
                    const newBoard = {...pieces}
                    newBoard[prevPos] = ''
                    newBoard[position] = select
                    setPieces(newBoard)
                    socket.emit('moved', {joined_room: joined_room, board: newBoard})
                    setSelect(null)
                } else {
                    setSelect(null)
                }

            }

            if(select === blackBishop && turn === 'black') {
                if(isValidBishopMove(prevPos, position, pieces)) {
                    if(wouldLeaveKingInCheck(prevPos, position, 'black', pieces)) {
                        setSelect(null)
                        return
                    }
                    const newBoard = {...pieces}
                    newBoard[prevPos] = ''
                    newBoard[position] = select
                    setPieces(newBoard)
                    socket.emit('moved', {joined_room: joined_room, board: newBoard})
                    setSelect(null)
                } else {
                    setSelect(null)
                }
            }

            if(select === blackQueen && turn === 'black') {
                if(isValidQueenMove(prevPos, position, pieces)){
                    if(wouldLeaveKingInCheck(prevPos, position, 'black', pieces)) {
                        setSelect(null)
                        return
                    }
                    const newBoard = {...pieces}
                    newBoard[prevPos] = ''
                    newBoard[position] = select
                    setPieces(newBoard)
                    socket.emit('moved', {joined_room: joined_room, board: newBoard})
                    setSelect(null)
                } else {
                    setSelect(null)
                }
            }

            if(select === blackKing && turn === 'black') {
                if(isValidKingMove(prevPos, position)) {
                    if(wouldLeaveKingInCheck(prevPos, position, 'black', pieces)) {
                        setSelect(null)
                        return
                    }
                    const newBoard = {...pieces}
                    newBoard[prevPos] = ''
                    newBoard[position] = select
                    setPieces(newBoard)
                    socket.emit('moved', {joined_room: joined_room, board: newBoard})
                    setSelect(null)
                } else {
                    setSelect(null)
                }
            }
        }
    }

    const [room, setRoom] = useState('')
    const [joined_room, setJoined_Room] = useState('')
    const [myColor, setMyColor] = useState('')
    function join_room(room){

        if(room !== ''){
            socket.emit('join_room', {room: room})
        }
    }

    useEffect(() => {
        socket.on('joined', (data) => {
            setJoined_Room(data.room)
            setMyColor(data.yourcolor)
            setTurn(data.turn)
            if(data.board !== null)
                setPieces(data.board)
        })

        socket.on('newBoard', (data) => {
            setPieces(data.board)
            setTurn(data.turn)
        })

        socket.on('room_full', () => {
            alert('Room is full')
        })
    }, [socket])

    return (
        <div className='chess-board'>
            {row.map((r, i) => 
                col.map((c, j) => {
                    const position = c+r;
                    return (
                        <button key={position} className={whatColor(i, j)} onClick={() => movePiece(position)}>
                            {pieces[position] && (
                                <img
                                    src={pieces[position]}
                                    className='pieces'
                                />
                            )}
                        </button>
                    )
                }))
            }
            <div>TURN: {turn} inCheck: {inCheck} Winner: {winner} Draw: {draw}</div>
            {promotion !== null && (
                <div>
                    {promotion.color === 'white' ? (
                        whitePromotionList.map(piece => (
                            <button key={piece} onClick={() => promote(piece)}>
                                <img src={piece} />
                            </button>
                        ))
                    ) : (
                            blackPromotionList.map(piece => (
                            <button key={piece} onClick={() => promote(piece)}>
                                <img src={piece} />
                            </button>
                        ))
                    )}
                </div>
            )}
            <div>
                <input placeholder='room number' value={room} onChange={(e) => setRoom(e.target.value)}/>
                <button onClick={() => join_room(room)}>Join Room</button>
                <p>{joined_room} Your Color: {myColor}</p>
            </div>
        </div>
    )
}

export default Board
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

import { useState } from 'react'

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

    function isClearPath(from, to) {
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
            if(pieces[tempPos] !== '') 
                return false

            currentCol += colMove
            currentRow += rowMove
        }

        return true
    }

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

    function isValidRookMove(from, to) {
        const fromCol = from.charCodeAt(0)
        const fromRow = Number(from[1])
        
        const toCol = to.charCodeAt(0)
        const toRow = Number(to[1])

        if(toCol !== fromCol && toRow !== fromRow)
            return false

        if(!isClearPath(from, to)) 
            return false

        return true
    }

    function isValidBishopMove(from, to) {

        const fromCol = from.charCodeAt(0)
        const fromRow = Number(from[1])

        const toCol = to.charCodeAt(0)
        const toRow = Number(to[1])

        if(!(Math.abs(toCol - fromCol) === Math.abs(toRow - fromRow)))
            return false

        if(!isClearPath(from, to)) 
            return false

        return true
    }

    function isValidQueenMove(from, to) {
        const fromCol = from.charCodeAt(0)
        const fromRow = Number(from[1])

        const toCol = to.charCodeAt(0)
        const toRow = Number(to[1])

        if(!(isValidBishopMove(from, to) || isValidRookMove(from, to)))
            return false

        return true
    }

    function isValidPawnMove(from, to, piece) {
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
                if(!isClearPath(from, to))
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
                if(!isClearPath(from, to))
                    return false

                return true
            }

            return false
        }
    }

    function movePiece(position) {    
        if(select === null) {
            if(pieces[position] === '') return;
            
            setPrevPos(position)
            setSelect(pieces[position])
            return;
        }
        if(pieces[position] === '') {

            if(select === whitePawn || select === blackPawn) {
                if(isValidPawnMove(prevPos, position, select)) {
                    setPieces((prev) => ({...prev, [prevPos]: ''}))
                    setPieces((prev) => ({...prev, [position]: select}))
                    setSelect(null)
                } else {
                    setSelect(null)
                }
            }

            if(select === whiteRook || select === blackRook) {
                if(isValidRookMove(prevPos, position)) {
                    setPieces((prev) => ({...prev, [prevPos]: ''}))
                    setPieces((prev) => ({...prev, [position]: select}))
                    setSelect(null)
                } else {
                    setSelect(null)
                }
            }

            if(select === whiteKnight || select === blackKnight) {
                if(isValidKnightMove(prevPos, position)) {
                    setPieces((prev) => ({...prev, [prevPos]: ''}))
                    setPieces((prev) => ({...prev, [position]: select}))
                    setSelect(null)
                } else {
                    setSelect(null)
                }

            }

            if(select === whiteBishop || select === blackBishop) {
                if(isValidBishopMove(prevPos, position)) {
                    setPieces((prev) => ({...prev, [prevPos]: ''}))
                    setPieces((prev) => ({...prev, [position]: select}))
                    setSelect(null)
                } else {
                    setSelect(null)
                }
            }

            if(select === whiteQueen || select === blackQueen) {
                if(isValidQueenMove(prevPos, position)){
                    setPieces((prev) => ({...prev, [prevPos]: ''}))
                    setPieces((prev) => ({...prev, [position]: select}))
                    setSelect(null)
                } else {
                    setSelect(null)
                }
            }

            if(select === whiteKing || select === blackKing) {
                if(isValidKingMove(prevPos, position)) {
                    setPieces((prev) => ({...prev, [prevPos]: ''}))
                    setPieces((prev) => ({...prev, [position]: select}))
                    setSelect(null)
                } else {
                    setSelect(null)
                }
            }
        }
    }

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
        </div>
    )
}

export default Board
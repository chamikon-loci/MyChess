import '../styles/chess.css'
import blackRook from '../images/br.png'
import blackBishop from '../images/bb.png'
import blackKnight from '../images/bk.png'
import blackQueen from '../images/bq.png'
import blackKing from '../images/bk.png'

import blackPawn from '../images/bp.png'

import whiteRook from '../images/wr.png'
import whiteBishop from '../images/wb.png'
import whiteKnight from '../images/wk.png'
import whiteQueen from '../images/wq.png'
import whiteKing from '../images/wk.png'

import whitePawn from '../images/wp.png'

const Board = () => {

    const row = []
    for(let i=0; i<8; i++)
        row.push(8-i)

    const col = ['a','b','c','d','e','f','g','h']

    function whatColor(i, j) {
        return (i+j)%2 === 0 ? 'light' : 'dark'
    }

    const pieces = {
        a1: whiteRook,
        b1: whiteKnight,
        c1: whiteBishop,
        d1: whiteQueen,
        e1: whiteKing,
        f1: whiteBishop,
        g1: whiteKnight,
        h1: whiteRook,

        a2: whitePawn,
        b2: whitePawn,
        c2: whitePawn,
        d2: whitePawn,
        e2: whitePawn,
        f2: whitePawn,
        g2: whitePawn,
        h2: whitePawn,

        a7: blackPawn,
        b7: blackPawn,
        c7: blackPawn,
        d7: blackPawn,
        e7: blackPawn,
        f7: blackPawn,
        g7: blackPawn,
        h7: blackPawn,

        a8: blackRook,
        b8: blackKnight,
        c8: blackBishop,
        d8: blackQueen,
        e8: blackKing,
        f8: blackBishop,
        g8: blackKnight,
        h8: blackRook,
    }

    return (
        <div className='chess-board'>
            {row.map((r, i) => 
                col.map((c, j) => {
                    const position = c+r;
                    return (
                        <button key={position} className={whatColor(i, j)}>
                            <img src={[pieces[position]]} className='pieces'/>
                        </button>
                    )
                }))
            }
        </div>
    )
}

export default Board
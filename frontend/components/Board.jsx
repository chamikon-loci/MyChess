import '../styles/chess.css'

const Board = () => {

    const row = []
    for(let i=0; i<8; i++)
        row.push(8-i)

    const col = ['a','b','c','d','e','f','g','h']

    function whatColor(i, j) {
        return (i+j)%2 === 0 ? 'light' : 'dark'
    }

    return (
        <div className='chess-board'>
            {row.map((r, i) => 
                col.map((c, j) => 
                    <button key={`${c}${r}`} 
                        className={whatColor(i, j)} 
                    >
                        
                        {c}{r}
                    </button>
            ))}
        </div>
    )
}

export default Board
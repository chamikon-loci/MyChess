import io from 'socket.io-client'
const socket = io.connect('http://localhost:3001')

import Chess from '../pages/Chess'

function App() {

  return (
    <div>
      <Chess />
    </div>
  )
}

export default App

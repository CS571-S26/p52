import { useState } from 'react'
import './App.css'
import { Button } from 'react-bootstrap'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <h1>Hello World!</h1>
        <Button onClick={() => setCount(count + 1)}>Click Me!</Button>
        <p>Count: {count}</p>
      </div> 
    </>
  )
}

export default App

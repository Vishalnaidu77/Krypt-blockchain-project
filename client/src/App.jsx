import { useState } from 'react'
import './App.css'
import { NavBar, Welcome, Footer, Services, Transactions } from './Components'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <div className="min-h-screen">
      <div className='gradient-bg-welcome'>
        <NavBar />
        <Welcome />
      </div>
      <Services />
      <Transactions />
      <Footer />
     </div>
    </>
  )
}

export default App

import './App.css'
import Home from './components/Home'

import * as buffer from "buffer";
window.Buffer = buffer.Buffer;

function App() {

  return (
    <>  
    <div className=' flex justify-center items-center h-screen bg-black text-white'>
      <Home/>
    </div>

    </>
  )
}

export default App

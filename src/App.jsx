import { useState } from 'react'
import './App.css'
import { Button } from 'react-bootstrap'
import { Routes, Route } from 'react-router-dom'
import NavigationBar from './NavigationBar'
import Footer from './Footer'
import HomePage from './HomePage'
import AboutPage from './AboutPage'


function App() {
return(
    <>
    <NavigationBar />

    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
    </Routes>
    
    <Footer/>
    </>
  )
}

export default App

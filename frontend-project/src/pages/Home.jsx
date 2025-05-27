import React from 'react'
import Navbar from '../components/Navbar'
import { Navigate } from 'react-router-dom';

const Home = () => {
    const token = localStorage.getItem('token');
    if(!token){
        return <Navigate to = '/' replace/>
    }
  return (
    <div>
        <Navbar/>
        <div className='flex justify-center pt-16'>
            <h1 className='text-md font-bold'>Welcome to Employee Management System</h1>
        </div>
    </div>
  )
}

export default Home
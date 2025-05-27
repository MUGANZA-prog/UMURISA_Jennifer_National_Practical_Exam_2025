import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Login from './pages/Login';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Employee from './pages/main-pages/Employee';
import Department from './pages/main-pages/Department';
import Salary from './pages/main-pages/Salary';
import PayrollReport from './pages/main-pages/Report';

const App = () => {
    return(
        <Router>
            <Routes>
                <Route path='/signup' element = {<Signup/>}/>
                <Route path='/' element = {<Login/>}/> 
                <Route path='/home' element = {<Home/>}/>
                <Route path='/emp' element = {<Employee/>}/>
                <Route path='/dep' element = {<Department/>}/>
                <Route path='/sal' element = {<Salary/>}/>
                <Route path='/rep' element = {<PayrollReport/>}/>
                <Route path='*' element = {<div>page not found || 404</div>}/>
            </Routes>
        </Router>
    )
}
export default App;
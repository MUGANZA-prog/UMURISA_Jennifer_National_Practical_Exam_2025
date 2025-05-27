
import { Navigate } from 'react-router-dom';
import EmployeeForm from '../../components/forms/EmployeeForm';
import Navbar from '../../components/Navbar';

const Employee = () => {
  const token = localStorage.getItem('token');
    if(!token){
        return <Navigate to = '/' replace/>
    }

  return (
    <div >
        <Navbar/>
      <div className=" flex justify-center p-6">
        <div>
            <h1 className="text-2xl font-bold mb-4">Employee Registration</h1>
            <EmployeeForm/>
      
        </div>
      </div>
    </div>
  );
};

export default Employee;


import { Navigate } from 'react-router-dom';
import DepartmentForm from '../../components/forms/DepartmentForm';
import Navbar from '../../components/Navbar';

const Department = () => {
  
const token = localStorage.getItem('token');
    if(!token){
        return <Navigate to = '/' replace/>
    }
  return (
    <div >
        <Navbar/>
      <div className=" flex justify-center p-6">
        <div>
            <h1 className="text-2xl font-bold mb-4">Add employee to department</h1>
            <DepartmentForm/>
      
        </div>
      </div>
    </div>
  );
};

export default Department;

import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Navigate } from 'react-router-dom';

const PayrollReport = () => {
  const [month, setMonth] = useState('');
  const [report, setReport] = useState([]);

  const fetchReport = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/payroll-report?month=${month}`);
      setReport(res.data);
    } catch (error) {
      console.error('Failed to fetch payroll report:', error);
    }
  };

  const downloadCSV = () => {
    const headers = ['FirstName', 'LastName', 'Position', 'Department', 'NetSalary'];
    const rows = report.map(r => [r.Fname, r.Lname, r.position, r.depName, r.netSalary]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payroll_Report_${month}.csv`;
    a.click();
  };

  const token = localStorage.getItem('token');
    if(!token){
        return <Navigate to = '/' replace/>
    }
  return (
    <div>
        <Navbar/>
        <div className='flex justify-center pt-16'>
            <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Monthly Payroll Report</h2>

      <div className="mb-4 flex gap-4">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border p-2 rounded"
        />
        <button onClick={fetchReport} className="bg-pink-700 text-white px-4 py-2 rounded">
          Generate Report
        </button>
        {report.length > 0 && (
          <button onClick={downloadCSV} className="bg-green-600 text-white px-4 py-2 rounded">
            Download CSV
          </button>
        )}
      </div>

      {report.length > 0 && (
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">First Name</th>
              <th className="p-2">Last Name</th>
              <th className="p-2">Position</th>
              <th className="p-2">Department</th>
              <th className="p-2">Net Salary</th>
            </tr>
          </thead>
          <tbody>
            {report.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{r.Fname}</td>
                <td className="p-2">{r.Lname}</td>
                <td className="p-2">{r.position}</td>
                <td className="p-2">{r.depName}</td>
                <td className="p-2">{r.netSalary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
        </div>
    </div>
  );
};

export default PayrollReport;

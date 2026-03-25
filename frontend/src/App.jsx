import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import StudentList from './pages/StudentList';
import ClassRoomList from './pages/ClassRoomList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/students" replace />} />
          <Route path="students" element={<StudentList />} />
          <Route path="classes" element={<ClassRoomList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

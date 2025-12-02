import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Homepage from './components/Homepage';
import FacebookUploadForm from './components/upload/FacebookUploadForm';
import InstagramUploadForm from './components/upload/InstagramUploadForm';
import TikTokUploadForm from './components/upload/TikTokUploadForm';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Homepage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload/facebook/:id?"
            element={
              <ProtectedRoute>
                <Layout>
                  <FacebookUploadForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload/instagram/:id?"
            element={
              <ProtectedRoute>
                <Layout>
                  <InstagramUploadForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload/tiktok/:id?"
            element={
              <ProtectedRoute>
                <Layout>
                  <TikTokUploadForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

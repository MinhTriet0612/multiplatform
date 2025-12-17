import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Homepage from './components/Homepage';
import FacebookUploadForm from './components/upload/FacebookUploadForm';
import InstagramUploadForm from './components/upload/InstagramUploadForm';
import TikTokUploadForm from './components/upload/TikTokUploadForm';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import GroupCreate from './components/GroupCreate';
import GroupDetail from './components/GroupDetail';
import InstagramPostDetail from './components/InstagramPostDetail';
import FacebookPostDetail from './components/FacebookPostDetail';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
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
              path="/groups/new"
              element={
                <ProtectedRoute>
                  <Layout>
                    <GroupCreate />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <GroupDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
          <Route
            path="/facebook-posts/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <FacebookPostDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
            <Route
              path="/instagram-posts/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <InstagramPostDetail />
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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </ThemeProvider>
  );
}

export default App;

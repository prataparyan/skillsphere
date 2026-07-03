import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
              <h1 className="text-4xl font-bold text-blue-600">
                SkillSphere
              </h1>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
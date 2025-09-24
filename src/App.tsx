import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { DocumentProvider } from "./contexts/DocumentContext";
import HomePage from "./pages/HomePage";
import TabPage from "./pages/TabPagenpm";
import "./App.css";

function App() {
  return (
    <DocumentProvider>
      <Router>
        <div className="app">
          <nav className="navbar">
            <div className="nav-container">
              <Link to="/" className="nav-logo">
                Take As Directed
              </Link>
              <div className="nav-menu">
                <Link to="/" className="nav-link">
                  Home
                </Link>
              </div>
            </div>
          </nav>

          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/tab/:tabIndex" element={<TabPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </DocumentProvider>
  );
}

export default App;

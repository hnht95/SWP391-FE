import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import AllRouter from "./routes/AllRouter";

function App() {
  return (
    <Router>
      <div className="w-full  h-screen bg-white rounded shadow">
        <AllRouter />
      </div>
    </Router>
  );
}

export default App;

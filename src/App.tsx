import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import AllRouter from "./routes/AllRouter";

function App() {
  return (
    <Router>
      <div className="p-1 text-amber-300">
        <AllRouter />
      </div>
    </Router>
  );
}

export default App;

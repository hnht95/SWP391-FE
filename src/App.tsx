import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import AllRouter from "./routes/AllRouter";
import ScrollToTop from "./landing/user/component/headerComponent/ScrollToTop";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="w-full  h-screen bg-white rounded shadow">
        <AllRouter />
      </div>
    </Router>
  );
}

export default App;

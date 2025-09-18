import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import AllRouter from "./routes/AllRouter";

import ScrollToTop from "react-scroll-to-top";
import ClickToTop from "./landing/user/component/headerComponent/ClickToTop";
function App() {
  return (
    <Router>
      <ScrollToTop smooth color="#808080" style={{ zIndex: 9999 }} />

      <div className="w-full  h-screen bg-white rounded shadow">
        <ClickToTop />
        <AllRouter />
      </div>
    </Router>
  );
}

export default App;

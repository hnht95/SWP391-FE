import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import AllRouter from "./routes/AllRouter";
import ClickToTop from "./landing/user/component/headerComponent/ClickToTop";
import ScrollToTopButton from "./landing/user/component/homePageComponent/ScrollToTopButton";

function App() {
  return (
    <Router>
      <ScrollToTopButton />
      <div className="w-full  h-screen bg-white rounded shadow">
        <ClickToTop />
        <AllRouter />
      </div>
    </Router>
  );
}

export default App;

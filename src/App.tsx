import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import AllRouter from "./routes/AllRouter";
import ClickToTop from "./landing/user/component/headerComponent/ClickToTop";
import ScrollToTopButton from "./landing/user/component/homePageComponent/ScrollToTopButton";
import AuthProvider from "./components/AuthProvider";
import { AuthModalProvider } from "./components/AuthModalProvider";
// import { StationProvider } from "./contexts/StationContext";

function App() {
  return (
    <Router>
      {/* <StationProvider> */}
      <AuthProvider>
        <AuthModalProvider>
          <ScrollToTopButton />
          <div className="w-full  h-screen bg-white rounded shadow">
            <ClickToTop />
            <AllRouter />
          </div>
        </AuthModalProvider>
      </AuthProvider>
      {/* </StationProvider> */}
    </Router>
  );
}

export default App;

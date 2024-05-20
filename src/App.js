import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Auth } from "./pages/auth/index";
import { TravelApp } from "./pages/travelApp/index";
import { SignUp } from "./pages/signUp/index";

function App() {
    return (
        <div className="App">
            <div className="background-slide blur"></div>
            <div className="background-slide blur"></div>
            <div className="background-slide blur"></div>
            <div className="background-slide blur"></div>
            <div className="background-slide blur"></div>
            <div className="background-slide blur"></div>
            <Router>
                <div className="content">
                    <Routes>
                        <Route path="/" exact element={<Auth />} />
                        <Route path="/travel-application" element={<TravelApp />} />
                        <Route path="/sign-up" element={<SignUp />} />
                    </Routes>
                </div>
            </Router>
        </div>
    );
}

export default App;
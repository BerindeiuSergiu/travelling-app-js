import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Auth } from "./pages/auth/index";
import { TravelApp } from "./pages/travelApp/index";
import { SignUp } from "./pages/signUp/index";
import { Admin } from "./pages/Admin/index";
import { Activities } from "./pages/Activities/index"

function App() {
    return (
        <div className="App">
            <Router>
                <div className="content">
                    <Routes>
                        <Route path="/" element={
                            <>
                                <div className="background-slide blur"></div>
                                <div className="background-slide blur"></div>
                                <div className="background-slide blur"></div>
                                <div className="background-slide blur"></div>
                                <div className="background-slide blur"></div>
                                <div className="background-slide blur"></div>
                                <div className="content">
                                    <Auth />
                                </div>
                            </>
                        } />
                        <Route path="/travel-application" element={<TravelApp />} />
                        <Route path="/sign-up" element={<SignUp />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/activities" element={<Activities />} />
                    </Routes>
                </div>
            </Router>
        </div>
    );
}

export default App;
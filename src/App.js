import "./App.css"
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {Auth} from "./pages/auth/index";
import {TravelApp} from "./pages/travelApp/index";
import {SignUp} from "./pages/signUp/index";

function App() {
  return(
      <div className="App">
          <Router>
            <Routes>
              <Route path="/" exact element={< Auth />} />
               <Route path = "/travel-application" element={< TravelApp />} />
                <Route path = "/sign-up" element={< SignUp />} />
            </Routes>
          </Router>
      </div>
  );
}


export default App;

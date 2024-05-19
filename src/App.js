import "./App.css"
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {Auth} from "./pages/auth/index";
import {TravelApp} from "./pages/travelApp/index";

function App() {
  return(
      <div className="App">
          <Router>
            <Routes>
              <Route path="/" exact element={<Auth />} />
               <Route path = "/travel-application" element={<TravelApp />} />
            </Routes>
          </Router>
      </div>
  );
}


export default App;

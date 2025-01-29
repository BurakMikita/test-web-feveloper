import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


import MapGenerator from './Page/MapGenerator';
import PlayPage from './Page/PlayPage';

function App() {
	



	return (
		<Router >
		<Routes>
		
		  <Route path="/" element={<MapGenerator />} /> 
		  <Route path="/play" element={<PlayPage />} />
		</Routes>
	  </Router>
	);
	
}

export default App;

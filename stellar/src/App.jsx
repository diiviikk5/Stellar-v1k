import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import {
  Landing,
  CommandDeck,
  SatelliteConsole,
  ForecastLab,
  Residuals,
  ExportBulletin
} from './pages';
import { AIAssistant, NotificationToast } from './components';

function App() {
  return (
    <Router>
      {/* Global AI Assistant */}
      <AIAssistant />

      {/* Global Notifications */}
      <NotificationToast />

      <Routes>
        {/* Landing page - no sidebar */}
        <Route path="/" element={<Landing />} />

        {/* Mission Control pages - with sidebar layout */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<CommandDeck />} />
          <Route path="/console" element={<SatelliteConsole />} />
          <Route path="/forecast-lab" element={<ForecastLab />} />
          <Route path="/residuals" element={<Residuals />} />
          <Route path="/export" element={<ExportBulletin />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;


import { Routes, Route } from 'react-router-dom';
import { UIKitPage } from './pages/UIKitPage';
import { HomePage, ResultsPage } from './pages/HomePage';
import { ScenarioMapPage } from './pages/ScenarioMapPage';
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/results/:vertical" element={<ResultsPage />} />
      <Route path="/map" element={<ScenarioMapPage />} />
      <Route path="/ui-kit" element={<UIKitPage prototype />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}

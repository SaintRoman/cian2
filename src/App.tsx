import { Routes, Route } from 'react-router-dom';
import { UIKitPage } from './pages/UIKitPage';
export default function App() {
  return (
    <Routes>
      <Route path="*" element={<UIKitPage />} />
    </Routes>
  );
}

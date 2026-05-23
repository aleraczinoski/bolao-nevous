import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./Pages/Login";
import { Dashboard } from "./Pages/Dashboard";
import { NotFound } from "./Pages/NotFound";
import { Ranking } from "./Pages/Ranking";
import { Profile } from "./Pages/Profile";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' index element={<Login />} />
        <Route path='/login' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/ranking' element={<Ranking />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

import { Route, Routes } from "react-router";
import { Header } from "./components/Header";
import { SocketListener } from './components/SocketListener';
import { FriendsPage } from './pages/Friends.page';
import { InitPage } from './pages/Init.page';
import { Main } from "./pages/Main.page";
import { PlayerDetails } from "./pages/PlayerDetails.page";
import { Settings } from "./pages/Settings.page";
import { StorePage } from './pages/Store.page';
import { WelcomePage } from './pages/Welcome.page';

function App() {

  return <main className="relative select-none cursor-default">
    <Header />
    <SocketListener />
    <MatchHandler />
    <Routes>
      <Route path="/" element={<InitPage />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/dashboard" element={<Main />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/store" element={<StorePage />} />
      <Route path="/friends" element={<FriendsPage />} />
      <Route path="/player/:puuid" element={<PlayerDetails />} />
    </Routes>
  </main>
}

export default App;

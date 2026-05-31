import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import DesktopOnlyGate from "./components/DesktopOnlyGate";
import { useIsDesktop } from "./hooks/useIsDesktop";
import Home from "./pages/Home";
import AuroraForecast from "./pages/AuroraForecast";
import Quiz from "./pages/Quiz";
import Start from "./pages/Start";
import Finale from "./pages/Finale";
import Story2 from "./pages/Story2";
import Story3 from "./pages/Story3";
import Story4 from "./pages/Story4";
import StormSafe from "./pages/StormSafe";
import KIndexDashboard from "./pages/KIndexDashboard";
import ElectronFluenceForecast from "./pages/ElectronFluenceForecast";
import AIQuestionAnswer from "./pages/AIQuestionAnswer";
import Data from "./pages/Data";
import SpaceDefense from "./pages/SpaceDefense";
import Games from "./pages/Games";
import AuroraLab from "./pages/AuroraLab";
import NotFound from "./pages/NotFound";

export default function App() {
  const isDesktop = useIsDesktop();

  if (!isDesktop) {
    return <DesktopOnlyGate />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/aurora" element={<AuroraLab />} />
          <Route path="/forecast" element={<AuroraForecast />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/games" element={<Games />} />
          <Route path="/stormsafe" element={<StormSafe />} />
          <Route path="/finale" element={<Finale />} />
          <Route path="/start" element={<Start />} />
          <Route path="/story2" element={<Story2 />} />
          <Route path="/story3" element={<Story3 />} />
          <Route path="/story4" element={<Story4 />} />
          <Route path="/kindex" element={<KIndexDashboard />} />
          <Route path="/electrons" element={<ElectronFluenceForecast />} />
          <Route path="/ai-qa" element={<AIQuestionAnswer />} />
          <Route path="/data" element={<Data />} />
          <Route path="/space-defense" element={<SpaceDefense />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

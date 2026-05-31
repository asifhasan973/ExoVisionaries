import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white flex items-center justify-center px-4 pt-20">
      <div className="text-center max-w-md space-y-6">
        <p className="text-8xl font-bold text-fuchsia-400/80">404</p>
        <h1 className="text-3xl font-bold">Lost in Space</h1>
        <p className="text-white/70">
          This page drifted out of orbit. Head back home to continue your space weather journey.
        </p>
        <Link to="/">
          <Button size="lg" className="bg-fuchsia-500 hover:bg-fuchsia-400 text-white">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

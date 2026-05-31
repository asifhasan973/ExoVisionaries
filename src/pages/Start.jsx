import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DialogueBox from "./DialogueBox";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import { useImagePreload } from "../hooks/useImagePreload";
import VocabularySlider from "../components/VocabularySlider";
import { useVocabulary } from "../hooks/useVocabulary";

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// Helper: allow numbers (px) or strings ("50%", "10vw")
const pxOr = (v) => (typeof v === "number" ? `${v}px` : v);

const styleFromPos = (pos = {}, isMobile = false) => {
  const style = {};

  // Convert percentage-based positions for mobile
  if (isMobile && pos.left && typeof pos.left === 'string' && pos.left.includes('%')) {
    const percentage = parseInt(pos.left);
    // Adjust percentages for mobile to keep elements visible
    style.left = `${Math.min(Math.max(percentage, 10), 90)}%`;
  } else if (pos.left != null) {
    style.left = pxOr(pos.left);
  }

  if (pos.top != null) style.top = pxOr(pos.top);
  if (pos.bottom != null) style.bottom = pxOr(pos.bottom);
  if (pos.right != null) style.right = pxOr(pos.right);
  if (pos.z != null) style.zIndex = pos.z;

  return style;
};

// Helper to get responsive scale
const getResponsiveScale = (scale, windowWidth) => {
  if (!scale) return 1;

  if (typeof scale === 'object') {
    if (windowWidth < 640) return scale.mobile || scale.base * 0.6;
    if (windowWidth < 768) return scale.tablet || scale.base * 0.75;
    if (windowWidth < 1024) return scale.base * 0.85;
    return scale.base || 1;
  }

  // If scale is a number, apply responsive multipliers
  if (windowWidth < 640) return scale * 0.6;
  if (windowWidth < 768) return scale * 0.75;
  if (windowWidth < 1024) return scale * 0.85;
  return scale;
};

// Helper to get responsive width
const getResponsiveWidth = (width, windowWidth) => {
  if (typeof width === 'object') {
    if (windowWidth < 640) return width.mobile || "90%";
    if (windowWidth < 768) return width.tablet || width.base * 0.85;
    return width.base || width;
  }

  // For mobile, constrain width to viewport
  if (windowWidth < 768) {
    return Math.min(width || 450, windowWidth * 0.9);
  }

  return width || 450;
};

// --- SCRIPT: fully controllable per step ---
const SCRIPT = [
  {
    id: "garden-1",
    bg: "/images/GamePage/bg1.png",
    characters: {
      child: {
        src: "/images/GamePage/c_sit.png",
        visible: true,
        pose: "sit",
        scale: { base: 0.35, mobile: 0.21, tablet: 0.28 },
        pos: { bottom: 0, left: "30%", z: 2 },
        anchorCenterX: true,
      },
      astro: {
        src: "/images/GamePage/a_hi.png",
        visible: true,
        pose: "enter-top",
        scale: { base: 0.5, mobile: 0.3, tablet: 0.4 },
        pos: { top: "-15vh", left: "105%", z: 3 },
        anchorCenterX: true,
      },
    },
    dialogue: {
      speaker: "astro",
      text: "Hi there! I'm Stelly.",
      box: {
        width: { base: 320, mobile: "75%", tablet: 280 },
        pos: { bottom: "25vh", left: "65%" },
        anchorCenterX: true
      },
    },
  },
  {
    // garden 2
    id: "garden-2",
    bg: "/images/GamePage/bg1.png",
    characters: {
      child: {
        src: "/images/GamePage/c_hi.png",
        visible: true,
        pose: "hi",
        scale: { base: 0.43, mobile: 0.26, tablet: 0.34 },
        pos: { bottom: "-5vh", left: "30%", z: 2 },
        anchorCenterX: true,
      },
      astro: {
        src: "/images/GamePage/a_listen2.png",
        visible: true,
        pose: "enter-top",
        scale: { base: 0.5, mobile: 0.3, tablet: 0.4 },
        pos: { top: "-15vh", left: "105%", z: 3 },
        anchorCenterX: true,
      },
    },
    dialogue: {
      speaker: "child",
      text: "Hi! Who are you?",
      box: {
        width: { base: 320, mobile: "75%", tablet: 280 },
        pos: { bottom: "15vh", left: "35%" },
        anchorCenterX: true
      },
    },
  },
  {
    // garden 3
    id: "garden-3",
    bg: "/images/GamePage/bg1.png",
    characters: {
      child: {
        src: "/images/GamePage/c_sit.png",
        visible: true,
        pose: "sit",
        scale: { base: 0.35, mobile: 0.21, tablet: 0.28 },
        pos: { bottom: 0, left: "30%", z: 2 },
        anchorCenterX: true,
      },
      astro: {
        src: "/images/GamePage/a_hi.png",
        visible: true,
        pose: "enter-top",
        scale: { base: 0.5, mobile: 0.3, tablet: 0.4 },
        pos: { top: "-15vh", left: "105%", z: 3 },
        anchorCenterX: true,
      },
    },
    dialogue: {
      speaker: "astro",
      text: "I'm an astronaut.",
      box: {
        width: { base: 320, mobile: "75%", tablet: 280 },
        pos: { bottom: "25vh", left: "65%" },
        anchorCenterX: true
      },
    },
  },
  {
    // garden 4
    id: "garden-4",
    bg: "/images/GamePage/bg1.png",
    characters: {
      child: {
        src: "/images/GamePage/c_sit_wow.png",
        visible: true,
        pose: "hi",
        scale: { base: 0.43, mobile: 0.26, tablet: 0.34 },
        pos: { bottom: "-5vh", left: "30%", z: 2 },
        anchorCenterX: true,
      },
      astro: {
        src: "/images/GamePage/a_listen2.png",
        visible: true,
        pose: "enter-top",
        scale: { base: 0.5, mobile: 0.3, tablet: 0.4 },
        pos: { top: "-15vh", left: "105%", z: 3 },
        anchorCenterX: true,
      },
    },
    dialogue: {
      speaker: "child",
      text: "Astronaut? What is it?",
      box: {
        width: { base: 320, mobile: "75%", tablet: 280 },
        pos: { bottom: "15vh", left: "35%" },
        anchorCenterX: true
      },
    },
  },
  {
    // garden 5
    id: "garden-5",
    bg: "/images/GamePage/bg1.png",
    characters: {
      child: {
        src: "/images/GamePage/c_talk2.png",
        visible: true,
        pose: "hi",
        scale: { base: 0.43, mobile: 0.26, tablet: 0.34 },
        pos: { bottom: "-5vh", left: "30%", z: 2 },
        anchorCenterX: true,
      },
      astro: {
        src: "/images/GamePage/a_talk.png",
        visible: true,
        pose: "enter-top",
        scale: { base: 0.5, mobile: 0.3, tablet: 0.4 },
        pos: { top: "-15vh", left: "105%", z: 3 },
        anchorCenterX: true,
      },
    },
    dialogue: {
      speaker: "astro",
      text: `An astronaut is a space explorer!`,
      box: {
        width: { base: 320, mobile: "75%", tablet: 280 },
        pos: { bottom: "25vh", left: "65%" },
        anchorCenterX: true
      },
    },
  },
  {
    // garden 6 - Do you wanna explore
    id: "garden-6",
    bg: "/images/GamePage/bg1.png",
    characters: {
      child: {
        src: "/images/GamePage/c_sit_wow.png",
        visible: true,
        pose: "hi",
        scale: { base: 0.43, mobile: 0.26, tablet: 0.34 },
        pos: { bottom: "-5vh", left: "30%", z: 2 },
        anchorCenterX: true,
      },
      astro: {
        src: "/images/GamePage/a_hi.png",
        visible: true,
        pose: "enter-top",
        scale: { base: 0.5, mobile: 0.3, tablet: 0.4 },
        pos: { top: "-15vh", left: "105%", z: 3 },
        anchorCenterX: true,
      },
    },
    dialogue: {
      speaker: "astro",
      text: `Do you wanna explore the space?`,
      box: {
        width: { base: 320, mobile: "75%", tablet: 280 },
        pos: { bottom: "25vh", left: "65%" },
        anchorCenterX: true
      },
    },
  },
  {
    // garden 7 - YES
    id: "garden-7",
    bg: "/images/GamePage/bg1.png",
    characters: {
      child: {
        src: "/images/GamePage/c_happy.png",
        visible: true,
        pose: "hi",
        scale: { base: 0.40, mobile: 0.24, tablet: 0.32 },
        pos: { bottom: "2vh", left: "30%", z: 2 },
        anchorCenterX: true,
      },
      astro: {
        src: "/images/GamePage/a_hi.png",
        visible: true,
        pose: "enter-top",
        scale: { base: 0.5, mobile: 0.3, tablet: 0.4 },
        pos: { top: "-15vh", left: "105%", z: 3 },
        anchorCenterX: true,
      },
    },
    dialogue: {
      speaker: "child",
      text: "Yes...",
      box: {
        width: { base: 320, mobile: "75%", tablet: 280 },
        pos: { bottom: "15vh", left: "35%" },
        anchorCenterX: true
      },
    },
  },

  /* ========= Final scene: static characters, no motion ========= */
  {
    id: "take-off",
    bg: "/images/GamePage/bg1.png",
    characters: {
      child: {
        src: "/images/GamePage/c_happy.png",
        visible: true,
        scale: { base: 0.40, mobile: 0.24, tablet: 0.32 },
        pos: { bottom: "2vh", left: "30%", z: 2 },
        anchorCenterX: true,
      },
      astro: {
        src: "/images/GamePage/a_hi.png",
        visible: true,
        scale: { base: 0.5, mobile: 0.3, tablet: 0.4 },
        pos: { bottom: "12vh", left: "58%", z: 3 },
        anchorCenterX: true,
      },
    },
    dialogue: {
      speaker: "astro",
      text: "Hold my hand, let's fly! 🚀",
      box: {
        width: { base: 340, mobile: "75%", tablet: 300 },
        pos: { bottom: "20vh", left: "60%" },
        anchorCenterX: true
      },
    },
  },
];

export default function Start() {
  const [stepIndex, setStepIndex] = useState(0);
  const [isVocabularySideBySide, setIsVocabularySideBySide] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const windowSize = useWindowSize();
  const isMobile = windowSize.width < 768;

  const step = SCRIPT[stepIndex];
  const canNext = stepIndex < SCRIPT.length - 1;
  const isLast = !canNext;

  // Preload assets for the current step (bg + character sprites used in this step)
  const stepImageUrls = useMemo(() => {
    const urls = new Set();
    if (step?.bg) urls.add(step.bg);
    const addChar = (c) => c?.src && urls.add(c.src);
    if (step?.characters) {
      addChar(step.characters.astro);
      addChar(step.characters.child);
    }
    return Array.from(urls);
  }, [step]);

  const { done: assetsReady, progress } = useImagePreload(stepImageUrls);

  // Get vocabulary for current step
  const { vocabulary: currentVocabulary, hasVocabulary } = useVocabulary('start', step?.id, assetsReady);

  // If we came back from Story2 with jumpToLast flag, jump to last scene
  useEffect(() => {
    if (location.state?.jumpToLast) {
      setStepIndex(SCRIPT.length - 1);
      // Clean the state so re-renders don't repeat
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter' && assetsReady) {
        if (canNext) {
          setStepIndex((i) => i + 1);
        } else if (isLast) {
          navigate("/story2");
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [canNext, isLast, assetsReady, navigate]);

  return (
    <div
      id="story-root"
      className={`
        relative min-h-screen overflow-hidden text-white
        ${isMobile ? 'touch-manipulation' : ''}
      `}
      style={{
        maxHeight: '100vh',
        touchAction: isMobile ? 'pan-y' : 'auto',
      }}
    >
      {/* Content Container - only this area becomes flex when side-by-side */}
      <div className={`${isVocabularySideBySide ? 'flex h-screen' : ''}`}>
        {/* Main Content Area */}
        <div className={`${isVocabularySideBySide ? 'flex-1 min-w-0 relative pt-20' : 'w-full pt-20'}`}>
          <LoadingOverlay show={!assetsReady} label={`Loading… ${progress}%`} />
          <Background bg={step.bg} bgVideo={step.bgVideo} />

          <CharactersLayer
            characters={step.characters}
            windowSize={windowSize}
          />

          {/* Dialogue – size + position controlled from script */}
          <DialogueBox
            speaker={step.dialogue?.speaker}
            text={step.dialogue?.text}
            width={getResponsiveWidth(step.dialogue?.box?.width, windowSize.width)}
            position={step.dialogue?.box?.pos}
            anchorCenterX={step.dialogue?.box?.anchorCenterX}
            loading={!assetsReady}
            onNext={() => {
              if (!assetsReady) return;
              if (canNext) return setStepIndex((i) => i + 1);
              if (isLast) navigate("/story2");
            }}
            showNext={canNext || isLast}
            onBack={() => {
              if (!assetsReady) return;
              if (stepIndex > 0) setStepIndex((i) => i - 1);
            }}
            canBack={stepIndex > 0}
          />
        </div>

        {/* Vocabulary Slider */}
        <VocabularySlider
          vocabulary={currentVocabulary}
          isVisible={hasVocabulary}
          onLayoutChange={setIsVocabularySideBySide}
        />
      </div>
    </div>
  );
}

function Background({ bg, bgVideo }) {
  return (
    <>
      {bgVideo ? (
        <video
          className="absolute inset-0 -z-30 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          poster={bg || ""}
        >
          <source src={bgVideo} type="video/mp4" />
        </video>
      ) : (
        <div
          className="inset-0 -z-30 bg-cover bg-center"
          style={{ position: "absolute", backgroundImage: `url(${bg})` }}
        />
      )}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-black/20 via-purple-950/30 to-black/60" />
    </>
  );
}

function CharactersLayer({ characters = {}, windowSize }) {
  const { child, astro } = characters;
  const isMobile = windowSize.width < 768;

  const buildStyle = (char, maxWidth) => {
    const scale = getResponsiveScale(char.scale, windowSize.width);
    const transforms = [];

    if (char.anchorCenterX) transforms.push("translateX(-50%)");
    if (char.flipX) transforms.push("scaleX(-1)");
    transforms.push(`scale(${scale})`);

    return {
      position: "absolute",
      ...styleFromPos(char.pos, isMobile),
      transform: transforms.join(" "),
      transformOrigin: "center bottom",
      height: "auto",
      maxWidth: maxWidth ?? (isMobile ? "60vw" : char.maxWidth ?? "40vw"),
    };
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {astro?.visible !== false && astro?.src && (
        <img
          src={astro.src}
          alt="Astronaut"
          draggable={false}
          className="absolute drop-shadow-[0_10px_40px_rgba(59,130,246,.6)]"
          style={buildStyle(astro)}
          width={800}
          height={800}
        />
      )}
      {child?.visible !== false && child?.src && (
        <img
          src={child.src}
          alt="Child"
          draggable={false}
          className="absolute drop-shadow-[0_10px_40px_rgba(124,58,237,.6)]"
          style={buildStyle(child, isMobile ? "55vw" : "36vw")}
          width={800}
          height={800}
        />
      )}
    </div>
  );
}
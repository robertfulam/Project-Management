import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, Waves } from "lucide-react";

const ThemeToggle = () => {
  const { themeName, cycleTheme } = useTheme();

  const iconMap = {
    light: <Sun size={20} />,
    dark: <Moon size={20} />,
    ocean: <Waves size={20} />,
  };

  return (
    <button onClick={cycleTheme} className="theme-toggle">
      {iconMap[themeName]}
    </button>
  );
};

export default ThemeToggle;
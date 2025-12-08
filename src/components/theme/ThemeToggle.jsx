import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ThemeToggle({ variant = "default" }) {
  const [theme, setTheme] = useState('dark');
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('caio_theme') || 'dark';
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('caio_theme', newTheme);
    
    // Navigate to appropriate landing page
    const targetPage = newTheme === 'dark' ? 'Landing' : 'LandingLight';
    navigate(createPageUrl(targetPage));
  };

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={toggleTheme}
      className="relative overflow-hidden transition-all duration-300"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </Button>
  );
}
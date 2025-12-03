import { Badge } from "@/components/ui/badge";
import { platforms, type Platform } from "@shared/schema";
import { SiYoutube, SiTiktok, SiInstagram } from "react-icons/si";
import { Tv, Play, Radio } from "lucide-react";

const platformIcons: Record<Platform, React.ReactNode> = {
  youtube: <SiYoutube className="h-3 w-3" />,
  rumble: <Play className="h-3 w-3" />,
  bitchute: <Radio className="h-3 w-3" />,
  odysee: <Tv className="h-3 w-3" />,
  tiktok: <SiTiktok className="h-3 w-3" />,
  instagram: <SiInstagram className="h-3 w-3" />,
};

const platformLabels: Record<Platform, string> = {
  youtube: "YouTube",
  rumble: "Rumble",
  bitchute: "BitChute",
  odysee: "Odysee",
  tiktok: "TikTok",
  instagram: "Instagram",
};

interface PlatformSelectorProps {
  selected: Platform[];
  onChange: (platforms: Platform[]) => void;
  disabled?: boolean;
}

export function PlatformSelector({ selected, onChange, disabled }: PlatformSelectorProps) {
  const togglePlatform = (platform: Platform) => {
    if (disabled) return;
    if (selected.includes(platform)) {
      onChange(selected.filter((p) => p !== platform));
    } else {
      onChange([...selected, platform]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map((platform) => {
        const isSelected = selected.includes(platform);
        return (
          <Badge
            key={platform}
            variant={isSelected ? "default" : "outline"}
            className={`cursor-pointer transition-all gap-1.5 ${
              isSelected ? "bg-primary" : "hover-elevate"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => togglePlatform(platform)}
            data-testid={`badge-platform-${platform}`}
          >
            {platformIcons[platform]}
            {platformLabels[platform]}
          </Badge>
        );
      })}
    </div>
  );
}

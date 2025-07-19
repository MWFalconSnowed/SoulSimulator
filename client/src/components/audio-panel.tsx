import { useState, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, SkipForward, Settings } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { FantasyButton } from "@/components/ui/fantasy-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { audioEngine, AudioChannel, DEFAULT_AUDIO_CLIPS } from "@/lib/audio-engine";

export function AudioPanel() {
  const [channels, setChannels] = useState<AudioChannel[]>([]);
  const [masterVolume, setMasterVolume] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);

  useEffect(() => {
    // Initialize audio engine
    audioEngine.initialize();
    
    // Load default audio clips
    DEFAULT_AUDIO_CLIPS.forEach(clip => {
      audioEngine.loadAudio(clip);
    });

    // Update channels
    setChannels(audioEngine.getChannels());
  }, []);

  const handleChannelVolumeChange = (channelId: string, volume: number) => {
    audioEngine.setChannelVolume(channelId, volume / 100);
    setChannels(audioEngine.getChannels());
  };

  const handleChannelMute = (channelId: string, muted: boolean) => {
    audioEngine.muteChannel(channelId, muted);
    setChannels(audioEngine.getChannels());
  };

  const handleMasterVolumeChange = (volume: number[]) => {
    const vol = volume[0];
    setMasterVolume(vol);
    audioEngine.setMasterVolume(vol / 100);
  };

  const handlePlayMusic = async (trackId: string) => {
    if (currentTrack === trackId && isPlaying) {
      await audioEngine.stopMusic();
      setIsPlaying(false);
      setCurrentTrack(null);
    } else {
      await audioEngine.playMusic(trackId, 2.0);
      setIsPlaying(true);
      setCurrentTrack(trackId);
    }
  };

  const handlePlaySFX = (sfxId: string) => {
    audioEngine.playSFX(sfxId);
  };

  const handlePlayAmbient = (ambientId: string) => {
    audioEngine.playAmbient(ambientId, true);
  };

  return (
    <GlassPanel className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Volume2 className="w-5 h-5 text-amber-400" />
        <h2 className="text-xl font-bold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
          Audio Engine
        </h2>
      </div>

      {/* Master Volume */}
      <Card className="bg-black/20 border-amber-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-amber-300 text-sm flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Master Volume
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4">
            <VolumeX className="w-4 h-4 text-amber-500/60" />
            <Slider
              value={[masterVolume]}
              onValueChange={handleMasterVolumeChange}
              max={100}
              step={1}
              className="flex-1"
            />
            <Volume2 className="w-4 h-4 text-amber-500" />
            <span className="text-amber-300 text-sm min-w-[3ch]">
              {masterVolume}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Channel Controls */}
      <div className="space-y-4">
        <h3 className="text-amber-300 font-semibold">Audio Channels</h3>
        {channels.map(channel => (
          <Card key={channel.id} className="bg-black/20 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-amber-300 font-medium">{channel.name}</span>
                <Switch
                  checked={!channel.muted}
                  onCheckedChange={(checked) => handleChannelMute(channel.id, !checked)}
                />
              </div>
              <div className="flex items-center gap-4">
                <VolumeX className="w-4 h-4 text-amber-500/60" />
                <Slider
                  value={[channel.volume * 100]}
                  onValueChange={(volume) => handleChannelVolumeChange(channel.id, volume[0])}
                  max={100}
                  step={1}
                  className="flex-1"
                  disabled={channel.muted}
                />
                <Volume2 className="w-4 h-4 text-amber-500" />
                <span className="text-amber-300 text-sm min-w-[3ch]">
                  {Math.round(channel.volume * 100)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Audio Controls */}
      <div className="space-y-4">
        <h3 className="text-amber-300 font-semibold">Quick Controls</h3>
        
        {/* Music Controls */}
        <Card className="bg-black/20 border-amber-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-amber-300 text-sm">Background Music</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              <FantasyButton
                size="sm"
                variant={currentTrack === 'temple_music' && isPlaying ? 'secondary' : 'default'}
                onClick={() => handlePlayMusic('temple_music')}
                className="flex items-center gap-2"
              >
                {currentTrack === 'temple_music' && isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                Temple Music
              </FantasyButton>
            </div>
          </CardContent>
        </Card>

        {/* Sound Effects */}
        <Card className="bg-black/20 border-amber-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-amber-300 text-sm">Sound Effects</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2">
              <FantasyButton
                size="sm"
                onClick={() => handlePlaySFX('spell_cast')}
                className="flex items-center gap-2"
              >
                <SkipForward className="w-3 h-3" />
                Spell Cast
              </FantasyButton>
              <FantasyButton
                size="sm"
                onClick={() => handlePlaySFX('magic_chime')}
                className="flex items-center gap-2"
              >
                <SkipForward className="w-3 h-3" />
                Magic Chime
              </FantasyButton>
              <FantasyButton
                size="sm"
                onClick={() => handlePlaySFX('footsteps')}
                className="flex items-center gap-2"
              >
                <SkipForward className="w-3 h-3" />
                Footsteps
              </FantasyButton>
            </div>
          </CardContent>
        </Card>

        {/* Ambient Sounds */}
        <Card className="bg-black/20 border-amber-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-amber-300 text-sm">Ambient Sounds</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              <FantasyButton
                size="sm"
                onClick={() => handlePlayAmbient('mystic_ambient')}
                className="flex items-center gap-2"
              >
                <Play className="w-3 h-3" />
                Mystical Ambient
              </FantasyButton>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SoulScript Integration Info */}
      <Card className="bg-amber-500/10 border-amber-500/30">
        <CardContent className="p-4">
          <div className="text-amber-200 text-xs space-y-2">
            <div className="font-semibold text-amber-300">SoulScript Audio Functions:</div>
            <div className="font-mono bg-black/20 p-2 rounded space-y-1">
              <div>playSound("spell_cast")</div>
              <div>playMusic("temple_music")</div>
              <div>setVolume("music", 0.7)</div>
              <div>playAmbient("mystic_ambient")</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </GlassPanel>
  );
}
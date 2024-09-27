"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Music, AudioLines, Drum, Play, Pause, User, Settings, Download, Menu, ChevronUp, Share2, Scissors, ToggleLeft, ToggleRight, LogOut, ChevronRight, ChevronDown } from "lucide-react";
import AnimatedWaveform from "@/components/ui/AnimatedWaveform";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PlayBar from "@/components/ui/PlayBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser, useClerk, useAuth } from "@clerk/nextjs";
import { signInWithCustomToken } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, query, where, onSnapshot, orderBy, Timestamp, DocumentData } from "firebase/firestore";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { getAuth } from "firebase/auth";

interface Model {
  icon: React.ReactNode;
  text: string;
}

interface CharacterQuota {
  total: number;
  remaining: number;
}

type ModelExamples = {
  [key: string]: string[];
};

interface HistoryItem {
  id: string;
  text: string;
  date: string;
  generations: Array<{ id: number; url: string }>;
}

const LoopgenInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"Generate" | "History">("Generate");
  const [activeModel, setActiveModel] = useState<string>("Text to SFX");
  const [inputText, setInputText] = useState<string>("");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true);
  const [isSidebarPinned, setIsSidebarPinned] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(6);
  const [promptInfluence, setPromptInfluence] = useState<number>(50);
  const [characterQuota] = useState<CharacterQuota>({ total: 30000, remaining: 29960 });
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 0);
  const [justUnpinned, setJustUnpinned] = useState<boolean>(false);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [autoDuration, setAutoDuration] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedSounds, setGeneratedSounds] = useState<Array<{ id: number; url: string }>>([]);
  const [hasStartedGenerating, setHasStartedGenerating] = useState<boolean>(false);
  const [activeSound, setActiveSound] = useState<{ id: number; url: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isPlayBarVisible, setIsPlayBarVisible] = useState(true);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isUserMenuVisible, setIsUserMenuVisible] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const audioRefs = useRef<Array<HTMLAudioElement | null>>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userProfileRef = useRef<HTMLDivElement>(null);

  const { user } = useUser();
  const { signOut } = useClerk();
  const { getToken, userId } = useAuth();

  const SIDEBAR_BREAKPOINT = 768;

  const getModelKey = (text: string) => {
    switch (text) {
      case "Text to SFX":
        return "Text to SFX";
      case "Text to Sample":
        return "Text to Sample Loop";
      case "Text to Drums":
        return "Text to Drum Loop";
      default:
        return text;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobileView(width < SIDEBAR_BREAKPOINT);
      if (width >= SIDEBAR_BREAKPOINT) {
        setIsSidebarExpanded(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (justUnpinned) {
      const timer = setTimeout(() => setJustUnpinned(false), 300);
      return () => clearTimeout(timer);
    }
  }, [justUnpinned]);

  useEffect(() => {
    const signIntoFirebaseWithClerk = async () => {
      if (userId) {
        try {
          const token = await getToken({ template: "integration_firebase" });
          if (token) {
            await signInWithCustomToken(auth, token);
            console.log("Signed into Firebase");
            fetchHistory();
          }
        } catch (error) {
          console.error("Error signing into Firebase:", error);
        }
      }
    };

    signIntoFirebaseWithClerk();
  }, [userId, getToken]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isUserMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node) &&
        userProfileRef.current &&
        !userProfileRef.current.contains(event.target as Node)
      ) {
        closeUserMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const fetchHistory = useCallback(() => {
    if (!userId) {
      console.log("No user, skipping fetchHistory");
      return;
    }

    console.log("Fetching history for user:", userId);
    try {
      const historyRef = collection(db, "history");
      const q = query(
        historyRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedHistory: HistoryItem[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as DocumentData;
          fetchedHistory.push({
            id: doc.id,
            text: data.text,
            date: data.createdAt.toDate().toLocaleDateString(),
            generations: data.generations,
          });
        });

        setHistoryItems(fetchedHistory);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  }, [userId]);

  const handleBackgroundDownload = useCallback(async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = blobUrl;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Download failed. Please try again.");
    }
  }, []);

  const handleDownload = useCallback(async (soundUrl: string, fileName: string, id: string) => {
    if (!auth.currentUser) {
      console.error("User not authenticated");
      alert("Please sign in to download sounds.");
      return;
    }

    setDownloadingId(id);
    try {
      const storage = getStorage();
      const soundRef = ref(storage, soundUrl);
      
      const url = await getDownloadURL(soundRef);

      // Open the download URL in a new tab
      window.open(url, '_blank');

    } catch (error) {
      console.error("Error downloading file:", error);
      let errorMessage = "Download failed. Please try again.";
      if (error instanceof Error) {
        const firebaseError = error as { code?: string };
        switch (firebaseError.code) {
          case 'storage/object-not-found':
            errorMessage = "File not found.";
            break;
          case 'storage/unauthorized':
            errorMessage = "You don't have permission to access this file.";
            break;
          case 'storage/canceled':
            errorMessage = "Download canceled.";
            break;
          case 'storage/unknown':
            errorMessage = "An unknown error occurred. Please try again.";
            break;
        }
      }
      alert(errorMessage);
    } finally {
      setDownloadingId(null);
    }
  }, [auth]);

  const isSidebarPinnedAndVisible = isSidebarPinned && windowWidth > SIDEBAR_BREAKPOINT;

  const tabs: ("Generate" | "History")[] = ["Generate", "History"];

  const models: Model[] = [
    { icon: <AudioLines className="w-5 h-5" />, text: "Text to SFX" },
    { icon: <Music className="w-5 h-5" />, text: "Text to Sample Loop" },
    { icon: <Drum className="w-5 h-5" />, text: "Text to Drum Loop" },
  ];

  const modelExamples: ModelExamples = {
    "Text to SFX": [
      "Powerful kick drum", "Crisp snare hit", "Deep sub bass", "Futuristic synth stab",
      "Atmospheric pad texture", "Glitchy percussion", "Punchy tom", "Metallic crash"
    ],
    "Text to Sample Loop": [
      "Uplifting house chord progression", "Dark and moody techno bassline",
      "Funky disco guitar riff", "Ethereal ambient pad loop",
      "Groovy hip-hop piano melody", "Energetic trance arpeggios",
      "Chill lo-fi beats", "Aggressive dubstep wobble bass"
    ],
    "Text to Drum Loop": [
      "Punchy house beat, 128 BPM", "Breakbeat jungle rhythm, 170 BPM",
      "Laid-back hip-hop groove, 90 BPM", "Driving techno percussion, 135 BPM",
      "Drum and bass, 160 BPM, atmospheric", "Trap hi-hats and 808, 140 BPM",
      "Rock drum fill, 120 BPM", "Latin-inspired percussion loop, 110 BPM"
    ]
  };

  const sidebarSections = [
    {
      title: "CREATE",
      items: [
        { icon: <AudioLines className="w-5 h-5" />, text: "Text to SFX", onClick: () => handleModelChange("Text to SFX") },
        { icon: <Music className="w-5 h-5" />, text: "Text to Sample", onClick: () => handleModelChange("Text to Sample Loop") },
        { icon: <Drum className="w-5 h-5" />, text: "Text to Drums", onClick: () => handleModelChange("Text to Drum Loop") },
      ]
    },
    {
      title: "TOOLS",
      items: [
        { icon: <Scissors className="w-5 h-5" />, text: "VOX Clean-Up", onClick: () => { } },
      ]
    }
  ];

  const togglePin = () => {
    if (isMobileView) {
      setIsSidebarExpanded(!isSidebarExpanded);
    } else {
      setIsSidebarPinned(!isSidebarPinned);
      if (isSidebarPinned) {
        setJustUnpinned(true);
        setIsSidebarExpanded(false);
      }
    }
  };

  const handleModelChange = (model: string) => {
    setActiveModel(getModelKey(model));
    setInputText("");
    setHasStartedGenerating(false);
    setGeneratedSounds([]);
    if (isMobileView) {
      setIsSidebarExpanded(false);
    }
  };

  const handleSidebarHover = () => {
    if (!justUnpinned && !isMobileView) {
      setIsSidebarExpanded(true);
    }
  };

  const handleSidebarLeave = () => {
    if (!isMobileView && !isSidebarPinned) {
      setIsSidebarExpanded(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleGenerate = async () => {
    const auth = getAuth();
    if (!auth.currentUser) {
      console.error("User not authenticated with Firebase");
      alert("Please sign in to generate sounds.");
      return;
    }

    if (inputText.trim() && userId) {
      setIsGenerating(true);
      setHasStartedGenerating(true);
      try {
        const generateSingleSound = async () => {
          const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
          if (!apiKey) {
            throw new Error("API key is not set");
          }

          console.log("Starting sound generation");
          const response = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "xi-api-key": apiKey,
            },
            body: JSON.stringify({
              text: inputText,
              duration_seconds: autoDuration ? undefined : duration,
              prompt_influence: promptInfluence / 100,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API error: ${errorData.message || response.statusText}`);
          }

          const audioBlob = await response.blob();
          const fileName = `sound_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`;
          const storageRef = ref(getStorage(), `sounds/${userId}/${fileName}`);

          await uploadBytes(storageRef, audioBlob);
          const downloadURL = await getDownloadURL(storageRef);

          return { id: Date.now() + Math.random(), url: downloadURL };
        };

        const generationPromises = Array(2).fill(null).map(generateSingleSound);
        const newGenerations = await Promise.all(generationPromises);

        setGeneratedSounds(newGenerations);

        // Save to Firestore
        const historyRef = collection(db, "history");
        await addDoc(historyRef, {
          userId: userId,
          text: inputText,
          createdAt: Timestamp.now(),
          generations: newGenerations,
        });

        await fetchHistory();
      } catch (error: any) {
        console.error("Detailed error in handleGenerate:", error);
        if (error.code === "storage/unauthorized") {
          alert("You don't have permission to upload files. Please check your account status.");
        } else {
          alert(`An error occurred: ${error.message}. Please check the console for more details.`);
        }
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const toggleSound = (sound: { id: number; url: string }, index: number) => {
    console.log("Toggling sound:", sound);
    if (activeSound && activeSound.id === sound.id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveSound(sound);
      setIsPlaying(true);
    }
    setIsPlayBarVisible(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleClosePlayBar = () => {
    setIsPlayBarVisible(false);
  };

  const handleOpenPlayBar = () => {
    setIsPlayBarVisible(true);
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.min(Math.max(parseInt(e.target.value) || 1, 1), 22);
    setDuration(newValue);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to the landing page after sign out
      window.location.href = '/';
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleUserMenu = () => {
    if (isUserMenuOpen) {
      closeUserMenu();
    } else {
      openUserMenu();
    }
  };

  const openUserMenu = () => {
    setIsUserMenuOpen(true);
    setTimeout(() => setIsUserMenuVisible(true), 50);
  };

  const closeUserMenu = () => {
    setIsUserMenuVisible(false);
    setTimeout(() => setIsUserMenuOpen(false), 300);
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800 overflow-hidden relative">
      <AnimatedWaveform />

      {isSettingsOpen && <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-40" />}

      {isMobileView && isSidebarExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarExpanded(false)}
        />
      )}

      <div
        className={`fixed left-0 top-0 h-full bg-white text-gray-800 transition-all duration-300 ease-in-out z-50 flex flex-col shadow-lg
        ${
          isMobileView
            ? isSidebarExpanded
              ? "w-64 translate-x-0"
              : "w-64 -translate-x-full"
            : isSidebarPinnedAndVisible || (isSidebarExpanded && !justUnpinned)
            ? "w-64"
            : "w-20"
        }`}
        onMouseEnter={!isMobileView ? handleSidebarHover : undefined}
        onMouseLeave={!isMobileView ? handleSidebarLeave : undefined}
      >
        <div className="h-20 flex items-center justify-between px-4 border-b border-gray-200">
          <div onClick={() => { handleModelChange('Text to SFX'); setActiveTab('Generate'); }} className="cursor-pointer">
            {isSidebarPinnedAndVisible || (isSidebarExpanded && !justUnpinned) || isMobileView ? (
              <span className="text-2xl font-bold">Loopgen</span>
            ) : (
              <div className="w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-xl">L</div>
            )}
          </div>
          {(isSidebarPinnedAndVisible || (isSidebarExpanded && !justUnpinned)) && !isMobileView && (
            <button
              className="text-gray-600 hover:text-gray-800"
              onClick={togglePin}
            >
              {isSidebarPinned ? (
                <ToggleRight size={24} />
              ) : (
                <ToggleLeft size={24} />
              )}
            </button>
          )}
        </div>

        <div className="flex-grow overflow-y-auto">
          {sidebarSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mt-6">
              {(isSidebarPinnedAndVisible || (isSidebarExpanded && !justUnpinned) || isMobileView) && (
                <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500">{section.title}</h3>
              )}
              {section.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className={`mx-2 p-2 cursor-pointer flex items-center transition-colors duration-200 rounded-lg
                  ${activeModel === getModelKey(item.text) ? 'bg-gray-200 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                  ${(isSidebarPinnedAndVisible || (isSidebarExpanded && !justUnpinned) || isMobileView) ? 'justify-start' : 'justify-center'}`}
                  onClick={() => {
                    handleModelChange(item.text);
                    item.onClick();
                  }}
                >
                  {item.icon}
                  {(isSidebarPinnedAndVisible || (isSidebarExpanded && !justUnpinned) || isMobileView) && (
                    <span className="ml-4 text-sm">{item.text}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-auto relative">
          <div
            ref={userProfileRef}
            className="p-4 border-t border-gray-200 flex items-center cursor-pointer"
            onClick={toggleUserMenu}
          >
            <Avatar>
              {user?.imageUrl ? (
                <AvatarImage src={user.imageUrl} alt={user.fullName || ""} />
              ) : (
                <AvatarFallback>
                  <User className="w-8 h-8" />
                </AvatarFallback>
              )}
            </Avatar>
            {(isSidebarPinnedAndVisible || (isSidebarExpanded && !justUnpinned)) && (
              <div className="ml-3 flex-grow overflow-hidden">
                <div className="text-sm font-medium truncate">{user?.fullName || "My Account"}</div>
                <div className="text-xs text-gray-500 truncate">{user?.primaryEmailAddress?.emailAddress || "Workspace 863d4140c..."}</div>
                <div className="text-xs mt-1 truncate">
                  Quota: {characterQuota.remaining.toLocaleString()} / {characterQuota.total.toLocaleString()}
                </div>
              </div>
            )}
            {(isSidebarPinnedAndVisible || (isSidebarExpanded && !justUnpinned)) && (
              isUserMenuOpen ? (
                <ChevronRight className="ml-2 transition-transform duration-300" />
              ) : (
                <ChevronDown className="ml-2 transition-transform duration-300" />
              )
            )}
          </div>
          {isUserMenuOpen && (
            <div
              ref={userMenuRef}
              className={`absolute bottom-0 left-full ml-2 bg-white shadow-lg rounded-lg py-2 w-56 max-w-[calc(100vw-100%)] transition-all duration-300 ease-in-out ${
                isUserMenuVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              }`}
            >
              <div className="px-4 py-2 border-b border-gray-200">
                <div className="font-medium truncate">{user?.fullName || "My Account"}</div>
                <div className="text-sm text-gray-500 truncate">
                  {user?.primaryEmailAddress?.emailAddress || "Workspace 863d4140c..."}
                </div>
              </div>
              <div className="px-2 py-1">
                <button className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded">Profile</button>
                <button className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded">Subscription</button>
                <button className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded">Docs and resources</button>
                <button className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded">Terms and privacy</button>
              </div>
              <div className="border-t border-gray-200 mt-2 pt-2 px-2">
                <button className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded flex items-center" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`flex-1 transition-all duration-300 ${isMobileView ? 'ml-0' : (isSidebarPinnedAndVisible ? 'ml-64' : 'ml-20')}`}>
        {isMobileView && (
          <div className="flex justify-between items-center p-4 bg-white border-b">
            <h1 className="text-xl font-bold">{activeModel}</h1>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600">
                <User className="w-6 h-6" />
              </button>
              <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}>
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
        <div className="h-full overflow-auto" style={{ paddingBottom: activeSound ? '50px' : '0' }}>
          <div className="py-8 px-6 z-10 relative">
            {!isMobileView && (
              <>
                <h1 className="text-4xl font-bold mb-2">{activeModel}</h1>
                <p className="text-gray-600 mb-2">
                  Generate realistic sound effects from text descriptions.
                </p>
              </>
            )}

            <div className="border-b mb-8">
              <div className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    className={`mr-4 px-2 py-2 text-sm font-medium transition-colors duration-200 ${
                      activeTab === tab ? 'border-b-2 border-black' : 'text-gray-500'
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              {activeTab === "Generate" && (
                <>
                  <div className="relative mb-8 rounded-lg">
                    <textarea
                      className={`w-full h-40 p-4 rounded-lg resize-none transition-all duration-200 outline-none ${
                        isTextareaFocused
                          ? "border border-black shadow-md"
                          : "border-transparent shadow"
                      }`}
                      placeholder={`Start typing here or paste any text you want to turn into ${activeModel.toLowerCase()}.`}
                      value={inputText}
                      onChange={handleInputChange}
                      onFocus={() => setIsTextareaFocused(true)}
                      onBlur={() => setIsTextareaFocused(false)}
                    />
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                        <SheetTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </Button>
                        </SheetTrigger>
                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle>Settings</SheetTitle>
                          </SheetHeader>
                          <div className="space-y-6 mt-6">
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Duration</h3>
                              <p className="text-sm text-gray-600 mb-2">Determine how long your generations should be</p>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm">Automatically pick the best length</span>
                                <Switch
                                  checked={autoDuration}
                                  onCheckedChange={setAutoDuration}
                                />
                              </div>
                              {!autoDuration && (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="number"
                                    min="1"
                                    max="22"
                                    value={duration}
                                    onChange={handleDurationChange}
                                    className="w-16 p-1 border rounded"
                                  />
                                  <span>seconds</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Prompt Influence</h3>
                              <p className="text-sm text-gray-600 mb-2">Slide the scale to make your generation perfectly adhere to your prompt or allow for a little creativity</p>
                              <Slider
                                min={0}
                                max={100}
                                step={1}
                                value={[promptInfluence]}
                                onValueChange={(value) => setPromptInfluence(value[0])}
                                className="w-full"
                              />
                              <div className="flex justify-between text-sm text-gray-600 mt-1">
                                <span>More Creative</span>
                                <span>Follow Prompt</span>
                              </div>
                            </div>
                          </div>
                          <div className="absolute bottom-6 left-6 right-6 space-y-2">
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => {
                                setDuration(6);
                                setPromptInfluence(50);
                                setAutoDuration(true);
                              }}
                            >
                              Reset
                            </Button>
                            <Button
                              className="w-full"
                              onClick={() => {
                                handleGenerate();
                                setIsSettingsOpen(false);
                              }}
                            >
                              Generate Sound
                            </Button>
                          </div>
                        </SheetContent>
                      </Sheet>
                      <Button
                        onClick={handleGenerate}
                        disabled={!inputText.trim() || isGenerating}
                      >
                        {isGenerating ? (
                          <span>Generating...</span>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Generate Sound
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {isGenerating && (
                    <div className="bg-white rounded-lg p-6 shadow-md mt-8 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                      <p>Bringing your imagination to life ...</p>
                    </div>
                  )}

                  {!isGenerating && generatedSounds.length > 0 && (
                    <div className="bg-white rounded-lg p-6 shadow-md mt-8">
                      {generatedSounds.map((sound, index) => (
                        <div key={sound.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                          <div className="flex items-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleSound(sound, index)}
                            >
                              {activeSound && activeSound.id === sound.id && isPlaying ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </Button>
                            <span className="ml-2">Generation {index + 1}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(sound.url, `generated_sound_${index + 1}.mp3`, sound.id.toString())}
                            disabled={downloadingId === sound.id.toString()}
                          >
                            {downloadingId === sound.id.toString() ? (
                              <span className="animate-spin">↻</span>
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {!hasStartedGenerating && generatedSounds.length === 0 && (
                    <div className="bg-gray-100 bg-opacity-50 rounded-lg p-6 shadow-md mt-8">
                      <p className="text-gray-700 mb-4 text-center">Or try out an example to get started!</p>
                      <div className="hidden md:flex md:flex-wrap md:justify-center md:gap-2">
                        {modelExamples[activeModel].map((example, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => setInputText(example)}
                          >
                            {example}
                          </Button>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 md:hidden">
                        {modelExamples[activeModel].map((example, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => setInputText(example)}
                            className="text-left"
                          >
                            {example}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === "History" && (
                <div className="space-y-4 mt-8">
                  {historyItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg p-6 shadow-md">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">{item.text}</h3>
                        <span className="text-sm text-gray-500">{item.date}</span>
                      </div>
                      {item.generations.map((sound, soundIndex) => (
                        <div key={sound.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                          <div className="flex items-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleSound(sound, soundIndex)}
                            >
                              {activeSound && activeSound.id === sound.id && isPlaying ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </Button>
                            <span className="ml-2">Generation {soundIndex + 1}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(sound.url, `historical_sound_${soundIndex + 1}.mp3`, sound.id.toString())}
                              disabled={downloadingId === sound.id.toString()}
                            >
                              {downloadingId === sound.id.toString() ? (
                                <span className="animate-spin">↻</span>
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {/* Implement share functionality */}}
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {activeSound && (
        <div
          className={`fixed bottom-0 right-0 z-40 transition-all duration-300
          ${isMobileView ? "left-0" : isSidebarPinned ? "left-64" : "left-20"}`}
        >
          {isPlayBarVisible ? (
            <PlayBar
              audioUrl={activeSound.url}
              onDownload={() =>
                handleDownload(
                  activeSound.url,
                  `sound_${
                    generatedSounds.findIndex((s) => s.id === activeSound.id) + 1
                  }.mp3`,
                  activeSound.id.toString()
                )
              }
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onClose={handleClosePlayBar}
            />
          ) : (
            <div className="fixed bottom-4 right-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handleOpenPlayBar}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoopgenInterface;
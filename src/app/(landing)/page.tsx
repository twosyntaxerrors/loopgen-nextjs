"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { WavyBackground } from "@/components/ui/wavy-background";
import { FlipWords } from "@/components/ui/flip-words";
import { cn } from "@/lib/utils";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { ChevronDown } from "lucide-react";
import { FeaturesSectionDemo } from "@/components/ui/FeaturesSectionDemo";
import { Card, CardContent } from "@/components/ui/card";

const NavigationMenu = React.memo(React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn(
      "relative z-10 flex max-w-max flex-1 items-center justify-center",
      className
    )}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
)));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const NavigationMenuList = React.memo(React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn(
      "group flex flex-1 list-none items-center justify-center space-x-1",
      className
    )}
    {...props}
  />
)));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const navigationMenuTriggerStyle = cn(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
);

const NavigationMenuTrigger = React.memo(React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle, "group", className)}
    {...props}
  >
    {children}{" "}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
)));
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuContent = React.memo(React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto ",
      className
    )}
    {...props}
  />
)));
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink = NavigationMenuPrimitive.Link;

const NavigationMenuViewport = React.memo(React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn("absolute left-0 top-full flex justify-center")}>
    <NavigationMenuPrimitive.Viewport
      className={cn(
        "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
        className
      )}
      ref={ref}
      {...props}
    />
  </div>
)));
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

const NavigationMenuIndicator = React.memo(React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
      className
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </NavigationMenuPrimitive.Indicator>
)));
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;

const CTACard = React.memo(() => {
  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl transition-all duration-700 ease-out opacity-100 translate-y-0">
      <Card>
        <CardContent className="flex flex-col items-center p-8 space-y-6">
          <div className="bg-gray-100 p-4 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-black"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
              <line x1="9" y1="9" x2="9" y2="21" />
              <line x1="15" y1="9" x2="15" y2="21" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center text-black">
            Cook Up With the Highest Quality Audio
          </h2>
          <Button variant="default" className="w-full bg-black text-white hover:bg-gray-800">
            GET STARTED FREE
          </Button>
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a href="#" className="text-black underline">
              Log in
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
});

const LandingPage: React.FC = () => {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [textAreaContent, setTextAreaContent] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleFaq = useCallback((id: string) => {
    setOpenFaq(prevOpenFaq => prevOpenFaq === id ? null : id);
  }, []);

  const handleSignUpRedirect = useCallback(() => {
    router.push('/sign-up');
  }, [router]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const headerClassName = useMemo(() => {
    return `fixed top-0 left-0 right-0 z-50 py-3 px-6 flex justify-between items-center shadow-sm transition-all duration-300 ${
      isScrolled ? "bg-white shadow-lg py-2" : "bg-white"
    }`;
  }, [isScrolled]);

  const exampleSounds = useMemo(() => [
    { text: "Melody Loop", color: "#1e3a8a" },
    { text: "Drum Loop", color: "#3b82f6" },
    { text: "Rain SFX", color: "#60a5fa" },
    { text: "Reese Bass", color: "#93c5fd" },
  ], []);

  const faqItems = useMemo(() => [
    {
      id: "faq-1",
      question: "How does the Text to Drum Loops model work?",
    },
    {
      id: "faq-2",
      question: "Whats the best way to use this tool for making beats?",
    },
    {
      id: "faq-3",
      question: "Can I use these sounds and loops in commercial projects?",
    },
  ], []);

  return (
    <div className="min-h-screen bg-white">
      <header className={headerClassName}>
        <div className="flex items-center">
          <span className="text-xl font-bold">LOOPGEN</span>
        </div>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>AI Audio</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr] bg-white">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href="/"
                      >
                        <div className="mb-2 mt-4 text-lg font-medium">
                          AI-Powered Audio Generation
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Create custom audio samples and loops using advanced AI technology.
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="/one-shots" title="One-Shots">
                    Generate unique sound effects and samples.
                  </ListItem>
                  <ListItem href="/drum-loops" title="Drum Loops">
                    Create rhythm patterns and drum loops.
                  </ListItem>
                  <ListItem href="/melodies" title="Melodies">
                    Compose original melodies and harmonies.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-white">
                  {[
                    "Music Production",
                    "Sound Design",
                    "Film & TV",
                    "Game Audio",
                  ].map((item) => (
                    <ListItem
                      key={item}
                      title={item}
                      href={`/solutions/${item.toLowerCase().replace(" ", "-")}`}
                    >
                      {`AI-powered ${item.toLowerCase()} solutions.`}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/pricing" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle}>
                  Pricing
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/about" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle}>
                  About Us
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center">
          <Button
            variant="default"
            className="rounded-full text-sm px-4 py-1"
            onClick={handleSignUpRedirect}
          >
            {isScrolled ? "GENERATE SOUNDS" : "TRY FOR FREE"}
          </Button>
        </div>
      </header>

      <main className="pt-0 flex-grow">
        <WavyBackground containerClassName="min-h-screen flex flex-col">
          <section className="relative text-center py-32 px-4 bg-transparent">
            <div className="relative z-10">
              <h1 className="text-6xl font-bold text-black mt-40 mb-6">
                The Fastest Way to Create
                <FlipWords words={["One-Shots", "Drums", "Loops", "Melodies", "Samples"]} />
              </h1>
              <p className="text-2xl text-gray-500 mb-10 px-10">
                Generate one shots, drum loops, melodic samples and any other sounds you
                can imagine, in just a matter of seconds.
              </p>
              <div className="flex justify-center space-x-4 mb-60">
                <Button
                  size="lg"
                  variant="default"
                  className="rounded-full px-8 py-3 text-lg hover:shadow-lg transition-shadow"
                  onClick={handleSignUpRedirect}
                >
                  GENERATE SOUNDS FREE
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 py-3 text-lg text-black border-black hover:bg-gray-100 transition-colors"
                  onClick={handleSignUpRedirect}
                >
                  TRY A SAMPLE
                </Button>
              </div>
              <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                  <textarea
                    className="w-full resize-none bg-transparent p-4 outline-none text-gray-600 text-lg"
                    placeholder="Type anything and turn text into realistic sound effect"
                    value={textAreaContent}
                    onChange={(e) => setTextAreaContent(e.target.value)}
                    rows={3}
                  />
                  <div className="flex flex-wrap justify-start gap-2 p-4">
                    {[
                      { text: "Melody Loop", color: "#1e3a8a" },
                      { text: "Drum Loop", color: "#3b82f6" },
                      { text: "Rain SFX", color: "#60a5fa" },
                      { text: "Reese Bass", color: "#93c5fd" },
                    ].map((example, index) => (
                      <button
                        key={index}
                        className="w-20 h-20 overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center text-white text-xs font-semibold"
                        style={{ backgroundColor: example.color }}
                        onClick={() => setTextAreaContent(example.text)}
                      >
                        {example.text}
                      </button>
                    ))}
                  </div>
                  <div className="relative mx-4 h-[2px] overflow-hidden rounded-full bg-gray-200 mb-4">
                    <div className="absolute top-0 left-0 h-full w-0 bg-blue-500 transition-all duration-300"></div>
                  </div>
                  <div className="flex items-center justify-between px-4 pb-4">
                    <span className="text-sm text-gray-500">{textAreaContent.length}/100</span>
                    <Button
                      className="rounded-full px-6 py-2 text-sm bg-gray-900 text-white hover:bg-gray-800"
                      disabled={textAreaContent.length === 0}
                    >
                      GENERATE
                    </Button>
                  </div>
                </div>
              </div>

              {/* New section: Experience The Full Audio Platform */}
              <div className="mt-8 flex flex-col sm:flex-row justify-center items-center">
                <span className="text-sm font-semibold mb-4 sm:mb-4 sm:mr-4">
                  EXPERIENCE THE FULL AUDIO AI PLATFORM
                </span>
                <Button
                  size="sm"
                  variant="default"
                  className="rounded-full px-8 py-3 text-sm bg-black text-white hover:bg-gray-800 transition-colors"
                  onClick={handleSignUpRedirect} // Redirect to sign-up page
                >
                  GO TO APP
                </Button>
              </div>
            </div>
          </section>
        </WavyBackground>

        {/* Feature Overview Section */}
        <section className="py-20 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
          <div className="mb-20 mt-20 text-center">
            <h2 className="text-4xl font-bold">The Only Sounds You'll Ever Need</h2>
            <p className="text-gray-600 mt-2">Create unique sounds quickly from text generation</p>
          </div>
          <FeaturesSectionDemo />
        </section>

        {/* Resources Section */}
        <section className="py-20 px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Get started with our guides and resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { title: "Guides", icon: "book-open" },
              { title: "Help Center", icon: "help-circle" },
              { title: "YouTube", icon: "youtube" },
            ].map((resource, index) => (
              <Card key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`lucide lucide-${resource.icon}`}
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M7 7h10" />
                      <path d="M7 12h10" />
                      <path d="M7 17h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
                  <p className="text-sm text-gray-600">
                    Short description about the resource goes here.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Trending and Popular Sound Effects */}
        <section className="py-20 px-4 bg-white">
          <h2 className="text-4xl font-bold text-center mb-12">
            Sounds made with Loopgen
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {[
              "ALIEN 808",
              "ATT SNARE",
              "ALIEN 909",
              "ALIEN 606",
              "ALIEN 808",
              "GOD SNARE",
              "ALIEN 808",
              "ALIEN 808",
              "ALIEN 808",
              "JAZZ BELL",
              "ALIEN 808",
              "DARK 808",
              "UFO KICK",
              "ALIEN 908",
              "ALIEN 708",
              "ALIEN 608",
              "ALIEN 508",
              "ALIEN 408",
              "ARCADE MACHINE",
              "ALIEN 808",
              "ALIEN 608",
              "ALIEN 508",
              "ALIEN 408",
              "ALIEN 808",
              "ALIEN 808",
              "ALIEN 608",
              "ALIEN 508",
              "ALIEN 408",
              "ALIEN 808",
              "CINEMATIC RISER",
            ].map((sound, index) => (
              <button
                key={index}
                className="bg-white border border-gray-200 rounded-full p-4 flex items-center justify-center hover:shadow-md transition-shadow"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-play mr-2"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span className="text-sm">{sound}</span>
              </button>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 bg-gray-100">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-2xl mx-auto">
            {[
              {
                id: "faq-1",
                question: "How does the Text to Drum Loops model work?",
              },
              {
                id: "faq-2",
                question: "Whats the best way to use this tool for making beats?",
              },
              {
                id: "faq-3",
                question: "Can I use these sounds and loops in commercial projects?",
              },
            ].map((item) => (
              <div key={item.id} className="mb-4 border-b border-gray-200">
                <button
                  className="flex justify-between items-center w-full text-left font-semibold py-4"
                  onClick={() => toggleFaq(item.id)}
                >
                  {item.question}
                  <span>{openFaq === item.id ? "-" : "+"}</span>
                </button>
                {openFaq === item.id && <div className="pb-4">Answer to the question goes here...</div>}
              </div>
            ))}
          </div>
        </section>

        {/* Secondary CTA Section with Animated Card */}
        <WavyBackground containerClassName="py-10 relative">
          <div className="relative z-10 px-4 text-center">
            <CTACard />
          </div>
        </WavyBackground>
      </main>

      <footer className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8 mb-12">
          {[
            {
              title: "RESEARCH",
              items: [
                "Text to Speech",
                "Speech to Speech",
                "Text to Sound Effects",
                "Voice Cloning",
                "Voice Isolator",
              ],
            },
            {
              title: "PRODUCTS",
              items: [
                "Projects",
                "Dubbing Studio",
                "Audio Native",
                "ElevenStudios",
                "API",
                "Voiceover Studio",
              ],
            },
            {
              title: "SOLUTIONS",
              items: [
                "For Enterprise",
                "For Teams",
                "For Creators",
                "For Developers",
                "For Startups",
                "Publishing",
                "Media and Entertainment",
                "Conversational AI",
              ],
            },
            {
              title: "EARN AS",
              items: ["Affiliate", "Voice Actor", "Data Partner"],
            },
            {
              title: "RESOURCES",
              items: ["Guides", "Help Centre", "Languages"],
            },
            {
              title: "COMPANY",
              items: ["About", "Safety", "Careers", "Blog"],
            },
          ].map((category, index) => (
            <div key={index}>
              <h3 className="font-semibold text-sm mb-4">{category.title}</h3>
              <ul className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center border-t border-gray-200 pt-8">
          <div className="flex items-center justify-between w-full">
            <div>
              <span className="text-xl font-bold">LOOPGEN</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-8">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <span className="text-sm text-gray-600">© 2024 LOOPGEN</span>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Privacy
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Terms
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Safety
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default LandingPage;

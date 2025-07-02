import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, X, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Type definitions for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

interface VoiceInputProps {
  onVoiceResult: (voiceData: VoiceResult) => void;
  onCancel: () => void;
}

interface VoiceResult {
  transcript: string;
  confidence: number;
  suggestedName?: string;
  suggestedCategory?: string;
  suggestedDescription?: string;
}

export function VoiceInput({ onVoiceResult, onCancel }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [voiceResult, setVoiceResult] = useState<VoiceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError("Speech recognition is not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
      }
      setInterimTranscript(interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
      
      if (transcript.trim()) {
        processVoiceInput(transcript.trim());
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [transcript]);

  const startListening = () => {
    if (!recognitionRef.current || !isSupported) return;
    
    setTranscript("");
    setInterimTranscript("");
    setVoiceResult(null);
    setError(null);
    
    try {
      recognitionRef.current.start();
    } catch (err) {
      setError("Could not start voice recognition");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const processVoiceInput = (text: string) => {
    const result = parseVoiceInput(text);
    setVoiceResult(result);
    
    toast({
      title: "Voice Input Processed",
      description: `Detected: ${result.suggestedName || "item"}`,
    });
  };

  const parseVoiceInput = (text: string): VoiceResult => {
    const lowerText = text.toLowerCase();
    
    // Extract item name (usually the main subject)
    let suggestedName = extractItemName(lowerText);
    let suggestedCategory = categorizeFromText(lowerText);
    let suggestedDescription = generateDescription(text, suggestedName);
    
    return {
      transcript: text,
      confidence: 0.85, // Placeholder confidence
      suggestedName,
      suggestedCategory,
      suggestedDescription
    };
  };

  const extractItemName = (text: string): string => {
    // Common patterns for voice input
    const patterns = [
      /(?:add|create|new|i have a?)\s+([^.!?]+?)(?:\s+(?:to|in|for)\s+|$)/i,
      /(?:this is a?)\s+([^.!?]+?)(?:\s+(?:that|which|in)\s+|$)/i,
      /^([^.!?]+?)(?:\s+(?:worth|costs?|priced at)\s+|$)/i,
      /^(.+?)(?:\s+(?:in the|from|for)\s+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return cleanItemName(match[1].trim());
      }
    }
    
    // Fallback: use first few words
    const words = text.split(' ').slice(0, 3).join(' ');
    return cleanItemName(words);
  };

  const cleanItemName = (name: string): string => {
    // Remove articles and common filler words
    return name
      .replace(/^(a|an|the|my|this|that)\s+/i, '')
      .replace(/\s+(item|thing|object)$/i, '')
      .trim();
  };

  const categorizeFromText = (text: string): string => {
    const categories = {
      "Electronics": ["phone", "laptop", "computer", "tablet", "camera", "headphones", "speaker", "charger", "electronic"],
      "Kitchen & Dining": ["cup", "mug", "plate", "bowl", "fork", "knife", "spoon", "pot", "pan", "kitchen", "dining"],
      "Furniture": ["chair", "table", "desk", "bed", "sofa", "couch", "shelf", "furniture"],
      "Clothing": ["shirt", "pants", "dress", "jacket", "shoes", "socks", "hat", "clothing", "clothes"],
      "Books & Media": ["book", "magazine", "cd", "dvd", "vinyl", "record", "media"],
      "Tools & Hardware": ["hammer", "screwdriver", "wrench", "drill", "tool", "hardware"],
      "Personal Care": ["toothbrush", "shampoo", "soap", "lotion", "perfume", "makeup", "cosmetic"],
      "Sports & Recreation": ["ball", "racket", "bike", "bicycle", "sports", "exercise", "game"],
      "Home & Garden": ["plant", "flower", "vase", "candle", "decoration", "garden", "home decor"],
      "Food & Beverages": ["food", "snack", "drink", "beverage", "coffee", "tea", "juice"]
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }
    
    return "General";
  };

  const generateDescription = (originalText: string, itemName: string): string => {
    // Extract additional details that aren't part of the name
    const lowerText = originalText.toLowerCase();
    const lowerName = itemName.toLowerCase();
    
    // Look for price mentions
    const priceMatch = lowerText.match(/(?:worth|costs?|priced at|value)\s*\$?(\d+(?:\.\d{2})?)/);
    const price = priceMatch ? `Worth $${priceMatch[1]}` : "";
    
    // Look for location mentions
    const locationMatch = lowerText.match(/(?:in the|from the|located in)\s+([^.!?]+)/);
    const location = locationMatch ? `Located in ${locationMatch[1].trim()}` : "";
    
    // Look for condition mentions
    const conditionWords = ["new", "used", "old", "broken", "mint", "excellent", "good", "fair", "poor"];
    const condition = conditionWords.find(word => lowerText.includes(word));
    const conditionText = condition ? `Condition: ${condition}` : "";
    
    // Combine details
    const details = [price, location, conditionText].filter(Boolean);
    
    if (details.length > 0) {
      return details.join(". ");
    }
    
    return `Added via voice input: "${originalText}"`;
  };

  const handleUseResult = () => {
    if (voiceResult) {
      onVoiceResult(voiceResult);
    }
  };

  const handleRetry = () => {
    setTranscript("");
    setVoiceResult(null);
    setError(null);
    startListening();
  };

  if (!isSupported) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <h3 className="font-semibold mb-2">Voice Input Not Supported</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your browser doesn't support speech recognition. Try using Chrome or Edge.
          </p>
          <Button onClick={onCancel} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              isListening ? 'bg-red-100 dark:bg-red-900' : 'bg-muted'
            }`}>
              {isListening ? (
                <Mic className="h-8 w-8 text-red-600 animate-pulse" />
              ) : (
                <MicOff className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            
            {isListening && (
              <div className="flex items-center justify-center gap-1 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              {isListening ? "Listening... speak clearly" : "Ready to listen"}
            </p>
            {!isListening && !transcript && !voiceResult && (
              <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
                Try saying: "Add a red coffee mug worth $15" or "I have a Samsung laptop in the office"
              </p>
            )}
          </div>

          {(transcript || interimTranscript) && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <span className="text-foreground">{transcript}</span>
                <span className="text-muted-foreground italic">{interimTranscript}</span>
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {voiceResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Voice Processing Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium">{voiceResult.suggestedName}</h4>
              {voiceResult.suggestedDescription && (
                <p className="text-sm text-muted-foreground mt-1">
                  {voiceResult.suggestedDescription}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{voiceResult.suggestedCategory}</Badge>
              <Badge variant="outline">
                {Math.round(voiceResult.confidence * 100)}% confidence
              </Badge>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Original transcript:</p>
              <p className="text-sm">"{voiceResult.transcript}"</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        {!voiceResult ? (
          <>
            {!isListening ? (
              <Button onClick={startListening} className="flex-1">
                <Mic className="h-4 w-4 mr-2" />
                Start Listening
              </Button>
            ) : (
              <Button onClick={stopListening} variant="destructive" className="flex-1">
                <MicOff className="h-4 w-4 mr-2" />
                Stop Listening
              </Button>
            )}
          </>
        ) : (
          <>
            <Button onClick={handleUseResult} className="flex-1">
              <CheckCircle className="h-4 w-4 mr-2" />
              Use This Input
            </Button>
            <Button onClick={handleRetry} variant="outline">
              <Mic className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </>
        )}
        
        <Button onClick={onCancel} variant="outline">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Square, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VoiceTranscriptionProps {
  meetingId: string;
  sessionId: string;
  onTranscriptionComplete: (text: string, speaker?: string) => void;
}

export const VoiceTranscription = ({ meetingId, sessionId, onTranscriptionComplete }: VoiceTranscriptionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [speaker, setSpeaker] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        await processRecording();
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error("Failed to start recording. Please check microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processRecording = async () => {
    setIsProcessing(true);
    
    try {
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      
      // Convert blob to base64
      const reader = new FileReader();
      const base64Audio = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      // Call transcription edge function
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: base64Audio }
      });

      if (error) throw error;

      const transcribedText = data.text;
      const speakerName = speaker.trim() || "Unknown Speaker";
      const timestampedText = `[${new Date().toLocaleTimeString()}] ${speakerName}: ${transcribedText}`;
      
      setTranscription(prev => prev ? `${prev}\n\n${timestampedText}` : timestampedText);
      onTranscriptionComplete(transcribedText, speakerName);
      
      // Save to database - get current queue and append
      const { data: currentSession } = await supabase
        .from('meeting_sessions')
        .select('speakers_queue')
        .eq('id', sessionId)
        .single();
      
      const currentQueue = (currentSession?.speakers_queue as string[]) || [];
      await supabase
        .from('meeting_sessions')
        .update({
          speakers_queue: [...currentQueue, timestampedText]
        })
        .eq('id', sessionId);
      
      toast.success("Transcription complete");
    } catch (error) {
      console.error('Error processing recording:', error);
      toast.error("Failed to transcribe audio");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Voice Transcription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Speaker Name (optional)</label>
          <input
            type="text"
            value={speaker}
            onChange={(e) => setSpeaker(e.target.value)}
            placeholder="Enter your name..."
            className="w-full px-3 py-2 border rounded-md"
            disabled={isRecording || isProcessing}
          />
        </div>
        
        <div className="flex gap-2">
          {!isRecording ? (
            <Button 
              onClick={startRecording}
              disabled={isProcessing}
              className="flex-1"
            >
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          ) : (
            <Button 
              onClick={stopRecording}
              variant="destructive"
              className="flex-1"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Recording
            </Button>
          )}
        </div>

        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing transcription...
          </div>
        )}

        {transcription && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Transcription:</p>
            <p className="text-sm whitespace-pre-wrap">{transcription}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

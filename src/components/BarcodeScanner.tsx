import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { Camera, X, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner = ({ onScan, onClose }: BarcodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>("");
  const [isScanning, setIsScanning] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [maxZoom, setMaxZoom] = useState(3);
  const [supportsZoom, setSupportsZoom] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  // Handle zoom control
  const handleZoom = async (direction: 'in' | 'out') => {
    if (!streamRef.current || !supportsZoom) return;

    const track = streamRef.current.getVideoTracks()[0];
    const capabilities = track.getCapabilities() as any;
    
    if (capabilities.zoom) {
      const currentZoom = (track.getSettings() as any).zoom || 1;
      const step = 0.5;
      let newZoom = direction === 'in' ? currentZoom + step : currentZoom - step;
      
      // Clamp zoom level
      newZoom = Math.max(capabilities.zoom.min || 1, Math.min(newZoom, capabilities.zoom.max || 3));
      
      try {
        await track.applyConstraints({
          advanced: [{ zoom: newZoom } as any]
        });
        setZoomLevel(newZoom);
      } catch (err) {
        console.error('Zoom error:', err);
      }
    }
  };

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    
    const startScanning = async () => {
      try {
        // Request optimized camera constraints for barcode scanning
        const constraints = {
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 }
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Check zoom capabilities but don't apply zoom initially
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities() as any;
        if (capabilities.zoom) {
          setSupportsZoom(true);
          setMaxZoom(capabilities.zoom.max || 3);
          setZoomLevel(capabilities.zoom.min || 1);
        } else {
          setSupportsZoom(false);
        }

        const videoInputDevices = await codeReader.listVideoInputDevices();
        
        if (videoInputDevices.length === 0) {
          setError("ไม่พบกล้อง");
          return;
        }

        // Find back camera (environment facing)
        const backCamera = videoInputDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('environment')
        ) || videoInputDevices[videoInputDevices.length - 1];

        const selectedDeviceId = backCamera.deviceId;

        // Optimized scanning settings for better performance
        codeReader.timeBetweenDecodingAttempts = 100; // Balanced scanning (100ms)
        
        await codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current!,
          (result, err) => {
            if (result && isScanning) {
              // Play scan sound
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGe58OagSwgOUKzn7bllHAbzd8z0+5RGCE6r5O+5YxUHcazl68hmGQU7j9Hy0XosBS6AzPDdjTwJEWS56umjSwoOTqrl8bZkGgczhsvy03YrBS1+yvDdkDwIE2O48OijSQkOUKrk8LhjHAY1iM7y0HcrBS1+yvDekTsID2O56+qhSwgNUKvm8bhlHQY1iMzy0XYqBS1+yvDekToID2S56+mhSwgMUKvm8bhlHQY1iM3y0HYrBS1/y/DdkDoID2O56+qiSwkNUKrm8bhlHQY1iM3y0HYrBS1/y/DdkDoID2O56+qiSwgMUKvm8bhlHAYzh8vy0nksBS6Ay/DdjjsIEWS56+mjSwkOTqrl8bZkGgczhsvy0nksBS6Ay/DdjjsIEWS56+mjSwkOTqrl8bVkGgczhsvy0nksBS6Ay/DdjjwJEWS56+mjSwkOTqrl8bVkGgczhsvy0nksBS6Ay/DdjjwJEGS56+mjSwkOTqrl8bVkGgczhsvy0nksBS6Ay/DdjjwJEGS56+mjSwkOTqrl8bVkGgczhsvy0nksBS6Ay/DdjjwJEGS56+mjSwkOTqrl8bVkGgczhsvy0nksBS6Ay/DdjjwJEGS56+mjSwkOTqrl8bVkGgczhsvy0nksBS6Ay/DdjjwJEGS56+mjSwkOTqrl8bVkGgczhsvy0nksBS6Ay/DdjjwJEGS56+mjSwkOTqrl8bVkGgczhsvy0nksBS6Ay/DdjjwJEGS56+mjSwkOTqrl8bVkGgczhsvy0nksBS6Ay/DdjjwJEGS56+mjSwkOTqrl8bVkGgczhsvy0nksBS6Ay/DdjjwJEGS56+mjSwkOTqrl8bVkGg==');
              audio.play().catch(() => {});
              onScan(result.getText());
              setIsScanning(false);
            }
            if (err && err.name !== 'NotFoundException') {
              console.error(err);
            }
          }
        );

      } catch (err) {
        console.error(err);
        setError("ไม่สามารถเข้าถึงกล้องได้");
      }
    };

    startScanning();

    return () => {
      codeReader.reset();
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onScan, isScanning]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col animate-fade-in">
      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-white">
          <Camera className="h-5 w-5" />
          <span className="font-semibold">สแกนบาร์โค้ด</span>
        </div>
        <div className="flex items-center gap-2">
          {supportsZoom && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleZoom('out')}
                className="text-white hover:bg-white/20 transition-all"
                disabled={zoomLevel <= 1}
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
              <span className="text-white text-sm font-medium min-w-[3rem] text-center">
                {zoomLevel.toFixed(1)}x
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleZoom('in')}
                className="text-white hover:bg-white/20 transition-all"
                disabled={zoomLevel >= maxZoom}
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 transition-all"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        {error ? (
          <div className="text-destructive text-center p-4">
            <p className="text-lg font-semibold">{error}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-64 h-48">
                <div className="absolute inset-0 border-4 border-primary rounded-2xl shadow-lg shadow-primary/50 animate-pulse" />
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-secondary rounded-tl-2xl" />
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-secondary rounded-tr-2xl" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-secondary rounded-bl-2xl" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-secondary rounded-br-2xl" />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-6 bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-sm">
        <p className="text-white text-center text-sm animate-pulse">
          {supportsZoom 
            ? "วางบาร์โค้ดให้อยู่ในกรอบ ใช้ปุ่มซูมสำหรับบาร์โค้ดขนาดเล็ก"
            : "วางบาร์โค้ดให้อยู่ในกรอบเพื่อสแกน"
          }
        </p>
      </div>
    </div>
  );
};

export default BarcodeScanner;
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner = ({ onScan, onClose }: BarcodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>("");
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    
    const startScanning = async () => {
      try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        
        if (videoInputDevices.length === 0) {
          setError("ไม่พบกล้อง");
          return;
        }

        // Find back camera (environment facing)
        const backCamera = videoInputDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('environment')
        ) || videoInputDevices[videoInputDevices.length - 1]; // Fallback to last camera (usually back)

        const selectedDeviceId = backCamera.deviceId;

        codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current!,
          (result, err) => {
            if (result && isScanning) {
              // Play scan sound
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGe58OagSwgOUKzn7bllHAbzd8z0+5RGCE6r5O+5YxUHcazl68hmGQU7j9Hy0XosBS6AzPDdjTwJEWS56umjSwoOTqrl8bZkGgczhsvy03YrBS1+yvDdkDwIE2O48OijSQkOUKrk8LhjHAY1iM7y0HcrBS1+yvDekTsID2O56+qhSwgNUKvm8bhlHQY1iMzy0XYqBS1+yvDekToID2S56+mhSwgMUKvm8bhlHQY1iM3y0HYrBS1/y/DdkDoID2O56+qiSwkNUKrm8bhlHQY1iM3y0HYrBS1/y/DdkDoID2O56+qiSwgMUKvm8bhlHAYzh8vy0nksBS6Ay/DdjjsIEWS56+mjSwkOTqrl8bZkGgczhsvy0nksBS6Ay/DdjjsIEWS56+mjSwkOTqrl8bVkGgczhsvy0nksBS6Ay/DdjjwJEWS56+mjSwkOTqrl8bVkGgczhsvy0nksBS6Ay/DdjjwJEGS56+mjSwkOTqrl8bVkGgczhsvy0nksBS6Ay/DdjjwJEGS56+mjSwkOTqrl8bVkGgczhsvy0nksBS6Ay/DdjjwJEGS56+mjSwkOTqrl8bVkGgczhsvy0nksBS6Ay/DdjjwJEGS56+mjSwkOTqrl8bVkGgczhsvy0nksBS6Ay/DdjjwJEGS56+mjSwkOTqrl8bVkGgczhsvy0nksBS6Ay/DdjjwJEGS56+mjSwkOTqrl8bVkGgczhsvy0nksBS6Ay/DdjjwJEGS56+mjSwkOTqrl8bVkGgczhsvy0nksBS6Ay/DdjjwJEGS56+mjSwkOTqrl8bVkGgczhsvy0nksBS6Ay/DdjjwJEGS56+mjSwkOTqrl8bVkGgczhsvy0nksBS6Ay/DdjjwJEGS56+mjSwkOTqrl8bVkGgczhsvy0nksBS6Ay/DdjjwJEGS56+mjSwkOTqrl8bVkGgczhsvy0nksBS6Ay/DdjjwJEGS56+mjSwkOTqrl8bVkGgczhsvy0nksBS6Ay/DdjjwJEGS56+mjSwkOTqrl8bVkGg==');
              audio.play().catch(() => {}); // Ignore errors if audio fails
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
    };
  }, [onScan, isScanning]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 bg-card/10 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-white">
          <Camera className="h-5 w-5" />
          <span className="font-semibold">สแกนบาร์โค้ด</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </Button>
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
              <div className="w-64 h-48 border-4 border-primary rounded-lg shadow-lg">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-4 bg-card/10 backdrop-blur-sm">
        <p className="text-white text-center text-sm">
          วางบาร์โค้ดให้อยู่ในกรอบเพื่อสแกน
        </p>
      </div>
    </div>
  );
};

export default BarcodeScanner;
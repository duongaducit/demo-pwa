import { Component, ElementRef, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { SharedDataService } from 'src/app/services/sharedata.service';

@Component({
  selector: 'app-ocr',
  templateUrl: './ocr.component.html',
  styleUrls: ['./ocr.component.scss']
})
export class OcrComponent {
  janCode: string = '';
  dateline: string = '';
  count: number = 0;
  settingData: any;
  showCamera : boolean = false;
  videoStream: MediaStream | null = null;
  @ViewChild('janCode') janCodeInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  constructor(private zone: NgZone, private cdr: ChangeDetectorRef, private sharedDataService: SharedDataService) {}

  ngOnInit() {
    this.settingData = this.sharedDataService['dataSetting'].getValue();
    console.log('Setting data', this.settingData);
  }

  ngAfterViewInit() {
    // Đăng ký hàm nhận dữ liệu từ Flutter
    this.zone.run(() => {
    (window as any).receiveData = (text: string) => {
      console.log("Updated dateline:", text);
      this.janCode = text;
      this.cdr.detectChanges();
    };
  });
  }

  // Gọi khi input focus
  async onJanFocus(): Promise<void> {
    if (this.settingData.selectedCamera == '0') {
      // Sử dụng camera scanner
      if (window && (window as any).FlutterChannel) {
        (window as any).FlutterChannel.postMessage('inputFocused');
      }
    } else {
      // Sử dụng camera device
      this.showCamera = true;
      await this.startCamera();
    }
  }

   // Gọi khi input focus
  onJanOutFocus(): void {
    // Gửi thông điệp tới Flutter WebView
    if (window && (window as any).FlutterChannel) {
      (window as any).FlutterChannel.postMessage('inputOutFocused');
    }
  }

  async startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (this.videoRef?.nativeElement) {
        this.videoRef.nativeElement.srcObject = stream;
      }
    } catch (err) {
      console.error('Không thể mở camera:', err);
    }
  }

  stopCamera(): void {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
    this.showCamera = false;
  }
  
  captureImage(): void {
    const video = this.videoRef.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/png');
  
      console.log('📸 Ảnh đã chụp:', base64Image);
  
    }
  }
}

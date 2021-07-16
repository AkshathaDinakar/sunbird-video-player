import {
  ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output,
  HostListener, ElementRef, ViewChild, AfterViewInit, Renderer2, OnDestroy
} from '@angular/core';
import { ErrorService , errorCode , errorMessage } from '@project-sunbird/sunbird-player-sdk-v8';

import { PlayerConfig } from './playerInterfaces';
import { data1 } from './quml-library-data';
import { ViewerService } from './services/viewer.service';
import { SunbirdVideoPlayerService } from './sunbird-video-player.service';
import videojs from 'video.js';
import 'videojs-markers';
import { Subject } from 'rxjs';
import { QuestionCursorImplementationService } from './question-cursor-implementation.service';
import { data as sunbirdData} from './sunbird-data';
// declare var jQuery:any;


@Component({
  selector: 'sunbird-video-player',
  templateUrl: './sunbird-video-player.component.html',
  styleUrls: ['./sunbird-video-player.component.scss']
})
export class SunbirdVideoPlayerComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() playerConfig: PlayerConfig;
  @Output() playerEvent: EventEmitter<object>;
  @Output() telemetryEvent: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('videoPlayer', { static: true }) videoPlayerRef: ElementRef;
  viewState = 'player';
  public traceId: string;
  showControls = true;
  sideMenuConfig = {
    showShare: true,
    showDownload: true,
    showReplay: true,
    showExit: true
  };
  private unlistenMouseEnter: () => void;
  private unlistenMouseLeave: () => void;

   QumlPlayerConfig = data1;
   isQUMLPlayerShown: boolean = false
   showProceed = false;
  videoDisplay = 'block';
  player_video : any;
  eventsSubject: Subject<any> = new Subject<any>();
    displayPauseAndPlay = {};
    markers = sunbirdData.map((marker) => {
      return {time : marker.time , text : marker.question.name}
    })
  constructor(
    public videoPlayerService: SunbirdVideoPlayerService,
    public viewerService: ViewerService,
    public cdr: ChangeDetectorRef,
    private renderer2: Renderer2,
    public errorService: ErrorService,
    private questionCursor: QuestionCursorImplementationService
  ) {
    this.playerEvent = this.viewerService.playerEvent;
    this.viewerService.playerEvent.subscribe(event => {
      if (event.type === 'loadstart') {
        this.viewerService.raiseStartEvent(event);
      }
      if (event.type === 'ended') {
        this.viewerService.endPageSeen = true;
        this.viewerService.raiseEndEvent();
        this.viewState = 'end';
      }
      if (event.type === 'error') {
        this.viewerService.raiseErrorEvent(event);
        this.viewerService.raiseExceptionLog(errorCode.contentLoadFails, errorMessage.contentLoadFails, event, this.traceId);
      }
      const events = [{ type: 'volumechange', telemetryEvent: 'VOLUME_CHANGE' }, { type: 'seeking', telemetryEvent: 'DRAG' },
      { type: 'ratechange', telemetryEvent: 'RATE_CHANGE' }];
      events.forEach(data => {
        if (event.type === data.type) {
          this.viewerService.raiseHeartBeatEvent(data.telemetryEvent);
        }
      });
    });

    
  }

  @HostListener('document:TelemetryEvent', ['$event'])
  onTelemetryEvent(event) {
    this.telemetryEvent.emit(event.detail);
  }

  ngOnInit() {
    /* tslint:disable:no-string-literal */
    this.traceId = this.playerConfig.config['traceId'];
    // Log event when internet is not available
    this.errorService.getInternetConnectivityError.subscribe(event => {
      this.viewerService.raiseExceptionLog(errorCode.internetConnectivity, errorMessage.internetConnectivity, event['error'], this.traceId);
    });

    const contentCompabilityLevel = this.playerConfig.metadata['compatibilityLevel'];
    if (contentCompabilityLevel) {
      const checkContentCompatible = this.errorService.checkContentCompatibility(contentCompabilityLevel);
      if (!checkContentCompatible['isCompitable']) {
        this.viewerService.raiseErrorEvent(checkContentCompatible['error'], 'compatibility-error');
        this.viewerService.raiseExceptionLog(errorCode.contentCompatibility,
          errorMessage.contentCompatibility, checkContentCompatible['error'], this.traceId);
      }
    }
    this.sideMenuConfig = { ...this.sideMenuConfig, ...this.playerConfig.config.sideMenu };
    this.videoPlayerService.initialize(this.playerConfig);
    this.viewerService.initialize(this.playerConfig);
  }

  sidebarMenuEvent(event) {
    this.viewerService.sidebarMenuEvent.emit(event);
  }

  ngAfterViewInit() {
    const videoPlayerElement = this.videoPlayerRef.nativeElement;
    this.unlistenMouseEnter = this.renderer2.listen(videoPlayerElement, 'mouseenter', () => {
      this.showControls = true;
    });

    this.unlistenMouseLeave = this.renderer2.listen(videoPlayerElement, 'mouseleave', () => {
      this.showControls = false;
    });

    this.renderer2.listen(videoPlayerElement, 'touchend', () => {
      setTimeout(() => {
        this.showControls = false;
      }, 3000);
    });
  }

  sideBarEvents(event) {
    this.playerEvent.emit(event);
    if (event === 'DOWNLOAD') {
      this.downloadVideo();
    }
    const events = ['SHARE', 'DOWNLOAD_MENU', 'EXIT', 'CLOSE_MENU'];
    events.forEach(data => {
      if (event === data) {
        this.viewerService.raiseHeartBeatEvent(data);
      }
      if (event === 'EXIT') {
        this.viewerService.sidebarMenuEvent.emit('CLOSE_MENU');
      }
    });
  }

  replayContent(event) {
    this.playerEvent.emit(event);
    this.viewState = 'player';
    this.viewerService.raiseHeartBeatEvent('REPLAY');
  }

  downloadVideo() {
    const a = document.createElement('a');
    a.href = this.viewerService.artifactUrl;
    a.download = this.viewerService.contentName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
    this.viewerService.raiseHeartBeatEvent('DOWNLOAD');
  }

  getElementId(event){
console.log('event from videoplayer',event);
this.player_video = videojs(event);
    console.log('get details about video',this.player_video);
    this.player_video.markers(
     {
      markerStyle: {
        'width':'10px',
        'background-color': 'red'
    },
      markers: this.markers,

      onMarkerReached:((marker,index) =>{
        console.log('markers in constructor',this.markers);
        console.log('reached marker',marker);
        console.log('reached marker Index',index);
       
       
        this.showQUMLPlayer(marker);
        this.updateQUMLPlayerConfig(marker);

        
      }),
      
    });
  }

  showQUMLPlayer(marker) {
   // this.eventsSubject.next({ action: 'pause', data: null });
   // this.eventsSubject.next({ action: 'seekTo', data: { seconds: marker.time } });
   this.displayPauseAndPlay = {
     action : 'Pause'
   }
    console.log('eventSubject',this.displayPauseAndPlay);
    this.isQUMLPlayerShown = true;
   this.videoDisplay = 'none';
  }

  updateQUMLPlayerConfig(marker) {
  
    this.QumlPlayerConfig = this.questionCursor.getQUMLPlayerConfig(marker.time);
    console.log('this.QumlPlayerConfig',this.QumlPlayerConfig);
  }

  getPlayerEvents(event) {
    console.log('get player events', JSON.stringify(event));
    // let time = this.questionCursor.getTime(event.item.id)
    // this.showProceed = true
    // if(event.pass == 'No') {
    //   jQuery(`div[data-marker-time='${time}']`).css('background-color', 'red')
    // } else {
    //   jQuery(`div[data-marker-time='${time}']`).css('background-color', 'green')
    // }
  }

  getTelemetryEvents(event) {
    console.log('event is for telemetry', JSON.stringify(event));
  }

  proceedOrClose(){
    this.isQUMLPlayerShown = false;
    this.videoDisplay = 'block';
    this.displayPauseAndPlay = {
      action : 'Play'
    }
  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {
    this.viewerService.raiseEndEvent();
    this.unlistenMouseEnter();
    this.unlistenMouseLeave();
  }
}



import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild, ViewEncapsulation, OnDestroy, Output,EventEmitter, Input,OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import videojs from 'video.js';
import { content } from '../../player';
import { ViewerService } from '../../services/viewer.service';
import 'videojs-markers';
import { Observable } from 'rxjs';
declare var jQuery:any;

@Component({
  selector: 'video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class VideoPlayerComponent implements AfterViewInit, OnDestroy,OnChanges {
  showBackwardButton = false;
  showForwardButton = false;
  showPlayButton = true;
  showPauseButton = false;
  showControls = true;
  currentPlayerState = 'none';
  private unlistenTargetMouseEnter: () => void;
  private unlistenTargetMouseLeave: () => void;
  private unlistenControlDivMouseEnter: () => void;
  private unlistenControlDivMouseLeave: () => void;
  private unlistenControlDivTouchEnd: () => void;
  private unlistenControlDivTouchStart: () => void;
  private unlistenTargetTouchStart: () => void;
  @ViewChild('target', { static: true }) target: ElementRef;
  @ViewChild('controlDiv', { static: true }) controlDiv: ElementRef;
  player: videojs.Player;
  totalSeekedLength = 0;
  previousTime = 0;
  currentTime = 0;
  seekStart = null;
  time = 10;
  startTime;
  totalSpentTime = 0;
  
  @Output() videoElement = new EventEmitter<any>();
  @Input() events: {
    action : string
  }
  constructor(public viewerService: ViewerService, private renderer2: Renderer2) { 
    console.log('changes from input',this.events);
    }
   ngOnChanges(){
     if(this.events.action == 'Pause'){
      this.player.pause();
      jQuery('#overlay-button').hide();
      document.getElementById('overlay-button').style.display ="none";
     
     }else if(this.events.action == 'Play'){
      this.player.play();
     }else{
       
     }
//console.log('changes from input',this.events);
   }

  ngAfterViewInit() {
    this.viewerService.getPlayerOptions().then(options => {
      this.player = videojs(this.target.nativeElement, {
        fluid: true,
        sources: options,
        autoplay: true,
        playbackRates: [0.5, 1, 1.5, 2],
        controlBar: {
          children: ['durationDisplay', 'volumePanel',
            'progressControl', 'remainingTimeDisplay',
            'playbackRateMenuButton']
        }
      }, function onLoad() {

      });
this.registerEvents();

this.videoElement.emit(this.target.nativeElement);




      
    });
   

    this.unlistenTargetMouseEnter = this.renderer2.listen(this.target.nativeElement, 'mouseenter', () => {
      this.showControls = true;
    });

    this.unlistenTargetMouseLeave = this.renderer2.listen(this.target.nativeElement, 'mouseleave', () => {
      this.showControls = false;
    });

    this.unlistenControlDivMouseEnter = this.renderer2.listen(this.controlDiv.nativeElement, 'mouseenter', () => {
      this.showControls = true;
    });

    this.unlistenControlDivMouseLeave = this.renderer2.listen(this.controlDiv.nativeElement, 'mouseleave', () => {
      this.showControls = false;
    });

    this.unlistenControlDivTouchEnd = this.renderer2.listen(this.controlDiv.nativeElement, 'touchend', () => {
      setTimeout(() => {
        if (this.currentPlayerState !== 'pause') {
          this.showControls = false;
        }
      }, 3000);
    });

    this.unlistenControlDivTouchStart = this.renderer2.listen(this.controlDiv.nativeElement, 'touchstart', () => {
      this.showControls = true;
    });

    this.unlistenTargetTouchStart = this.renderer2.listen(this.target.nativeElement, 'touchstart', () => {
      this.showControls = true;
    });

    this.viewerService.sidebarMenuEvent.subscribe(event => {
      if (event === 'OPEN_MENU') { this.pause(); }
      if (event === 'CLOSE_MENU') { this.play(); }
    });

    
  }

  registerEvents() {

    const events = ['loadstart', 'play', 'pause', 'durationchange',
      'error', 'playing', 'progress', 'seeked', 'seeking', 'volumechange',
      'ratechange'];

    this.player.on('timeupdate', (data) => {
      this.handleVideoControls(data);
      this.viewerService.playerEvent.emit(data);
      if (this.player.currentTime() === this.player.duration()) {
        this.handleVideoControls({ type: 'ended' });
        this.viewerService.playerEvent.emit({ type: 'ended' });
      }
    });
    events.forEach(event => {
      this.player.on(event, (data) => {
        this.handleVideoControls(data);
        this.viewerService.playerEvent.emit(data);
      });
    });

  }

  toggleForwardRewindButton() {
    this.showForwardButton = true;
    this.showBackwardButton = true;
    if ((this.player.currentTime() + this.time) > this.player.duration()) {
      this.showForwardButton = false;
    }
    if ((this.player.currentTime() - this.time) < 0) {
      this.showBackwardButton = false;
    }
  }

  play() {
    this.player.play();
    this.currentPlayerState = 'play';
    this.showPauseButton = true;
    this.showPlayButton = false;
    this.toggleForwardRewindButton();
    this.viewerService.raiseHeartBeatEvent('PLAY');
    
  }

  pause() {
    this.player.pause();
    this.currentPlayerState = 'pause';
    this.showPauseButton = false;
    this.showPlayButton = true;
    this.viewerService.raiseHeartBeatEvent('PAUSE');
  }

  backward() {
    this.player.currentTime(this.player.currentTime() - this.time);
    this.toggleForwardRewindButton();
    this.viewerService.raiseHeartBeatEvent('BACKWARD');
  }

  forward() {
    this.player.currentTime(this.player.currentTime() + this.time);
    this.toggleForwardRewindButton();
    this.viewerService.raiseHeartBeatEvent('FORWARD');
  }

  handleVideoControls({ type }) {
    if (type === 'playing') {
      this.showPlayButton = false;
      this.showPauseButton = true;
      this.showControls = false;
    }
    if (type === 'ended') {
      this.totalSpentTime += new Date().getTime() - this.startTime;
      this.viewerService.visitedLength = this.totalSpentTime;
      this.viewerService.currentlength = this.player.currentTime();
      this.viewerService.totalLength = this.player.duration();
      this.updatePlayerEventsMetadata({ type });
    }
    if (type === 'pause') {
      this.showBackwardButton = false;
      this.showForwardButton = false;
      this.totalSpentTime += new Date().getTime() - this.startTime;
      this.updatePlayerEventsMetadata({ type });
    }
    if (type === 'play') {
      this.startTime = new Date().getTime();
      this.updatePlayerEventsMetadata({ type });
    }

    if (type === 'loadstart') {
      this.startTime = new Date().getTime();
    }

    // Calulating total seeked length
    if (type === 'timeupdate') {
      this.previousTime = this.currentTime;
      this.currentTime = this.player.currentTime();
      this.toggleForwardRewindButton();
    }
    if (type === 'seeking') {
      if (this.seekStart === null) { this.seekStart = this.previousTime; }
    }
    if (type === 'seeked') {
      this.updatePlayerEventsMetadata({ type });
      if (this.currentTime > this.seekStart) {
        this.totalSeekedLength = this.totalSeekedLength + (this.currentTime - this.seekStart);
      } else if (this.seekStart > this.currentTime) {
        this.totalSeekedLength = this.totalSeekedLength + (this.seekStart - this.currentTime);
      }
      this.viewerService.totalSeekedLength = this.totalSeekedLength;
      this.seekStart = null;
    }
  }

  updatePlayerEventsMetadata({ type }) {
    this.viewerService.metaData.totalDuration = this.player.duration();
    this.viewerService.metaData.playBackSpeeds.push(this.player.playbackRate());
    this.viewerService.metaData.volume.push(this.player.volume());
    const action = {};
    action[type + ''] = this.player.currentTime();
    this.viewerService.metaData.actions.push(action);
  }
  ngOnDestroy() {
    if (this.player) {
      this.player.dispose();
    }
    this.unlistenTargetMouseEnter();
    this.unlistenTargetMouseLeave();
    this.unlistenControlDivMouseEnter();
    this.unlistenControlDivMouseLeave();
    this.unlistenControlDivTouchEnd();
    this.unlistenControlDivTouchStart();
    this.unlistenTargetTouchStart();
  }


}

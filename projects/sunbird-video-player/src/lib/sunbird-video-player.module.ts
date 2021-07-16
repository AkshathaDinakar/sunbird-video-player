import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SunbirdPlayerSdkModule  } from '@project-sunbird/sunbird-player-sdk-v8';
import { SunbirdVideoPlayerComponent } from './sunbird-video-player.component';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { HttpClientModule } from '@angular/common/http';
import { QumlLibraryModule, QuestionCursor } from '@project-sunbird/sunbird-quml-player-v8';
import { QuestionCursorImplementationService } from './question-cursor-implementation.service';
import {CarouselModule} from 'ngx-bootstrap/carousel';
import { BrowserModule } from '@angular/platform-browser';
@NgModule({
  declarations: [SunbirdVideoPlayerComponent, VideoPlayerComponent],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    SunbirdPlayerSdkModule,
    QumlLibraryModule,
    CarouselModule.forRoot(),
    BrowserModule
  ],
  exports: [SunbirdVideoPlayerComponent],
  providers: [{
    provide: QuestionCursor,
   useClass: QuestionCursorImplementationService
  }],
})
export class SunbirdVideoPlayerModule { }

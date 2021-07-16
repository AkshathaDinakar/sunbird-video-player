import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
//import { SunbirdVideoPlayerModule} from '@project-sunbird/sunbird-video-player';

import { AppComponent } from './app.component';
import { SunbirdVideoPlayerModule } from 'projects/sunbird-video-player/src/public-api';

//import { SunbirdVideoPlayerModule } from 'sunbird-video';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SunbirdVideoPlayerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { Component } from '@angular/core';
import { PlayerConfig } from 'projects/sunbird-video-player/src/lib/playerInterfaces';
import { data1 } from './qml-library-data';
import { data as userdata} from './sunbird-data';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  playerConfig: PlayerConfig = {
    context: {
      mode: 'play',
      authToken: '',
      sid: '7283cf2e-d215-9944-b0c5-269489c6fa56',
      did: '3c0a3724311fe944dec5df559cc4e006',
      uid: 'anonymous',
      channel: '505c7c48ac6dc1edc9b08f21db5a571d',
      pdata: { id: 'prod.diksha.portal', ver: '3.2.12', pid: 'sunbird-portal.contentplayer' },
      contextRollup: { l1: '505c7c48ac6dc1edc9b08f21db5a571d' },
      tags: [
        ''
      ],
      cdata: [],
      timeDiff: 0,
      objectRollup: {},
      host: '',
      endpoint: '',
      userData: {
        firstName: 'Harish Kumar',
        lastName: 'Gangula'
      }
    },
    config: {
      traceId: 'afhjgh'
    },
    // tslint:disable-next-line:max-line-length
    metadata: { compatibilityLevel: 2, copyright: 'EKSTEP', keywords: ['upload video file', 'upload video', 'Learning / Study material'], subject: ['Other'], channel: '0123221758376673287017', language: ['English'], mimeType: 'video/mp4', objectType: 'Content', gradeLevel: ['Other'], appIcon: 'https://ntpproductionall.blob.core.windows.net/ntp-content-production/content/do_3123348589584056322405/artifact/icon-upload-video-file_video_1505720087818.png', primaryCategory: 'Explanation Content', artifactUrl: 'https://ntpproductionall.blob.core.windows.net/ntp-content-production/assets/do_3123348586389995521449/upload_a_video_file.mp4', contentType: 'Resource', identifier: 'do_3123348586389995521449', audience: ['Teacher'], visibility: 'Default', author: 'EKSTEP', mediaType: 'content', osId: 'org.ekstep.quiz.app', languageCode: ['en'], license: 'CC BY 4.0', concepts: [{ identifier: 'LO46', name: 'Comprehension Of Stories', description: 'Comprehension Of Stories', objectType: 'Concept', relation: 'associatedTo', status: 'Live' }], name: 'Upload a Video file - Video', attributions: ['DIKSHA'], status: 'Live', code: '09d39baa-2610-4b85-bee7-73c2b00a5abb', description: 'In this video, you will learn how to upload a video file.', createdOn: '2017-09-18T07:34:08.706+0000', copyrightYear: 2019, lastUpdatedOn: '2019-09-04T05:18:16.520+0000', pkgVersion: 1, versionKey: '1567574296520', framework: 'NCF', createdBy: '96d1f6be-a79e-430f-b136-23c22b818911', board: 'NCTE', resourceType: 'Learn', orgDetails: {}, licenseDetails: { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/legalcode', description: 'For details see below:' } },
    data: {}
  };

  qumlConfig = data1;
  userdara = userdata;
  


  
  playerEvent(event) {
    console.log(event);
  }

  telemetryEvent(event) {
    console.log('in app: ', JSON.stringify(event));
  }
}

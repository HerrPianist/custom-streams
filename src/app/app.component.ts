import { Component, OnInit } from '@angular/core';
import { CallClient, JoinCallOptions, LocalAudioStream } from "@azure/communication-calling";
import { Features } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from '@azure/communication-common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'angular-tour-of-heroes';

  public call: any;
  public callAgent: any;

  public teamsMeetingJoinButtonDisabled = false;
  public hangUpButtonDisabled = true;
  public callStateElement = "-";
  public recordingStateElement = "";

  public meetingLinkInput = "https://teams.microsoft.com/l/meetup-join/19%3ameeting_YTVhMGVmMWMtNTA2My00MWQzLTgzNjEtZGUxYTI5NGQ4MWVj%40thread.v2/0?context=%7b%22Tid%22%3a%2268d4e218-0cb3-4287-aa15-6ba01b4c1e58%22%2c%22Oid%22%3a%22bce46eb1-6da7-4e2b-8581-d136dcf82ed5%22%7d";
  private token = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjYwNUVCMzFEMzBBMjBEQkRBNTMxODU2MkM4QTM2RDFCMzIyMkE2MTkiLCJ4NXQiOiJZRjZ6SFRDaURiMmxNWVZpeUtOdEd6SWlwaGsiLCJ0eXAiOiJKV1QifQ.eyJza3lwZWlkIjoiYWNzOjdlYWJhNTU0LWQ1OTktNGEwZC04MTJhLTI4NWUwMTE0YWVkNV8wMDAwMDAxZi00MmNlLWQ5YzYtNmE0OS1hZDNhMGQwMGVkMmMiLCJzY3AiOjE3OTIsImNzaSI6IjE3MTIxMzA0MzgiLCJleHAiOjE3MTIyMTY4MzgsInJnbiI6ImVtZWEiLCJhY3NTY29wZSI6InZvaXAiLCJyZXNvdXJjZUlkIjoiN2VhYmE1NTQtZDU5OS00YTBkLTgxMmEtMjg1ZTAxMTRhZWQ1IiwicmVzb3VyY2VMb2NhdGlvbiI6ImV1cm9wZSIsImlhdCI6MTcxMjEzMDQzOH0.F2rX95h-YKojTRPIW9IfNyBKgxEyramQw-lr1QqWKBD5zRHk5n-cd6LNN4aWzXOaK6cyTNbCIkQofkrdNME7PWgVBljY4lpN_C2YwVMUjWCqf-t5s4RphlhuXwmrmv4aSOUHvRKvQ1S-w8v4maeWwBkB-zDZx-vue07jfSVdqRfof8kSKnl3JQLnJRoelfpW2LoiFHNtgaXGXfb56BDwFby9rN4zntWObCigam8jdof8cGMHElqYFB2eGnB4w9FW4D8uEI3JRNSF0xi1fyI_l1UQpTQ9a8NwLXn2yOqMUBldOY-B0D-9IMzXZpQLuC3rH8cEkzpk-GbI-pL9ZrL0Fg";

  async ngOnInit(){
    await this.init();
  }

public async init() {
    const callClient = new CallClient();
    const tokenCredential = new AzureCommunicationTokenCredential(this.token);
    this.callAgent = await callClient.createCallAgent(tokenCredential, { displayName: 'ACS user' });
    this.teamsMeetingJoinButtonDisabled = false;
}

public async hangUpButton(){
  await this.call.hangUp();
  this.hangUpButtonDisabled = true;
  this.teamsMeetingJoinButtonDisabled = false;
  this.callStateElement = '-';
}

public async teamsMeetingJoinButton(){
  //this.call = this.callAgent.join({ meetingLink: this.meetingLinkInput }, {});

  await this.startSound();

  this.call.on('stateChanged', () => {
    this.callStateElement = this.call.state;
  })

  this.call.feature(Features.Recording).on('isRecordingActiveChanged', () => {
      if (this.call.feature(Features.Recording).isRecordingActive) {
          this.recordingStateElement = "This call is being recorded";
      }
      else {
          this.recordingStateElement = "";
      }
  });
  this.hangUpButtonDisabled = false;
  this.teamsMeetingJoinButtonDisabled = true;
  }

  public async startSound() {
    try {
      const createBeepAudioStreamToSend = () => {
        const context = new AudioContext();
        const dest = context.createMediaStreamDestination();
        const os = context.createOscillator();
        os.type = 'sine';
        os.frequency.value = 500;
        os.connect(dest);
        os.start();
        const { stream } = dest;
        return stream;
      };

      const mediaStream = createBeepAudioStreamToSend();
      const localAudioStream = new LocalAudioStream(mediaStream);
      //const callOptions: JoinCallOptions = {
      //  audioOptions: {
      //    muted: false,
      //    localAudioStreams: [localAudioStream]
      //  }
      //};
      this.call = this.callAgent.join({ meetingLink: this.meetingLinkInput }/*, callOptions*/);
      await this.call.startAudio(localAudioStream);
      console.warn("=== started audio ===");

    } catch (error) {
      console.error('Failed to start call with WAV audio:', error);
    }
  }
}

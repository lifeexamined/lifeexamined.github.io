---
layout: post
title:  "My Experiences Getting Started with WebRTC"
date:   2020-07-30 14:54:36 -0700
categories: article
tag: blog
image: cover-photo.jpg
author: Kirill Novik
---

I want to share some of my experiences getting to know WebRTC, and try to explain why it is MUCH harder than it seems. Yet, I hope that my insights will help you to get started with your WebRTC projects.

[WebRTC](https://developer.mozilla.org/en-US/docs/Glossary/WebRTC) (Web Real-Time Communication) is an API that can be used by video-chat, voice-calling, and P2P-file-sharing Web apps.

WebRTC is not a new technology, and there have been many articles about it. (check out some links at the end!) However, the impression I got from reading those articles is that it is easy to get started with simple WebRTC real-world use case scenarios.

Just look at [this Google I/O presentation ](https://youtu.be/p2HzZkd2A40) dating back to 2013. I watched this video just a couple of days ago, and it got me really excited! Sam Dutton and Justin Uberti have done a great job at the presentation. They were able to clearly explain what this project accomplished and what challenges their team has overcome. This video, as well as many other resources, made it look like WebRTC is pretty easy to get into.

However, as I started implementing a simple client, I soon realized that it is not that easy, and here is why.

P.S. No, I’m not going to talk about NAT, STUN or TURN, but the API itself

First of all, to establish some context, I was trying to build a simple client that can send and receive connections from RTC peers whether local or remote.

I started with a [peer connection sample](https://webrtc.github.io/samples/src/content/peerconnection/pc1/) that the WebRTC team has provided. As I was examining the source, one thing was immediately apparent — a really huge mess associated with event handling. It is really hard to follow, and trace what follows what. Most importantly, it was very confusing where the most important steps of connection establishment, namely ‘offer’ and ‘answer,’ happen.

Once I got over the confusion and the steps were clear to me, and I understood how the metadata exchange happens, I went to the next step trying to learn how to use signaling to establish remote connections.

Trying to understand how to properly do signaling was also very disappointing. Mainly, because interacting with an external system is always prone to errors and is extremely hard and time-consuming to debug. To clarify: I wanted to recreate my personal signaling server, to make sure I understand the underlying logic.

Here is the path I took in order to accomplish recreate my personal signaling.

I decided to mock the WebSocket server by having a simple Pub/Sub interface to represent it. For these purposes I used RxJS. Working locally, I could have used it as an abstraction, and just swap the underlying logic behind the interface once my client was in the remote mode.

However, once I started writing the local-mode code, it got really bulky. There was a lot of interconnection between basic signaling, RTC-related messages, connection, and channel handling. It didn’t take long before it all has become one big spaghetti-like mess.

It was clear that I need to somehow separate those concerns.

After some thinking, I came to the conclusion that it would be absolutely great if the only thing my client object knew was when a new connection gets established, and I could subscribe to various media or data channel events accordingly. That’s it. This minimal representation of WebRTC could be just enough to hide all the implementation details. Of course, it doesn’t mean I didn’t need to take care of the underlying logic, and, moreover, it didn’t mean that I was going to do it declaratively via some configuration (because I am really against such approach for many reasons, especially due to the difficulties with debugging and testing).

Here is what the client class looks like:

{% highlight javascript %}  
export class Client {
  private id = generateId(4, 4);

  // Channels
  private dataChannels: { [id: string]: RTCDataChannel } = {};
  private streams: { [id: string]: MediaStream[] } = {};

  // Agents
  private BroadcastingAgent = new BroadcastingAgent(
    this.id,
    CommunicationSubject
  );
  private RTCMessagingAgent = new RTCMessagingAgent(this.BroadcastingAgent);
  private ConnectionManager = new ConnectionManager(this.RTCMessagingAgent);

  // Subjects
  private OnDataChannelMessageSubject = new Subject<[string, string]>();
  private OnDataChannelSubject = new Subject<[string, RTCDataChannel]>();
  private OnStreamSubject = new Subject<[string, MediaStream]>();

  constructor() {
    this.OnDataChannelMessageSubject.subscribe(
      this.onDataChannelMessageSubjectHandler
    );
    this.ConnectionManager.OnConnectionCreatedSubject.subscribe(
      this.onConnectionCreatedHandler
    );
    this.ConnectionManager.OnStreamSubject.subscribe(this.onStreamHandler);
    this.BroadcastingAgent.sendGreeting();
  }

  // Connection
  onConnectionCreatedHandler = (message: [string, RTCPeerConnection]) => {
    // ...
  };

  // Stream
  addStreamToConnection = (connection: RTCPeerConnection) => {
    // ...
  };

  addStream = (id: string, stream: MediaStream) => {
    // ...
  };

  onStreamHandler = (stream: MediaStream) => {
    // ...
  };

  onTrackHandler = (id: string) => (ev: RTCTrackEvent) => {
    // ...
  };

  // Data Channel
  sendDataToChannel = (id: string, message: string) => {
    // ...
  };

  onDataChannelHandler = (id: string) => (ev: RTCDataChannelEvent) => {
    // ...
  };

  onDataChannelMessageHandler = (id: string) => (ev: MessageEvent) => {
    // ...
  };

  onDataChannelMessageSubjectHandler = (message: [string, string]) => {
    // ...
  };
}
{% endhighlight %}

I split the underlying logic into three categories:

1. Broadcasting
2. RTC-Messaging
3. Connection Management

#### Broadcasting

I decided to use the simplest broadcasting, where the broadcasting agent broadcasts to every participant. This would allow us to abstract away the implementation of server-side WebSocket signaling.

Here is what the broadcasting agent class looks like:

{% highlight javascript %}
export class BroadcastingAgent {
  // Participants
  public participants: string[] = [];

  // Subjects
  public addParticipantSubject = new Subject<string>();
  public removeParticipantSubject = new Subject<string>();
  private commSubject: Subject<IMessage<unknown>>;

  constructor(
    public id: string = generateId(4, 4),
    communicationChannel: Subject<IMessage<unknown>>
  ) {
    this.commSubject = communicationChannel;

    this.getCommSubject().subscribe(this.messageHandler);
    this.getCommSubject().subscribe(this.greetingHandler);
  }

  // Messaging Utils

  getCommSubject = () =>
    this.commSubject.pipe(filter(({ id: _id }) => _id !== this.id));

  getIndividualMessageCommSubject = () =>
    this.getCommSubject().pipe(filter(({ to }) => to === this.id));

  messageHandler = (message: IMessage<unknown>) => {
    console.warn(message);
  };

  sendIndividualRequest = <T>(data: T, to: string) => {
    this.commSubject.next({
      id: this.id,
      type: "individual",
      data,
      to,
    });
  };

  // Participants

  addParticipant = (id: string) => {
    this.participants.push(id);
    this.addParticipantSubject.next(id);
  };

  removeParticipant = (id: string) => {
    let participants = this.getParticipants();
    participants = participants.filter((_id) => _id !== id);
    this.removeParticipantSubject.next(id);
  };

  getParticipants = () => {
    const participants = [...this.participants];
    return participants;
  };

  // Salutations

  greetingHandler = (message: IMessage<unknown>) => {
    const { id, type } = message;
    const participants = this.getParticipants();
    if (type !== "greeting") return;
    if (participants.includes(id)) return;
    console.warn(`ID: ${this.id}, Add Participant`);
    this.addParticipant(id);
    setTimeout(this.sendGreeting, 100);
  };

  farewellHandler = (message: IMessage<unknown>) => {
    const { id, type } = message;
    const participants = this.getParticipants();
    if (type !== "farewell") return;
    if (participants.includes(id)) return;
    this.removeParticipant(id);
  };

  sendGreeting = () => {
    this.commSubject.next({
      id: this.id,
      type: "greeting",
      data: {},
    });
  };

  sendFarewell = () => {
    this.commSubject.next({
      id: this.id,
      type: "farewell",
      data: {},
    });
  };
}
{% endhighlight %}

One thing to note, however, is that I decided to delay the greeting by an arbitrary 100 ms, so that the receivers of a new greeting could send an offer to connect. Otherwise, if two parties send offers connection would fail to establish.

#### RTC Messaging

This layer is responsible for sending the RTC connection negotiation messages.

The reason it is separate from broadcasting is that it sends very specific messages that the broadcaster doesn’t have to know anything about.

Here is what the RTC Messaging Agent Class looks like:

{% highlight javascript %}
export class RTCMessagingAgent {
  
  // Subjects
  public OnAddParticipantSubject = new Subject<string>();
  public OnRemoveParticipantSubject = new Subject<string>();
  public OnSetLocalDescription = new Subject<
    [string, RTCSessionDescriptionInit]
  >();
  public OnSetRemoteDescription = new Subject<
    [string, RTCSessionDescriptionInit]
  >();
  public OnAddCandidateSubject = new Subject<[string, RTCIceCandidate]>();

  constructor(public broadcastingAgent: BroadcastingAgent) {
    this.broadcastingAgent.addParticipantSubject.subscribe(
      this.onAddParticipantHandler
    );
    this.broadcastingAgent.removeParticipantSubject.subscribe(
      this.onRemoveParticipantHandler
    );
    this.getOfferSubject().subscribe(this.onOfferHandler);
    this.getAnswerSubject().subscribe(this.onAnswerHandler);
    this.getCandidateSubject().subscribe(this.onCandidateHandler);
  }

  // Add/Remove Participants
  onAddParticipantHandler = (id: string) => {
    this.OnAddParticipantSubject.next(id);
  };

  onRemoveParticipantHandler = (id: string) => {
    this.OnRemoveParticipantSubject.next(id);
  };

  // Offer
  getOfferSubject = () => {
    return (
      this.broadcastingAgent
        .getIndividualMessageCommSubject()
        // @ts-ignore
        .pipe(filter(({ data }) => data.type === "offer")) as Subject<
        IMessage<unknown>
      >
    );
  };

  onOfferCreatedHandler = (id: string) => (
    sessionDescription: RTCSessionDescriptionInit
  ) => {
    console.warn(
      `Offer for ${id} Created in ${this.broadcastingAgent.id}`,
      sessionDescription
    );
    this.OnSetLocalDescription.next([id, sessionDescription]);
    console.log("setLocalAndSendMessage sending message", sessionDescription);
    this.broadcastingAgent.sendIndividualRequest(sessionDescription, id);
  };

  onOfferHandler = (message: IMessage<unknown>) => {
    const { id, data } = message;
    this.OnSetRemoteDescription.next([id, data as RTCSessionDescriptionInit]);
  };

  // Answer
  getAnswerSubject = () => {
    return (
      this.broadcastingAgent
        .getIndividualMessageCommSubject()
        // @ts-ignore
        .pipe(filter(({ data }) => data.type === "answer")) as Subject<
        IMessage<unknown>
      >
    );
  };

  onAnswerCreatedHandler = (id: string) => (
    sessionDescription: RTCSessionDescriptionInit
  ) => {
    console.warn(
      `Answer for ${id} Created in ${this.broadcastingAgent.id}`,
      sessionDescription
    );
    this.OnSetLocalDescription.next([id, sessionDescription]);
    console.log("setLocalAndSendMessage sending message", sessionDescription);
    this.broadcastingAgent.sendIndividualRequest(sessionDescription, id);
  };

  onAnswerHandler = (message: IMessage<unknown>) => {
    const { id, data } = message;
    this.OnSetRemoteDescription.next([id, data as RTCSessionDescriptionInit]);
  };

  // Candidate
  getCandidateSubject = () => {
    return (
      this.broadcastingAgent
        .getIndividualMessageCommSubject()
        // @ts-ignore
        .pipe(filter(({ data }) => data.type === "candidate")) as Subject<
        IMessage<unknown>
      >
    );
  };

  onCandidateHandler = (message: IMessage<unknown>) => {
    const { id, data } = message;
    var candidate = new RTCIceCandidate({
      // @ts-ignore
      sdpMLineIndex: data.label,
      // @ts-ignore
      candidate: data.candidate,
    });
    this.OnAddCandidateSubject.next([id, candidate]);
  };

  handleIceCandidate = (id: string) => (event: RTCPeerConnectionIceEvent) => {
    console.log("icecandidate event: ", event);
    if (event.candidate) {
      this.broadcastingAgent.sendIndividualRequest(
        {
          type: "candidate",
          label: event.candidate.sdpMLineIndex,
          id: event.candidate.sdpMid,
          candidate: event.candidate.candidate,
        },
        id
      );
    } else {
      console.log("End of candidates.");
    }
  };

  onCandidateCreatedHandler = (id: string) => (candidate: RTCIceCandidate) => {
    this.broadcastingAgent.sendIndividualRequest(
      {
        type: "candidate",
        label: candidate.sdpMLineIndex,
        id: candidate.sdpMid,
        candidate: candidate.candidate,
      },
      id
    );
  };
}
{% endhighlight %}

#### Connection Management

Connection management is another layer that is responsible for creating connections, as well as offers, answers, and setting up connection. The reason it is separate from the RTC Messaging is that the connection doesn’t need to know about the means of how the meta-data gets transported as long as connection receives remote and local session description.

One thing to note here is that when participant is added, I have to make sure that there is no connection already. This is because when a participant enters and greets everybody, the other clients send offers to them. This means that this client receives creates an answer to them, and thus creates a connection for each of the greeters.

Here is what the Connection Management Class looks like:

{% highlight javascript %}
import { Subject } from "rxjs";
import { RTCMessagingAgent } from "./rtc-messaging-agent";

const configuration = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302",
        "stun:stun01.sipphone.com",
        "stun:stun.ekiga.net",
        "stun:stun.fwdnet.net",
        "stun:stun.ideasip.com",
        "stun:stun.iptel.org",
        "stun:stun.rixtelecom.se",
        "stun:stun.schlund.de",
        "stun:stunserver.org",
        "stun:stun.softjoys.com",
        "stun:stun.voiparound.com",
        "stun:stun.voipbuster.com",
        "stun:stun.voipstunt.com",
        "stun:stun.voxgratia.org",
        "stun:stun.xten.com",
      ],
    },
  ],
};

export class ConnectionManager {
  // Connections
  private connections: { [id: string]: RTCPeerConnection } = {};

  // Subjects
  public OnDataChannelSubject = new Subject<RTCDataChannel>();
  public OnConnectionCreatedSubject = new Subject<
    [string, RTCPeerConnection]
  >();

  constructor(private ma: RTCMessagingAgent) {
    this.ma.OnAddParticipantSubject.subscribe(this.onAddParticipantHandler);
    this.ma.OnRemoveParticipantSubject.subscribe(
      this.onRemoveParticipantHandler
    );
    // this.ma.OnCreateAnswerSubject.subscribe(this.onCreateAnswerHandler);
    this.ma.OnSetLocalDescription.subscribe(this.onSetLocalDescriptionHandler);
    this.ma.OnSetRemoteDescription.subscribe(
      this.onSetRemoteDescriptionHandler
    );
    this.ma.OnAddCandidateSubject.subscribe(this.onAddCandidateHandler);
  }

  createConnection = (id: string) => {
    const _id = this.ma.broadcastingAgent.id;
    console.warn(
      `ID: ${id}, Create Connection in ${this.ma.broadcastingAgent.id}`
    );
    const connection = new RTCPeerConnection(configuration);
    this.connections[id] = connection;
    connection.onicecandidate = this.onICECandidateHandler(id);
    this.OnConnectionCreatedSubject.next([id, connection]);
    return connection;
  };

  // Add/Remove Participants
  onAddParticipantHandler = (id: string) => {
    console.warn(`${this.ma.broadcastingAgent.id} On Add Participant Handler`);
    const oldConnection = this.connections[id];
    if (oldConnection) return;
    const connection = this.createConnection(id);
    connection
      .createOffer()
      .then(this.ma.onOfferCreatedHandler(id))
      .catch((e) => {
        console.warn(`Couldn't create offer for id ${id}`, e);
      });
  };

  onRemoveParticipantHandler = (id: string) => {
    delete this.connections[id];
  };

  // Session Description
  onSetLocalDescriptionHandler = (
    message: [string, RTCSessionDescriptionInit]
  ) => {
    const [id, sessionDescription] = message;
    const connection = this.connections[id];
    if (!connection) return;
    connection.setLocalDescription(sessionDescription);
  };

  onSetRemoteDescriptionHandler = (
    message: [string, RTCSessionDescriptionInit]
  ) => {
    const [id, sessionDescription] = message;
    console.warn(
      `Setting remote description in ${this.ma.broadcastingAgent.id} for ${id}`
    );
    const connection = this.connections[id];
    if (!connection) {
      // Answer
      this.onCreateAnswerHandler(id, sessionDescription);
    } else {
      // Offer
      connection.setRemoteDescription(sessionDescription);
    }
  };

  // Connection Logistics
  onICECandidateHandler = (id: string) => (ev: RTCPeerConnectionIceEvent) => {
    console.warn(`ID: ${id}, On ICE Candidate Handler`);
    const candidate = ev.candidate;
    if (!candidate) return;
    this.ma.onCandidateCreatedHandler(id)(candidate);
  };

  onCreateAnswerHandler = (
    id: string,
    sessionDescription: RTCSessionDescriptionInit
  ) => {
    const connection = this.createConnection(id);
    connection.setRemoteDescription(sessionDescription);
    connection
      .createAnswer()
      .then(this.ma.onAnswerCreatedHandler(id))
      .catch((e) => {
        console.warn(`Couldn't create answer in ID ${id}`, e);
      });
  };

  onAddCandidateHandler = (message: [string, RTCIceCandidate]) => {
    const [id, candidate] = message;
    const connection = this.connections[id];
    if (!connection) return;
    connection.addIceCandidate(candidate);
  };
}
{% endhighlight %}

#### Conclusion

This separation of concerns allowed me to wrap my head around WebRTC, and make sure that I can correctly negotiate connections between end-points.

Unfortunately, this took way more time than I expected it to, and I didn’t even get to the NAT and other things.

My conclusion on why this API is harder to wrap your head around than I expected is that it requires you to know quite a bit about the communication between two end-points. All I really mean is that despite its seeming minimalism,RTCPeerConnection is just the tip of the iceberg (no pun intended) not providing enough abstraction about the underlying logic.

I hope that you found this article helpful, and maybe even agree with some of my arguments.

#### Frameworks:

There are some wrappers that abstract the underlying implementation pretty well.

https://peerjs.com

https://stackoverflow.com/questions/24857637/current-state-of-javascript-webrtc-libraries

#### Articles:

https://www.html5rocks.com/en/tutorials/webrtc/basics/

https://medium.com/hackernoon/the-fifteen-minute-webrtc-demo-3f5cf3a71fc4
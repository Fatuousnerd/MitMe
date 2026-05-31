# MITME - VIDEO CONFERENCE SDK
Open Source WebRTC SDK

![Zod](https://img.shields.io/badge/-Zod-000?&logo=Zod)
![Bun](https://img.shields.io/badge/-Bun-000?&logo=Bun)
![Typescript](https://img.shields.io/badge/-Typescript-000?&logo=Typescript)
![PeerJS](https://img.shields.io/badge/-PeerJS-000?&logo=PeerJS)

> IMPORTANT: This SDK is currently in BETA stage. It may contain bugs, have limited features, and is not yet production ready. We are actively working on improvements and new features.

> Currently, there's no documentation nor a playground. These will be provided in the next update tho.

## DESCRIPTION
MitMe is a lightweight, open source video conferencing SDK for web applications. It uses WebRTC technology through PeerJS to enable real-time video and audio calls directly in the browser.

The SDK runs entirely client-side on user devices. It is designed for easy integration into websites and web apps that need video chat functionality.


## CONNECTION TOPOLOGY WARNING
This version uses a Mesh connection model. Every participant connects directly to all other participants. 
This works well for small groups (2-6 people maximum) but can cause high bandwidth usage, CPU overload, and connection issues with larger groups. 

We plan to add `SFU` (Selective Forwarding Unit) support in future versions for better scalability.

## KEY FEATURES
- Simple API for video conferencing
- Peer-to-peer connections via PeerJS and WebRTC
- Real-time video and audio streaming
- Screen sharing support
- Text chat during calls
- Customizable UI components
- Works on desktop and mobile browsers
- No server media processing (pure P2P)

## REQUIREMENTS
- Modern browser with WebRTC support(Any current browser will support this)

## INSTALLATION
``bash
npm i @fatuousnerd/mitme
```

## CURRENT LIMITATIONS (BETA)
- Mesh networking only (limited to small groups)
- No recording feature yet
- Limited error handling and reconnection logic
- No advanced moderation tools
- No native mobile app support (browser only)

We are working on fixing these issues and adding more features.

## PRIVACY
All media streams are peer-to-peer. No video or audio data passes through our servers. Only signaling goes through PeerJS.

## SUPPORT THIS PROJECT
This is a free and open source project. Contributions are highly welcome.

Work is ongoing to improve stability and add SFU support.

## LICENSE
This project is licensed under the MIT License. You are free to use and modify it.

## GITHUB REPOSITORY
https://github.com/Fatuousnerd/MitMe

## THANK YOU
Thank you for trying MitMe. 
We appreciate your feedback as we continue to improve it.
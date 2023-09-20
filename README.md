# Node-Express Video Transcoder API

A simple node-express API that lets you transcode videos and generate corresponding`.hls` and `.ts` files.

### [Medium Article](https://medium.com/javascript-in-plain-english/building-a-simple-video-transcoding-service-with-node-and-ffmpeg-271b2e73d5e0)

### Future updates will allow users to

- `upload` videos to the server
- `download` the transcoded result
- upload the transcoded files to `AWS S3`
- access the video through `AWS Cloudfront CDN`

## 👨🏻‍💻 Getting Stated

- run `npm i` to install all project dependencies.
- run `npm run dev` to start the dev server.
- **v1.0.0**: ~~add video(s) in `'./src/videos/raw` folder. For ease, there is already a video and its transcoded files added in `./src/videos` folder. All you need to do is open the `./index.html` file.~~

## 📦 Begin Transcoding

### Version 2.0.0

- Once you have the project running on localhost, upload a new video file using the `POST /transcode/new` endpoint.
- Once the video gets uploaded, transcoding starts immediately and just like in v1.0.0, generated output is stored in the `./src/videos/transcoded` folder.
- Once transcoding is completed, the uploaded file is removed from the local `fs`.

### Version 1.0.0

- copy the complete video name, including the file extension, of the file that you want to transcode, say `my-video.mp4`.
- for `v1.0.0`, you can either use your browser or terminal to send a `GET` request to `htp://localhost:4000/transcode/new/my-video.mp4`

## 📺 Consuming the `.hls` file and video chunks

- in the `./index.html` file, change the `src` value for the `<video></video>` element to point to the `.hls` file for your video.
- open the `.html` file and the network tab (in the dev tools), side by side.
- you will be able to see multiple requests being sent for `.ts` files, which is nothing but the browser requesting for more chunks as the video keeps playing.
- stop playback and no more chunks will be fetched.
- skip to a new video position and a new chunk will be fetched.
- jump back to a point in video which has already played and you'll see that the chunk was loaded immediately from `disk cache`.

## ❗️Important

> Please read CHANGELOG.md and check the version number in package.json to make sure you're following the right steps to get stuff done.

> Transcoder runs on port 4000 by default. If you wish to change this, you can either add a .env file at the root level, or directly change the port number in './src/index.ts

> time taken for transcoding to complete will depend upon the file size of the video being used.

> Video in the `./src/videos/raw` folder has been downloaded from YouTube for the purpose of this project and not for re-distribution or anything.

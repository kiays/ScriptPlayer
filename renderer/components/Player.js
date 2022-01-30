import React, { useState, useRef, useEffect } from "react"
import update from "immutability-helper";
import { ipcRenderer } from "electron";

const formatTime = (time) => {
    return `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, "0")}`
}
const Player = ({ playlist }) => {
    const [playing, setPlaying] = useState(false);
    const [audioSrc, setTrack] = useState(null);
    const [trackIndex, setTrackIndex] = useState(0);
    const [playerInfo, setPlayerInfo] = useState({ duration: 0, currentTime: 0, title: "" });
    const audioRef = useRef(null);
    const values = playlist.tracks.length > 0 && playlist.tracks[trackIndex].csvContent ? playlist.tracks[trackIndex].csvContent : [];
    useEffect(() => {
        const audioElem = audioRef.current;
        if (!audioElem) {
            return;
        }
        if (playlist.tracks.length <= trackIndex) {
            return;
        }
        const curretTrackUrl = playlist.tracks[trackIndex].url
        if (audioSrc != curretTrackUrl) {
            console.log("update track",playlist.tracks[trackIndex] )
            audioElem.src = curretTrackUrl
            setTrack(curretTrackUrl)
            setPlayerInfo({
                title: playlist.tracks[trackIndex].title,
                duration: audioElem.duration,
                currentTime: 0,
            })
        }
        if (playing) {
            audioElem.play();
        } else {
            audioElem.pause();
        }

    }, [audioRef, trackIndex, playing])
    const togglePlay = () => {
        setPlaying(!playing);
    }
    const seek = (e) => {
        const audioElem = audioRef.current;
        if (audioElem) {
            setPlayerInfo(info => update(info, { currentTime: { $set: e.target.value } }));
            audioElem.currentTime = e.target.value
        }
    }
    const timeUpdated = (e) => {
        const audioElem = audioRef.current;
        if (audioElem) {
            setPlayerInfo(info => update(info, { currentTime: { $set: audioElem.currentTime } }));
            if (values.length == 0) return;
            let lastVal = null
            for (let i = 0; i < values.length;i++){
                if (values[i][0] < audioElem.currentTime) {
                    lastVal = values[i]
                } else {
                    break
                }
            }
            if (lastVal) {
            ipcRenderer.invoke("send-to-device", [0x02, 0x00, lastVal[2] + (lastVal[1] ? 128 : 0)]);
            }
        }
     
    }
    const durationChanged = (e) => {
        const audioElem = audioRef.current;
        if (audioElem) {
            setPlayerInfo(info => update(info, { duration: { $set: audioElem.duration } }));
        }
    }
    const playEnded = () => {
        if (trackIndex < playlist.tracks.length - 1) {
            setTrackIndex(i => i + 1)
        } else {
            setPlaying(false);
            setTrackIndex(0);
        }
    }
    const next = () => {
        if (trackIndex < playlist.tracks.length - 1) {
            setTrackIndex(trackIndex + 1)
        }
    }
    const prev = () =>{
        if(trackIndex > 0) {
            setTrackIndex(trackIndex - 1);
        }
    }

    return (<div>
        <button onClick={togglePlay}>{playing ? "pause" : "play"}</button>
        <button onClick={prev}>prev</button>
        <button onClick={next}>next</button>
        <button onClick={ () => ipcRenderer.invoke("send-to-device",[2,0,100])}>test device</button>
        <button onClick={ () => ipcRenderer.invoke("send-to-device",[2,0,0])}>stop device</button>
        <div>{formatTime(playerInfo.currentTime)} / {formatTime(playerInfo.duration)}</div>
        <input type="range" value={playerInfo.currentTime} max={playerInfo.duration} min={0} step={0.01} onChange={seek}></input>
        <div>{playerInfo.title}</div>
        <audio ref={audioRef}
            onTimeUpdate={timeUpdated}
            onDurationChange={durationChanged}
            onEnded={playEnded}
        />
    </div>)
}

export default Player;
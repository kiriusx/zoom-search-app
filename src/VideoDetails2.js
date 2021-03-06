
import DashMenu from './DashMenu.js'
import ReactPlayer from 'react-player';
import React, { Component } from "react";
import "./App.css";
import Fuse from "fuse.js";

import {
    fetchVideo,
    favoriteVideo,
    fetchTranscript,
    fetchChat,
} from "./Fetches.js";

export default class VideoDetails extends Component {

    state = {
        loading: false,
        video: [],
        search: "",
        transcript: [],
        chats: [],
        timeStamp: 1,
        fuzzy: [],
    };

    ref = player => {
        this.player = player
    }


    componentDidMount = async () => {
        await this.setState({ loading: true });

        const video = await fetchVideo(
            this.props.match.params.id,
            this.props.token
        );

        await this.player.seekTo(this.state.timeStamp);

        const transcript = await fetchTranscript(
            this.props.match.params.id,
            this.props.token
        );

        const chats = await fetchChat(this.props.match.params.id, this.props.token);

        this.setState({
            video: video,
            transcript: transcript,
            chats: chats,
            loading: false,
        });


        await bookmarkVideo(newBookmark, this.props.token);
    };
};

handleFavorite = async (e) => {
    const newFavorite = {
        uuid: this.state.video.uuid,
        topic: this.state.video.topic,
        start_time: this.state.video.start_time,
        timestamp: "this.state.video.timestamp",
        text: "",
        owner_id: this.state.video.owner_id,
    };
    console.log(newFavorite);

    await favoriteVideo(newFavorite, this.props.token);
};

handleBookmark = async (identifier, text, time_start, speaker, id) => {
    const newBookmark = {
        id: id,
        uuid: this.state.video.uuid,

        topic: this.state.video.topic,
        host_id: this.state.video.host_id,
        start_time: this.state.video.start_time,
        time_start: time_start,
        speaker: speaker,
        identifier: identifier,
        text: text,
        owner_id: this.state.video.owner_id,
    };


    handleTimeStamp = async (e) => {
        const newTime = Math.floor(e.target.className);
        // console.log(newTime)
        await this.player.seekTo(newTime);
        this.setState({
            timeStamp: newTime
        })

    }

    handleSearch = (e) => {
        e.preventDefault();

        const { transcript, search } = this.state;

        const options = {
            includeScore: true,
            shouldSort: true,
            ignoreLocation: true,
            threshold: 0.2,
            keys: ["text"],
        };

        const fuse = new Fuse(transcript, options);
        const fuzzysearch = fuse.search(search);
        console.log("fuzzysearch: ", fuzzysearch);

        this.setState({
            fuzzy: fuzzysearch,
        });

        console.log("search: ", search);
    };

    render() {
        const { transcript, chats, video, loading, fuzzy, timeStamp } = this.state;
        return (
            <div className="video-details">
                <div className="left-nav">
                    <DashMenu />
                </div>

                {loading ? (
                    <img src={"/loading-spinner.gif"} alt={""} className="spinner" />
                ) : (
                        <div>
                            <h3 className="video-header">{video.topic}</h3>
                            <div className="detail-search">
                                <form onSubmit={this.handleSearch}>
                                    <input
                                        onChange={(e) => this.setState({ search: e.target.value })}
                                        type="text"
                                        className="detail-searchbar"
                                    />
                                    <button className="detail-search-button">Search</button>
                                </form>
                            </div>
                            <div className="video-detail">
                                <div className="video">
                                    <div>
                                        <ReactPlayer
                                            ref={this.ref}
                                            url={this.state.video.video_play_url}
                                            controls
                                        />
                                    </div>
                                    <div className="chat">
                                        {chats.map((chat) => (
                                            <div>
                                                {chat.timestamp} {chat.speaker} {chat.text}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="buttons">
                                    <button
                                        onClick={this.handleFavorite}
                                        className="favorite-button"
                                    >
                                        Favorite
                </button>
                                    <button className="bookmarks">Bookmark Timestamp</button>
                                </div>

                                <div className="transcript">
                                    {transcript.map((trans) => {
                                        if (fuzzy.length > 0) {
                                            return fuzzy?.map((match) => {
                                                if (match.item.text === trans.text) {
                                                    return (
                                                        <div
                                                            onClick={this.handleTimeStamp}
                                                            className={`${trans.time_start} highlight-me`}
                                                            key={`${trans.time_start}${trans.id}`}
                                                        >
                                                            ({trans.time_start}) {trans.text}
                                                        </div>
                                                    );
                                                } else {
                                                    return (
                                                        <div
                                                            onClick={this.handleTimeStamp}
                                                            className={trans.time_start}
                                                            key={trans.time_start}
                                                        >
                                                            {/* ({trans.time_start}) {trans.text} */}
                                                        </div>
                                                    );
                                                }
                                            });
                                        }
                                        return (
                                            <div
                                                onClick={this.handleTimeStamp}
                                                className={trans.time_start}
                                                key={trans.time_start}
                                            >
                                                ({trans.time_start}) {trans.text}
                                            </div>
                                        );
                                    })}
                                </div>

                            </div>
                        </div>
                    )}
            </div>
        );
    }
}

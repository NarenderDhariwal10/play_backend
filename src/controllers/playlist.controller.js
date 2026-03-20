import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(!name || ! description){
        throw new ApiError(400,"Name and Description are required for playlist")
    }

    const playlist = await Playlist.create({
        name: name,
        description: description,
        owner: req.user?._id
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"Playlist created successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid userId")
    }
    
    
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist Id")
    }

    const playlist = await Playlist.findById(playlistId);

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"Playlist fetched")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist Id")
    }

    const playlist = await Playlist.findOneAndDelete({
            _id: plaulistId,
            owner: req.user?._id  
    });
    
    if (!playlist) {
        throw new ApiError(404, "Playlist not found or unauthorized");
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Playlist deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist Id")
    }

    if(!name || !description){
        throw new ApiError(400,"Name and description are required")
    }

    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user?._id 
        },
        {
            $set: { name,description }
        },
        {
            new: true
        }
    )
    
    if (!playlist) {
        throw new ApiError(404, "Playlist not found or unauthorized");
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"Playlist updated successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
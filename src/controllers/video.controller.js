import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    
    if(!title || !description) {
        throw new ApiError(400, "Title and description are required")
    }

    const videoLocalPath = req.files?.videofile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video file and thumbnail are required");
    }

    const videoFile  = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoFile || !thumbnail) {
        throw new ApiError(500, "Failed to upload video or thumbnail to Cloudinary");
    }

    const video = await Video.create({
        title,
        description,
        videofile: videoFile.url,
        thumbnail: thumbnail.url,
        owner: req.user?._id,
        duration: videoFile.duration
    })

    return res.status(201).json(
        new ApiResponse(201, video, "Video published successfully")
    )
})

export { publishAVideo }
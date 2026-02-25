import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    const pageNumber = Number(page)
    const limitNumber = Number(limit)

    
    const filter = {
        isPublished: true
    }

    // search by title or description
    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]
    }

    // filter by user
    if (userId && isValidObjectId(userId)) {
        filter.owner = userId
    }

    const sortOptions = {
        [sortBy]: sortType === "asc" ? 1 : -1
    }

    const videos = await Video.find(filter)
        .sort(sortOptions)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .populate("owner", "username avatar")

    const totalVideos = await Video.countDocuments(filter)

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos,
                pagination: {
                    total: totalVideos,
                    page: pageNumber,
                    limit: limitNumber,
                    totalPages: Math.ceil(totalVideos / limitNumber)
                }
            },
            "Videos fetched successfully"
        )
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    
    if(!title || !description) {
        throw new ApiError(400, "Title and description are required")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video file and thumbnail are required");
    }

    const videofile  = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videofile || !thumbnail) {
        throw new ApiError(500, "Failed to upload video or thumbnail to Cloudinary");
    }

    const video = await Video.create({
        title,
        description,
        videofile: videofile.url,
        thumbnail: thumbnail.url,
        owner: req.user?._id,
        duration: videofile.duration
    })

    return res.status(201).json(
        new ApiResponse(201, video, "Video published successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId).populate("owner", "name email")

    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video retrieved successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    
        if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    if(!title && !description) {
        throw new ApiError(400, "At least one field (title or description) is required to update")
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if(title) video?.title = title;
    if(description) video?.description = description;

    if(req.file?.path){
        const thumbnailLocalPath = req.file.thumbnail[0].path;
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        video.thumbnail = thumbnail.url;
    }
    
    await video.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Video updated Successfully")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this video")
    }

    // Optional: delete from Cloudinary
    // await deleteFromCloudinary(video.videofile)
    // await deleteFromCloudinary(video.thumbnail)

    await video.deleteOne()

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this video")
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            { isPublished: video.isPublished },
            `Video ${video.isPublished ? "published" : "unpublished"} successfully`
        )
    )
})

export { publishAVideo , getVideoById , updateVideo , deleteVideo , togglePublishStatus , getAllVideos}
import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const comments = await Comment.find({ video: videoId })
        .populate("owner", "username avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber);

    const totalComments = await Comment.countDocuments({ video: videoId });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                comments,
                pagination: {
                    totalComments,
                    currentPage: pageNumber,
                    totalPages: Math.ceil(totalComments / limitNumber),
                    limit: limitNumber,
                },
            },
            "Comments fetched successfully"
        )
    )
})

const addComment = asyncHandler(async (req, res) => {
    
    const{videoId} = req.params;
    const {content} = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID for comment")
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content for comment is required");
    }

    const comment = await Comment.create({
        content,
        video : videoId,
        owner : req.user?._id
    })

    return res
    .status(201)
    .json(
        new ApiResponse(201,comment,"Comment successfully added")
    )

})

const updateComment = asyncHandler(async (req, res) => {
    
    const {commentId} = req.params;
    const {content} = req.body;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content for comment is required");
    }

    const comment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: req.user?._id 
        },
        {
            $set: { content }
        },
        {
            new: true
        }
    )

    if (!comment) {
        throw new ApiError(404, "Comment not found or unauthorized");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,comment,"Comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    
    const {commentId} = req.params;

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }

    const comment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user?._id  
    });
    
    if (!comment) {
        throw new ApiError(404, "Comment not found or unauthorized");
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Comment deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
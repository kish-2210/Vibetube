
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import mongoose,{Schema} from "mongoose";

const videoSchema = new Schema(
    {
        videoFile:{
            type: String, //cloudinary url
            require:true
        },

        thumbnail:{
            type: String,
            require:true
        },

        title:{
            type: String,
            require:true
        },

        description:{
            type: String,
            require:true
        },

        duration:{
            type:Number,    //cloudinary return info about video
            required:true
        },

        views:{
            type: Number,
            default:0
        },

        isPublished:{
            type: Boolean,
            default: true
        },

        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }


    },
    {
        timestamps:true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoSchema)
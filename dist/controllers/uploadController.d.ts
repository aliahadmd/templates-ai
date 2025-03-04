export declare const uploadMiddleware: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
declare global {
    namespace Express {
        interface Request {
            file?: Express.Multer.File;
        }
    }
}
/**
 * @desc    Generate a presigned URL for direct uploads
 * @route   POST /api/uploads/presigned
 * @access  Private
 */
export declare const getPresignedUrl: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * @desc    Proxy upload to R2 to avoid CORS issues
 * @route   POST /api/uploads/proxy
 * @access  Private
 */
export declare const proxyUpload: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * @desc    Delete a file from R2
 * @route   DELETE /api/uploads/:key
 * @access  Private
 */
export declare const deleteFile: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
declare const _default: {
    getPresignedUrl: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    proxyUpload: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    deleteFile: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
};
export default _default;

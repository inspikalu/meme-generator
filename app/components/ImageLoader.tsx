import React from 'react'

const ImageLoader = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
            <div className="w-16 h-16 border-t-4 border-blue-500 rounded-full animate-spin"></div>
        </div>
    )
}

export default ImageLoader

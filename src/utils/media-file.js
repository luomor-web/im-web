import {IMAGE_TYPES, VIDEO_TYPES, AUDIO_TYPES, APPLICATION_TYPES, PACKAGE_TYPES} from './constants'

function checkMediaType(types, file) {
    if (!file ) return
    return types.some(t => file.toLowerCase().includes(t))
}

export function isImageFile(file) {
    return checkMediaType(IMAGE_TYPES, file)
}

export function isVideoFile(file) {
    return checkMediaType(VIDEO_TYPES, file)
}

export function isImageVideoFile(file) {
    return checkMediaType(IMAGE_TYPES, file) || checkMediaType(VIDEO_TYPES, file)
}

export function isAudioFile(file) {
    return checkMediaType(AUDIO_TYPES, file)
}

export function isApplicationFile(file) {
    return checkMediaType(APPLICATION_TYPES, file)
}

export function isPackageFile(file) {
    return checkMediaType(PACKAGE_TYPES, file)
}

export function suffix(file) {
    if(!file) return ''
    return file.substring(file.lastIndexOf('.') + 1)
}

export function prefix(file) {
    if(!file) return
    return file.substring(0,file.lastIndexOf('.'))
}

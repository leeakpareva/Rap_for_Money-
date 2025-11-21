import crypto from 'crypto';

export const generateRoomId = (): string => {
  return crypto.randomBytes(8).toString('hex');
};

export const isVideoFile = (mimetype: string): boolean => {
  return mimetype.startsWith('video/');
};

export const isImageFile = (mimetype: string): boolean => {
  return mimetype.startsWith('image/');
};
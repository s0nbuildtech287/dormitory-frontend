/**
 * Image assets and URLs
 */
export const IMAGES = {
  // User avatars
  AVATAR_ADMIN: 'https://ui-avatars.com/api/?name=Admin&background=1e40af&color=fff',
  AVATAR_STUDENT: 'https://ui-avatars.com/api/?name=Student&background=10b981&color=fff',

  // Room images
  ROOM_DORM_1: 'https://images.unsplash.com/photo-1630099305815-d6e5e8ac1c8f?w=400&h=300&fit=crop',
  ROOM_DORM_2: 'https://images.unsplash.com/photo-1631679706909-1844bbd07b3d?w=400&h=300&fit=crop',
  ROOM_DORM_3: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',

  // Document images
  DOC_PLACEHOLDER: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=300&fit=crop',
  EVIDENCE_1: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop',
  EVIDENCE_2: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=300&fit=crop',

  // Building banners
  BUILDING_BANNER: 'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=1200&h=400&fit=crop',

  // Status indicators
  STATUS_PENDING: 'https://images.unsplash.com/photo-1551431009-381d36ac3126?w=400&h=300&fit=crop',
  STATUS_APPROVED: 'https://images.unsplash.com/photo-1533707042d7a2e38 ?w=400&h=300&fit=crop',
  STATUS_REJECTED: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b3?w=400&h=300&fit=crop',
};

/**
 * Get avatar URL with name
 * @param {string} name - User name
 * @param {string} role - User role (ADMIN or STUDENT)
 * @returns {string} Avatar URL
 */
export const getAvatarUrl = (name, role = 'STUDENT') => {
  const bgColor = role === 'ADMIN' ? '1e40af' : '10b981';
  return `https://ui-avatars.com/api/?name=${name}&background=${bgColor}&color=fff`;
};

/**
 * Get fallback image for a type
 * @param {string} type - Image type
 * @returns {string} Image URL
 */
export const getFallbackImage = (type = 'room') => {
  const fallbacks = {
    room: IMAGES.ROOM_DORM_1,
    document: IMAGES.DOC_PLACEHOLDER,
    banner: IMAGES.BUILDING_BANNER,
    avatar: 'https://ui-avatars.com/api/?name=User&background=1e293b&color=fff',
  };
  return fallbacks[type] || fallbacks.document;
};

export default IMAGES;
